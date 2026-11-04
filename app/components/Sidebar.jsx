import React from 'react';
import { Layers, FolderIcon, Sparkles, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'all', name: 'All Links', icon: Layers },
    { id: 'collections', name: 'Collections', icon: FolderIcon },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="text-white" size={18} />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">HubLink</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive 
                    ? 'bg-slate-800 text-indigo-400 border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-900">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition rounded-xl">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
