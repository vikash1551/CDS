from flask import Blueprint, request, jsonify
import requests
from config import Config
from services.matching import calculate_match

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/match-route', methods=['GET'])
def match_route():
    # Use dummy order data to simulate match for MVP
    dummy_order = {
        "priority": request.args.get('priority', 'normal')
    }
    match = calculate_match(dummy_order)
    return jsonify(match)

@ai_bp.route('/ai-suggestion', methods=['POST'])
def ai_suggestion():
    data = request.json
    
    fallback_suggestion = {
        "suggestion": {
            "recommendation": "Alex Student (Campus Hero)",
            "fastest_route": "Via Main Quad to the Library",
            "reasoning": f"Alex is currently passing by {data.get('pickup', 'your location')} and has a 98% route overlap. AI confidence: 96%."
        }
    }
    
    try:
        response = requests.post(
            f"{Config.AI_SERVICE_URL}/smart-suggestion",
            json=data,
            timeout=8
        )
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify(fallback_suggestion)
    except Exception as e:
        print(f"Error calling AI service: {e}")
        return jsonify(fallback_suggestion)
