from flask import Blueprint, jsonify
import random

merchant_inventory_ai_bp = Blueprint('merchant_inventory_ai_bp', __name__)

@merchant_inventory_ai_bp.route('/api/merchant/ai-inventory-analysis', methods=['GET'])
def ai_inventory_analysis():
    # MOCK DATA MODE for AI Inventory Analyzer
    
    product_names = [
        "Notebook", "Pen", "Marker", "A4 Sheets", "Calculator",
        "USB Drive", "Power Bank", "Water Bottle", "Textbook", "Headphones",
        "Mouse", "Keyboard", "Sticky Notes", "Folder", "Stapler",
        "Highlighter", "Lab Kit", "Drawing Book", "Charger", "Coffee Cup"
    ]
    
    categories = {
        "Stationery": ["Notebook", "Pen", "Marker", "A4 Sheets", "Sticky Notes", "Folder", "Stapler", "Highlighter", "Drawing Book"],
        "Electronics": ["Calculator", "USB Drive", "Power Bank", "Headphones", "Mouse", "Keyboard", "Charger"],
        "Books": ["Textbook"],
        "Beverages": ["Coffee Cup", "Water Bottle"],
        "Accessories": ["Lab Kit"]
    }
    
    def get_category(name):
        for cat, items in categories.items():
            if name in items:
                return cat
        return "Accessories"

    products = []
    total_inventory_value = 0
    weekly_sales_total = 0
    monthly_sales_total = 0
    
    high_risk = 0
    medium_risk = 0
    low_risk = 0
    
    for name in product_names:
        category = get_category(name)
        price = random.randint(20, 1500)
        
        # Make some items deliberately high risk
        if name in ["Marker", "Notebook", "Charger"]:
            current_stock = random.randint(5, 20)
            weekly_consumption = random.randint(30, 80)
        else:
            current_stock = random.randint(20, 300)
            weekly_consumption = random.randint(5, 50)
            
        daily_consumption = max(1, weekly_consumption / 7.0)
        days_remaining = int(current_stock / daily_consumption)
        
        demand_growth = random.randint(-5, 35)
        
        # Risk Logic
        if days_remaining < 7:
            risk_level = "HIGH"
            high_risk += 1
        elif days_remaining <= 14:
            risk_level = "MEDIUM"
            medium_risk += 1
        else:
            risk_level = "LOW"
            low_risk += 1
            
        suggested_restock = int(weekly_consumption * 4) # Recommend 4 weeks buffer
        if risk_level == "HIGH":
            suggested_restock = int(suggested_restock * 1.5) # Extra for high risk
            
        pred_7_days = int(weekly_consumption * (1 + (demand_growth / 100.0)))
        pred_30_days = int((weekly_consumption * 4.3) * (1 + (demand_growth / 100.0)))
            
        total_inventory_value += (current_stock * price)
        weekly_sales_total += pred_7_days
        monthly_sales_total += pred_30_days

        products.append({
            "name": name,
            "category": category,
            "current_stock": current_stock,
            "weekly_consumption": weekly_consumption,
            "days_remaining": days_remaining,
            "demand_growth": f"{'+' if demand_growth >= 0 else ''}{demand_growth}%",
            "risk_level": risk_level,
            "suggested_restock": suggested_restock,
            "predicted_7_days": pred_7_days,
            "predicted_30_days": pred_30_days,
            "price": price
        })
        
    # Sort products by risk (High -> Medium -> Low) then by days remaining
    risk_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    products.sort(key=lambda x: (risk_order[x["risk_level"]], x["days_remaining"]))
    
    # Inventory Health Score
    base_score = 100
    penalty = (high_risk * 8) + (medium_risk * 3)
    health_score = max(0, base_score - penalty)
    
    if health_score >= 80:
        health_status = "GOOD"
    elif health_score >= 50:
        health_status = "WARNING"
    else:
        health_status = "CRITICAL"
        
    # Business Insights
    insights = [
        "Notebook demand increased by 22% compared to previous weeks.",
        f"Marker inventory is expected to run out within {next((p['days_remaining'] for p in products if p['name'] == 'Marker'), 4)} days.",
        "Electronics category shows stable inventory performance.",
        "Stationery products account for 48% of total weekly sales.",
        "Restocking notebooks and chargers should be prioritized."
    ]
    
    # Priority Actions
    actions = [
        f"Restock {next((p['suggested_restock'] for p in products if p['name'] == 'Notebook'), 180)} Notebooks immediately.",
        f"Increase Marker inventory by {next((p['suggested_restock'] for p in products if p['name'] == 'Marker'), 60)} units.",
        "Review Charger inventory levels.",
        "Monitor Power Bank demand trend."
    ]
    
    top_selling = max(products, key=lambda x: x['weekly_consumption'])

    return jsonify({
        "status": "success",
        "demo_mode": True,
        "message": "Demo Analysis Mode Active",
        "dashboard": {
            "health_score": health_score,
            "health_status": health_status,
            "total_products": len(products),
            "total_inventory_value": total_inventory_value,
            "high_risk_items": high_risk,
            "medium_risk_items": medium_risk,
            "low_risk_items": low_risk,
            "weekly_sales_forecast": weekly_sales_total,
            "monthly_sales_forecast": monthly_sales_total,
            "potential_revenue_forecast": sum(p['predicted_30_days'] * p['price'] for p in products),
            "top_selling_product": top_selling['name'],
            "top_selling_growth": top_selling['demand_growth']
        },
        "insights": insights,
        "priority_actions": actions,
        "products": products
    })
