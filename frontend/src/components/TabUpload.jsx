import React, { useState, useRef } from 'react';
import { UploadCloud, Mic, Link2, FileText, CheckCircle2, AlertTriangle, Play, Square, Loader2 } from 'lucide-react';
import { API_BASE } from '../config';

export default function TabUpload({ 
  onTranscriptionSuccess, 
  apiKey,
  setFileName,
  setTranscriptionMethod
}) {
  const [activeSource, setActiveSource] = useState('file'); // 'file' | 'mic' | 'url' | 'paste'
  const [method, setMethod] = useState('Gemini API'); // 'Gemini API' | 'Web Speech API'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Web Speech API references
  const recognitionRef = useRef(null);
  const [interimText, setInterimText] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setAudioBlob(file);
    setFileName(file.name);
    setSuccessMessage(`File "${file.name}" loaded successfully.`);
    setErrorMessage('');
  };

  // Recording Controls
  const startRecording = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      setAudioBlob(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setFileName(`Voice-Recording-${Date.now()}.wav`);
        setSuccessMessage('Voice recording captured successfully!');
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start Web Speech API transcription client-side if method is Web Speech
      if (method === 'Web Speech API') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Web Speech API is not supported in this browser. Please use Chrome or select Gemini API.');
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let speechTranscript = '';
        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              speechTranscript += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInterimText(speechTranscript + interim);
        };

        recognition.onerror = (event) => {
          console.error('Speech Recognition Error:', event.error);
        };

        recognition.onend = () => {
          setPasteText(prev => prev + speechTranscript);
          setInterimText('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Microphone access denied or error initializing Web Speech.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  // Perform API call or local transcription parsing
  const handleTranscribe = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setTranscriptionMethod(method);

      if (activeSource === 'paste') {
        if (!pasteText.trim()) {
          throw new Error('Please paste a transcript to proceed.');
        }
        // Segment paste text line by line or make mock turns
        const lines = pasteText.split('\n').filter(l => l.trim().length > 0);
        const segments = lines.map((line, idx) => {
          // Check if format is Speaker: text
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0 && colonIdx < 30) {
            const speaker = line.substring(0, colonIdx).trim();
            const text = line.substring(colonIdx + 1).trim();
            return {
              id: `${idx}-${Date.now()}`,
              speaker,
              text,
              emotion: 'Neutral'
            };
          }
          return {
            id: `${idx}-${Date.now()}`,
            speaker: `Speaker ${idx % 2 === 0 ? 'A' : 'B'}`,
            text: line.trim(),
            emotion: 'Neutral'
          };
        });
        
        onTranscriptionSuccess(segments, pasteText);
        setSuccessMessage('Manual transcript loaded successfully!');
        setIsProcessing(false);
        return;
      }

      if (method === 'Web Speech API' && activeSource === 'mic') {
        // Already transcribed client-side during recording
        if (!pasteText && !interimText) {
          throw new Error('No Speech was recorded. Please try again.');
        }
        const fullText = (pasteText + ' ' + interimText).trim();
        const segments = [{
          id: `0-${Date.now()}`,
          speaker: 'Speaker 1',
          text: fullText,
          emotion: 'Neutral'
        }];
        onTranscriptionSuccess(segments, fullText);
        setSuccessMessage('Client Speech Recognition transcription completed!');
        setIsProcessing(false);
        return;
      }

      // Gemini API / Backend transcription
      if (!audioBlob && activeSource === 'file') {
        throw new Error('Please upload an audio file first.');
      }
      if (!audioBlob && activeSource === 'mic') {
        throw new Error('Please record some audio first.');
      }

      let fileToUpload = audioBlob;
      if (activeSource === 'url') {
        if (!audioUrl) throw new Error('Please enter a valid audio URL.');
        // Fetch audio from URL
        setSuccessMessage('Fetching audio from URL...');
        const response = await fetch(audioUrl);
        if (!response.ok) throw new Error('Failed to fetch audio from the provided URL.');
        const blob = await response.blob();
        fileToUpload = new File([blob], 'url-audio.mp3', { type: blob.type || 'audio/mpeg' });
        setFileName('url-audio.mp3');
      }

      // Prepare multi-part form
      const formData = new FormData();
      formData.append('audio', fileToUpload);

      const headers = {};
      if (apiKey) {
        headers['x-gemini-key'] = apiKey;
      }

      const res = await fetch(`${API_BASE}/api/transcribe`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transcription failed. Please check Gemini API Key or format.');
      }

      const segmentsWithIds = data.segments.map((seg, idx) => ({
        ...seg,
        id: `${idx}-${Date.now()}`
      }));

      onTranscriptionSuccess(segmentsWithIds, data.rawTranscript);
      setSuccessMessage('Audio successfully transcribed via Gemini 2.5!');

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong during transcription.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Upload & Record Audio</h2>
          <p className="text-sm text-slate-400 mt-1">Select your input method and speech-to-text algorithm</p>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMethod('Gemini API')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              method === 'Gemini API' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gemini 2.5 API (Cloud)
          </button>
          <button
            onClick={() => setMethod('Web Speech API')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              method === 'Web Speech API' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Web Speech (Free / Offline)
          </button>
        </div>
      </div>

      {/* Input Source Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => { setActiveSource('file'); setErrorMessage(''); }}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            activeSource === 'file' 
              ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-medium' 
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span className="text-sm">Audio File</span>
        </button>
        <button
          onClick={() => { setActiveSource('mic'); setErrorMessage(''); }}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            activeSource === 'mic' 
              ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-medium' 
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span className="text-sm">Record Voice</span>
        </button>
        <button
          onClick={() => { setActiveSource('url'); setErrorMessage(''); }}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            activeSource === 'url' 
              ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-medium' 
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span className="text-sm">Audio URL</span>
        </button>
        <button
          onClick={() => { setActiveSource('paste'); setErrorMessage(''); }}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
            activeSource === 'paste' 
              ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-medium' 
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">Paste Script</span>
        </button>
      </div>

      {/* Input Views */}
      <div className="glass-card p-6 min-h-[200px] flex flex-col justify-center">
        {activeSource === 'file' && (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
            }`}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <UploadCloud className="w-12 h-12 text-slate-500 mb-3" />
            <p className="text-slate-300 font-medium text-center">Drag and drop audio file here or click to browse</p>
            <p className="text-xs text-slate-500 mt-2">Supports WAV, MP3, M4A, FLAC, OGG, WebM, MPEG</p>
            {audioBlob && (
              <span className="mt-4 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
                Selected: {audioBlob.name || 'Custom File'}
              </span>
            )}
          </div>
        )}

        {activeSource === 'mic' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-rose-500 opacity-75"></span>
                  <button 
                    onClick={stopRecording}
                    className="relative bg-rose-600 hover:bg-rose-500 p-4 rounded-full text-white transition-all shadow-lg shadow-rose-500/30"
                  >
                    <Square className="w-6 h-6 fill-white" />
                  </button>
                </div>
                <span className="text-lg font-bold text-slate-200 tracking-wider">
                  {formatTime(recordingSeconds)}
                </span>
                <span className="text-xs text-rose-400 animate-pulse">
                  Recording audio...
                </span>
                
                {method === 'Web Speech API' && interimText && (
                  <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-sm max-w-md text-slate-400 text-left italic">
                    {interimText}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <button 
                  onClick={startRecording}
                  className="bg-indigo-600 hover:bg-indigo-500 p-5 rounded-full text-white transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </button>
                <span className="text-slate-300 font-medium">Click to Start Recording</span>
                <span className="text-xs text-slate-500">
                  {method === 'Web Speech API' ? 'Uses browser-native web Speech recognition' : 'Transcribed using Gemini 2.5 cloud'}
                </span>
                {audioBlob && (
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                    Recording Captured Successfully
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {activeSource === 'url' && (
          <div className="space-y-3 max-w-lg mx-auto w-full">
            <label className="text-xs font-medium text-slate-400">Audio Stream URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://example.com/audio.mp3" 
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="glass-input flex-1"
              />
            </div>
            <p className="text-xs text-slate-500">Ensure the audio URL supports cross-origin resource sharing (CORS).</p>
          </div>
        )}

        {activeSource === 'paste' && (
          <div className="space-y-3 w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400 font-sans">Paste Script / Dialogue</label>
              <span className="text-xs text-slate-500">Format like: "Speaker Name: text" or simply line-by-line</span>
            </div>
            <textarea 
              rows={6}
              placeholder="Speaker A: Hello, how are you?&#10;Speaker B: I am doing great! Thanks for asking."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="glass-input w-full font-mono text-sm resize-none"
            />
          </div>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Error Occurred</h4>
            <p className="text-xs mt-1 text-rose-400/80">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold">Success</h4>
            <p className="text-xs mt-1 text-green-400/80">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleTranscribe}
          disabled={isProcessing || isRecording || (activeSource === 'file' && !audioBlob) || (activeSource === 'mic' && !audioBlob && method !== 'Web Speech API') || (activeSource === 'url' && !audioUrl) || (activeSource === 'paste' && !pasteText)}
          className="glass-button-primary flex items-center justify-center gap-2 px-8 py-3"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transcribing Content...</span>
            </>
          ) : (
            <span>Process & Transcribe</span>
          )}
        </button>
      </div>
    </div>
  );
}
