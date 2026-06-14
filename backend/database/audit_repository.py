"""
Audit Log Repository — Security audit trail for all user actions.
"""

import datetime
from extensions import mongo


def log_action(user_id, action, ip_address="", device_info="", details=None):
    """Log an audit event."""
    mongo.db.audit_logs.insert_one({
        "user_id": user_id,
        "action": action,
        "ip_address": ip_address,
        "device_info": device_info,
        "details": details or {},
        "timestamp": datetime.datetime.utcnow(),
    })


def get_audit_logs(user_id=None, limit=50):
    """Get audit logs, optionally filtered by user."""
    query = {}
    if user_id:
        query["user_id"] = user_id

    logs = list(
        mongo.db.audit_logs.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )

    # Serialize datetimes
    for log in logs:
        if isinstance(log.get("timestamp"), datetime.datetime):
            log["timestamp"] = log["timestamp"].isoformat()

    return logs
