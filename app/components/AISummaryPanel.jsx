import React from 'react';
import { Volume2, VolumeX, X, Sparkles } from 'lucide-react';

export default function AISummaryPanel({ link, isLoading, isSpeaking, onToggleSpeech, onClose }) {
  return (
    <div className="w-80 bg-slate-950 border-l border-slate-800 flex flex-col justify-between flex-shrink-0 animate-slide-in">
      <div className="p-5 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles size={16} />
          <h4 className="font-semibold text-sm text-white">AI Proxy Insights</h4>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="text-xs text-slate-400 font-medium line-clamp-2">
          {link.custom_name}
        </div>
        
        {isLoading ? (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-800 rounded w-5/6"></div>
            <div className="h-3 bg-slate-800 rounded w-4/5"></div>
            <p className="text-[10px] font-mono text-center text-indigo-400/70 pt-2 tracking-wider">
              RUNNING WORKERS AI INFERENCE MODEL...
            </p>
          </div>
        ) : (
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-sm text-slate-300 leading-relaxed shadow-sm">
              {link.summary || 'No analytics summary parsed for this entity link.'}
            </p>
          </div>
        )}
      </div>

      <div className="p-5 bg-slate-900/40 border-t border-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-slate-400">Audio Readout Engine</div>
          
          <button 
            onClick={onToggleSpeech}
            disabled={isLoading || !link.summary}
            className={`p-2 rounded-full border transition-all ${
              isSpeaking 
                ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none'
            }`}
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <div className="h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center gap-1 px-4 overflow-hidden">
          {isSpeaking ? (
            Array.from({ length: 15 }).map((_, index) => (
              <div 
                key={index}
                className="w-1 bg-indigo-500 rounded-full animate-bounce"
                style={{
                  height: `${Math.floor(Math.random() * 24) + 8}px`,
                  animationDuration: `${0.5 + Math.random() * 0.7}s`,
                  animationDelay: `${index * 0.04}s`
                }}
              />
            ))
          ) : (
            <div className="text-xs font-mono text-slate-600 tracking-wide select-none">
              {isLoading ? 'GENERATING AUDIO...' : 'AUDIO READY • STANDBY'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
