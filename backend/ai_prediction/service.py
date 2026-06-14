"""
AI Prediction Service — MongoDB Data Access Layer
READ-ONLY access to existing collections: merchant_orders, merchant_products.
Generates synthetic historical data when real data is insufficient for demo/hackathon.
"""

import datetime
import random
import math
from typing import List, Dict, Optional
from extensions import mongo


def get_all_products(merchant_id: str = "demo_merchant_1") -> List[Dict]:
    """Get all product names for the given merchant. READ ONLY."""
    products = list(
        mongo.db.merchant_products.find(
            {"merchant_id": merchant_id},
            {"_id": 0, "name": 1, "stock": 1, "category": 1, "product_id": 1},
        )
    )
    return products


def get_current_stock(item_name: str, merchant_id: str = "demo_merchant_1") -> int:
    """Get current stock level for a product. READ ONLY."""
    product = mongo.db.merchant_products.find_one(
        {
            "merchant_id": merchant_id,
            "name": {"$regex": f"^{item_name}$", "$options": "i"},
        },
        {"_id": 0, "stock": 1},
    )
    return product.get("stock", 0) if product else 0


def get_item_sales_history(
    item_name: str, merchant_id: str = "demo_merchant_1", days: int = 30
) -> List[int]:
    """
    Aggregate daily sales for a given item from merchant_orders. READ ONLY.

    Returns a list of daily sales counts (oldest → newest).
    Falls back to synthetic data if real data < 7 days.
    """
    cutoff_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)

    # Try to aggregate real order data
    pipeline = [
        {
            "$match": {
                "merchant_id": merchant_id,
                "created_at": {"$gte": cutoff_date},
            }
        },
        {"$unwind": "$items"},
        {
            "$match": {
                "items.name": {"$regex": f"^{item_name}$", "$options": "i"}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": {
                            "$cond": {
                                "if": {"$eq": [{"$type": "$created_at"}, "string"]},
                                "then": {"$dateFromString": {"dateString": "$created_at"}},
                                "else": "$created_at",
                            }
                        },
                    }
                },
                "total_qty": {
                    "$sum": {
                        "$ifNull": [
                            "$items.quantity",
                            {"$ifNull": ["$items.qty", 1]},
                        ]
                    }
                },
            }
        },
        {"$sort": {"_id": 1}},
    ]

    try:
        results = list(mongo.db.merchant_orders.aggregate(pipeline))
    except Exception:
        results = []

    if len(results) >= 7:
        # Fill in missing days with 0
        daily_sales = _fill_daily_gaps(results, days)
        return daily_sales

    # ── Synthetic fallback for hackathon demo ──
    return _generate_synthetic_history(item_name, merchant_id, days)


def _fill_daily_gaps(results: List[Dict], days: int) -> List[int]:
    """Fill gaps in aggregated daily data with zeros."""
    date_to_qty = {r["_id"]: r["total_qty"] for r in results}
    daily = []
    for i in range(days):
        date_str = (
            datetime.datetime.utcnow() - datetime.timedelta(days=days - 1 - i)
        ).strftime("%Y-%m-%d")
        daily.append(date_to_qty.get(date_str, 0))
    return daily


def _generate_synthetic_history(
    item_name: str, merchant_id: str, days: int = 30
) -> List[int]:
    """
    Generate realistic synthetic sales data for demo purposes.
    Uses the product's current stock as a hint for typical daily volume.
    """
    stock = get_current_stock(item_name, merchant_id)

    # Estimate a base daily demand from stock level
    # Assumption: stock represents ~7–10 days supply
    base_daily = max(3, stock // 8)

    # Add a slight upward trend + weekly seasonality + noise
    random.seed(hash(item_name) % 2**31)  # Deterministic per item for consistency
    daily_sales = []

    for day in range(days):
        trend = base_daily + (day * 0.15)  # Slight upward trend
        weekday_factor = 1.0 + 0.3 * math.sin(2 * math.pi * day / 7)  # Weekly cycle
        noise = random.gauss(0, base_daily * 0.2)  # ±20% noise
        value = max(0, int(trend * weekday_factor + noise))
        daily_sales.append(value)

    return daily_sales
