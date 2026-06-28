import os
from flask import jsonify
from config.config import Config

def allowed_file(filename):
    """Checks if the file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def json_response(success, message, data=None, status_code=200):
    """Standardized API Response formatting."""
    response = {
        "success": success,
        "message": message,
        "data": data if data is not None else {}
    }
    return jsonify(response), status_code

def sanitize_filename(filename):
    """Simple filename sanitizer to remove dangerous characters."""
    # Keep alphanumeric, dots, hyphens, and underscores
    name, ext = os.path.splitext(filename)
    clean_name = "".join(c for c in name if c.isalnum() or c in ("-", "_", " ")).strip()
    # Replace spaces with underscores
    clean_name = clean_name.replace(" ", "_")
    return clean_name + ext.lower()
