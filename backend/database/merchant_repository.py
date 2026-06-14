"""
Merchant Repository — CRUD operations with bcrypt password security.
"""

import uuid
import datetime
import bcrypt
from extensions import mongo


def _hash_password(password):
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password, hashed):
    """Verify password against bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        # Fallback for plain-text passwords (migration period)
        return password == hashed


def create_merchant(shop_name, email, password, **kwargs):
    """Create a new merchant with bcrypt-hashed password."""
    if mongo.db.merchants.find_one({"email": email}):
        return None, "Merchant email already registered"

    now = datetime.datetime.utcnow()

    merchant = {
        "merchant_id": str(uuid.uuid4()),
        "shop_name": shop_name,
        "owner_name": kwargs.get("owner_name", "Owner"),
        "email": email,
        "password": _hash_password(password),
        "phone": kwargs.get("phone", ""),
        "category": kwargs.get("category", ""),
        "location": kwargs.get("location", ""),
        "address": kwargs.get("address", ""),
        "gstNumber": kwargs.get("gst_number", ""),
        "verificationStatus": "pending",
        "status": "active",
        "created_at": now.isoformat(),
        "updatedAt": now.isoformat(),
    }

    mongo.db.merchants.insert_one(merchant)
    merchant.pop("_id", None)
    safe = {k: v for k, v in merchant.items() if k != "password"}
    return safe, None


def authenticate_merchant(email, password):
    """Authenticate merchant by email and password."""
    merchant = mongo.db.merchants.find_one({"email": email})
    if not merchant:
        return None

    if _verify_password(password, merchant.get("password", "")):
        return merchant
    return None


def get_merchant_by_id(merchant_id):
    """Fetch merchant by ID, excluding password."""
    return mongo.db.merchants.find_one(
        {"merchant_id": merchant_id}, {"_id": 0, "password": 0}
    )


def update_merchant(merchant_id, data):
    """Update merchant fields."""
    data["updatedAt"] = datetime.datetime.utcnow().isoformat()
    result = mongo.db.merchants.update_one(
        {"merchant_id": merchant_id}, {"$set": data}
    )
    return result.modified_count > 0


def soft_delete_merchant(merchant_id):
    """Soft delete a merchant."""
    return mongo.db.merchants.update_one(
        {"merchant_id": merchant_id},
        {"$set": {"deleted_at": datetime.datetime.utcnow().isoformat(), "status": "inactive"}}
    ).modified_count > 0
