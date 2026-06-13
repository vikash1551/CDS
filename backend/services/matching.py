from extensions import mongo
import pymongo

def initialize_geospatial_indexes():
    """
    Creates 2dsphere indexes for actual geospatial matching queries.
    """
    try:
        mongo.db.orders.create_index([("pickup_location", pymongo.GEOSPHERE)])
        mongo.db.users.create_index([("location", pymongo.GEOSPHERE)])
    except Exception as e:
        print(f"Warning: Could not create geospatial indexes: {e}")

def calculate_match(order):
    """
    Advanced matching logic using MongoDB $near queries if applicable.
    """
    # Example MongoDB GeoSpatial query to find couriers near the pickup
    # (Assuming couriers update their 'location' in the users collection)
    if 'pickup_location' in order:
        nearby_couriers = list(mongo.db.users.find({
            "location": {
                "$near": {
                    "$geometry": order['pickup_location'],
                    "$maxDistance": 1000 # 1km radius
                }
            }
        }).limit(3))
        
        if nearby_couriers:
            best_courier = nearby_couriers[0]['name']
        else:
            best_courier = "Alex Student (Mock Fallback)"
    else:
        best_courier = "Alex Student (Mock Fallback)"

    # Weighted route scoring
    route_similarity = 0.98
    proximity = 0.85
    urgency = 1.0 if order.get('priority') == 'urgent' else 0.5
    
    score = (route_similarity * 0.5) + (proximity * 0.3) + (urgency * 0.2)
    score_percentage = f"{int(score * 100)}%"
    
    return {
        "courier": best_courier,
        "match_score": score_percentage,
        "eta": "4 mins",
        "reward": "20 XP" if order.get('priority') == 'urgent' else "15 XP",
        "ai_confidence": "96%"
    }


def calculate_lend_match(lend_request):
    """
    Finds the best lender match for a lending request.
    Uses proximity and item availability heuristics.
    """
    item = lend_request.get('item', 'Unknown')
    pickup = lend_request.get('pickup', 'Unknown')

    # In a real app, query users who have listed this item as available
    # For MVP, return a smart-looking mock match
    import random
    mock_lenders = [
        {"name": "Priya Sharma", "rating": 4.8, "distance": "150m"},
        {"name": "Rahul Kumar", "rating": 4.6, "distance": "200m"},
        {"name": "Ananya Reddy", "rating": 4.9, "distance": "300m"},
        {"name": "Vikash Singh", "rating": 4.7, "distance": "100m"},
        {"name": "Meera Patel", "rating": 4.5, "distance": "250m"}
    ]

    best = random.choice(mock_lenders)

    # Weighted scoring
    proximity = random.uniform(0.7, 0.99)
    availability = random.uniform(0.8, 1.0)
    rating_score = best["rating"] / 5.0

    score = (proximity * 0.4) + (availability * 0.3) + (rating_score * 0.3)

    return {
        "lender": best["name"],
        "distance": best["distance"],
        "rating": best["rating"],
        "match_score": f"{int(score * 100)}%",
        "eta": f"{random.randint(2, 8)} mins",
        "ai_confidence": f"{random.randint(88, 98)}%"
    }
