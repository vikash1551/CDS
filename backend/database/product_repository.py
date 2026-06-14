"""
Product Repository — CRUD with soft delete support.
"""

import uuid
import datetime
from extensions import mongo


def create_product(merchant_id, name, **kwargs):
    """Create a new product."""
    now = datetime.datetime.utcnow().isoformat()

    product = {
        "product_id": str(uuid.uuid4()),
        "merchant_id": merchant_id,
        "name": name,
        "description": kwargs.get("description", ""),
        "category": kwargs.get("category", "general"),
        "brand": kwargs.get("brand", ""),
        "images": kwargs.get("images", []),
        "stock": int(kwargs.get("stock", 0)),
        "price": float(kwargs.get("price", 0)),
        "discountPrice": float(kwargs.get("discount_price", 0)),
        "tags": kwargs.get("tags", []),
        "emoji": kwargs.get("emoji", "📦"),
        "ETA": kwargs.get("eta", "10 mins"),
        "is_active": True,
        "status": "active",
        "created_at": now,
        "updatedAt": now,
    }

    mongo.db.merchant_products.insert_one(product)
    product.pop("_id", None)
    return product


def get_products_by_merchant(merchant_id, include_deleted=False):
    """Get all products for a merchant."""
    query = {"merchant_id": merchant_id}
    if not include_deleted:
        query["deleted_at"] = {"$exists": False}
    return list(mongo.db.merchant_products.find(query, {"_id": 0}))


def get_product_by_id(product_id):
    """Get a single product by ID."""
    return mongo.db.merchant_products.find_one(
        {"product_id": product_id, "deleted_at": {"$exists": False}}, {"_id": 0}
    )


def update_product(product_id, data):
    """Update product fields."""
    data["updatedAt"] = datetime.datetime.utcnow().isoformat()
    result = mongo.db.merchant_products.update_one(
        {"product_id": product_id}, {"$set": data}
    )
    return result.modified_count > 0


def soft_delete_product(product_id):
    """Soft delete a product."""
    return mongo.db.merchant_products.update_one(
        {"product_id": product_id},
        {"$set": {
            "deleted_at": datetime.datetime.utcnow().isoformat(),
            "is_active": False,
            "status": "inactive",
        }}
    ).modified_count > 0
