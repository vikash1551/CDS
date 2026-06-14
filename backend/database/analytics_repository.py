"""
Analytics Repository — Track product views, clicks, purchases per merchant.
"""

import datetime
from extensions import mongo


def track_product_view(merchant_id, product_id):
    """Increment view count for a product."""
    now = datetime.datetime.utcnow().isoformat()
    mongo.db.analytics.update_one(
        {"merchant_id": merchant_id},
        {
            "$inc": {f"product_views.{product_id}": 1},
            "$set": {"updatedAt": now},
        },
        upsert=True,
    )


def track_click(merchant_id, product_id):
    """Increment click count for a product."""
    now = datetime.datetime.utcnow().isoformat()
    mongo.db.analytics.update_one(
        {"merchant_id": merchant_id},
        {
            "$inc": {f"clicks.{product_id}": 1},
            "$set": {"updatedAt": now},
        },
        upsert=True,
    )


def track_purchase(merchant_id, product_id, quantity=1):
    """Increment purchase count for a product."""
    now = datetime.datetime.utcnow().isoformat()
    mongo.db.analytics.update_one(
        {"merchant_id": merchant_id},
        {
            "$inc": {f"purchases.{product_id}": quantity},
            "$set": {"updatedAt": now},
            "$push": {
                "stock_history": {
                    "product_id": product_id,
                    "quantity": quantity,
                    "type": "purchase",
                    "timestamp": now,
                }
            },
        },
        upsert=True,
    )


def get_analytics(merchant_id):
    """Get analytics data for a merchant."""
    data = mongo.db.analytics.find_one(
        {"merchant_id": merchant_id}, {"_id": 0}
    )
    if not data:
        return {
            "merchant_id": merchant_id,
            "product_views": {},
            "clicks": {},
            "purchases": {},
            "stock_history": [],
        }
    return data
