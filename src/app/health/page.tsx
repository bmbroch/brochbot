"use client";

import { useState, useEffect } from "react";
import Shell from "@/components/Shell";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealthData {
  timestamp: string;
  disk: { usedPct: number; usedGB: number; totalGB: number };
  memory: { usedPct: number; totalMB: number };
  uptime: string;
  openclaw: { running: boolean; pid: number | null; currentVersion: string | null; latestVersion: string | null; updateAvailable: boolean };
  tailscale: { connected: boolean; ip: string | null };
  vercel: { lastBuild: string; lastBuildTime: string };
  crons: { aiActive: number; bashActive: number; lastFailure: string | null };
  pendingUpdates: number;
  restartRequired: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-ZA", {
      timeZone: "Africa/Windhoek",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " CAT";
  } catch {
    return iso;
  }
}

function diskColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 80) return "bg-yellow-500";
  return "bg-emerald-500";
}

function memColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 85) return "bg-yellow-500";
  return "bg-emerald-500";
}

function diskTextColor(pct: number): string {
  if (pct >= 90) return "text-red-400";
  if (pct >= 80) return "text-yellow-400";
  return "text-emerald-400";
}

function memTextColor(pct: number): string {
  if (pct >= 90) return "text-red-400";
  if (pct >= 85) return "text-yellow-400";
  return "text-emerald-400";
}

function vercelColor(state: string): string {
  if (state === "READY") return "text-emerald-400";
  if (state === "ERROR" || state === "CANCELED") return "text-red-400";
  if (state === "BUILDING") return "text-yellow-400";
  return "text-zinc-400";
}

function vercelBg(state: string): string {
  if (state === "READY") return "bg-emerald-500/15 border-emerald-500/20";
  if (state === "ERROR" || state === "CANCELED") return "bg-red-500/15 border-red-500/20";
  if (state === "BUILDING") return "bg-yellow-500/15 border-yellow-500/20";
  return "bg-zinc-500/15 border-zinc-500/20";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UsageBar({ pct, colorClass }: { pct: number; colorClass: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function StatusBadge({ ok, label, sublabel }: { ok: boolean; label: string; sublabel?: string }) {
  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${ok
      ? "bg-emerald-500/10 border-emerald-500/20"
      : "bg-red-500/10 border-red-500/20"
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-2 h-2 rounded-full shrink-0 ${ok ? "bg-emerald-400" : "bg-red-400"} shadow-lg ${ok ? "shadow-emerald-500/50" : "shadow-red-500/50"}`} />
        <span className="text-[13px] font-medium text-[var(--text-primary)]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {sublabel && <span className="text-[11px] font-mono text-[var(--text-muted)]">{sublabel}</span>}
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${ok ? "text-emerald-400" : "text-red-400"}`}>
          {ok ? "OK" : "DOWN"}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-base">{icon}</span>
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{title}</h2>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-card)] p-5 ${className}`}>
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/health.json")
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <Shell>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">System Health</h1>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Live snapshot of server and services status</p>
          </div>
          {data && (
            <div className="text-right">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Last updated</div>
              <div className="text-[12px] text-[var(--text-secondary)] font-mono mt-0.5">{fmtTime(data.timestamp)}</div>
            </div>
          )}
        </div>

        {/* Loading / Error */}
        {loading && (
          <Card>
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">Loading health data…</div>
          </Card>
        )}

        {error && (
          <Card>
            <div className="text-center py-8 space-y-2">
              <div className="text-2xl">⚠️</div>
              <div className="text-[var(--text-primary)] font-medium text-sm">health.json not found</div>
              <div className="text-[var(--text-muted)] text-xs">Run <code className="font-mono bg-white/5 px-1.5 py-0.5 rounded">scripts/health-snapshot.sh</code> to generate it.</div>
            </div>
          </Card>
        )}

        {data && (
          <>
            {/* ── Server Status ───────────────────────────────────────────── */}
            <Card>
              <SectionHeader icon="🖥️" title="Server Status" />
              <div className="space-y-4">
                {/* Disk */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[var(--text-muted)]">Disk</span>
                    <span className={`text-[12px] font-semibold font-mono ${diskTextColor(data.disk.usedPct)}`}>
                      {data.disk.usedGB} GB / {data.disk.totalGB} GB — {data.disk.usedPct}%
                    </span>
                  </div>
                  <UsageBar pct={data.disk.usedPct} colorClass={diskColor(data.disk.usedPct)} />
                </div>

                {/* Memory */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] text-[var(--text-muted)]">Memory</span>
                    <span className={`text-[12px] font-semibold font-mono ${memTextColor(data.memory.usedPct)}`}>
                      {Math.round(data.memory.totalMB * data.memory.usedPct / 100)} MB / {data.memory.totalMB} MB — {data.memory.usedPct}%
                    </span>
                  </div>
                  <UsageBar pct={data.memory.usedPct} colorClass={memColor(data.memory.usedPct)} />
                </div>

                {/* Uptime + Badges row */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06]">
                    <span className="text-[11px] text-[var(--text-muted)]">Uptime</span>
                    <span className="text-[12px] font-semibold text-[var(--text-secondary)] font-mono">{data.uptime}</span>
                  </div>

                  {data.pendingUpdates > 0 && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                      data.pendingUpdates > 50
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                    }`}>
                      <span className="text-[11px]">📦</span>
                      <span className="text-[12px] font-semibold">{data.pendingUpdates} pending updates</span>
                    </div>
                  )}

                  {data.restartRequired && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-[11px]">🔄</span>
                      <span className="text-[12px] font-semibold text-orange-400">Restart required</span>
                    </div>
                  )}

                  {!data.restartRequired && data.pendingUpdates === 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[11px]">✅</span>
                      <span className="text-[12px] font-semibold text-emerald-400">Fully up to date</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* ── Services ────────────────────────────────────────────────── */}
            <Card>
              <SectionHeader icon="🔌" title="Services" />
              <div className="space-y-2">
                {/* OpenClaw — custom row with version info */}
                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                  data.openclaw.running
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 shadow-lg ${
                      data.openclaw.running
                        ? "bg-emerald-400 shadow-emerald-500/50"
                        : "bg-red-400 shadow-red-500/50"
                    }`} />
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">OpenClaw Gateway</span>
                    {/* Version badges */}
                    {data.openclaw.currentVersion && (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        v{data.openclaw.currentVersion}
                      </span>
                    )}
                    {data.openclaw.currentVersion && data.openclaw.updateAvailable && data.openclaw.latestVersion && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[10px] font-semibold">
                        Update available → v{data.openclaw.latestVersion}
                      </span>
                    )}
                    {data.openclaw.currentVersion && !data.openclaw.updateAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 text-[10px] font-semibold">
                        Up to date
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {data.openclaw.pid && (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">PID {data.openclaw.pid}</span>
                    )}
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${
                      data.openclaw.running ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {data.openclaw.running ? "OK" : "DOWN"}
                    </span>
                  </div>
                </div>
                <StatusBadge
                  ok={data.tailscale.connected}
                  label="Tailscale VPN"
                  sublabel={data.tailscale.ip ?? undefined}
                />
                {/* Vercel — special row */}
                <div className={`flex items-center justify-between p-3.5 rounded-xl border ${vercelBg(data.vercel.lastBuild)}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      data.vercel.lastBuild === "READY" ? "bg-emerald-400 shadow-emerald-500/50" :
                      data.vercel.lastBuild === "ERROR" ? "bg-red-400 shadow-red-500/50" :
                      "bg-yellow-400 shadow-yellow-500/50"
                    } shadow-lg`} />
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">Vercel Deployment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {data.vercel.lastBuildTime && data.vercel.lastBuildTime !== "null" && (
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">{fmtTime(data.vercel.lastBuildTime)}</span>
                    )}
                    <span className={`text-[11px] font-semibold uppercase tracking-wide ${vercelColor(data.vercel.lastBuild)}`}>
                      {data.vercel.lastBuild}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Crons ───────────────────────────────────────────────────── */}
            <Card>
              <SectionHeader icon="⏱️" title="Cron Jobs" />
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[120px] rounded-xl border border-[var(--border-medium)] bg-white/[0.02] p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{data.crons.aiActive}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">AI Crons</div>
                </div>
                <div className="flex-1 min-w-[120px] rounded-xl border border-[var(--border-medium)] bg-white/[0.02] p-4 text-center">
                  <div className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{data.crons.bashActive}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wide">Bash Crons</div>
                </div>
                <div className={`flex-1 min-w-[120px] rounded-xl border p-4 text-center ${
                  data.crons.lastFailure
                    ? "border-red-500/20 bg-red-500/10"
                    : "border-emerald-500/20 bg-emerald-500/10"
                }`}>
                  <div className={`text-3xl font-bold tabular-nums ${data.crons.lastFailure ? "text-red-400" : "text-emerald-400"}`}>
                    {data.crons.lastFailure ? "!" : "✓"}
                  </div>
                  <div className={`text-[11px] mt-1 uppercase tracking-wide ${data.crons.lastFailure ? "text-red-400" : "text-emerald-400"}`}>
                    {data.crons.lastFailure ? "Last failure" : "No failures"}
                  </div>
                </div>
              </div>
              {data.crons.lastFailure && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-[11px] font-mono text-red-300 break-words">{data.crons.lastFailure}</p>
                </div>
              )}
            </Card>

            {/* ── Color Key ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 px-1">
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">Key:</span>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[11px] text-[var(--text-muted)]">Good</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-400" /><span className="text-[11px] text-[var(--text-muted)]">Warning (disk &gt;80%, mem &gt;85%)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[11px] text-[var(--text-muted)]">Critical</span></div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
