"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { agentColors } from "@/lib/data-provider";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CronJob {
  id: string;
  title: string;
  schedule: string;
  timezone: string;
  owner: string;
  enabled: boolean;
  status: string;
  lastStatus: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  consecutiveErrors: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TZ_ABBR: Record<string, string> = {
  "Africa/Windhoek": "CAT",
  "Africa/Johannesburg": "SAST",
  "Europe/London": "UTC",
  "America/New_York": "ET",
  "America/Los_Angeles": "PT",
  "UTC": "UTC",
};

function tzAbbr(tz: string): string {
  return TZ_ABBR[tz] || tz;
}

const DAY_NAMES: Record<number, string> = {
  0: "Sundays",
  1: "Mondays",
  2: "Tuesdays",
  3: "Wednesdays",
  4: "Thursdays",
  5: "Fridays",
  6: "Saturdays",
};

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

/** Convert a cron expression to a human-readable schedule string */
function cronToHuman(cron: string, tz: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;
  const [min, hour, dom, month, dow] = parts;
  const suffix = tzAbbr(tz);

  // Every minute
  if (min === "*" && hour === "*") return "Every minute";

  // Every hour at :MM
  if (hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return `Every hour at :${min.padStart(2, "0")}`;
  }

  const h = parseInt(hour);
  const m = parseInt(min);
  const timeStr = m === 0 ? formatHour(h) : `${formatHour(h).replace(" ", "")} :${m.toString().padStart(2, "0")}`;

  // Daily
  if (dom === "*" && month === "*" && dow === "*") {
    return `Daily at ${timeStr} ${suffix}`;
  }

  // Weekly (specific day of week)
  if (dom === "*" && month === "*" && dow !== "*" && !dow.includes(",") && !dow.includes("-")) {
    const dayNum = parseInt(dow);
    return `${DAY_NAMES[dayNum] ?? `Day ${dow}`} at ${timeStr} ${suffix}`;
  }

  // Weekdays
  if (dom === "*" && month === "*" && dow === "1-5") {
    return `Weekdays at ${timeStr} ${suffix}`;
  }

  return cron;
}

/** Relative time from a UTC ISO string */
function relativeTime(isoStr: string | null, future = false): string {
  if (!isoStr) return "Never";
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = future ? then - now : now - then;
  const abs = Math.abs(diffMs);

  if (abs < 60_000) return future ? "in <1 min" : "just now";
  if (abs < 3_600_000) {
    const m = Math.round(abs / 60_000);
    return future ? `in ${m}m` : `${m}m ago`;
  }
  if (abs < 86_400_000) {
    const h = Math.round(abs / 3_600_000);
    return future ? `in ${h}h` : `${h}h ago`;
  }
  const days = Math.round(abs / 86_400_000);
  return future ? `in ${days}d` : `${days}d ago`;
}

/** Determine badge style from status string */
function statusBadge(status: string): {
  label: string;
  textClass: string;
  bgClass: string;
  dotClass: string;
  isError: boolean;
} {
  const s = status.toLowerCase();
  if (s === "ok") {
    return { label: "OK", textClass: "text-green-400", bgClass: "bg-green-500/10", dotClass: "bg-green-400", isError: false };
  }
  if (s.startsWith("error")) {
    const match = status.match(/(\d+)/);
    const n = match ? ` ×${match[1]}` : "";
    return { label: `Error${n}`, textClass: "text-red-400", bgClass: "bg-red-500/15", dotClass: "bg-red-400", isError: true };
  }
  if (s === "disabled") {
    return { label: "Disabled", textClass: "text-zinc-500", bgClass: "bg-zinc-500/10", dotClass: "bg-zinc-600", isError: false };
  }
  // idle / never run
  return { label: "Idle", textClass: "text-zinc-400", bgClass: "bg-zinc-500/10", dotClass: "bg-zinc-500", isError: false };
}

/** Owner name → agent key (lowercase, strip spaces) */
function ownerToKey(owner: string): string {
  return owner.toLowerCase().replace(/\s+/g, "");
}

const OWNER_EMOJI: Record<string, string> = {
  sam: "🤝",
  dana: "📊",
  miles: "🚀",
  penny: "📌",
  devin: "🛠️",
  dev: "🛠️",
  cara: "🎧",
  mia: "📱",
  frankie: "💰",
  ben: "👨‍💻",
  system: "⚙️",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Reload relative timestamps every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/mc-data")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        const cal: CronJob[] = d.calendar ?? [];
        // Sort: errors first, then idle, then ok
        cal.sort((a, b) => {
          const rank = (s: string) => {
            if (s.toLowerCase().startsWith("error")) return 0;
            if (s.toLowerCase() === "idle") return 1;
            return 2;
          };
          return rank(a.status) - rank(b.status);
        });
        setJobs(cal);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const errorCount = jobs.filter((j) => j.status.toLowerCase().startsWith("error")).length;
  const okCount = jobs.filter((j) => j.status.toLowerCase() === "ok").length;
  const idleCount = jobs.filter((j) => !j.status.toLowerCase().startsWith("error") && j.status.toLowerCase() !== "ok").length;

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Cron Schedule</h1>
          <p className="text-sm text-zinc-500 mt-1">Scheduled jobs and their current status</p>
        </div>

        {/* Summary bar */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-[#262626] text-sm">
              <div className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-zinc-400 font-medium">{jobs.length} jobs</span>
            </div>
            {okCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 font-medium">{okCount} healthy</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/25 text-sm">
                <span className="text-base leading-none">⚠️</span>
                <span className="text-red-400 font-medium">{errorCount} failing</span>
              </div>
            )}
            {idleCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141414] border border-[#262626] text-sm">
                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-500 font-medium">{idleCount} idle</span>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 text-zinc-500 py-12 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
            <span className="text-sm">Loading schedule...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            Failed to load schedule data: {error}
          </div>
        )}

        {/* Job cards */}
        {!loading && !error && (
          <div className="space-y-3">
            {jobs.map((job) => {
              const ownerKey = ownerToKey(job.owner);
              const color = agentColors[ownerKey] || "#6b7280";
              const emoji = OWNER_EMOJI[ownerKey] || "👤";
              const badge = statusBadge(job.status);
              const humanSchedule = cronToHuman(job.schedule, job.timezone);

              return (
                <div
                  key={job.id}
                  className={`rounded-xl border transition-all duration-150 ${
                    badge.isError
                      ? "bg-red-950/20 border-red-500/30 shadow-sm shadow-red-500/10"
                      : "bg-[#141414] border-[#262626] hover:border-[#333]"
                  }`}
                >
                  {/* Error banner */}
                  {badge.isError && (
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-red-500/20 bg-red-500/10 rounded-t-xl">
                      <span className="text-base leading-none">⚠️</span>
                      <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                        Job failing — {job.consecutiveErrors} consecutive {job.consecutiveErrors === 1 ? "error" : "errors"}
                      </span>
                    </div>
                  )}

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Owner avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
                      title={job.owner}
                    >
                      {emoji}
                    </div>

                    {/* Job info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className={`text-sm font-semibold ${badge.isError ? "text-red-300" : "text-zinc-100"}`}>
                          {job.title}
                        </h3>
                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.bgClass} ${badge.textClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass} ${badge.isError ? "animate-pulse" : ""}`} />
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                        {/* Owner */}
                        <span style={{ color: `${color}cc` }} className="font-medium">
                          {job.owner}
                        </span>
                        {/* Schedule */}
                        <span className="font-mono text-zinc-400">{humanSchedule}</span>
                        {/* Raw cron — subtle */}
                        <span className="font-mono text-zinc-700">{job.schedule}</span>
                      </div>
                    </div>

                    {/* Time columns */}
                    <div className="flex gap-5 sm:gap-6 text-xs shrink-0">
                      <div>
                        <div className="text-zinc-600 mb-0.5 uppercase tracking-wide text-[10px] font-medium">Last run</div>
                        <div className={`font-medium ${job.lastRunAt ? (badge.isError ? "text-red-400" : "text-zinc-300") : "text-zinc-600"}`}>
                          {relativeTime(job.lastRunAt, false)}
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-600 mb-0.5 uppercase tracking-wide text-[10px] font-medium">Next run</div>
                        <div className={`font-medium ${job.nextRunAt ? "text-zinc-300" : "text-zinc-600"}`}>
                          {job.nextRunAt ? relativeTime(job.nextRunAt, true) : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="py-16 text-center text-zinc-600 text-sm">
            No scheduled jobs found in Supabase
          </div>
        )}

        {/* Footer note */}
        {!loading && !error && jobs.length > 0 && (
          <p className="mt-5 text-[11px] text-zinc-700 text-right">
            Live from Supabase · refreshes on reload
          </p>
        )}
      </div>
    </Shell>
  );
}
