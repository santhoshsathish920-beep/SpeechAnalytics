import os
import sys

# ── Venv guard: always run inside the project's virtual environment ──────────
# If the user runs `python app.py` with the system Python, this block detects
# the venv Python, re-executes this script with it, and exits immediately.
# The second invocation (venv Python) passes the check and starts Flask normally.
_venv_py = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        'venv', 'Scripts', 'python.exe')
if os.path.exists(_venv_py) and os.path.realpath(sys.executable) != os.path.realpath(_venv_py):
    import subprocess
    sys.exit(subprocess.run([_venv_py] + sys.argv).returncode)
# ─────────────────────────────────────────────────────────────────────────────


from flask import Flask, send_from_directory
from flask_cors import CORS
from config.config import Config
from routes.upload import upload_bp
from routes.transcribe import transcribe_bp
from routes.analyze import analyze_bp
from routes.history import history_bp
from routes.analysis import analysis_bp
from routes.export import export_bp
from routes.chat import chat_bp
from utils.helpers import json_response

def create_app():
    app = Flask(__name__)
    
    # Load configs
    app.config.from_object(Config)
    Config.init_app(app)
    
    # Enable CORS for React frontend (development and production)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints under /api prefix
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(transcribe_bp, url_prefix="/api")
    app.register_blueprint(analyze_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")
    app.register_blueprint(export_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")
    
    # Serve uploaded audio files for player
    @app.route("/api/uploads/<path:filename>", methods=["GET"])
    def serve_uploaded_file(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)
        
    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return json_response(True, "Speech-to-Text Analytics Backend is healthy", data={
            "mock_mode": Config.USE_MOCK_AI
        })
        
    # Global error handlers
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return json_response(False, "File size exceeds the maximum limit of 50MB", status_code=413)
        
    @app.errorhandler(404)
    def route_not_found(error):
        return json_response(False, "Requested API endpoint not found", status_code=404)
        
    @app.errorhandler(500)
    def internal_server_error(error):
        return json_response(False, f"Internal Server Error: {str(error)}", status_code=500)
        
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    # Run the application
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)