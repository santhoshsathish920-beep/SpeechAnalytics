import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiCpu, FiUser } from 'react-icons/fi';
import { chatWithTranscript } from '../services/api';

const Chatbot = ({ transcript, summary, transcriptId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your VoxAnalytics Q&A assistant. Ask me anything about this transcript, and I'll find the answers for you.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const processQuestion = (question, text, docSummary) => {
    const qLower = question.toLowerCase();
    
    if (!text || !text.trim()) {
      return "It seems we don't have a transcript loaded yet. Please upload an audio file first.";
    }

    // Split transcript into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Help commands
    if (qLower.includes('hello') || qLower.includes('hi') || qLower.includes('hey')) {
      return "Hi there! I'm here to analyze the transcript. Try asking questions like 'What is the main topic?', 'Summarize this', or search for specific words.";
    }
    
    if (qLower.includes('summarize') || qLower.includes('summary') || qLower.includes('executive summary')) {
      return `Here is a summary of the conversation:\n\n"${docSummary || 'No summary compiled yet.'}"`;
    }

    if (qLower.includes('sentiment') || qLower.includes('tone') || qLower.includes('feeling')) {
      return "The system evaluated the overall tone of this audio. You can view the full sentiment rating card and confidence scores on your dashboard panel.";
    }

    // Search for keywords
    // Extract keywords from the question (words larger than 3 characters, ignoring question words)
    const stopQuestionWords = ['what', 'when', 'where', 'who', 'how', 'why', 'does', 'is', 'are', 'the', 'about', 'mention', 'say', 'tell', 'explain', 'show'];
    const keywords = qLower
      .replace(/[?.,!]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopQuestionWords.includes(w));

    if (keywords.length === 0) {
      return "I'm not sure which specific topic you are asking about. Can you please rephrase with keywords like 'support', 'billing', 'sprint', or 'artificial intelligence'?";
    }

    // Find sentences that match the most keywords
    const matches = [];
    sentences.forEach((sentence) => {
      let score = 0;
      keywords.forEach(kw => {
        if (sentence.toLowerCase().includes(kw)) {
          score += 1;
        }
      });
      if (score > 0) {
        matches.push({ sentence: sentence.trim(), score });
      }
    });

    if (matches.length > 0) {
      // Sort by match score descending
      matches.sort((a, b) => b.score - a.score);
      const topMatches = matches.slice(0, 3).map(m => m.sentence);
      
      return `Based on the transcript context, here are the most relevant sections I found concerning "${keywords.join(', ')}":\n\n${topMatches.map((s, idx) => `${idx + 1}. "... ${s} ..."`).join('\n\n')}`;
    }

    return `I searched the transcript but couldn't find any direct mentions matching "${keywords.join(', ')}". Try searching for other terms or ask for a "summary" of the document!`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessageText = input;
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // If we have a transcriptId, run real AI RAG. Otherwise run local keyword match fallback.
    if (transcriptId) {
      setIsThinking(true);
      try {
        console.log(`Sending question to RAG: '${userMessageText}' for ID: ${transcriptId}`);
        
        // Prepare context history for conversational memory
        const formattedHistory = messages
          .filter(msg => msg.id !== 1) // exclude first welcome greeting message
          .map(msg => ({ sender: msg.sender, text: msg.text }));
        
        // Add current user message
        formattedHistory.push({ sender: 'user', text: userMessageText });
        
        const response = await chatWithTranscript(userMessageText, transcriptId, formattedHistory);
        
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: response.data?.data?.answer || "I received an empty response. Try rephrasing.",
          quote: response.data?.data?.quote || "",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || "Failed to get an answer from the AI server. Check backend logs.";
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Error: ${errMsg}`,
          quote: "",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMessage]);
      } finally {
        setIsThinking(false);
      }
    } else {
      setIsThinking(true);
      setTimeout(() => {
        const answer = processQuestion(userMessageText, transcript, summary);
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: answer,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsThinking(false);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden shadow-sm">
      {/* Chatbot Header */}
      <div className="flex items-center gap-2.5 p-4 border-b border-slate-200/50 dark:border-slate-800/40 bg-white/20 dark:bg-slate-905/30">
        <div className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-indigo-500 text-white">
          <FiMessageSquare className="w-4 h-4" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-850 dark:text-white">AI Transcript Chatbot</span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-550 font-bold -mt-0.5">Ask questions about audio</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[280px]">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          
          return (
            <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}>
              <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${isBot ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350'}`}>
                {isBot ? <FiCpu className="w-3.5 h-3.5" /> : <FiUser className="w-3.5 h-3.5" />}
              </div>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                isBot 
                  ? 'bg-slate-100 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850/60 text-slate-750 dark:text-slate-300'
                  : 'bg-indigo-500 text-white font-medium'
              }`}>
                <div>{msg.text}</div>
                {isBot && msg.quote && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1">Supporting Quote</span>
                    <blockquote className="pl-2.5 border-l-2 border-indigo-550 text-slate-500 dark:text-slate-400 italic text-[11px] bg-slate-200/20 dark:bg-slate-950/30 py-1.5 px-2 rounded-r-lg">
                      "{msg.quote}"
                    </blockquote>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isThinking && (
          <div className="flex gap-2.5 max-w-[85%] animate-pulse">
            <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 bg-indigo-500 text-white">
              <FiCpu className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl text-xs bg-slate-100 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-850/60 text-slate-400">
              Analyzing context...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200/50 dark:border-slate-800/40 bg-white/10 dark:bg-slate-905/10 flex gap-2">
        <input
          type="text"
          placeholder={transcript ? "Ask something about the audio..." : "Load a transcript first..."}
          disabled={!transcript || isThinking}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-105 border border-slate-205 focus:border-indigo-500 focus:bg-white dark:bg-slate-950/40 dark:border-slate-800/80 dark:focus:bg-slate-950 px-3.5 py-2 text-xs rounded-xl outline-none text-slate-850 dark:text-white transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!transcript || !input.trim() || isThinking}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white transition-colors active:scale-95 flex-shrink-0"
        >
          <FiSend className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
