from flask import Blueprint, request
from services.transcription_service import transcription_service
from utils.helpers import json_response

transcribe_bp = Blueprint("transcribe", __name__)

@transcribe_bp.route("/transcribe", methods=["POST"])
def transcribe_audio():
    """Transcribe audio file endpoint."""
    body = request.get_json() or {}
    file_path = body.get("file_path")
    
    if not file_path:
        return json_response(False, "Missing 'file_path' in request body", status_code=400)
        
    try:
        # Perform transcription
        result = transcription_service.transcribe(file_path)
        
        if result.get("success"):
            return json_response(
                True,
                "Transcription completed",
                data={
                    "transcript": result["transcript"],
                    "duration": result["duration"],
                    "engine": result["engine"]
                }
            )
        else:
            return json_response(False, "Transcription failed", status_code=500)
    except Exception as e:
        print(f"Transcription route error: {e}")
        return json_response(False, f"An error occurred during transcription: {str(e)}", status_code=500)
