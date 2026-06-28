import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiFile, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const UploadBox = ({ onFileSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedExtensions = ['mp3', 'wav', 'm4a'];
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!file) return false;
    
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      setError(`Unsupported format. Please upload: ${allowedExtensions.join(', ').toUpperCase()}`);
      setSelectedFile(null);
      return false;
    }
    
    if (file.size > maxSizeBytes) {
      setError('File is too large. Maximum size is 50MB.');
      setSelectedFile(null);
      return false;
    }
    
    setError('');
    setSelectedFile(file);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onFileSelected(file);
      }
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelected(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={!selectedFile ? onButtonClick : undefined}
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 cursor-default'
            : 'border-slate-350 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-850/30'
        } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp3,.wav,.m4a"
          onChange={handleChange}
          disabled={isLoading}
        />

        {!selectedFile ? (
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FiUploadCloud className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Drag & drop audio file, or <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">browse</span>
            </p>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Supports MP3, WAV, M4A up to 50MB
            </p>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between gap-4 p-3 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-100 dark:border-slate-905 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <FiFile className="w-5 h-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Remove file"
              >
                <FiTrash2 className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3.5 flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-450 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-950/50">
          <FiAlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
