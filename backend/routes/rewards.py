from flask import Blueprint, jsonify, request
from extensions import mongo

rewards_bp = Blueprint('rewards_bp', __name__)

@rewards_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    # Fetch top 10 users from the database, sorted by XP descending
    top_users = mongo.db.users.find({}, {"_id": 0, "name": 1, "xp": 1, "badges": 1}).sort("xp", -1).limit(10)
    
    leaderboard = []
    for index, user in enumerate(top_users):
        # Assign a dynamic title based on XP
        badge = "Rookie"
        if user.get("xp", 0) > 2000:
            badge = "Campus Hero"
        elif user.get("xp", 0) > 1000:
            badge = "Speed Courier"
        elif user.get("xp", 0) > 500:
            badge = "Night Owl"
            
        leaderboard.append({
            "rank": index + 1,
            "name": user.get("name", "Unknown Courier"),
            "xp": user.get("xp", 0),
            "badge": badge
        })
        
    return jsonify({"leaderboard": leaderboard})


@rewards_bp.route('/rewards', methods=['GET'])
def get_rewards():
    """Get complete reward profile for a user."""
    user_id = request.args.get('user_id', 'demo_user')

    from services.reward_service import get_user_rewards
    rewards = get_user_rewards(user_id)

    return jsonify(rewards)
