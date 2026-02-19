// Data provider with mock/Convex toggle
// Set to false when Convex is connected
export const useMockData = true;

// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";
export type Product = "CLCP" | "ISK" | "SE";
export type Assignee = "ben" | "sam" | "cara" | "dana" | "miles" | "penny" | "mia";
export type ActivityType = "data_query" | "customer_lookup" | "report" | "cron_job" | "config_change" | "memory_update" | "task_completed" | "system_config";
export type ActivityStatus = "success" | "error" | "running";

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

export interface MemoryDocument {
  _id: string;
  title: string;
  content: string;
  type: "memory" | "note" | "config" | "schema";
  path: string;
  updatedAt: number;
}

export interface TeamMember {
  id: Assignee;
  name: string;
  emoji: string;
  avatar?: string;
  role: string;
  description: string;
  dataSources: string[];
  recurringTasks?: string[];
  isAgent: boolean;
}

// ─── Agent / Team Config ─────────────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  { id: "ben", name: "Ben", emoji: "👨‍💻", avatar: "/avatars/ben.png", role: "Founder", description: "Founder & CEO. Sets the vision, reviews work, and keeps everything on track.", dataSources: ["All"], isAgent: false },
  { id: "sam", name: "Sam", emoji: "🤝", avatar: "/avatars/sam.png", role: "Chief of Staff", description: "Coordinates all agents, manages workflows, and handles complex multi-step operations.", dataSources: ["Stripe", "Supabase", "Datafast", "GSC"], recurringTasks: ["Nightly MC Sync (2 AM CAT daily)"], isAgent: true },
  { id: "cara", name: "Cara", emoji: "🎧", avatar: "/avatars/cara.png", role: "Customer Support", description: "Handles customer inquiries, subscription issues, and refund requests via Stripe.", dataSources: ["Stripe"], isAgent: true },
  { id: "dana", name: "Dana", emoji: "📊", avatar: "/avatars/dana.png", role: "Data Analyst", description: "Runs analytics queries, generates reports, and monitors KPIs across all products.", dataSources: ["Supabase", "Datafast"], recurringTasks: ["Morning Analytics Report (8 AM CAT daily)"], isAgent: true },
  { id: "miles", name: "Miles", emoji: "🚀", avatar: "/avatars/miles.png", role: "GTM Lead", description: "Drives growth through SEO, GEO, UGC, and paid campaigns. Tracks marketing performance.", dataSources: ["Datafast", "GSC", "SEO Tools"], recurringTasks: ["Weekly GSC Report (Monday 8 AM CAT)"], isAgent: true },
  { id: "penny", name: "Penny", emoji: "📌", avatar: "/avatars/penny.png", role: "Secretary", description: "Captures ideas, links, inspiration. Maintains the mood board. Keeps receipts on everything.", dataSources: ["Mood Board", "Workspace Files"], isAgent: true },
  { id: "mia", name: "Mia", emoji: "📱", avatar: "/avatars/mia.png", role: "Social Media Manager", description: "Tracks UGC creator performance. Analyzes social media metrics across TikTok and Instagram. Owns creator relationships.", dataSources: ["Google Sheets", "Datafast (UTM campaigns)"], isAgent: true },
];

export const agentColors: Record<string, string> = {
  ben: "#f59e0b",
  sam: "#3b82f6",
  cara: "#a855f7",
  dana: "#22c55e",
  miles: "#f97316",
  penny: "#f43f5e",
  mia: "#d946ef",
};

export const agentEmojis: Record<string, string> = {
  ben: "👨‍💻",
  sam: "🤝",
  cara: "🎧",
  dana: "📊",
  miles: "🚀",
  penny: "📌",
  mia: "📱",
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
};

export const productConfig: Record<Product, { label: string; color: string; bg: string }> = {
  CLCP: { label: "Cover Letter", color: "text-blue-400", bg: "bg-blue-500/10" },
  ISK: { label: "Interview SK", color: "text-purple-400", bg: "bg-purple-500/10" },
  SE: { label: "Sales Echo", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export const statusConfig: Record<ActivityStatus, { label: string; color: string; dot: string }> = {
  success: { label: "Success", color: "text-green-400", dot: "bg-green-400" },
  error: { label: "Error", color: "text-red-400", dot: "bg-red-400" },
  running: { label: "Running", color: "text-blue-400", dot: "bg-blue-400" },
};

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-zinc-400", bg: "bg-zinc-500/10" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  high: { label: "High", color: "text-red-400", bg: "bg-red-500/10" },
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const now = Date.now();
const h = 3600000;
const d = 86400000;

export const mockTasks: Task[] = [
  { _id: "t1", title: "Set up Google Service Account", description: "Create GSA for Search Console API access. Need to enable the API in GCP console and download credentials.", status: "todo", assignee: "ben", priority: "high", product: "SE", createdAt: now - h * 3, updatedAt: now - h * 3 },
  { _id: "t2", title: "Build nightly agent runs", description: "Set up automated nightly cron jobs for each agent to run their core tasks independently.", status: "todo", assignee: "sam", priority: "high", createdAt: now - h * 2, updatedAt: now - h * 2 },
  { _id: "t3", title: "Competitor keyword research", description: "Analyze top 10 competitors for CLCP and ISK. Identify keyword gaps and content opportunities.", status: "todo", assignee: "miles", priority: "medium", product: "CLCP", createdAt: now - h * 4, updatedAt: now - h * 4 },
  { _id: "t4", title: "Stripe webhook hardening", description: "Add retry logic and dead-letter queue for failed webhook deliveries.", status: "in_progress", assignee: "sam", priority: "medium", product: "CLCP", createdAt: now - d, updatedAt: now - h * 6 },
  { _id: "t5", title: "Build customer health dashboard", description: "Create a dashboard showing churn risk scores, engagement metrics, and LTV predictions.", status: "todo", assignee: "dana", priority: "medium", product: "ISK", createdAt: now - h * 5, updatedAt: now - h * 5 },
  { _id: "t6", title: "Stripe API connected", description: "Connected all three Stripe accounts with proper auth headers and verified API access.", status: "done", assignee: "sam", priority: "high", product: "CLCP", createdAt: now - d, updatedAt: now - h * 8 },
  { _id: "t7", title: "Supabase databases analyzed", description: "Full schema crawl of all three Supabase projects. Documented tables, relationships, and row counts.", status: "done", assignee: "dana", priority: "high", createdAt: now - d, updatedAt: now - h * 10 },
  { _id: "t8", title: "Morning report configured", description: "Set up 8 AM daily analytics report cron job with Dana.", status: "done", assignee: "dana", priority: "medium", createdAt: now - d * 0.5, updatedAt: now - h * 6 },
  { _id: "t9", title: "Handle refund request backlog", description: "Process 3 pending refund requests from this week. Check eligibility and process via Stripe.", status: "in_progress", assignee: "cara", priority: "high", product: "SE", createdAt: now - h * 8, updatedAt: now - h * 2 },
  { _id: "t10", title: "SEO audit for Sales Echo", description: "Full technical SEO audit — meta tags, page speed, structured data, internal linking.", status: "todo", assignee: "miles", priority: "high", product: "SE", createdAt: now - h * 6, updatedAt: now - h * 6 },
];

// Today's base: 8:00 AM = now - (current hour - 8) hours. We use fixed offsets from "now" for simplicity.
export const mockActivities: Activity[] = [
  { _id: "a1", agent: "sam", type: "cron_job", title: "Nightly MC sync job scheduled", status: "success", createdAt: now - h * 0.25 },
  { _id: "a2", agent: "sam", type: "task_completed", title: "Creators page built and deployed", status: "success", createdAt: now - h * 0.5 },
  { _id: "a3", agent: "mia", type: "data_query", title: "UGC creator data analyzed — 7 creators, 835K+ views", description: "Pulled all creator metrics from Google Sheets. Analyzed TikTok and Instagram performance.", status: "success", createdAt: now - h * 0.75 },
  { _id: "a4", agent: "mia", type: "system_config", title: "Google Sheets API connected", description: "Connected Google Service Account to read UGC creator spreadsheets.", status: "success", createdAt: now - h * 1 },
  { _id: "a5", agent: "sam", type: "system_config", title: "Brave Search API connected", status: "success", createdAt: now - h * 1.5 },
  { _id: "a6", agent: "sam", type: "task_completed", title: "Mission Control v2 with all pages", description: "Full dashboard with Activity, Tasks, Calendar, Creators, Memory, Team, and Office pages.", status: "success", createdAt: now - h * 2 },
  { _id: "a7", agent: "sam", type: "memory_update", title: "SOUL.md personality upgrade", description: "Updated personality and voice guidelines for all agents.", status: "success", createdAt: now - h * 3 },
  { _id: "a8", agent: "sam", type: "task_completed", title: "Mission Control v1 built and deployed", status: "success", createdAt: now - h * 4 },
  { _id: "a9", agent: "cara", type: "customer_lookup", title: "Cara test run — active subscriptions", description: "Successfully looked up customer subscription and payment history via Stripe API.", status: "success", createdAt: now - h * 4.5 },
  { _id: "a10", agent: "dana", type: "report", title: "Dana test run — weekly analytics", description: "First successful analytics query — pulled revenue metrics from all 3 Stripe accounts.", status: "success", createdAt: now - h * 4.75 },
  { _id: "a11", agent: "sam", type: "cron_job", title: "Morning analytics report configured", description: "Set up daily 8 AM analytics report cron job with Dana.", status: "success", createdAt: now - h * 5 },
  { _id: "a12", agent: "dana", type: "system_config", title: "All 3 Datafast dashboards connected", description: "Connected Datafast analytics for CLCP, ISK, and SE.", status: "success", createdAt: now - h * 5.5 },
  { _id: "a13", agent: "dana", type: "data_query", title: "Supabase databases analyzed", description: "Crawled all Supabase tables across CLCP, ISK, and SE. Full schema documented.", status: "success", createdAt: now - h * 6 },
  { _id: "a14", agent: "sam", type: "system_config", title: "Stripe API connected", description: "Configured all three Stripe connected accounts with proper auth headers.", status: "success", createdAt: now - h * 6.5 },
  { _id: "a15", agent: "sam", type: "system_config", title: "Telegram connected", description: "Connected Telegram bot for agent communication.", status: "success", createdAt: now - h * 8 },
];

export const mockScheduledTasks: ScheduledTask[] = [
  { _id: "s1", name: "Morning Analytics Report", schedule: "0 8 * * *", nextRun: now + h * 12, lastRun: now - h * 12, agent: "dana", description: "Pull key metrics from Datafast and Stripe, generate summary report.", status: "active" },
  { _id: "s2", name: "Nightly Mission Control Sync", schedule: "0 2 * * *", nextRun: now + h * 6, agent: "sam", description: "Sync live data into Mission Control dashboard. Update activity feed, tasks, and metrics.", status: "active" },
];

export const mockDocuments: MemoryDocument[] = [
  {
    _id: "d1", title: "MEMORY.md", type: "memory", path: "MEMORY.md", updatedAt: now - h * 7,
    content: `# Long-Term Memory\n\n## Key Decisions\n- Using Convex for real-time database\n- Three products: CLCP, ISK, SE\n- Agent team: Sam (hub), Cara (support), Dana (analytics), Miles (GTM)\n\n## Lessons Learned\n- Stripe API needs Stripe-Context header for connected accounts\n- Supabase row-level security must be considered for direct queries\n- Datafast API has rate limits — use caching for dashboards`,
  },
  {
    _id: "d2", title: "2026-02-18.md", type: "memory", path: "memory/2026-02-18.md", updatedAt: now - h * 1,
    content: `# February 18, 2026\n\n## What Happened\n- Connected all Stripe accounts (CLCP, ISK, SE)\n- Analyzed all Supabase databases — full schema documented\n- Dana ran first successful analytics query\n- Cara ran first customer lookup\n- Configured morning analytics cron job (8 AM daily)\n- Built Mission Control dashboard v2\n\n## Key Findings\n- MRR across all products: ~$4,280\n- ISK has highest growth rate\n- CLCP leads in organic traffic\n- SE needs SEO work`,
  },
  {
    _id: "d3", title: "2026-02-17.md", type: "memory", path: "memory/2026-02-17.md", updatedAt: now - d,
    content: `# February 17, 2026\n\n## Setup Day\n- Initial agent framework configured\n- Sam orchestrator role defined\n- Explored Stripe, Supabase, and Datafast APIs\n- Created TOOLS.md with all credentials and endpoints\n- Started planning Mission Control dashboard`,
  },
  {
    _id: "d4", title: "Database Schema Reference", type: "schema", path: "memory/database-schema.md", updatedAt: now - h * 4,
    content: `# Database Schema\n\n## CLCP (Cover Letter Co-pilot)\n- users: id, email, created_at, subscription_status\n- cover_letters: id, user_id, content, created_at\n- subscriptions: id, user_id, stripe_id, plan, status\n\n## ISK (Interview Sidekick)\n- users: id, email, created_at\n- sessions: id, user_id, type, score, created_at\n- subscriptions: id, user_id, stripe_id, plan\n\n## SE (Sales Echo)\n- users: id, email, created_at\n- calls: id, user_id, duration, score, created_at\n- credits: id, user_id, remaining, purchased`,
  },
  {
    _id: "d5", title: "TOOLS.md", type: "config", path: "TOOLS.md", updatedAt: now - h * 3,
    content: `# Tools & Integrations\n\n## Stripe\n- CLCP Account: acct_1MrVbLI7ukYHG3kU\n- SE Account: acct_1RYkJJLODuyz63yL\n- Auth: Bearer $STRIPE_ORG_KEY + Stripe-Context header\n\n## Supabase\n- CLCP: $SUPABASE_CLC_URL / $SUPABASE_CLC_KEY\n- ISK: $SUPABASE_ISK_URL / $SUPABASE_ISK_KEY\n- SE: $SUPABASE_SE_URL / $SUPABASE_SE_KEY\n\n## Datafast\n- CLCP: $DATAFAST_CLCP_KEY\n- ISK: $DATAFAST_ISK_KEY\n- SE: $DATAFAST_SE_KEY`,
  },
];

// ─── Creator Types & Data ────────────────────────────────────────────────────

export interface Creator {
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

export interface CreatorPost {
  date: string;
  ttViews: number;
  igViews: number;
  milestone?: string;
  earnings: number;
}

export const creatorsData: Creator[] = [
  { name: "Nick", posts: 39, ttViews: 2663086, igViews: 124821, startDate: "2025-12-23", earnings: 975, avgPerPost: 71484 },
  { name: "Abby", posts: 23, ttViews: 274810, igViews: 607198, startDate: "2026-01-08", earnings: 575, avgPerPost: 38348 },
  { name: "Luke", posts: 24, ttViews: 61046, igViews: 306120, startDate: "2026-01-19", earnings: 600, avgPerPost: 15298 },
  { name: "Jake", posts: 24, ttViews: 17427, igViews: 63777, startDate: "2026-01-23", earnings: 600, avgPerPost: 3383 },
  { name: "Bobby", posts: 16, ttViews: 11212, igViews: 24448, startDate: "2026-01-30", earnings: 400, avgPerPost: 2228 },
  { name: "Flo", posts: 3, ttViews: 979, igViews: 31233, startDate: "2026-02-12", earnings: 75, avgPerPost: 10737 },
  { name: "Sheryl", posts: 5, ttViews: 2541, igViews: 4477, startDate: "2026-02-11", earnings: 125, avgPerPost: 1403 },
];

// Generate fake time-series data for each creator
function generateTimeSeries(creator: Creator): CreatorTimeSeriesPoint[] {
  const points: CreatorTimeSeriesPoint[] = [];
  const start = new Date(creator.startDate);
  const end = new Date("2026-02-18");
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

// Generate fake posts for each creator
function generatePosts(creator: Creator): CreatorPost[] {
  const posts: CreatorPost[] = [];
  const start = new Date(creator.startDate);
  const totalDays = Math.floor((new Date("2026-02-18").getTime() - start.getTime()) / 86400000);
  const interval = Math.max(1, Math.floor(totalDays / creator.posts));
  const earningsPerPost = creator.earnings / creator.posts;

  for (let i = 0; i < creator.posts; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i * interval + Math.floor(Math.random() * 2));
    const ttV = Math.round((creator.ttViews / creator.posts) * (0.5 + Math.random()));
    const igV = Math.round((creator.igViews / creator.posts) * (0.5 + Math.random()));
    const milestone = (ttV + igV) > creator.avgPerPost * 2 ? "🔥 Viral" : (ttV + igV) > creator.avgPerPost * 1.5 ? "⭐ Hit" : undefined;
    posts.push({
      date: date.toISOString().split("T")[0],
      ttViews: ttV,
      igViews: igV,
      milestone,
      earnings: Math.round(earningsPerPost * 100) / 100,
    });
  }
  return posts;
}

export const creatorsTimeSeries: Record<string, CreatorTimeSeriesPoint[]> = {};
export const creatorsPosts: Record<string, CreatorPost[]> = {};
creatorsData.forEach(c => {
  creatorsTimeSeries[c.name] = generateTimeSeries(c);
  creatorsPosts[c.name] = generatePosts(c);
});

export const creatorColors: Record<string, string> = {
  Nick: "#3b82f6",
  Abby: "#a855f7",
  Luke: "#22c55e",
  Jake: "#eab308",
  Bobby: "#f97316",
  Sheryl: "#ec4899",
  Flo: "#06b6d4",
};

export function useCreators() { return creatorsData; }
export function useCreatorTimeSeries(name: string) { return creatorsTimeSeries[name] || []; }
export function useCreatorPosts(name: string) { return creatorsPosts[name] || []; }

// ─── Data Access Hooks (mock implementations) ────────────────────────────────

export function useTasks(): Task[] {
  return mockTasks;
}

export function useActivities(): Activity[] {
  return mockActivities;
}

export function useScheduledTasks(): ScheduledTask[] {
  return mockScheduledTasks;
}

export function useDocuments(): MemoryDocument[] {
  return mockDocuments;
}

export function useTeam(): TeamMember[] {
  return teamMembers;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  type: "task" | "activity" | "memory" | "team";
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  href: string;
}

export function searchAll(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const t of mockTasks) {
    if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
      results.push({ type: "task", id: t._id, title: t.title, subtitle: `${t.status} · ${t.assignee}`, icon: "📋", href: "/tasks" });
    }
  }
  for (const a of mockActivities) {
    if (a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)) {
      results.push({ type: "activity", id: a._id, title: a.title, subtitle: `${a.agent} · ${a.type}`, icon: "⚡", href: "/" });
    }
  }
  for (const d of mockDocuments) {
    if (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)) {
      results.push({ type: "memory", id: d._id, title: d.title, subtitle: d.path, icon: "📝", href: "/memory" });
    }
  }
  for (const m of teamMembers) {
    if (m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)) {
      results.push({ type: "team", id: m.id, title: `${m.emoji} ${m.name}`, subtitle: m.role, icon: m.emoji, href: "/team" });
    }
  }

  return results.slice(0, 12);
}
