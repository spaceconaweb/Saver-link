import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ExternalLink, Sparkles } from 'lucide-react';

export default function LinkCard({ link, onSummarize, isSelected }) {
  // Dynamically resolve custom string icon saved in database to Lucide component mapping
  const IconComponent = LucideIcons[link.custom_icon] || LucideIcons.Bookmark;

  return (
    <div 
      className={`group relative bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-305 hover:-translate-y-0.5 hover:shadow-xl ${
        isSelected 
          ? 'border-indigo-500 ring-1 ring-indigo-500 bg-slate-850' 
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Card Header Metadata */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-indigo-400 group-hover:bg-slate-750 transition duration-350">
            <IconComponent size={20} />
          </div>
          
          {/* Instant Click-To-Open Anchor Routing Route */}
          <a 
            href={link.original_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-slate-800 rounded-lg transition"
            title="Open Original Resource"
          >
            <ExternalLink size={16} />
          </a>
        </div>

        <h3 className="font-semibold text-slate-100 group-hover:text-white leading-snug line-clamp-2 mb-2 transition">
          {link.custom_name}
        </h3>
        
        <p className="text-xs text-slate-400 truncate font-mono tracking-tight max-w-[240px]">
          {link.original_url.replace(/https?:\/\/(www\.)?/, '')}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {new Date(link.created_at * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSummarize();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-indigo-400 border border-slate-700 text-xs font-medium rounded-lg transition"
        >
          <Sparkles size={13} />
          Summarize
        </button>
      </div>
    </div>
  );
}
