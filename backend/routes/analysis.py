from flask import Blueprint
from services.database_service import db_service
from utils.helpers import json_response

analysis_bp = Blueprint("analysis", __name__)

@analysis_bp.route("/analysis/<doc_id>", methods=["GET"])
def get_single_analysis(doc_id):
    """Retrieve details for a single analysis by its ID."""
    try:
        record = db_service.get_analysis(doc_id)
        if not record:
            return json_response(False, f"Analysis with ID {doc_id} not found", status_code=404)
        return json_response(True, "Analysis retrieved successfully", data=record)
    except Exception as e:
        print(f"Analysis retrieval route error: {e}")
        return json_response(False, f"An error occurred while fetching analysis details: {str(e)}", status_code=500)
