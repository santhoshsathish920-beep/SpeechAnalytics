import axios from 'axios';

const API_BASE_URL = 'https://speechanalytics-backend.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadAudio = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export const transcribeAudio = (filePath) => {
  return apiClient.post('/transcribe', { file_path: filePath });
};

export const analyzeTranscript = (transcript, filename, audioPath, duration) => {
  return apiClient.post('/analyze', {
    transcript,
    filename,
    audio_path: audioPath,
    duration,
  });
};

export const getHistory = () => {
  return apiClient.get('/history');
};

export const getAnalysis = (id) => {
  return apiClient.get(`/analysis/${id}`);
};

export const getExportUrl = (id) => {
  return `${API_BASE_URL}/export/${id}`;
};

export const chatWithTranscript = (question, transcriptId, history = []) => {
  return apiClient.post('/chat', { question, transcript_id: transcriptId, history });
};

export default apiClient;
