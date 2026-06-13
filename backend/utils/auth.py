import jwt
from functools import wraps
from flask import request, jsonify
from config import Config
from extensions import mongo

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Get token from Authorization header (e.g., "Bearer <token>")
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = mongo.db.users.find_one({"user_id": data['user_id']}, {"_id": 0, "password": 0})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated
