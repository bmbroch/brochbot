"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import {
  ArrowLeft, Settings, RefreshCw, Users, Check, Loader2,
  Clock, Globe,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UGCSettings {
  defaultSyncHour: number;      // 0–23 UTC (computed)
  syncTimeLocal: number;        // 0–23 in selected timezone
  syncTimezone: string;         // IANA timezone string
  videosPerCreator: number;
  refreshFrequency: "daily" | "twice_daily";
  orgName: string;
}

// ─── Timezone list ─────────────────────────────────────────────────────────────
const TIMEZONES = [
  { value: "UTC",                    label: "UTC" },
  { value: "America/New_York",       label: "US Eastern (ET)" },
  { value: "America/Chicago",        label: "US Central (CT)" },
  { value: "America/Denver",         label: "US Mountain (MT)" },
  { value: "America/Los_Angeles",    label: "US Pacific (PT)" },
  { value: "America/Anchorage",      label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu",       label: "Hawaii (HT)" },
  { value: "America/Toronto",        label: "Canada Eastern" },
  { value: "America/Vancouver",      label: "Canada Pacific" },
  { value: "America/Sao_Paulo",      label: "Brazil (BRT)" },
  { value: "Europe/London",          label: "London (GMT/BST)" },
  { value: "Europe/Paris",           label: "Paris / Berlin (CET)" },
  { value: "Europe/Istanbul",        label: "Istanbul (TRT)" },
  { value: "Africa/Windhoek",        label: "Namibia / CAT" },
  { value: "Africa/Johannesburg",    label: "South Africa (SAST)" },
  { value: "Africa/Nairobi",         label: "East Africa (EAT)" },
  { value: "Asia/Dubai",             label: "Dubai (GST)" },
  { value: "Asia/Kolkata",           label: "India (IST)" },
  { value: "Asia/Singapore",         label: "Singapore (SGT)" },
  { value: "Asia/Tokyo",             label: "Japan (JST)" },
  { value: "Asia/Seoul",             label: "Korea (KST)" },
  { value: "Australia/Sydney",       label: "Sydney (AEST)" },
  { value: "Pacific/Auckland",       label: "New Zealand (NZT)" },
];

// Convert local hour in a timezone to UTC hour
function localToUTC(localHour: number, timezone: string): number {
  const now = new Date();
  // Get current UTC offset by comparing UTC hour to local hour in the timezone
  const localStr = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(now);
  const tzHour = parseInt(localStr) % 24;
  const utcOffset = now.getUTCHours() - tzHour;
  return ((localHour + utcOffset) + 24) % 24;
}

// Format hour as 12h with AM/PM
function formatHour(h: number): string {
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

interface HealthSummary {
  total: number;
  healthy: number;
  stale: number;
  critical: number;
  inactive: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function nextCronRun(utcHour: number): string {
  const now = new Date();
  const next = new Date();
  next.setUTCHours(utcHour, 0, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  const diffH = Math.round((next.getTime() - now.getTime()) / 3600000);
  if (diffH < 1) return "in less than an hour";
  if (diffH < 24) return `in ${diffH}h`;
  return "tomorrow";
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 py-4 border-b border-gray-50 dark:border-[#1a1a1a] last:border-0">
      <div className="sm:w-48 flex-shrink-0">
        <p className="text-sm font-medium text-gray-700 dark:text-white/70">{label}</p>
        {hint && <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function UGCSettingsPage() {
  const [tab, setTab] = useState<"refresh" | "team">("refresh");
  const [settings, setSettings] = useState<UGCSettings | null>(null);
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const fetchSettings = useCallback(async () => {
    const data = await fetch("/api/ugc/settings").then((r) => r.json());

    // On first load: if timezone is still the server default ("UTC"), auto-detect
    // the browser's local timezone and seed 8 AM in that timezone
    if (data.syncTimezone === "UTC" || !data.syncTimezone) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Only apply if the detected timezone is in our supported list
      const supported = TIMEZONES.find((t) => t.value === detected);
      if (supported && detected !== "UTC") {
        const utc = localToUTC(8, detected);
        const patched = { ...data, syncTimeLocal: 8, syncTimezone: detected, defaultSyncHour: utc };
        setSettings(patched);
        // Persist silently
        fetch("/api/ugc/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncTimeLocal: 8, syncTimezone: detected, defaultSyncHour: utc }),
        }).catch(() => {});
        return;
      }
    }

    setSettings(data);
  }, []);

  const fetchHealth = useCallback(async () => {
    const data = await fetch("/api/ugc/health").then((r) => r.json());
    setHealth(data.summary);
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchHealth();
  }, [fetchSettings, fetchHealth]);

  const save = async (field: string, patch: Partial<UGCSettings>) => {
    if (!settings) return;
    setSaving(field);
    try {
      const updated = await fetch("/api/ugc/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => r.json());
      setSettings(updated);
      setSaved(field);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  if (!settings) {
    return (
      <Shell>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={20} className="animate-spin text-gray-300 dark:text-white/20" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="min-h-full bg-gray-50 dark:bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Header */}
        <div className="mb-6">
          <Link href="/ugc" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors mb-3">
            <ArrowLeft size={14} /> UGC Analytics
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings size={22} className="text-gray-400 dark:text-white/40" />
            Settings
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">Configure how your UGC tracking works.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl p-1 w-fit">
          {[
            { id: "refresh", label: "Data Refresh", icon: RefreshCw },
            { id: "team", label: "Team", icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white"
              }`}>
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Data Refresh Tab ──────────────────────────────────────────────── */}
        {tab === "refresh" && (
          <div className="space-y-4">

            {/* Health overview */}
            {health && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Healthy", value: health.healthy, color: "text-green-600 dark:text-green-400", dot: "bg-green-500" },
                  { label: "Stale", value: health.stale, color: "text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-500" },
                  { label: "Need Attention", value: health.critical, color: "text-red-500 dark:text-red-400", dot: "bg-red-500" },
                  { label: "Inactive", value: health.inactive, color: "text-gray-400 dark:text-white/30", dot: "bg-gray-300" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-xs text-gray-400 dark:text-white/40">{s.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Sync schedule */}
            <Section title="Sync Schedule" description="How often your creators' data is refreshed.">
              <Field label="Frequency" hint="How often new posts are fetched">
                <div className="flex flex-col gap-2">
                  {[
                    { value: "daily", label: "Daily", desc: "New posts every day · Counts refreshed every Monday" },
                    { value: "twice_daily", label: "Twice Daily", desc: "New posts twice a day · Counts refreshed every Monday", badge: "Coming soon" },
                  ].map((opt) => (
                    <button key={opt.value}
                      onClick={() => !opt.badge && save("refreshFrequency", { refreshFrequency: opt.value as UGCSettings["refreshFrequency"] })}
                      disabled={!!opt.badge}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        settings.refreshFrequency === opt.value
                          ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-500/5"
                          : "border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#333]"
                      } ${opt.badge ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        settings.refreshFrequency === opt.value ? "border-blue-500" : "border-gray-300 dark:border-[#444]"
                      }`}>
                        {settings.refreshFrequency === opt.value && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</span>
                          {opt.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/30">{opt.badge}</span>}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Sync Time" hint="Local time for daily data refresh">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Hour picker */}
                  <select
                    value={settings.syncTimeLocal ?? settings.defaultSyncHour}
                    onChange={(e) => {
                      const local = parseInt(e.target.value);
                      const utc = localToUTC(local, settings.syncTimezone ?? "UTC");
                      save("syncTimeLocal", { syncTimeLocal: local, defaultSyncHour: utc });
                    }}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all">
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{formatHour(i)}</option>
                    ))}
                  </select>

                  {/* Timezone picker */}
                  <div className="flex items-center gap-1.5">
                    <Globe size={13} className="text-gray-400 dark:text-white/30 flex-shrink-0" />
                    <select
                      value={settings.syncTimezone ?? "UTC"}
                      onChange={(e) => {
                        const tz = e.target.value;
                        const local = settings.syncTimeLocal ?? settings.defaultSyncHour;
                        const utc = localToUTC(local, tz);
                        save("syncTimezone", { syncTimezone: tz, defaultSyncHour: utc });
                      }}
                      className="px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all">
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>

                  {(saving === "syncTimeLocal" || saving === "syncTimezone") && <Loader2 size={14} className="animate-spin text-gray-400" />}
                  {(saved === "syncTimeLocal" || saved === "syncTimezone") && <span className="flex items-center gap-1 text-xs text-green-500"><Check size={12} /> Saved</span>}
                  <span className="text-xs text-gray-400 dark:text-white/40 flex items-center gap-1">
                    <Clock size={11} /> Next run {nextCronRun(settings.defaultSyncHour)}
                  </span>
                </div>
              </Field>

              <Field label="Videos Per Creator" hint="Max videos tracked at one time">
                <div className="flex items-center gap-3">
                  <select value={settings.videosPerCreator}
                    onChange={(e) => save("videosPerCreator", { videosPerCreator: parseInt(e.target.value) })}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all">
                    {[50, 100, 200, 500].map((n) => (
                      <option key={n} value={n}>{n} videos{n === 100 ? " (default)" : ""}</option>
                    ))}
                  </select>
                  {saving === "videosPerCreator" && <Loader2 size={14} className="animate-spin text-gray-400" />}
                  {saved === "videosPerCreator" && <span className="flex items-center gap-1 text-xs text-green-500"><Check size={12} /> Saved</span>}
                </div>
              </Field>
            </Section>


          </div>
        )}

        {/* ── Team Tab ──────────────────────────────────────────────────────── */}
        {tab === "team" && (
          <div className="space-y-4">

            {/* Org name */}
            <Section title="Organization" description="Your workspace details.">
              <Field label="Organization Name">
                <OrgNameEditor name={settings.orgName} onSave={(name) => save("orgName", { orgName: name })} />
              </Field>
            </Section>

            {/* Members */}
            <Section title="Team Members" description="People with access to this workspace.">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 dark:text-white/50">1 member</p>
                <button
                  disabled
                  title="Team invites coming soon"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#333] text-sm text-gray-300 dark:text-white/20 cursor-not-allowed">
                  <Users size={13} /> Invite member
                </button>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-[#1a1a1a]">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  B
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">bmbroch@gmail.com</p>
                  <p className="text-xs text-gray-400 dark:text-white/40">Owner</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">Admin</span>
              </div>
            </Section>

          </div>
        )}
      </div>
    </Shell>
  );
}

// ─── Org Name Editor ───────────────────────────────────────────────────────────

function OrgNameEditor({ name, onSave }: { name: string; onSave: (v: string) => void }) {
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = value !== name;

  const handleSave = async () => {
    if (!value.trim() || !dirty) return;
    setSaving(true);
    await onSave(value.trim());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        className="flex-1 max-w-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all" />
      {dirty && (
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-all">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Save
        </button>
      )}
      {saved && <span className="text-xs text-green-500 flex items-center gap-1"><Check size={11} /> Saved</span>}
    </div>
  );
}
