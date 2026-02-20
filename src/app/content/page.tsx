"use client";

import Shell from "@/components/Shell";
import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const JUDE_COLOR = "#06b6d4";

const PLATFORM_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  twitter:  { label: "Twitter / X", color: "#1d9bf0", bg: "#1d9bf015", icon: "𝕏" },
  linkedin: { label: "LinkedIn",    color: "#0a66c2", bg: "#0a66c215", icon: "in" },
  tiktok:   { label: "TikTok",      color: "#ff0050", bg: "#ff005015", icon: "♪" },
  youtube:  { label: "YouTube",     color: "#ff0000", bg: "#ff000015", icon: "▶" },
};

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; order: number }> = {
  raw:       { label: "Raw",       color: "#94a3b8", bg: "#94a3b815", order: 0 },
  processing:{ label: "Processing",color: "#f59e0b", bg: "#f59e0b15", order: 1 },
  editing:   { label: "Editing",   color: "#a855f7", bg: "#a855f715", order: 2 },
  approved:  { label: "Approved",  color: "#22c55e", bg: "#22c55e15", order: 3 },
  posted:    { label: "Posted",    color: "#06b6d4", bg: "#06b6d415", order: 4 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: "Draft",    color: "#f59e0b", bg: "#f59e0b20" },
  approved: { label: "Approved", color: "#22c55e", bg: "#22c55e20" },
  posted:   { label: "Posted",   color: "#06b6d4", bg: "#06b6d420" },
  scheduled:{ label: "Scheduled",color: "#a855f7", bg: "#a855f720" },
  pending:  { label: "Pending",  color: "#94a3b8", bg: "#94a3b820" },
};

const IDEA_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "idea":             { label: "Idea",             color: "#94a3b8", bg: "#94a3b820" },
  "needs-recording":  { label: "Needs Recording",  color: "#f59e0b", bg: "#f59e0b20" },
  "in-queue":         { label: "In Queue",          color: "#22c55e", bg: "#22c55e20" },
  "posted":           { label: "Posted",            color: "#06b6d4", bg: "#06b6d420" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high:   { label: "High",   color: "#ff0050" },
  medium: { label: "Medium", color: "#f59e0b" },
  low:    { label: "Low",    color: "#22c55e" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentItem {
  id: string;
  type: "text" | "video";
  platforms: string[];
  title: string;
  preview?: string;
  status: string;
  draftedAt: string | null;
  suggestedPostTime: string | null;
  hookScore?: string;
  agent: string;
}

interface VideoItem {
  id: string;
  title: string;
  platforms: string[];
  stage: string;
  duration: string | null;
  thumbnail: string | null;
  draftedAt: string | null;
  suggestedPostTime: string | null;
  caption: string | null;
  postedAt?: string | null;
  agent: string;
}

interface CalendarItem {
  id: string;
  contentId: string;
  title: string;
  platform: string;
  scheduledAt: string;
  status: string;
}

interface IdeaItem {
  id: string;
  idea: string;
  source: string;
  format: string;
  priority: string;
  status: string;
}

interface ContentData {
  lastUpdated: string;
  queue: ContentItem[];
  videos: VideoItem[];
  calendar: CalendarItem[];
  ideas: IdeaItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  const days = Math.floor(diff / 86_400_000);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isDraftOverdue(item: ContentItem): boolean {
  if (!item.suggestedPostTime) return false;
  if (item.status === "posted") return false;
  return new Date(item.suggestedPostTime).getTime() < Date.now();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlatformPill({ platform }: { platform: string }) {
  const cfg = PLATFORM_CONFIG[platform] || { label: platform, color: "#94a3b8", bg: "#94a3b815", icon: "•" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span style={{ fontSize: "10px" }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#94a3b8", bg: "#94a3b820" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

function StagePill({ stage }: { stage: string }) {
  const cfg = STAGE_CONFIG[stage] || { label: stage, color: "#94a3b8", bg: "#94a3b815" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Section 1: Content Queue ─────────────────────────────────────────────────

function ContentQueue({ items }: { items: ContentItem[] }) {
  const drafts = items.filter(i => i.status === "draft");
  const approved = items.filter(i => i.status === "approved");

  return (
    <div className="space-y-8">
      {/* Draft Queue */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Draft Queue</h2>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: JUDE_COLOR, background: `${JUDE_COLOR}20` }}
          >
            {drafts.length} pending
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)] text-sm">No drafts pending ✓</div>
        ) : (
          <div className="space-y-3">
            {drafts.map(item => (
              <QueueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Approved / Scheduled */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Approved &amp; Scheduled</h2>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: "#22c55e", background: "#22c55e20" }}
          >
            {approved.length} ready
          </span>
        </div>

        {approved.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-muted)] text-sm">Nothing approved yet</div>
        ) : (
          <div className="space-y-3">
            {approved.map(item => (
              <QueueCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QueueCard({ item }: { item: ContentItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border transition-all duration-200 hover:border-[var(--border-strong)] overflow-hidden"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-medium)",
        borderLeft: `3px solid ${JUDE_COLOR}`,
      }}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type icon */}
            <span className="text-[13px]">{item.type === "video" ? "🎬" : "📝"}</span>
            {/* Platforms */}
            {item.platforms.map(p => <PlatformPill key={p} platform={p} />)}
          </div>
          <StatusPill status={item.status} />
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-2 leading-snug">{item.title}</p>

        {/* Preview text */}
        {item.preview && (
          <div>
            <p
              className={`text-[13px] text-[var(--text-muted)] leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}
              style={{ whiteSpace: "pre-line" }}
            >
              {item.preview}
            </p>
            {item.preview.length > 120 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-[12px] mt-1 transition-colors"
                style={{ color: JUDE_COLOR }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <span className="text-[11px] text-[var(--text-muted)]">
            Drafted {formatRelTime(item.draftedAt)}
          </span>
          {item.suggestedPostTime && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              {isDraftOverdue(item) && (
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: "#ef444420", color: "#ef4444" }}
                >
                  Overdue
                </span>
              )}
              Suggested: {formatDateTime(item.suggestedPostTime)}
            </span>
          )}
          {item.hookScore && (
            <span className="text-[11px] font-medium" style={{ color: JUDE_COLOR }}>
              Hook: {item.hookScore}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-medium)]">
          <button
            className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all border"
            style={{ background: "#22c55e15", color: "#22c55e", borderColor: "#22c55e30" }}
          >
            ✅ Approve
          </button>
          <button
            className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all border border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            ✏️ Edit
          </button>
          <button
            className="flex-1 py-1.5 rounded-lg text-[12px] font-semibold transition-all border"
            style={{ background: "#ef444415", color: "#ef4444", borderColor: "#ef444430" }}
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section 2: Video Pipeline ────────────────────────────────────────────────

const PIPELINE_STAGES = ["raw", "processing", "editing", "approved", "posted"];

function VideoPipeline({ videos }: { videos: VideoItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Video Pipeline</h2>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{videos.length} videos in production</p>
        </div>
      </div>

      {/* Pipeline progress bar */}
      <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage, i) => {
          const cfg = STAGE_CONFIG[stage];
          const count = videos.filter(v => v.stage === stage).length;
          return (
            <div key={stage} className="flex items-center flex-1 min-w-[80px]">
              <div className="flex-1 flex flex-col items-center">
                <div
                  className="w-full h-1.5 rounded-full mb-2"
                  style={{ background: cfg.bg, borderColor: cfg.color }}
                />
                <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-[11px] text-[var(--text-muted)]">{count} video{count !== 1 ? "s" : ""}</span>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="w-4 h-px bg-[var(--border-medium)] mx-1 flex-shrink-0 mt-[-12px]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PIPELINE_STAGES.map(stage => {
          const cfg = STAGE_CONFIG[stage];
          const stageVideos = videos.filter(v => v.stage === stage);
          return (
            <div key={stage} className="flex flex-col gap-3">
              {/* Column header */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: cfg.bg }}
              >
                <span className="text-[12px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                <span
                  className="text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: `${cfg.color}30`, color: cfg.color }}
                >
                  {stageVideos.length}
                </span>
              </div>

              {/* Video cards */}
              {stageVideos.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed p-4 text-center text-[12px] text-[var(--text-muted)]"
                  style={{ borderColor: "var(--border-medium)", minHeight: "80px" }}
                >
                  Empty
                </div>
              ) : (
                stageVideos.map(video => <VideoCard key={video.id} video={video} />)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: VideoItem }) {
  const cfg = STAGE_CONFIG[video.stage] || STAGE_CONFIG["raw"];

  return (
    <div
      className="rounded-xl border p-3 flex flex-col gap-2.5 transition-all duration-200 hover:border-[var(--border-strong)]"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-medium)",
      }}
    >
      {/* Thumbnail placeholder */}
      <div
        className="w-full aspect-video rounded-lg flex items-center justify-center relative overflow-hidden"
        style={{ background: "var(--bg-hover)" }}
      >
        <div className="text-3xl opacity-40">🎬</div>
        {video.duration && (
          <div
            className="absolute bottom-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}
          >
            {video.duration}
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
        {video.title}
      </p>

      {/* Platforms */}
      <div className="flex flex-wrap gap-1">
        {video.platforms.map(p => {
          const pc = PLATFORM_CONFIG[p];
          return (
            <span
              key={p}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: pc?.bg, color: pc?.color }}
            >
              {pc?.icon} {pc?.label.split(" ")[0]}
            </span>
          );
        })}
      </div>

      {/* Time info */}
      {video.draftedAt && (
        <p className="text-[11px] text-[var(--text-muted)]">
          {video.stage === "posted" && video.postedAt
            ? `Posted ${formatRelTime(video.postedAt)}`
            : `Started ${formatRelTime(video.draftedAt)}`}
        </p>
      )}

      {/* Caption preview */}
      {video.caption && (
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2 pt-1 border-t border-[var(--border-medium)] italic">
          "{video.caption.slice(0, 80)}{video.caption.length > 80 ? "…" : ""}"
        </p>
      )}

      {/* Stage badge */}
      <div className="flex justify-end">
        <StagePill stage={video.stage} />
      </div>
    </div>
  );
}

// ─── Section 3: Content Calendar ─────────────────────────────────────────────

function ContentCalendar({ calendar }: { calendar: CalendarItem[] }) {
  // Build the current week (Mon–Sun) starting from today
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  }

  function getItemsForDay(day: Date) {
    return calendar.filter(item => {
      const d = new Date(item.scheduledAt);
      return isSameDay(d, day);
    }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  const platforms = Array.from(new Set(calendar.map(i => i.platform))).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Content Calendar</h2>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">This week</p>
        </div>
        {/* Platform legend */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {platforms.map(p => {
            const cfg = PLATFORM_CONFIG[p];
            if (!cfg) return null;
            return (
              <div key={p} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                <span className="text-[11px] text-[var(--text-muted)]">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          const items = getItemsForDay(day);
          const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" });
          const dateLabel = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return (
            <div key={i} className="flex flex-col gap-2">
              {/* Day header */}
              <div
                className="text-center py-2 px-1 rounded-lg"
                style={{
                  background: isToday ? `${JUDE_COLOR}15` : "var(--bg-hover)",
                  borderBottom: isToday ? `2px solid ${JUDE_COLOR}` : "2px solid transparent",
                }}
              >
                <p
                  className="text-[11px] font-bold"
                  style={{ color: isToday ? JUDE_COLOR : "var(--text-muted)" }}
                >
                  {dayLabel}
                </p>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: isToday ? JUDE_COLOR : "var(--text-secondary)" }}
                >
                  {dateLabel.split(" ")[1]}
                </p>
              </div>

              {/* Posts for this day */}
              <div className="flex flex-col gap-1.5 min-h-[80px]">
                {items.length === 0 ? (
                  <div className="flex-1 rounded-lg border border-dashed border-[var(--border-medium)] opacity-30" style={{ minHeight: "40px" }} />
                ) : (
                  items.map(item => {
                    const pc = PLATFORM_CONFIG[item.platform] || { color: "#94a3b8", bg: "#94a3b815", label: item.platform, icon: "•" };
                    const time = new Date(item.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    return (
                      <div
                        key={item.id}
                        className="rounded-lg p-1.5 border-l-2 cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          background: `${pc.color}12`,
                          borderColor: pc.color,
                        }}
                        title={`${item.title} — ${pc.label} @ ${time}`}
                      >
                        <p className="text-[10px] font-bold truncate" style={{ color: pc.color }}>
                          {pc.icon} {time}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
                          {item.title}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming list below calendar */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Upcoming Posts</h3>
        <div className="space-y-2">
          {calendar
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .map(item => {
              const pc = PLATFORM_CONFIG[item.platform] || { color: "#94a3b8", bg: "#94a3b815", label: item.platform, icon: "•" };
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all hover:border-[var(--border-strong)]"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-medium)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pc.color }} />
                  <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: pc.color }}>
                    {pc.icon}
                  </span>
                  <span className="text-[13px] text-[var(--text-primary)] flex-1 truncate">{item.title}</span>
                  <span className="text-[12px] text-[var(--text-muted)] flex-shrink-0">{formatDateTime(item.scheduledAt)}</span>
                  <StatusPill status={item.status} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── Section 4: Ideas Backlog ─────────────────────────────────────────────────

function IdeasBacklog({ ideas }: { ideas: IdeaItem[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Content Ideas</h2>
          <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Sourced by Jude from team activity</p>
        </div>
      </div>

      <div className="space-y-3">
        {ideas.map(idea => {
          const statusCfg = IDEA_STATUS_CONFIG[idea.status] || { label: idea.status, color: "#94a3b8", bg: "#94a3b820" };
          const priorityCfg = PRIORITY_CONFIG[idea.priority] || { label: idea.priority, color: "#94a3b8" };

          return (
            <div
              key={idea.id}
              className="rounded-xl border p-4 transition-all hover:border-[var(--border-strong)]"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-medium)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug flex-1">{idea.idea}</p>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide flex-shrink-0"
                  style={{ color: statusCfg.color, background: statusCfg.bg }}
                >
                  {statusCfg.label}
                </span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[12px] text-[var(--text-muted)]">📎 {idea.format}</span>
                <span className="text-[12px] text-[var(--text-muted)]">Source: {idea.source}</span>
                <span className="text-[12px] font-semibold" style={{ color: priorityCfg.color }}>
                  ↑ {priorityCfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "queue",    label: "Queue",    icon: "📬" },
  { id: "pipeline", label: "Video Pipeline", icon: "🎬" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "ideas",    label: "Ideas",    icon: "💡" },
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<string>("queue");
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/content-data.json")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const draftCount = data?.queue.filter(i => i.status === "draft").length ?? 0;

  return (
    <Shell>
      <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* Jude avatar accent */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
              style={{ background: `${JUDE_COLOR}20`, boxShadow: `0 0 20px ${JUDE_COLOR}20` }}
            >
              ✍️
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Content Studio
              </h1>
              <p className="text-sm text-[var(--text-muted)]">indietomilly — managed by Jude ✍️</p>
            </div>
            {/* Live indicator */}
            <div className="ml-auto flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: JUDE_COLOR }}
              />
              <span className="text-[12px] font-medium" style={{ color: JUDE_COLOR }}>Jude active</span>
            </div>
          </div>

          {/* Stats row */}
          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { label: "Drafts Pending", value: String(draftCount), color: "#f59e0b" },
                { label: "In Production", value: String(data.videos.filter(v => v.stage !== "posted").length), color: JUDE_COLOR },
                { label: "Scheduled Posts", value: String(data.calendar.length), color: "#a855f7" },
                { label: "Content Ideas", value: String(data.ideas.length), color: "#22c55e" },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="px-4 py-3 rounded-xl border"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-medium)" }}
                >
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl mb-8 overflow-x-auto"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-medium)" }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap"
                style={{
                  background: isActive ? `${JUDE_COLOR}20` : "transparent",
                  color: isActive ? JUDE_COLOR : "var(--text-muted)",
                  border: isActive ? `1px solid ${JUDE_COLOR}40` : "1px solid transparent",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === "queue" && draftCount > 0 && (
                  <span
                    className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#f59e0b", color: "#000" }}
                  >
                    {draftCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${JUDE_COLOR}40`, borderTopColor: JUDE_COLOR }}
            />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-[var(--text-muted)]">
            <p className="text-lg mb-2">No content data found</p>
            <p className="text-sm">Create <code>public/content-data.json</code> to get started</p>
          </div>
        ) : (
          <>
            {activeTab === "queue"    && <ContentQueue   items={data.queue}        />}
            {activeTab === "pipeline" && <VideoPipeline  videos={data.videos}      />}
            {activeTab === "calendar" && <ContentCalendar calendar={data.calendar} />}
            {activeTab === "ideas"    && <IdeasBacklog   ideas={data.ideas}        />}
          </>
        )}

        {/* Footer */}
        {data && (
          <p className="text-[11px] text-[var(--text-muted)] text-center mt-10">
            Last updated {formatRelTime(data.lastUpdated)} · Jude ✍️ Content Engine
          </p>
        )}
      </div>
    </Shell>
  );
}
