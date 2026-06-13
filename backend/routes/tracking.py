from flask import Blueprint, jsonify, request
from extensions import socketio, mongo
from flask_socketio import join_room, leave_room, emit
import threading
import time
import datetime

tracking_bp = Blueprint('tracking_bp', __name__)

# Simulated campus GPS route (NMIT area)
CAMPUS_ROUTE = [
    {"lat": 13.0827, "lng": 80.2707, "stage": "Picked up"},
    {"lat": 13.0829, "lng": 80.2709, "stage": "En route"},
    {"lat": 13.0831, "lng": 80.2711, "stage": "En route"},
    {"lat": 13.0833, "lng": 80.2713, "stage": "Crossing Main Quad"},
    {"lat": 13.0835, "lng": 80.2715, "stage": "Near Library"},
    {"lat": 13.0837, "lng": 80.2717, "stage": "Almost there"},
    {"lat": 13.0839, "lng": 80.2719, "stage": "Arriving"},
    {"lat": 13.0841, "lng": 80.2721, "stage": "At drop-off"},
]


@tracking_bp.route('/tracking', methods=['GET'])
def get_tracking():
    """Get current tracking state for an order."""
    order_id = request.args.get('order_id')

    if order_id:
        track_data = mongo.db.tracking.find_one(
            {"order_id": order_id}, {"_id": 0}
        )
        if track_data:
            return jsonify(track_data)

    # Default demo tracking response
    return jsonify({
        "status": "in_transit",
        "current_location": {"lat": 13.0833, "lng": 80.2713},
        "eta": "4 mins",
        "courier": "Vikash S.",
        "stage": "Crossing Main Quad",
        "progress_percent": 50
    })


@tracking_bp.route('/tracking/simulate', methods=['POST'])
def simulate_tracking():
    """Start a mock GPS simulation for demo purposes."""
    data = request.json or {}
    order_id = data.get('order_id', 'demo_order')

    def run_simulation(app, order_id):
        with app.app_context():
            total_steps = len(CAMPUS_ROUTE)
            for i, point in enumerate(CAMPUS_ROUTE):
                progress = int(((i + 1) / total_steps) * 100)
                eta = max(1, total_steps - i - 1)

                payload = {
                    "order_id": order_id,
                    "lat": point["lat"],
                    "lng": point["lng"],
                    "stage": point["stage"],
                    "eta": f"{eta} min{'s' if eta != 1 else ''}",
                    "progress_percent": progress,
                    "step": i + 1,
                    "total_steps": total_steps
                }

                # Emit to the specific order room AND globally
                socketio.emit('live_location', payload, to=order_id)
                socketio.emit('live_location', payload)

                # Also emit delivery stage updates
                socketio.emit('delivery_status', {
                    "order_id": order_id,
                    "status": "completed" if progress == 100 else "in_transit",
                    "stage": point["stage"],
                    "progress": progress
                }, to=order_id)

                time.sleep(3)  # Move every 3 seconds

            # Final: mark as arrived
            socketio.emit('delivery_status', {
                "order_id": order_id,
                "status": "arrived",
                "stage": "Delivered",
                "progress": 100
            }, to=order_id)

    # Run simulation in background thread
    from flask import current_app
    app = current_app._get_current_object()
    thread = threading.Thread(target=run_simulation, args=(app, order_id))
    thread.daemon = True
    thread.start()

    return jsonify({
        "message": "GPS simulation started",
        "order_id": order_id,
        "total_steps": len(CAMPUS_ROUTE),
        "interval": "3 seconds per step"
    })


# ─── Socket.IO Events ───────────────────────────────────────────

@socketio.on('join_order_room')
def handle_join_room(data):
    order_id = data.get('order_id')
    if order_id:
        join_room(order_id)
        socketio.emit('room_update', {
            'message': f'Joined tracking room for order {order_id}'
        }, to=order_id)


@socketio.on('location_update')
def handle_location_update(data):
    """Handle real GPS updates from courier's device."""
    order_id = data.get('order_id')
    if order_id:
        socketio.emit('live_location', data, to=order_id)
    else:
        socketio.emit('live_location', data)


@socketio.on('send_chat_message')
def handle_chat_message(data):
    """In-delivery chat between courier and requester."""
    order_id = data.get('order_id')
    message = data.get('message')
    sender = data.get('sender', 'Anonymous')
    if order_id and message:
        socketio.emit('new_chat_message', {
            'sender': sender,
            'message': message
        }, to=order_id)

@socketio.on('accept_order')
def handle_accept_order(data):
    """Courier accepts an order from the feed."""
    order_id = data.get('order_id')
    courier_name = data.get('courier_name', 'Student Runner')
    if order_id:
        # Notify the buyer that their order has been accepted
        socketio.emit('order_accepted', {
            'order_id': order_id,
            'courier_name': courier_name,
            'status': 'accepted'
        }, to=order_id)

@socketio.on('update_courier_stage')
def handle_update_courier_stage(data):
    """Courier app sends progress updates to sync the buyer's UI."""
    order_id = data.get('order_id')
    if order_id:
        socketio.emit('delivery_update', {
            'order_id': order_id,
            'stage': data.get('stage'),
            'eta': data.get('eta'),
            'progress': data.get('progress'),
            'courier': data.get('courier'),
            'label': data.get('label')
        }, to=order_id)


# ─── Lending Timeline Socket Events ──────────────────────────────

LENDING_STEPS = [
    {"id": 1, "title": "Request Item", "desc": "Request placed securely."},
    {"id": 2, "title": "AI Match", "desc": "Finding the best peer nearby..."},
    {"id": 3, "title": "Lender Accepts", "desc": "Lender confirmed the request."},
    {"id": 4, "title": "Live Tracking", "desc": "Meet at the designated spot."},
    {"id": 5, "title": "OTP Handover", "desc": "Share OTP to receive item."},
    {"id": 6, "title": "Return Reminder", "desc": "Automated safe-return tracking."},
    {"id": 7, "title": "Ratings & Rewards", "desc": "Earn campus rep points."},
]


@socketio.on('start_lend_flow')
def handle_start_lend_flow(data):
    """Start the lending timeline progression for a request."""
    request_id = data.get('request_id', f'req_{int(datetime.datetime.utcnow().timestamp() * 1000)}')
    item_title = data.get('item', 'Item')

    join_room(request_id)

    # Step 1: Request Item (immediate)
    emit('lend_step', {
        'request_id': request_id,
        'step': 1,
        'title': 'Request Item',
        'desc': f'Request for "{item_title}" placed securely.',
    }, to=request_id)

    # Run the AI matching simulation in a background thread
    from flask import current_app
    app = current_app._get_current_object()

    def run_lend_simulation(app, request_id, item_title):
        with app.app_context():
            import time as _time

            # Step 2: AI Match (after 1.5s)
            _time.sleep(1.5)
            from services.matching import calculate_lend_match
            match = calculate_lend_match({'item': item_title})
            socketio.emit('lend_step', {
                'request_id': request_id,
                'step': 2,
                'title': 'AI Match',
                'desc': f'Matched with {match["lender"]} ({match["match_score"]} score)',
                'match': match,
            }, to=request_id)

            # Step 3: Lender Accepts (after 2.5s)
            _time.sleep(2.5)
            socketio.emit('lend_step', {
                'request_id': request_id,
                'step': 3,
                'title': 'Lender Accepts',
                'desc': f'{match["lender"]} accepted! Heading your way.',
                'match': match,
            }, to=request_id)

            # Step 4: Live Tracking (after 2s)
            _time.sleep(2)
            socketio.emit('lend_step', {
                'request_id': request_id,
                'step': 4,
                'title': 'Live Tracking',
                'desc': 'Meet at the designated spot.',
                'match': match,
            }, to=request_id)

            # Steps 5-7 are triggered by user actions (OTP verify, return, rate)

    # Automatically starting the thread skips the initial phases too fast for demo purposes.
    # Users will use the '[Demo] Simulate next step' button in lend-track.tsx to advance manually.
    # thread = threading.Thread(
    #     target=run_lend_simulation,
    #     args=(app, request_id, item_title)
    # )
    # thread.daemon = True
    # thread.start()


@socketio.on('verify_handover_otp')
def handle_verify_otp(data):
    """Verify OTP and advance to step 5."""
    request_id = data.get('request_id')
    otp = data.get('otp')

    from services.otp import verify_otp
    if verify_otp(request_id, otp):
        emit('lend_step', {
            'request_id': request_id,
            'step': 5,
            'title': 'OTP Handover',
            'desc': 'Item handed over successfully!',
            'verified': True,
        }, to=request_id)
    else:
        emit('otp_error', {'message': 'Invalid OTP, try again.'}, to=request_id)


@socketio.on('confirm_return')
def handle_confirm_return(data):
    """Mark item as returned, advance to step 6."""
    request_id = data.get('request_id')
    emit('lend_step', {
        'request_id': request_id,
        'step': 6,
        'title': 'Return Reminder',
        'desc': 'Item returned safely.',
    }, to=request_id)


@socketio.on('submit_rating')
def handle_submit_rating(data):
    """Submit rating and complete the flow."""
    request_id = data.get('request_id')
    rating = data.get('rating', 5)
    review = data.get('review', '')

    # Persist rating
    from extensions import mongo
    mongo.db.ratings.insert_one({
        'request_id': request_id,
        'rating': rating,
        'review': review,
        'created_at': datetime.datetime.utcnow()
    })

    emit('lend_step', {
        'request_id': request_id,
        'step': 7,
        'title': 'Ratings & Rewards',
        'desc': f'Rated {rating}⭐ — You earned 50 XP!',
        'completed': True,
    }, to=request_id)
