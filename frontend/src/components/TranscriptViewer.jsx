import React, { useState } from 'react';
import { FiCopy, FiCheck, FiSearch, FiFileText } from 'react-icons/fi';

const TranscriptViewer = ({ transcript }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const highlightMatches = (text, search) => {
    if (!search.trim()) return text;
    
    // Escape special regex characters
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark 
          key={index} 
          className="bg-amber-300/70 dark:bg-amber-500/30 text-slate-950 dark:text-amber-200 rounded-sm px-0.5 font-medium transition-colors"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/40 overflow-hidden shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200/50 dark:border-slate-800/40 bg-white/20 dark:bg-slate-905/30">
        <div className="flex items-center gap-2">
          <FiFileText className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Transcription Output</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-initial">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100/50 border border-slate-205 focus:border-indigo-500 focus:bg-white dark:bg-slate-950/40 dark:border-slate-800 dark:focus:bg-slate-950 outline-none text-slate-800 dark:text-slate-100 transition-all"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!transcript}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copied
                ? 'border-emerald-500/30 bg-emerald-550/10 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 hover:border-indigo-500 text-slate-600 dark:text-slate-400 dark:border-slate-850 dark:hover:text-white'
            }`}
            title="Copy full transcript"
          >
            {copied ? (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <FiCopy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcript Text Container */}
      <div className="flex-1 p-5 overflow-y-auto max-h-[360px] text-sm leading-relaxed text-slate-700 dark:text-slate-350 select-text whitespace-pre-line font-sans">
        {transcript ? (
          highlightMatches(transcript, searchTerm)
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-550">
            <FiFileText className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm">Transcription results will appear here once audio is uploaded and processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptViewer;
