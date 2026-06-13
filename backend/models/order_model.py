class OrderModel:
    def __init__(self, item, pickup, drop, priority):
        self.item = item
        self.pickup = pickup
        self.drop = drop
        self.priority = priority
        self.status = "pending"
