import os
import sys
# Add parent directory to path so app can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
import json
import sqlite3
from app import create_app
from config.config import Config
from services.database_service import db_service

class VoxAnalyticsBackendTestCase(unittest.TestCase):
    def setUp(self):
        """Set up test client and override database for testing."""
        # Enable testing mode in Flask
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        
        self.db_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
            "local_database.db"
        )

    def test_health_check(self):
        """Test the system health check route."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIn("mock_mode", data["data"])
        print("OK - Health check route")

    def test_database_sqlite_fallback(self):
        """Verify that SQLite fallback has initialized database and created tables."""
        self.assertTrue(os.path.exists(self.db_path))
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='transcripts'")
        table = cursor.fetchone()
        self.assertIsNotNone(table)
        
        conn.close()
        print("OK - SQLite database fallback verification")

    def test_get_history(self):
        """Test retrieving list of transcripts."""
        response = self.client.get("/api/history")
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        self.assertIsInstance(data["data"], list)
        print("OK - Retrieve history list route")

    def test_nlp_and_chat_rag_pipeline(self):
        """Test the NLP analyzer endpoint and Chatbot Q&A semantic search."""
        test_payload = {
            "transcript": (
                "Hello, thank you for calling VoxAnalytics support. My name is Alex. "
                "Today we are discussing our plans to migrate our databases. "
                "We plan to move to MongoDB Atlas by next Friday. "
                "This will solve our indexing issues and improve query performance."
            ),
            "filename": "sprint_meeting_demo.mp3",
            "audio_path": "/api/uploads/sprint_meeting_demo.mp3",
            "duration": 65.0
        }
        
        # 1. Test Analysis Ingestion
        response = self.client.post(
            "/api/analyze",
            data=json.dumps(test_payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data["success"])
        transcript_id = data["data"]["id"]
        
        # Verify chunking and embedding generation
        self.assertIn("chunks", data["data"])
        self.assertGreater(len(data["data"]["chunks"]), 0)
        self.assertIn("embedding", data["data"]["chunks"][0])
        
        # Verify multi-class context-aware sentiment analysis
        sentiment = data["data"]["sentiment"]
        self.assertIn("label", sentiment)
        self.assertIn(sentiment["label"], ["POSITIVE", "NEGATIVE", "NEUTRAL", "INFORMATIVE", "ANALYTICAL", "MIXED"])
        print(f"OK - NLP Analysis creates chunks & embeddings. Sentiment: {sentiment['label']}")

        # 2. Test Q&A Chatbot Endpoint
        chat_payload = {
            "question": "What database are we migrating to and when?",
            "transcript_id": transcript_id
        }
        
        chat_response = self.client.post(
            "/api/chat",
            data=json.dumps(chat_payload),
            content_type="application/json"
        )
        self.assertEqual(chat_response.status_code, 200)
        
        chat_data = json.loads(chat_response.data)
        self.assertTrue(chat_data["success"])
        self.assertIn("answer", chat_data["data"])
        self.assertIn("quote", chat_data["data"])
        
        answer = chat_data["data"]["answer"].lower()
        quote = chat_data["data"]["quote"].lower()
        # Semantic QA should extract the database and/or date from the text chunks
        self.assertTrue(
            "mongodb" in answer or "friday" in answer or "migrate" in answer or "context" in answer,
            f"Expected answer to contain conversation references. Got: {answer}"
        )
        self.assertTrue(
            "mongodb" in quote or "friday" in quote or "migrate" in quote,
            f"Expected quote to contain conversation references. Got: {quote}"
        )
        print("OK - Chatbot semantic search, extraction, and quote generation")

        # 3. Test Q&A Conversational History (Memory)
        chat_payload_history = {
            "question": "Why?",
            "transcript_id": transcript_id,
            "history": [
                {"sender": "user", "text": "What database are we migrating to?"},
                {"sender": "bot", "text": "We are migrating to MongoDB Atlas."}
            ]
        }
        chat_resp_hist = self.client.post(
            "/api/chat",
            data=json.dumps(chat_payload_history),
            content_type="application/json"
        )
        self.assertEqual(chat_resp_hist.status_code, 200)
        chat_data_hist = json.loads(chat_resp_hist.data)
        self.assertTrue(chat_data_hist["success"])
        self.assertIn("quote", chat_data_hist["data"])
        ans_hist = chat_data_hist["data"]["answer"].lower()
        self.assertTrue(
            "indexing" in ans_hist or "performance" in ans_hist or "mongodb" in ans_hist or "context" in ans_hist,
            f"Expected memory retrieval answer. Got: {ans_hist}"
        )
        print("OK - Chatbot conversational history memory verification")

        # 4. Test Chatbot refusal for out-of-context question (Confidence Threshold)
        chat_payload_offtopic = {
            "question": "What is the capital of Japan?",
            "transcript_id": transcript_id
        }
        chat_resp_off = self.client.post(
            "/api/chat",
            data=json.dumps(chat_payload_offtopic),
            content_type="application/json"
        )
        self.assertEqual(chat_resp_off.status_code, 200)
        chat_data_off = json.loads(chat_resp_off.data)
        self.assertTrue(chat_data_off["success"])
        self.assertTrue(
            "couldn't find" in chat_data_off["data"]["answer"].lower() or 
            "sorry" in chat_data_off["data"]["answer"].lower() or 
            "transcript" in chat_data_off["data"]["answer"].lower()
        )
        print("OK - Chatbot confidence threshold grounding verification")

    def test_analysis_not_found(self):
        """Test fetching a non-existing record details."""
        response = self.client.get("/api/analysis/invalid-id-12345")
        self.assertEqual(response.status_code, 404)
        
        data = json.loads(response.data)
        self.assertFalse(data["success"])
        print("OK - Detail 404 handler")

if __name__ == "__main__":
    unittest.main()
