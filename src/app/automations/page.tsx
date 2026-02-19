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
  description?: string;
  isBash?: boolean;
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

function cronToHuman(cron: string, tz: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;
  const [min, hour, dom, month, dow] = parts;
  const suffix = tzAbbr(tz);

  if (min === "*" && hour === "*") return "Every minute";

  if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return `Every ${min.slice(2)} min`;
  }

  if (hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return `Every hour at :${min.padStart(2, "0")}`;
  }

  const h = parseInt(hour);
  const m = parseInt(min);
  const timeStr = m === 0 ? formatHour(h) : `${formatHour(h).replace(" ", "")} :${m.toString().padStart(2, "0")}`;

  if (dom === "*" && month === "*" && dow === "*") {
    return `Daily at ${timeStr} ${suffix}`;
  }

  if (dom === "*" && month === "*" && dow !== "*" && !dow.includes(",") && !dow.includes("-")) {
    const dayNum = parseInt(dow);
    return `${DAY_NAMES[dayNum] ?? `Day ${dow}`} at ${timeStr} ${suffix}`;
  }

  if (dom === "*" && month === "*" && dow === "1-5") {
    return `Weekdays at ${timeStr} ${suffix}`;
  }

  return cron;
}

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
  return { label: "Idle", textClass: "text-zinc-400", bgClass: "bg-zinc-500/10", dotClass: "bg-zinc-500", isError: false };
}

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

// ─── Daily schedule jobs ──────────────────────────────────────────────────────

interface ScheduleJob {
  agent: string;
  label: string;
  catHour: number;
  daily: boolean;
  weekDay?: number; // 1=Mon...7=Sun, undefined means daily
}

// All times in CAT hours (0–23, fractional supported e.g. 1.5 = 1:30 AM)
const DAILY_JOBS: ScheduleJob[] = [
  { agent: "mia",     label: "Creator Posts",      catHour: 1,    daily: true },
  { agent: "sam",     label: "Creator Merge",      catHour: 1.5,  daily: true },
  { agent: "sam",     label: "Nightly Briefing",   catHour: 2,    daily: true },
  { agent: "dana",    label: "Morning Analytics",  catHour: 8,    daily: true },
  { agent: "frankie", label: "Mercury Sync",       catHour: 10,   daily: true },
  { agent: "sam",     label: "Creator Merge",      catHour: 12.5, daily: true },
  { agent: "penny",   label: "Daily Check",        catHour: 16,   daily: true },
];

// Weekly-only jobs
const WEEKLY_JOBS: ScheduleJob[] = [
  { agent: "miles", label: "Miles GSC",   catHour: 6, daily: false, weekDay: 1 }, // Monday
  { agent: "penny", label: "Penny Audit", catHour: 9, daily: false, weekDay: 5 }, // Friday
];

const ALL_JOBS: ScheduleJob[] = [...DAILY_JOBS, ...WEEKLY_JOBS];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// CAT = UTC+2
const CAT_OFFSET_MS = 2 * 60 * 60 * 1000;

function getNowCAT(): Date {
  return new Date(Date.now() + CAT_OFFSET_MS);
}

function getCATHour(): number {
  return getNowCAT().getUTCHours();
}

/** Returns current CAT time as a decimal (e.g. 1:30 AM → 1.5) */
function getCATDecimalHour(): number {
  const now = getNowCAT();
  return now.getUTCHours() + now.getUTCMinutes() / 60;
}

/** Formats a fractional CAT hour (e.g. 1.5 → "1:30", 12.5 → "12:30", 2 → "2:00") */
function formatCATHour(h: number): string {
  const hr = Math.floor(h);
  const mn = Math.round((h - hr) * 60);
  return mn === 0 ? `${hr}:00` : `${hr}:${mn.toString().padStart(2, "0")}`;
}

function getCATDayOfWeek(): number {
  // 0=Sun, 1=Mon... we want Mon=0 for our grid
  const d = getNowCAT().getUTCDay();
  return d === 0 ? 6 : d - 1; // Mon=0 … Sun=6
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [mcLastRun, setMcLastRun] = useState<string | null>(null);

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
        const bashCrons: CronJob[] = (d.bashCrons ?? []).map(
          (b: { id: string; title: string; schedule: string; timezone: string; owner: string; description?: string; lastRunAt?: string | null }) => ({
            id: b.id,
            title: b.title,
            schedule: b.schedule,
            timezone: b.timezone ?? "",
            owner: b.owner,
            enabled: true,
            status: "ok",
            lastStatus: "ok",
            lastRunAt: b.lastRunAt ?? null,
            nextRunAt: null,
            consecutiveErrors: 0,
            description: b.description,
            isBash: true,
          })
        );
        const merged = [...cal, ...bashCrons];
        merged.sort((a, b) => {
          const rank = (s: string) => {
            if (s.toLowerCase().startsWith("error")) return 0;
            if (s.toLowerCase() === "idle") return 1;
            return 2;
          };
          return rank(a.status) - rank(b.status);
        });
        setJobs(merged);
        // Pull lastRunAt for MC sync (bash-mc-sync or from mc-data lastUpdated)
        setMcLastRun(d.lastUpdated ?? null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const catHour = getCATHour();
  const catDecimalHour = getCATDecimalHour();
  const catDayOfWeek = getCATDayOfWeek();

  const errorCount = jobs.filter((j) => j.status.toLowerCase().startsWith("error")).length;
  const okCount = jobs.filter((j) => j.status.toLowerCase() === "ok").length;

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="text-sm text-zinc-500 mt-1">Infrastructure, scheduled jobs, and their current status</p>
          {!loading && !error && (
            <p className="text-xs text-zinc-600 mt-1">
              {jobs.length} automations · {jobs.filter((j) => !j.isBash).length} AI · {jobs.filter((j) => j.isBash).length} bash
            </p>
          )}
        </div>

        {/* ── Section A: Infrastructure ── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Infrastructure</h2>
          <div className="grid grid-cols-1 gap-3">
            {/* MC Data Sync card */}
            <div className="rounded-xl border border-[#262626] bg-[#141414] p-4 flex gap-3 items-start">
              <div className="text-xl mt-0.5">⚡</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-zinc-100">MC Data Sync</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />OK
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-2">Every 10 min — session JSONLs → mc-data.json → push</p>
                <p className="text-[11px] text-zinc-600">
                  {mcLastRun ? `Last synced ${relativeTime(mcLastRun)}` : "Always on"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section B: Daily Schedule timeline ── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Daily Schedule (CAT)</h2>
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-4 overflow-x-auto">
            <div className="min-w-[560px]">
              {/* Hour labels */}
              <div className="relative flex mb-2" style={{ paddingLeft: "0px" }}>
                {[0, 4, 8, 12, 16, 20, 24].map((h) => (
                  <div
                    key={h}
                    className="absolute text-[10px] text-zinc-600 -translate-x-1/2"
                    style={{ left: `${(h / 24) * 100}%` }}
                  >
                    {h === 24 ? "24h" : `${h}h`}
                  </div>
                ))}
              </div>
              {/* Timeline bar */}
              <div className="relative h-2 bg-[#262626] rounded-full mb-8 mt-5">
                {/* Current time cursor */}
                <div
                  className="absolute top-0 w-0.5 h-4 bg-blue-400/60 -translate-y-1 rounded"
                  style={{ left: `${(catDecimalHour / 24) * 100}%` }}
                  title={`Now: ${formatCATHour(catDecimalHour)} CAT`}
                />
                {/* Job markers */}
                {DAILY_JOBS.map((job) => {
                  const pct = (job.catHour / 24) * 100;
                  const ran = catDecimalHour >= job.catHour;
                  const color = agentColors[job.agent] || "#6b7280";
                  return (
                    <div
                      key={`${job.agent}-${job.catHour}`}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${pct}%`, top: "-6px" }}
                    >
                      {/* Dot */}
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 border-[#141414] flex-shrink-0"
                        style={{ backgroundColor: ran ? color : "#374151", borderColor: ran ? color : "#374151" }}
                        title={`${job.label} — ${formatCATHour(job.catHour)} CAT`}
                      />
                      {/* Label below */}
                      <div className="mt-3 flex flex-col items-center">
                        <span className="text-[9px] text-zinc-500 whitespace-nowrap">{job.label}</span>
                        <span className="text-[8px] text-zinc-700 whitespace-nowrap">{ran ? "✓" : "⏳"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-1">
                {DAILY_JOBS.map((job) => {
                  const ran = catDecimalHour >= job.catHour;
                  const color = agentColors[job.agent] || "#6b7280";
                  return (
                    <div key={`${job.agent}-${job.catHour}`} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span>{job.label}</span>
                      <span className="text-zinc-600">{formatCATHour(job.catHour)}</span>
                      <span className={ran ? "text-green-400" : "text-zinc-600"}>{ran ? "✓" : "⏳"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section C: Weekly Grid ── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Weekly Grid</h2>
          <div className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[140px_repeat(7,1fr)] border-b border-[#262626]">
              <div className="px-3 py-2 text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Job</div>
              {DAY_LABELS.map((day, i) => (
                <div
                  key={day}
                  className={`px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wider ${
                    i === catDayOfWeek ? "text-blue-400" : "text-zinc-600"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Job rows */}
            {ALL_JOBS.map((job, rowIdx) => {
              const color = agentColors[job.agent] || "#6b7280";
              return (
                <div
                  key={`${job.agent}-${job.catHour}`}
                  className={`grid grid-cols-[140px_repeat(7,1fr)] ${rowIdx < ALL_JOBS.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}
                >
                  <div className="px-3 py-2.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[11px] text-zinc-400 truncate">{job.label}</span>
                  </div>
                  {DAY_LABELS.map((_, dayIdx) => {
                    // daily jobs get a dot every day; weekly jobs only on their weekday
                    // weekDay: 1=Mon(idx 0) ... 5=Fri(idx 4)
                    const weekDayMatch = job.weekDay !== undefined ? job.weekDay - 1 : -1;
                    const hasDot = job.daily ? true : dayIdx === weekDayMatch;
                    const isToday = dayIdx === catDayOfWeek;
                    return (
                      <div
                        key={dayIdx}
                        className={`flex items-center justify-center py-2.5 ${isToday ? "bg-white/[0.02]" : ""}`}
                      >
                        {hasDot && (
                          <div
                            className="w-2 h-2 rounded-full opacity-80"
                            style={{ backgroundColor: color }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
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

        {/* ── Job detail cards ── */}
        {!loading && !error && (
          <>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">All Jobs</h2>
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
                    {badge.isError && (
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-red-500/20 bg-red-500/10 rounded-t-xl">
                        <span className="text-base leading-none">⚠️</span>
                        <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                          Job failing — {job.consecutiveErrors} consecutive {job.consecutiveErrors === 1 ? "error" : "errors"}
                        </span>
                      </div>
                    )}

                    <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm"
                        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
                        title={job.owner}
                      >
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className={`text-sm font-semibold ${badge.isError ? "text-red-300" : "text-zinc-100"}`}>
                            {job.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.bgClass} ${badge.textClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass} ${badge.isError ? "animate-pulse" : ""}`} />
                            {badge.label}
                          </span>
                          {job.isBash && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-500 border border-zinc-700">
                              bash
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p
                            className="text-xs text-zinc-500 mb-1 truncate"
                            title={job.description}
                          >
                            {job.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                          <span style={{ color: `${color}cc` }} className="font-medium">{job.owner}</span>
                          <span className="font-mono text-zinc-400">{humanSchedule}</span>
                          {!job.isBash && <span className="font-mono text-zinc-700">{job.schedule}</span>}
                        </div>
                      </div>

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
          </>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="py-16 text-center text-zinc-600 text-sm">
            No scheduled jobs found
          </div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <p className="mt-5 text-[11px] text-zinc-700 text-right">
            AI crons + bash crons from mc-data.json · refreshes on reload
          </p>
        )}
      </div>
    </Shell>
  );
}
