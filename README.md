# VoxAnalytics - Speech-to-Text Analytics Platform

VoxAnalytics is a complete, production-ready, full-stack Speech-to-Text and NLP analytics platform. It converts spoken audio (MP3, WAV, M4A) into high-fidelity transcripts using OpenAI's Whisper model and applies Natural Language Processing (NLP) models to automatically generate summaries, sentiment classifications, keyword rankings, and interactive data charts.

This project is structured for university placement evaluations, showcasing AI integration, database design, robust software architecture, and a modern glassmorphic SaaS dashboard interface.

---

## 🚀 Key Features

1. **Multi-Format Audio Uploading:** Seamless drag-and-drop file upload zone supporting `.mp3`, `.wav`, and `.m4a` files up to 50MB.
2. **Speech Recognition (Whisper):** Integrates OpenAI's `whisper-base` model locally to transcribe speech into text.
3. **Sentiment Analysis:** Analyzes the speaker's emotional tone (Positive, Neutral, Negative) using Hugging Face pipelines or lexicon rules.
4. **Keyphrase Extraction:** Automatically extracts key topics and tags using the KeyBERT model or tf-idf frequency scoring.
5. **Automatic Summarization:** Creates high-level executive summaries of long transcripts using BART Transformer pipelines.
6. **Recharts Data Visualizations:** Renders word frequency bars, sentiment breakdowns (Pie Chart), and voice profile density (Radar Chart).
7. **Document Q&A Chatbot:** An offline contextual AI chat assistant to query transcripts for specific keywords, themes, and summaries.
8. **PDF Report Export:** Compiles all analysis details, metrics, keywords, and transcript text into a downloadable corporate PDF report.
9. **Upload History Repository:** Stores all past sessions in MongoDB (with transparent local SQLite fallback) allowing one-click workspace reloads.
10. **Dark/Light Mode Theme:** Dynamic UI theme toggling using Tailwind CSS configuration, with glassmorphism dashboard cards.

---

## 🛠️ Technology Stack

**Frontend:**
- React.js (Vite template for fast builds)
- Tailwind CSS (Glassmorphism design tokens)
- Recharts (SVG data visualizations)
- Axios & React Icons & React Router

**Backend:**
- Python Flask (Modular blueprints)
- Flask-CORS (Cross-origin safety)
- PyMongo (MongoDB Atlas client)
- FPDF (PDF reporting stream)

**AI / NLP Engine:**
- OpenAI Whisper Base (Speech recognition)
- KeyBERT (Semantic keyword mining)
- Hugging Face Transformers (Summarization & Sentiment pipelines)
- NLTK (Stopwords and Tokenizers)

---

## 📂 Project Structure

```
speech-to-text-analytics/
├── backend/
│   ├── app.py                     # Backend gateway entry point
│   ├── config/
│   │   └── config.py              # Environment variables parser
│   ├── routes/
│   │   ├── upload.py              # POST /api/upload
│   │   ├── transcribe.py          # POST /api/transcribe
│   │   ├── analyze.py             # POST /api/analyze
│   │   ├── history.py             # GET /api/history
│   │   ├── analysis.py            # GET /api/analysis/<id>
│   │   └── export.py              # GET /api/export/<id>
│   ├── services/
│   │   ├── database_service.py    # MongoDB + SQLite fallback logic
│   │   ├── transcription_service.py # Whisper + Mock speech fallback
│   │   ├── analytics_service.py   # Transformers + Rule-based fallback
│   │   └── pdf_service.py         # PDF Report Compiler
│   ├── utils/
│   │   └── helpers.py             # Shared response & validation helpers
│   ├── uploads/                   # Local storage for audio files and PDFs
│   ├── requirements.txt           # Python backend dependencies
│   └── .env                       # Backend local configuration
└── frontend/
    ├── src/
    │   ├── components/            # Reusable UI widgets
    │   ├── pages/                 # Landing, Dashboard, History views
    │   ├── services/              # Axios API client mappings
    │   ├── context/               # Dark mode theme state
    │   ├── index.css              # Custom Tailwind directives & glasses
    │   └── App.jsx                # Router & Theme boundaries
    ├── index.html                 # App container with SEO tags
    ├── tailwind.config.js         # Theme layout customizers
    └── package.json               # Frontend Node modules
```

---

## ⚡ Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 - v3.11 recommended)
- **FFmpeg** (Required by OpenAI Whisper for audio extraction and decoding)
  - **Windows:** Download executable binaries from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) (or run `choco install ffmpeg` / `scoop install ffmpeg`) and add the `bin` directory to your system's PATH.
  - **macOS:** Run `brew install ffmpeg` via Homebrew.
  - **Linux (Ubuntu/Debian):** Run `sudo apt update && sudo apt install -y ffmpeg`.
- **MongoDB** (Optional. The backend automatically spins up a local SQLite database `local_database.db` if MongoDB is unavailable)

### 2. Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the environment variables in `backend/.env`:
   ```ini
   PORT=5000
   FLASK_DEBUG=True
   MONGO_URI=mongodb://localhost:27017/speech_analytics
   USE_MOCK_AI=True  # Set to False to load full neural network models
   ```
5. Run the Flask server:
   ```bash
   python app.py
   ```
   *The backend will boot on `http://localhost:5000`.*

> 💡 **Demo / Presentation Tip:**
> Heavy neural network downloads and model initialization might freeze or fail on systems without discrete graphics cards. Setting `USE_MOCK_AI=True` in `.env` runs the system on an optimized rule-based TF-IDF and keyword dictionary fallback. This lets the application boot in under 2 seconds and process transcripts instantly!

---

### 3. Frontend Setup
1. Open another terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to view the application.*

---

## 🛰️ API Endpoint Documentation

| Method | Endpoint | Request Body / Parameters | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/upload` | Form-Data: `file` (audio binary) | Uploads and registers audio. Capped at 50MB. |
| **POST** | `/api/transcribe` | `{ "file_path": "uploads/file.wav" }` | Initiates real Whisper transcription. |
| **POST** | `/api/analyze` | `{ "transcript": "...", "filename": "...", ... }` | Runs real NLP pipelines, caches embeddings, and saves to DB. |
| **POST** | `/api/chat` | `{ "question": "...", "transcript_id": "..." }` | Contextual Q&A search over the transcript using MiniLM & QA models. |
| **GET** | `/api/history` | *None* | Returns list of all previously processed sessions. |
| **GET** | `/api/analysis/<id>` | Path Parameter: `id` | Fetches full transcript details for a specific ID. |
| **GET** | `/api/export/<id>` | Path Parameter: `id` | Generates and downloads the PDF report. |
| **GET** | `/api/uploads/<file>` | Path Parameter: `file` | Serves uploaded audio files for playback. |

---

## 🌐 Deployment Guidelines

### Frontend Deployment (Vercel)
Vite frontends can be deployed with one click to Vercel:
1. Initialize a Git repository in `frontend/` and push to GitHub.
2. Link your repository in the Vercel dashboard.
3. Configure the output directory as `dist` and build command as `npm run build`.
4. Add environment configurations if necessary.

### Backend Deployment (Render)
To deploy the Python Flask backend on Render:
1. Put the backend directory into a Git repository.
2. In Render, select **Web Service**.
3. Choose Python environment, set build command to `pip install -r requirements.txt`, and start command to `gunicorn app:app` (ensure `gunicorn` is added to `requirements.txt`).
4. Set the `MONGO_URI` to a MongoDB Atlas cluster URL and set `USE_MOCK_AI=True` (since Render free tiers do not support GPU/high-memory allocations required by Whisper/BART models).
