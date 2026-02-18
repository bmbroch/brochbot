"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchAll, type SearchResult } from "@/lib/data-provider";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons: Record<string, string> = {
  task: "📋",
  activity: "⚡",
  memory: "📝",
  team: "👥",
};

const typeLabels: Record<string, string> = {
  task: "Tasks",
  activity: "Activities",
  memory: "Memory",
  team: "Team",
};

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const r = searchAll(query);
    setResults(r);
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      router.push(results[selectedIndex].href);
      onOpenChange(false);
    }
  };

  if (!open) return null;

  // Group results by type
  const grouped: Record<string, SearchResult[]> = {};
  results.forEach((r) => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]" onClick={() => onOpenChange(false)}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#262626]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-zinc-500 flex-shrink-0">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 12L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, activities, memory, team..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-[#262626] text-zinc-500 font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-zinc-500">No results found</div>
          )}
          {!query && (
            <div className="py-8 text-center text-sm text-zinc-500">Start typing to search...</div>
          )}
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="px-3 py-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>{typeIcons[type]}</span>
                <span>{typeLabels[type]}</span>
              </div>
              {items.map((result) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={result.id}
                    onClick={() => { router.push(result.href); onOpenChange(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      idx === selectedIndex ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0">{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{result.title}</div>
                      <div className="text-xs text-zinc-500 truncate">{result.subtitle}</div>
                    </div>
                    {idx === selectedIndex && (
                      <span className="text-[10px] text-zinc-500">↵</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
