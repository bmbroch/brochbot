"use client";

import { useState, useEffect } from "react";
import Shell from "@/components/Shell";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trip {
  id: string;
  name: string;
  url: string;
  dates: string;
  availability: string;
}

interface ChangeLogEntry {
  date: string;
  type: string;
  changes?: string[];
  message?: string;
}

interface WifiTribeData {
  lastScraped: string;
  sourceUrl: string;
  totalTrips: number;
  trips: Trip[];
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

type AvailabilityLevel = "open" | "limited" | "last" | "full" | "other";

function getAvailabilityLevel(availability: string): AvailabilityLevel {
  const a = availability.toLowerCase();
  if (a === "open") return "open";
  if (a === "limited spots") return "limited";
  if (a === "last spots") return "last";
  if (a === "full" || a === "sold out" || a === "waitlist" || a === "waitlist only") return "full";
  return "other";
}

const AVAILABILITY_STYLES: Record<AvailabilityLevel, { dot: string; badge: string; label: string }> = {
  open:    { dot: "bg-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400", label: "Open" },
  limited: { dot: "bg-yellow-400",  badge: "bg-yellow-500/10 border-yellow-500/25 text-yellow-400",   label: "Limited Spots" },
  last:    { dot: "bg-orange-400",  badge: "bg-orange-500/10 border-orange-500/25 text-orange-400",   label: "Last Spots" },
  full:    { dot: "bg-red-400",     badge: "bg-red-500/10 border-red-500/25 text-red-400",            label: "Full" },
  other:   { dot: "bg-blue-400",    badge: "bg-blue-500/10 border-blue-500/25 text-blue-400",         label: "" },
};

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: Trip }) {
  const level = getAvailabilityLevel(trip.availability);
  const styles = AVAILABILITY_STYLES[level];
  const displayLabel = level === "other" ? trip.availability : styles.label;

  return (
    <a
      href={trip.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-3 p-4 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-[14px] text-[var(--text-primary)] leading-tight group-hover:text-white transition-colors">
          {trip.name}
        </span>
        <span
          className={`shrink-0 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
          {displayLabel}
        </span>
      </div>
      <span className="text-[12px] text-[var(--text-muted)]">{trip.dates}</span>
      <span className="text-[12px] font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
        View trip →
      </span>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WifiTribePage() {
  const [data, setData] = useState<WifiTribeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | AvailabilityLevel>("all");

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

  const trips = data?.trips ?? [];

  // Filter
  const filtered = filter === "all"
    ? trips
    : trips.filter((t) => getAvailabilityLevel(t.availability) === filter);

  // Availability counts
  const counts = {
    open:    trips.filter((t) => getAvailabilityLevel(t.availability) === "open").length,
    limited: trips.filter((t) => getAvailabilityLevel(t.availability) === "limited").length,
    last:    trips.filter((t) => getAvailabilityLevel(t.availability) === "last").length,
    full:    trips.filter((t) => getAvailabilityLevel(t.availability) === "full").length,
  };

  const showChangeLog = data && data.changeLog.length > 0;

  const FILTERS: { key: "all" | AvailabilityLevel; label: string; count?: number }[] = [
    { key: "all",     label: "All",          count: trips.length },
    { key: "last",    label: "🟠 Last Spots", count: counts.last },
    { key: "limited", label: "🟡 Limited",    count: counts.limited },
    { key: "open",    label: "🟢 Open",       count: counts.open },
    { key: "full",    label: "🔴 Full",        count: counts.full },
  ];

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
                Live availability ·{" "}
                <a
                  href="https://wifitribe.co/calendar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--text-secondary)] transition-colors"
                >
                  wifitribe.co/calendar
                </a>
              </p>
            </div>
            <a
              href="https://wifitribe.co/calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[var(--text-secondary)] hover:bg-white/[0.08] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5"
            >
              Full Calendar →
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
                  Updated {relativeTime(data.lastScraped)}
                </span>
                <span className="text-[12px] text-blue-400 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 font-medium">
                  {data.totalTrips} trips tracked
                </span>
                {counts.last > 0 && (
                  <span className="text-[12px] text-orange-400 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 font-medium">
                    {counts.last} almost full
                  </span>
                )}
              </>
            ) : error ? (
              <span className="text-[12px] text-red-400 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                Failed to load data
              </span>
            ) : null}
          </div>
        </div>

        {/* ── Filter tabs ─────────────────────────────────────────────────── */}
        {!loading && data && (
          <div className="flex flex-wrap gap-2">
            {FILTERS.filter(f => f.count !== 0).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  filter === f.key
                    ? "bg-white/[0.10] border-white/[0.18] text-[var(--text-primary)]"
                    : "bg-white/[0.03] border-white/[0.07] text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-secondary)]"
                }`}
              >
                {f.label}
                {f.count !== undefined && (
                  <span className="ml-1.5 text-[11px] opacity-60">{f.count}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Loading skeleton ────────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-white/[0.04] border border-white/[0.06]" />
            ))}
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {!loading && data && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-4xl">🌐</span>
            <p className="text-[var(--text-secondary)] text-[15px]">No trips in this category</p>
            <button onClick={() => setFilter("all")} className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors">
              Show all →
            </button>
          </div>
        )}

        {/* ── Trip Grid ───────────────────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
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
                    <span className="shrink-0 text-[11px] font-mono text-[var(--text-muted)] pt-0.5 min-w-[130px]">
                      {formatLogDate(entry.date)}
                    </span>
                    <div className="flex flex-col gap-1 text-[var(--text-secondary)]">
                      {entry.changes && entry.changes.length > 0
                        ? entry.changes.map((c, ci) => {
                            const parts = c.split("|");
                            if (parts[0] === "CHANGED") {
                              // CHANGED|name|dates|old|new|url
                              return (
                                <span key={ci}>
                                  <span className="font-medium text-[var(--text-primary)]">{parts[1]}</span>
                                  {" "}({parts[2]}): {parts[3]} → <span className="font-medium">{parts[4]}</span>
                                </span>
                              );
                            } else if (parts[0] === "NEW") {
                              // NEW|name|dates|availability|url
                              return (
                                <span key={ci}>
                                  ✨ New: <span className="font-medium text-[var(--text-primary)]">{parts[1]}</span>
                                  {" "}({parts[3]})
                                </span>
                              );
                            }
                            return <span key={ci}>{c}</span>;
                          })
                        : <span>{entry.message || entry.type}</span>
                      }
                    </div>
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
