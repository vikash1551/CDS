from flask import Blueprint, request, jsonify
from extensions import mongo, socketio
from flask_socketio import join_room, leave_room, emit
import datetime

chat_bp = Blueprint('chat_bp', __name__)


@chat_bp.route('/chat/history/<room_id>', methods=['GET'])
def get_chat_history(room_id):
    """Fetch chat history for a specific room."""
    messages = list(
        mongo.db.chat_messages.find(
            {"room_id": room_id},
            {"_id": 0}
        ).sort("timestamp", 1).limit(100)
    )

    # Convert datetimes to strings
    for msg in messages:
        if isinstance(msg.get('timestamp'), datetime.datetime):
            msg['timestamp'] = msg['timestamp'].isoformat()

    return jsonify({"messages": messages, "room_id": room_id})


@chat_bp.route('/chat/send', methods=['POST'])
def send_message_rest():
    """REST fallback for sending a chat message (non-socket clients)."""
    data = request.json
    room_id = data.get('room_id')
    text = data.get('text', '')
    sender = data.get('sender', 'anonymous')

    if not room_id or not text.strip():
        return jsonify({"error": "room_id and text are required"}), 400

    message = {
        "room_id": room_id,
        "text": text.strip(),
        "sender": sender,
        "timestamp": datetime.datetime.utcnow()
    }

    mongo.db.chat_messages.insert_one(message)
    message['_id'] = str(message['_id'])
    message['timestamp'] = message['timestamp'].isoformat()

    # Also emit via socket so any live listeners get it
    socketio.emit('new_message', message, to=room_id)

    return jsonify({"message": message}), 201


# ─── Socket.IO Chat Events ──────────────────────────────────────

@socketio.on('join_chat')
def handle_join_chat(data):
    """Join a chat room by room_id."""
    room_id = data.get('room_id')
    user = data.get('user', 'Anonymous')
    if room_id:
        join_room(room_id)
        emit('chat_joined', {
            'room_id': room_id,
            'message': f'{user} joined the chat'
        }, to=room_id)


@socketio.on('leave_chat')
def handle_leave_chat(data):
    """Leave a chat room."""
    room_id = data.get('room_id')
    user = data.get('user', 'Anonymous')
    if room_id:
        leave_room(room_id)
        emit('chat_left', {
            'room_id': room_id,
            'message': f'{user} left the chat'
        }, to=room_id)


@socketio.on('chat_message')
def handle_chat_message(data):
    """Handle incoming chat message via WebSocket."""
    room_id = data.get('room_id')
    text = data.get('text', '')
    sender = data.get('sender', 'Anonymous')

    if not room_id or not text.strip():
        return

    message = {
        "room_id": room_id,
        "text": text.strip(),
        "sender": sender,
        "timestamp": datetime.datetime.utcnow()
    }

    # Persist to MongoDB
    mongo.db.chat_messages.insert_one(message)
    message['_id'] = str(message['_id'])
    message['timestamp'] = message['timestamp'].isoformat()

    # Broadcast to all room members
    emit('new_message', message, to=room_id)
