import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Timezone ──────────────────────────────────────────────────────────────────

export const TZ = 'Africa/Windhoek';

// ── CAT Formatting Utilities ──────────────────────────────────────────────────

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Activity Feed Helpers ─────────────────────────────────────────────────────

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric" });
}

export function getDateGroup(timestamp: number): string {
  const now = new Date();
  // Compare dates in CAT timezone using en-CA locale (gives YYYY-MM-DD format)
  const catDate = new Date(timestamp).toLocaleDateString('en-CA', { timeZone: TZ });
  const catToday = now.toLocaleDateString('en-CA', { timeZone: TZ });
  const catYesterday = new Date(now.getTime() - 86400000).toLocaleDateString('en-CA', { timeZone: TZ });

  if (catDate === catToday) return "Today";
  if (catDate === catYesterday) return "Yesterday";
  return new Date(timestamp).toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "short", day: "numeric" });
}
