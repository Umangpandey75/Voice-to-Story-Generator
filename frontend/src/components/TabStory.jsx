import React, { useState } from 'react';
import { BookOpen, Sparkles, Loader2, RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import { API_BASE } from '../config';

const STORY_STYLES = [
  { name: 'Narrative Short Story', description: 'Transform the conversation into a fluid prose story with narrator details.' },
  { name: 'Dramatic Play', description: 'Structure it with acts, scenes, and expressive speaker theatrical instructions.' },
  { name: 'Business Case Study', description: 'Reframe dialogue details into professional corporate analyses and takeaways.' },
  { name: 'Newspaper Article', description: 'Write an objective, headline-driven journalistic report of the spoken events.' },
  { name: 'Fairy Tale', description: 'Add magical lore and fantasy tropes based on the dialogue context.' }
];

export default function TabStory({ 
  segments, 
  storyText, 
  onStoryChange,
  storyStyle,
  setStoryStyle,
  customPrompt,
  setCustomPrompt,
  apiKey
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerateStory = async () => {
    if (segments.length === 0) {
      setErrorMsg('Please upload and transcribe audio or write dialogue turns first.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (apiKey) {
        headers['x-gemini-key'] = apiKey;
      }

      const res = await fetch(`${API_BASE}/api/story`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          segments,
          storyStyle,
          customPrompt
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate story.');
      }

      onStoryChange(data.storyText);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred while contacting backend generative API.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-semibold text-slate-100 font-sans">Creative Writing Studio</h2>
        <p className="text-sm text-slate-400 mt-1">Harness Gemini 2.5 to transform dialogue turns into professional writing styles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings column */}
        <div className="space-y-4 lg:col-span-1 border-r border-slate-800/40 pr-0 lg:pr-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 font-sans uppercase tracking-wider">Select Story Format</label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {STORY_STYLES.map((style) => (
                <button
                  key={style.name}
                  onClick={() => setStoryStyle(style.name)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                    storyStyle === style.name 
                      ? 'bg-indigo-600/15 border-indigo-500/50 text-slate-100' 
                      : 'bg-slate-950/20 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold mb-0.5">{style.name}</div>
                  <div className="text-[10px] text-slate-500 leading-normal">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 font-sans uppercase tracking-wider">Custom Prompt Instructions</label>
            <textarea
              rows={4}
              placeholder="e.g. Set the story in a futuristic cyberpunk city. Make the tone dark and suspenseful..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="glass-input w-full text-xs font-sans resize-none"
            />
          </div>

          <button
            onClick={handleGenerateStory}
            disabled={isGenerating || segments.length === 0}
            className="glass-button-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Weaving Story...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Creative Story</span>
              </>
            )}
          </button>
        </div>

        {/* Output column */}
        <div className="lg:col-span-2 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400 font-sans uppercase tracking-wider">Creative Output</label>
            {storyText && (
              <button
                onClick={handleGenerateStory}
                disabled={isGenerating}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
                title="Regenerate Story"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs">{errorMsg}</div>
            </div>
          )}

          <div className="glass-card flex-1 p-6 overflow-y-auto max-h-[400px] flex flex-col justify-center bg-slate-950/20">
            {storyText ? (
              <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans text-justify">
                {storyText}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                <BookOpen className="w-12 h-12 text-slate-700 mb-2" />
                <p className="font-semibold text-slate-400">Story board is currently blank</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
                  Configure your format style and click "Generate Creative Story" to weave a beautiful masterpiece.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
