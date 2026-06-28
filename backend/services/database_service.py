import os
import sqlite3
import json
from datetime import datetime
from uuid import uuid4
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config.config import Config

class DatabaseService:
    def __init__(self):
        self.use_sqlite = False
        self.mongo_client = None
        self.db = None
        
        # Try to initialize MongoDB
        try:
            mongo_uri = Config.MONGO_URI
            print(f"Connecting to MongoDB at: {mongo_uri}")
            self.mongo_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
            # Force a connection check
            self.mongo_client.admin.command('ping')
            self.db = self.mongo_client.get_database()
            print("Successfully connected to MongoDB.")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            print(f"MongoDB connection failed: {e}. Falling back to SQLite database.")
            self.use_sqlite = True
            self._init_sqlite()

    def _init_sqlite(self):
        # Determine database path
        db_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.sqlite_path = os.path.join(db_dir, "local_database.db")
        
        conn = sqlite3.connect(self.sqlite_path)
        cursor = conn.cursor()
        # Create transcripts table if not exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transcripts (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                transcript TEXT NOT NULL,
                summary TEXT NOT NULL,
                sentiment TEXT NOT NULL, -- JSON string
                keywords TEXT NOT NULL,  -- JSON string
                word_frequency TEXT NOT NULL, -- JSON string
                upload_date TEXT NOT NULL,
                audio_path TEXT NOT NULL,
                duration REAL NOT NULL,
                word_count INTEGER NOT NULL,
                reading_time INTEGER NOT NULL
            )
        """)
        # Dynamic alter table schema if chunks is missing from a previous run
        try:
            cursor.execute("ALTER TABLE transcripts ADD COLUMN chunks TEXT")
            conn.commit()
        except sqlite3.OperationalError:
            # Column already exists
            pass
            
        conn.commit()
        conn.close()
        print(f"SQLite database initialized at: {self.sqlite_path}")

    def save_analysis(self, data):
        """Save a new transcript and analytics report."""
        doc_id = str(uuid4()) if "_id" not in data else str(data["_id"])
        
        # Structure the base record
        record = {
            "_id": doc_id,
            "filename": data.get("filename", ""),
            "transcript": data.get("transcript", ""),
            "summary": data.get("summary", ""),
            "sentiment": data.get("sentiment", {"label": "NEUTRAL", "score": 0.5}),
            "keywords": data.get("keywords", []),
            "word_frequency": data.get("word_frequency", []),
            "upload_date": data.get("upload_date", datetime.utcnow().isoformat()),
            "audio_path": data.get("audio_path", ""),
            "duration": float(data.get("duration", 0)),
            "word_count": int(data.get("word_count", 0)),
            "reading_time": int(data.get("reading_time", 0)),
            "chunks": data.get("chunks", [])
        }

        if not self.use_sqlite:
            try:
                self.db.transcripts.insert_one(record)
                return doc_id
            except Exception as e:
                print(f"MongoDB write failed: {e}. Attempting SQLite backup.")
                self.use_sqlite = True
                self._init_sqlite()
        
        # SQLite implementation
        conn = sqlite3.connect(self.sqlite_path)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO transcripts (
                id, filename, transcript, summary, sentiment, keywords, 
                word_frequency, upload_date, audio_path, duration, word_count, reading_time, chunks
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                record["_id"],
                record["filename"],
                record["transcript"],
                record["summary"],
                json.dumps(record["sentiment"]),
                json.dumps(record["keywords"]),
                json.dumps(record["word_frequency"]),
                record["upload_date"],
                record["audio_path"],
                record["duration"],
                record["word_count"],
                record["reading_time"],
                json.dumps(record["chunks"])
            )
        )
        conn.commit()
        conn.close()
        return doc_id

    def get_history(self):
        """Retrieve all previous analyses, ordered by date desc."""
        if not self.use_sqlite:
            try:
                cursor = self.db.transcripts.find().sort("upload_date", -1)
                results = []
                for doc in cursor:
                    doc["id"] = doc["_id"]  # UI matches ID field
                    results.append(doc)
                return results
            except Exception as e:
                print(f"MongoDB query failed: {e}. Switching to SQLite.")
                self.use_sqlite = True
                self._init_sqlite()

        # SQLite implementation
        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts ORDER BY upload_date DESC")
        rows = cursor.fetchall()
        conn.close()

        results = []
        for r in rows:
            # Safely check for chunks column in older db file states
            chunks_data = []
            try:
                chunks_data = json.loads(r["chunks"]) if r["chunks"] else []
            except (sqlite3.OperationalError, IndexError, KeyError):
                pass

            results.append({
                "id": r["id"],
                "_id": r["id"],
                "filename": r["filename"],
                "transcript": r["transcript"],
                "summary": r["summary"],
                "sentiment": json.loads(r["sentiment"]),
                "keywords": json.loads(r["keywords"]),
                "word_frequency": json.loads(r["word_frequency"]),
                "upload_date": r["upload_date"],
                "audio_path": r["audio_path"],
                "duration": r["duration"],
                "word_count": r["word_count"],
                "reading_time": r["reading_time"],
                "chunks": chunks_data
            })
        return results

    def get_analysis(self, doc_id):
        """Retrieve a single analysis report by its ID."""
        if not self.use_sqlite:
            try:
                doc = self.db.transcripts.find_one({"_id": doc_id})
                if doc:
                    doc["id"] = doc["_id"]
                    return doc
                return None
            except Exception as e:
                print(f"MongoDB search failed: {e}. Switching to SQLite.")
                self.use_sqlite = True
                self._init_sqlite()

        # SQLite implementation
        conn = sqlite3.connect(self.sqlite_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM transcripts WHERE id = ?", (doc_id,))
        r = cursor.fetchone()
        conn.close()

        if r:
            chunks_data = []
            try:
                chunks_data = json.loads(r["chunks"]) if r["chunks"] else []
            except (sqlite3.OperationalError, IndexError, KeyError):
                pass

            return {
                "id": r["id"],
                "_id": r["id"],
                "filename": r["filename"],
                "transcript": r["transcript"],
                "summary": r["summary"],
                "sentiment": json.loads(r["sentiment"]),
                "keywords": json.loads(r["keywords"]),
                "word_frequency": json.loads(r["word_frequency"]),
                "upload_date": r["upload_date"],
                "audio_path": r["audio_path"],
                "duration": r["duration"],
                "word_count": r["word_count"],
                "reading_time": r["reading_time"],
                "chunks": chunks_data
            }
        return None

# Singleton instance
db_service = DatabaseService()
