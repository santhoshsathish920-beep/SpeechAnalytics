import React from 'react';
import { FiUploadCloud, FiCpu, FiBarChart2, FiBookOpen, FiMessageSquare, FiCheck } from 'react-icons/fi';

const Loader = ({ currentStep = 1, uploadProgress = 0 }) => {
  const steps = [
    { id: 1, label: 'Uploading Audio', description: 'Sending file to server', icon: FiUploadCloud },
    { id: 2, label: 'Transcribing Speech', description: 'Whisper converting speech to text', icon: FiCpu },
    { id: 3, label: 'NLP Sentiment & Keywords', description: 'Analyzing emotional tone & topics', icon: FiBarChart2 },
    { id: 4, label: 'Generating Summary', description: 'BART model condensing conversation', icon: FiBookOpen },
    { id: 5, label: 'Preparing Chatbot', description: 'Generating RAG semantic search embeddings', icon: FiMessageSquare },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center">
        {/* Loading Spinner Header */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-slate-950 flex items-center justify-center">
            <span className="text-xs text-indigo-400 font-bold font-mono">
              {currentStep === 1 ? `${uploadProgress}%` : 'AI'}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 font-sans tracking-wide">Processing Audio</h3>
        <p className="text-sm text-slate-400 mb-8">Please wait, analyzing speech insights...</p>

        {/* Steps List */}
        <div className="space-y-5 text-left">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            let iconColor = 'text-slate-600 bg-slate-950 border-slate-850';
            let textColor = 'text-slate-500';
            let descColor = 'text-slate-600';

            if (isCompleted) {
              iconColor = 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30';
              textColor = 'text-slate-350';
              descColor = 'text-slate-450';
            } else if (isActive) {
              iconColor = 'text-indigo-400 bg-indigo-950/30 border-indigo-500/40 shadow-lg shadow-indigo-500/10 animate-pulse';
              textColor = 'text-white font-semibold';
              descColor = 'text-slate-350';
            }

            return (
              <div key={step.id} className="flex gap-4 items-start">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300 ${iconColor}`}>
                  {isCompleted ? <FiCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`text-sm transition-colors duration-300 ${textColor}`}>
                    {step.label}
                  </h4>
                  <p className={`text-xs transition-colors duration-300 ${descColor}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Loader;
