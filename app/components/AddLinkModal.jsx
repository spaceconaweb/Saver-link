import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { X } from 'lucide-react';

const AVAILABLE_ICONS = ['Bookmark', 'Layers', 'Code', 'FileText', 'Cpu', 'Briefcase', 'Globe', 'BookOpen'];

export default function AddLinkModal({ isOpen, onClose, onSave, url }) {
  const [customName, setCustomName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Bookmark');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: customName, icon: selectedIcon });
    setCustomName('');
    setSelectedIcon('Bookmark');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">Customize Hub Resource</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Original URL</label>
            <div className="text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 truncate font-mono">
              {url}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Custom Name</label>
            <input 
              type="text"
              required
              placeholder="e.g. Workers Architecture Engine"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Visual Hub Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map((iconName) => {
                const Icon = Icons[iconName];
                const isChosen = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-3 border rounded-xl flex items-center justify-center transition ${
                      isChosen 
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-350'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 text-sm font-medium rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition"
            >
              Save to Hub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
