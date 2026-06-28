from flask import Blueprint, request
from services.analytics_service import analytics_service
from services.database_service import db_service
from utils.helpers import json_response
from datetime import datetime

analyze_bp = Blueprint("analyze", __name__)

@analyze_bp.route("/analyze", methods=["POST"])
def analyze_text():
    """Analyze transcript endpoint and store the results."""
    body = request.get_json() or {}
    transcript = body.get("transcript")
    filename = body.get("filename")
    audio_path = body.get("audio_path")
    duration = body.get("duration", 0)
    
    if not transcript:
        return json_response(False, "Missing 'transcript' in request body", status_code=400)
    if not filename:
        return json_response(False, "Missing 'filename' in request body", status_code=400)
    if not audio_path:
        return json_response(False, "Missing 'audio_path' in request body", status_code=400)
        
    try:
        # Perform NLP Analytics
        print(f"Running NLP analytics for file: {filename}...")
        analysis = analytics_service.analyze(transcript)
        
        # Assemble document
        record = {
            "filename": filename,
            "transcript": transcript,
            "summary": analysis["summary"],
            "sentiment": analysis["sentiment"],
            "keywords": analysis["keywords"],
            "word_frequency": analysis["word_frequency"],
            "upload_date": datetime.utcnow().isoformat(),
            "audio_path": audio_path,
            "duration": float(duration),
            "word_count": int(analysis["word_count"]),
            "reading_time": int(analysis["reading_time"]),
            "chunks": analysis.get("chunks", [])
        }
        
        # Save to Database
        doc_id = db_service.save_analysis(record)
        record["id"] = doc_id
        record["_id"] = doc_id
        
        print(f"NLP analysis complete and saved with ID: {doc_id}")
        return json_response(True, "Analysis completed and saved successfully", data=record)
        
    except Exception as e:
        print(f"Analytics route error: {e}")
        return json_response(False, f"An error occurred during analysis: {str(e)}", status_code=500)
