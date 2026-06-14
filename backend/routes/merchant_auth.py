from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mongo
import uuid
import datetime
import jwt
import random
from config import Config
import os

merchant_auth_bp = Blueprint('merchant_auth_bp', __name__)

# Rejected personal email domains (non-institutional)
PERSONAL_DOMAINS = {
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'protonmail.com', 'aol.com', 'live.com',
    'rediffmail.com', 'ymail.com'
}

def is_personal_email(email: str) -> bool:
    domain = email.lower().split('@')[-1] if '@' in email else ''
    return domain in PERSONAL_DOMAINS


@merchant_auth_bp.route('/merchant/signup', methods=['POST'])
def merchant_signup():
    """Legacy direct signup — kept for compatibility."""
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
    hashed = generate_password_hash(password)
    new_merchant = {
        "merchant_id": merchant_id,
        "shop_name": shop_name,
        "owner_name": data.get('owner_name', 'Owner'),
        "email": email,
        "password": hashed,
        "category": category,
        "location": location,
        "status": "active",
        "approval_status": "approved",
        "email_verified": True,
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


@merchant_auth_bp.route('/merchant/send-otp', methods=['POST'])
def merchant_send_otp():
    """Send OTP for merchant email verification. Stores pending registration data."""
    data = request.json
    email = data.get('email')
    shop_name = data.get('shop_name')
    password = data.get('password')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    # Reject personal email providers
    if is_personal_email(email):
        return jsonify({
            "message": "Please use an institution-approved merchant email address.",
            "error": "personal_email_rejected"
        }), 400

    otp = str(random.randint(100000, 999999))
    expiration = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

    update_fields = {
        "otp": otp,
        "expires_at": expiration,
        "type": "merchant"
    }
    if shop_name:
        update_fields["pending_shop_name"] = shop_name
    if password:
        update_fields["pending_password"] = password

    mongo.db.otps.update_one(
        {"email": email},
        {"$set": update_fields},
        upsert=True
    )

    print(f"\n[DEMO] Merchant OTP for {email}: {otp}\n")

    try:
        from utils.email import send_email
        subject = "UniDrop Merchant Verification Code"
        text_body = f"Your merchant verification code is: {otp}\nThis will expire in 10 minutes."
        html_body = (
            f"<h3>UniDrop Merchant Verification</h3>"
            f"<p>Your verification code is: <strong>{otp}</strong></p>"
            f"<p>This will expire in 10 minutes.</p>"
        )
        send_email(email, subject, text_body, html_body)
        return jsonify({"message": "OTP sent to your merchant email"})
    except Exception as e:
        print(f"[WARN] Merchant email sending failed: {e}")
        return jsonify({
            "message": "Email sending failed. Showing demo OTP.",
            "demo_otp": otp
        })


@merchant_auth_bp.route('/merchant/verify-otp', methods=['POST'])
def merchant_verify_otp():
    """
    Verify merchant OTP, create the merchant account as approved,
    and immediately issue a JWT token for dashboard access.
    """
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    shop_name_override = data.get('shop_name')
    password_override = data.get('password')

    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400

    print(f"[DEBUG merchant_verify_otp] email={email}, otp={otp}")

    otp_record = mongo.db.otps.find_one({
        "email": email,
        "otp": str(otp),
        "expires_at": {"$gt": datetime.datetime.utcnow()}
    })

    if not otp_record:
        return jsonify({"message": "Invalid or expired verification code"}), 401

    resolved_shop = shop_name_override or otp_record.get('pending_shop_name') or 'My Store'
    resolved_password = password_override or otp_record.get('pending_password') or ''

    # Check if merchant already exists
    existing = mongo.db.merchants.find_one({"email": email})
    if existing:
        # Already registered — update email_verified and ensure approved
        mongo.db.merchants.update_one(
            {"email": email},
            {"$set": {"email_verified": True, "approval_status": "approved"}}
        )
        merchant = mongo.db.merchants.find_one({"email": email})
    else:
        # Create merchant and immediately approve
        merchant_id = str(uuid.uuid4())
        hashed = generate_password_hash(resolved_password) if resolved_password else ''
        merchant = {
            "merchant_id": merchant_id,
            "shop_name": resolved_shop,
            "owner_name": resolved_shop,
            "email": email,
            "password": hashed,
            "category": "shop",
            "status": "active",
            "approval_status": "approved",
            "email_verified": True,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        mongo.db.merchants.insert_one(merchant)

    # Clear OTP
    mongo.db.otps.delete_one({"_id": otp_record["_id"]})

    # Always issue token immediately
    token = jwt.encode({
        'merchant_id': merchant['merchant_id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, Config.SECRET_KEY, algorithm='HS256')

    return jsonify({
        "message": "Email verified. Welcome to UniDrop Merchant Portal!",
        "status": "approved",
        "token": token,
        "shop_name": merchant.get('shop_name'),
        "merchant_id": merchant.get('merchant_id')
    })


@merchant_auth_bp.route('/merchant/approval-status', methods=['GET'])
def merchant_approval_status():
    """Poll for merchant approval status by email."""
    email = request.args.get('email')
    if not email:
        return jsonify({"message": "Email required"}), 400

    merchant = mongo.db.merchants.find_one({"email": email})
    if not merchant:
        return jsonify({"message": "Merchant not found"}), 404

    approval = merchant.get('approval_status', 'pending')

    if approval == 'approved':
        token = jwt.encode({
            'merchant_id': merchant['merchant_id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, Config.SECRET_KEY, algorithm='HS256')
        return jsonify({
            "status": "approved",
            "token": token,
            "shop_name": merchant.get('shop_name'),
            "merchant_id": merchant.get('merchant_id')
        })
    elif approval == 'rejected':
        return jsonify({"status": "rejected"})
    else:
        return jsonify({"status": "pending"})


@merchant_auth_bp.route('/merchant/login', methods=['POST'])
def merchant_login():
    data = request.json
    email = data.get('email', '')
    password = data.get('password', '')

    # Demo merchant bypass — credentials loaded from environment
    demo_email = os.getenv('DEMO_MERCHANT_EMAIL', '')
    demo_password = os.getenv('DEMO_MERCHANT_PASSWORD', '')

    if demo_email and demo_password and email == demo_email and password == demo_password:
        # Create dummy merchant if not exists
        if not mongo.db.merchants.find_one({"email": email}):
            mongo.db.merchants.insert_one({
                "merchant_id": "demo_merchant_1",
                "shop_name": "Campus Canteen",
                "email": email,
                "password": password,
                "category": "canteen",
                "location": "Main Block",
                "approval_status": "approved",
                "email_verified": True
            })

        return jsonify({
            "message": "Login successful",
            "merchant_id": "demo_merchant_1",
            "shop_name": "Campus Canteen",
            "token": "demo_token",
            "role": "canteen"
        })

    merchant = mongo.db.merchants.find_one({"email": email})
    if not merchant:
        return jsonify({"message": "Invalid email or password"}), 401

    stored_pw = merchant.get('password', '')
    # Support both hashed and legacy plaintext passwords
    try:
        pw_ok = check_password_hash(stored_pw, password)
    except Exception:
        pw_ok = stored_pw == password

    if not pw_ok:
        return jsonify({"message": "Invalid email or password"}), 401

    # Check approval status
    approval = merchant.get('approval_status', 'approved')
    if approval == 'pending':
        return jsonify({
            "message": "Your account is awaiting institutional approval.",
            "status": "pending",
            "shop_name": merchant.get('shop_name')
        }), 403
    elif approval == 'rejected':
        return jsonify({
            "message": "Your merchant account application was rejected.",
            "status": "rejected"
        }), 403

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
