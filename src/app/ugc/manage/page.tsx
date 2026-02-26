"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { ArrowLeft, Plus, Settings2, Search, Trash2, Pencil, Check, X, Loader2 } from "lucide-react";

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CYCLE: CreatorStatus[] = ["active", "monitoring", "archived"];

function nextStatus(current: CreatorStatus): CreatorStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

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

function SyncHourDisplay({ hour }: { hour: number | null }) {
  if (hour === null) return <span className="text-gray-300 dark:text-white/20 text-sm">—</span>;
  return <span className="text-sm text-gray-600 dark:text-white/60">{hour}:00 UTC</span>;
}

// ─── Add Creator Modal ─────────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void;
  onAdd: (creator: UGCCreator) => void;
}

function AddCreatorModal({ onClose, onAdd }: AddModalProps) {
  const [form, setForm] = useState({
    name: "",
    tiktok_handle: "",
    ig_handle: "",
    status: "active" as CreatorStatus,
    sync_hour: 8,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/ugc/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          tiktok_handle: form.tiktok_handle.trim() || null,
          ig_handle: form.ig_handle.trim() || null,
          status: form.status,
          sync_hour: form.status === "active" ? form.sync_hour : null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to add creator");
      }
      const created = await res.json();
      onAdd(created);
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#1a1a1a]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add Creator</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-white/50 mb-1.5">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Nick"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* TikTok */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-white/50 mb-1.5">
              TikTok Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30 text-sm select-none">@</span>
              <input
                type="text"
                value={form.tiktok_handle}
                onChange={(e) => setForm((f) => ({ ...f, tiktok_handle: e.target.value.replace(/^@/, "") }))}
                placeholder="sell.with.nick"
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-white/50 mb-1.5">
              Instagram Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30 text-sm select-none">@</span>
              <input
                type="text"
                value={form.ig_handle}
                onChange={(e) => setForm((f) => ({ ...f, ig_handle: e.target.value.replace(/^@/, "") }))}
                placeholder="sell.with.nick"
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-white/50 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CreatorStatus }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
            >
              <option value="active">Active</option>
              <option value="monitoring">Monitoring</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sync Hour — only if active */}
          {form.status === "active" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-white/50 mb-1.5">Sync Hour (UTC)</label>
              <select
                value={form.sync_hour}
                onChange={(e) => setForm((f) => ({ ...f, sync_hour: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i}:00 UTC</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#333] text-sm text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {saving ? "Adding…" : "Add Creator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteDialog({
  creator,
  onClose,
  onDelete,
}: {
  creator: UGCCreator;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/ugc/creators/${creator.id}`, { method: "DELETE" });
      onDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-2xl p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete {creator.name}?</h3>
        <p className="text-sm text-gray-500 dark:text-white/50 mb-5">
          This will remove the creator from tracking. Their synced data in Supabase won&apos;t be deleted.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#333] text-sm text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50 transition-all"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Sync Hour Editor ───────────────────────────────────────────────────

function SyncHourEditor({
  creatorId,
  currentHour,
  onSaved,
}: {
  creatorId: string;
  currentHour: number | null;
  onSaved: (hour: number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentHour ?? 8);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/ugc/creators/${creatorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sync_hour: value }),
      });
      onSaved(value);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 group"
      >
        <SyncHourDisplay hour={currentHour} />
        {currentHour !== null && (
          <Pencil size={11} className="text-gray-300 dark:text-white/20 group-hover:text-gray-500 dark:group-hover:text-white/50 transition-colors" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="px-2 py-0.5 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/40"
        autoFocus
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>{i}:00 UTC</option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={saving}
        className="p-1 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all"
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ManageCreatorsPage() {
  const [creators, setCreators] = useState<UGCCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UGCCreator | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch creators on mount
  const fetchCreators = useCallback(async () => {
    try {
      const res = await fetch("/api/ugc/creators");
      if (res.ok) {
        const data = await res.json();
        setCreators(Array.isArray(data) ? data : []);
      }
    } catch {
      // fail silently — table may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCreators(); }, [fetchCreators]);

  // Toggle status inline
  const handleStatusToggle = async (creator: UGCCreator) => {
    if (togglingId) return;
    const newStatus = nextStatus(creator.status);
    const newSyncHour = newStatus === "active" ? (creator.sync_hour ?? 8) : null;
    setTogglingId(creator.id);
    // Optimistic update
    setCreators((prev) =>
      prev.map((c) =>
        c.id === creator.id ? { ...c, status: newStatus, sync_hour: newSyncHour } : c
      )
    );
    try {
      await fetch(`/api/ugc/creators/${creator.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, sync_hour: newSyncHour }),
      });
    } catch {
      // Revert on error
      fetchCreators();
    } finally {
      setTogglingId(null);
    }
  };

  // Update sync hour locally after inline edit
  const handleSyncHourSaved = (id: string, hour: number | null) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, sync_hour: hour } : c))
    );
  };

  // Delete
  const handleDeleted = (id: string) => {
    setCreators((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
  };

  // Add
  const handleAdded = (creator: UGCCreator) => {
    setCreators((prev) => [...prev, creator]);
  };

  // Filter
  const filtered = creators.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.tiktok_handle ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.ig_handle ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell>
      <div className="min-h-full bg-gray-50 dark:bg-[#0a0a0a] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <Link
              href="/ugc"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              UGC Analytics
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Settings2 size={22} className="text-gray-400 dark:text-white/40" />
              Manage Creators
            </h1>
            <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">
              Manage which creators to track and their sync schedules.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all flex-shrink-0"
          >
            <Plus size={15} />
            Add Creator
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creators…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#222] bg-white dark:bg-[#111] text-gray-900 dark:text-white text-sm placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-400 dark:text-white/40">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Loading creators…</span>
            </div>
          ) : creators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-gray-500 dark:text-white/50 text-sm font-medium">No creators yet</p>
              <p className="text-gray-300 dark:text-white/20 text-xs text-center max-w-xs">
                Run the migration SQL in your Supabase dashboard, then add creators here.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all"
              >
                <Plus size={14} />
                Add Creator
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#1a1a1a]">
                    {["Name", "TikTok", "Instagram", "Status", "Sync", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-[11px] font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-white/30">
                        No creators match &ldquo;{search}&rdquo;
                      </td>
                    </tr>
                  ) : (
                    filtered.map((creator, i) => (
                      <tr
                        key={creator.id}
                        className={[
                          "border-b border-gray-50 dark:border-[#1a1a1a] last:border-0 transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]",
                          i % 2 !== 0 ? "bg-gray-50/30 dark:bg-white/[0.01]" : "",
                        ].join(" ")}
                      >
                        {/* Name */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">{creator.name}</span>
                        </td>
                        {/* TikTok */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {creator.tiktok_handle ? (
                            <a
                              href={`https://www.tiktok.com/@${creator.tiktok_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 dark:text-white/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors text-sm"
                            >
                              @{creator.tiktok_handle}
                            </a>
                          ) : (
                            <span className="text-gray-300 dark:text-white/20 text-sm">—</span>
                          )}
                        </td>
                        {/* Instagram */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {creator.ig_handle ? (
                            <a
                              href={`https://www.instagram.com/${creator.ig_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 dark:text-white/50 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm"
                            >
                              @{creator.ig_handle}
                            </a>
                          ) : (
                            <span className="text-gray-300 dark:text-white/20 text-sm">—</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusToggle(creator)}
                            disabled={togglingId === creator.id}
                            title="Click to cycle status"
                            className="cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-40"
                          >
                            {togglingId === creator.id ? (
                              <Loader2 size={14} className="animate-spin text-gray-400" />
                            ) : (
                              <StatusBadge status={creator.status} />
                            )}
                          </button>
                        </td>
                        {/* Sync hour */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {creator.status === "active" ? (
                            <SyncHourEditor
                              creatorId={creator.id}
                              currentHour={creator.sync_hour}
                              onSaved={(hour) => handleSyncHourSaved(creator.id, hour)}
                            />
                          ) : (
                            <SyncHourDisplay hour={null} />
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => setDeleteTarget(creator)}
                            className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            title={`Delete ${creator.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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

      {/* Add Modal */}
      {showAddModal && (
        <AddCreatorModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdded}
        />
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          creator={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={() => handleDeleted(deleteTarget.id)}
        />
      )}
    </Shell>
  );
}
