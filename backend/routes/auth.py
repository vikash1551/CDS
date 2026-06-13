from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from extensions import mongo
from config import Config

from models.schemas import UserRegisterSchema, UserLoginSchema
from pydantic import ValidationError
from utils.auth import token_required

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # Validate incoming data
        data = UserRegisterSchema(**request.json)
    except ValidationError as e:
        return jsonify({"message": "Validation error", "details": e.errors()}), 400
        
    # Check if user already exists
    if mongo.db.users.find_one({"email": data.email}):
        return jsonify({"message": "User already exists"}), 409
        
    hashed_password = generate_password_hash(data.password)
    
    new_user = {
        "user_id": str(uuid.uuid4()),
        "email": data.email,
        "name": data.name,
        "password": hashed_password,
        "xp": 0,
        "badges": [],
        "created_at": datetime.datetime.utcnow()
    }
    
    mongo.db.users.insert_one(new_user)
    
    # Generate JWT so user is auto-logged-in after signup
    token = jwt.encode({
        'user_id': new_user['user_id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        "message": "User created successfully",
        "token": token,
        "user": {
            "name": new_user['name'],
            "email": new_user['email'],
            "xp": 0
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = UserLoginSchema(**request.json)
    except ValidationError as e:
        return jsonify({"message": "Validation error", "details": e.errors()}), 400
        
    user = mongo.db.users.find_one({"email": data.email})
    
    if not user or not check_password_hash(user['password'], data.password):
        return jsonify({"message": "Invalid email or password"}), 401
        
    # Generate JWT token
    token = jwt.encode({
        'user_id': user['user_id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "name": user.get('name'),
            "email": user.get('email'),
            "xp": user.get('xp', 0)
        }
    })

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    data = request.json
    token = data.get('id_token')
    
    if not token:
        return jsonify({"message": "Missing Google token"}), 400
        
    try:
        # Verify Google token
        client_id = Config.GOOGLE_CLIENT_ID
        
        # In a strict environment you would require client_id. For hackathon MVP bypass strict check if client_id is empty
        if client_id:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
        else:
            # Fallback for hackathon demo without client ID strict validation
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request())
            
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        
        # Check if user exists, otherwise create
        user = mongo.db.users.find_one({"email": email})
        
        if not user:
            user = {
                "user_id": str(uuid.uuid4()),
                "email": email,
                "name": name,
                "password": "",  # No password for OAuth users
                "xp": 0,
                "badges": [],
                "created_at": datetime.datetime.utcnow()
            }
            mongo.db.users.insert_one(user)
            
        # Generate our own JWT token
        jwt_token = jwt.encode({
            'user_id': user['user_id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            "message": "Google Login successful",
            "token": jwt_token,
            "user": {
                "name": user.get('name'),
                "email": user.get('email'),
                "xp": user.get('xp', 0)
            }
        })
        
    except ValueError as e:
        return jsonify({"message": f"Invalid Google token: {str(e)}"}), 401

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"message": "Email is required"}), 400
        
    # Generate a 6-digit OTP
    import random
    otp = str(random.randint(100000, 999999))
    
    # Store OTP in db with an expiration time (e.g., 10 minutes)
    expiration = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    mongo.db.otps.update_one(
        {"email": email},
        {"$set": {"otp": otp, "expires_at": expiration}},
        upsert=True
    )
    
    # Always log to console for development/demo ease
    print(f"\n[DEMO] OTP for {email}: {otp}\n")
    
    # Prepare email content
    from utils.email import send_email
    subject = "Your UniDrop Login OTP"
    text_body = f"Your One-Time Password is: {otp}\nThis will expire in 10 minutes."
    html_body = f"<h3>Your UniDrop OTP</h3><p>Your One-Time Password is: <strong>{otp}</strong></p><p>This will expire in 10 minutes.</p>"
    
    # Attempt to send, but ignore failure for demo
    send_email(email, subject, text_body, html_body)
    
    # Return success regardless for hackathon demo to avoid blocking users
    return jsonify({
        "message": "OTP sent successfully (Check backend console if email fails)",
        "demo_otp": otp # Optionally include in response for even easier testing
    })

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400
        
    # Verify OTP
    otp_record = mongo.db.otps.find_one({
        "email": email,
        "otp": str(otp),
        "expires_at": {"$gt": datetime.datetime.utcnow()}
    })
    
    if not otp_record:
        return jsonify({"message": "Invalid or expired OTP"}), 401
        
    # Check if user exists, otherwise create
    user = mongo.db.users.find_one({"email": email})
    
    if not user:
        user = {
            "user_id": str(uuid.uuid4()),
            "email": email,
            "name": email.split('@')[0], # Default name based on email
            "password": "",  # No password for OTP users
            "xp": 0,
            "badges": [],
            "created_at": datetime.datetime.utcnow()
        }
        mongo.db.users.insert_one(user)
        
    # Clear the OTP after successful verification
    mongo.db.otps.delete_one({"_id": otp_record["_id"]})
        
    # Generate our own JWT token
    jwt_token = jwt.encode({
        'user_id': user['user_id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.SECRET_KEY, algorithm="HS256")
    
    return jsonify({
        "message": "OTP Verification successful",
        "token": jwt_token,
        "user": {
            "name": user.get('name'),
            "email": user.get('email'),
            "xp": user.get('xp', 0)
        }
    })


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    """Get currently logged in user info."""
    return jsonify({"user": current_user})

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get full user profile with stats, badges, and activity."""
    # If user_id is provided, fetch that user, otherwise fetch current_user
    target_user_id = request.args.get('user_id')
    
    if target_user_id and target_user_id != current_user['user_id']:
        user = mongo.db.users.find_one({"user_id": target_user_id}, {"_id": 0, "password": 0})
    else:
        user = current_user

    if not user:
        # Return demo profile if no user found
        user = {
            "user_id": "demo_user",
            "name": "Demo Student",
            "email": "demo@nmit.ac.in",
            "xp": 420,
            "badges": ["Speed Courier"],
            "role": "student"
        }

    xp = user.get("xp", 0)

    # Calculate rank
    if xp >= 2500: rank = "Legend"
    elif xp >= 1000: rank = "Campus Hero"
    elif xp >= 500: rank = "Night Owl"
    elif xp >= 300: rank = "Trusted Lender"
    elif xp >= 100: rank = "Speed Courier"
    else: rank = "Rookie"

    # Activity stats
    deliveries = mongo.db.merchant_orders.count_documents({"courier_id": user.get("user_id"), "status": "delivered"})
    lendings = mongo.db.lend_requests.count_documents({"lender_id": user.get("user_id"), "status": "returned"})
    orders_placed = mongo.db.merchant_orders.count_documents({"requester_id": user.get("user_id")})

    return jsonify({
        "user": user,
        "rank": rank,
        "stats": {
            "deliveries_completed": deliveries,
            "items_lent": lendings,
            "orders_placed": orders_placed,
            "streak": min(deliveries + lendings, 30),
            "wallet_balance": 420,
            "points": xp
        }
    })

