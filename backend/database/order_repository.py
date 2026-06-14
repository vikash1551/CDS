"""
Order Repository — CRUD operations for merchant_orders.
"""

import datetime
from extensions import mongo


def get_order_by_id(order_id):
    """Get a single order by ID."""
    return mongo.db.merchant_orders.find_one(
        {"order_id": order_id}, {"_id": 0}
    )


def get_orders_by_user(user_id, limit=20):
    """Get orders placed by or assigned to a user."""
    return list(
        mongo.db.merchant_orders.find(
            {"$or": [{"requester_id": user_id}, {"courier_id": user_id}]},
            {"_id": 0},
        )
        .sort("created_at", -1)
        .limit(limit)
    )


def get_orders_by_merchant(merchant_id, status=None, limit=50):
    """Get orders for a merchant, optionally filtered by status."""
    query = {"merchant_id": merchant_id}
    if status:
        query["status"] = status
    return list(
        mongo.db.merchant_orders.find(query, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )


def update_order_status(order_id, status):
    """Update the status of an order."""
    return mongo.db.merchant_orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": status,
            f"{status}_at": datetime.datetime.utcnow().isoformat(),
            "updatedAt": datetime.datetime.utcnow().isoformat(),
        }}
    ).modified_count > 0


def soft_delete_order(order_id):
    """Soft delete an order."""
    return mongo.db.merchant_orders.update_one(
        {"order_id": order_id},
        {"$set": {"deleted_at": datetime.datetime.utcnow().isoformat()}}
    ).modified_count > 0
