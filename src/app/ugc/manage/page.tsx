"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Shell from "@/components/Shell";
import {
  ArrowLeft, Plus, Settings2, Search, Check, X,
  Loader2, ImageIcon, ExternalLink, StopCircle, PlayCircle, Building2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CreatorStatus = "active" | "monitoring" | "archived";

interface UGCCreator {
  id: string;
  name: string;
  tiktok_handle: string | null;
  ig_handle: string | null;
  status: CreatorStatus;
  sync_hour: number | null;
  created_at: string;
  last_synced_at: string | null;
}

// ─── URL Parser ────────────────────────────────────────────────────────────────

function parseSocialUrl(raw: string): { platform: "tiktok" | "instagram" | null; handle: string | null } {
  const s = raw.trim().replace(/\/$/, "");
  // TikTok URL
  const ttUrl = s.match(/tiktok\.com\/@?([\w.]+)/i);
  if (ttUrl) return { platform: "tiktok", handle: ttUrl[1] };
  // Instagram URL
  const igUrl = s.match(/instagram\.com\/([\w.]+)/i);
  if (igUrl && igUrl[1] !== "p" && igUrl[1] !== "reel") return { platform: "instagram", handle: igUrl[1] };
  // @handle — assume TikTok
  const atHandle = s.match(/^@([\w.]+)$/);
  if (atHandle) return { platform: "tiktok", handle: atHandle[1] };
  return { platform: null, handle: null };
}

function guessNameFromHandle(handle: string): string {
  // "sell.with.nick" → "Nick", "_lukesells" → "Lukesells"
  const parts = handle.replace(/^_/, "").split(/[._-]/);
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}

// ─── Platform Icons ────────────────────────────────────────────────────────────

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.22 8.22 0 004.81 1.54V6.78a4.85 4.85 0 01-1.04-.09z" />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CreatorStatus }) {
  const map = {
    active: { dot: "bg-green-500", text: "text-green-600 dark:text-green-400", label: "Active" },
    monitoring: { dot: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", label: "Monitoring" },
    archived: { dot: "bg-gray-400", text: "text-gray-500 dark:text-gray-400", label: "Archived" },
  };
  const s = map[status] ?? map.archived;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Track Modal ───────────────────────────────────────────────────────────────

interface TrackModalProps {
  onClose: () => void;
  onAdded: (creators: UGCCreator[]) => void;
  orgId: string | null;
}

function TrackCreatorModal({ onClose, onAdded, orgId }: TrackModalProps) {
  const [bulk, setBulk] = useState(false);
  const [singleUrl, setSingleUrl] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview parsed result for single input
  const singleParsed = singleUrl ? parseSocialUrl(singleUrl) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const lines = bulk
      ? bulkText.split("\n").map((l) => l.trim()).filter(Boolean)
      : [singleUrl.trim()];

    if (lines.length === 0 || !lines[0]) {
      setError("Paste at least one link");
      return;
    }

    // Group by creator: TT + IG on same creator if same handle
    const creatorMap: Record<string, { name: string; tiktok_handle: string | null; ig_handle: string | null }> = {};

    for (const line of lines) {
      const { platform, handle } = parseSocialUrl(line);
      if (!platform || !handle) {
        setError(`Couldn't parse: ${line}`);
        return;
      }
      const key = handle.toLowerCase().replace(/^_/, "");
      if (!creatorMap[key]) {
        creatorMap[key] = { name: guessNameFromHandle(handle), tiktok_handle: null, ig_handle: null };
      }
      if (platform === "tiktok") creatorMap[key].tiktok_handle = handle;
      if (platform === "instagram") creatorMap[key].ig_handle = handle;
    }

    setSaving(true);
    const added: UGCCreator[] = [];

    try {
      for (const data of Object.values(creatorMap)) {
        const res = await fetch("/api/ugc/creators", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, status: "active", sync_hour: 8, org_id: orgId }),
        });
        if (!res.ok) {
          const j = await res.json();
          throw new Error(j.error ?? "Failed to add creator");
        }
        const created: UGCCreator = await res.json();
        added.push(created);

        // First fetch is auto-triggered server-side by /api/ugc/creators POST
      }

      onAdded(added);
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#1a1a1a]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Track New Creator</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-400 dark:text-white/40">
            Paste any TikTok or Instagram profile link.
          </p>

          {!bulk ? (
            <div>
              <input
                type="text"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="e.g. https://www.tiktok.com/@mrbeast"
                autoFocus
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              />
              {/* Live parse preview */}
              {singleParsed?.handle && (
                <p className="mt-1.5 text-xs text-gray-400 dark:text-white/40 flex items-center gap-1.5">
                  {singleParsed.platform === "tiktok" ? <TikTokIcon size={11} /> : <InstagramIcon size={11} />}
                  <span className="text-gray-600 dark:text-white/60">@{singleParsed.handle}</span>
                  <span>· {singleParsed.platform === "tiktok" ? "TikTok" : "Instagram"}</span>
                </p>
              )}
            </div>
          ) : (
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"https://www.tiktok.com/@creator1\nhttps://www.instagram.com/creator1\nhttps://www.tiktok.com/@creator2"}
              rows={5}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all resize-none font-mono"
            />
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1">
            {/* Bulk toggle */}
            <button
              type="button"
              onClick={() => { setBulk((b) => !b); setError(null); }}
              className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors"
            >
              <div className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${bulk ? "bg-blue-600" : "bg-gray-200 dark:bg-white/10"}`}
                style={{ height: "18px" }}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${bulk ? "translate-x-3.5" : "translate-x-0"}`} />
              </div>
              Bulk upload
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
              {saving ? "Starting…" : "Start Tracking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── OrgId Reader (reads searchParams inside Suspense) ─────────────────────────
// Only captures the URL param into a ref — no state calls here.
// The orgs fetch effect is the single place that sets orgIdReady=true.

function OrgIdReader({ orgIdRef }: { orgIdRef: React.MutableRefObject<string | null> }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get("org_id");
    if (id) {
      orgIdRef.current = id;
    }
  }, [searchParams, orgIdRef]);
  return null;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function ManageCreatorsPage() {
  const [creators, setCreators] = useState<UGCCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkActing, setBulkActing] = useState(false);
  const [refreshingAvatars, setRefreshingAvatars] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const [health, setHealth] = useState<Record<string, { health: string; issues: string[] }>>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgIdReady, setOrgIdReady] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ totalPosts: number; planLimit: number; plan: string } | null>(null);

  // Ref populated by OrgIdReader before the orgs fetch completes (from URL ?org_id param)
  const orgIdFromUrlRef = useRef<string | null>(null);

  // Fetch orgs on mount. This is the ONLY place that sets orgIdReady=true.
  // OrgIdReader writes the URL param into orgIdFromUrlRef synchronously before
  // this async fetch resolves, so we can safely read it here to resolve the org.
  useEffect(() => {
    fetch("/api/ugc/orgs")
      .then((r) => r.json())
      .then((data) => {
        const orgs = Array.isArray(data) ? data : [];
        if (orgs.length === 0) {
          setOrgIdReady(true);
          return;
        }
        // Priority: URL param (via ref) → localStorage → first org
        const resolved =
          orgIdFromUrlRef.current ||
          localStorage.getItem("ugc_org_id") ||
          orgs[0].id;
        // Validate that the resolved id is actually in the orgs list
        const match = orgs.find((o: { id: string; name: string }) => o.id === resolved) ?? orgs[0];
        // Set all three states together — React 18 auto-batches these in async callbacks
        setOrgId(match.id);
        setOrgName(match.name);
        setOrgIdReady(true);
      })
      .catch(() => { setOrgIdReady(true); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCreators = useCallback(async () => {
    try {
      const data = await fetch(`/api/ugc/creators${orgId ? `?org_id=${orgId}` : ""}`).then((r) => r.json());
      setCreators(Array.isArray(data) ? data : []);
    } catch { } finally { setLoading(false); }
  }, [orgId]);

  const fetchHealth = useCallback(async () => {
    try {
      const data = await fetch(`/api/ugc/health${orgId ? `?org_id=${orgId}` : ""}`).then((r) => r.json());
      const map: Record<string, { health: string; issues: string[] }> = {};
      for (const c of data.creators ?? []) map[c.id] = { health: c.health, issues: c.issues };
      setHealth(map);
    } catch { }
  }, [orgId]);

  const fetchUsage = useCallback(async () => {
    if (!orgId) return;
    try {
      const data = await fetch(`/api/ugc/usage?org_id=${orgId}`).then((r) => r.json());
      if (data && typeof data.totalPosts === "number") setUsage(data);
    } catch { }
  }, [orgId]);

  useEffect(() => {
    if (!orgIdReady) return;
    fetchCreators();
    fetchHealth();
    fetchUsage();
  }, [fetchCreators, fetchHealth, fetchUsage, orgIdReady]);

  // ── Selection ──────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  // ── Bulk status change ─────────────────────────────────────────────────────

  const handleBulkStatus = async (newStatus: CreatorStatus) => {
    if (bulkActing || selected.size === 0) return;
    setBulkActing(true);
    const ids = Array.from(selected);
    const syncHour = newStatus === "active" ? 8 : null;

    // Optimistic
    setCreators((prev) => prev.map((c) => selected.has(c.id) ? { ...c, status: newStatus, sync_hour: syncHour } : c));
    setSelected(new Set());

    try {
      await Promise.all(ids.map((id) =>
        fetch(`/api/ugc/creators/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus, sync_hour: syncHour }),
        })
      ));
    } catch { fetchCreators(); }
    finally { setBulkActing(false); }
  };

  // ── Inline status cycle ────────────────────────────────────────────────────

  const handleStatusToggle = async (creator: UGCCreator) => {
    const STATUS_CYCLE: CreatorStatus[] = ["active", "monitoring", "archived"];
    const newStatus = STATUS_CYCLE[(STATUS_CYCLE.indexOf(creator.status) + 1) % STATUS_CYCLE.length];
    const syncHour = newStatus === "active" ? (creator.sync_hour ?? 8) : null;
    setCreators((prev) => prev.map((c) => c.id === creator.id ? { ...c, status: newStatus, sync_hour: syncHour } : c));
    await fetch(`/api/ugc/creators/${creator.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, sync_hour: syncHour }),
    }).catch(() => fetchCreators());
  };

  // ── Sync now (single creator) ──────────────────────────────────────────────

  const handleSyncNow = async (creator: UGCCreator) => {
    if (syncingId) return;
    setSyncingId(creator.id);
    try {
      await fetch(`/api/ugc/health?remediate=true&creator=${creator.id}`);
      setTimeout(() => fetchHealth(), 3000); // re-check health after a beat
    } finally { setSyncingId(null); }
  };

  // ── Refresh avatars ────────────────────────────────────────────────────────

  const handleRefreshAvatars = async () => {
    setRefreshingAvatars(true);
    setAvatarMsg(null);
    try {
      const res = await fetch("/api/ugc/refresh-avatars", { method: "POST" });
      const data = await res.json();
      setAvatarMsg(data.message ?? "Photos will update in ~1 min");
    } catch { setAvatarMsg("Something went wrong"); }
    finally { setRefreshingAvatars(false); }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = creators.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.tiktok_handle ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.ig_handle ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <Shell>
      <Suspense fallback={null}>
        <OrgIdReader orgIdRef={orgIdFromUrlRef} />
      </Suspense>
      <div className="min-h-full bg-gray-50 dark:bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <Link href="/ugc" className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors mb-3">
              <ArrowLeft size={14} /> UGC Analytics
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Settings2 size={22} className="text-gray-400 dark:text-white/40" />
              Manage Creators
            </h1>
            <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">
              Track who you want, stop tracking when you don&apos;t. Sync schedule in{" "}
              <Link href="/ugc/settings" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">Settings</Link>.
            </p>
            {orgName && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-white/30 mt-1">
                <Building2 size={11} /> {orgName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {avatarMsg && <span className="text-xs text-gray-400 dark:text-white/40 max-w-[180px] text-right">{avatarMsg}</span>}
            <button onClick={handleRefreshAvatars} disabled={refreshingAvatars}
              title="Refresh creator profile photos"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] text-sm transition-all disabled:opacity-50">
              {refreshingAvatars ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
              <span className="hidden sm:inline">Refresh Photos</span>
            </button>
            <button onClick={() => setShowTrackModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all">
              <Plus size={15} /> Track Creator
            </button>
          </div>
        </div>

        {/* Usage bar */}
        {(() => {
          const pct = usage ? Math.round((usage.totalPosts / usage.planLimit) * 100) : 0;
          return usage ? (
            <div className="mb-4 px-4 py-3 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-white/70">
                  Tracked Videos
                </span>
                <span className="text-xs text-gray-400 dark:text-white/40 capitalize">
                  {usage.plan} plan · {usage.totalPosts.toLocaleString()} / {usage.planLimit.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#222] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          ) : null;
        })()}

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search creators…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#222] bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all" />
        </div>

        {/* Health Summary */}
        {Object.keys(health).length > 0 && (() => {
          const vals = Object.values(health);
          const counts = {
            healthy: vals.filter((v) => v.health === "healthy").length,
            stale: vals.filter((v) => v.health === "stale").length,
            critical: vals.filter((v) => v.health === "critical" || v.health === "never").length,
          };
          return (
            <div className="flex items-center gap-4 mb-4 px-1">
              {counts.healthy > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />{counts.healthy} healthy
                </span>
              )}
              {counts.stale > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />{counts.stale} stale
                </span>
              )}
              {counts.critical > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" />{counts.critical} need attention
                </span>
              )}
              {(counts.stale > 0 || counts.critical > 0) && (
                <button
                  onClick={async () => { await fetch(`/api/ugc/health?remediate=true${orgId ? `&org_id=${orgId}` : ""}`); fetchHealth(); }}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  Sync all stale →
                </button>
              )}
            </div>
          );
        })()}

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-400 dark:text-white/40">
              <Loader2 size={16} className="animate-spin" /><span className="text-sm">Loading creators…</span>
            </div>
          ) : creators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-gray-500 dark:text-white/50 text-sm font-medium">No creators tracked yet</p>
              <button onClick={() => setShowTrackModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all">
                <Plus size={14} /> Track your first creator
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#1a1a1a]">
                    {/* Checkbox */}
                    <th className="pl-5 pr-2 py-3 w-8">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll}
                        className="rounded border-gray-300 dark:border-[#444] text-blue-600 focus:ring-blue-500/40 cursor-pointer" />
                    </th>
                    {["Creator", "Platforms", "Health", "Status", "Last Synced"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-white/30">No creators match &ldquo;{search}&rdquo;</td></tr>
                  ) : filtered.map((creator) => (
                    <tr key={creator.id}
                      className={`border-b border-gray-50 dark:border-[#1a1a1a] last:border-0 transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02] ${selected.has(creator.id) ? "bg-blue-50/50 dark:bg-blue-500/5" : ""}`}>

                      {/* Checkbox */}
                      <td className="pl-5 pr-2 py-3.5 w-8">
                        <input type="checkbox" checked={selected.has(creator.id)} onChange={() => toggleSelect(creator.id)}
                          className="rounded border-gray-300 dark:border-[#444] text-blue-600 focus:ring-blue-500/40 cursor-pointer" />
                      </td>

                      {/* Creator name */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{creator.name}</span>
                      </td>

                      {/* Platforms */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {creator.tiktok_handle && (
                            <a href={`https://www.tiktok.com/@${creator.tiktok_handle}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/80 transition-colors group">
                              <TikTokIcon size={13} />
                              <span className="text-xs hidden lg:inline group-hover:underline">@{creator.tiktok_handle}</span>
                              <ExternalLink size={9} className="hidden group-hover:inline opacity-50" />
                            </a>
                          )}
                          {creator.ig_handle && (
                            <a href={`https://www.instagram.com/${creator.ig_handle}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-gray-400 dark:text-white/40 hover:text-pink-500 dark:hover:text-pink-400 transition-colors group">
                              <InstagramIcon size={13} />
                              <span className="text-xs hidden lg:inline group-hover:underline">@{creator.ig_handle}</span>
                              <ExternalLink size={9} className="hidden group-hover:inline opacity-50" />
                            </a>
                          )}
                          {!creator.tiktok_handle && !creator.ig_handle && (
                            <span className="text-gray-300 dark:text-white/20 text-xs">No platforms</span>
                          )}
                        </div>
                      </td>

                      {/* Health */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {(() => {
                          const h = health[creator.id];
                          if (!h) return <span className="text-gray-300 dark:text-white/20 text-xs">—</span>;
                          const cfg = {
                            healthy: { dot: "bg-green-500", label: "Healthy", text: "text-green-600 dark:text-green-400" },
                            stale:   { dot: "bg-yellow-500", label: "Stale", text: "text-yellow-600 dark:text-yellow-400" },
                            critical:{ dot: "bg-red-500", label: "Critical", text: "text-red-500 dark:text-red-400" },
                            never:   { dot: "bg-red-500", label: "Never synced", text: "text-red-500 dark:text-red-400" },
                            inactive:{ dot: "bg-gray-300", label: "Inactive", text: "text-gray-400 dark:text-white/30" },
                          }[h.health] ?? { dot: "bg-gray-300", label: h.health, text: "text-gray-400" };
                          return (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`} title={h.issues.join(" · ") || undefined}>
                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                              {(h.health === "stale" || h.health === "critical" || h.health === "never") && creator.status === "active" && (
                                <button
                                  onClick={() => handleSyncNow(creator)}
                                  disabled={syncingId === creator.id}
                                  title="Sync now"
                                  className="text-[10px] text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors disabled:opacity-40"
                                >
                                  {syncingId === creator.id ? <Loader2 size={10} className="animate-spin" /> : "↻ Sync"}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button onClick={() => handleStatusToggle(creator)} title="Click to change status"
                          className="cursor-pointer hover:opacity-70 transition-opacity">
                          <StatusBadge status={creator.status} />
                        </button>
                      </td>

                      {/* Last synced */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-gray-400 dark:text-white/40">{relativeTime(creator.last_synced_at)}</span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer count */}
        {!loading && creators.length > 0 && (
          <p className="text-xs text-gray-300 dark:text-white/20 mt-3 px-1">
            {creators.length} creator{creators.length !== 1 ? "s" : ""} total
            {search && ` · ${filtered.length} matching`}
          </p>
        )}
      </div>

      {/* ── Bottom Action Bar ────────────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] shadow-2xl shadow-black/20 backdrop-blur-sm">
          <span className="text-sm text-gray-500 dark:text-white/50 font-medium pr-2 border-r border-gray-200 dark:border-[#333] mr-1">
            {selected.size} selected
          </span>
          <button onClick={() => handleBulkStatus("active")} disabled={bulkActing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 font-medium transition-all disabled:opacity-50">
            <PlayCircle size={14} /> Resume Tracking
          </button>
          <button onClick={() => handleBulkStatus("archived")} disabled={bulkActing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-all disabled:opacity-50">
            <StopCircle size={14} /> Stop Tracking
          </button>
          <button onClick={() => setSelected(new Set())}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all ml-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Track Modal */}
      {showTrackModal && (
        <TrackCreatorModal
          onClose={() => setShowTrackModal(false)}
          onAdded={(newCreators) => {
            setCreators((prev) => [...prev, ...newCreators]);
            setShowTrackModal(false);
          }}
          orgId={orgId}
        />
      )}
    </Shell>
  );
}

export default ManageCreatorsPage;
