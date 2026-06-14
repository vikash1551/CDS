"""
Cart Repository — Per-user cart management.
"""

import datetime
from extensions import mongo


def get_cart(user_id):
    """Get the cart for a user."""
    cart = mongo.db.cart.find_one({"user_id": user_id}, {"_id": 0})
    if not cart:
        return {"user_id": user_id, "items": [], "totalPrice": 0}
    return cart


def add_to_cart(user_id, product_id, name, quantity, price):
    """Add an item to the cart. Updates quantity if item already exists."""
    now = datetime.datetime.utcnow().isoformat()

    cart = mongo.db.cart.find_one({"user_id": user_id})

    if not cart:
        mongo.db.cart.insert_one({
            "user_id": user_id,
            "items": [{"product_id": product_id, "name": name, "quantity": int(quantity), "price": float(price)}],
            "totalPrice": float(price) * int(quantity),
            "updatedAt": now,
        })
        return True

    # Check if item already in cart
    items = cart.get("items", [])
    found = False
    for item in items:
        if item.get("product_id") == product_id:
            item["quantity"] = int(item.get("quantity", 0)) + int(quantity)
            found = True
            break

    if not found:
        items.append({"product_id": product_id, "name": name, "quantity": int(quantity), "price": float(price)})

    total = sum(i.get("price", 0) * i.get("quantity", 1) for i in items)

    mongo.db.cart.update_one(
        {"user_id": user_id},
        {"$set": {"items": items, "totalPrice": round(total, 2), "updatedAt": now}},
    )
    return True


def remove_from_cart(user_id, product_id):
    """Remove an item from the cart."""
    now = datetime.datetime.utcnow().isoformat()

    cart = mongo.db.cart.find_one({"user_id": user_id})
    if not cart:
        return False

    items = [i for i in cart.get("items", []) if i.get("product_id") != product_id]
    total = sum(i.get("price", 0) * i.get("quantity", 1) for i in items)

    mongo.db.cart.update_one(
        {"user_id": user_id},
        {"$set": {"items": items, "totalPrice": round(total, 2), "updatedAt": now}},
    )
    return True


def clear_cart(user_id):
    """Clear all items from the cart."""
    now = datetime.datetime.utcnow().isoformat()
    mongo.db.cart.update_one(
        {"user_id": user_id},
        {"$set": {"items": [], "totalPrice": 0, "updatedAt": now}},
        upsert=True,
    )
    return True
