# pyrefly: ignore [missing-import]
from flask import Blueprint, request, jsonify
from extensions import mongo

delivery_bp = Blueprint('delivery_bp', __name__)

@delivery_bp.route('/accept-delivery', methods=['POST'])
def accept_delivery():
    data = request.json
    order_id = data.get('order_id')
    courier_id = data.get('courier_id', 'mock_courier_123')
    
    mongo.db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": "accepted", "courier_id": courier_id}}
    )
    
    from services.otp import generate_otp
    otp = generate_otp(order_id)
    
    from services.notifications import send_notification
    send_notification("DELIVERY_ACCEPTED", f"Courier is on the way! OTP: {otp}")
    
    return jsonify({
        "message": "Delivery Accepted",
        "order_id": order_id,
        "courier_id": courier_id,
        "otp_required": True
    })

# pyrefly: ignore [parse-error]
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@delivery_bp.route('/complete-delivery', methods=['POST'])
def complete_delivery():
    # Proof of delivery - Photo Upload
    order_id = request.form.get('order_id')
    
    if 'photo' not in request.files:
        return jsonify({"message": "No proof of delivery photo provided"}), 400
        
    file = request.files['photo']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
        
    filename = secure_filename(file.filename)
    # Give it a unique name
    import uuid
    unique_filename = f"{uuid.uuid4()}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    
    # Update order in DB
    mongo.db.orders.update_one(
        {"order_id": order_id},
        {
            "$set": {
                "status": "completed", 
                "proof_of_delivery_url": f"/uploads/{unique_filename}"
            }
        }
    )
    
    # Award XP to the courier (Assuming the courier is the currently logged-in user in a real app)
    courier_id = request.form.get('courier_id', 'mock_courier_123')
    mongo.db.users.update_one(
        {"user_id": courier_id},
        {"$inc": {"xp": 100}} # Award 100 XP for completing delivery
    )
    
    from services.notifications import send_notification
    send_notification("DELIVERY_COMPLETED", f"Your order {order_id} has arrived! View proof of delivery photo.")
    
    return jsonify({
        "message": "Delivery completed and proof uploaded successfully!",
        "proof_url": f"/uploads/{unique_filename}",
        "xp_awarded": 100
    })

@delivery_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    order_id = data.get('order_id')
    provided_otp = data.get('otp')
    
    from services.otp import verify_otp as check_otp
    if check_otp(order_id, provided_otp):
        mongo.db.orders.update_one(
            {"order_id": order_id},
            {"$set": {"status": "completed"}}
        )
        
        from services.notifications import send_notification
        send_notification("DELIVERY_COMPLETED", "Delivery completed successfully!")
        
        return jsonify({
            "message": "Delivery completed successfully!",
            "xp_earned": 20,
            "badge_unlocked": "Speed Courier"
        })
    else:
        return jsonify({"message": "Invalid OTP"}), 400
