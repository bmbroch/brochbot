"use client";

import { useState, useEffect } from "react";
import Shell from "@/components/Shell";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChangelogEntry {
  date: string;
  action: string;
  text: string;
  category: "cron" | "config" | "infra" | "agent" | string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, { label: string; text: string; bg: string; border: string }> = {
  cron:   { label: "Cron",   text: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
  config: { label: "Config", text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"   },
  infra:  { label: "Infra",  text: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20" },
  agent:  { label: "Agent",  text: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20"  },
};

const ACTION_STYLES: Record<string, { text: string; dot: string }> = {
  Added:     { text: "text-emerald-400", dot: "bg-emerald-400" },
  Created:   { text: "text-emerald-400", dot: "bg-emerald-400" },
  Scheduled: { text: "text-teal-400",    dot: "bg-teal-400"    },
  Updated:   { text: "text-blue-400",    dot: "bg-blue-400"    },
  Moved:     { text: "text-blue-400",    dot: "bg-blue-400"    },
  Fixed:     { text: "text-amber-400",   dot: "bg-amber-400"   },
  Killed:    { text: "text-red-400",     dot: "bg-red-400"     },
  Removed:   { text: "text-red-400",     dot: "bg-red-400"     },
};

const ALL_CATEGORIES = ["all", "cron", "config", "infra", "agent"] as const;
type FilterCategory = typeof ALL_CATEGORIES[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("en-US", {
      timeZone: "UTC",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function relativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00Z");
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return "";
  }
}

function getActionStyle(action: string) {
  return ACTION_STYLES[action] ?? { text: "text-zinc-400", dot: "bg-zinc-500" };
}

function getCategoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] ?? { label: cat, text: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    fetch("/api/mc-data")
      .then((r) => r.ok ? r.json() : {})
      .then((d: { changelog?: ChangelogEntry[] }) => {
        const raw: ChangelogEntry[] = Array.isArray(d.changelog) ? d.changelog : [];
        // Sort newest first
        raw.sort((a, b) => b.date.localeCompare(a.date));
        setEntries(raw);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Filter + group by date ─────────────────────────────────────────────────
  const filtered = filter === "all" ? entries : entries.filter((e) => e.category === filter);

  const grouped: { date: string; items: ChangelogEntry[] }[] = [];
  for (const entry of filtered) {
    if (grouped.length === 0 || grouped[grouped.length - 1].date !== entry.date) {
      grouped.push({ date: entry.date, items: [] });
    }
    grouped[grouped.length - 1].items.push(entry);
  }

  // ── Count by category ─────────────────────────────────────────────────────
  const counts: Record<string, number> = { all: entries.length };
  for (const e of entries) {
    counts[e.category] = (counts[e.category] ?? 0) + 1;
  }

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Changelog</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Infrastructure &amp; config changes — what changed and when
          </p>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = filter === cat;
            const catStyle = cat === "all" ? null : getCategoryStyle(cat);
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={[
                  "px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border",
                  isActive
                    ? cat === "all"
                      ? "bg-white/10 text-white border-white/15"
                      : `${catStyle!.bg} ${catStyle!.text} ${catStyle!.border}`
                    : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700",
                ].join(" ")}
              >
                {cat === "all" ? "All" : getCategoryStyle(cat).label}
                {counts[cat] != null && (
                  <span className="ml-1.5 text-[10px] opacity-60">{counts[cat]}</span>
                )}
              </button>
            );
          })}
          <div className="flex-1" />
          {!loading && (
            <span className="text-[11px] text-zinc-600">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, gi) => (
              <div key={gi}>
                <div className="h-4 w-40 rounded bg-zinc-800 animate-pulse mb-4" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-12 text-center">
            <p className="text-zinc-600 text-sm">No changelog entries{filter !== "all" ? ` for category "${filter}"` : ""}.</p>
            <p className="text-zinc-700 text-xs mt-1">Add dated entries to ops/changelog.md</p>
          </div>
        )}

        {/* ── Timeline ── */}
        {!loading && grouped.length > 0 && (
          <div className="space-y-10">
            {grouped.map(({ date, items }) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                      {formatDate(date)}
                    </span>
                    <span className="text-[11px] text-zinc-600">{relativeDate(date)}</span>
                  </div>
                  <div className="flex-1 h-px bg-[var(--border-subtle)] ml-2" />
                  <span className="text-[10px] text-zinc-700 font-medium">
                    {items.length} change{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Entries */}
                <div className="rounded-xl border border-[var(--border-medium)] bg-[var(--bg-card)] overflow-hidden divide-y divide-[var(--border-subtle)]">
                  {items.map((entry, i) => {
                    const actionStyle = getActionStyle(entry.action);
                    const catStyle = getCategoryStyle(entry.category);
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        {/* Color dot */}
                        <div className="mt-[5px] flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${actionStyle.dot}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Action verb */}
                            <span className={`text-[11px] font-bold uppercase tracking-wide ${actionStyle.text}`}>
                              {entry.action}
                            </span>
                            {/* Description */}
                            <span className="text-sm text-[var(--text-primary)]">
                              {entry.text}
                            </span>
                          </div>
                        </div>

                        {/* Category badge */}
                        <span
                          className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wide ${catStyle.text} ${catStyle.bg} ${catStyle.border}`}
                        >
                          {catStyle.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && entries.length > 0 && (
          <p className="mt-10 text-[11px] text-zinc-700 text-center pb-6">
            Source: ops/changelog.md · Updated on each mc-sync cycle
          </p>
        )}
      </div>
    </Shell>
  );
}
