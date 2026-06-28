from flask import Blueprint, request
from services.database_service import db_service
from services.chatbot_service import chatbot_service
from utils.helpers import json_response

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat_with_transcript_chunks():
    """Contextual Q&A Chatbot endpoint over transcripts."""
    body = request.get_json() or {}
    question = body.get("question")
    transcript_id = body.get("transcript_id")
    history = body.get("history", [])
    
    if not question or not question.strip():
        return json_response(False, "Missing 'question' in request body", status_code=400)
    if not transcript_id or not transcript_id.strip():
        return json_response(False, "Missing 'transcript_id' in request body", status_code=400)
        
    try:
        # Fetch matching transcript record
        record = db_service.get_analysis(transcript_id)
        if not record:
            return json_response(False, f"Transcript with ID {transcript_id} not found", status_code=404)
            
        # Get answer using RAG chatbot service
        res = chatbot_service.answer_question(question, record, history)
        
        return json_response(
            True,
            "Answer generated successfully",
            data={
                "answer": res["answer"],
                "quote": res["quote"]
            }
        )
    except Exception as e:
        print(f"Chat API route error: {e}")
        return json_response(
            False,
            f"An error occurred while processing your question: {str(e)}",
            status_code=500
        )
