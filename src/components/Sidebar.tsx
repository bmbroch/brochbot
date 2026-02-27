"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface SidebarProps {
  onSearchClick: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function LogOutIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function Sidebar({ onSearchClick, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [orgs, setOrgs] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const logoAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ugc/orgs")
      .then((res) => res.json())
      .then((data) => {
        const list: Array<{ id: string; name: string; slug: string }> = Array.isArray(data)
          ? data
          : data?.orgs ?? [];
        if (list.length === 0) return;
        setOrgs(list);
        const stored = localStorage.getItem("ugc_org_id");
        const match = list.find((o) => o.id === stored);
        const id = match ? match.id : list[0].id;
        setSelectedOrgId(id);
        localStorage.setItem("ugc_org_id", id);
      })
      .catch(() => {
        // best-effort — silently ignore
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (logoAreaRef.current && !logoAreaRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const navItems = [
    { href: "/", label: "Briefings", icon: "⚡" },
    { href: "/tasks", label: "Tasks", icon: "📋" },
    { href: "/automations", label: "Launchpad", icon: "🚀" },
    { href: "/changelog", label: "Changelog", icon: "🔄" },
    { href: selectedOrgId ? `/ugc?org_id=${selectedOrgId}` : "/ugc", label: "UGC", icon: "🎬" },
    { href: "/content", label: "Content Studio", icon: "✍️" },
    { href: "/team", label: "Team", icon: "👥" },
    { href: "/office", label: "Office", icon: "🏢" },
    { href: "/ops", label: "Surveillance", icon: "📡" },
    { href: "/usage", label: "Usage", icon: "📊" },
    { href: "/health", label: "Health", icon: "🩺" },
  ];

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 w-64 border-r flex flex-col z-50 transition-transform duration-200",
        "bg-[var(--bg-card)] border-[var(--border-medium)]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[var(--border-medium)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L14.5 5V11L8 15L1.5 11V5L8 1Z" fill="white" fillOpacity="0.9"/></svg>
          </div>
          <div ref={logoAreaRef} className="min-w-0 flex-1 relative">
            <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Mission Control</h1>
            {orgs.length > 0 ? (
              <button
                onClick={() => setOrgDropdownOpen((o) => !o)}
                className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors group"
              >
                <span className="truncate max-w-[120px]">
                  {orgs.find((o) => o.id === selectedOrgId)?.name ?? orgs[0]?.name}
                </span>
                <ChevronDown size={10} className={`flex-shrink-0 transition-transform ${orgDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)]">BrochBot Ops</p>
            )}

            {orgDropdownOpen && orgs.length > 1 && (
              <div className="absolute left-0 top-full mt-1 z-50 w-52 rounded-xl bg-[var(--bg-card)] border border-[var(--border-medium)] shadow-xl shadow-black/20 py-1 overflow-hidden">
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      localStorage.setItem("ugc_org_id", org.id);
                      setOrgDropdownOpen(false);
                      if (pathname.startsWith("/ugc")) {
                        router.push(`/ugc?org_id=${org.id}`);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-hover)] ${
                      org.id === selectedOrgId
                        ? "text-[var(--text-primary)] font-medium"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${
                      org.id === selectedOrgId ? "bg-blue-500" : "bg-gray-400 dark:bg-[#444]"
                    }`}>
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{org.name}</span>
                    {org.id === selectedOrgId && (
                      <svg className="ml-auto flex-shrink-0 w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all border border-[var(--border-medium)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] border border-[var(--border-medium)] text-[var(--text-muted)] font-mono">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="px-3 pt-3 pb-2 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Pages</p>
        {navItems.map((item) => {
          const isActive = item.label === "UGC"
            ? pathname.startsWith("/ugc")
            : pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer: Theme Toggle + Logout */}
      <div className="px-3 pb-4 border-t border-[var(--border-medium)] pt-3 space-y-0.5">
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
            "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          )}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="w-5 text-center flex items-center justify-center">
            {theme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
          </span>
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
            "text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-hover)]"
          )}
          aria-label="Sign out"
        >
          <span className="w-5 text-center flex items-center justify-center">
            <LogOutIcon size={15} />
          </span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
