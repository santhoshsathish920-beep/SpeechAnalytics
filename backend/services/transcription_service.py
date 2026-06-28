import os
import wave
import time
import shutil
from config.config import Config

class TranscriptionService:
    def __init__(self):
        self.whisper_model = None
        self.is_loaded = False
        
        # Pre-check for FFmpeg dependency
        self.ffmpeg_available = shutil.which("ffmpeg") is not None
        if not self.ffmpeg_available:
            print("WARNING: FFmpeg was not detected in the system PATH. "
                  "OpenAI Whisper requires FFmpeg to decode audio. Transcription requests will raise errors.")

    def load_model(self):
        """Loads Whisper base model lazily on the first request to save startup memory."""
        if not self.is_loaded:
            if not self.ffmpeg_available:
                raise RuntimeError(
                    "FFmpeg is not installed or not found in system PATH.\n"
                    "FFmpeg is required by OpenAI Whisper to extract and load audio streams.\n"
                    "Please refer to the FFmpeg Setup Guide in the project README to install it."
                )
            
            print("Loading OpenAI Whisper base model (lazily)...")
            import whisper
            import torch
            
            # Check for GPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"Whisper is initializing on device: {device}")
            self.whisper_model = whisper.load_model("base", device=device)
            self.is_loaded = True
            print("Whisper model loaded successfully.")

    def _estimate_duration(self, file_path):
        """Fallback WAV duration reader in case Whisper parsing fails."""
        if file_path.lower().endswith(".wav"):
            try:
                with wave.open(file_path, "rb") as wav_file:
                    frames = wav_file.getnframes()
                    rate = wav_file.getframerate()
                    duration = frames / float(rate)
                    if duration > 0:
                        return round(duration, 2)
            except Exception:
                pass
        
        try:
            file_size_bytes = os.path.getsize(file_path)
            # Estimate: ~128kbps audio (16 KB/sec)
            return round(file_size_bytes / 16000.0, 2)
        except Exception:
            return 30.0

    def transcribe(self, file_path):
        """Transcribe audio file to text using OpenAI Whisper."""
        if not self.ffmpeg_available:
            raise RuntimeError(
                "FFmpeg is not installed or not found in system PATH. "
                "OpenAI Whisper cannot decode audio streams. "
                "Please check the setup instructions in the README to install FFmpeg."
            )
        
        start_time = time.time()
        
        # Trigger lazy model loading
        self.load_model()
        
        try:
            print(f"Transcribing audio file {file_path} using Whisper...")
            # Run transcription. verbose=True outputs segments to terminal in real-time for progress monitoring.
            result = self.whisper_model.transcribe(file_path, verbose=True)
            transcript_text = result.get("text", "").strip()
            
            if not transcript_text:
                transcript_text = "Audio processed but no clear speech was recognized."
            
            # Extract duration from transcription segments
            duration = 0.0
            if result.get("segments"):
                duration = result["segments"][-1].get("end", 0.0)
            else:
                duration = self._estimate_duration(file_path)
                
            print(f"Whisper transcription completed in {time.time() - start_time:.2f} seconds.")
            return {
                "success": True,
                "transcript": transcript_text,
                "duration": round(duration, 2),
                "engine": "OpenAI Whisper Base"
            }
        except Exception as e:
            print(f"Error during transcription: {e}")
            raise RuntimeError(f"Whisper transcription error: {str(e)}")

# Singleton instance
transcription_service = TranscriptionService()
