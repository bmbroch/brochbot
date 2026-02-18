"use client";

import { Search, Bell } from "lucide-react";
import { useEffect } from "react";

interface TopBarProps {
  onSearchClick: () => void;
}

export default function TopBar({ onSearchClick }: TopBarProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onSearchClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearchClick]);

  return (
    <header className="h-14 border-b border-border-medium bg-surface-2/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-20">
      <div />
      <div className="flex items-center gap-3">
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-border-subtle hover:border-border-strong text-zinc-500 hover:text-zinc-300 transition-all text-[13px]"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="text-[10px] ml-3 px-1.5 py-0.5 rounded bg-white/[0.06] border border-border-subtle font-mono">⌘K</kbd>
        </button>
        <button className="relative p-2 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300 transition-colors">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[12px] font-semibold ml-1">
          B
        </div>
      </div>
    </header>
  );
}
