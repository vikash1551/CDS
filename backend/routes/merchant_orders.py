from flask import Blueprint, request, jsonify
from extensions import mongo, socketio
import datetime

merchant_orders_bp = Blueprint('merchant_orders_bp', __name__)

@merchant_orders_bp.route('/merchant/orders', methods=['GET'])
def get_orders():
    merchant_id = request.args.get('merchant_id', 'demo_merchant_1')
    status = request.args.get('status')
    
    query = {"merchant_id": merchant_id}
    if status:
        query["status"] = status
        
    orders = list(mongo.db.merchant_orders.find(query, {"_id": 0}).sort("created_at", -1))
    return jsonify({"orders": orders})


@merchant_orders_bp.route('/merchant/accept-order', methods=['POST'])
def accept_order():
    data = request.json
    order_id = data.get('order_id')
    merchant_id = data.get('merchant_id', 'demo_merchant_1')
    
    result = mongo.db.merchant_orders.update_one(
        {"order_id": order_id, "merchant_id": merchant_id},
        {"$set": {
            "status": "accepted",
            "accepted_at": datetime.datetime.utcnow().isoformat()
        }}
    )
    
    if result.modified_count == 0:
        return jsonify({"message": "Order not found or already accepted"}), 404
        
    # Notify customer / general room
    socketio.emit('delivery_status', {
        "order_id": order_id,
        "status": "accepted",
        "message": "The merchant has accepted your order and is preparing it."
    })
    
    return jsonify({"message": "Order accepted successfully"})


@merchant_orders_bp.route('/merchant/update-order-status', methods=['POST'])
def update_order_status():
    data = request.json
    order_id = data.get('order_id')
    merchant_id = data.get('merchant_id', 'demo_merchant_1')
    new_status = data.get('status')  # preparing, ready_for_pickup, picked_up, delivered
    
    if new_status not in ['preparing', 'ready_for_pickup', 'picked_up', 'delivered']:
        return jsonify({"message": "Invalid status"}), 400
        
    result = mongo.db.merchant_orders.update_one(
        {"order_id": order_id, "merchant_id": merchant_id},
        {"$set": {
            "status": new_status,
            f"{new_status}_at": datetime.datetime.utcnow().isoformat()
        }}
    )
    
    if result.modified_count == 0:
        return jsonify({"message": "Order not found"}), 404
        
    socketio.emit('delivery_status', {
        "order_id": order_id,
        "status": new_status,
        "message": f"Order status updated to: {new_status}"
    })
    
    return jsonify({"message": f"Order status updated to {new_status}"})


@merchant_orders_bp.route('/merchant/assign-courier', methods=['POST'])
def assign_courier():
    data = request.json
    order_id = data.get('order_id')
    merchant_id = data.get('merchant_id', 'demo_merchant_1')
    courier_id = data.get('courier_id')
    
    result = mongo.db.merchant_orders.update_one(
        {"order_id": order_id, "merchant_id": merchant_id},
        {"$set": {
            "courier_id": courier_id,
            "status": "ready_for_pickup",
            "courier_assigned_at": datetime.datetime.utcnow().isoformat()
        }}
    )
    
    if result.modified_count == 0:
        return jsonify({"message": "Order not found"}), 404
        
    socketio.emit('courier_update', {
        "order_id": order_id,
        "courier_id": courier_id,
        "message": "A courier has been assigned to your order."
    })
    
    return jsonify({"message": "Courier assigned successfully", "courier_id": courier_id})
