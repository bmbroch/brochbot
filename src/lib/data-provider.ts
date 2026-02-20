// Data provider with mock/Convex toggle
// Set to false when Convex is connected
export const useMockData = true;

import { useState, useEffect, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "in-progress" | "done" | "blocked";
export type Priority = "low" | "medium" | "high";
export type Product = "CLCP" | "ISK" | "SE" | "internal" | "all";
export type Assignee = string;
export type ActivityType = "data_query" | "customer_lookup" | "report" | "cron_job" | "config_change" | "memory_update" | "task_completed" | "system_config" | "cron" | "task";
export type ActivityStatus = "success" | "error" | "running" | "in-progress";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee: Assignee;
  priority: Priority;
  product?: Product;
  createdAt: number;
  updatedAt: number;
}

export interface Activity {
  _id: string;
  agent: string;
  type: ActivityType;
  title: string;
  description?: string;
  product?: Product;
  status: ActivityStatus;
  createdAt: number;
}

export interface ScheduledTask {
  _id: string;
  name: string;
  schedule: string;
  nextRun?: number;
  lastRun?: number;
  agent: string;
  description?: string;
  status: "active" | "paused" | "completed";
  product?: Product;
}

export interface TeamMember {
  id: string;
  name: string;
  emoji: string;
  avatar?: string;
  role: string;
  description: string;
  dataSources: string[];
  recurringTasks?: string[];
  isAgent: boolean;
  color?: string;
  /** Original gradient (dark mode) — kept for backward compat */
  gradient?: string;
  /** Dark-mode card gradient (derived from team.json) */
  gradientDark?: string;
  /** Light-mode card gradient (derived from team.json) */
  gradientLight?: string;
  /** Telegram group ID for this agent (null if no dedicated group) */
  groupId?: string | null;
  /** Desk position in the virtual office (1000×600 canvas) */
  deskPosition?: { x: number; y: number; facing?: "down" | "left" | "right" | "up" };
  sortOrder?: number;
}

// ─── Agent / Team Config ─────────────────────────────────────────────────────
// This is the FALLBACK only — all runtime data comes from /team.json via useTeam().
// To add an agent: update public/team.json (source of truth), then add a minimal
// fallback entry here so the UI has data before the fetch resolves.

export const teamMembers: TeamMember[] = [
  {
    id: "ben", name: "Ben", emoji: "👨‍💻", avatar: "/avatars/ben.jpg",
    role: "Founder", color: "#f59e0b",
    gradientDark: "from-zinc-700/30 to-slate-800/20", gradientLight: "from-zinc-100 to-zinc-50",
    groupId: null, deskPosition: { x: 100, y: 50, facing: "down" },
    description: "Founder & CEO. Sets the vision, reviews work, and keeps everything on track.",
    dataSources: ["All"], recurringTasks: [], isAgent: false, sortOrder: 0,
  },
  {
    id: "sam", name: "Sam", emoji: "🤝", avatar: "/avatars/sam.png",
    role: "Chief of Staff", color: "#3b82f6",
    gradientDark: "from-blue-700/30 to-blue-900/20", gradientLight: "from-blue-50 to-sky-100",
    groupId: "-5137141366", deskPosition: { x: 300, y: 50, facing: "down" },
    description: "Coordinates all agents, manages workflows, and handles complex multi-step operations.",
    dataSources: ["Stripe", "Supabase", "Datafast", "GSC"], recurringTasks: ["Nightly Briefing (2 AM CAT daily)"],
    isAgent: true, sortOrder: 1,
  },
  {
    id: "devin", name: "Devin", emoji: "🛠️", avatar: "/avatars/dev.png",
    role: "Web Developer", color: "#f59e0b",
    gradientDark: "from-yellow-700/30 to-yellow-900/20", gradientLight: "from-yellow-50 to-amber-100",
    groupId: "-5191880198", deskPosition: { x: 500, y: 50, facing: "down" },
    description: "Owns the Mission Control codebase. Handles all frontend changes, bug fixes, and deployments.",
    dataSources: ["GitHub", "Vercel"], recurringTasks: [], isAgent: true, sortOrder: 2,
  },
  {
    id: "cara", name: "Cara", emoji: "🎧", avatar: "/avatars/cara.png",
    role: "Customer Support", color: "#a855f7",
    gradientDark: "from-purple-700/30 to-purple-900/20", gradientLight: "from-purple-50 to-violet-100",
    groupId: "-5116620759", deskPosition: { x: 700, y: 50, facing: "down" },
    description: "Handles customer inquiries, subscription issues, and refund requests via Stripe.",
    dataSources: ["Stripe"], recurringTasks: [], isAgent: true, sortOrder: 3,
  },
  {
    id: "dana", name: "Dana", emoji: "📊", avatar: "/avatars/dana.png",
    role: "Data Analyst", color: "#22c55e",
    gradientDark: "from-green-700/30 to-green-900/20", gradientLight: "from-green-50 to-emerald-100",
    groupId: "-5118324440", deskPosition: { x: 100, y: 380, facing: "down" },
    description: "Runs analytics queries, generates reports, and monitors KPIs across all products.",
    dataSources: ["Supabase", "Datafast"], recurringTasks: ["Morning Analytics Report (8 AM CAT daily)"],
    isAgent: true, sortOrder: 4,
  },
  {
    id: "miles", name: "Miles", emoji: "🚀", avatar: "/avatars/miles.png",
    role: "GTM Lead", color: "#f97316",
    gradientDark: "from-orange-600/30 to-orange-900/20", gradientLight: "from-orange-50 to-amber-100",
    groupId: "-5101253807", deskPosition: { x: 316, y: 380, facing: "down" },
    description: "Drives growth through SEO, GEO, UGC, and paid campaigns. Tracks marketing performance.",
    dataSources: ["Datafast", "GSC", "SEO Tools"], recurringTasks: ["Daily GSC Report — All Products (6 AM CAT)"],
    isAgent: true, sortOrder: 5,
  },
  {
    id: "penny", name: "Penny", emoji: "📌", avatar: "/avatars/penny.png",
    role: "Secretary", color: "#f43f5e",
    gradientDark: "from-rose-600/30 to-pink-900/20", gradientLight: "from-rose-50 to-pink-100",
    groupId: "-5280216031", deskPosition: { x: 533, y: 380, facing: "down" },
    description: "Captures ideas, maintains ops logs, runs delegation audits, and keeps the team accountable.",
    dataSources: ["Workspace Files"], recurringTasks: ["Daily Ops Check (4 PM CAT)", "Weekly Audit (Friday 9 AM CAT)"],
    isAgent: true, sortOrder: 6,
  },
  {
    id: "mia", name: "Mia", emoji: "📱", avatar: "/avatars/mia.png",
    role: "Social Media Manager", color: "#d946ef",
    gradientDark: "from-fuchsia-600/30 to-fuchsia-900/20", gradientLight: "from-fuchsia-50 to-pink-100",
    groupId: null, deskPosition: { x: 750, y: 380, facing: "down" },
    description: "Tracks UGC creator performance. Analyzes social media metrics across TikTok and Instagram.",
    dataSources: ["Google Sheets", "Datafast"], recurringTasks: ["Creator Posts Sync (nightly 1 AM CAT)"],
    isAgent: true, sortOrder: 7,
  },
  {
    id: "frankie", name: "Frankie", emoji: "💰", avatar: "/avatars/frankie.png",
    role: "Finance", color: "#10b981",
    gradientDark: "from-emerald-600/30 to-emerald-900/20", gradientLight: "from-emerald-50 to-teal-100",
    groupId: null, deskPosition: { x: 900, y: 50, facing: "down" },
    description: "The money guy. Tracks banking, payouts, expenses, and revenue across all three businesses.",
    dataSources: ["Mercury"], recurringTasks: ["Mercury Creator Sync (daily noon CAT)"],
    isAgent: true, sortOrder: 8,
  },
  {
    id: "jude", name: "Jude", emoji: "✍️", avatar: "/avatars/jude.png",
    role: "Content Engine", color: "#f472b6",
    gradientDark: "from-pink-600/30 to-pink-900/20", gradientLight: "from-pink-50 to-pink-100",
    groupId: "-5210308407", deskPosition: { x: 966, y: 380, facing: "down" },
    description: "The content machine. Drafts posts, edits video, manages the publishing pipeline for indietomilly.",
    dataSources: ["Twitter API", "LinkedIn API", "TikTok API", "YouTube API"], recurringTasks: [],
    isAgent: true, sortOrder: 9,
  },
];

// Derived from fallback teamMembers — stays in sync automatically when teamMembers is updated.
// Runtime pages use member.color / member.emoji directly from useTeam() for live data.
export const agentColors: Record<string, string> = {
  ...Object.fromEntries(teamMembers.filter((m) => m.color).map((m) => [m.id, m.color as string])),
  system: "#6b7280",
};

export const agentEmojis: Record<string, string> = {
  ...Object.fromEntries(teamMembers.map((m) => [m.id, m.emoji])),
  system: "⚙️",
};

// ─── Activity Config ─────────────────────────────────────────────────────────

export const activityTypeConfig: Record<ActivityType, { label: string; color: string; bg: string; icon: string }> = {
  data_query: { label: "Data Query", color: "text-blue-400", bg: "bg-blue-500/10", icon: "📡" },
  customer_lookup: { label: "Customer", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "👤" },
  report: { label: "Report", color: "text-purple-400", bg: "bg-purple-500/10", icon: "📊" },
  cron_job: { label: "Cron Job", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "⏰" },
  config_change: { label: "Config", color: "text-orange-400", bg: "bg-orange-500/10", icon: "⚙️" },
  memory_update: { label: "Memory", color: "text-pink-400", bg: "bg-pink-500/10", icon: "🧠" },
  task_completed: { label: "Task Done", color: "text-green-400", bg: "bg-green-500/10", icon: "✅" },
  system_config: { label: "System Config", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: "🔧" },
  cron: { label: "Cron Job", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "⏰" },
  task: { label: "Task", color: "text-green-400", bg: "bg-green-500/10", icon: "✅" },
};

export const productConfig: Record<Product, { label: string; color: string; bg: string }> = {
  CLCP: { label: "Cover Letter", color: "text-blue-400", bg: "bg-blue-500/10" },
  ISK: { label: "Interview SK", color: "text-purple-400", bg: "bg-purple-500/10" },
  SE: { label: "Sales Echo", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  internal: { label: "Internal", color: "text-zinc-400", bg: "bg-zinc-500/10" },
  all: { label: "All Products", color: "text-amber-400", bg: "bg-amber-500/10" },
};

export const statusConfig: Record<ActivityStatus, { label: string; color: string; dot: string }> = {
  success: { label: "Success", color: "text-green-400", dot: "bg-green-400" },
  error: { label: "Error", color: "text-red-400", dot: "bg-red-400" },
  running: { label: "Running", color: "text-blue-400", dot: "bg-blue-400" },
  "in-progress": { label: "In Progress", color: "text-blue-400", dot: "bg-blue-400" },
};

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-zinc-400", bg: "bg-zinc-500/10" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  high: { label: "High", color: "text-red-400", bg: "bg-red-500/10" },
};

// ─── Real Data (from mc-data.json) ───────────────────────────────────────────

export const mockTasks: Task[] = [
  { _id: "t1", title: "Push 'ai interview assistant' to top 3", description: "Currently position 5.8 with 5.4K impressions. Need dedicated landing page and content strategy.", status: "todo", assignee: "miles", priority: "high", product: "ISK", createdAt: 1771484700000, updatedAt: 1771484700000 },
  { _id: "t2", title: "Consolidate blog subdomain 301 redirects", description: "Blog subdomain still getting traffic — needs 301 redirects to main domain.", status: "todo", assignee: "miles", priority: "medium", product: "ISK", createdAt: 1771484700000, updatedAt: 1771484700000 },
  { _id: "t3", title: "Enable GSC for CLCP and SE keyword tracking", description: "Currently only tracking ISK keywords. CLCP organic traffic is declining with zero attention. Need to expand GSC coverage to all 3 products.", status: "todo", assignee: "miles", priority: "high", product: "all", createdAt: 1771484700000, updatedAt: 1771491360000 },
  { _id: "t4", title: "Wire Mission Control to live data", description: "Activity feed, calendar, memory pages need to pull from real data sources instead of the nightly JSON push. Future state: live API calls vs nightly mc-data.json sync.", status: "in-progress", assignee: "devin", priority: "high", product: "internal", createdAt: 1771484700000, updatedAt: 1771490400000 },
  { _id: "t5", title: "Build content strategy for ISK landing pages", description: "Create dedicated landing pages targeting high-impression keywords like 'ai interview assistant'.", status: "todo", assignee: "miles", priority: "high", product: "ISK", createdAt: 1771484700000, updatedAt: 1771484700000 },
  { _id: "t6", title: "Define Cara's first real task", description: "Cara has never been used. Needs a defined scope — churn analysis, billing support, or customer health.", status: "todo", assignee: "sam", priority: "medium", product: "internal", createdAt: 1771484700000, updatedAt: 1771484700000 },
  { _id: "t7", title: "Enable Search Console API in Google Cloud Console", description: "Ben needs to enable the GSC API in Cloud Console so Miles can pull keyword/ranking data programmatically.", status: "blocked", assignee: "ben", priority: "high", product: "all", createdAt: 1771416000000, updatedAt: 1771484700000 },
  { _id: "t8", title: "Set up competitor keyword tracking", description: "Track competitor keyword positions for all products.", status: "todo", assignee: "miles", priority: "medium", product: "all", createdAt: 1771484700000, updatedAt: 1771484700000 },
  { _id: "t9", title: "Investigate ISK traffic drop (-30%)", description: "ISK traffic dropped 30% vs last Wednesday. Needs root cause analysis.", status: "todo", assignee: "dana", priority: "high", product: "ISK", createdAt: 1771480800000, updatedAt: 1771480800000 },
  { _id: "t10", title: "Set up weekly UGC performance tracking", description: "Mia needs a recurring task to track UGC creator performance weekly.", status: "todo", assignee: "mia", priority: "medium", product: "SE", createdAt: 1771484700000, updatedAt: 1771484700000 },
  { _id: "t11", title: "Set up Convex for MC database", description: "Mission Control needs a proper database backend instead of static JSON push. Convex was the agreed direction.", status: "todo", assignee: "devin", priority: "medium", product: "internal", createdAt: 1771484700000, updatedAt: 1771484700000 },
  { _id: "t12", title: "Create persistent weekly metrics file (Dana)", description: "Dana's morning reports vanish into Telegram. Need memory/weekly-metrics-YYYY-MM-DD.md every Monday covering all 3 products — traffic, revenue, MoM trends. Without this, spotting problems before they become crises is impossible.", status: "todo", assignee: "dana", priority: "high", product: "all", createdAt: 1771491360000, updatedAt: 1771491360000 },
  { _id: "t13", title: "Run Cara's first churn/billing health report", description: "Churn rate, refund rate, cancellations within 7 days — none of this has been looked at. Data exists in Stripe. Cara should own memory/billing-health-YYYY-MM.md monthly.", status: "todo", assignee: "cara", priority: "medium", product: "all", createdAt: 1771491360000, updatedAt: 1771491360000 },
  { _id: "t14", title: "Create HEARTBEAT.md", description: "Referenced in AGENTS.md and SOP but never created. Needed for heartbeat poll context and periodic check coordination.", status: "todo", assignee: "sam", priority: "low", product: "internal", createdAt: 1771491360000, updatedAt: 1771491360000 },
  { _id: "t15", title: "CLCP organic SEO — stop the decline", description: "CLCP organic traffic is declining and Miles has spent zero time on it (ISK-only focus). Need GSC access + keyword audit + at least one actionable recommendation. This is real revenue being left on the table.", status: "todo", assignee: "miles", priority: "high", product: "CLCP", createdAt: 1771491360000, updatedAt: 1771491360000 },
];

// mockActivities removed — useActivities() now fetches live from /api/mc-data

// mockScheduledTasks removed — useScheduledTasks() now fetches live from /api/mc-data

// ─── Decisions ───────────────────────────────────────────────────────────────

export interface Decision {
  _id: string;
  title: string;
  description: string;
  madeBy: string;
  createdAt: number;
}

// mockDecisions removed — useDecisions() now fetches live from /api/mc-data


// ─── Creator Types & Data ────────────────────────────────────────────────────
// creatorsData and Creator are internal — used only to seed creatorsTimeSeries.
// All UI reads from /creator-data.json (single source of truth).

interface Creator {
  name: string;
  posts: number;
  ttViews: number;
  igViews: number;
  startDate: string;
  earnings: number;
  avgPerPost: number;
}

export interface CreatorTimeSeriesPoint {
  date: string;
  ttViews: number;
  igViews: number;
}

const creatorsData: Creator[] = [
  { name: "Nick", posts: 39, ttViews: 2663086, igViews: 124821, startDate: "2025-12-23", earnings: 2830, avgPerPost: 71484 },
  { name: "Abby", posts: 23, ttViews: 274810, igViews: 607198, startDate: "2026-01-08", earnings: 1055, avgPerPost: 38348 },
  { name: "Luke", posts: 24, ttViews: 61046, igViews: 306120, startDate: "2026-01-19", earnings: 1035, avgPerPost: 15298 },
  { name: "Jake", posts: 24, ttViews: 17427, igViews: 63777, startDate: "2026-01-23", earnings: 600, avgPerPost: 3383 },
  { name: "Bobby", posts: 16, ttViews: 11212, igViews: 24448, startDate: "2026-01-30", earnings: 400, avgPerPost: 2228 },
  { name: "Sophie", posts: 6, ttViews: 979, igViews: 133, startDate: "2026-02-12", earnings: 75, avgPerPost: 185 },
  { name: "Sheryl", posts: 10, ttViews: 2541, igViews: 4477, startDate: "2026-02-11", earnings: 125, avgPerPost: 1403 },
  { name: "Griffin", posts: 6, ttViews: 1164, igViews: 8378, startDate: "2026-02-17", earnings: 0, avgPerPost: 1590 },
];

// Generate time-series data for each creator (used by charts)
function generateTimeSeries(creator: Creator): CreatorTimeSeriesPoint[] {
  const points: CreatorTimeSeriesPoint[] = [];
  const start = new Date(creator.startDate);
  const end = new Date();
  const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000);
  if (totalDays <= 0) return points;

  let cumulativeTT = 0;
  let cumulativeIG = 0;
  const seed = creator.name.charCodeAt(0);

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    // Distribute views with some randomness
    const progress = i / totalDays;
    const baseTT = (creator.ttViews / totalDays) * (0.5 + Math.sin(seed + i * 0.3) * 0.5 + progress * 0.5);
    const baseIG = (creator.igViews / totalDays) * (0.5 + Math.cos(seed + i * 0.2) * 0.5 + progress * 0.5);
    cumulativeTT += Math.max(0, baseTT);
    cumulativeIG += Math.max(0, baseIG);
    points.push({
      date: date.toISOString().split("T")[0],
      ttViews: Math.round(cumulativeTT),
      igViews: Math.round(cumulativeIG),
    });
  }

  // Normalize to match actual totals
  const lastPoint = points[points.length - 1];
  const ttScale = lastPoint.ttViews > 0 ? creator.ttViews / lastPoint.ttViews : 1;
  const igScale = lastPoint.igViews > 0 ? creator.igViews / lastPoint.igViews : 1;
  points.forEach(p => {
    p.ttViews = Math.round(p.ttViews * ttScale);
    p.igViews = Math.round(p.igViews * igScale);
  });

  return points;
}

export const creatorsTimeSeries: Record<string, CreatorTimeSeriesPoint[]> = {};
creatorsData.forEach(c => {
  creatorsTimeSeries[c.name] = generateTimeSeries(c);
});

export const creatorColors: Record<string, string> = {
  Nick: "#3b82f6",
  Abby: "#a855f7",
  Luke: "#22c55e",
  Jake: "#eab308",
  Bobby: "#f97316",
  Sheryl: "#ec4899",
  Sophie: "#06b6d4",
  Griffin: "#10b981",
};

export function useCreatorTimeSeries(name: string) { return creatorsTimeSeries[name] || []; }

// Fetches /creator-data.json and builds time series dynamically.
// Starts empty (no stale hardcoded data); populates once fetch resolves.
export function useAllCreatorsTimeSeries(): Record<string, CreatorTimeSeriesPoint[]> {
  const [timeSeries, setTimeSeries] = useState<Record<string, CreatorTimeSeriesPoint[]>>({});
  useEffect(() => {
    fetch("/creator-data.json")
      .then((r) => r.json())
      .then((data: Record<string, Creator & { lastUpdated?: string }>) => {
        const result: Record<string, CreatorTimeSeriesPoint[]> = {};
        for (const [key, value] of Object.entries(data)) {
          if (key === "lastUpdated" || typeof value !== "object" || !value.name) continue;
          result[value.name] = generateTimeSeries(value as Creator);
        }
        setTimeSeries(result);
      })
      .catch(() => {});
  }, []);
  return timeSeries;
}

// ─── Data Access Hooks ────────────────────────────────────────────────────────

// Fetches /tasks.json; falls back to empty array on error
export function useTasks(): Task[] {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    fetch("/tasks.json")
      .then((r) => r.json())
      .then((data: Task[]) => {
        if (Array.isArray(data) && data.length > 0) setTasks(data);
      })
      .catch(() => {});
  }, []);
  return tasks;
}

// Fetches activities from /api/mc-data; falls back to empty array on error
export function useActivities(): Activity[] {
  const [activities, setActivities] = useState<Activity[]>([]);
  useEffect(() => {
    fetch("/api/mc-data")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.activities)) setActivities(d.activities);
      })
      .catch(() => {});
  }, []);
  return activities;
}

// Fetches scheduled tasks from /api/mc-data (calendar array); falls back to empty array on error
export function useScheduledTasks(): ScheduledTask[] {
  const [scheduled, setScheduled] = useState<ScheduledTask[]>([]);
  useEffect(() => {
    fetch("/api/mc-data")
      .then((r) => r.json())
      .then((d) => {
        const data = d.scheduledTasks ?? d.calendar ?? [];
        if (Array.isArray(data)) setScheduled(data);
      })
      .catch(() => {});
  }, []);
  return scheduled;
}

// Fetches decisions from /api/mc-data; falls back to empty array on error
export function useDecisions(): Decision[] {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  useEffect(() => {
    fetch("/api/mc-data")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.decisions)) setDecisions(d.decisions);
      })
      .catch(() => {});
  }, []);
  return decisions;
}

// Sync fallback — used by pages that don't need live team data
export function useTeamSync(): TeamMember[] {
  return teamMembers;
}

// Async hook — fetches /team.json, falls back to hardcoded teamMembers while loading
export function useTeam(): TeamMember[] {
  const [team, setTeam] = useState<TeamMember[]>(teamMembers);
  useEffect(() => {
    fetch("/team.json")
      .then((r) => r.json())
      .then((data: TeamMember[]) => {
        if (Array.isArray(data) && data.length > 0) setTeam(data);
      })
      .catch(() => {});
  }, []);
  return team;
}

// Derives agentColors from fetched team data
export function useAgentColors(): Record<string, string> {
  const team = useTeam();
  return Object.fromEntries(
    team.filter((m) => m.color).map((m) => [m.id, m.color as string])
  );
}

// Derives agentEmojis from fetched team data
export function useAgentEmojis(): Record<string, string> {
  const team = useTeam();
  return Object.fromEntries(team.map((m) => [m.id, m.emoji]));
}

// Returns a full agent info map — single source of truth for name, color, emoji, avatar, role
export function useAgentMap(): Record<string, { name: string; color: string; emoji: string; avatar?: string; role: string }> {
  const team = useTeam();
  return useMemo(
    () =>
      Object.fromEntries(
        team.map((m) => [
          m.id,
          {
            name: m.name,
            color: m.color || agentColors[m.id] || "#6b7280",
            emoji: m.emoji,
            avatar: m.avatar,
            role: m.role,
          },
        ])
      ),
    [team]
  );
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  type: "task" | "activity" | "team";
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  href: string;
}

export function searchAll(query: string, activities?: Activity[]): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const t of mockTasks) {
    if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
      results.push({ type: "task", id: t._id, title: t.title, subtitle: `${t.status} · ${t.assignee}`, icon: "📋", href: "/tasks" });
    }
  }
  // Search live activities if provided; skip stale mock activities if not
  const activitySource = activities ?? [];
  for (const a of activitySource) {
    if (a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)) {
      results.push({ type: "activity", id: a._id, title: a.title, subtitle: `${a.agent} · ${a.type}`, icon: "⚡", href: "/" });
    }
  }
  for (const m of teamMembers) {
    if (m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) {
      results.push({ type: "team", id: m.id, title: `${m.emoji} ${m.name}`, subtitle: m.role, icon: m.emoji, href: "/team" });
    }
  }

  return results.slice(0, 12);
}
