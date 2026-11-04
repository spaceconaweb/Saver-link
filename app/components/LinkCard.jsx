"use client";

import {
  Bookmark,
  Briefcase,
  BookOpen,
  Code,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ICONS = {
  Bookmark,
  Briefcase,
  BookOpen,
  Code,
  Cpu,
  Database,
  FileText,
  Globe,
  Layers,
};

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Saved website";
  }
}

export default function LinkCard({ link, onSummarize, onDelete, isSelected, isExample = false }) {
  const Icon = ICONS[link.custom_icon] || Bookmark;
  const domain = getDomain(link.original_url);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [outputMode, setOutputMode] = useState("text");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatError, setChatError] = useState("");
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const discardRecordingRef = useRef(false);
  const supportsSpeechOutput =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const summary =
    link.summary ||
    `Saved from ${domain} as “${link.custom_name}” and marked with the ${link.custom_icon || "Bookmark"} icon. Create a summary to add more detail about why this page matters to you.`;

  useEffect(() => {
    return () => {
      discardRecordingRef.current = true;
      window.clearTimeout(recordingTimeoutRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  const addAssistantResponse = (question, answer) => {
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: answer },
    ]);

    if (outputMode === "voice" && supportsSpeechOutput) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(answer));
    }
  };

  const submitPrompt = async (event, submittedPrompt = prompt) => {
    event?.preventDefault();
    const question = submittedPrompt.trim();
    if (!question || isSubmitting || isExample) return;

    setIsSubmitting(true);
    setChatError("");
    setPrompt("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: link.id, prompt: question }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The assistant couldn't answer right now.");
      }
      if (typeof data.response !== "string" || !data.response.trim()) {
        throw new Error("The assistant returned an empty response.");
      }

      addAssistantResponse(question, data.response);
    } catch (error) {
      setPrompt(question);
      setChatError(
        error instanceof Error ? error.message : "The assistant couldn't answer right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitAudio = async (audioBlob) => {
    setIsSubmitting(true);
    setChatError("");

    try {
      const formData = new FormData();
      formData.set("linkId", link.id);
      formData.set("audio", audioBlob, "question.webm");

      const response = await fetch("/api/chat", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't transcribe your recording.");
      }
      if (
        typeof data.transcription !== "string" ||
        !data.transcription.trim() ||
        typeof data.response !== "string" ||
        !data.response.trim()
      ) {
        throw new Error("The assistant returned an incomplete audio response.");
      }

      setPrompt(data.transcription);
      addAssistantResponse(data.transcription, data.response);
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "We couldn't process your recording.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopRecording = () => {
    window.clearTimeout(recordingTimeoutRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleMicrophone = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setChatError("Audio recording isn't supported in this browser. You can type your question instead.");
      return;
    }

    try {
      setChatError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const preferredType = [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : {});
      mediaRecorderRef.current = recorder;
      discardRecordingRef.current = false;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setChatError("Audio recording failed. Please try again.");
        stopRecording();
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);

        if (discardRecordingRef.current) return;
        const recording = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "application/octet-stream",
        });
        audioChunksRef.current = [];

        if (recording.size > 0) {
          void submitAudio(recording);
        } else {
          setChatError("No audio was recorded. Please try again.");
        }
      };

      recorder.start();
      setIsRecording(true);
      recordingTimeoutRef.current = window.setTimeout(stopRecording, 30_000);
    } catch (error) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setIsRecording(false);
      setChatError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow microphone access in your browser and try again."
          : "The microphone couldn't be started. Check browser permissions and try again.",
      );
    }
  };

  return (
    <article
      className={`group flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md ${
        isSelected ? "border-pink-300 ring-2 ring-pink-100" : "border-pink-100"
      }`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-pink-100 bg-pink-100 text-pink-600 transition-colors group-hover:bg-pink-200">
            <Icon size={20} aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1">
            {isExample && (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-pink-700">
                Sample
              </span>
            )}
            <a
              href={link.original_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${link.custom_name} in a new tab`}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-pink-100 hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
            >
              <ExternalLink size={17} aria-hidden="true" />
            </a>
            {!isExample && (
              <button
                type="button"
                onClick={() => onDelete(link.id)}
                aria-label={`Delete ${link.custom_name}`}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <section aria-label="The name">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-pink-600">
            The name
          </p>
          <h3 className="break-words text-lg font-bold leading-snug text-slate-800">
            <a
              href={link.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm transition-colors hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
            >
              {link.custom_name || "Untitled link"}
            </a>
          </h3>
        </section>

        <section className="mt-5" aria-label="The place">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-pink-600">
            The place
          </p>
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-900">
            <Icon size={14} className="shrink-0 text-pink-600" aria-hidden="true" />
            <span className="truncate">{domain}</span>
          </span>
        </section>

        <section className="mt-5" aria-label="The summary">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-pink-600">
            The summary
          </p>
          <p className="text-sm leading-6 text-slate-600">{summary}</p>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-pink-100 pt-4">
        <time className="text-xs text-slate-500">
          {isExample
            ? "Example link"
            : link.created_at
            ? new Date(link.created_at * 1000).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently saved"}
        </time>
        <button
          type="button"
          onClick={onSummarize}
          disabled={isExample}
          className="inline-flex items-center gap-1.5 rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-700 transition hover:border-pink-200 hover:bg-pink-100 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-default disabled:opacity-70"
        >
          <Sparkles size={14} aria-hidden="true" />
          {isExample ? "Example summary" : link.summary ? "View summary" : "Create summary"}
        </button>
      </div>

      <section className="mt-4 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4" aria-label="Ask AI about this link">
        <button
          type="button"
          onClick={() => setIsAskOpen((open) => !open)}
          aria-expanded={isAskOpen}
          aria-controls={`ask-ai-${link.id}`}
          disabled={isExample}
          className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-pink-800 transition hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={16} aria-hidden="true" />
          <span>✨ Ask AI anything about this link...</span>
        </button>

        {isAskOpen && !isExample && (
          <div id={`ask-ai-${link.id}`} className="mt-3 space-y-3">
            <label className="block">
              <span className="sr-only">Output mode</span>
              <select
                value={outputMode}
                onChange={(event) => setOutputMode(event.target.value)}
                className="mb-2 rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs font-medium text-purple-900 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              >
                <option value="text">💬 Text</option>
                <option value="voice">🔊 Voice</option>
              </select>
            </label>

            <form onSubmit={(event) => void submitPrompt(event)} className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={1000}
                placeholder="Ask about this saved page..."
                aria-label="Ask a question about this link"
                className="min-w-0 flex-1 rounded-xl border border-pink-100 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={toggleMicrophone}
                aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
                aria-pressed={isRecording}
                disabled={isSubmitting}
                className={`rounded-xl p-2.5 transition focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isRecording
                    ? "bg-pink-600 text-white"
                    : "border border-pink-100 bg-white text-pink-700 hover:bg-pink-50"
                }`}
              >
                {isRecording ? (
                  <MicOff size={17} aria-hidden="true" />
                ) : (
                  <Mic size={17} aria-hidden="true" />
                )}
              </button>
              <button
                type="submit"
                aria-label="Send question"
                disabled={!prompt.trim() || isSubmitting}
                className="rounded-xl bg-pink-600 p-2.5 text-white transition hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={17} aria-hidden="true" />
              </button>
            </form>

            <div
              className="mt-3 max-h-52 space-y-3 overflow-y-auto rounded-xl border border-pink-100 bg-white/80 p-3 text-sm text-slate-700"
              role="log"
              aria-live="polite"
              aria-label="AI conversation and response"
            >
              {messages.length === 0 ? (
                <p className="text-slate-500">Your AI answer will appear here.</p>
              ) : (
                messages.map((message, index) => (
                  <p
                    key={`${index}-${message.role}`}
                    className={`leading-6 ${
                      message.role === "user" ? "font-medium text-pink-900" : "text-slate-700"
                    }`}
                  >
                    <span className="font-semibold">
                      {message.role === "user" ? "You: " : "LinkSava AI: "}
                    </span>
                    {message.text}
                  </p>
                ))
              )}
            </div>

            {isSubmitting && (
              <p className="text-xs text-slate-500" role="status">
                Reading the saved page and preparing an answer...
              </p>
            )}
            {chatError && (
              <p className="text-xs text-rose-700" role="alert">
                {chatError}
              </p>
            )}
            {outputMode === "voice" && !supportsSpeechOutput && (
              <p className="text-xs text-slate-500">
                Speech output isn&apos;t supported in this browser; answers will appear as text.
              </p>
            )}
          </div>
        )}
      </section>
    </article>
  );
}
