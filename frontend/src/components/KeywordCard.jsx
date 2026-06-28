import React from 'react';
import { FiTag, FiHash } from 'react-icons/fi';

const KeywordCard = ({ keywords = [] }) => {
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-250/30';
    if (score >= 0.6) return 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-250/30';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 border-slate-200/50 dark:border-slate-800';
  };

  return (
    <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Extracted Topics & Keywords
          </span>
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500">
            <FiHash className="w-4 h-4" />
          </div>
        </div>

        {keywords && keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 max-h-[140px] overflow-y-auto pr-1">
            {keywords.map((kw, i) => {
              const text = kw.text || kw[0];
              const score = kw.score !== undefined ? kw.score : kw[1] || 0;
              
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold select-none transition-all duration-200 hover:scale-105 ${getScoreColor(score)}`}
                >
                  <FiTag className="w-3 h-3 flex-shrink-0" />
                  <span>{text}</span>
                  <span className="text-[10px] opacity-75">
                    {Math.round(score * 100)}%
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
            <FiTag className="w-8 h-8 mb-2 stroke-1" />
            <p className="text-xs">No keywords extracted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordCard;
