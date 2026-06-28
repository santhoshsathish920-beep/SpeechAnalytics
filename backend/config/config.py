import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")
    
    # MongoDB Config
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/speech_analytics")
    
    # AI Engine settings
    USE_MOCK_AI = os.getenv("USE_MOCK_AI", "True").lower() in ("true", "1", "yes")
    
    # Upload Settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    ALLOWED_EXTENSIONS = {"mp3", "wav", "m4a"}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB limits
    
    @staticmethod
    def init_app(app):
        # Create upload folder if it doesn't exist
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
