import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { uploadAudio, transcribeAudio, analyzeTranscript, getAnalysis, getExportUrl } from '../services/api';
import UploadBox from '../components/UploadBox';
import AudioPlayer from '../components/AudioPlayer';
import TranscriptViewer from '../components/TranscriptViewer';
import SentimentCard from '../components/SentimentCard';
import KeywordCard from '../components/KeywordCard';
import SummaryCard from '../components/SummaryCard';
import ChartsSection from '../components/ChartsSection';
import Chatbot from '../components/Chatbot';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { FiDownload, FiPlusCircle, FiVolume2, FiCpu, FiMessageSquare } from 'react-icons/fi';

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const historyId = searchParams.get('id');

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Loaded Data
  const [analysisData, setAnalysisData] = useState(null);
  
  // Notification Toast
  const [toast, setToast] = useState(null);

  // Load from history if ID is present in URL query
  useEffect(() => {
    if (historyId) {
      loadHistoryAnalysis(historyId);
    }
  }, [historyId]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadHistoryAnalysis = async (id) => {
    setIsLoading(true);
    setCurrentStep(3); // Simulating loading/analytics step
    try {
      const response = await getAnalysis(id);
      if (response.data?.success) {
        setAnalysisData(response.data.data);
        showToast('Record loaded from history', 'info');
      } else {
        showToast('Failed to load record details', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading history analysis', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileProcessing = async (file) => {
    if (!file) return;

    setIsLoading(true);
    setCurrentStep(1);
    setUploadProgress(0);

    try {
      // 1. Upload File
      console.log('Step 1: Uploading Audio...');
      const uploadRes = await uploadAudio(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      if (!uploadRes.data?.success) {
        throw new Error(uploadRes.data?.message || 'File upload failed');
      }

      const { file_path, audio_url, filename } = uploadRes.data.data;

      // 2. Transcribe Audio
      console.log('Step 2: Transcribing Audio...');
      setCurrentStep(2);
      const transcribeRes = await transcribeAudio(file_path);
      
      if (!transcribeRes.data?.success) {
        throw new Error(transcribeRes.data?.message || 'Speech recognition failed');
      }

      const { transcript, duration } = transcribeRes.data.data;

      // 3. Analyze Transcript
      console.log('Step 3: Analyzing Transcript...');
      setCurrentStep(3);
      
      // Dynamic stepper progression for visual RAG steps
      const stepTimer4 = setTimeout(() => {
        setCurrentStep(4);
      }, 3500);
      
      const stepTimer5 = setTimeout(() => {
        setCurrentStep(5);
      }, 7500);

      const analyzeRes = await analyzeTranscript(transcript, filename, audio_url, duration);
      
      clearTimeout(stepTimer4);
      clearTimeout(stepTimer5);

      if (!analyzeRes.data?.success) {
        throw new Error(analyzeRes.data?.message || 'Text analytics failed');
      }

      // 4. Stored successfully
      setCurrentStep(5); // Complete
      setAnalysisData(analyzeRes.data.data);
      showToast('Audio processed successfully!', 'success');

    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'An error occurred during processing';
      showToast(errMsg, 'error');
      setAnalysisData(null);
    } finally {
      // Small visual delay before closing the loader
      setTimeout(() => {
        setIsLoading(false);
        // Clear query parameters if we processed a new file
        if (searchParams.get('id')) {
          setSearchParams({});
        }
      }, 500);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setSearchParams({});
  };

  const handleDownloadPDF = () => {
    if (!analysisData?.id) return;
    window.open(getExportUrl(analysisData.id), '_blank');
    showToast('Exporting report as PDF...', 'info');
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 md:pl-72 transition-colors duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Stepper Loader Overlay */}
      {isLoading && (
        <Loader currentStep={currentStep} uploadProgress={uploadProgress} />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header / Actions Area */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              VoxAnalytics Core Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {analysisData 
                ? `Visualizing details for: ${analysisData.filename}`
                : 'Upload an audio file to convert speech to insights.'
              }
            </p>
          </div>

          {analysisData && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-secondary text-xs font-semibold"
                title="Export report as PDF"
              >
                <FiDownload className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-xs font-semibold"
              >
                <FiPlusCircle className="w-4 h-4" />
                New Analysis
              </button>
            </div>
          )}
        </div>

        {/* 1. INITIAL STATE: Show drag-drop area */}
        {!analysisData && (
          <div className="w-full max-w-2xl mx-auto py-12">
            <div className="glass-card p-8 text-center space-y-6">
              <div className="max-w-md mx-auto space-y-2">
                <h2 className="text-xl font-bold text-slate-850 dark:text-white">Analyze Audio File</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an audio file containing conversational speech. The platform will automatically transcribe speech using Whisper AI and run NLP models.
                </p>
              </div>
              
              <UploadBox onFileSelected={handleFileProcessing} isLoading={isLoading} />
              
              {/* Feature Checklist */}
              <div className="grid grid-cols-2 gap-4 text-left border-t border-slate-100 dark:border-slate-800/60 pt-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <FiCpu className="w-4 h-4 text-indigo-500" />
                  <span>Whisper Speech Recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiVolume2 className="w-4 h-4 text-purple-500" />
                  <span>Interactive Audio Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>AI Q&A Chatbot Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiDownload className="w-4 h-4 text-amber-500" />
                  <span>Professional PDF Exports</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PROCESSED STATE: Show Analysis Dashboard */}
        {analysisData && (
          <div className="space-y-6">
            
            {/* Audio Player */}
            <div className="glass-panel p-4 rounded-2xl">
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-2">
                Playback Player
              </span>
              <AudioPlayer audioUrl={`https://speechanalytics-backend.onrender.com${analysisData.audio_path}`} />
            </div>

            {/* Core Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sentiment Card */}
              <div className="h-full">
                <SentimentCard sentiment={analysisData.sentiment} />
              </div>
              
              {/* Keywords Card */}
              <div className="h-full">
                <KeywordCard keywords={analysisData.keywords} />
              </div>

              {/* Summary Card */}
              <div className="h-full">
                <SummaryCard
                  summary={analysisData.summary}
                  metrics={{
                    duration: analysisData.duration,
                    wordCount: analysisData.word_count,
                    readingTime: analysisData.reading_time,
                  }}
                />
              </div>
            </div>

            {/* Recharts Layout */}
            <ChartsSection
              wordFrequency={analysisData.word_frequency}
              sentiment={analysisData.sentiment}
              metrics={{
                duration: analysisData.duration,
                wordCount: analysisData.word_count,
              }}
            />

            {/* Transcription output & Chatbot Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transcript Viewer (2/3 width) */}
              <div className="lg:col-span-2 flex flex-col">
                <TranscriptViewer transcript={analysisData.transcript} />
              </div>
              
              {/* QA Chatbot (1/3 width) */}
              <div className="lg:col-span-1 flex flex-col">
                <Chatbot transcript={analysisData.transcript} summary={analysisData.summary} transcriptId={analysisData.id} />
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
