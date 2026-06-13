import uuid
import datetime
from werkzeug.security import generate_password_hash
from app import create_app
from extensions import mongo

def seed_database():
    print("🌱 Starting database seed...")
    app = create_app()
    with app.app_context():
        # Clear existing mock data if needed (uncomment for full reset)
        # mongo.db.users.delete_many({})
        # mongo.db.orders.delete_many({})

        # 1. Seed Users
        if mongo.db.users.count_documents({}) < 5:
            print("Seeding users...")
            users = [
                {
                    "user_id": str(uuid.uuid4()),
                    "email": "sarah@college.edu",
                    "name": "Sarah Jenkins",
                    "password": generate_password_hash("password123"),
                    "xp": 2450,
                    "badges": ["Campus Hero", "Speed Courier"],
                    "created_at": datetime.datetime.utcnow()
                },
                {
                    "user_id": str(uuid.uuid4()),
                    "email": "alex@college.edu",
                    "name": "Alex Student",
                    "password": generate_password_hash("password123"),
                    "xp": 1800,
                    "badges": ["Night Owl"],
                    "created_at": datetime.datetime.utcnow()
                }
            ]
            mongo.db.users.insert_many(users)

        # 2. Seed Mock Past Orders (For Analytics)
        if mongo.db.orders.count_documents({}) < 10:
            print("Seeding past orders...")
            orders = []
            for i in range(10):
                orders.append({
                    "order_id": str(uuid.uuid4()),
                    "order_type": "canteen_delivery" if i % 2 == 0 else "p2p_lend",
                    "item": f"Demo Item {i}",
                    "pickup_name": "Main Canteen" if i % 2 == 0 else "Hostel B",
                    "drop_name": "Library" if i % 2 == 0 else "Exam Hall",
                    "pickup_location": {"type": "Point", "coordinates": [77.59 + (i*0.001), 12.97]},
                    "drop_location": {"type": "Point", "coordinates": [77.60, 12.98]},
                    "priority": "normal" if i % 3 == 0 else "urgent",
                    "status": "completed",
                    "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=i)
                })
            mongo.db.orders.insert_many(orders)
            
        print("✅ Database successfully seeded!")

if __name__ == "__main__":
    seed_database()
