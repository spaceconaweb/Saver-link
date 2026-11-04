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
  Sparkles,
  Trash2,
} from "lucide-react";

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
  const summary =
    link.summary ||
    `Saved from ${domain} as “${link.custom_name}” and marked with the ${link.custom_icon || "Bookmark"} icon. Create a summary to add more detail about why this page matters to you.`;

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
    </article>
  );
}
