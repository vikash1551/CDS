# In a PyMongo/Flask app, models are often just dictionaries representing BSON.
# This file is a placeholder for a more structured ODM approach if needed in the future.

class UserModel:
    def __init__(self, name, email, rank, xp):
        self.name = name
        self.email = email
        self.rank = rank
        self.xp = xp
