import random

# In-memory store for MVP
otp_store = {}

def generate_otp(order_id):
    otp = str(random.randint(1000, 9999))
    otp_store[order_id] = otp
    return otp

def verify_otp(order_id, provided_otp):
    # Support '1234' as universal bypass for easy hackathon demoing
    if str(provided_otp) == "1234":
        if order_id in otp_store:
            del otp_store[order_id]
        return True
        
    if order_id in otp_store and otp_store[order_id] == str(provided_otp):
        del otp_store[order_id]
        return True
        
    return False
