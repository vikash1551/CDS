from flask import Blueprint, request, jsonify
from extensions import mongo, socketio
import uuid
import datetime
import threading
import time as _time

from models.schemas import OrderCreateSchema
from pydantic import ValidationError

orders_bp = Blueprint('orders_bp', __name__)

# ─── Campus route labels for mock tracking ───────────────────────
CAMPUS_STAGES = [
    {"stage": "Order Accepted", "label": "Courier confirmed", "progress": 10},
    {"stage": "Picking Up", "label": "Heading to pickup point", "progress": 25},
    {"stage": "Picked Up", "label": "Item collected from merchant", "progress": 40},
    {"stage": "On The Way", "label": "Passing through Block A", "progress": 55},
    {"stage": "Near Library Shortcut", "label": "Taking the fast route", "progress": 70},
    {"stage": "Crossing Main Corridor", "label": "Almost at your building", "progress": 85},
    {"stage": "Near You", "label": "Courier is nearby!", "progress": 95},
    {"stage": "Delivered", "label": "Order delivered", "progress": 100},
]

MOCK_COURIERS = [
    {"name": "Rahul K.", "rating": 4.8, "badge": "Speed Courier", "avatar": "🏃"},
    {"name": "Priya S.", "rating": 4.9, "badge": "Campus Hero", "avatar": "⚡"},
    {"name": "Vikash M.", "rating": 4.7, "badge": "Trusted Runner", "avatar": "🚴"},
    {"name": "Ananya R.", "rating": 4.6, "badge": "Night Owl", "avatar": "🦉"},
]


@orders_bp.route('/create-order', methods=['POST'])
def create_order():
    try:
        data = OrderCreateSchema(**request.json)
    except ValidationError as e:
        return jsonify({"message": "Validation error", "details": e.errors()}), 400
        
    order = {
        "order_id": str(uuid.uuid4()),
        "merchant_id": "demo_merchant_1",
        "order_type": data.order_type,
        "items": [{"name": data.item, "quantity": 1}],
        "delivery_location": data.drop_name or data.drop or "Unknown",
        "pickup_name": data.pickup_name or data.pickup or "Unknown",
        "priority": data.priority,
        "status": "pending",
        "total_amount": 150,
        "created_at": datetime.datetime.utcnow()
    }
    
    if data.pickup_location:
        order["pickup_location"] = data.pickup_location.model_dump()
    if data.drop_location:
        order["drop_location"] = data.drop_location.model_dump()
    
    mongo.db.merchant_orders.insert_one(order)
    order['_id'] = str(order['_id'])
    order['created_at'] = order['created_at'].isoformat()
    
    # Emit socket event for realtime
    socketio.emit('new_order', {"order_id": order["order_id"], "status": "pending"})
    
    # Surge pricing
    pending_count = mongo.db.merchant_orders.count_documents({"status": "pending"})
    surge_multiplier = 1.0
    if pending_count > 20:
        surge_multiplier = 2.0
    elif pending_count > 10:
        surge_multiplier = 1.5
        
    return jsonify({
        "message": "Order Created Successfully",
        "surge_multiplier": surge_multiplier,
        "estimated_fee": round(5.0 * surge_multiplier, 2),
        "order": order
    })


@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    """Get all orders for a user (or all for demo)."""
    user_id = request.args.get('user_id')
    status = request.args.get('status')
    limit = int(request.args.get('limit', 20))
    
    query = {}
    if user_id:
        query["$or"] = [{"requester_id": user_id}, {"courier_id": user_id}]
    if status:
        query["status"] = status
    
    orders = list(mongo.db.merchant_orders.find(
        query, {"_id": 0}
    ).sort("created_at", -1).limit(limit))
    
    # Convert datetimes
    for o in orders:
        if isinstance(o.get('created_at'), datetime.datetime):
            o['created_at'] = o['created_at'].isoformat()
    
    return jsonify({"orders": orders, "count": len(orders)})


@orders_bp.route('/accept-order', methods=['POST'])
def accept_order():
    """Courier accepts an order — triggers realtime delivery simulation."""
    data = request.json
    order_id = data.get('order_id')
    courier_id = data.get('courier_id', 'demo_courier')
    
    if not order_id:
        return jsonify({"message": "order_id is required"}), 400
    
    # Pick a mock courier profile
    import random
    courier = random.choice(MOCK_COURIERS)
    
    # Generate OTP for delivery
    from services.otp import generate_otp
    otp = generate_otp(order_id)
    
    mongo.db.merchant_orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": "accepted",
            "courier_id": courier_id,
            "courier_name": courier["name"],
            "courier_rating": courier["rating"],
            "courier_badge": courier["badge"],
            "delivery_otp": otp,
            "accepted_at": datetime.datetime.utcnow()
        }}
    )
    
    # Realtime: notify everyone
    socketio.emit('courier_assigned', {
        "order_id": order_id,
        "courier": courier,
        "otp": otp,
        "message": f"{courier['name']} is on the way!"
    })
    
    from services.notification_service import create_notification
    create_notification(
        user_id="broadcast",
        event_type="COURIER_ASSIGNED",
        message=f"🏃 {courier['name']} accepted your order!"
    )
    
    # Start mock delivery simulation in background
    from flask import current_app
    app = current_app._get_current_object()
    
    def simulate_delivery(app, order_id, courier):
        with app.app_context():
            for stage in CAMPUS_STAGES:
                _time.sleep(3)  # 3 seconds per stage
                
                eta_mins = max(1, int((100 - stage["progress"]) / 15))
                
                update = {
                    "order_id": order_id,
                    "stage": stage["stage"],
                    "label": stage["label"],
                    "progress": stage["progress"],
                    "eta": f"{eta_mins} min{'s' if eta_mins != 1 else ''}",
                    "courier": courier["name"]
                }
                
                # Update DB status
                status_map = {
                    "Picked Up": "picked_up",
                    "On The Way": "on_the_way",
                    "Near You": "near_you",
                    "Delivered": "delivered"
                }
                new_status = status_map.get(stage["stage"])
                if new_status:
                    mongo.db.merchant_orders.update_one(
                        {"order_id": order_id},
                        {"$set": {"status": new_status}}
                    )
                
                # Emit realtime updates
                socketio.emit('delivery_update', update)
                socketio.emit('eta_update', {
                    "order_id": order_id,
                    "eta": update["eta"],
                    "progress": stage["progress"]
                })
                
                # Notification at key stages
                if stage["stage"] in ["Picked Up", "Near You", "Delivered"]:
                    from services.notification_service import create_notification
                    create_notification(
                        user_id="broadcast",
                        event_type=f"DELIVERY_{stage['stage'].upper().replace(' ', '_')}",
                        message=f"📦 {stage['label']}"
                    )
            
            # Final: delivery complete
            socketio.emit('delivery_completed', {
                "order_id": order_id,
                "message": "Order delivered! 🎉"
            })
    
    thread = threading.Thread(target=simulate_delivery, args=(app, order_id, courier))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "message": "Order accepted! Courier is on the way.",
        "order_id": order_id,
        "courier": courier,
        "delivery_otp": otp,
        "estimated_stages": len(CAMPUS_STAGES),
        "stage_interval": "3 seconds"
    })


@orders_bp.route('/complete-order', methods=['POST'])
def complete_order():
    """Complete an order with OTP verification."""
    data = request.json
    order_id = data.get('order_id')
    provided_otp = data.get('otp')
    
    if not order_id:
        return jsonify({"message": "order_id is required"}), 400
    
    from services.otp import verify_otp
    if not verify_otp(order_id, provided_otp):
        return jsonify({"message": "Invalid OTP"}), 400
    
    # Mark as completed
    mongo.db.merchant_orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": "delivered",
            "completed_at": datetime.datetime.utcnow()
        }}
    )
    
    # Award XP to courier
    order = mongo.db.merchant_orders.find_one({"order_id": order_id})
    courier_id = order.get('courier_id') if order else None
    
    from services.reward_service import award_xp, check_badge_unlock
    xp_earned = 20
    if order and order.get('priority') == 'urgent':
        xp_earned = 30
    
    if courier_id:
        award_xp(courier_id, xp_earned)
        new_badge = check_badge_unlock(courier_id)
    else:
        new_badge = None
    
    # Notification
    from services.notification_service import create_notification
    create_notification(
        user_id="broadcast",
        event_type="DELIVERY_COMPLETED",
        message=f"✅ Delivery completed! You earned {xp_earned} XP."
    )
    
    socketio.emit('delivery_completed', {
        "order_id": order_id,
        "xp_earned": xp_earned,
        "badge_unlocked": new_badge
    })
    
    return jsonify({
        "message": "Delivery Completed!",
        "xp_earned": xp_earned,
        "badge_unlocked": new_badge
    })


@orders_bp.route('/verify-otp', methods=['POST'])
def verify_otp_endpoint():
    """Standalone OTP verification endpoint."""
    data = request.json
    order_id = data.get('order_id') or data.get('request_id')
    provided_otp = data.get('otp')
    
    if not order_id or not provided_otp:
        return jsonify({"message": "order_id and otp are required"}), 400
    
    from services.otp import verify_otp
    if verify_otp(order_id, provided_otp):
        return jsonify({
            "message": "OTP Verified Successfully",
            "verified": True,
            "xp_earned": 20,
            "badge": "Speed Courier"
        })
    else:
        return jsonify({"message": "Invalid OTP", "verified": False}), 400
