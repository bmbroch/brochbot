// Data provider with mock/Convex toggle
// Set to false when Convex is connected
export const useMockData = true;

// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "in-progress" | "done" | "blocked";
export type Priority = "low" | "medium" | "high";
export type Product = "CLCP" | "ISK" | "SE" | "internal" | "all";
export type Assignee = "ben" | "sam" | "dev" | "devin" | "cara" | "dana" | "miles" | "penny" | "mia";
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
  { id: "ben", name: "Ben", emoji: "👨‍💻", avatar: "/avatars/ben.jpg", role: "Founder", description: "Founder & CEO. Sets the vision, reviews work, and keeps everything on track.", dataSources: ["All"], isAgent: false },
  { id: "sam", name: "Sam", emoji: "🤝", avatar: "/avatars/sam.png", role: "Chief of Staff", description: "Coordinates all agents, manages workflows, and handles complex multi-step operations.", dataSources: ["Stripe", "Supabase", "Datafast", "GSC"], recurringTasks: ["Nightly MC Sync (2 AM CAT daily)"], isAgent: true },
  { id: "dev", name: "Devin", emoji: "🛠️", avatar: "/avatars/dev.png", role: "Web Developer", description: "Owns the Mission Control codebase. Handles all frontend changes, bug fixes, and deployments.", dataSources: ["GitHub", "Vercel"], isAgent: true, recurringTasks: [] },
  { id: "cara", name: "Cara", emoji: "🎧", avatar: "/avatars/cara.png", role: "Customer Support", description: "Handles customer inquiries, subscription issues, and refund requests via Stripe.", dataSources: ["Stripe"], isAgent: true },
  { id: "dana", name: "Dana", emoji: "📊", avatar: "/avatars/dana.png", role: "Data Analyst", description: "Runs analytics queries, generates reports, and monitors KPIs across all products.", dataSources: ["Supabase", "Datafast"], recurringTasks: ["Morning Analytics Report (8 AM CAT daily)"], isAgent: true },
  { id: "miles", name: "Miles", emoji: "🚀", avatar: "/avatars/miles.png", role: "GTM Lead", description: "Drives growth through SEO, GEO, UGC, and paid campaigns. Tracks marketing performance.", dataSources: ["Datafast", "GSC", "SEO Tools"], recurringTasks: ["Weekly GSC Report (Monday 8 AM CAT)"], isAgent: true },
  { id: "penny", name: "Penny", emoji: "📌", avatar: "/avatars/penny.png", role: "Secretary", description: "Captures ideas, links, inspiration. Maintains the mood board. Keeps receipts on everything.", dataSources: ["Mood Board", "Workspace Files"], isAgent: true },
  { id: "mia", name: "Mia", emoji: "📱", avatar: "/avatars/mia.png", role: "Social Media Manager", description: "Tracks UGC creator performance. Analyzes social media metrics across TikTok and Instagram. Owns creator relationships.", dataSources: ["Google Sheets", "Datafast (UTM campaigns)"], isAgent: true },
];

export const agentColors: Record<string, string> = {
  ben: "#f59e0b",
  sam: "#3b82f6",
  dev: "#f59e0b",
  cara: "#a855f7",
  dana: "#22c55e",
  miles: "#f97316",
  penny: "#f43f5e",
  mia: "#d946ef",
  devin: "#f59e0b",
  system: "#6b7280",
};

export const agentEmojis: Record<string, string> = {
  ben: "👨‍💻",
  sam: "🤝",
  dev: "🛠️",
  cara: "🎧",
  dana: "📊",
  miles: "🚀",
  penny: "📌",
  mia: "📱",
  devin: "🛠️",
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

// ─── Time helpers (for documents that still use relative timestamps) ─────────
const now = Date.now();
const h = 3600000;
const d = 86400000;

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

export const mockActivities: Activity[] = [
  { _id: "a1", agent: "sam", type: "cron", title: "Nightly MC Sync", description: "Tracker was stale, updated. No code push needed.", status: "success", product: "internal", createdAt: 1771459200000 },
  { _id: "a2", agent: "sam", type: "task", title: "Team page accordion fix + mobile responsiveness", description: "Fixed accordion and full mobile responsiveness pass. ⚠️ Sam wrote code directly instead of delegating to Dev.", status: "success", product: "internal", createdAt: 1771459200000 },
  { _id: "a3", agent: "dana", type: "cron", title: "Morning Analytics Report", description: "Traffic down ~19% across all products vs last Wed. ISK -30%. CLCP revenue nearly tripled ($263 vs $95).", status: "success", product: "all", createdAt: 1771480800000 },
  { _id: "a4", agent: "miles", type: "task", title: "Enable GSC API check", description: "Confirmed GSC API is working and accessible.", status: "success", product: "ISK", createdAt: 1771482000000 },
  { _id: "a5", agent: "miles", type: "task", title: "ISK keyword snapshot from GSC", description: "Pulled top 50 queries by clicks/impressions, tracked 9 target keywords, analyzed positioning gaps.", status: "success", product: "ISK", createdAt: 1771482300000 },
  { _id: "a6", agent: "miles", type: "task", title: "ISK keyword trends (6-month)", description: "Generated 6-month trend report for ISK keyword positioning.", status: "success", product: "ISK", createdAt: 1771482600000 },
  { _id: "a7", agent: "miles", type: "task", title: "ISK month-over-month comparison", description: "Compared ISK keyword performance month over month.", status: "success", product: "ISK", createdAt: 1771482900000 },
  { _id: "a8", agent: "miles", type: "task", title: "ISK weekly report (new format)", description: "Weekly report with date-range column headers per Ben's preference.", status: "success", product: "ISK", createdAt: 1771483500000 },
  { _id: "a9", agent: "sam", type: "task", title: "Create agent knowledge briefs", description: "Created agents/*.md briefs for all agents so sub-agents load context from files.", status: "success", product: "internal", createdAt: 1771484400000 },
  { _id: "a10", agent: "sam", type: "task", title: "Create Dev agent (Devin 🛠️)", description: "New Web Developer agent to own the MC codebase. Sam should no longer write code directly.", status: "success", product: "internal", createdAt: 1771486200000 },
  { _id: "a11", agent: "sam", type: "task", title: "Set up delegation audit cron", description: "Daily 6 PM CAT cron to review Sam's delegation compliance.", status: "success", product: "internal", createdAt: 1771487100000 },
  { _id: "a12", agent: "devin", type: "task", title: "Team page DiceBear avatars + recurring tasks section", description: "Swapped emoji for DiceBear avatars, added recurring tasks section to team page.", status: "success", product: "internal", createdAt: 1771487400000 },
  { _id: "a13", agent: "sam", type: "task", title: "Fix PostCSS breakage", description: "Sub-agent changed postcss.config.js, Sam reverted it.", status: "success", product: "internal", createdAt: 1771487400000 },
  { _id: "a14", agent: "devin", type: "task", title: "Office page v1", description: "Built top-down virtual office with desks and furniture.", status: "success", product: "internal", createdAt: 1771487700000 },
  { _id: "a15", agent: "devin", type: "task", title: "Fix office meeting table overlap", description: "Repositioned desks and furniture to fix overlap issues.", status: "success", product: "internal", createdAt: 1771487880000 },
  { _id: "a16", agent: "devin", type: "task", title: "Add Dev agent to team + office pages", description: "New agent fully onboarded into team and office views.", status: "success", product: "internal", createdAt: 1771488300000 },
  { _id: "a17", agent: "penny", type: "task", title: "Ops infrastructure overhaul", description: "Created ops/ directory, SOP, cron registry, daily log template.", status: "success", product: "internal", createdAt: 1771488480000 },
  { _id: "a18", agent: "devin", type: "task", title: "Office mobile responsive fix", description: "Scales office scene on mobile instead of list fallback.", status: "success", product: "internal", createdAt: 1771488900000 },
  { _id: "a19", agent: "sam", type: "task", title: "Penny cron setup (daily + weekly)", description: "Daily 4 PM CAT and Weekly Friday 9 AM CAT cron jobs for Penny.", status: "success", product: "internal", createdAt: 1771489140000 },
  { _id: "a20", agent: "devin", type: "task", title: "Office mobile drawer", description: "Bottom sheet for agent activity on mobile.", status: "success", product: "internal", createdAt: 1771489200000 },
  { _id: "a21", agent: "devin", type: "task", title: "Extract shared AgentDrawer component", description: "Shared component between team and office pages.", status: "success", product: "internal", createdAt: 1771489320000 },
  { _id: "a22", agent: "sam", type: "task", title: "Rename Dev → Devin", description: "Updated all files, MEMORY, data-provider to use Devin name.", status: "success", product: "internal", createdAt: 1771489320000 },
  { _id: "a23", agent: "devin", type: "task", title: "Build Ops Surveillance page", description: "/ops page with delegation score, violations ticker, agent status.", status: "success", product: "internal", createdAt: 1771489500000 },
  { _id: "a24", agent: "sam", type: "task", title: "Update Mia avatar", description: "Generated new avatar, copied to public, pushed.", status: "success", product: "internal", createdAt: 1771489740000 },
  { _id: "a25", agent: "devin", type: "task", title: "Rename Ops → Surveillance", description: "Updated nav and page title from Ops to Surveillance.", status: "success", product: "internal", createdAt: 1771489800000 },
  { _id: "a26", agent: "sam", type: "task", title: "Ops infrastructure build (orchestration)", description: "Orchestrated: Penny brief creation, ops/ directory, SOP, HEARTBEAT config. Delegated to Penny sub-agent. Completed.", status: "success", product: "internal", createdAt: 1771489800000 },
  { _id: "a27", agent: "sam", type: "task", title: "Stripe + Supabase + Datafast integration setup", description: "Connected all 3 products to Stripe, Supabase, and Datafast APIs on Feb 18. Pulled initial data snapshots.", status: "success", product: "all", createdAt: 1771387200000 },
  { _id: "a28", agent: "mia", type: "task", title: "UGC creator audit", description: "Verified 7 creators, 134 posts, 4.19M combined views. Found data issues: summary tab undercounts, Jake/Bobby UTMs swapped, inconsistent date formats.", status: "success", product: "SE", createdAt: 1771416000000 },
  { _id: "a29", agent: "sam", type: "task", title: "Google Service Account setup", description: "Set up brochbot service account, enabled Sheets API, stored credentials at .credentials/google-service-account.json.", status: "success", product: "all", createdAt: 1771405200000 },
  { _id: "a30", agent: "sam", type: "task", title: "Mission Control dashboard initial build", description: "NextJS app with Activity Feed, Calendar, Global Search, Team page. Deployed on Vercel. GitHub PAT set up.", status: "success", product: "internal", createdAt: 1771398000000 },
  { _id: "a31", agent: "sam", type: "task", title: "Brave Search API setup", description: "Connected Brave Search API, stored key in env vars. Available for all agents.", status: "success", product: "internal", createdAt: 1771408800000 },
  { _id: "a32", agent: "sam", type: "task", title: "Initial cron jobs setup (Feb 18)", description: "Set up Morning Analytics Report (8 AM CAT, Dana) and Nightly MC Sync (2 AM CAT, Sam) on first day.", status: "success", product: "internal", createdAt: 1771426800000 },
  { _id: "a33", agent: "sam", type: "task", title: "MC dashboard v2 — page builds (Feb 18)", description: "Upgraded to recharts (interactive hover), built Tasks Board, Creators page, Memory page. Team page went through 3 design iterations before landing on clean accordion layout.", status: "success", product: "internal", createdAt: 1771420200000 },
  { _id: "a34", agent: "devin", type: "task", title: "AgentSidePanel component", description: "Built AgentSidePanel as a companion to AgentDrawer, used for desktop sidebar agent detail view.", status: "success", product: "internal", createdAt: 1771489380000 },
  { _id: "a35", agent: "penny", type: "task", title: "First delegation audit report", description: "Full audit: 7 Sam violations documented, agent status assessed, process gaps identified, improvement priorities ranked. Saved: ops/penny-audit-2026-02-19.md", status: "success", product: "internal", createdAt: 1771488960000 },
  { _id: "a36", agent: "sam", type: "task", title: "agentOrder fix — add Devin to team page", description: "Added Devin to agentOrder array in team page. ⚠️ Sam edited code directly instead of delegating to Devin. One-line fix but still a violation.", status: "success", product: "internal", createdAt: 1771489680000 },
  { _id: "a37", agent: "sam", type: "task", title: "Model config changes — Sonnet fallback", description: "Configured Claude Sonnet as the model for sub-agents and background tasks. Opus remains the default for main sessions. Auto-fallback from Opus to Sonnet when context is high.", status: "success", product: "internal", createdAt: 1771490100000 },
  { _id: "a38", agent: "sam", type: "task", title: "mc-data.json creation + data wiring to MC", description: "Created ops/mc-data.json as the canonical data source for Mission Control. Wired MC dashboard to consume JSON for activity feed, calendar, tasks, and decisions.", status: "success", product: "internal", createdAt: 1771490400000 },
  { _id: "a39", agent: "penny", type: "task", title: "Full mc-data.json reconciliation", description: "Comprehensive sweep of all work Feb 18–19. Added 9 missing activities, 4 missing tasks, 3 missing decisions. Fixed a26 in-progress → success. Updated lastUpdated.", status: "success", product: "internal", createdAt: 1771491360000 },
];

export const mockScheduledTasks: ScheduledTask[] = [
  { _id: "c1", name: "Morning Analytics Report", schedule: "8 AM CAT daily", nextRun: 1771570800000, agent: "dana", description: "Daily analytics report across all products.", status: "active" },
  { _id: "c2", name: "Nightly MC Sync", schedule: "2 AM CAT daily", nextRun: 1771549200000, agent: "sam", description: "Sync Mission Control data and tracker.", status: "active" },
  { _id: "c3", name: "Weekly GSC Report", schedule: "Monday 8 AM CAT weekly", nextRun: 1771830000000, agent: "miles", description: "Weekly Google Search Console keyword report.", status: "active", product: "ISK" },
  { _id: "c4", name: "Delegation Audit", schedule: "6 PM CAT daily", nextRun: 1771506000000, agent: "system", description: "Review Sam's delegation compliance.", status: "active" },
  { _id: "c5", name: "Penny Daily Check", schedule: "4 PM CAT daily", nextRun: 1771498800000, agent: "penny", description: "Daily ops check and log update.", status: "active" },
  { _id: "c6", name: "Penny Weekly Audit", schedule: "Friday 9 AM CAT weekly", nextRun: 1771747200000, agent: "penny", description: "Weekly ops audit and summary.", status: "active" },
];

// ─── Decisions ───────────────────────────────────────────────────────────────

export interface Decision {
  _id: string;
  title: string;
  description: string;
  madeBy: string;
  createdAt: number;
}

export const mockDecisions: Decision[] = [
  { _id: "d1", title: "Agent Knowledge Briefs", description: "Create persistent agent briefs in /workspace/agents/ so sub-agents load context from files instead of re-explaining everything. Reduces context waste, improves delegation efficiency.", madeBy: "Ben + Sam", createdAt: 1771484400000 },
  { _id: "d2", title: "Dev Agent Created (Devin 🛠️)", description: "Add a Web Developer agent to own the MC codebase. Sam was writing code directly, violating the orchestrator role.", madeBy: "Ben + Sam", createdAt: 1771486200000 },
  { _id: "d3", title: "Weekly GSC Report Format", description: "Use date ranges as column headers (e.g. '2/10-2/16'), current partial week + last full week + T-30 avg. Ben prefers concrete dates over ambiguous labels like 'this week'.", madeBy: "Ben", createdAt: 1771483500000 },
  { _id: "d4", title: "Delegation Audit Cron", description: "Daily cron at 6 PM CAT to review Sam's delegation compliance. Need oversight to ensure Sam orchestrates rather than executes.", madeBy: "Ben", createdAt: 1771487100000 },
  { _id: "d5", title: "ISK Keyword Focus: During-Interview Only", description: "Track 'during interview' keywords (ai interview assistant, helper, etc.) not prep keywords. ISK is a live interview tool, not a practice/prep tool.", madeBy: "Ben", createdAt: 1771482300000 },
  { _id: "d6", title: "Sonnet for sub-agents", description: "Use Claude Sonnet (claude-sonnet-4-6) for sub-agents and background tasks. Opus (claude-opus-4-6) remains the default for main sessions. Balances cost and speed for autonomous background work.", madeBy: "Ben + Sam", createdAt: 1771490100000 },
  { _id: "d7", title: "Auto-fallback model config", description: "When context gets long or for delegated tasks, automatically fall back from Opus to Sonnet. Configured in openclaw model settings. Prevents context blowout on expensive tasks.", madeBy: "Ben + Sam", createdAt: 1771490100000 },
  { _id: "d8", title: "Sync after work chunks, not on fixed schedule", description: "The nightly MC sync (Sam, 2 AM CAT) updates data after work happens rather than on a rigid push schedule. mc-data.json is the canonical source; synced after meaningful work sessions, not every hour.", madeBy: "Ben + Sam", createdAt: 1771490400000 },
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

export function useDecisions(): Decision[] {
  return mockDecisions;
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
