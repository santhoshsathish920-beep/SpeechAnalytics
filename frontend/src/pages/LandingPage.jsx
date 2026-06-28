import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiActivity, FiCpu, FiMessageSquare, FiTrendingUp, FiLayers, FiFileText } from 'react-icons/fi';

const LandingPage = () => {
  const features = [
    {
      icon: FiCpu,
      title: "Speech Recognition",
      description: "Convert MP3, WAV, and M4A audio files into structured text using OpenAI's Whisper model."
    },
    {
      icon: FiTrendingUp,
      title: "Sentiment & NLP Insights",
      description: "Analyze emotional tones (positive, neutral, negative) and confidence values with Hugging Face pipelines."
    },
    {
      icon: FiMessageSquare,
      title: "AI Q&A Chatbot",
      description: "Chat directly with your audio file transcript. Query facts, ask questions, or verify details instantly."
    },
    {
      icon: FiFileText,
      title: "Automatic Summaries",
      description: "Generate bulletproof executive summaries of long conversations instantly using extractive summarizers."
    },
    {
      icon: FiActivity,
      title: "Interactive Recharts",
      description: "Visualize vocabulary density, word frequencies, and voice profiles with sleek SVG dashboards."
    },
    {
      icon: FiLayers,
      title: "PDF Report Export",
      description: "Download fully formatted PDF corporate analysis files containing summaries, metadata, and full transcripts."
    }
  ];

  const techStack = [
    { name: "React.js", category: "Frontend Core" },
    { name: "Tailwind CSS", category: "SaaS UI Styling" },
    { name: "Python Flask", category: "API Gateway" },
    { name: "MongoDB", category: "NoSQL Database" },
    { name: "OpenAI Whisper", category: "Voice-to-Text" },
    { name: "KeyBERT", category: "Topic Extraction" },
    { name: "Hugging Face", category: "NLP Sentiment" }
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100">
      
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="max-w-4xl text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-250 bg-indigo-50/50 dark:border-indigo-950/50 dark:bg-indigo-950/20 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-6 uppercase tracking-wider">
          <FiActivity className="w-3.5 h-3.5" /> Speech-to-Text Analytics Platform
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-sans text-slate-900 dark:text-white leading-tight">
          Unlock Hidden Insights From <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
            Your Spoken Voice
          </span>
        </h1>
        
        <p className="mt-6 text-base sm:text-lg max-w-2xl mx-auto text-slate-555 dark:text-slate-400 font-sans leading-relaxed">
          VoxAnalytics transforms audio recordings into high-fidelity text transcripts, automatically extracts keywords, compiles executive summaries, runs sentiment scores, and plots graphs.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl btn-primary flex items-center justify-center gap-2 text-sm font-semibold"
          >
            Launch Platform Dashboard
            <FiArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl btn-secondary text-sm font-semibold flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="w-full max-w-5xl mb-24 text-center">
        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-widest block mb-4">
          Integrated Technologies
        </span>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {techStack.map((tech) => (
            <div 
              key={tech.name}
              className="px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col items-center"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-250">{tech.name}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">{tech.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-sans">
            Comprehensive Analytical Features
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-450">
            A placement-level implementation of full-stack AI engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mt-24 pt-8 border-t border-slate-200/40 dark:border-slate-850/60 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Speech-to-Text Analytics Platform &copy; 2026. Built with Python & React.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
