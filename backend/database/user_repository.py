"""
User Repository — CRUD operations for the users collection.
"""

import uuid
import datetime
from extensions import mongo
from werkzeug.security import generate_password_hash, check_password_hash


def create_user(email, name, password="", phone="", role="user", profile_image=""):
    """Create a new user with hashed password and timestamps."""
    if mongo.db.users.find_one({"email": email}):
        return None, "User already exists"

    hashed = generate_password_hash(password) if password else ""
    now = datetime.datetime.utcnow()

    user = {
        "user_id": str(uuid.uuid4()),
        "email": email,
        "name": name,
        "password": hashed,
        "phone": phone,
        "role": role,
        "profileImage": profile_image,
        "xp": 0,
        "badges": [],
        "created_at": now,
        "updatedAt": now,
        "lastLogin": now,
    }

    mongo.db.users.insert_one(user)
    user.pop("_id", None)
    user.pop("password", None)
    return user, None


def get_user_by_email(email):
    """Fetch user by email. Returns full document including password hash."""
    return mongo.db.users.find_one({"email": email})


def get_user_by_id(user_id):
    """Fetch user by user_id, excluding password."""
    return mongo.db.users.find_one(
        {"user_id": user_id}, {"_id": 0, "password": 0}
    )


def update_user(user_id, data):
    """Update user fields. Sets updatedAt automatically."""
    data["updatedAt"] = datetime.datetime.utcnow()
    result = mongo.db.users.update_one(
        {"user_id": user_id}, {"$set": data}
    )
    return result.modified_count > 0


def update_last_login(user_id):
    """Update lastLogin timestamp."""
    mongo.db.users.update_one(
        {"user_id": user_id},
        {"$set": {"lastLogin": datetime.datetime.utcnow()}}
    )


def verify_password(user, password):
    """Verify a user's password against the stored hash."""
    stored = user.get("password", "")
    if not stored:
        return False
    return check_password_hash(stored, password)
