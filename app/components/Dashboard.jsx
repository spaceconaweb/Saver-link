"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Layers, Plus, Sparkles } from "lucide-react";
import AISummaryPanel from "./AISummaryPanel";
import AddLinkModal from "./AddLinkModal";
import LinkCard from "./LinkCard";
import Sidebar from "./Sidebar";

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [inputUrl, setInputUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if ("speechSynthesis" in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    fetch("/api/links")
      .then((response) => {
        if (!response.ok) {
          throw new Error("We couldn't load your saved links. Please try again.");
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.links)) {
          throw new Error("The saved links response was not in the expected format.");
        }
        if (isMounted) setLinks(data.links);
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Something went wrong while loading your links.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      speechSynthesisRef.current?.cancel();
    };
  }, []);

  const handleUrlSubmit = (event) => {
    event.preventDefault();
    if (!inputUrl.trim()) return;
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleSaveLink = async (metadata) => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_url: inputUrl,
          custom_name: metadata.name || "Untitled Resource",
          custom_icon: metadata.icon || "Bookmark",
        }),
      });

      if (!response.ok) {
        throw new Error("We couldn't save that link. Please try again.");
      }

      const data = await response.json();
      if (!data.link) {
        throw new Error("The saved link response was not in the expected format.");
      }

      setLinks((currentLinks) => [data.link, ...currentLinks]);
      setInputUrl("");
      setIsModalOpen(false);
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong while saving your link.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    setErrorMessage("");

    try {
      const query = new URLSearchParams({ linkId });
      const response = await fetch(`/api/links?${query}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("We couldn't delete that link. Please try again.");
      }

      setLinks((currentLinks) => currentLinks.filter((link) => link.id !== linkId));
      setSelectedLink((currentLink) => (currentLink?.id === linkId ? null : currentLink));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong while deleting your link.",
      );
    }
  };

  const handleSummarize = async (link) => {
    speechSynthesisRef.current?.cancel();
    setIsSpeaking(false);
    setSelectedLink(link);

    if (link.summary) return;

    setIsProcessingAI(true);
    setErrorMessage("");

    try {
      const query = new URLSearchParams({ linkId: link.id });
      const response = await fetch(`/api/summaries?${query}`, { method: "POST" });
      if (!response.ok) {
        throw new Error("We couldn't create a summary for this link. Please try again.");
      }

      const data = await response.json();
      if (typeof data.summary_text !== "string" || !data.summary_text.trim()) {
        throw new Error("The summary response did not contain summary text.");
      }

      const updatedLink = { ...link, summary: data.summary_text };
      setLinks((currentLinks) =>
        currentLinks.map((item) => (item.id === link.id ? updatedLink : item)),
      );
      setSelectedLink(updatedLink);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong while creating the summary.",
      );
    } finally {
      setIsProcessingAI(false);
    }
  };

  const toggleSpeech = (text) => {
    const speechSynthesis = speechSynthesisRef.current;
    if (!speechSynthesis || !text) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  const closeSummary = () => {
    speechSynthesisRef.current?.cancel();
    setIsSpeaking(false);
    setSelectedLink(null);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-50 via-rose-50 to-white text-slate-800 antialiased md:flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-pink-100 bg-white/75 px-5 py-6 backdrop-blur sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 flex items-center gap-2 text-sm font-medium text-pink-600">
                  <Sparkles size={16} aria-hidden="true" />
                  Your little corner of the internet
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                  My saved links
                </h1>
              </div>
              <p className="text-sm text-slate-600">
                {links.length} {links.length === 1 ? "link" : "links"} kept safe
              </p>
            </div>

            <form onSubmit={handleUrlSubmit} className="relative">
              <label htmlFor="link-url" className="sr-only">
                Paste a link to save
              </label>
              <Bookmark
                size={19}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pink-500"
              />
              <input
                id="link-url"
                type="url"
                required
                placeholder="Paste a link you want to find again..."
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                className="w-full rounded-2xl border border-pink-100 bg-white py-4 pl-12 pr-36 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 hover:border-pink-200 focus:border-pink-300 focus:outline-none focus:ring-4 focus:ring-pink-100"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} aria-hidden="true" />
                <span>Save link</span>
              </button>
            </form>

            {errorMessage && (
              <div
                role="alert"
                className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
              >
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="shrink-0 font-semibold text-rose-700 underline decoration-rose-300 underline-offset-2 hover:text-rose-900"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <section className="min-w-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                  <Layers size={19} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">
                    {activeTab === "ai-assistant" ? "Thoughtful summaries" : "Your collection"}
                  </h2>
                  <p className="text-sm text-slate-600">
                    A calm place to keep the things you want to remember.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div
                  className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-pink-100 bg-white/80"
                  role="status"
                >
                  <span className="h-9 w-9 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
                  <p className="text-sm text-slate-600">Gathering your saved links...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-pink-200 bg-white/70 px-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                    <Bookmark size={25} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">A fresh start</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Save a link above and it will be waiting here whenever you need it.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {links.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onSummarize={() => void handleSummarize(link)}
                      onDelete={handleDeleteLink}
                      isSelected={selectedLink?.id === link.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {selectedLink && (
            <AISummaryPanel
              link={selectedLink}
              isLoading={isProcessingAI}
              isSpeaking={isSpeaking}
              onToggleSpeech={() => toggleSpeech(selectedLink.summary)}
              onClose={closeSummary}
            />
          )}
        </div>
      </main>

      <AddLinkModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveLink}
        isSaving={isSaving}
        url={inputUrl}
      />
    </div>
  );
}
