"""
AI Stock Demand Prediction Model
Uses Linear Regression (numpy-based) to forecast 7-day demand.
No heavy ML dependencies required.
"""

import numpy as np
from typing import List, Dict, Any


def _linear_regression(x: np.ndarray, y: np.ndarray):
    """Simple least-squares linear regression: y = mx + b"""
    n = len(x)
    if n < 2:
        return 0.0, float(np.mean(y)) if n > 0 else 0.0, 0.0

    x_mean = np.mean(x)
    y_mean = np.mean(y)

    numerator = np.sum((x - x_mean) * (y - y_mean))
    denominator = np.sum((x - x_mean) ** 2)

    if denominator == 0:
        return 0.0, y_mean, 0.0

    slope = numerator / denominator
    intercept = y_mean - slope * x_mean

    # R² (coefficient of determination) as confidence proxy
    y_pred = slope * x + intercept
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - y_mean) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    return slope, intercept, max(0.0, min(1.0, r_squared))


def _calculate_risk_level(predicted_demand: int, current_stock: int) -> str:
    """Determine risk level based on stock vs predicted demand."""
    if current_stock <= 0:
        return "HIGH"

    stock_ratio = current_stock / max(predicted_demand, 1)

    if stock_ratio < 0.5:
        return "HIGH"
    elif stock_ratio < 1.0:
        return "MEDIUM"
    else:
        return "LOW"


def _generate_recommendation(
    item: str, predicted_demand: int, current_stock: int, risk_level: str
) -> str:
    """Generate a human-readable restock recommendation."""
    deficit = predicted_demand - current_stock

    if risk_level == "HIGH":
        restock_qty = max(int(predicted_demand * 1.5), deficit + 20)
        return (
            f"⚠️ Restock immediately! Predicted demand ({predicted_demand}) far exceeds "
            f"current stock ({current_stock}). Order at least {restock_qty} units of {item}."
        )
    elif risk_level == "MEDIUM":
        restock_qty = max(int(predicted_demand * 0.5), deficit + 10)
        return (
            f"📦 Consider restocking {item} soon. Predicted demand is {predicted_demand} units "
            f"and you have {current_stock} in stock. Suggest ordering {restock_qty} units."
        )
    else:
        return (
            f"✅ Stock levels for {item} look healthy. Current stock ({current_stock}) "
            f"covers the predicted 7-day demand ({predicted_demand}). Monitor weekly."
        )


def predict_demand(
    daily_sales: List[int], current_stock: int = 0, item_name: str = "Item"
) -> Dict[str, Any]:
    """
    Core prediction function.

    Args:
        daily_sales: List of daily sales counts (oldest → newest), 7–30 entries.
        current_stock: Current stock level from inventory.
        item_name: Name of the item for recommendation text.

    Returns:
        Prediction dict with demand, risk, recommendation, confidence, and daily forecast.
    """
    if not daily_sales or len(daily_sales) < 2:
        avg = daily_sales[0] if daily_sales else 5
        predicted_7_day = avg * 7
        return {
            "predicted_demand_next_7_days": predicted_7_day,
            "risk_level": _calculate_risk_level(predicted_7_day, current_stock),
            "recommendation": _generate_recommendation(
                item_name, predicted_7_day, current_stock,
                _calculate_risk_level(predicted_7_day, current_stock)
            ),
            "confidence_score": 0.3,
            "daily_forecast": [avg] * 7,
        }

    sales = np.array(daily_sales, dtype=float)
    x = np.arange(len(sales), dtype=float)

    slope, intercept, r_squared = _linear_regression(x, sales)

    # Forecast next 7 days
    future_x = np.arange(len(sales), len(sales) + 7, dtype=float)
    daily_forecast = slope * future_x + intercept

    # Ensure no negative predictions
    daily_forecast = np.maximum(daily_forecast, 0).astype(int).tolist()

    predicted_7_day = int(sum(daily_forecast))

    # Boost confidence based on data volume (more data = more confident)
    data_volume_factor = min(len(daily_sales) / 30.0, 1.0)
    confidence = round(0.4 * r_squared + 0.4 * data_volume_factor + 0.2, 2)
    confidence = max(0.1, min(0.99, confidence))

    risk_level = _calculate_risk_level(predicted_7_day, current_stock)
    recommendation = _generate_recommendation(
        item_name, predicted_7_day, current_stock, risk_level
    )

    return {
        "predicted_demand_next_7_days": predicted_7_day,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "confidence_score": confidence,
        "daily_forecast": daily_forecast,
    }
