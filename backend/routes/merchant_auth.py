from flask import Blueprint, request, jsonify
from extensions import mongo
import uuid
import datetime
import jwt
from config import Config

merchant_auth_bp = Blueprint('merchant_auth_bp', __name__)

@merchant_auth_bp.route('/merchant/signup', methods=['POST'])
def merchant_signup():
    data = request.json
    shop_name = data.get('shop_name')
    email = data.get('email')
    password = data.get('password')
    category = data.get('category')
    location = data.get('location')

    if not all([shop_name, email, password]):
        return jsonify({"message": "Missing required fields"}), 400

    existing_merchant = mongo.db.merchants.find_one({"email": email})
    if existing_merchant:
        return jsonify({"message": "Merchant email already registered"}), 409

    merchant_id = str(uuid.uuid4())
    new_merchant = {
        "merchant_id": merchant_id,
        "shop_name": shop_name,
        "owner_name": data.get('owner_name', 'Owner'),
        "email": email,
        "password": password,  # Plain text for hackathon MVP
        "category": category,
        "location": location,
        "status": "active",
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    mongo.db.merchants.insert_one(new_merchant)
    
    token = jwt.encode({
        'merchant_id': merchant_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, Config.SECRET_KEY, algorithm='HS256')

    return jsonify({
        "message": "Merchant created successfully",
        "merchant_id": merchant_id,
        "shop_name": shop_name,
        "token": token,
        "role": category
    }), 201


@merchant_auth_bp.route('/merchant/login', methods=['POST'])
def merchant_login():
    data = request.json
    email = data.get('email', 'merchant@nmit.ac.in')
    password = data.get('password', '123456')

    # Mock login bypass for demo
    if email == 'merchant@nmit.ac.in' and password == '123456':
        # Create dummy merchant if not exists
        if not mongo.db.merchants.find_one({"email": email}):
            mongo.db.merchants.insert_one({
                "merchant_id": "demo_merchant_1",
                "shop_name": "Campus Canteen",
                "email": email,
                "password": password,
                "category": "canteen",
                "location": "Main Block"
            })
            
        return jsonify({
            "message": "Login successful",
            "merchant_id": "demo_merchant_1",
            "shop_name": "Campus Canteen",
            "token": "demo_token",
            "role": "canteen"
        })

    merchant = mongo.db.merchants.find_one({"email": email, "password": password})
    if not merchant:
        return jsonify({"message": "Invalid email or password"}), 401

    token = jwt.encode({
        'merchant_id': merchant['merchant_id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, Config.SECRET_KEY, algorithm='HS256')

    return jsonify({
        "message": "Login successful",
        "merchant_id": merchant['merchant_id'],
        "shop_name": merchant['shop_name'],
        "token": token,
        "role": merchant.get('category', 'shop')
    })
