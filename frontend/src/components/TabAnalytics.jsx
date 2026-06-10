import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { BarChart3, TrendingUp, Users, HeartHandshake } from 'lucide-react';

const EMOTION_MAP = {
  Happy: { val: 1, color: '#10b981', emoji: '😊' },
  Excited: { val: 2, color: '#f59e0b', emoji: '🤩' },
  Neutral: { val: 0, color: '#64748b', emoji: '😐' },
  Sad: { val: -1, color: '#3b82f6', emoji: '😢' },
  Angry: { val: -2, color: '#f43f5e', emoji: '😠' }
};

export default function TabAnalytics({ segments }) {
  
  // Calculate analytics metrics
  const totalTurns = segments.length;
  
  const wordCount = segments.reduce((acc, curr) => {
    return acc + (curr.text ? curr.text.split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const speakerCount = new Set(segments.map(s => s.speaker)).size;

  // Emotion count tally
  const emotionCounts = segments.reduce((acc, curr) => {
    const emotion = curr.emotion || 'Neutral';
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for Pie Chart
  const pieData = Object.entries(emotionCounts).map(([name, count]) => {
    const details = EMOTION_MAP[name] || EMOTION_MAP.Neutral;
    return {
      name,
      value: count,
      color: details.color,
      emoji: details.emoji
    };
  });

  // Prepare data for Sentiment Timeline Area Chart
  const timelineData = segments.map((seg, idx) => {
    const details = EMOTION_MAP[seg.emotion] || EMOTION_MAP.Neutral;
    return {
      index: idx + 1,
      turn: `Turn ${idx + 1}`,
      speaker: seg.speaker,
      sentiment: details.val,
      emotion: seg.emotion,
      textPreview: seg.text ? (seg.text.substring(0, 30) + (seg.text.length > 30 ? '...' : '')) : ''
    };
  });

  // Find dominant emotion
  let dominantEmotion = 'None';
  let maxCount = 0;
  Object.entries(emotionCounts).forEach(([emo, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantEmotion = emo;
    }
  });

  // Custom tooltips
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
            <span>{data.emoji}</span>
            <span>{data.name}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Count: <span className="font-bold text-slate-200">{data.value}</span> ({((data.value / totalTurns) * 100).toFixed(0)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTimelineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const emoInfo = EMOTION_MAP[data.emotion] || EMOTION_MAP.Neutral;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl max-w-xs">
          <p className="text-xs font-semibold text-indigo-400">{data.turn} - {data.speaker}</p>
          <p className="text-sm font-medium text-slate-100 flex items-center gap-1.5 mt-1">
            <span>Emotion:</span>
            <span className="font-semibold" style={{ color: emoInfo.color }}>
              {emoInfo.emoji} {data.emotion}
            </span>
          </p>
          <p className="text-xs text-slate-400 italic mt-1.5 border-t border-slate-800/60 pt-1">
            "{data.textPreview}"
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalTurns === 0) {
    return (
      <div className="glass-panel p-6 py-12 flex flex-col items-center justify-center text-slate-500">
        <BarChart3 className="w-16 h-16 text-slate-700 mb-3" />
        <p className="font-medium text-slate-400">No analytical data compiled</p>
        <p className="text-sm text-slate-500 mt-1">Please process an audio recording or add custom dialogue turns.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-semibold text-slate-100">Sentiment & Emotion Analytics</h2>
        <p className="text-sm text-slate-400 mt-1">Visual representation of dialogue metrics and dynamic sentiment timeline</p>
      </div>

      {/* Numerical Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium font-sans">Total Word Count</span>
            <h3 className="text-xl font-bold text-slate-100 font-mono mt-0.5">{wordCount}</h3>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium font-sans">Active Speakers</span>
            <h3 className="text-xl font-bold text-slate-100 font-mono mt-0.5">{speakerCount}</h3>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium font-sans">Dominant Sentiment</span>
            <h3 className="text-xl font-bold text-slate-100 font-sans mt-0.5 flex items-center gap-1">
              <span>{EMOTION_MAP[dominantEmotion]?.emoji || '😐'}</span>
              <span>{dominantEmotion}</span>
            </h3>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium font-sans">Dialogue Turns</span>
            <h3 className="text-xl font-bold text-slate-100 font-mono mt-0.5">{totalTurns}</h3>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Distribution (Pie Chart) */}
        <div className="glass-card p-5 flex flex-col min-h-[320px]">
          <h4 className="text-sm font-semibold text-slate-300 font-sans mb-4">Emotion Distribution</h4>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value, entry) => (
                    <span className="text-xs text-slate-400 font-medium hover:text-slate-200 transition-colors">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Flow (Area Timeline Chart) */}
        <div className="glass-card p-5 flex flex-col min-h-[320px]">
          <h4 className="text-sm font-semibold text-slate-300 font-sans mb-4">Sentiment Flow Timeline</h4>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis 
                  dataKey="index" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[-2, 2]} 
                  ticks={[-2, -1, 0, 1, 2]} 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  tickFormatter={(val) => {
                    if (val === 2) return '🤩';
                    if (val === 1) return '😊';
                    if (val === 0) return '😐';
                    if (val === -1) return '😢';
                    if (val === -2) return '😠';
                    return '';
                  }}
                />
                <Tooltip content={<CustomTimelineTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSentiment)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
