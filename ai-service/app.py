from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

from ai_service import get_smart_suggestion, generate_product_emoji

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "ai-service"})

@app.route('/generate-emoji', methods=['POST'])
def emoji_endpoint():
    data = request.json
    if not data or 'name' not in data:
        return jsonify({"error": "Missing 'name' parameter"}), 400
        
    emoji = generate_product_emoji(data['name'])
    return jsonify({"emoji": emoji})

@app.route('/smart-suggestion', methods=['POST'])
def suggestion_endpoint():
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    try:
        suggestion = get_smart_suggestion(
            order_type=data.get('order_type', 'canteen_delivery'),
            pickup=data.get('pickup', 'Unknown'),
            drop=data.get('drop', 'Unknown'),
            priority=data.get('priority', 'normal')
        )
        return jsonify({"suggestion": suggestion})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
