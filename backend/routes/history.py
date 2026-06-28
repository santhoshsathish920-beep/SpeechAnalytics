from flask import Blueprint
from services.database_service import db_service
from utils.helpers import json_response

history_bp = Blueprint("history", __name__)

@history_bp.route("/history", methods=["GET"])
def get_history_list():
    """Retrieve history of uploaded speech transcripts and analytics."""
    try:
        records = db_service.get_history()
        return json_response(True, "History retrieved successfully", data=records)
    except Exception as e:
        print(f"History route error: {e}")
        return json_response(False, f"An error occurred while fetching history: {str(e)}", status_code=500)
