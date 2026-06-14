"""
Database Setup — Schema Validators & Indexes
Runs on app startup to ensure MongoDB collections have proper validation and indexing.
Non-destructive: uses collMod to update existing collections, createCollection for new ones.
"""

from extensions import mongo
import pymongo


def initialize_database():
    """Initialize all collection validators, indexes, and constraints."""
    db = mongo.db
    print("[DB Setup] Initializing MongoDB schema validators and indexes...")

    _setup_users_collection(db)
    _setup_merchants_collection(db)
    _setup_products_collection(db)
    _setup_orders_collection(db)
    _setup_cart_collection(db)
    _setup_wishlist_collection(db)
    _setup_returns_collection(db)
    _setup_notifications_collection(db)
    _setup_analytics_collection(db)
    _setup_audit_logs_collection(db)

    print("[DB Setup] All collections initialized successfully.")


def _ensure_collection(db, name, validator):
    """Create collection with validator if it doesn't exist, or update validator."""
    try:
        db.create_collection(name, validator=validator)
        print(f"  [+] Created collection: {name}")
    except Exception:
        try:
            db.command("collMod", name, validator=validator)
            print(f"  [~] Updated validator: {name}")
        except Exception as e:
            print(f"  [!] Validator skip for {name}: {e}")


# ── Users ─────────────────────────────────────────────────────────

def _setup_users_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["email"],
            "properties": {
                "user_id": {"bsonType": "string", "description": "Unique user identifier"},
                "name": {"bsonType": "string", "description": "Full name"},
                "email": {"bsonType": "string", "description": "Email address"},
                "password": {"bsonType": "string", "description": "Hashed password"},
                "phone": {"bsonType": "string", "description": "Phone number"},
                "role": {
                    "bsonType": "string",
                    "enum": ["user", "merchant", "admin", "student"],
                    "description": "User role",
                },
                "profileImage": {"bsonType": "string"},
                "xp": {"bsonType": "int", "description": "Experience points"},
                "badges": {"bsonType": "array", "items": {"bsonType": "string"}},
                "created_at": {"description": "Creation timestamp"},
                "updatedAt": {"description": "Last update timestamp"},
                "lastLogin": {"description": "Last login timestamp"},
                "deleted_at": {"description": "Soft delete timestamp"},
            },
        }
    }
    _ensure_collection(db, "users", validator)

    db.users.create_index("email", unique=True, sparse=True)
    db.users.create_index("user_id", unique=True, sparse=True)
    print("  [i] Users indexes ready")


# ── Merchants ─────────────────────────────────────────────────────

def _setup_merchants_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["email"],
            "properties": {
                "merchant_id": {"bsonType": "string"},
                "shop_name": {"bsonType": "string", "description": "Business name"},
                "owner_name": {"bsonType": "string"},
                "email": {"bsonType": "string"},
                "phone": {"bsonType": "string"},
                "password": {"bsonType": "string", "description": "Bcrypt hashed password"},
                "category": {"bsonType": "string"},
                "location": {"bsonType": "string"},
                "address": {"bsonType": "string"},
                "gstNumber": {"bsonType": "string"},
                "verificationStatus": {
                    "bsonType": "string",
                    "enum": ["pending", "verified", "rejected"],
                },
                "status": {
                    "bsonType": "string",
                    "enum": ["active", "inactive", "suspended"],
                },
                "created_at": {"description": "Creation timestamp"},
                "updatedAt": {"description": "Last update timestamp"},
                "deleted_at": {"description": "Soft delete timestamp"},
            },
        }
    }
    _ensure_collection(db, "merchants", validator)

    db.merchants.create_index("email", unique=True, sparse=True)
    db.merchants.create_index("merchant_id", unique=True, sparse=True)
    print("  [i] Merchants indexes ready")


# ── Products ──────────────────────────────────────────────────────

def _setup_products_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["merchant_id", "name"],
            "properties": {
                "product_id": {"bsonType": "string"},
                "merchant_id": {"bsonType": "string"},
                "name": {"bsonType": "string", "description": "Product name"},
                "description": {"bsonType": "string"},
                "category": {"bsonType": "string"},
                "brand": {"bsonType": "string"},
                "images": {"bsonType": "array", "items": {"bsonType": "string"}},
                "stock": {"bsonType": "int", "minimum": 0},
                "price": {"bsonType": "number", "minimum": 0},
                "discountPrice": {"bsonType": "number", "minimum": 0},
                "tags": {"bsonType": "array", "items": {"bsonType": "string"}},
                "emoji": {"bsonType": "string"},
                "ETA": {"bsonType": "string"},
                "is_active": {"bsonType": "bool"},
                "status": {
                    "bsonType": "string",
                    "enum": ["active", "inactive", "out_of_stock"],
                },
                "created_at": {"description": "Creation timestamp"},
                "updatedAt": {"description": "Last update timestamp"},
                "deleted_at": {"description": "Soft delete timestamp"},
            },
        }
    }
    _ensure_collection(db, "merchant_products", validator)

    db.merchant_products.create_index("product_id", unique=True, sparse=True)
    db.merchant_products.create_index("merchant_id")
    print("  [i] Products indexes ready")


# ── Orders ────────────────────────────────────────────────────────

def _setup_orders_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "properties": {
                "order_id": {"bsonType": "string"},
                "merchant_id": {"bsonType": "string"},
                "items": {"bsonType": "array"},
                "total_amount": {"bsonType": "number"},
                "status": {
                    "bsonType": "string",
                    "enum": [
                        "pending", "accepted", "preparing",
                        "ready_for_pickup", "picked_up", "on_the_way",
                        "near_you", "delivered", "cancelled",
                    ],
                },
                "delivery_location": {"description": "Delivery address or location name"},
                "pickup_name": {"bsonType": "string"},
                "priority": {"bsonType": "string"},
                "payment_status": {
                    "bsonType": "string",
                    "enum": ["pending", "paid", "refunded", "failed"],
                },
                "tracking_details": {"bsonType": "object"},
                "created_at": {"description": "Creation timestamp"},
                "updatedAt": {"description": "Last update timestamp"},
                "deleted_at": {"description": "Soft delete timestamp"},
            },
        }
    }
    _ensure_collection(db, "merchant_orders", validator)

    db.merchant_orders.create_index("order_id", unique=True, sparse=True)
    db.merchant_orders.create_index("merchant_id")
    db.merchant_orders.create_index("status")
    print("  [i] Orders indexes ready")


# ── Cart ──────────────────────────────────────────────────────────

def _setup_cart_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["user_id"],
            "properties": {
                "user_id": {"bsonType": "string"},
                "items": {
                    "bsonType": "array",
                    "items": {
                        "bsonType": "object",
                        "properties": {
                            "product_id": {"bsonType": "string"},
                            "name": {"bsonType": "string"},
                            "quantity": {"bsonType": "int", "minimum": 1},
                            "price": {"bsonType": "number"},
                        },
                    },
                },
                "totalPrice": {"bsonType": "number"},
                "updatedAt": {"description": "Last update timestamp"},
            },
        }
    }
    _ensure_collection(db, "cart", validator)

    db.cart.create_index("user_id", unique=True)
    print("  [i] Cart indexes ready")


# ── Wishlist ──────────────────────────────────────────────────────

def _setup_wishlist_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["user_id"],
            "properties": {
                "user_id": {"bsonType": "string"},
                "products": {
                    "bsonType": "array",
                    "items": {
                        "bsonType": "object",
                        "properties": {
                            "product_id": {"bsonType": "string"},
                            "name": {"bsonType": "string"},
                            "added_at": {"description": "When added"},
                        },
                    },
                },
                "created_at": {"description": "Creation timestamp"},
            },
        }
    }
    _ensure_collection(db, "wishlist", validator)

    db.wishlist.create_index("user_id", unique=True)
    print("  [i] Wishlist indexes ready")


# ── Returns ───────────────────────────────────────────────────────

def _setup_returns_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["order_id", "user_id", "reason"],
            "properties": {
                "return_id": {"bsonType": "string"},
                "order_id": {"bsonType": "string"},
                "user_id": {"bsonType": "string"},
                "reason": {"bsonType": "string"},
                "images": {"bsonType": "array", "items": {"bsonType": "string"}},
                "status": {
                    "bsonType": "string",
                    "enum": ["pending", "approved", "rejected", "completed"],
                },
                "fraudScore": {"bsonType": "number", "minimum": 0, "maximum": 1},
                "created_at": {"description": "Creation timestamp"},
            },
        }
    }
    _ensure_collection(db, "returns", validator)

    db.returns.create_index("return_id", unique=True, sparse=True)
    db.returns.create_index("order_id")
    db.returns.create_index("user_id")
    print("  [i] Returns indexes ready")


# ── Notifications ─────────────────────────────────────────────────

def _setup_notifications_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["user_id", "message"],
            "properties": {
                "notification_id": {"bsonType": "string"},
                "user_id": {"bsonType": "string"},
                "title": {"bsonType": "string"},
                "type": {"bsonType": "string"},
                "message": {"bsonType": "string"},
                "read": {"bsonType": "bool"},
                "created_at": {"description": "Creation timestamp"},
            },
        }
    }
    _ensure_collection(db, "notifications", validator)

    db.notifications.create_index("user_id")
    db.notifications.create_index("notification_id", sparse=True)
    print("  [i] Notifications indexes ready")


# ── Analytics ─────────────────────────────────────────────────────

def _setup_analytics_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["merchant_id"],
            "properties": {
                "merchant_id": {"bsonType": "string"},
                "product_views": {"bsonType": "object"},
                "clicks": {"bsonType": "object"},
                "purchases": {"bsonType": "object"},
                "stock_history": {"bsonType": "array"},
                "demand_prediction": {"bsonType": "object"},
                "updatedAt": {"description": "Last update timestamp"},
            },
        }
    }
    _ensure_collection(db, "analytics", validator)

    db.analytics.create_index("merchant_id", unique=True, sparse=True)
    print("  [i] Analytics indexes ready")


# ── Audit Logs ────────────────────────────────────────────────────

def _setup_audit_logs_collection(db):
    validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["action"],
            "properties": {
                "user_id": {"bsonType": "string"},
                "action": {"bsonType": "string"},
                "ip_address": {"bsonType": "string"},
                "device_info": {"bsonType": "string"},
                "details": {"bsonType": "object"},
                "timestamp": {"description": "Action timestamp"},
            },
        }
    }
    _ensure_collection(db, "audit_logs", validator)

    db.audit_logs.create_index("user_id")
    db.audit_logs.create_index([("timestamp", pymongo.DESCENDING)])
    print("  [i] Audit logs indexes ready")
