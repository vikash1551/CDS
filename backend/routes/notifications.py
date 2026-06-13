from flask import Blueprint, request, jsonify
from extensions import mongo

notifications_bp = Blueprint('notifications_bp', __name__)

@notifications_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Get notifications for a user (supports localStorage-compatible flow)."""
    user_id = request.args.get('user_id', 'demo_user')
    limit = int(request.args.get('limit', 20))

    notifs = list(mongo.db.notifications.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit))

    # Count unread
    unread_count = mongo.db.notifications.count_documents({
        "user_id": user_id,
        "read": False
    })

    return jsonify({
        "notifications": notifs,
        "unread_count": unread_count
    })


@notifications_bp.route('/notifications/read', methods=['POST'])
def mark_read():
    """Mark notifications as read."""
    data = request.json
    user_id = data.get('user_id', 'demo_user')
    notification_id = data.get('notification_id')

    if notification_id:
        # Mark a single notification as read
        mongo.db.notifications.update_one(
            {"notification_id": notification_id},
            {"$set": {"read": True}}
        )
    else:
        # Mark all as read
        mongo.db.notifications.update_many(
            {"user_id": user_id},
            {"$set": {"read": True}}
        )

    return jsonify({"message": "Notifications marked as read"})
