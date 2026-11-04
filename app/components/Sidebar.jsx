import { Bookmark, FolderHeart, Layers, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

const MENU_ITEMS = [
  { id: "all", name: "All links", icon: Layers },
  { id: "collections", name: "Collections", icon: FolderHeart },
  { id: "ai-assistant", name: "AI summaries", icon: Sparkles },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="flex shrink-0 flex-col border-b border-pink-100 bg-white/90 px-4 py-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:px-5 md:py-7">
      <Link href="/" className="mb-4 flex items-center gap-3 px-2 md:mb-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
          <Bookmark size={20} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-bold tracking-tight text-pink-900">LinkSava</span>
          <span className="block text-xs text-slate-500">A home for what matters</span>
        </span>
      </Link>

      <nav aria-label="Main navigation" className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1">
        {MENU_ITEMS.map(({ id, name, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-pink-100 md:w-full md:px-4 ${
                isActive
                  ? "bg-pink-100 text-pink-900"
                  : "text-slate-600 hover:bg-pink-50 hover:text-pink-700"
              }`}
            >
              <Icon size={18} className={isActive ? "text-pink-600" : "text-slate-500"} aria-hidden="true" />
              {name}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 hidden rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-4 md:block">
        <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
          <Sparkles size={16} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-slate-800">Breathe easy</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          The things you love are tucked away right here.
        </p>
      </div>

      <div className="hidden flex-1 md:block" />
      <button
        type="button"
        disabled
        title="Sign out is not available yet"
        className="mt-4 hidden w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 md:flex"
      >
        <LogOut size={18} aria-hidden="true" />
        Sign out
      </button>
    </aside>
  );
}
