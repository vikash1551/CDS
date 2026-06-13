from flask import Blueprint, request, jsonify
from extensions import mongo
import datetime

merchant_analytics_bp = Blueprint('merchant_analytics_bp', __name__)

@merchant_analytics_bp.route('/merchant/analytics', methods=['GET'])
def get_analytics():
    merchant_id = request.args.get('merchant_id', 'demo_merchant_1')
    
    # Calculate simple stats
    total_orders = mongo.db.merchant_orders.count_documents({"merchant_id": merchant_id})
    active_orders = mongo.db.merchant_orders.count_documents({
        "merchant_id": merchant_id, 
        "status": {"$in": ["pending", "accepted", "preparing", "ready_for_pickup", "picked_up"]}
    })
    
    # Simple estimate of revenue based on completed orders
    completed_orders = list(mongo.db.merchant_orders.find({"merchant_id": merchant_id, "status": "delivered"}, {"total_amount": 1, "_id": 0}))
    revenue_estimate = sum(order.get('total_amount', 0) for order in completed_orders)
    
    # Simple mock top product
    top_product = "Veg Puff" if merchant_id == 'demo_merchant_1' else "Notebook"
    
    return jsonify({
        "orders_today": total_orders,
        "active_orders": active_orders,
        "revenue_estimate": revenue_estimate,
        "top_product": top_product,
        "avg_eta": "12 mins"
    })

@merchant_analytics_bp.route('/merchant/dashboard', methods=['GET'])
def get_dashboard():
    merchant_id = request.args.get('merchant_id', 'demo_merchant_1')
    
    active_orders = list(mongo.db.merchant_orders.find({
        "merchant_id": merchant_id, 
        "status": {"$in": ["pending", "accepted", "preparing", "ready_for_pickup", "picked_up"]}
    }, {"_id": 0}).sort("created_at", -1).limit(10))
    
    inventory_alerts = list(mongo.db.merchant_products.find({
        "merchant_id": merchant_id,
        "stock": {"$lt": 10}
    }, {"_id": 0, "name": 1, "stock": 1}))
    
    return jsonify({
        "live_active_orders": active_orders,
        "inventory_alerts": inventory_alerts,
        "active_couriers": 3,
        "hotspot_map_data": [
            {"name": "Library", "orders": 12},
            {"name": "Hostel Block A", "orders": 8}
        ]
    })
