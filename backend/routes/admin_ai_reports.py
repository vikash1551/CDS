from flask import Blueprint, jsonify, request
from extensions import mongo
import datetime
import random

admin_ai_reports_bp = Blueprint('admin_ai_reports_bp', __name__)

def generate_ai_report():
    # Simulate reading from merchant analytics (like Calculator, Notebooks, Samosa)
    products = [
        {"name": "Calculator", "stock": 180, "sold": 12, "price": 500, "category": "Electronics", "growth": 65},
        {"name": "Notebook", "stock": 850, "sold": 45, "price": 80, "category": "Stationery", "growth": 42},
        {"name": "Tea Cup", "stock": 40, "sold": 380, "price": 20, "category": "Beverages", "growth": 18},
        {"name": "Samosa", "stock": 50, "sold": 450, "price": 25, "category": "Food", "growth": 12},
        {"name": "Water Bottle", "stock": 150, "sold": 80, "price": 100, "category": "Beverages", "growth": 28},
        {"name": "Power Bank", "stock": 25, "sold": 18, "price": 1500, "category": "Electronics", "growth": 55},
    ]

    reports = []
    
    for prod in products:
        report = None
        if prod["name"] == "Calculator":
            report = {
                "title": "Calculator Demand Alert",
                "insight": "Calculator demand increased by 65%. Exam-related purchasing behavior detected.",
                "reason": f"Sales Increase: +{prod['growth']}%",
                "recommendation": "Increase calculator inventory by 100 units within the next 24 hours.",
                "expected_impact": "₹45,000",
                "priority": "HIGH",
                "type": "alert"
            }
        elif prod["name"] == "Notebook":
            report = {
                "title": "Notebook Growth Trend",
                "insight": "Notebook sales increased by 42%. Current inventory may become insufficient within 3 days.",
                "reason": f"Sales Increase: +{prod['growth']}%",
                "recommendation": "Restock 250 notebooks immediately.",
                "expected_impact": "Higher Sales During Exam Period",
                "priority": "HIGH",
                "type": "opportunity"
            }
        elif prod["name"] == "Water Bottle":
            report = {
                "title": "Summer Demand Pattern",
                "insight": "Water Bottle sales increased by 28%. Summer demand pattern detected.",
                "reason": f"Sales Increase: +{prod['growth']}%",
                "recommendation": "Increase beverage inventory by 20%.",
                "expected_impact": "Increased Category Revenue",
                "priority": "MEDIUM",
                "type": "opportunity"
            }
        elif prod["name"] == "Tea Cup":
            report = {
                "title": "Beverage Fast Mover",
                "insight": "Tea Cup demand expected to increase by 18% next week.",
                "reason": "Fastest-selling product in Beverages.",
                "recommendation": "Increase Tea Cup inventory by 20%.",
                "expected_impact": "₹7,600",
                "priority": "MEDIUM",
                "type": "alert"
            }
            
        if report:
            report["created_at"] = datetime.datetime.utcnow()
            reports.append(report)

    # General Business Insights (Human Language)
    general_insights = [
        "Exam season is driving increased demand for calculators and notebooks.",
        "Food category contributes 38% of total sales volume.",
        "Stationery category generated the highest weekly revenue.",
        "Power banks show increasing demand among students."
    ]

    report_document = {
        "reports": reports,
        "general_insights": general_insights,
        "created_at": datetime.datetime.utcnow()
    }
    
    # Store in MongoDB
    try:
        mongo.db.admin_ai_reports.insert_one(report_document)
    except Exception as e:
        print(f"Failed to store report in DB: {e}")
        
    # Remove ObjectId for JSON serialization
    if "_id" in report_document:
        report_document["_id"] = str(report_document["_id"])
    for r in report_document["reports"]:
        if "_id" in r:
            r["_id"] = str(r["_id"])

    return report_document

@admin_ai_reports_bp.route('/api/admin/ai-reports', methods=['GET'])
def get_ai_reports():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    
    try:
        if force_refresh:
            doc = generate_ai_report()
            return jsonify({"status": "success", "data": doc})
            
        # Get latest report from DB
        latest = mongo.db.admin_ai_reports.find().sort("created_at", -1).limit(1)
        latest_list = list(latest)
        
        if not latest_list:
            # Generate first report if DB is empty
            doc = generate_ai_report()
            return jsonify({"status": "success", "data": doc})
            
        doc = latest_list[0]
        doc["_id"] = str(doc["_id"])
        
        # Also return history (last 5 reports)
        history_cursor = mongo.db.admin_ai_reports.find().sort("created_at", -1).limit(5)
        history = []
        for h in history_cursor:
            h["_id"] = str(h["_id"])
            history.append(h)
            
        return jsonify({
            "status": "success", 
            "data": doc,
            "history": history
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
