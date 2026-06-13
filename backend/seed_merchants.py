from app import create_app
from extensions import mongo
import datetime
import uuid

def seed_merchants():
    app = create_app()
    with app.app_context():
        # Clear existing
        mongo.db.merchants.delete_many({})
        mongo.db.merchant_products.delete_many({})
        mongo.db.merchant_orders.delete_many({})
        
        merchants = [
            {
                "merchant_id": "demo_merchant_1",
                "shop_name": "Campus Canteen",
                "owner_name": "Arjun",
                "email": "canteen@nmit.ac.in",
                "password": "123456",
                "category": "canteen",
                "location": "Main Block",
                "status": "active",
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "merchant_id": "demo_merchant_2",
                "shop_name": "NMIT Xerox Shop",
                "owner_name": "Kumar",
                "email": "print@nmit.ac.in",
                "password": "123456",
                "category": "print_store",
                "location": "Library Block",
                "status": "active",
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "merchant_id": "demo_merchant_3",
                "shop_name": "Juice Corner",
                "owner_name": "Neha",
                "email": "juice@nmit.ac.in",
                "password": "123456",
                "category": "snack_center",
                "location": "Hostel Block",
                "status": "active",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
        ]
        
        mongo.db.merchants.insert_many(merchants)
        
        products = [
            {
                "product_id": str(uuid.uuid4()),
                "merchant_id": "demo_merchant_1",
                "name": "Maggie",
                "category": "Food",
                "price": 30,
                "stock": 50,
                "ETA": "5 mins",
                "is_active": True,
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "product_id": str(uuid.uuid4()),
                "merchant_id": "demo_merchant_1",
                "name": "Veg Puff",
                "category": "Snacks",
                "price": 25,
                "stock": 40,
                "ETA": "2 mins",
                "is_active": True,
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "product_id": str(uuid.uuid4()),
                "merchant_id": "demo_merchant_3",
                "name": "Cold Coffee",
                "category": "Beverages",
                "price": 40,
                "stock": 100,
                "ETA": "5 mins",
                "is_active": True,
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "product_id": str(uuid.uuid4()),
                "merchant_id": "demo_merchant_2",
                "name": "Notebook",
                "category": "Stationery",
                "price": 50,
                "stock": 100,
                "ETA": "1 mins",
                "is_active": True,
                "created_at": datetime.datetime.utcnow().isoformat()
            }
        ]
        
        mongo.db.merchant_products.insert_many(products)
        
        orders = [
            {
                "order_id": str(uuid.uuid4()),
                "merchant_id": "demo_merchant_1",
                "customer_name": "Vikash",
                "items": [{"name": "Maggie", "qty": 2}],
                "total_amount": 60,
                "status": "pending",
                "created_at": datetime.datetime.utcnow().isoformat()
            },
            {
                "order_id": str(uuid.uuid4()),
                "merchant_id": "demo_merchant_1",
                "customer_name": "Riya",
                "items": [{"name": "Veg Puff", "qty": 1}],
                "total_amount": 25,
                "status": "preparing",
                "created_at": datetime.datetime.utcnow().isoformat()
            }
        ]
        
        mongo.db.merchant_orders.insert_many(orders)
        
        print("Database seeded with mock merchants, products, and orders!")

if __name__ == "__main__":
    seed_merchants()
