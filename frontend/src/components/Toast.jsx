import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <FiCheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <FiXCircle className="w-5 h-5 text-rose-500" />,
    info: <FiInfo className="w-5 h-5 text-indigo-500" />,
  };

  const bgClasses = {
    success: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500/30 text-slate-800 dark:text-emerald-250',
    error: 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-500/30 text-slate-800 dark:text-rose-250',
    info: 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500/30 text-slate-800 dark:text-indigo-250',
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 border rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${bgClasses[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium pr-2">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
      >
        <FiX className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350" />
      </button>
    </div>
  );
};

export default Toast;
