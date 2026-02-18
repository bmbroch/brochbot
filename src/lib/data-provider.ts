// Data provider with mock/Convex toggle
// Set to false when Convex is connected
export const useMockData = true;

// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";
export type Product = "CLCP" | "ISK" | "SE";
export type Assignee = "ben" | "sam" | "cara" | "dana" | "miles";
export type ActivityType = "data_query" | "customer_lookup" | "report" | "cron_job" | "config_change" | "memory_update" | "task_completed";
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
  role: string;
  description: string;
  dataSources: string[];
  isAgent: boolean;
}

// ─── Agent / Team Config ─────────────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  { id: "ben", name: "Ben", emoji: "👨‍💻", role: "Founder", description: "Founder & CEO. Sets the vision, reviews work, and keeps everything on track.", dataSources: ["All"], isAgent: false },
  { id: "sam", name: "Sam", emoji: "🤝", role: "Hub & Orchestrator", description: "Coordinates all agents, manages workflows, and handles complex multi-step operations.", dataSources: ["Stripe", "Supabase", "Datafast", "GSC"], isAgent: true },
  { id: "cara", name: "Cara", emoji: "🎧", role: "Customer Support", description: "Handles customer inquiries, subscription issues, and refund requests via Stripe.", dataSources: ["Stripe"], isAgent: true },
  { id: "dana", name: "Dana", emoji: "📊", role: "Data Analyst", description: "Runs analytics queries, generates reports, and monitors KPIs across all products.", dataSources: ["Supabase", "Datafast"], isAgent: true },
  { id: "miles", name: "Miles", emoji: "🚀", role: "GTM Lead", description: "Drives growth through SEO, GEO, UGC, and paid campaigns. Tracks marketing performance.", dataSources: ["Datafast", "GSC", "SEO Tools"], isAgent: true },
];

export const agentColors: Record<string, string> = {
  ben: "#f59e0b",
  sam: "#3b82f6",
  cara: "#a855f7",
  dana: "#22c55e",
  miles: "#f97316",
};

export const agentEmojis: Record<string, string> = {
  ben: "👨‍💻",
  sam: "🤝",
  cara: "🎧",
  dana: "📊",
  miles: "🚀",
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

export const mockActivities: Activity[] = [
  { _id: "a1", agent: "sam", type: "config_change", title: "Mission Control deployed", description: "Built and deployed the Mission Control dashboard with all core pages.", product: "CLCP", status: "success", createdAt: now - h * 0.5 },
  { _id: "a2", agent: "dana", type: "report", title: "Dana test run completed", description: "First successful analytics query — pulled revenue metrics from all 3 Stripe accounts.", product: "CLCP", status: "success", createdAt: now - h * 1 },
  { _id: "a3", agent: "cara", type: "customer_lookup", title: "Cara test run completed", description: "Successfully looked up customer subscription and payment history via Stripe API.", product: "ISK", status: "success", createdAt: now - h * 1.5 },
  { _id: "a4", agent: "sam", type: "config_change", title: "Stripe API connected", description: "Configured all three Stripe connected accounts with proper auth headers.", product: "CLCP", status: "success", createdAt: now - h * 3 },
  { _id: "a5", agent: "dana", type: "data_query", title: "Supabase databases analyzed", description: "Crawled all Supabase tables across CLCP, ISK, and SE. Full schema documented.", status: "success", createdAt: now - h * 4 },
  { _id: "a6", agent: "dana", type: "cron_job", title: "Morning report configured", description: "Set up daily 8 AM analytics report — pulls key metrics from Datafast and Stripe.", status: "success", createdAt: now - h * 5 },
  { _id: "a7", agent: "miles", type: "data_query", title: "Datafast analytics reviewed", description: "Checked traffic and conversion data across all products. CLCP leading in organic traffic.", product: "CLCP", status: "success", createdAt: now - h * 6 },
  { _id: "a8", agent: "sam", type: "memory_update", title: "Memory files organized", description: "Updated MEMORY.md and TOOLS.md with Stripe accounts, Supabase URLs, and Datafast keys.", status: "success", createdAt: now - h * 7 },
  { _id: "a9", agent: "cara", type: "customer_lookup", title: "Refund request investigated", description: "Checked payment history for user requesting refund on Sales Echo — eligible for full refund.", product: "SE", status: "success", createdAt: now - h * 8 },
  { _id: "a10", agent: "dana", type: "report", title: "Weekly analytics report", description: "Generated weekly traffic and conversion report. Visitors up 18% WoW for ISK.", product: "ISK", status: "success", createdAt: now - h * 24 },
  { _id: "a11", agent: "miles", type: "data_query", title: "SEO keyword gap analysis", description: "Identified 45 high-volume keywords where competitors rank but we don't.", product: "CLCP", status: "success", createdAt: now - h * 25 },
  { _id: "a12", agent: "sam", type: "cron_job", title: "Health check — all services", description: "Pinged all Supabase endpoints and Stripe webhooks. All systems operational.", status: "success", createdAt: now - h * 26 },
  { _id: "a13", agent: "cara", type: "task_completed", title: "Customer onboarding email sent", description: "Sent welcome email to 12 new ISK subscribers from this week.", product: "ISK", status: "success", createdAt: now - h * 30 },
  { _id: "a14", agent: "dana", type: "report", title: "Monthly revenue summary", description: "Full revenue breakdown for Feb 2026. MRR: $4,280 across all products.", status: "success", createdAt: now - h * 48 },
  { _id: "a15", agent: "miles", type: "config_change", title: "UTM tracking configured", description: "Set up UTM parameters for all marketing campaigns. Integrated with Datafast.", product: "SE", status: "success", createdAt: now - h * 50 },
];

export const mockScheduledTasks: ScheduledTask[] = [
  { _id: "s1", name: "Morning Analytics Report", schedule: "0 8 * * *", nextRun: now + h * 12, lastRun: now - h * 12, agent: "dana", description: "Pull key metrics from Datafast and Stripe, generate summary report.", status: "active", product: "CLCP" },
  { _id: "s2", name: "Nightly Growth Analysis", schedule: "0 2 * * *", agent: "miles", description: "Analyze daily traffic patterns, keyword rankings, and conversion funnels.", status: "active", product: "SE" },
  { _id: "s3", name: "Service Health Check", schedule: "*/30 * * * *", nextRun: now + h * 0.5, lastRun: now - h * 0.25, agent: "sam", description: "Ping all API endpoints and verify webhook delivery.", status: "active" },
  { _id: "s4", name: "Subscription Sync", schedule: "0 */6 * * *", nextRun: now + h * 4, lastRun: now - h * 2, agent: "cara", description: "Sync subscription status across Stripe and Supabase.", status: "active", product: "ISK" },
  { _id: "s5", name: "Weekly SEO Report", schedule: "0 9 * * 1", nextRun: now + d * 5, agent: "miles", description: "Full SEO performance report with ranking changes and traffic analysis.", status: "active", product: "CLCP" },
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
