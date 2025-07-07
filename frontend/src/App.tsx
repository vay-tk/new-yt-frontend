import React, { useState, useRef } from 'react';
import { Download, Upload, CheckCircle, AlertCircle, Loader2, Play, ExternalLink, FileText, Clock, Zap } from 'lucide-react';
import { config } from './config';

interface TaskStatus {
  task_id: string;
  status: 'pending' | 'downloading' | 'converting' | 'uploading' | 'completed' | 'failed';
  progress?: string;
  error?: string;
  cloudinary_url?: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [cookies, setCookies] = useState<string>('');
  const [showCookies, setShowCookies] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      setIsValidUrl(validateYouTubeUrl(value.trim()));
    } else {
      setIsValidUrl(true);
    }
  };

  const handleDownload = async () => {
    if (!url.trim() || !isValidUrl) return;

    setIsLoading(true);
    setTaskStatus(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          cookies: cookies.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setTaskId(data.task_id);
      
      // Start polling for status
      pollTaskStatus(data.task_id);
    } catch (error) {
      console.error('Download error:', error);
      setTaskStatus({
        task_id: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Network error occurred. Please check if the backend is running.',
      });
      setIsLoading(false);
    }
  };

  const pollTaskStatus = async (id: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/status/${id}`);
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const status: TaskStatus = await response.json();
      setTaskStatus(status);

      if (status.status === 'completed' || status.status === 'failed') {
        setIsLoading(false);
      } else {
        // Continue polling
        setTimeout(() => pollTaskStatus(id), config.pollInterval);
      }
    } catch (error) {
      console.error('Status polling error:', error);
      setTaskStatus(prev => prev ? {
        ...prev,
        status: 'failed',
        error: 'Lost connection to server. Please try again.'
      } : null);
      setIsLoading(false);
    }
  };

  const handleCookieUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please upload a .txt file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/upload-cookies`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Cookies uploaded successfully!');
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to upload cookies: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Cookie upload error:', error);
      alert('Failed to upload cookies. Please check your connection.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'downloading':
      case 'converting':
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'downloading':
        return 'bg-blue-100 text-blue-800';
      case 'converting':
        return 'bg-yellow-100 text-yellow-800';
      case 'uploading':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const resetForm = () => {
    setUrl('');
    setCookies('');
    setTaskId(null);
    setTaskStatus(null);
    setIsLoading(false);
    setShowCookies(false);
    setIsValidUrl(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                YouTube Video Downloader
              </h1>
              <p className="text-sm text-gray-600">Production-grade video processing with cloud storage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8">
            {/* URL Input Section */}
            <div className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-3">
                  YouTube Video URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                    className={`w-full px-4 py-4 bg-white/80 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                      !isValidUrl ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
                    }`}
                    disabled={isLoading}
                  />
                  <Play className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {!isValidUrl && url.trim() && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please enter a valid YouTube URL
                  </p>
                )}
              </div>

              {/* Advanced Options */}
              <div className="border-t border-gray-200/50 pt-6">
                <button
                  onClick={() => setShowCookies(!showCookies)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Advanced Options
                  <div className={`transform transition-transform ${showCookies ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </button>

                {showCookies && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50/50 rounded-xl border border-gray-200/50">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cookies (Base64 encoded)
                      </label>
                      <textarea
                        value={cookies}
                        onChange={(e) => setCookies(e.target.value)}
                        placeholder="Optional: Base64 encoded cookies for age-restricted or private videos"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        rows={3}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Or upload cookies.txt:</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCookieUpload}
                        accept=".txt"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                        disabled={isLoading}
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  disabled={!url.trim() || !isValidUrl || isLoading}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Download & Convert
                    </>
                  )}
                </button>

                {(taskStatus || isLoading) && (
                  <button
                    onClick={resetForm}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Status Section */}
          {taskStatus && (
            <div className="border-t border-gray-200/50 bg-gray-50/30 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(taskStatus.status)}`}>
                    {getStatusIcon(taskStatus.status)}
                    {taskStatus.status.charAt(0).toUpperCase() + taskStatus.status.slice(1)}
                  </span>
                </div>

                {taskStatus.progress && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{taskStatus.progress}</span>
                  </div>
                )}

                {taskStatus.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900">Error</h4>
                        <p className="text-sm text-red-700 mt-1">{taskStatus.error}</p>
                        {taskStatus.error.includes('cookies') && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>Tip:</strong> For age-restricted or geo-blocked videos, export cookies from your browser:
                            </p>
                            <ol className="text-xs text-yellow-700 mt-2 list-decimal list-inside space-y-1">
                              <li>Install a browser extension like "Get cookies.txt LOCALLY"</li>
                              <li>Visit YouTube and log in</li>
                              <li>Export cookies for youtube.com</li>
                              <li>Upload the cookies.txt file using the "Advanced Options" above</li>
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {taskStatus.cloudinary_url && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">Download Complete!</h4>
                        <p className="text-sm text-green-700 mt-1">Your video has been processed and uploaded to the cloud.</p>
                        <a
                          href={taskStatus.cloudinary_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Video
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {taskId && (
                  <div className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-2 rounded-lg">
                    Task ID: {taskId}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Downloads</h3>
            <p className="text-sm text-gray-600">Advanced yt-dlp integration with retry logic and format fallbacks</p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">HEVC Conversion</h3>
            <p className="text-sm text-gray-600">Automatic conversion to HEVC (H.265) with H.264 fallback</p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Cloud Storage</h3>
            <p className="text-sm text-gray-600">Secure upload to Cloudinary with automatic optimization</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Production-grade YouTube video downloader with advanced processing capabilities</p>
        </div>
      </div>
    </div>
  );
}

export default App;
