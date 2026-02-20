"use client";

import Shell from "@/components/Shell";
import React, { useEffect, useState } from "react";
import { agentColors } from "@/lib/data-provider";

// ─── Types ───────────────────────────────────────────────────────────────────

/** A one-shot job (schedule.kind === 'at' or deleteAfterRun === true) */
interface OneShotJob {
  id: string;
  title: string;
  schedule: { kind: "at"; at: string } | string;
  owner: string;
  status: string;
  lastStatus?: string;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  deleteAfterRun?: boolean;
  description?: string;
}

/** A recurring job from calendar (schedule.kind === 'cron') or bashCrons */
interface RecurringJob {
  id: string;
  title: string;
  schedule: { kind: "cron"; expr: string } | string;
  timezone: string;
  owner: string;
  status: string;
  lastStatus: string;
  lastRunAt: string | null;
  nextRunAt?: string | null;
  consecutiveErrors?: number;
  description?: string;
  isBash?: boolean;
}

/** Raw item from mc-data.json calendar array */
interface RawCalendarItem {
  id: string;
  title: string;
  schedule: { kind: string; at?: string; expr?: string } | string;
  timezone?: string;
  owner: string;
  enabled?: boolean;
  status: string;
  lastStatus?: string;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  consecutiveErrors?: number;
  deleteAfterRun?: boolean;
  /** Legacy one-shot flag used by some mc-data.json entries */
  oneShot?: boolean;
  description?: string;
}

/** Raw bash cron from mc-data.json */
interface RawBashCron {
  id: string;
  title: string;
  schedule: string;
  timezone: string;
  owner: string;
  description?: string;
  lastRunAt?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// CAT = UTC+2
const CAT_OFFSET_MS = 2 * 60 * 60 * 1000;

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

const TZ_OFFSET_HOURS: Record<string, number> = {
  "Africa/Windhoek": 2,
  "Africa/Johannesburg": 2,
  "Europe/London": 0,
  "America/New_York": -5,
  "America/Los_Angeles": -8,
  "UTC": 0,
  "": 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ownerToKey(owner: string): string {
  return owner.toLowerCase().replace(/\s+/g, "");
}

function getNowCAT(): Date {
  return new Date(Date.now() + CAT_OFFSET_MS);
}

function getCATDecimalHour(): number {
  const now = getNowCAT();
  return now.getUTCHours() + now.getUTCMinutes() / 60;
}

// Mon=0 … Sun=6
function getCATDayOfWeek(): number {
  const d = getNowCAT().getUTCDay();
  return d === 0 ? 6 : d - 1;
}

function formatCATTime(h: number): string {
  const hr = Math.floor(h) % 24;
  const mn = Math.round((h - Math.floor(h)) * 60);
  const ampm = hr < 12 ? "AM" : "PM";
  const displayHr = hr % 12 === 0 ? 12 : hr % 12;
  return mn === 0
    ? `${displayHr} ${ampm}`
    : `${displayHr}:${mn.toString().padStart(2, "0")} ${ampm}`;
}

function formatCATHour24(h: number): string {
  const hr = Math.floor(h) % 24;
  const mn = Math.round((h - Math.floor(h)) * 60);
  return `${hr}:${mn.toString().padStart(2, "0")}`;
}

function formatCountdown(hoursUntil: number): string {
  if (!isFinite(hoursUntil) || isNaN(hoursUntil)) return "—";
  if (hoursUntil < 1 / 60) return "now";
  if (hoursUntil < 1) {
    const m = Math.round(hoursUntil * 60);
    return `in ${m}m`;
  }
  const h = Math.floor(hoursUntil);
  const m = Math.round((hoursUntil - h) * 60);
  if (m === 0) return `in ${h}h`;
  return `in ${h}h ${m}m`;
}

function relativeTime(isoStr: string | null | undefined): string {
  if (!isoStr) return "Never";
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffMs = now - then;
  const abs = Math.abs(diffMs);
  if (abs < 60_000) return "just now";
  if (abs < 3_600_000) return `${Math.round(abs / 60_000)}m ago`;
  if (abs < 86_400_000) return `${Math.round(abs / 3_600_000)}h ago`;
  return `${Math.round(abs / 86_400_000)}d ago`;
}

/** Convert ISO timestamp → CAT decimal hour (e.g. "2026-02-20T03:00:00Z" → 5.0 for UTC+2) */
function isoToCAT(iso: string): number {
  const d = new Date(iso);
  const catH = d.getUTCHours() + 2; // UTC+2
  const catM = d.getUTCMinutes();
  return (catH % 24) + catM / 60;
}

/** Convert ISO timestamp → CAT Date object */
function isoToCATDate(iso: string): Date {
  return new Date(new Date(iso).getTime() + CAT_OFFSET_MS);
}

/** Format a CAT Date as "Feb 20, 11 PM" */
function formatCATDateTime(iso: string): string {
  const d = isoToCATDate(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h < 12 ? "AM" : "PM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const timeStr = m === 0 ? `${displayH} ${ampm}` : `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${timeStr}`;
}

/** Hours until a future ISO timestamp from now */
function hoursUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return ms / 3_600_000;
}

/** Parse a schedule field that may be a JS object, valid JSON string, or Python-style dict string.
 *  e.g. "{'kind': 'at', 'at': '2026-02-20T22:00:00.000Z'}" → { kind: "at", at: "..." }
 */
function parseScheduleObj(raw: unknown): Record<string, string> | null {
  if (typeof raw === "object" && raw !== null) return raw as Record<string, string>;
  if (typeof raw === "string") {
    // Try valid JSON first
    try { return JSON.parse(raw); } catch { /* ignore */ }
    // Try Python-style dict (single quotes → double quotes, None/True/False)
    try {
      const converted = raw
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false");
      return JSON.parse(converted);
    } catch { /* ignore */ }
  }
  return null;
}

// ─── Cron parsing ─────────────────────────────────────────────────────────────

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ParsedCron {
  catHour: number;       // fractional hour in CAT
  isDaily: boolean;
  weekDay?: number;      // 0=Mon … 6=Sun; undefined = daily
}

function parseCronExpr(expr: string, tz: string): ParsedCron | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minStr, hourStr, dom, month, dow] = parts;
  if (hourStr === "*" || /[\/,\-]/.test(hourStr)) return null;
  if (minStr === "*" || /[\/]/.test(minStr)) return null;
  if (dom !== "*" || month !== "*") return null;

  const cronHour = parseInt(hourStr, 10);
  const cronMin = parseInt(minStr, 10);
  if (isNaN(cronHour) || isNaN(cronMin)) return null;

  const tzOff = TZ_OFFSET_HOURS[tz] ?? 0;
  const catDecimal = ((cronHour - tzOff + 2 + 24) % 24) + cronMin / 60;

  if (dow === "*") return { catHour: catDecimal, isDaily: true };

  // Handle comma-separated (e.g. "23,10") — skip complex
  if (/[,\-]/.test(dow)) return null;
  const dowNum = parseInt(dow, 10);
  if (isNaN(dowNum)) return null;
  // cron 0/7=Sun → 6; cron 1=Mon → 0
  const weekDay = dowNum === 0 || dowNum === 7 ? 6 : dowNum - 1;
  return { catHour: catDecimal, isDaily: false, weekDay };
}

/** Hours until next run for a parsed cron relative to current CAT time */
function hoursUntilNextCron(parsed: ParsedCron, catHourNow: number, catDowNow: number): number {
  if (parsed.isDaily) {
    if (parsed.catHour > catHourNow) return parsed.catHour - catHourNow;
    return 24 - catHourNow + parsed.catHour;
  }
  const dayIdx = parsed.weekDay!;
  const daysDiff = (dayIdx - catDowNow + 7) % 7;
  if (daysDiff === 0) {
    if (parsed.catHour > catHourNow) return parsed.catHour - catHourNow;
    return 7 * 24 - catHourNow + parsed.catHour;
  }
  return daysDiff * 24 - catHourNow + parsed.catHour;
}

/** Human-readable schedule string — handles simple and complex patterns */
function cronToLabel(expr: string, tz: string): string {
  // First try the simple parser
  const p = parseCronExpr(expr, tz);
  if (p) {
    const timeStr = formatCATTime(p.catHour);
    if (p.isDaily) return `Daily at ${timeStr} CAT`;
    return `${DAY_NAMES[p.weekDay!]}s at ${timeStr} CAT`;
  }

  // Extended patterns
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return expr;
  const [minStr, hourStr, dom, month] = parts;
  if (dom !== "*" || month !== "*") return expr;

  // Every N minutes: */N * * * *
  const everyMatch = /^\*\/(\d+)$/.exec(minStr);
  if (everyMatch && hourStr === "*") {
    const n = parseInt(everyMatch[1], 10);
    return n === 1 ? "Every minute" : `Every ${n} minutes`;
  }

  // Fixed minute, comma-separated hours: M H1,H2,... * * *
  if (/^\d+$/.test(minStr) && /^[\d,]+$/.test(hourStr)) {
    const cronMin = parseInt(minStr, 10);
    const hourParts = hourStr.split(",").map((h) => parseInt(h.trim(), 10));
    if (hourParts.every((h) => !isNaN(h))) {
      const tzOff = TZ_OFFSET_HOURS[tz] ?? 0;
      const catRuns = hourParts.map(
        (h) => ((h - tzOff + 2 + 24) % 24) + cronMin / 60
      );
      if (catRuns.length === 1) {
        return `Daily at ${formatCATTime(catRuns[0])} CAT`;
      }
      if (catRuns.length === 2) {
        return `Twice daily at ${formatCATTime(catRuns[0])} & ${formatCATTime(catRuns[1])} CAT`;
      }
      return `${catRuns.length}× daily at ${catRuns.map(formatCATTime).join(", ")} CAT`;
    }
  }

  return expr;
}

/** Hours until next run, handling all supported cron patterns */
function computeNextRunHours(
  expr: string,
  tz: string,
  catHourNow: number,
  catDowNow: number
): number {
  // Try simple parser first
  const p = parseCronExpr(expr, tz);
  if (p) return hoursUntilNextCron(p, catHourNow, catDowNow);

  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return Infinity;
  const [minStr, hourStr, dom, month] = parts;
  if (dom !== "*" || month !== "*") return Infinity;

  // Every N minutes: */N * * * *
  const everyMatch = /^\*\/(\d+)$/.exec(minStr);
  if (everyMatch && hourStr === "*") {
    const n = parseInt(everyMatch[1], 10);
    if (isNaN(n) || n <= 0) return Infinity;
    const nowSec = (Date.now() / 1000) % (n * 60);
    const secUntilNext = n * 60 - nowSec;
    return secUntilNext / 3600;
  }

  // Fixed minute, comma-separated hours: M H1,H2,... * * *
  if (/^\d+$/.test(minStr) && /^[\d,]+$/.test(hourStr)) {
    const cronMin = parseInt(minStr, 10);
    const hourParts = hourStr.split(",").map((h) => parseInt(h.trim(), 10));
    if (hourParts.every((h) => !isNaN(h))) {
      const tzOff = TZ_OFFSET_HOURS[tz] ?? 0;
      const catRuns = hourParts.map(
        (h) => ((h - tzOff + 2 + 24) % 24) + cronMin / 60
      );
      let minHours = Infinity;
      for (const runHour of catRuns) {
        let h = runHour - catHourNow;
        if (h <= 0) h += 24;
        if (h < minHours) minHours = h;
      }
      return minHours;
    }
  }

  return Infinity;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

interface Badge {
  label: string;
  textClass: string;
  bgClass: string;
  dotClass: string;
  pulse: boolean;
}

function statusBadge(status: string): Badge {
  const s = status.toLowerCase();
  if (s === "ok") return { label: "OK", textClass: "text-green-400", bgClass: "bg-green-500/10", dotClass: "bg-green-400", pulse: false };
  if (s === "running") return { label: "Running", textClass: "text-blue-400", bgClass: "bg-blue-500/10", dotClass: "bg-blue-400", pulse: true };
  if (s === "pending") return { label: "Pending", textClass: "text-zinc-400", bgClass: "bg-zinc-500/10", dotClass: "bg-zinc-500", pulse: false };
  if (s === "done") return { label: "Done", textClass: "text-green-400", bgClass: "bg-green-500/10", dotClass: "bg-green-400", pulse: false };
  if (s.startsWith("error")) {
    const m = status.match(/(\d+)/);
    const n = m ? ` ×${m[1]}` : "";
    return { label: `Error${n}`, textClass: "text-red-400", bgClass: "bg-red-500/15", dotClass: "bg-red-400", pulse: true };
  }
  return { label: "Idle", textClass: "text-zinc-400", bgClass: "bg-zinc-500/10", dotClass: "bg-zinc-500", pulse: false };
}

// ─── Modal types ──────────────────────────────────────────────────────────────

type ModalJobKind = "oneshot" | "recurring";

interface ModalJob {
  kind: ModalJobKind;
  id: string;
  title: string;
  owner: string;
  status: string;
  lastStatus?: string;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  description?: string;
  scheduleLabel?: string;
  countdown?: string;
  isBash?: boolean;
  isRecurring?: boolean;
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────

function JobDetailModal({
  job,
  onClose,
}: {
  job: ModalJob;
  onClose: () => void;
}) {
  const ownerKey = ownerToKey(job.owner);
  const color = agentColors[ownerKey] || "#6b7280";
  const emoji = OWNER_EMOJI[ownerKey] || "⚙️";
  const badge = statusBadge(job.status);
  const lastBadge = job.lastStatus ? statusBadge(job.lastStatus) : badge;

  // Close on Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet / modal */}
      <div
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-[#222] bg-[#0f0f0f] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar with color accent */}
        <div className="h-1 w-full" style={{ background: color }} />

        {/* Top row */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl flex-shrink-0">{emoji}</span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white leading-tight break-words">
                {job.title}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{job.owner}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#222] mx-5" />

        {/* Details grid */}
        <div className="px-5 py-4 space-y-3">

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Description</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{job.description}</p>
            </div>
          )}

          {/* Schedule */}
          {job.scheduleLabel && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Schedule</p>
              <p className="text-sm text-zinc-300">{job.scheduleLabel}</p>
            </div>
          )}

          {/* Type badges row */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bgClass} ${badge.textClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass} ${badge.pulse ? "animate-pulse" : ""}`} />
              {badge.label}
            </span>
            {job.kind === "oneshot" ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                One-shot
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Recurring
              </span>
            )}
            {job.isBash && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                bash
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#1a1a1a]" />

          {/* Two-column metadata */}
          <div className="grid grid-cols-2 gap-3">
            {/* Next run */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Next Run</p>
              <p className="text-sm text-zinc-300">
                {job.nextRunAt ? formatCATDateTime(job.nextRunAt) : "—"}
              </p>
              {job.countdown && (
                <p className="text-[11px] text-amber-400 font-semibold mt-0.5">{job.countdown}</p>
              )}
            </div>

            {/* Last run */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Last Run</p>
              <div className="flex flex-col gap-1">
                {job.lastStatus && (
                  <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold ${lastBadge.bgClass} ${lastBadge.textClass}`}>
                    <span className={`w-1 h-1 rounded-full ${lastBadge.dotClass}`} />
                    {lastBadge.label}
                  </span>
                )}
                <p className="text-sm text-zinc-300">
                  {job.lastRunAt ? relativeTime(job.lastRunAt) : "Never"}
                </p>
                {job.lastRunAt && (
                  <p className="text-[11px] text-zinc-600">{formatCATDateTime(job.lastRunAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Safe-area spacer for mobile */}
        <div className="h-safe-bottom pb-4" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const [oneShots, setOneShots] = useState<OneShotJob[]>([]);
  const [recurring, setRecurring] = useState<RecurringJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setNow] = useState(() => Date.now());
  const [selectedJob, setSelectedJob] = useState<ModalJob | null>(null);

  // Tick every 30s so countdowns stay fresh
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
        const cal: RawCalendarItem[] = d.calendar ?? [];
        const bashRaw: RawBashCron[] = d.bashCrons ?? [];

        // ── Classify calendar items ──────────────────────────────────────────
        const shots: OneShotJob[] = [];
        const recur: RecurringJob[] = [];

        for (const item of cal) {
          const schedObj = parseScheduleObj(item.schedule);
          const schedKind = schedObj?.kind ?? null;
          const isOneShot =
            schedKind === "at" || item.deleteAfterRun === true || item.oneShot === true;

          if (isOneShot) {
            shots.push(item as OneShotJob);
          } else {
            // Treat as recurring
            const expr =
              typeof item.schedule === "object"
                ? item.schedule.expr ?? ""
                : item.schedule;
            recur.push({
              id: item.id,
              title: item.title,
              schedule: item.schedule as RecurringJob["schedule"],
              timezone: item.timezone ?? "Africa/Windhoek",
              owner: item.owner,
              status: item.status,
              lastStatus: item.lastStatus ?? item.status,
              lastRunAt: item.lastRunAt ?? null,
              nextRunAt: item.nextRunAt ?? null,
              consecutiveErrors: item.consecutiveErrors ?? 0,
              description: item.description,
              isBash: false,
            });
            void expr; // suppress unused
          }
        }

        // ── Bash crons are always recurring ─────────────────────────────────
        for (const b of bashRaw) {
          recur.push({
            id: b.id,
            title: b.title,
            schedule: b.schedule,
            timezone: b.timezone ?? "",
            owner: b.owner,
            status: "ok",
            lastStatus: "ok",
            lastRunAt: b.lastRunAt ?? null,
            nextRunAt: null,
            consecutiveErrors: 0,
            description: b.description,
            isBash: true,
          });
        }

        // Sort one-shots chronologically
        shots.sort((a, b) => {
          const aAt =
            typeof a.schedule === "object" && a.schedule.kind === "at"
              ? a.schedule.at
              : a.nextRunAt ?? "";
          const bAt =
            typeof b.schedule === "object" && b.schedule.kind === "at"
              ? b.schedule.at
              : b.nextRunAt ?? "";
          return new Date(aAt).getTime() - new Date(bAt).getTime();
        });

        setOneShots(shots);
        setRecurring(recur);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const catHourNow = getCATDecimalHour();
  const catDowNow = getCATDayOfWeek();
  const catDate = getNowCAT();

  // ── Build recurring display data ──────────────────────────────────────────
  interface RecurringDisplay {
    job: RecurringJob;
    parsed: ParsedCron | null;
    hoursUntilNext: number;
    ranAlreadyToday: boolean;
    label: string;
    isWeekly: boolean;
  }

  const recurringDisplay: RecurringDisplay[] = recurring.map((job) => {
    const expr =
      typeof job.schedule === "object" && job.schedule.kind === "cron"
        ? job.schedule.expr
        : typeof job.schedule === "string"
        ? job.schedule
        : "";
    const tz =
      typeof job.timezone === "string" ? job.timezone : "Africa/Windhoek";
    const parsed = parseCronExpr(expr, tz);
    const hours = computeNextRunHours(expr, tz, catHourNow, catDowNow);
    const ranToday =
      parsed !== null &&
      parsed.isDaily &&
      parsed.catHour < catHourNow;
    const lbl = cronToLabel(expr, tz);
    return {
      job,
      parsed,
      hoursUntilNext: hours,
      ranAlreadyToday: ranToday,
      label: lbl,
      isWeekly: parsed !== null && !parsed.isDaily,
    };
  });

  // Sort by next run ascending
  recurringDisplay.sort((a, b) => a.hoursUntilNext - b.hoursUntilNext);

  const dailyJobs = recurringDisplay.filter((r) => !r.isWeekly);
  const weeklyJobs = recurringDisplay.filter((r) => r.isWeekly);

  // Day label for tonight section
  const todayName = DAY_NAMES[catDowNow] ?? "Today";

  return (
    <Shell>
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Scheduled jobs and recurring tasks
          </p>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center gap-3 text-zinc-500 py-16 justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm text-red-400">
            Failed to load: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ══════════════════════════════════════════════════════════════
                Section 1: Tonight's Tasks (one-shots only; hidden if empty)
            ══════════════════════════════════════════════════════════════ */}
            {oneShots.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-mc-primary">Tonight&apos;s Tasks</h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {oneShots.length} queued
                  </span>
                  <div className="flex-1 h-px bg-[var(--border-medium)]" />
                  <span className="text-[10px] text-zinc-600">{todayName} · CAT (UTC+2)</span>
                </div>

                <div className="space-y-2">
                  {oneShots.map((job) => {
                    const ownerKey = ownerToKey(job.owner);
                    const color = agentColors[ownerKey] || "#6b7280";
                    const emoji = OWNER_EMOJI[ownerKey] || "⚙️";
                    const badge = statusBadge(job.status ?? "pending");

                    // Figure out the run time — handle plain objects, JSON strings, and Python-dict strings
                    const parsedJobSched = parseScheduleObj(job.schedule);
                    const runAt =
                      (parsedJobSched?.kind === "at" ? parsedJobSched.at : null) ??
                      job.nextRunAt ??
                      null;

                    const catTimeLabel = runAt ? formatCATDateTime(runAt) : "—";
                    const hrs = runAt ? hoursUntil(runAt) : null;
                    const isImminent = hrs !== null && hrs > 0 && hrs < 2;
                    const isPast = hrs !== null && hrs <= 0;

                    return (
                      <div
                        key={job.id}
                        onClick={() =>
                          setSelectedJob({
                            kind: "oneshot",
                            id: job.id,
                            title: job.title,
                            owner: job.owner,
                            status: job.status ?? "pending",
                            lastStatus: job.lastStatus,
                            lastRunAt: job.lastRunAt,
                            nextRunAt: runAt,
                            description: job.description,
                            scheduleLabel: catTimeLabel,
                            countdown: hrs !== null && hrs > 0 ? formatCountdown(hrs) : undefined,
                          })
                        }
                        className={`rounded-xl border px-4 py-3.5 flex items-center gap-4 transition-all cursor-pointer hover:bg-white/[0.02] active:scale-[0.99] ${
                          isImminent
                            ? "border-amber-500/25 bg-amber-500/5"
                            : isPast
                            ? "border-mc-medium bg-mc-card"
                            : "border-mc-subtle bg-mc-base"
                        }`}
                      >
                        {/* Color accent */}
                        <div
                          className="w-0.5 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />

                        {/* Time */}
                        <div className="flex flex-col items-end w-24 flex-shrink-0">
                          <span className="text-xs font-mono text-mc-secondary tabular-nums">
                            {catTimeLabel}
                          </span>
                          {hrs !== null && hrs > 0 && (
                            <span
                              className={`text-[10px] font-semibold tabular-nums ${
                                isImminent ? "text-amber-400" : "text-zinc-600"
                              }`}
                            >
                              {formatCountdown(hrs)}
                            </span>
                          )}
                          {isPast && (
                            <span className="text-[10px] text-zinc-500 font-medium">Completed</span>
                          )}
                        </div>

                        {/* Agent */}
                        <span className="text-lg flex-shrink-0">{emoji}</span>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-mc-primary font-medium truncate">
                            {job.title}
                          </p>
                          {job.description && (
                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                              {job.description}
                            </p>
                          )}
                        </div>

                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${badge.bgClass} ${badge.textClass}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${badge.dotClass} ${badge.pulse ? "animate-pulse" : ""}`}
                          />
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                Section 2: Recurring Schedule
            ══════════════════════════════════════════════════════════════ */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-mc-primary">Recurring Schedule</h2>
                <div className="flex-1 h-px bg-[var(--border-medium)]" />
                <span className="text-[10px] text-zinc-600">
                  {DAY_NAMES[catDowNow]} · {formatCATHour24(catHourNow)} CAT
                </span>
              </div>

              {recurringDisplay.length === 0 ? (
                <div className="py-12 text-center text-zinc-600 text-sm">
                  No recurring jobs found
                </div>
              ) : (
                <div className="space-y-8">

                  {/* ── Daily Jobs ─────────────────────────────────────────── */}
                  {dailyJobs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Daily</span>
                        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                      </div>

                      <div className="rounded-xl border border-mc-medium bg-mc-card overflow-hidden divide-y divide-[var(--border-subtle)]">
                        {dailyJobs.map((item) => {
                          const { job, parsed, hoursUntilNext } = item;
                          const ownerKey = ownerToKey(job.owner);
                          const color = agentColors[ownerKey] || "#6b7280";
                          const emoji = OWNER_EMOJI[ownerKey] || "⚙️";
                          const lastBadge = statusBadge(job.lastStatus ?? job.status);
                          const isImminent = hoursUntilNext < 1;
                          const timeLabel = parsed
                            ? formatCATTime(parsed.catHour)
                            : isFinite(hoursUntilNext)
                            ? (() => {
                                const nextCATDate = new Date(Date.now() + CAT_OFFSET_MS + hoursUntilNext * 3_600_000);
                                return formatCATTime(nextCATDate.getUTCHours() + nextCATDate.getUTCMinutes() / 60);
                              })()
                            : "—";

                          return (
                            <div
                              key={job.id}
                              onClick={() =>
                                setSelectedJob({
                                  kind: "recurring",
                                  id: job.id,
                                  title: job.title,
                                  owner: job.owner,
                                  status: job.status,
                                  lastStatus: job.lastStatus ?? job.status,
                                  lastRunAt: job.lastRunAt,
                                  nextRunAt: job.nextRunAt,
                                  description: job.description,
                                  scheduleLabel: item.label,
                                  countdown: formatCountdown(hoursUntilNext),
                                  isBash: job.isBash,
                                  isRecurring: true,
                                })
                              }
                              className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors hover:bg-white/[0.02] active:bg-white/[0.04] ${
                                isImminent ? "bg-amber-500/[0.03]" : ""
                              }`}
                            >
                              {/* Next run countdown */}
                              <div className="flex flex-col items-end w-20 flex-shrink-0">
                                <span className="text-xs font-mono text-mc-secondary tabular-nums">
                                  {timeLabel}
                                </span>
                                <span
                                  className={`text-[10px] tabular-nums font-semibold ${
                                    isImminent ? "text-amber-400" : "text-zinc-600"
                                  }`}
                                >
                                  {formatCountdown(hoursUntilNext)}
                                </span>
                              </div>

                              {/* Color bar */}
                              <div
                                className="w-0.5 h-7 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />

                              {/* Agent */}
                              <span className="text-base flex-shrink-0">{emoji}</span>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-mc-primary font-medium truncate">
                                  {job.title}
                                </p>
                                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                                  {item.label}
                                  {job.isBash && (
                                    <span className="ml-2 px-1.5 py-px rounded text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700">
                                      bash
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Last run status */}
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${lastBadge.bgClass} ${lastBadge.textClass}`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${lastBadge.dotClass}`} />
                                  {lastBadge.label}
                                </span>
                                <span className="text-[10px] text-zinc-600">
                                  {job.lastRunAt ? relativeTime(job.lastRunAt) : "never"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Weekly Jobs ─────────────────────────────────────────── */}
                  {weeklyJobs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Weekly</span>
                        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                      </div>

                      <div className="rounded-xl border border-mc-medium bg-mc-card overflow-hidden divide-y divide-[var(--border-subtle)]">
                        {weeklyJobs.map((item) => {
                          const { job, parsed, hoursUntilNext } = item;
                          const ownerKey = ownerToKey(job.owner);
                          const color = agentColors[ownerKey] || "#6b7280";
                          const emoji = OWNER_EMOJI[ownerKey] || "⚙️";
                          const lastBadge = statusBadge(job.lastStatus ?? job.status);
                          const isImminent = hoursUntilNext < 2;
                          const dayLabel =
                            parsed?.weekDay !== undefined
                              ? DAY_NAMES[parsed.weekDay]
                              : "?";
                          const timeLabel = parsed
                            ? formatCATTime(parsed.catHour)
                            : "—";
                          const isToday =
                            parsed?.weekDay !== undefined &&
                            parsed.weekDay === catDowNow;

                          return (
                            <div
                              key={job.id}
                              onClick={() =>
                                setSelectedJob({
                                  kind: "recurring",
                                  id: job.id,
                                  title: job.title,
                                  owner: job.owner,
                                  status: job.status,
                                  lastStatus: job.lastStatus ?? job.status,
                                  lastRunAt: job.lastRunAt,
                                  nextRunAt: job.nextRunAt,
                                  description: job.description,
                                  scheduleLabel: item.label,
                                  countdown: formatCountdown(hoursUntilNext),
                                  isBash: job.isBash,
                                  isRecurring: true,
                                })
                              }
                              className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-colors hover:bg-white/[0.02] active:bg-white/[0.04] ${
                                isImminent ? "bg-amber-500/[0.03]" : ""
                              }`}
                            >
                              {/* Day + time */}
                              <div className="flex flex-col items-end w-20 flex-shrink-0">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wide ${
                                    isToday ? "text-blue-400" : "text-zinc-500"
                                  }`}
                                >
                                  {dayLabel}
                                </span>
                                <span className="text-xs font-mono text-mc-secondary tabular-nums">
                                  {timeLabel}
                                </span>
                                <span
                                  className={`text-[10px] tabular-nums font-semibold ${
                                    isImminent ? "text-amber-400" : "text-zinc-600"
                                  }`}
                                >
                                  {formatCountdown(hoursUntilNext)}
                                </span>
                              </div>

                              {/* Color bar */}
                              <div
                                className="w-0.5 h-7 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />

                              {/* Agent */}
                              <span className="text-base flex-shrink-0">{emoji}</span>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-mc-primary font-medium truncate">
                                  {job.title}
                                </p>
                                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                                  {item.label}
                                  {job.isBash && (
                                    <span className="ml-2 px-1.5 py-px rounded text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700">
                                      bash
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Last run status */}
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${lastBadge.bgClass} ${lastBadge.textClass}`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${lastBadge.dotClass}`} />
                                  {lastBadge.label}
                                </span>
                                <span className="text-[10px] text-zinc-600">
                                  {job.lastRunAt ? relativeTime(job.lastRunAt) : "never"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* ── Footer ── */}
            {recurring.length > 0 && (
              <p className="mt-8 text-[11px] text-mc-faint text-right">
                {recurring.length} recurring · {oneShots.length} one-shot · refreshes on reload
              </p>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
