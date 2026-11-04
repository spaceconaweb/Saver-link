"use client";

import { useState } from "react";
import {
  Bookmark,
  BookOpen,
  Briefcase,
  Code,
  Cpu,
  FileText,
  Globe,
  Layers,
  X,
} from "lucide-react";

const AVAILABLE_ICONS = [
  { name: "Bookmark", icon: Bookmark },
  { name: "Layers", icon: Layers },
  { name: "Code", icon: Code },
  { name: "FileText", icon: FileText },
  { name: "Cpu", icon: Cpu },
  { name: "Briefcase", icon: Briefcase },
  { name: "Globe", icon: Globe },
  { name: "BookOpen", icon: BookOpen },
];

export default function AddLinkModal({ isOpen, onClose, onSave, isSaving, url }) {
  const [customName, setCustomName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Bookmark");

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const saved = await onSave({ name: customName.trim(), icon: selectedIcon });
    if (saved) {
      setCustomName("");
      setSelectedIcon("Bookmark");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-link-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl border border-pink-100 bg-white shadow-2xl shadow-pink-200/50"
      >
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-pink-600">
              Make it yours
            </p>
            <h2 id="add-link-title" className="mt-1 text-lg font-bold text-slate-800">
              Save a little something
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-pink-50 hover:text-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              The place
            </p>
            <p className="truncate rounded-xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-sm text-slate-600">
              {url}
            </p>
          </div>

          <div className="relative">
            <input
              id="custom-link-name"
              type="text"
              required
              autoFocus
              maxLength={120}
              placeholder=" "
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              className="peer w-full rounded-xl border border-pink-100 bg-white px-4 pb-3 pt-6 text-sm text-slate-800 shadow-sm transition placeholder:text-transparent hover:border-pink-200 focus:border-pink-400 focus:outline-none focus:ring-4 focus:ring-pink-100"
            />
            <label
              htmlFor="custom-link-name"
              className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-slate-500 transition peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-pink-700"
            >
              Give this link a name
            </label>
          </div>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Choose a little icon
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_ICONS.map(({ name, icon: Icon }) => {
                const isSelected = selectedIcon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIcon(name)}
                    aria-label={name}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-center rounded-xl border p-3 transition focus:outline-none focus:ring-4 focus:ring-pink-100 ${
                      isSelected
                        ? "border-pink-300 bg-pink-100 text-pink-700"
                        : "border-pink-100 bg-white text-slate-500 hover:bg-pink-50 hover:text-pink-700"
                    }`}
                  >
                    <Icon size={19} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl border border-pink-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-pink-50 focus:outline-none focus:ring-4 focus:ring-pink-100 disabled:opacity-50"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={isSaving || !customName.trim()}
              className="flex-1 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving with care..." : "Save my link"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
