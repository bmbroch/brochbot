export type ActivityType = "data_query" | "customer_lookup" | "report_generated" | "cron_job" | "system_config" | "memory_update";
export type Product = "CLCP" | "ISK" | "SE";
export type Status = "success" | "pending" | "failed" | "running";

export interface Activity {
  _id: string;
  timestamp: number;
  type: ActivityType;
  title: string;
  description: string;
  product: Product;
  status: Status;
}

export interface ScheduledTask {
  _id: string;
  name: string;
  schedule: string;
  nextRun: number;
  lastRun?: number;
  status: string;
  description: string;
  color?: string;
}

export interface Document {
  _id: string;
  title: string;
  content: string;
  type: "memory" | "note" | "config";
  path: string;
  updatedAt: number;
}

const now = Date.now();
const h = 3600000;
const d = 86400000;

export const mockActivities: Activity[] = [
  { _id: "1", timestamp: now - h * 0.5, type: "data_query", title: "Revenue metrics pulled", description: "Queried Stripe revenue data for all three products — MRR up 12% this month.", product: "CLCP", status: "success" },
  { _id: "2", timestamp: now - h * 1, type: "customer_lookup", title: "User subscription check", description: "Looked up user ben@example.com — Elite Navigator plan, active since Jan 2025.", product: "ISK", status: "success" },
  { _id: "3", timestamp: now - h * 2, type: "report_generated", title: "Weekly analytics report", description: "Generated weekly traffic and conversion report for Sales Echo.", product: "SE", status: "success" },
  { _id: "4", timestamp: now - h * 3, type: "cron_job", title: "Database backup completed", description: "Automated nightly backup of Supabase tables — all 3 products.", product: "CLCP", status: "success" },
  { _id: "5", timestamp: now - h * 4, type: "memory_update", title: "Memory file updated", description: "Updated MEMORY.md with new Stripe account details and product mappings.", product: "CLCP", status: "success" },
  { _id: "6", timestamp: now - h * 5, type: "system_config", title: "API rate limits adjusted", description: "Increased Datafast API polling interval to reduce 429 errors.", product: "SE", status: "pending" },
  { _id: "7", timestamp: now - h * 8, type: "data_query", title: "Churn analysis query", description: "Analyzed subscription cancellations for the past 30 days across ISK.", product: "ISK", status: "success" },
  { _id: "8", timestamp: now - h * 10, type: "cron_job", title: "Health check — all services", description: "Pinged all Supabase endpoints and Stripe webhooks. All healthy.", product: "CLCP", status: "success" },
  { _id: "9", timestamp: now - h * 12, type: "report_generated", title: "Funnel conversion report", description: "Landing page → trial → paid conversion funnel for Cover Letter Co-pilot.", product: "CLCP", status: "success" },
  { _id: "10", timestamp: now - h * 14, type: "customer_lookup", title: "Refund request investigated", description: "Checked payment history for user requesting refund — processed 2 days ago.", product: "SE", status: "failed" },
  { _id: "11", timestamp: now - h * 18, type: "system_config", title: "Webhook endpoint rotated", description: "Rotated Stripe webhook signing secret for Interview Sidekick.", product: "ISK", status: "success" },
  { _id: "12", timestamp: now - h * 24, type: "memory_update", title: "Schema docs refreshed", description: "Re-crawled all Supabase tables and updated database-schema.md.", product: "CLCP", status: "success" },
  { _id: "13", timestamp: now - h * 30, type: "data_query", title: "Traffic spike investigated", description: "Sudden 3x traffic on ISK landing page — traced to Reddit post.", product: "ISK", status: "success" },
  { _id: "14", timestamp: now - h * 36, type: "cron_job", title: "Email digest sent", description: "Sent daily metrics digest email with key KPIs.", product: "CLCP", status: "success" },
  { _id: "15", timestamp: now - h * 48, type: "report_generated", title: "Monthly revenue summary", description: "Full P&L breakdown across all three products for January 2026.", product: "SE", status: "success" },
];

// Build scheduled tasks relative to current week
const monday = new Date();
monday.setHours(0, 0, 0, 0);
monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
const mo = monday.getTime();

export const mockScheduledTasks: ScheduledTask[] = [
  { _id: "t1", name: "Revenue Sync", schedule: "Every 6h", nextRun: mo + h * 6, lastRun: now - h * 6, status: "active", description: "Pull latest Stripe revenue", color: "blue" },
  { _id: "t2", name: "DB Backup", schedule: "Daily 2am", nextRun: mo + h * 26, lastRun: now - h * 22, status: "active", description: "Full Supabase backup", color: "green" },
  { _id: "t3", name: "Analytics Report", schedule: "Mon 9am", nextRun: mo + h * 9, lastRun: now - d * 7, status: "active", description: "Weekly analytics email", color: "purple" },
  { _id: "t4", name: "Health Check", schedule: "Every 30m", nextRun: now + h * 0.5, lastRun: now - h * 0.5, status: "active", description: "Ping all services", color: "green" },
  { _id: "t5", name: "Cache Purge", schedule: "Sun midnight", nextRun: mo + d * 6, status: "active", description: "Clear stale cache entries", color: "yellow" },
  { _id: "t6", name: "User Digest", schedule: "Daily 8am", nextRun: mo + h * 8, lastRun: now - d, status: "active", description: "Daily engagement summary", color: "blue" },
  { _id: "t7", name: "Cert Check", schedule: "Wed noon", nextRun: mo + d * 2 + h * 12, status: "active", description: "SSL certificate expiry check", color: "red" },
  { _id: "t8", name: "Churn Scan", schedule: "Tue/Thu 10am", nextRun: mo + d + h * 10, lastRun: now - d * 2, status: "active", description: "Flag at-risk users", color: "purple" },
  { _id: "t9", name: "Revenue Sync", schedule: "Every 6h", nextRun: mo + h * 12, status: "active", description: "Pull latest Stripe revenue", color: "blue" },
  { _id: "t10", name: "Health Check", schedule: "Every 30m", nextRun: mo + d * 1 + h * 14, status: "active", description: "Ping all services", color: "green" },
  { _id: "t11", name: "User Digest", schedule: "Daily 8am", nextRun: mo + d * 1 + h * 8, status: "active", description: "Daily engagement summary", color: "blue" },
  { _id: "t12", name: "DB Backup", schedule: "Daily 2am", nextRun: mo + d * 2 + h * 2, status: "active", description: "Full Supabase backup", color: "green" },
  { _id: "t13", name: "Revenue Sync", schedule: "Every 6h", nextRun: mo + d * 3 + h * 6, status: "active", description: "Pull latest Stripe revenue", color: "blue" },
  { _id: "t14", name: "User Digest", schedule: "Daily 8am", nextRun: mo + d * 3 + h * 8, status: "active", description: "Daily engagement summary", color: "blue" },
  { _id: "t15", name: "Churn Scan", schedule: "Tue/Thu 10am", nextRun: mo + d * 3 + h * 10, status: "active", description: "Flag at-risk users", color: "purple" },
  { _id: "t16", name: "DB Backup", schedule: "Daily 2am", nextRun: mo + d * 4 + h * 2, status: "active", description: "Full Supabase backup", color: "green" },
  { _id: "t17", name: "Revenue Sync", schedule: "Every 6h", nextRun: mo + d * 5 + h * 6, status: "active", description: "Pull latest Stripe revenue", color: "blue" },
];

export const mockDocuments: Document[] = [
  { _id: "d1", title: "Database Schema Reference", content: "Full schema documentation for all Supabase tables across CLCP, ISK, and SE products.", type: "config", path: "memory/database-schema.md", updatedAt: now - d * 2 },
  { _id: "d2", title: "Stripe Integration Notes", content: "API keys, webhook setup, and account mappings for all three Stripe connected accounts.", type: "config", path: "TOOLS.md", updatedAt: now - d },
  { _id: "d3", title: "Weekly Standup Notes", content: "Discussed Q1 goals: improve conversion rate by 15%, reduce churn below 5%.", type: "note", path: "memory/2026-02-16.md", updatedAt: now - d * 2 },
  { _id: "d4", title: "Product Roadmap Q1 2026", content: "Key features: AI interview prep, resume scoring, practice call analytics dashboard.", type: "note", path: "memory/roadmap.md", updatedAt: now - d * 5 },
  { _id: "d5", title: "Deployment Checklist", content: "Pre-deploy: run tests, check env vars, verify webhook endpoints, clear CDN cache.", type: "config", path: "memory/deploy-checklist.md", updatedAt: now - d * 3 },
  { _id: "d6", title: "User Feedback Summary", content: "Common requests: faster load times, better mobile experience, dark mode toggle.", type: "memory", path: "memory/feedback.md", updatedAt: now - d },
];

export const typeConfig: Record<ActivityType, { label: string; color: string; bg: string }> = {
  data_query: { label: "Data Query", color: "text-blue-400", bg: "bg-blue-500/10" },
  customer_lookup: { label: "Customer", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  report_generated: { label: "Report", color: "text-purple-400", bg: "bg-purple-500/10" },
  cron_job: { label: "Cron Job", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  system_config: { label: "Config", color: "text-orange-400", bg: "bg-orange-500/10" },
  memory_update: { label: "Memory", color: "text-pink-400", bg: "bg-pink-500/10" },
};

export const statusConfig: Record<Status, { label: string; color: string; dot: string }> = {
  success: { label: "Success", color: "text-green-400", dot: "bg-green-400" },
  pending: { label: "Pending", color: "text-yellow-400", dot: "bg-yellow-400" },
  failed: { label: "Failed", color: "text-red-400", dot: "bg-red-400" },
  running: { label: "Running", color: "text-blue-400", dot: "bg-blue-400" },
};

export const productConfig: Record<Product, { label: string; color: string }> = {
  CLCP: { label: "Cover Letter", color: "text-blue-400" },
  ISK: { label: "Interview SK", color: "text-purple-400" },
  SE: { label: "Sales Echo", color: "text-emerald-400" },
};
