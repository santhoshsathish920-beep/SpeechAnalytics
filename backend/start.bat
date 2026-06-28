@echo off
REM =====================================================================
REM  Speech-to-Text Analytics Backend - Startup Script
REM  Always runs Flask using the project's virtual environment so that
REM  transformers==4.38.1 / torch==2.2.1 are used (not the global copies).
REM =====================================================================
echo Starting Speech-to-Text Analytics Backend (venv)...
"%~dp0venv\Scripts\python.exe" -m flask --app app run --host=0.0.0.0 --port=5000
