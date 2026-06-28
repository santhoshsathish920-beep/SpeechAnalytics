import os
from flask import Blueprint, send_file
from services.database_service import db_service
from services.pdf_service import pdf_service
from utils.helpers import json_response
from config.config import Config

export_bp = Blueprint("export", __name__)

@export_bp.route("/export/<doc_id>", methods=["GET"])
def export_pdf_report(doc_id):
    """Generate and export transcript analysis as PDF report."""
    try:
        # Retrieve analysis details
        record = db_service.get_analysis(doc_id)
        if not record:
            return json_response(False, f"Record with ID {doc_id} not found", status_code=404)
            
        # Create output file path
        report_filename = f"report_{doc_id}.pdf"
        report_path = os.path.join(Config.UPLOAD_FOLDER, report_filename)
        
        # Generate the PDF report
        pdf_service.generate_report(record, report_path)
        
        # Set download name based on original filename
        base_name, _ = os.path.splitext(record.get("filename", "transcript"))
        download_name = f"Analytics_Report_{base_name}.pdf"
        
        return send_file(
            report_path,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=download_name
        )
    except Exception as e:
        print(f"Export PDF route error: {e}")
        return json_response(False, f"An error occurred while generating the PDF: {str(e)}", status_code=500)
