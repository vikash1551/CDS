from extensions import mongo, socketio
import uuid
import datetime

def create_notification(user_id, event_type, message):
    """
    Create a notification: store in MongoDB AND broadcast via Socket.IO.
    This powers both the REST API and realtime toast notifications.
    """
    now = datetime.datetime.utcnow()
    notification = {
        "notification_id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": event_type,
        "message": message,
        "read": False,
        "created_at": now
    }

    # Store in MongoDB for persistence (datetime is fine for Mongo)
    mongo.db.notifications.insert_one(notification)
    notification.pop('_id', None)

    # Convert datetime for JSON/Socket.IO serialization
    notification["created_at"] = now.isoformat()

    # Broadcast via Socket.IO for realtime frontend toast
    socketio.emit('notification', notification)

    return notification


def send_notification(event_type, message, user_id="broadcast"):
    """
    Backwards-compatible wrapper for existing code that calls send_notification.
    """
    return create_notification(user_id, event_type, message)
