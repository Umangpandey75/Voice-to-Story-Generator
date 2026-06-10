import React, { useState, useEffect } from 'react';
import { 
  Key, History, Trash2, Menu, X, ChevronRight, Sparkles, 
  UploadCloud, MessageSquare, BarChart3, BookOpen, FileText, 
  HelpCircle, Eye, EyeOff
} from 'lucide-react';

import TabUpload from './components/TabUpload';
import TabEditor from './components/TabEditor';
import TabAnalytics from './components/TabAnalytics';
import TabStory from './components/TabStory';
import TabExport from './components/TabExport';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Shared application states
  const [segments, setSegments] = useState([]);
  const [rawTranscript, setRawTranscript] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyStyle, setStoryStyle] = useState('Narrative Short Story');
  const [customPrompt, setCustomPrompt] = useState('');
  const [fileName, setFileName] = useState('Voice-to-Story');
  const [transcriptionMethod, setTranscriptionMethod] = useState('Gemini API');

  // Database logs state
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Fetch history from MongoDB
  const fetchHistory = async () => {
    setIsFetchingHistory(true);
    try {
      const res = await fetch('http://localhost:5000/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch history logs:', err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Save changes to database (MongoDB)
  const handleSaveToHistory = async (overrideData = null) => {
    const dataToSave = overrideData || {
      fileName,
      transcriptionMethod,
      rawTranscript,
      segments,
      storyText,
      storyStyle,
      customPrompt
    };

    if (dataToSave.segments.length === 0) return;

    try {
      const res = await fetch('http://localhost:5000/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  };

  // Delete history log item
  const handleDeleteLog = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/history/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to delete history log:', err);
    }
  };

  // Load selected history log into active workspace
  const handleLoadLog = (log) => {
    setFileName(log.fileName || 'Voice-to-Story');
    setTranscriptionMethod(log.transcriptionMethod || 'Gemini API');
    setRawTranscript(log.rawTranscript || '');
    setSegments(log.segments || []);
    setStoryText(log.storyText || '');
    setStoryStyle(log.storyStyle || 'Narrative Short Story');
    setCustomPrompt(log.customPrompt || '');
    setActiveTab('editor');
  };

  // Handle successful transcription callback
  const handleTranscriptionSuccess = (newSegments, rawText) => {
    setSegments(newSegments);
    setRawTranscript(rawText);
    setStoryText(''); // reset old story text
    setActiveTab('editor'); // automatically jump to editor
    
    // Auto-save initial state to DB
    handleSaveToHistory({
      fileName,
      transcriptionMethod,
      rawTranscript: rawText,
      segments: newSegments,
      storyText: '',
      storyStyle,
      customPrompt
    });
  };

  // Handle updated story text callback
  const handleStoryChange = (newStoryText) => {
    setStoryText(newStoryText);
    
    // Update history state
    handleSaveToHistory({
      fileName,
      transcriptionMethod,
      rawTranscript,
      segments,
      storyText: newStoryText,
      storyStyle,
      customPrompt
    });
  };

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    localStorage.setItem('gemini_api_key', val);
  };

  const clearWorkspace = () => {
    if (window.confirm('Reset current workspace? Any unsaved data in the active session will be cleared.')) {
      setSegments([]);
      setRawTranscript('');
      setStoryText('');
      setCustomPrompt('');
      setFileName('Voice-to-Story');
      setActiveTab('upload');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-80 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:flex`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-md font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Voice to Story
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">MERN + Gemini 2.5</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Settings */}
        <div className="p-6 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini Key</span>
            </span>
            <button 
              onClick={() => setShowKey(!showKey)}
              className="text-slate-500 hover:text-slate-300"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="Using server default key"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="glass-input w-full text-xs pr-10"
            />
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Leaves empty to fallback to system backend configuration key. Hidden from public logs.
          </p>
        </div>

        {/* History Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-6 pb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>History Logs</span>
            </span>
            {isFetchingHistory && <span className="text-[10px] text-indigo-400 animate-pulse">refreshing...</span>}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {historyLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-medium italic">
                No history logs stored in MongoDB.
              </div>
            ) : (
              historyLogs.map((log) => (
                <div
                  key={log._id}
                  onClick={() => handleLoadLog(log)}
                  className="p-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:border-slate-700 group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-xs font-semibold text-slate-200 truncate font-sans">
                      {log.fileName || 'Voice-to-Story'}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{log.segments?.length || 0} turns</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteLog(log._id, e)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 transition-all shrink-0"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-950/20 flex gap-2">
          <button 
            onClick={clearWorkspace}
            className="glass-button-secondary w-full text-xs py-2.5"
          >
            Clear Workspace
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Main Header */}
        <header className="h-16 border-b border-slate-850 px-6 flex items-center justify-between bg-slate-900/20 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-mono">
              FILE: {fileName} ({transcriptionMethod})
            </div>
          </div>

          {/* Navigation Tabs Header */}
          <nav className="flex items-center gap-1 bg-slate-950 border border-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'upload' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all relative ${
                activeTab === 'editor' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
              {segments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all relative ${
                activeTab === 'story' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Story Studio</span>
              {storyText && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-400 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'export' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </nav>
        </header>

        {/* Tab Components Render */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {activeTab === 'upload' && (
            <TabUpload
              onTranscriptionSuccess={handleTranscriptionSuccess}
              apiKey={apiKey}
              setFileName={setFileName}
              setTranscriptionMethod={setTranscriptionMethod}
            />
          )}

          {activeTab === 'editor' && (
            <TabEditor
              segments={segments}
              onSegmentsChange={(updated) => {
                setSegments(updated);
                handleSaveToHistory({
                  fileName,
                  transcriptionMethod,
                  rawTranscript,
                  segments: updated,
                  storyText,
                  storyStyle,
                  customPrompt
                });
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <TabAnalytics
              segments={segments}
            />
          )}

          {activeTab === 'story' && (
            <TabStory
              segments={segments}
              storyText={storyText}
              onStoryChange={handleStoryChange}
              storyStyle={storyStyle}
              setStoryStyle={setStoryStyle}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              apiKey={apiKey}
            />
          )}

          {activeTab === 'export' && (
            <TabExport
              segments={segments}
              storyText={storyText}
              fileName={fileName}
              transcriptionMethod={transcriptionMethod}
            />
          )}
        </main>
      </div>
    </div>
  );
}
