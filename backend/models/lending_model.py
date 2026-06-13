"""
Lending Model - Data structure reference for the lend_requests collection.
"""

LEND_REQUEST_SCHEMA = {
    "request_id": "uuid string",
    "requester_id": "user_id of the student requesting the item",
    "item": "string - name of item (Calculator, Charger, Lab Coat, etc.)",
    "duration": "string - how long needed (e.g. '2 hours', '1 day')",
    "reward_xp": "int - XP offered as reward to lender",
    "pickup": "string - pickup location name",
    "category": "string - academic | electronics | emergency | clothing",
    "status": "string - pending | matched | handed_over | returned",
    "lender_id": "user_id of the lender (null until matched)",
    "created_at": "datetime",
    "matched_at": "datetime or null",
    "handed_over_at": "datetime or null",
    "return_by": "datetime or null",
    "returned_at": "datetime or null"
}

# Item categories for the lending marketplace
LEND_CATEGORIES = {
    "academic": ["Calculator", "Notes", "Textbook", "Compass Set", "Drawing Board"],
    "electronics": ["Charger", "Power Bank", "USB Cable", "Earphones", "Laptop Charger"],
    "emergency": ["Umbrella", "First Aid Kit", "Water Bottle", "Pen/Pencil"],
    "clothing": ["Lab Coat", "Apron", "Sports Wear", "Formal Shirt"]
}
