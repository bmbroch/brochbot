"use client";

import { useState, useEffect } from "react";
import Shell from "@/components/Shell";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trip {
  name: string;
  url: string;
  isTypeform: boolean;
  isAnnounced: boolean;
}

interface Section {
  dateRange: string;
  trips: Trip[];
}

interface ChangeLogEntry {
  date: string;
  type: string;
  message: string;
  added?: number;
  removed?: number;
}

interface WifiTribeData {
  lastScraped: string;
  sourceUrl: string;
  totalTrips: number;
  sections: Section[];
  changeLog: ChangeLogEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 2) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  } catch {
    return iso;
  }
}

function formatLogDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: Trip }) {
  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-150 group ${
        trip.isTypeform
          ? "bg-white/[0.02] border-white/[0.06] opacity-75 hover:opacity-90"
          : "bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-[14px] text-[var(--text-primary)] leading-tight">
          {trip.name}
        </span>
        <span
          className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            trip.isAnnounced
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"
          }`}
        >
          {trip.isAnnounced ? "Announced" : "TBA"}
        </span>
      </div>
      <a
        href={trip.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-[12px] font-medium flex items-center gap-1 w-fit transition-colors ${
          trip.isTypeform
            ? "text-zinc-500 hover:text-zinc-300"
            : "text-blue-400 hover:text-blue-300"
        }`}
      >
        {trip.isTypeform ? "Interest list →" : "View trip →"}
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WifiTribePage() {
  const [data, setData] = useState<WifiTribeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  useEffect(() => {
    fetch("/wifitribe-data.json")
      .then((r) => {
        if (!r.ok) throw new Error("Not ok");
        return r.json() as Promise<WifiTribeData>;
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const showChangeLog =
    data && data.changeLog.length > 0 && !(data.changeLog.length === 1 && data.changeLog[0].type === "initial");

  return (
    <Shell>
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                🌍 WiFi Tribe
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Chapter Calendar ·{" "}
                <a
                  href="https://wifitribe.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text-secondary)] transition-colors"
                >
                  wifitribe.co
                </a>
              </p>
            </div>
            <a
              href="https://wifitribe.co/calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[var(--text-secondary)] hover:bg-white/[0.08] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5"
            >
              View Calendar →
            </a>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap items-center gap-2">
            {loading ? (
              <span className="text-[12px] text-[var(--text-muted)] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] animate-pulse">
                Loading…
              </span>
            ) : data ? (
              <>
                <span className="text-[12px] text-[var(--text-muted)] px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  Last checked: {relativeTime(data.lastScraped)}
                </span>
                <span className="text-[12px] text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 font-medium">
                  {data.totalTrips} upcoming chapters
                </span>
              </>
            ) : error ? (
              <span className="text-[12px] text-red-400 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                Failed to load data
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Loading skeleton ────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="h-4 w-40 rounded bg-white/[0.06]" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 rounded-xl bg-white/[0.04] border border-white/[0.06]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {!loading && data && data.sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-4xl">🌐</span>
            <p className="text-[var(--text-secondary)] text-[15px]">No upcoming chapters found</p>
            <a
              href="https://wifitribe.co/calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              Check wifitribe.co/calendar/ directly →
            </a>
          </div>
        )}

        {/* ── Chapter Timeline ────────────────────────────────────────────── */}
        {!loading && data && data.sections.length > 0 && (
          <div className="space-y-8">
            {data.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                {/* Section date range header */}
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    {section.dateRange}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {section.trips.length} {section.trips.length === 1 ? "chapter" : "chapters"}
                  </span>
                </div>

                {/* Trip grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {section.trips.map((trip, tidx) => (
                    <TripCard key={tidx} trip={trip} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Change History ──────────────────────────────────────────────── */}
        {!loading && showChangeLog && (
          <div className="border-t border-white/[0.06] pt-8">
            <button
              onClick={() => setLogOpen((o) => !o)}
              className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
            >
              <span>📋 Change History</span>
              <span className="text-[var(--text-muted)]">{logOpen ? "▲" : "▼"}</span>
            </button>
            {logOpen && (
              <div className="space-y-2">
                {data!.changeLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px]"
                  >
                    <span className="shrink-0 text-[11px] font-mono text-[var(--text-muted)] pt-0.5 min-w-[120px]">
                      {formatLogDate(entry.date)}
                    </span>
                    <span className="text-[var(--text-secondary)]">{entry.message}</span>
                    {(entry.added || entry.removed) && (
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        {entry.added ? (
                          <span className="text-[11px] text-emerald-400">+{entry.added}</span>
                        ) : null}
                        {entry.removed ? (
                          <span className="text-[11px] text-red-400">-{entry.removed}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </Shell>
  );
}
