"use client";

import { Activity, Calendar, Search, Zap, Database, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockScheduledTasks, mockActivities } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";
import type { View } from "@/app/page";

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onSearchClick: () => void;
}

const navItems: { id: View | "search"; label: string; icon: React.ElementType }[] = [
  { id: "feed", label: "Activity Feed", icon: Activity },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "search", label: "Search", icon: Search },
];

export default function Sidebar({ activeView, onViewChange, onSearchClick }: SidebarProps) {
  const nextTask = mockScheduledTasks.find((t) => t.nextRun > Date.now());
  const recentCount = mockActivities.filter((a) => Date.now() - a.timestamp < 86400000).length;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-2 border-r border-border-medium flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-medium">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">Mission Control</h1>
            <p className="text-[11px] text-zinc-500">BrochBot Ops</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 pt-2 pb-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Navigate</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSearch = item.id === "search";
          const isActive = !isSearch && activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => isSearch ? onSearchClick() : onViewChange(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-blue-400")} />
              <span className="flex-1 text-left">{item.label}</span>
              {isSearch && (
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-border-subtle text-zinc-500 font-mono">⌘K</kbd>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-border-medium space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2.5">
            <Database className="w-3 h-3" />
            Services
          </div>
          <div className="space-y-1.5">
            {["Stripe", "Supabase", "Datafast"].map((s) => (
              <div key={s} className="flex items-center justify-between text-[12px]">
                <span className="text-zinc-500">{s}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
                  <span className="text-green-400 text-[11px]">Live</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2.5">
            <Clock className="w-3 h-3" />
            Quick Stats
          </div>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">Actions (24h)</span>
              <span className="text-white font-semibold">{recentCount}</span>
            </div>
            {nextTask && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Next task</span>
                <span className="text-purple-400 font-medium text-[11px]">
                  {formatDistanceToNow(nextTask.nextRun, { addSuffix: true })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">Uptime</span>
              <span className="text-green-400 font-medium">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
