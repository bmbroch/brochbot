"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { agentColors } from "@/lib/data-provider";
import { TZ } from "@/lib/utils";

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
  [TZ]: "CAT",
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

// ─── Dynamic schedule jobs (derived from live cron data) ─────────────────────

interface ScheduleJob {
  agent: string;
  label: string;
  catHour: number;
  daily: boolean;
  weekDay?: number; // 1=Mon...7=Sun (matches cron DOW 1-6, 7=Sun), undefined means daily
}

// Fixed UTC offsets for known timezones (standard time; close enough for display)
const TZ_OFFSET_HOURS: Record<string, number> = {
  [TZ]:                  2,
  "Africa/Johannesburg": 2,
  "Europe/London":       0,
  "America/New_York":    -5,
  "America/Los_Angeles": -8,
  "UTC":                 0,
  "":                    0,
};

/**
 * Parse a CronJob into a ScheduleJob for the timeline/grid.
 * Returns null for complex/unparseable schedules.
 * All output times are in CAT (UTC+2).
 */
function parseScheduleJob(job: CronJob): ScheduleJob | null {
  const parts = job.schedule.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minStr, hourStr, dom, month, dow] = parts;

  // Only handle simple fixed-time schedules
  if (hourStr === "*" || /[\/,\-]/.test(hourStr)) return null;
  if (minStr === "*" || /[\/,\-]/.test(minStr)) return null;
  if (dom !== "*" || month !== "*") return null;

  const cronHour = parseInt(hourStr, 10);
  const cronMin  = parseInt(minStr, 10);
  if (isNaN(cronHour) || isNaN(cronMin)) return null;

  // Convert cron timezone → CAT (UTC+2)
  const tzOffset = TZ_OFFSET_HOURS[job.timezone] ?? 0;
  const catDecimalHour = ((cronHour - tzOffset + 2 + 24) % 24) + cronMin / 60;

  const isDaily = dow === "*";
  let weekDay: number | undefined;

  if (!isDaily) {
    if (/[\/,\-]/.test(dow)) return null; // skip complex DOW
    const dowNum = parseInt(dow, 10);
    if (isNaN(dowNum)) return null;
    // Normalize: cron 0 or 7 = Sunday → weekDay 7; cron 1-6 = Mon-Sat → weekDay 1-6
    weekDay = (dowNum === 0 || dowNum === 7) ? 7 : dowNum;
  }

  return {
    agent: ownerToKey(job.owner),
    label: job.title,
    catHour: catDecimalHour,
    daily: isDaily,
    weekDay,
  };
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// CAT = UTC+2
const CAT_OFFSET_MS = 2 * 60 * 60 * 1000;

function getNowCAT(): Date {
  return new Date(Date.now() + CAT_OFFSET_MS);
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

  const catDecimalHour = getCATDecimalHour();
  const catDayOfWeek = getCATDayOfWeek();

  // Derive schedule visualisation directly from live cron data
  const allScheduleJobs: ScheduleJob[] = jobs
    .map(parseScheduleJob)
    .filter((j): j is ScheduleJob => j !== null)
    .sort((a, b) => a.catHour - b.catHour);
  const dailyScheduleJobs = allScheduleJobs.filter((j) => j.daily);

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

        {/* ── Section B: Daily Schedule (grouped vertical cards) ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Daily Schedule (CAT)</h2>
            <span className="text-[10px] text-zinc-600">Now: {formatCATHour(catDecimalHour)} CAT</span>
          </div>

          {/* Daily jobs — grouped by time window */}
          {[
            { key: "overnight", label: "🌙 Overnight", range: "12 AM – 6 AM", start: 0, end: 6 },
            { key: "morning",   label: "☀️ Morning",   range: "6 AM – 12 PM", start: 6, end: 12 },
            { key: "afternoon", label: "🌤 Afternoon",  range: "12 PM – 6 PM", start: 12, end: 18 },
            { key: "evening",   label: "🌆 Evening",   range: "6 PM – 12 AM", start: 18, end: 24 },
          ].map(({ key, label, range, start, end }) => {
            const windowJobs = dailyScheduleJobs.filter(
              (j) => j.catHour >= start && j.catHour < end
            );
            if (windowJobs.length === 0) return null;
            return (
              <div key={key} className="mb-4">
                {/* Window header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-zinc-300">{label}</span>
                  <span className="text-[10px] text-zinc-600">{range}</span>
                  <div className="flex-1 h-px bg-[#262626]" />
                </div>
                {/* Job rows */}
                <div className="space-y-1.5">
                  {windowJobs.map((job) => {
                    const ran = catDecimalHour >= job.catHour;
                    const color = agentColors[job.agent] || "#6b7280";
                    const emoji = OWNER_EMOJI[job.agent] || "⚙️";
                    return (
                      <div
                        key={`${job.agent}-${job.catHour}`}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                          ran
                            ? "border-[#2a2a2a] bg-[#141414]"
                            : "border-[#1e1e1e] bg-[#0d0d0d]"
                        }`}
                      >
                        {/* Left accent bar */}
                        <div
                          className="w-0.5 h-6 rounded-full flex-shrink-0 opacity-70"
                          style={{ backgroundColor: color }}
                        />
                        {/* Time */}
                        <span className="text-xs font-mono text-zinc-500 w-10 flex-shrink-0 tabular-nums">
                          {formatCATHour(job.catHour)}
                        </span>
                        {/* Agent emoji */}
                        <span className="text-base leading-none flex-shrink-0">{emoji}</span>
                        {/* Job label */}
                        <span
                          className={`text-sm flex-1 min-w-0 truncate ${
                            ran ? "text-zinc-200" : "text-zinc-500"
                          }`}
                        >
                          {job.label}
                        </span>
                        {/* Status pill */}
                        {ran ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-green-400" />
                            done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800/60 text-zinc-500 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-zinc-600" />
                            pending
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Weekly-only jobs (not daily) */}
          {allScheduleJobs.filter((j) => !j.daily).length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-zinc-300">📅 Weekly</span>
                <span className="text-[10px] text-zinc-600">runs on a specific day</span>
                <div className="flex-1 h-px bg-[#262626]" />
              </div>
              <div className="space-y-1.5">
                {allScheduleJobs
                  .filter((j) => !j.daily)
                  .map((job) => {
                    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                    const dayName =
                      job.weekDay !== undefined ? dayNames[(job.weekDay - 1) % 7] : "?";
                    // weekDay: 1=Mon…7=Sun; catDayOfWeek: Mon=0…Sun=6
                    const isToday =
                      job.weekDay !== undefined && job.weekDay - 1 === catDayOfWeek;
                    const ran = isToday && catDecimalHour >= job.catHour;
                    const color = agentColors[job.agent] || "#6b7280";
                    const emoji = OWNER_EMOJI[job.agent] || "⚙️";
                    return (
                      <div
                        key={`${job.agent}-${job.catHour}`}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                          isToday
                            ? "border-blue-500/25 bg-blue-500/5"
                            : "border-[#1e1e1e] bg-[#0d0d0d]"
                        }`}
                      >
                        <div
                          className="w-0.5 h-6 rounded-full flex-shrink-0 opacity-70"
                          style={{ backgroundColor: color }}
                        />
                        {/* Day tag */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide w-7 flex-shrink-0 ${
                            isToday ? "text-blue-400" : "text-zinc-600"
                          }`}
                        >
                          {dayName}
                        </span>
                        <span className="text-xs font-mono text-zinc-500 w-10 flex-shrink-0 tabular-nums">
                          {formatCATHour(job.catHour)}
                        </span>
                        <span className="text-base leading-none flex-shrink-0">{emoji}</span>
                        <span
                          className={`text-sm flex-1 min-w-0 truncate ${
                            isToday ? "text-zinc-200" : "text-zinc-500"
                          }`}
                        >
                          {job.label}
                        </span>
                        {isToday && ran ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-green-400" />
                            done
                          </span>
                        ) : isToday ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 flex-shrink-0">
                            <span className="w-1 h-1 rounded-full bg-blue-400" />
                            today
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* ── Section C: Weekly Grid (status cells) ── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Weekly Grid</h2>
          <div className="rounded-xl border border-[#262626] bg-[#141414] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_repeat(7,minmax(0,1fr))] border-b border-[#262626]">
              <div className="px-3 py-2.5 text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Job</div>
              {DAY_LABELS.map((day, i) => (
                <div
                  key={day}
                  className={`py-2.5 text-center text-[10px] font-bold uppercase tracking-wider ${
                    i === catDayOfWeek
                      ? "text-blue-400 bg-blue-500/5"
                      : "text-zinc-600"
                  }`}
                >
                  {day}
                  {i === catDayOfWeek && (
                    <div className="mt-0.5 mx-auto w-1 h-1 rounded-full bg-blue-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Job rows */}
            {allScheduleJobs.map((job, rowIdx) => {
              const color = agentColors[job.agent] || "#6b7280";
              const emoji = OWNER_EMOJI[job.agent] || "⚙️";
              return (
                <div
                  key={`${job.agent}-${job.catHour}`}
                  className={`grid grid-cols-[1fr_repeat(7,minmax(0,1fr))] ${
                    rowIdx < allScheduleJobs.length - 1 ? "border-b border-[#1a1a1a]" : ""
                  }`}
                >
                  {/* Job label */}
                  <div className="px-3 py-3 flex items-center gap-2 min-w-0">
                    <span className="text-sm leading-none flex-shrink-0">{emoji}</span>
                    <span className="text-[11px] text-zinc-400 truncate">{job.label}</span>
                  </div>

                  {/* Day cells */}
                  {DAY_LABELS.map((_, dayIdx) => {
                    const weekDayMatch = job.weekDay !== undefined ? job.weekDay - 1 : -1;
                    const scheduled = job.daily ? true : dayIdx === weekDayMatch;
                    const isToday = dayIdx === catDayOfWeek;
                    // Past day = before today (in this week); future = after today
                    const isPast = dayIdx < catDayOfWeek;
                    const isFuture = dayIdx > catDayOfWeek;
                    // For today: did it already run?
                    const ranToday = isToday && catDecimalHour >= job.catHour;

                    // Determine cell style
                    let cellContent: React.ReactNode = null;
                    if (scheduled) {
                      if (isToday && ranToday) {
                        // Ran today — full color cell with check
                        cellContent = (
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold shadow-sm"
                            style={{
                              backgroundColor: `${color}25`,
                              border: `1px solid ${color}50`,
                              color: color,
                              boxShadow: `0 0 8px ${color}20`,
                            }}
                            title={`${job.label} — ran at ${formatCATHour(job.catHour)} CAT`}
                          >
                            ✓
                          </div>
                        );
                      } else if (isToday && !ranToday) {
                        // Today, not yet run — blue outline
                        cellContent = (
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono"
                            style={{
                              border: `1px solid ${color}40`,
                              color: `${color}80`,
                            }}
                            title={`${job.label} — at ${formatCATHour(job.catHour)} CAT (pending)`}
                          >
                            {formatCATHour(job.catHour)}
                          </div>
                        );
                      } else if (isPast) {
                        // Past day — dimmed filled cell (assumed ran)
                        cellContent = (
                          <div
                            className="w-5 h-5 rounded-sm opacity-30"
                            style={{ backgroundColor: color }}
                            title={`${job.label} — ${DAY_LABELS[dayIdx]}`}
                          />
                        );
                      } else {
                        // Future day — faint outline dot
                        cellContent = (
                          <div
                            className="w-5 h-5 rounded-sm opacity-15"
                            style={{
                              border: `1px solid ${color}`,
                              backgroundColor: "transparent",
                            }}
                            title={`${job.label} — ${DAY_LABELS[dayIdx]} (scheduled)`}
                          />
                        );
                      }
                    }

                    return (
                      <div
                        key={dayIdx}
                        className={`flex items-center justify-center py-3 ${
                          isToday ? "bg-blue-500/[0.03]" : ""
                        }`}
                      >
                        {cellContent}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Legend footer */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-3 py-2.5 border-t border-[#1a1a1a] bg-[#0f0f0f]">
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <div className="w-4 h-4 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center text-green-400 text-[8px]">✓</div>
                ran
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <div className="w-4 h-4 rounded-sm border border-white/20 text-[8px] flex items-center justify-center text-zinc-500">⏰</div>
                pending today
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <div className="w-4 h-4 rounded-sm bg-white/20 opacity-40" />
                past
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
                <div className="w-4 h-4 rounded-sm border border-white/20 opacity-20" />
                scheduled
              </div>
            </div>
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
