"""
Wishlist Repository — Per-user wishlist management.
"""

import datetime
from extensions import mongo


def get_wishlist(user_id):
    """Get the wishlist for a user."""
    wishlist = mongo.db.wishlist.find_one({"user_id": user_id}, {"_id": 0})
    if not wishlist:
        return {"user_id": user_id, "products": []}
    return wishlist


def add_to_wishlist(user_id, product_id, name=""):
    """Add a product to the wishlist."""
    wishlist = mongo.db.wishlist.find_one({"user_id": user_id})
    now = datetime.datetime.utcnow().isoformat()

    item = {"product_id": product_id, "name": name, "added_at": now}

    if not wishlist:
        mongo.db.wishlist.insert_one({
            "user_id": user_id,
            "products": [item],
            "created_at": now,
        })
        return True

    # Check if already in wishlist
    products = wishlist.get("products", [])
    if any(p.get("product_id") == product_id for p in products):
        return False  # Already exists

    products.append(item)
    mongo.db.wishlist.update_one(
        {"user_id": user_id}, {"$set": {"products": products}}
    )
    return True


def remove_from_wishlist(user_id, product_id):
    """Remove a product from the wishlist."""
    wishlist = mongo.db.wishlist.find_one({"user_id": user_id})
    if not wishlist:
        return False

    products = [p for p in wishlist.get("products", []) if p.get("product_id") != product_id]
    mongo.db.wishlist.update_one(
        {"user_id": user_id}, {"$set": {"products": products}}
    )
    return True
