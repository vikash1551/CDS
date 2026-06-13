from extensions import mongo

def award_xp(user_id, xp_amount):
    """Award XP to a user."""
    if not user_id:
        return
    mongo.db.users.update_one(
        {"user_id": user_id},
        {"$inc": {"xp": xp_amount}}
    )


def check_badge_unlock(user_id):
    """Check if a user has unlocked a new badge based on their XP and activity."""
    if not user_id:
        return None

    user = mongo.db.users.find_one({"user_id": user_id})
    if not user:
        return None

    xp = user.get("xp", 0)
    current_badges = user.get("badges", [])

    # Badge thresholds
    badge_rules = [
        {"name": "Speed Courier", "xp_threshold": 100, "icon": "lightning"},
        {"name": "Trusted Lender", "xp_threshold": 300, "icon": "handshake"},
        {"name": "Night Owl", "xp_threshold": 500, "icon": "moon"},
        {"name": "Campus Hero", "xp_threshold": 1000, "icon": "star"},
        {"name": "Legend", "xp_threshold": 2500, "icon": "trophy"}
    ]

    new_badge = None
    for badge in badge_rules:
        if xp >= badge["xp_threshold"] and badge["name"] not in current_badges:
            mongo.db.users.update_one(
                {"user_id": user_id},
                {"$addToSet": {"badges": badge["name"]}}
            )
            new_badge = badge["name"]

    return new_badge


def get_user_rewards(user_id):
    """Get complete reward profile for a user."""
    user = mongo.db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return {"xp": 0, "badges": [], "rank": "Rookie", "streak": 0}

    xp = user.get("xp", 0)

    # Calculate rank title
    if xp >= 2500:
        rank = "Legend"
    elif xp >= 1000:
        rank = "Campus Hero"
    elif xp >= 500:
        rank = "Night Owl"
    elif xp >= 300:
        rank = "Trusted Lender"
    elif xp >= 100:
        rank = "Speed Courier"
    else:
        rank = "Rookie"

    # Count deliveries for streak
    delivery_count = mongo.db.orders.count_documents({
        "courier_id": user_id,
        "status": "completed"
    })
    lend_count = mongo.db.lend_requests.count_documents({
        "lender_id": user_id,
        "status": "returned"
    })

    return {
        "name": user.get("name", "Unknown"),
        "xp": xp,
        "badges": user.get("badges", []),
        "rank": rank,
        "deliveries_completed": delivery_count,
        "items_lent": lend_count,
        "streak": min(delivery_count + lend_count, 30)  # Cap streak at 30
    }
