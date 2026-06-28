import os
from fpdf import FPDF
from datetime import datetime

class PDFReport(FPDF):
    def header(self):
        # Draw a top colored banner
        self.set_fill_color(79, 70, 229) # Tailwind Indigo-600
        self.rect(0, 0, 210, 15, 'F')
        
        # Header Title
        self.set_text_color(255, 255, 255)
        self.set_font('Helvetica', 'B', 10)
        self.cell(0, -6, 'SPEECH-TO-TEXT ANALYTICS PLATFORM', 0, 1, 'C')
        
        # Add small vertical spacer
        self.set_y(22)
        
    def footer(self):
        # Go to 1.5 cm from bottom
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(156, 163, 175) # Gray-400
        # Page number
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')
        
        # Draw a thin bottom line
        self.set_draw_color(229, 231, 235) # Gray-200
        self.line(10, 280, 200, 280)

class PDFService:
    @staticmethod
    def generate_report(analysis_data, output_path):
        """Generates a styled PDF report for a given transcript and analytics."""
        pdf = PDFReport()
        pdf.alias_nb_pages()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=20)
        
        # Title Section
        pdf.set_font('Helvetica', 'B', 22)
        pdf.set_text_color(17, 24, 39) # Gray-900
        pdf.cell(0, 15, 'Transcript Analytics Report', 0, 1, 'L')
        
        # Divider Line
        pdf.set_draw_color(79, 70, 229) # Indigo-600
        pdf.set_line_width(0.8)
        pdf.line(10, 38, 200, 38)
        pdf.ln(8)
        
        # Meta Info Grid
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(79, 70, 229)
        pdf.cell(95, 6, 'FILE INFORMATION', 0, 0, 'L')
        pdf.cell(95, 6, 'ANALYTICS SUMMARY', 0, 1, 'L')
        
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(55, 65, 81) # Gray-700
        
        # File info rows
        date_str = analysis_data.get("upload_date", datetime.utcnow().isoformat())
        try:
            formatted_date = datetime.fromisoformat(date_str).strftime("%B %d, %Y %I:%M %p")
        except Exception:
            formatted_date = date_str
            
        duration_sec = analysis_data.get("duration", 0)
        minutes = int(duration_sec // 60)
        seconds = int(duration_sec % 60)
        duration_str = f"{minutes}m {seconds}s"
        
        # Row 1
        pdf.cell(28, 5, 'Filename:', 0, 0)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(67, 5, os.path.basename(analysis_data.get("filename", "Unknown")), 0, 0)
        pdf.set_font('Helvetica', '', 9)
        pdf.cell(28, 5, 'Sentiment:', 0, 0)
        pdf.set_font('Helvetica', 'B', 9)
        sentiment_label = analysis_data.get("sentiment", {}).get("label", "NEUTRAL")
        sentiment_score = analysis_data.get("sentiment", {}).get("score", 0)
        pdf.cell(67, 5, f"{sentiment_label} ({sentiment_score:.2%})", 0, 1)
        pdf.set_font('Helvetica', '', 9)
        
        # Row 2
        pdf.cell(28, 5, 'Upload Date:', 0, 0)
        pdf.cell(67, 5, formatted_date, 0, 0)
        pdf.cell(28, 5, 'Word Count:', 0, 0)
        pdf.cell(67, 5, f"{analysis_data.get('word_count', 0)} words", 0, 1)
        
        # Row 3
        pdf.cell(28, 5, 'Audio Duration:', 0, 0)
        pdf.cell(67, 5, duration_str, 0, 0)
        pdf.cell(28, 5, 'Speaking Time:', 0, 0)
        reading_sec = analysis_data.get("reading_time", 0)
        read_min = int(reading_sec // 60)
        read_sec = int(reading_sec % 60)
        pdf.cell(67, 5, f"{read_min}m {read_sec}s", 0, 1)
        
        pdf.ln(8)
        
        # AI Summary Section
        pdf.set_fill_color(243, 244, 246) # Gray-100 background
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(17, 24, 39)
        pdf.cell(0, 8, '  AI Summary', 0, 1, 'L', fill=True)
        pdf.ln(2)
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(55, 65, 81)
        # MultiCell for summary text
        pdf.multi_cell(0, 5, analysis_data.get("summary", "No summary generated."), 0, 'L')
        pdf.ln(6)
        
        # Keywords Section
        pdf.set_fill_color(243, 244, 246)
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(17, 24, 39)
        pdf.cell(0, 8, '  Keyphrase & Topic Extraction', 0, 1, 'L', fill=True)
        pdf.ln(2)
        
        keywords = analysis_data.get("keywords", [])
        if keywords:
            pdf.set_font('Helvetica', 'B', 9)
            pdf.set_text_color(79, 70, 229)
            # Render keywords in tags format (columns)
            count = 0
            for kw in keywords:
                text = kw.get("text", "")
                score = kw.get("score", 0)
                tag_str = f" {text} ({score:.0%}) "
                width = pdf.get_string_width(tag_str) + 6
                
                # Check for wrap-around
                if pdf.get_x() + width > 190:
                    pdf.ln(6)
                
                # Draw small rect for keyword border
                x, y = pdf.get_x(), pdf.get_y()
                pdf.set_draw_color(199, 210, 254) # Indigo-200
                pdf.set_fill_color(238, 242, 255) # Indigo-50
                pdf.rect(x, y, width, 5.5, 'DF')
                
                pdf.set_y(y + 0.5)
                pdf.cell(width, 5, tag_str, 0, 0, 'C')
                pdf.set_y(y)
                pdf.set_x(x + width + 4)
                count += 1
            pdf.ln(10)
        else:
            pdf.set_font('Helvetica', 'I', 9)
            pdf.cell(0, 5, 'No keywords extracted.', 0, 1)
            pdf.ln(4)
            
        # Full Transcript Section
        pdf.set_fill_color(243, 244, 246)
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(17, 24, 39)
        pdf.cell(0, 8, '  Full Audio Transcript', 0, 1, 'L', fill=True)
        pdf.ln(2)
        
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(31, 41, 55) # Gray-800
        # MultiCell for full transcript
        full_text = analysis_data.get("transcript", "No transcript text available.")
        pdf.multi_cell(0, 5.5, full_text, 0, 'L')
        
        # Save to path
        pdf.output(output_path, 'F')
        print(f"PDF report successfully saved to: {output_path}")
        return output_path

# Singleton instance
pdf_service = PDFService()
