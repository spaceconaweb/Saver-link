'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import LinkCard from './LinkCard';
import AddLinkModal from './AddLinkModal';
import AISummaryPanel from './AISummaryPanel';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [inputUrl, setInputUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  
  // Asynchronous Lifecycle States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Audio Speech Synthesis States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState(null);

  // Initialize Speech and Fetch Initial Data from Cloudflare D1
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSynth(window.speechSynthesis);
    }
    fetchLinks();
  }, []);

  // READ: Fetch all captured links belonging to the user
  const fetchLinks = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to retrieve hub links.');
      const data = await response.json();
      setLinks(data.links || []);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setIsModalOpen(true);
  };

  // CREATE: Post custom metadata to Cloudflare D1
  const handleSaveLink = async (metadata) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_url: inputUrl,
          custom_name: metadata.name || 'Untitled Resource',
          custom_icon: metadata.icon || 'Bookmark'
        })
      });

      if (!response.ok) throw new Error('Failed to commit link to Cloudflare D1.');
      const newLinkPayload = await response.json();
      
      // Optimistically push new record onto state array
      setLinks((prevLinks) => [newLinkPayload.link, ...prevLinks]);
      setInputUrl('');
      setIsModalOpen(false);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (id) => {
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/links?linkId=${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete link.');

      setLinks((prev) => prev.filter((link) => link.id !== id));
      setSelectedLink((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete link.');
    }
  };

  // AI OPERATOR: Fetch existing summary or trigger Workers AI model runtime
  const handleSummarize = async (link) => {
    if (synth) synth.cancel();
    setIsSpeaking(false);
    
    setSelectedLink(link);
    if (link.summary) return;

    setIsProcessingAI(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/summaries?linkId=${link.id}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Workers AI execution timeout or parsing failure.');
      const data = await response.json();

      setLinks((prevLinks) => 
        prevLinks.map((item) => 
          item.id === link.id ? { ...item, summary: data.summary_text } : item
        )
      );
      
      setSelectedLink((prev) => ({ ...prev, summary: data.summary_text }));
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const toggleSpeech = (text) => {
    if (!synth || !text) return;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      synth.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans antialiased overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 py-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto w-full">
            <h1 className="text-2xl font-bold tracking-tight mb-4 text-white">My Hub Links</h1>
            
            <form onSubmit={handleUrlSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <Plus size={20} />
              </div>
              <input
                type="url"
                required
                placeholder="Paste any link here to capture to your Hub..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-32 py-3.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm font-medium rounded-lg transition"
              >
                {isSaving ? 'Saving...' : 'Capture Link'}
              </button>
            </form>

            {errorMessage && (
              <div className="mt-3 px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex items-center justify-between">
                <span><strong>Runtime Error:</strong> {errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="font-bold underline ml-2">Dismiss</button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-4xl mx-auto">
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center pt-20 space-y-3">
                  <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 font-mono">QUERYING DATABASE...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                  <Layers className="mx-auto text-slate-600 mb-3" size={32} />
                  <p className="text-sm text-slate-400">Your visual Hub is completely empty. Paste a URL above to populate cards.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {links.map((link) => (
                    <LinkCard 
                      key={link.id} 
                      link={link} 
                      onSummarize={() => handleSummarize(link)}
                      onDelete={handleDeleteLink}
                      isSelected={selectedLink?.id === link.id}
                    />
                  ))}
                </div>
              )}

            </div>
          </div>

          {selectedLink && (
            <AISummaryPanel 
              link={selectedLink}
              isLoading={isProcessingAI}
              isSpeaking={isSpeaking}
              onToggleSpeech={() => toggleSpeech(selectedLink.summary)}
              onClose={() => {
                if (synth) synth.cancel();
                setIsSpeaking(false);
                setSelectedLink(null);
              }}
            />
          )}
        </div>
      </main>

      <AddLinkModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLink}
        url={inputUrl}
      />
    </div>
  );
}
