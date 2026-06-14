"""
AI Prediction Routes — Independent Flask Blueprint
Endpoints:
  GET /api/predict-stock?item=<name>&merchant_id=<id>
  GET /api/prediction-products?merchant_id=<id>
"""

from flask import Blueprint, request, jsonify
from ai_prediction.model import predict_demand
from ai_prediction.service import (
    get_item_sales_history,
    get_current_stock,
    get_all_products,
)

prediction_bp = Blueprint("prediction_bp", __name__)


@prediction_bp.route("/api/predict-stock", methods=["GET"])
def predict_stock():
    """
    Predict 7-day stock demand for a given item.

    Query params:
        item (str): Product name (required)
        merchant_id (str): Merchant ID (default: demo_merchant_1)

    Returns:
        JSON with prediction, risk level, recommendation, confidence, and daily forecast.
    """
    item_name = request.args.get("item", "").strip()
    merchant_id = request.args.get("merchant_id", "demo_merchant_1")

    if not item_name:
        return jsonify({"status": "error", "message": "Missing 'item' parameter"}), 400

    try:
        # Fetch historical sales data (READ ONLY)
        daily_sales = get_item_sales_history(item_name, merchant_id)

        # Fetch current stock (READ ONLY)
        current_stock = get_current_stock(item_name, merchant_id)

        # Run prediction model
        prediction = predict_demand(daily_sales, current_stock, item_name)

        return jsonify(
            {
                "status": "success",
                "item": item_name,
                "current_stock": current_stock,
                "predicted_demand_next_7_days": prediction[
                    "predicted_demand_next_7_days"
                ],
                "risk_level": prediction["risk_level"],
                "recommendation": prediction["recommendation"],
                "confidence_score": prediction["confidence_score"],
                "daily_forecast": prediction["daily_forecast"],
            }
        )

    except Exception as e:
        return jsonify(
            {"status": "error", "message": f"Prediction failed: {str(e)}"}
        ), 500


@prediction_bp.route("/api/prediction-products", methods=["GET"])
def prediction_products():
    """
    List all products available for prediction.

    Query params:
        merchant_id (str): Merchant ID (default: demo_merchant_1)

    Returns:
        JSON with list of product names.
    """
    merchant_id = request.args.get("merchant_id", "demo_merchant_1")

    try:
        products = get_all_products(merchant_id)
        return jsonify({"status": "success", "products": products})
    except Exception as e:
        return jsonify(
            {"status": "error", "message": f"Failed to fetch products: {str(e)}"}
        ), 500
