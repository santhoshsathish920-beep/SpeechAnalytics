import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, getExportUrl } from '../services/api';
import Toast from '../components/Toast';
import { FiSearch, FiFileText, FiDownload, FiFolder, FiClock, FiActivity, FiSmile, FiMeh, FiFrown } from 'react-icons/fi';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistoryList();
  }, []);

  useEffect(() => {
    // Filter history based on search term
    const search = searchTerm.toLowerCase();
    const filtered = history.filter(item => 
      item.filename.toLowerCase().includes(search) || 
      item.transcript.toLowerCase().includes(search) ||
      item.summary.toLowerCase().includes(search)
    );
    setFilteredHistory(filtered);
  }, [searchTerm, history]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchHistoryList = async () => {
    setLoading(true);
    try {
      const response = await getHistory();
      if (response.data?.success) {
        setHistory(response.data.data);
        setFilteredHistory(response.data.data);
      } else {
        showToast('Failed to fetch history', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to database history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRecord = (id) => {
    navigate(`/dashboard?id=${id}`);
  };

  const handleDownloadPDF = (id) => {
    window.open(getExportUrl(id), '_blank');
    showToast('Exporting report as PDF...', 'info');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (err) {
      return dateStr;
    }
  };

  const getSentimentIcon = (label) => {
    const config = {
      POSITIVE: <FiSmile className="w-4 h-4 text-emerald-500" />,
      NEGATIVE: <FiFrown className="w-4 h-4 text-rose-500" />,
      NEUTRAL: <FiMeh className="w-4 h-4 text-amber-500" />
    };
    return config[label] || config.NEUTRAL;
  };

  const getSentimentPill = (label) => {
    const config = {
      POSITIVE: 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      NEGATIVE: 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-500/20 text-rose-600 dark:text-rose-450',
      NEUTRAL: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-500/20 text-amber-600 dark:text-amber-400'
    };
    return `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config[label] || config.NEUTRAL}`;
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

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Upload History
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse, search, and reload previous speech analytics reports from the database.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search history files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-slate-205 focus:border-indigo-500 focus:bg-white dark:bg-slate-900/40 dark:border-slate-800 dark:focus:bg-slate-900 outline-none text-slate-800 dark:text-slate-100 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-slate-350 dark:border-slate-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Loading history records...</p>
          </div>
        ) : filteredHistory.length > 0 ? (
          /* History Records List */
          <div className="grid grid-cols-1 gap-4">
            {filteredHistory.map((record) => {
              const sentiment = record.sentiment?.label || 'NEUTRAL';
              
              return (
                <div 
                  key={record.id}
                  className="glass-panel p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/2 dark:hover:shadow-indigo-500/5 transition-all duration-200 border border-slate-200/45 dark:border-slate-800/40"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex-shrink-0">
                      <FiFileText className="w-5.5 h-5.5" />
                    </div>
                    
                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-850 dark:text-white truncate max-w-sm sm:max-w-md">
                          {record.filename}
                        </h3>
                        <span className={getSentimentPill(sentiment)}>
                          {getSentimentIcon(sentiment)}
                          {sentiment}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-2xl font-sans">
                        {record.summary || record.transcript}
                      </p>
                      
                      {/* Grid metrics details */}
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-450 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          {formatDuration(record.duration)}
                        </span>
                        <span>•</span>
                        <span>{record.word_count} words</span>
                        <span>•</span>
                        <span>{formatDate(record.upload_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => handleDownloadPDF(record.id)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 text-slate-600 dark:text-slate-400 dark:border-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-semibold flex items-center gap-2 transition-all"
                      title="Download PDF report"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                      onClick={() => handleLoadRecord(record.id)}
                      className="p-2.5 rounded-xl btn-primary text-xs font-semibold flex items-center gap-2"
                      title="Load this session in workspace"
                    >
                      <FiFolder className="w-4 h-4" />
                      Workspace
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="glass-card p-12 text-center py-20 max-w-md mx-auto">
            <FiActivity className="w-12 h-12 text-slate-400 dark:text-slate-550 mx-auto mb-4 stroke-1 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-2">No history found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {searchTerm 
                ? "No transcripts match your search criteria. Try typing different keywords."
                : "You haven't processed any speech transcripts yet. Get started on the dashboard!"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 rounded-xl btn-primary text-xs font-semibold"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;
