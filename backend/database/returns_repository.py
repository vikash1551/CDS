"""
Returns Repository — Product return requests with fraud scoring.
"""

import uuid
import datetime
from extensions import mongo


def create_return(order_id, user_id, reason, images=None):
    """Create a new return request."""
    now = datetime.datetime.utcnow().isoformat()

    return_doc = {
        "return_id": str(uuid.uuid4()),
        "order_id": order_id,
        "user_id": user_id,
        "reason": reason,
        "images": images or [],
        "status": "pending",
        "fraudScore": 0.0,
        "created_at": now,
    }

    mongo.db.returns.insert_one(return_doc)
    return_doc.pop("_id", None)
    return return_doc


def get_returns_by_user(user_id, limit=20):
    """Get return requests for a user."""
    return list(
        mongo.db.returns.find({"user_id": user_id}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )


def get_return_by_id(return_id):
    """Get a single return by ID."""
    return mongo.db.returns.find_one({"return_id": return_id}, {"_id": 0})


def update_return_status(return_id, status, fraud_score=None):
    """Update return status and optionally fraud score."""
    update = {"status": status}
    if fraud_score is not None:
        update["fraudScore"] = float(fraud_score)

    return mongo.db.returns.update_one(
        {"return_id": return_id}, {"$set": update}
    ).modified_count > 0
