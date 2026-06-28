import React from 'react';
import { FiBookOpen, FiClock, FiFileText, FiZap } from 'react-icons/fi';

const SummaryCard = ({ summary, metrics = {} }) => {
  const duration = metrics.duration || 0;
  const wordCount = metrics.wordCount || 0;
  const readingTime = metrics.readingTime || 0;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatReadingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            AI Summary & Document Statistics
          </span>
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500">
            <FiZap className="w-4 h-4" />
          </div>
        </div>

        {/* AI Summary Block */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-2 flex items-center gap-1.5">
            <FiBookOpen className="w-4.5 h-4.5 text-indigo-500" />
            Executive Summary
          </h4>
          <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-350 bg-white/30 dark:bg-slate-955/30 p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/30">
            {summary || 'No summary compiled yet. Upload and analyze an audio file.'}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
        {/* Metric 1 */}
        <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/20">
          <div className="flex items-center justify-center text-indigo-500 mb-1">
            <FiClock className="w-4 h-4" />
          </div>
          <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">Duration</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{formatDuration(duration)}</span>
        </div>

        {/* Metric 2 */}
        <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/20">
          <div className="flex items-center justify-center text-purple-500 mb-1">
            <FiFileText className="w-4 h-4" />
          </div>
          <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">Words</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{wordCount}</span>
        </div>

        {/* Metric 3 */}
        <div className="text-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/30 dark:border-slate-800/20">
          <div className="flex items-center justify-center text-emerald-500 mb-1">
            <FiBookOpen className="w-4 h-4" />
          </div>
          <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">Speaking</span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{formatReadingTime(readingTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
