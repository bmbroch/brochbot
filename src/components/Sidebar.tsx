"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onSearchClick: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { href: "/", label: "Activity Feed", icon: "⚡" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/creators", label: "Creators", icon: "🎬" },
  { href: "/memory", label: "Memory", icon: "🧠" },
  { href: "/team", label: "Team", icon: "👥" },
  { href: "/office", label: "Office", icon: "🏢" },
  { href: "/ops", label: "Surveillance", icon: "📡" },
];

export default function Sidebar({ onSearchClick, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 w-64 bg-[#141414] border-r border-[#262626] flex flex-col z-50 transition-transform duration-200",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L14.5 5V11L8 15L1.5 11V5L8 1Z" fill="white" fillOpacity="0.9"/></svg>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">Mission Control</h1>
            <p className="text-[11px] text-zinc-500">BrochBot Ops</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all border border-[#262626]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-[#262626] text-zinc-500 font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 pt-3 pb-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Pages</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="p-4 border-t border-[#262626] space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2">
          <span>Services</span>
        </div>
        {["Stripe", "Supabase", "Datafast"].map((s) => (
          <div key={s} className="flex items-center justify-between text-[12px]">
            <span className="text-zinc-500">{s}</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[11px]">Live</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
