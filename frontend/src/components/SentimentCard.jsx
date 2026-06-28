import React from 'react';
import { FiSmile, FiMeh, FiFrown, FiTrendingUp, FiInfo, FiActivity } from 'react-icons/fi';

const SentimentCard = ({ sentiment }) => {
  const label = sentiment?.label || 'NEUTRAL';
  const score = sentiment?.score !== undefined ? sentiment.score : 0.5;

  const config = {
    POSITIVE: {
      color: 'text-emerald-550 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-500/20',
      progressColor: 'bg-emerald-500',
      icon: <FiSmile className="w-8 h-8 text-emerald-550 dark:text-emerald-400" />,
      tag: 'Positive Mood'
    },
    NEGATIVE: {
      color: 'text-rose-550 dark:text-rose-450 bg-rose-50/50 dark:bg-rose-950/30 border-rose-500/20',
      progressColor: 'bg-rose-500',
      icon: <FiFrown className="w-8 h-8 text-rose-550 dark:text-rose-450" />,
      tag: 'Negative / Alert'
    },
    NEUTRAL: {
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/20',
      progressColor: 'bg-amber-500',
      icon: <FiMeh className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
      tag: 'Neutral / Informational'
    },
    INFORMATIVE: {
      color: 'text-blue-550 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 border-blue-500/20',
      progressColor: 'bg-blue-500',
      icon: <FiInfo className="w-8 h-8 text-blue-550 dark:text-blue-400" />,
      tag: 'Informational / Knowledge'
    },
    ANALYTICAL: {
      color: 'text-violet-550 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/30 border-violet-500/20',
      progressColor: 'bg-violet-500',
      icon: <FiTrendingUp className="w-8 h-8 text-violet-550 dark:text-violet-400" />,
      tag: 'Analytical / Logical'
    },
    MIXED: {
      color: 'text-orange-550 dark:text-orange-450 bg-orange-50/50 dark:bg-orange-950/30 border-orange-500/20',
      progressColor: 'bg-orange-500',
      icon: <FiActivity className="w-8 h-8 text-orange-550 dark:text-orange-450" />,
      tag: 'Mixed Tone / Balanced'
    }
  };

  const current = config[label] || config.NEUTRAL;

  return (
    <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Sentiment Analysis
        </span>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500">
          <FiTrendingUp className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl border ${current.color} flex-shrink-0`}>
          {current.icon}
        </div>
        <div>
          <h4 className="text-2xl font-black text-slate-850 dark:text-white leading-tight">
            {label}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-550">
            {current.tag}
          </span>
        </div>
      </div>

      {/* Confidence Level progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-450">
          <span>Model Confidence</span>
          <span>{Math.round(score * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${current.progressColor}`}
            style={{ width: `${score * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SentimentCard;
