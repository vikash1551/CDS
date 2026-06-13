from flask import Blueprint, request, jsonify
from extensions import mongo, socketio
import uuid
import datetime
import threading
import time as _time

lending_bp = Blueprint('lending_bp', __name__)

# ─── Lending timeline stages ────────────────────────────────────
LEND_STAGES = [
    {"stage": "requested", "label": "Request placed securely"},
    {"stage": "matched", "label": "AI found the best peer nearby"},
    {"stage": "accepted", "label": "Lender confirmed the request"},
    {"stage": "on_the_way", "label": "Lender heading to meetup point"},
    {"stage": "handed_over", "label": "Item handed over via OTP"},
    {"stage": "return_pending", "label": "Return reminder active"},
    {"stage": "returned", "label": "Item returned — rewards earned!"},
]


@lending_bp.route('/create-listing', methods=['POST'])
def create_listing():
    """Create a new marketplace listing (Lend or Need)."""
    data = request.json
    
    item = {
        "id": data.get('id', f"l{int(datetime.datetime.utcnow().timestamp() * 1000)}"),
        "title": data.get('title', ''),
        "by": data.get('by', 'You'),
        "avatar": data.get('avatar', '🧑‍🎓'),
        "rating": data.get('rating', 5.0),
        "distance": data.get('distance', 'Campus'),
        "pricePerHr": data.get('pricePerHr', 15),
        "emoji": data.get('emoji', '📦'),
        "bg": data.get('bg', 'oklch(0.93 0.08 200)'),
        "tag": data.get('tag', 'Lend'),
        "posted": data.get('posted', 'Just now'),
        "status": data.get('status', 'online'),
        "created_at": datetime.datetime.utcnow()
    }
    
    mongo.db.marketplace.insert_one(item)
    item['_id'] = str(item['_id'])
    item['created_at'] = item['created_at'].isoformat()
    
    # Broadcast new listing
    socketio.emit('new_listing', {"item": item})
    
    return jsonify({"message": "Listing created successfully", "item": item}), 201


@lending_bp.route('/lend-requests', methods=['GET'])
def get_lend_requests():
    """Get all active marketplace items (Lend/Need)."""
    tag = request.args.get('tag')  # Optional filter: "Lend" or "Need"
    
    query = {}
    if tag:
        query["tag"] = tag
    
    items = list(mongo.db.marketplace.find(query, {"_id": 0}).sort("created_at", -1).limit(50))
    
    if not items:
        # Auto-seed demo data
        default_items = [
            {
                "id": "l1", "title": "Scientific Calculator Casio fx-991EX", "by": "Priya Sharma",
                "avatar": "🧑‍🎓", "rating": 4.9, "distance": "Library · 200m", "pricePerHr": 15,
                "emoji": "🧮", "bg": "oklch(0.96 0.05 250)", "tag": "Lend", "posted": "2m ago", "status": "online"
            },
            {
                "id": "l2", "title": "Engineering Drawing Kit (Mini drafter)", "by": "Arjun T.",
                "avatar": "🧑‍🎓", "rating": 4.7, "distance": "Hostel B · 500m", "pricePerHr": 20,
                "emoji": "📐", "bg": "oklch(0.96 0.05 20)", "tag": "Need", "posted": "15m ago", "status": "online"
            },
            {
                "id": "l3", "title": "Lab Coat & Safety Goggles", "by": "Meera P.",
                "avatar": "🧑‍⚕️", "rating": 4.8, "distance": "Chemistry Block", "pricePerHr": 25,
                "emoji": "🥼", "bg": "oklch(0.93 0.08 200)", "tag": "Lend", "posted": "1h ago", "status": "offline"
            },
            {
                "id": "l4", "title": "Phone Charger (Type-C)", "by": "Rohan D.",
                "avatar": "🧑‍💻", "rating": 4.6, "distance": "CS Lab · 100m", "pricePerHr": 10,
                "emoji": "🔌", "bg": "oklch(0.94 0.06 140)", "tag": "Lend", "posted": "5m ago", "status": "online"
            },
            {
                "id": "l5", "title": "Umbrella (monsoon emergency!)", "by": "Sneha K.",
                "avatar": "🧑‍🎓", "rating": 4.5, "distance": "Main Gate · 300m", "pricePerHr": 5,
                "emoji": "☂️", "bg": "oklch(0.92 0.07 220)", "tag": "Need", "posted": "Just now", "status": "online"
            }
        ]
        mongo.db.marketplace.insert_many(default_items)
        items = list(mongo.db.marketplace.find({}, {"_id": 0}).sort("created_at", -1).limit(50))
        
    return jsonify({"requests": items, "count": len(items)})


@lending_bp.route('/delete-listing/<item_id>', methods=['DELETE'])
def delete_listing(item_id):
    """Delete a marketplace listing."""
    result = mongo.db.marketplace.delete_one({"id": item_id})
    if result.deleted_count > 0:
        socketio.emit('listing_removed', {"id": item_id})
        return jsonify({"message": "Listing deleted successfully"}), 200
    return jsonify({"message": "Listing not found"}), 404


@lending_bp.route('/request-item', methods=['POST'])
def request_item():
    """Create a new lending request and trigger AI matching."""
    data = request.json

    lend_request = {
        "request_id": str(uuid.uuid4()),
        "requester_id": data.get('requester_id', 'demo_user'),
        "item": data.get('item', 'Calculator'),
        "duration": data.get('duration', '2 hours'),
        "reward_xp": data.get('reward', 50),
        "pickup": data.get('pickup', 'Library'),
        "category": data.get('category', 'academic'),
        "status": "requested",
        "lender_id": None,
        "created_at": datetime.datetime.utcnow(),
        "return_by": None
    }

    mongo.db.lend_requests.insert_one(lend_request)
    lend_request['_id'] = str(lend_request['_id'])
    lend_request['created_at'] = lend_request['created_at'].isoformat()

    # AI matching
    from services.matching import calculate_lend_match
    match = calculate_lend_match(lend_request)

    # Generate OTP for handover
    from services.otp import generate_otp
    otp = generate_otp(lend_request['request_id'])

    from services.notification_service import create_notification
    create_notification(
        user_id=lend_request['requester_id'],
        event_type="LEND_REQUEST_CREATED",
        message=f"🔍 Your request for '{lend_request['item']}' has been posted! Matched with {match['lender']}."
    )

    # Emit realtime
    socketio.emit('lend_request_created', {
        "request": lend_request,
        "match": match
    })

    return jsonify({
        "message": "Lending request created successfully",
        "request": lend_request,
        "match": match,
        "handover_otp": otp
    }), 201


@lending_bp.route('/accept-lend', methods=['POST'])
def accept_lend():
    """Lender accepts a lending request — triggers realtime timeline."""
    data = request.json
    request_id = data.get('request_id')
    lender_id = data.get('lender_id', 'lender_demo')

    if not request_id:
        return jsonify({"message": "request_id is required"}), 400

    # Generate OTP
    from services.otp import generate_otp
    otp = generate_otp(request_id)

    mongo.db.lend_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": "accepted",
            "lender_id": lender_id,
            "matched_at": datetime.datetime.utcnow()
        }}
    )

    from services.notification_service import create_notification
    create_notification(
        user_id=lender_id,
        event_type="LEND_ACCEPTED",
        message=f"🤝 You accepted a lending request. Handover OTP: {otp}"
    )

    # Emit realtime
    socketio.emit('lend_accepted', {
        "request_id": request_id,
        "lender_id": lender_id,
        "otp": otp
    })

    return jsonify({
        "message": "Lending request accepted",
        "request_id": request_id,
        "lender_id": lender_id,
        "handover_otp": otp
    })


@lending_bp.route('/verify-handover', methods=['POST'])
def verify_handover():
    """Verify OTP when item is handed over."""
    data = request.json
    request_id = data.get('request_id')
    provided_otp = data.get('otp')

    from services.otp import verify_otp
    if verify_otp(request_id, provided_otp):
        lend_req = mongo.db.lend_requests.find_one({"request_id": request_id})
        duration_str = lend_req.get('duration', '2 hours') if lend_req else '2 hours'

        try:
            hours = int(duration_str.split()[0])
        except (ValueError, IndexError):
            hours = 2

        return_by = datetime.datetime.utcnow() + datetime.timedelta(hours=hours)

        mongo.db.lend_requests.update_one(
            {"request_id": request_id},
            {"$set": {
                "status": "handed_over",
                "handed_over_at": datetime.datetime.utcnow(),
                "return_by": return_by
            }}
        )

        from services.notification_service import create_notification
        create_notification(
            user_id=lend_req.get('requester_id', 'unknown'),
            event_type="ITEM_RECEIVED",
            message=f"📦 Item received! Please return by {return_by.strftime('%I:%M %p')}"
        )

        socketio.emit('handover_verified', {
            "request_id": request_id,
            "return_by": return_by.isoformat(),
            "status": "handed_over"
        })

        return jsonify({
            "message": "Handover verified! Item lending is now active.",
            "return_by": return_by.isoformat(),
            "status": "handed_over"
        })
    else:
        return jsonify({"message": "Invalid OTP"}), 400


@lending_bp.route('/return-item', methods=['POST'])
def return_item():
    """Mark item as returned and award XP + badge."""
    data = request.json
    request_id = data.get('request_id')
    rating = data.get('rating', 5)
    review = data.get('review', '')

    lend_req = mongo.db.lend_requests.find_one({"request_id": request_id})
    if not lend_req:
        return jsonify({"message": "Lending request not found"}), 404

    mongo.db.lend_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": "returned",
            "returned_at": datetime.datetime.utcnow()
        }}
    )

    # Award XP to lender
    reward_xp = lend_req.get('reward_xp', 50)
    from services.reward_service import award_xp, check_badge_unlock
    award_xp(lend_req.get('lender_id'), reward_xp)
    new_badge = check_badge_unlock(lend_req.get('lender_id'))

    # Save rating
    if rating:
        mongo.db.ratings.insert_one({
            "request_id": request_id,
            "lender_id": lend_req.get('lender_id'),
            "requester_id": lend_req.get('requester_id'),
            "rating": rating,
            "review": review,
            "created_at": datetime.datetime.utcnow()
        })

    from services.notification_service import create_notification
    create_notification(
        user_id=lend_req.get('lender_id'),
        event_type="ITEM_RETURNED",
        message=f"🎉 Item returned! You earned {reward_xp} XP."
    )

    socketio.emit('item_returned', {
        "request_id": request_id,
        "xp_earned": reward_xp,
        "badge_unlocked": new_badge
    })

    return jsonify({
        "message": "Item returned successfully!",
        "xp_earned": reward_xp,
        "badge_unlocked": new_badge,
        "rating_saved": True
    })


@lending_bp.route('/active-lendings', methods=['GET'])
def get_active_lendings():
    """Get active lending requests for tracking."""
    user_id = request.args.get('user_id')
    
    query = {"status": {"$in": ["requested", "matched", "accepted", "on_the_way", "handed_over", "return_pending"]}}
    if user_id:
        query["$or"] = [{"requester_id": user_id}, {"lender_id": user_id}]
    
    requests_list = list(mongo.db.lend_requests.find(query, {"_id": 0}).sort("created_at", -1).limit(20))
    
    for r in requests_list:
        if isinstance(r.get('created_at'), datetime.datetime):
            r['created_at'] = r['created_at'].isoformat()
        if isinstance(r.get('return_by'), datetime.datetime):
            r['return_by'] = r['return_by'].isoformat()
    
    return jsonify({"requests": requests_list, "count": len(requests_list)})
