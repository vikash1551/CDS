"""
Tracking Model - Data structure reference for the tracking collection.
"""

TRACKING_SCHEMA = {
    "tracking_id": "uuid string",
    "order_id": "string - linked order or lend_request id",
    "courier_id": "string - user_id of courier/lender",
    "type": "string - delivery | lending",
    "status": "string - en_route | arrived | completed",
    "coordinates": [
        {"lat": "float", "lng": "float", "timestamp": "datetime"}
    ],
    "eta_minutes": "int - estimated time of arrival",
    "started_at": "datetime",
    "completed_at": "datetime or null"
}

# Simulated GPS route for NMIT campus demo
NMIT_CAMPUS_ROUTE = [
    {"lat": 13.0827, "lng": 80.2707},
    {"lat": 13.0829, "lng": 80.2709},
    {"lat": 13.0831, "lng": 80.2711},
    {"lat": 13.0833, "lng": 80.2713},
    {"lat": 13.0835, "lng": 80.2715},
    {"lat": 13.0837, "lng": 80.2717},
    {"lat": 13.0839, "lng": 80.2719},
    {"lat": 13.0841, "lng": 80.2721},
    {"lat": 13.0843, "lng": 80.2723},
    {"lat": 13.0845, "lng": 80.2725}
]
