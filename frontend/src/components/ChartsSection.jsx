import React from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { FiPieChart, FiBarChart2, FiActivity } from 'react-icons/fi';

const ChartsSection = ({ wordFrequency = [], sentiment = {}, metrics = {} }) => {
  // 1. Prepare Sentiment Pie Chart Data
  const sentimentLabel = sentiment.label || 'NEUTRAL';
  const sentimentScore = sentiment.score || 0.5;
  
  let pieData = [];
  const primaryVal = Math.round(sentimentScore * 100);
  const remaining = 100 - primaryVal;
  
  if (sentimentLabel === 'POSITIVE') {
    pieData = [
      { name: 'Positive', value: primaryVal },
      { name: 'Neutral', value: Math.round(remaining * 0.6) },
      { name: 'Negative', value: Math.round(remaining * 0.4) }
    ];
  } else if (sentimentLabel === 'NEGATIVE') {
    pieData = [
      { name: 'Negative', value: primaryVal },
      { name: 'Neutral', value: Math.round(remaining * 0.6) },
      { name: 'Positive', value: Math.round(remaining * 0.4) }
    ];
  } else if (sentimentLabel === 'INFORMATIVE') {
    pieData = [
      { name: 'Informative', value: primaryVal },
      { name: 'Positive', value: Math.round(remaining * 0.4) },
      { name: 'Neutral', value: Math.round(remaining * 0.4) },
      { name: 'Negative', value: Math.round(remaining * 0.2) }
    ];
  } else if (sentimentLabel === 'ANALYTICAL') {
    pieData = [
      { name: 'Analytical', value: primaryVal },
      { name: 'Positive', value: Math.round(remaining * 0.3) },
      { name: 'Neutral', value: Math.round(remaining * 0.5) },
      { name: 'Negative', value: Math.round(remaining * 0.2) }
    ];
  } else if (sentimentLabel === 'MIXED') {
    pieData = [
      { name: 'Mixed', value: primaryVal },
      { name: 'Neutral', value: Math.round(remaining * 0.3) },
      { name: 'Positive', value: Math.round(remaining * 0.3) },
      { name: 'Negative', value: Math.round(remaining * 0.4) }
    ];
  } else {
    pieData = [
      { name: 'Neutral', value: primaryVal },
      { name: 'Positive', value: Math.round(remaining * 0.5) },
      { name: 'Negative', value: Math.round(remaining * 0.5) }
    ];
  }

  const COLORS = {
    Positive: '#10b981', // Emerald-500
    Neutral: '#f59e0b',  // Amber-500
    Negative: '#ef4444', // Rose-500
    Informative: '#3b82f6', // Blue-500
    Analytical: '#8b5cf6', // Violet-500
    Mixed: '#f97316'      // Orange-500
  };

  // 2. Prepare Word Frequency Data
  // Capitalize words for visual layout
  const barData = wordFrequency.slice(0, 7).map(item => ({
    word: item.word.charAt(0).toUpperCase() + item.word.slice(1),
    count: item.count
  }));

  // 3. Prepare Radar Chart Statistics Profile
  const duration = metrics.duration || 1;
  const wordCount = metrics.wordCount || 1;
  
  // Custom intelligence profile metrics
  const speechPace = Math.min(100, Math.round((wordCount / (duration || 1)) * 30)); // Normalized Speech Pace
  const vocabularyDensity = Math.min(100, Math.round((wordFrequency.length / (wordCount || 1)) * 1200));
  const informationalDepth = Math.min(100, Math.round((wordCount / 50) * 12));
  
  const radarData = [
    { subject: 'Speech Pace', A: speechPace, fullMark: 100 },
    { subject: 'Vocab Density', A: vocabularyDensity, fullMark: 100 },
    { subject: 'Info Depth', A: informationalDepth, fullMark: 100 },
    { subject: 'Duration Index', A: Math.min(100, Math.round(duration / 3)), fullMark: 100 },
    { subject: 'Volume Metric', A: Math.min(100, Math.round(wordCount / 4)), fullMark: 100 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Word Frequency Chart */}
      <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <FiBarChart2 className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Word Frequencies</h4>
        </div>
        <div className="h-64 w-full text-xs">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="word" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={70} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 4, 4, 0]}>
                  {/* Define SVG gradient in the app, or inject inline definition */}
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No word data available
            </div>
          )}
        </div>
      </div>

      {/* 2. Sentiment Pie Chart */}
      <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <FiPieChart className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sentiment Distribution</h4>
        </div>
        <div className="h-64 w-full text-xs relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconSize={10} 
                iconType="circle"
                wrapperStyle={{ bottom: 0, fontSize: '11px', fontWeight: '500' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-[35%] flex flex-col items-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Overall</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{sentimentLabel}</span>
          </div>
        </div>
      </div>

      {/* 3. Radar Chart (Profile Statistics) */}
      <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <FiActivity className="w-5 h-5 text-indigo-500" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Voice Profile Metrics</h4>
        </div>
        <div className="h-64 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#475569" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} tick={false} />
              <Radar name="Audio Profile" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              <Tooltip 
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
