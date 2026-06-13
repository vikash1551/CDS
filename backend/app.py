import certifi
from gevent import monkey
monkey.patch_all()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_pymongo import PyMongo

from config import Config

from extensions import mongo, socketio

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Initialize plugins
    mongo.init_app(app, tlsCAFile=certifi.where())
    socketio.init_app(app, cors_allowed_origins="*", async_mode='gevent')
    
    with app.app_context():
        from services.matching import initialize_geospatial_indexes
        initialize_geospatial_indexes()
    
    # Register blueprints (Lazy loaded to avoid circular imports)
    from routes.orders import orders_bp
    from routes.tracking import tracking_bp
    from routes.ai import ai_bp
    from routes.delivery import delivery_bp
    from routes.rewards import rewards_bp
    from routes.auth import auth_bp
    from routes.lending import lending_bp
    from routes.notifications import notifications_bp
    from routes.chat import chat_bp
    
    # Merchant Blueprints
    from routes.merchant_auth import merchant_auth_bp
    from routes.merchant_products import merchant_products_bp
    from routes.merchant_orders import merchant_orders_bp
    from routes.merchant_analytics import merchant_analytics_bp
    
    app.register_blueprint(orders_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(delivery_bp)
    app.register_blueprint(rewards_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(lending_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(chat_bp)
    
    # Register merchant blueprints
    app.register_blueprint(merchant_auth_bp)
    app.register_blueprint(merchant_products_bp)
    app.register_blueprint(merchant_orders_bp)
    app.register_blueprint(merchant_analytics_bp)
    
    # Global Error Handler to ensure the frontend never receives HTML error pages
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({
            "status": "error",
            "message": str(e),
            "type": e.__class__.__name__
        }), getattr(e, 'code', 500)

    @app.route('/')
    def home():
        return jsonify({
            "app": "UniDrop",
            "tagline": "Powered by Students. Optimized by AI.",
            "status": "running",
            "version": "1.0.0-hackathon",
            "features": [
                "Campus Quick Commerce",
                "Student Lending Marketplace",
                "AI-Powered Matching",
                "Realtime Tracking",
                "Gamification & Rewards"
            ]
        })

    @app.route('/test-db')
    def test_db():
        try:
            mongo.db.test.insert_one({"message": "MongoDB Connected"})
            return jsonify({"status": "success", "message": "Database Connected"})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @app.route('/analytics')
    def analytics():
        # Pull real counts from MongoDB where possible
        try:
            total_deliveries = mongo.db.orders.count_documents({"status": "completed"})
            pending_orders = mongo.db.orders.count_documents({"status": "pending"})
            active_lends = mongo.db.lend_requests.count_documents({"status": {"$in": ["pending", "matched", "handed_over"]}})
            total_users = mongo.db.users.count_documents({})
        except Exception:
            total_deliveries = 0
            pending_orders = 0
            active_lends = 0
            total_users = 0

        return jsonify({
            "total_users": total_users,
            "deliveries_completed": total_deliveries,
            "pending_orders": pending_orders,
            "active_lending": active_lends,
            "active_couriers": max(total_users // 3, 5),
            "avg_eta_mins": 6,
            "hotspot_locations": [
                {"name": "Canteen", "orders": 45},
                {"name": "Library", "orders": 38},
                {"name": "Hostel Block A", "orders": 29},
                {"name": "Main Gate", "orders": 22}
            ],
            "co2_saved_kg": round(total_deliveries * 0.42, 1),
            "platform": "UniDrop"
        })

    return app

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True, use_reloader=False, host='0.0.0.0', port=5001, allow_unsafe_werkzeug=True)