import React, { useState } from 'react';
import { Plus, Trash2, MessageSquare, List, Sparkles, Smile, Frown, BrainCircuit, AlertCircle, Heart } from 'lucide-react';

const EMOTIONS = [
  { name: 'Neutral', emoji: '😐', color: 'bg-slate-700/50 border-slate-600 text-slate-300', icon: BrainCircuit },
  { name: 'Happy', emoji: '😊', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', icon: Smile },
  { name: 'Sad', emoji: '😢', color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: Frown },
  { name: 'Angry', emoji: '😠', color: 'bg-rose-500/10 border-rose-500/30 text-rose-400', icon: AlertCircle },
  { name: 'Excited', emoji: '🤩', color: 'bg-amber-500/10 border-amber-500/30 text-amber-400', icon: Heart }
];

export default function TabEditor({ segments, onSegmentsChange }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'bubble'

  const handleUpdateSegment = (id, key, value) => {
    const updated = segments.map(seg => {
      if (seg.id === id) {
        return { ...seg, [key]: value };
      }
      return seg;
    });
    onSegmentsChange(updated);
  };

  const handleDeleteSegment = (id) => {
    const filtered = segments.filter(seg => seg.id !== id);
    onSegmentsChange(filtered);
  };

  const handleAddSegment = () => {
    const newSeg = {
      id: `new-${Date.now()}-${Math.random()}`,
      speaker: `Speaker ${segments.length > 0 ? (segments.length % 2 === 0 ? 'A' : 'B') : 'A'}`,
      text: '',
      emotion: 'Neutral'
    };
    onSegmentsChange([...segments, newSeg]);
  };

  const getEmotionDetails = (emotionName) => {
    return EMOTIONS.find(e => e.name.toLowerCase() === (emotionName || '').toLowerCase()) || EMOTIONS[0];
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100 font-sans">Transcript Segment Editor</h2>
          <p className="text-sm text-slate-400 mt-1">Review, correct dialogue text, and adjust detected emotions</p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'grid' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Grid Editor
          </button>
          <button
            onClick={() => setViewMode('bubble')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'bubble' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Dialogue Flow
          </button>
        </div>
      </div>

      {segments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <MessageSquare className="w-16 h-16 text-slate-700 mb-3" />
          <p className="font-medium text-slate-400">No transcription segments available</p>
          <p className="text-sm text-slate-500 mt-1">Please upload/record audio in the Upload tab first.</p>
          <button
            onClick={handleAddSegment}
            className="glass-button-secondary flex items-center gap-2 mt-4 px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Add Manual Turn
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* GRID EDITOR VIEW */}
          {viewMode === 'grid' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 tracking-wider">
                    <th className="py-3 px-4 w-40">Speaker</th>
                    <th className="py-3 px-4">Dialogue text</th>
                    <th className="py-3 px-4 w-44">Emotion</th>
                    <th className="py-3 px-4 w-16 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {segments.map((seg) => {
                    const emo = getEmotionDetails(seg.emotion);
                    return (
                      <tr key={seg.id} className="hover:bg-slate-900/20 group transition-colors">
                        {/* Speaker Input */}
                        <td className="py-3 px-4 vertical-align-top">
                          <input
                            type="text"
                            value={seg.speaker}
                            onChange={(e) => handleUpdateSegment(seg.id, 'speaker', e.target.value)}
                            className="glass-input w-full font-medium py-1.5 px-3 text-sm"
                            placeholder="Speaker Name"
                          />
                        </td>

                        {/* Dialogue text Area */}
                        <td className="py-3 px-4">
                          <textarea
                            rows={Math.max(1, Math.ceil(seg.text.length / 80))}
                            value={seg.text}
                            onChange={(e) => handleUpdateSegment(seg.id, 'text', e.target.value)}
                            className="glass-input w-full py-1.5 px-3 text-sm resize-none font-sans"
                            placeholder="Dialogue transcript text..."
                          />
                        </td>

                        {/* Emotion Select */}
                        <td className="py-3 px-4 vertical-align-top">
                          <div className="flex gap-2 items-center">
                            <select
                              value={seg.emotion}
                              onChange={(e) => handleUpdateSegment(seg.id, 'emotion', e.target.value)}
                              className={`glass-input font-medium py-1.5 px-3 text-sm flex-1 ${emo.color}`}
                            >
                              {EMOTIONS.map(e => (
                                <option key={e.name} value={e.name} className="bg-slate-950 text-slate-100">
                                  {e.emoji} {e.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center vertical-align-top">
                          <button
                            onClick={() => handleDeleteSegment(seg.id)}
                            className="text-rose-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-all active:scale-95"
                            title="Delete dialogue turn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* BUBBLE FLOW VIEW */}
          {viewMode === 'bubble' && (
            <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
              {segments.map((seg, index) => {
                const isEven = index % 2 === 0;
                const emo = getEmotionDetails(seg.emotion);
                const EmoIcon = emo.icon;

                return (
                  <div 
                    key={seg.id} 
                    className={`flex items-start gap-3 max-w-[80%] ${
                      isEven ? 'mr-auto' : 'ml-auto flex-row-reverse'
                    }`}
                  >
                    {/* Mock Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
                      {seg.speaker.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Speech Bubble */}
                    <div className={`rounded-2xl p-4 border shadow-sm ${
                      isEven 
                        ? 'bg-slate-900/80 border-slate-800 rounded-tl-none' 
                        : 'bg-indigo-950/40 border-indigo-900/60 rounded-tr-none'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-1 border-b border-slate-800/40 pb-1">
                        <span className="text-xs font-semibold text-slate-300 font-sans">{seg.speaker}</span>
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${emo.color}`}>
                          <EmoIcon className="w-3 h-3" />
                          {emo.emoji} {seg.emotion}
                        </span>
                      </div>
                      <p className="text-sm text-slate-100 leading-relaxed font-sans mt-1">
                        {seg.text || <span className="text-slate-500 italic">Empty dialogue text...</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
            <span className="text-xs text-slate-500 font-medium font-sans">
              Total turns: {segments.length} | Unique speakers: {new Set(segments.map(s => s.speaker)).size}
            </span>
            <button
              onClick={handleAddSegment}
              className="glass-button-secondary flex items-center gap-2 text-sm px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              Add Dialogue Turn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
