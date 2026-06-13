import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://thiruvenkatam8080_db_user:hizXLaQWdw13R4UN@unidrop-cluster0.lxq2nbk.mongodb.net/unidrop?appName=UniDrop-Cluster0")
    SECRET_KEY = os.getenv("SECRET_KEY", "unidrop_secret_123")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyD0sEmNU3lxxf0bReh9OcyLQpqdLgYPuXk") # Can remove this eventually if backend doesn't use it
    AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:5002")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your-email@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your-app-password")
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True").lower() in ("true", "1", "t")
