import os
from flask import Blueprint, request
from config.config import Config
from utils.helpers import allowed_file, json_response, sanitize_filename

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/upload", methods=["POST", "OPTIONS"])
def upload_audio():
    """Upload audio file endpoint."""
    # Check if file is in request
    if "file" not in request.files:
        return json_response(False, "No file part in the request", status_code=400)
        
    file = request.files["file"]
    
    if file.filename == "":
        return json_response(False, "No file selected", status_code=400)
        
    if not allowed_file(file.filename):
        return json_response(
            False, 
            f"Unsupported file type. Allowed formats: {', '.join(Config.ALLOWED_EXTENSIONS)}", 
            status_code=400
        )
        
    try:
        # Sanitize and save the file
        filename = sanitize_filename(file.filename)
        # Append timestamp to filename to prevent collisions
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{int(os.time() if hasattr(os, 'time') else 1000 * os.path.getmtime(Config.UPLOAD_FOLDER) if os.path.exists(Config.UPLOAD_FOLDER) else 9999)}{ext}"
        # Let's just use import time
        import time
        unique_filename = f"{name}_{int(time.time())}{ext}"
        
        file_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
        file.save(file_path)
        
        # Check if saved file is empty
        if os.path.getsize(file_path) == 0:
            os.remove(file_path)
            return json_response(False, "Uploaded file is empty", status_code=400)
            
        print(f"File uploaded successfully: {file_path}")
        
        # We return the absolute path and relative path for playback
        # Relative path will be served via Flask static or /uploads route
        relative_path = f"uploads/{unique_filename}"
        
        return json_response(
            True,
            "File uploaded successfully",
            data={
                "filename": filename,
                "saved_filename": unique_filename,
                "file_path": file_path,
                "audio_url": f"/api/{relative_path}"
            }
        )
    except Exception as e:
        print(f"Upload error: {e}")
        return json_response(False, f"An error occurred during file upload: {str(e)}", status_code=500)
