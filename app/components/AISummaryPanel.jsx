import { Sparkles, Volume2, VolumeX, X } from "lucide-react";

const WAVE_HEIGHTS = [12, 19, 14, 24, 16, 21, 11, 18, 25, 15, 20, 12, 17, 23, 13];

export default function AISummaryPanel({
  link,
  isLoading,
  isSpeaking,
  onToggleSpeech,
  onClose,
}) {
  return (
    <aside
      aria-label="Link summary"
      className="w-full shrink-0 border-t border-pink-100 bg-white lg:w-80 lg:border-l lg:border-t-0"
    >
      <div className="flex items-center justify-between border-b border-pink-100 px-5 py-4">
        <div className="flex items-center gap-2 text-pink-700">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">A little more context</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close summary"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-pink-50 hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-pink-600">Saved link</p>
          <h3 className="mt-1 break-words font-semibold text-slate-800">{link.custom_name}</h3>
        </div>

        <div aria-live="polite" className="rounded-2xl border border-pink-100 bg-pink-50/70 p-4">
          {isLoading ? (
            <div role="status" className="space-y-3">
              <span className="sr-only">Creating a summary...</span>
              <div className="h-3 w-full animate-pulse rounded-full bg-pink-100" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-pink-100" />
              <div className="h-3 w-4/6 animate-pulse rounded-full bg-pink-100" />
              <p className="pt-1 text-xs text-pink-700">Gathering the helpful bits...</p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-700">
              {link.summary ||
                "A summary will appear here when it is ready, so you can quickly remember what this link is about."}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-pink-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Listen along</p>
              <p className="mt-0.5 text-xs text-slate-500">Hear your summary read aloud</p>
            </div>
            <button
              type="button"
              onClick={onToggleSpeech}
              disabled={isLoading || !link.summary}
              aria-label={isSpeaking ? "Stop reading summary aloud" : "Read summary aloud"}
              className={`rounded-full border p-2.5 transition focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-40 ${
                isSpeaking
                  ? "border-pink-300 bg-pink-100 text-pink-700"
                  : "border-pink-100 bg-white text-pink-600 hover:bg-pink-50"
              }`}
            >
              {isSpeaking ? (
                <VolumeX size={17} aria-hidden="true" />
              ) : (
                <Volume2 size={17} aria-hidden="true" />
              )}
            </button>
          </div>

          <div
            aria-hidden="true"
            className="mt-4 flex h-10 items-center justify-center gap-1 overflow-hidden rounded-xl bg-pink-50 px-3"
          >
            {isSpeaking ? (
              WAVE_HEIGHTS.map((height, index) => (
                <span
                  key={index}
                  className="w-1 rounded-full bg-pink-400 motion-safe:animate-pulse"
                  style={{ height: `${height}px`, animationDelay: `${index * 45}ms` }}
                />
              ))
            ) : (
              <span className="text-xs text-slate-500">
                {isLoading ? "Preparing your summary..." : "Your summary is ready when you are"}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
