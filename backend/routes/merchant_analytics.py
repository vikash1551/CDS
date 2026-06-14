from flask import Blueprint, jsonify, request
from extensions import mongo
import random

merchant_analytics_bp = Blueprint('merchant_analytics_bp', __name__)

@merchant_analytics_bp.route('/api/merchant/analytics', methods=['GET'])
def get_ai_analytics():
    time_range = request.args.get('time_range', 'This Week')
    category_filter = request.args.get('category', 'All')
    search_query = request.args.get('search', '').lower()

    multiplier = 1.0
    if time_range == "Today":
        multiplier = 0.15
    elif time_range == "This Month":
        multiplier = 4.2
    elif time_range == "Custom Date Range":
        multiplier = 2.5

    # Base products dataset based on user prompt categories
    base_products = [
        {"name": "Tea Cup", "category": "Beverages", "price": 20},
        {"name": "Samosa", "category": "Food", "price": 25},
        {"name": "Coffee", "category": "Beverages", "price": 30},
        {"name": "Sandwich", "category": "Food", "price": 50},
        {"name": "Puff", "category": "Food", "price": 35},
        {"name": "Notebook", "category": "Stationery", "price": 80},
        {"name": "Pen", "category": "Stationery", "price": 10},
        {"name": "Marker", "category": "Stationery", "price": 25},
        {"name": "Calculator", "category": "Electronics", "price": 500},
        {"name": "Headphones", "category": "Electronics", "price": 1200},
        {"name": "Keyboard", "category": "Electronics", "price": 800},
        {"name": "Sticky Notes", "category": "Stationery", "price": 40},
    ]

    # Filter base products
    if category_filter != "All":
        base_products = [p for p in base_products if p["category"] == category_filter]
    if search_query:
        base_products = [p for p in base_products if search_query in p["name"].lower()]

    dataset = []
    
    total_revenue = 0
    total_units_sold = 0
    low_stock_count = 0
    
    # Generate dynamic data
    for prod in base_products:
        # Deterministic random seed based on product name
        random.seed(prod["name"])
        current_stock = random.randint(2, 40)
        units_sold_base = random.randint(1, 15)
        
        # Artificial logic for specific products
        if prod["name"] == "Calculator":
            current_stock = 15
            units_sold_base = 3
        elif prod["name"] == "Notebook":
            current_stock = 45
            units_sold_base = 12
        elif prod["name"] == "Samosa":
            units_sold_base = 45 # high selling for startup
            current_stock = 60
        elif prod["name"] == "Keyboard":
            current_stock = 8
            units_sold_base = 1
        elif prod["name"] == "Tea Cup":
            units_sold_base = 35
            current_stock = 40

        units_sold = max(1, int(units_sold_base * multiplier))
            
        revenue = units_sold * prod["price"]
        total_revenue += revenue
        total_units_sold += units_sold
        
        # Predictions
        # Demand prediction = base sold * some multiplier
        pred_demand = int(units_sold * random.uniform(0.8, 1.5))
        if prod["name"] == "Calculator": pred_demand = 5
        if prod["name"] == "Notebook": pred_demand = 18
        
        rec_stock = int(pred_demand * 1.5)
        if prod["name"] == "Calculator": rec_stock = 10
        if prod["name"] == "Notebook": rec_stock = 25
        
        # Low stock check
        is_low_stock = current_stock < pred_demand
        if is_low_stock:
            low_stock_count += 1
            
        # Status
        if pred_demand > 20:
            status = "High Demand"
        elif pred_demand > 5:
            status = "Medium Demand"
        else:
            status = "Low Demand"
            
        # Trending logic
        category_demand_factor = 1.0
        if prod["category"] in ["Food", "Beverages"]: category_demand_factor = 1.5
        
        trending_score = (units_sold * 0.6) + ((units_sold / max(1, current_stock)) * 100 * 0.2) + (category_demand_factor * 20)
        
        if trending_score > 40 or prod["name"] == "Samosa":
            trend_badge = "🔥 Trending"
        elif trending_score > 20 or prod["name"] == "Notebook":
            trend_badge = "📈 Rising"
        else:
            trend_badge = "⚠ Declining"
            
        # Inventory Risk
        # "Low Stock Risk" if stock < demand * 1.2
        # "Overstocked" if stock > demand * 4
        # "Balanced" otherwise
        if current_stock < pred_demand * 1.2:
            risk = "Low Stock Risk"
        elif current_stock > pred_demand * 4:
            risk = "Overstocked"
        else:
            risk = "Balanced"

        dataset.append({
            "product": prod["name"],
            "category": prod["category"],
            "current_stock": current_stock,
            "units_sold": units_sold,
            "price": prod["price"],
            "predicted_demand": pred_demand,
            "recommended_stock": rec_stock,
            "status": status,
            "trending_score": trending_score,
            "trend_badge": trend_badge,
            "risk_status": risk,
            "revenue": revenue
        })

    # Sort dataset for various sections
    trending_products = sorted(dataset, key=lambda x: x["trending_score"], reverse=True)[:5]
    
    # Category Analytics
    categories = {"Food": {"sales": 0, "revenue": 0, "products": []},
                  "Beverages": {"sales": 0, "revenue": 0, "products": []},
                  "Stationery": {"sales": 0, "revenue": 0, "products": []},
                  "Electronics": {"sales": 0, "revenue": 0, "products": []}}
                  
    for d in dataset:
        cat = d["category"]
        if cat in categories:
            categories[cat]["sales"] += d["units_sold"]
            categories[cat]["revenue"] += d["revenue"]
            categories[cat]["products"].append(d)
            
    cat_analytics = []
    for cat, data in categories.items():
        top_prod = max(data["products"], key=lambda x: x["units_sold"])["product"] if data["products"] else "None"
        cat_analytics.append({
            "category": cat,
            "total_sales": data["sales"],
            "revenue": data["revenue"],
            "top_product": top_prod
        })

    return jsonify({
        "status": "success",
        "kpis": {
            "total_revenue": total_revenue,
            "total_units_sold": total_units_sold,
            "low_stock_alerts": low_stock_count,
            "ai_accuracy": random.randint(85, 95)
        },
        "insights": [
            "🔥 Tea Cup demand expected to increase by 18% next week",
            "⚠ Calculator stock may run out in 12 days",
            "📈 Samosa is currently the fastest-selling product"
        ],
        "trending_products": trending_products,
        "prediction_table": sorted(dataset, key=lambda x: x["predicted_demand"], reverse=True),
        "category_analytics": cat_analytics,
        "inventory_risk": [
            {"product": d["product"], "risk_status": d["risk_status"]} for d in dataset
        ],
        "smart_recommendations": [
            "Increase Tea Cup inventory by 20%",
            "Reduce Keyboard stock by 10%",
            "Promote Calculator bundle with Notebook",
            "Offer discount on Headphones"
        ]
    })

# Maintain existing endpoints so we don't break compatibility if something still uses them
@merchant_analytics_bp.route('/merchant/analytics', methods=['GET'])
def get_analytics_legacy():
    # Legacy endpoint logic retained to avoid breaking old code
    merchant_id = request.args.get('merchant_id', 'demo_merchant_1')
    total_orders = mongo.db.merchant_orders.count_documents({"merchant_id": merchant_id})
    active_orders = mongo.db.merchant_orders.count_documents({
        "merchant_id": merchant_id, 
        "status": {"$in": ["pending", "accepted", "preparing", "ready_for_pickup", "picked_up"]}
    })
    completed_orders = list(mongo.db.merchant_orders.find({"merchant_id": merchant_id, "status": "delivered"}, {"total_amount": 1, "_id": 0}))
    revenue_estimate = sum(order.get('total_amount', 0) for order in completed_orders)
    return jsonify({
        "orders_today": total_orders,
        "active_orders": active_orders,
        "revenue_estimate": revenue_estimate,
        "top_product": "Samosa",
        "avg_eta": "12 mins"
    })

@merchant_analytics_bp.route('/merchant/dashboard', methods=['GET'])
def get_dashboard_legacy():
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
        "hotspot_map_data": [{"name": "Library", "orders": 12}]
    })
