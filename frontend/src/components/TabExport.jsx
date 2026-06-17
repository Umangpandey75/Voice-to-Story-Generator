import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, Download, FileText, FileDown, Loader2, RefreshCw } from 'lucide-react';
import { API_BASE } from '../config';

export default function TabExport({ 
  segments, 
  storyText, 
  fileName, 
  transcriptionMethod 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [isBuildingPdf, setIsBuildingPdf] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  // Initialize Web Speech Synthesis Voices
  useEffect(() => {
    if (!synthRef.current) return;

    const loadVoices = () => {
      const availableVoices = synthRef.current.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        // Default to first English voice or first available voice
        const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // TTS Controls
  const handleSpeak = () => {
    if (!synthRef.current || !storyText) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synthRef.current.cancel(); // Reset any ongoing speech

    const utterance = new SpeechSynthesisUtterance(storyText);
    const activeVoice = voices.find(v => v.name === selectedVoice);
    if (activeVoice) utterance.voice = activeVoice;
    
    utterance.rate = speechRate;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // PDF Download Trigger (Express PDFKit fetch)
  const handleDownloadPdf = async () => {
    if (segments.length === 0 || !storyText) return;
    setIsBuildingPdf(true);

    try {
      const res = await fetch(`${API_BASE}/api/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          segments,
          storyText,
          fileName,
          method: transcriptionMethod
        })
      });

      if (!res.ok) {
        throw new Error('Could not generate PDF from server.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName ? fileName.split('.')[0] : 'voice-to-story'}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert('Error fetching PDF report document: ' + err.message);
    } finally {
      setIsBuildingPdf(false);
    }
  };

  // Plain Text Client-Side Export
  const handleDownloadTxt = () => {
    if (segments.length === 0 || !storyText) return;

    let textContent = `VOICE TO STORY GENERATOR REPORT\n`;
    textContent += `====================================\n`;
    textContent += `Metadata:\n`;
    textContent += `- Source File: ${fileName || 'Voice-to-Story'}\n`;
    textContent += `- Transcription: ${transcriptionMethod}\n`;
    textContent += `- Date Created: ${new Date().toLocaleDateString()}\n\n`;

    textContent += `Generated Story:\n`;
    textContent += `----------------\n`;
    textContent += `${storyText}\n\n`;

    textContent += `Dialogue Script:\n`;
    textContent += `----------------\n`;
    segments.forEach((s) => {
      textContent += `[${s.speaker}] (${s.emotion}): ${s.text}\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName ? fileName.split('.')[0] : 'voice-to-story'}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const hasData = segments.length > 0 && storyText;

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-semibold text-slate-100 font-sans">Voice Synthesis & Report Export</h2>
        <p className="text-sm text-slate-400 mt-1">Read your generated story aloud using local TTS, or download high-fidelity reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offline Speech Synthesis (Web Speech API) */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Story Text-to-Speech</span>
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Select Synthesizer Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="glass-input w-full text-xs font-medium py-2"
                disabled={!storyText}
              >
                {voices.map(voice => (
                  <option key={voice.name} value={voice.name} className="bg-slate-950 text-slate-200">
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase">
                <span>Speech Speed</span>
                <span>{speechRate}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                disabled={!storyText}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSpeak}
                disabled={!storyText}
                className="glass-button-primary flex-1 flex items-center justify-center gap-1.5 py-2 text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPaused ? 'Resume' : 'Speak Story'}</span>
              </button>
              <button
                onClick={handlePause}
                disabled={!isPlaying}
                className="glass-button-secondary flex-1 flex items-center justify-center gap-1.5 py-2 text-xs"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="glass-button-secondary p-2 rounded-lg"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        </div>

        {/* Report Download Panels */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Document Exporter</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Compile transcription records, emotional heatmaps, and generated prose narrative into high-fidelity downloadable reports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <button
              onClick={handleDownloadPdf}
              disabled={!hasData || isBuildingPdf}
              className="glass-button-primary flex items-center justify-center gap-2 py-3 text-xs"
            >
              {isBuildingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDownloadTxt}
              disabled={!hasData}
              className="glass-button-secondary flex items-center justify-center gap-2 py-3 text-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Export TXT Script</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
