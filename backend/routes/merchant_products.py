from flask import Blueprint, request, jsonify
from extensions import mongo
import uuid
import datetime
import requests
from config import Config
from utils.auth import token_required

merchant_products_bp = Blueprint('merchant_products_bp', __name__)

@merchant_products_bp.route('/merchant/generate-emoji', methods=['POST'])
def generate_emoji():
    data = request.json
    name = data.get('name', '')
    if not name:
        return jsonify({"emoji": "📦"})
    
    try:
        response = requests.post(
            f"{Config.AI_SERVICE_URL}/generate-emoji", 
            json={"name": name},
            timeout=5
        )
        if response.status_code == 200:
            emoji = response.json().get("emoji", "📦")
        else:
            emoji = "📦"
    except Exception as e:
        print(f"Error calling AI service: {e}")
        emoji = "📦"
        
    return jsonify({"emoji": emoji})

@merchant_products_bp.route('/merchant/add-product', methods=['POST'])
@token_required
def add_product(current_user):
    data = request.json
    merchant_id = current_user.get('user_id', 'demo_merchant_1')
    
    product_id = str(uuid.uuid4())
    product = {
        "product_id": product_id,
        "merchant_id": merchant_id,
        "name": data.get('name'),
        "description": data.get('description', ''),
        "category": data.get('category', 'general'),
        "price": data.get('price', 0),
        "stock": data.get('stock', 0),
        "image_url": data.get('image_url', ''),
        "emoji": data.get('emoji', '📦'),
        "ETA": data.get('ETA', '10 mins'),
        "is_active": True,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    mongo.db.merchant_products.insert_one(product)
    product.pop('_id', None)
    
    return jsonify({"message": "Product added successfully", "product": product}), 201

@merchant_products_bp.route('/merchant/products', methods=['GET'])
def get_products():
    merchant_id = request.args.get('merchant_id', 'demo_merchant_1')
    products = list(mongo.db.merchant_products.find({"merchant_id": merchant_id}, {"_id": 0}))
    return jsonify({"products": products})

@merchant_products_bp.route('/merchant/update-product/<product_id>', methods=['PUT'])
@token_required
def update_product(current_user, product_id):
    data = request.json
    
    update_fields = {}
    for key in ['name', 'description', 'category', 'price', 'stock', 'image_url', 'emoji', 'ETA', 'is_active']:
        if key in data:
            update_fields[key] = data[key]
            
    if not update_fields:
        return jsonify({"message": "No fields to update"}), 400
        
    result = mongo.db.merchant_products.update_one(
        {"product_id": product_id},
        {"$set": update_fields}
    )
    
    if result.modified_count == 0:
        return jsonify({"message": "Product not found or no changes made"}), 404
        
    return jsonify({"message": "Product updated successfully"})

@merchant_products_bp.route('/merchant/delete-product/<product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    result = mongo.db.merchant_products.delete_one({"product_id": product_id})
    if result.deleted_count == 0:
        return jsonify({"message": "Product not found"}), 404
    return jsonify({"message": "Product deleted successfully"})
