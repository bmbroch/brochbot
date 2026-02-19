"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const from = searchParams.get("from") ?? "/";
        router.push(from);
      } else {
        const data = await res.json();
        if (res.status === 429) {
          setError(data.error ?? "Too many attempts. Please wait a moment.");
        } else {
          setError("Incorrect password. Try again.");
        }
        setPassword("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-medium)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L14.5 5V11L8 15L1.5 11V5L8 1Z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <div className="text-center">
            <h1
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Mission Control
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              BrochBot Ops — Restricted Access
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              required
              placeholder="Enter password"
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all disabled:opacity-50"
              style={{
                background: "var(--bg-elevated)",
                borderColor: error ? "#ef4444" : "var(--border-medium)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow =
                    "0 0 0 2px rgba(59,130,246,0.15)";
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = "var(--border-medium)";
                  e.target.style.boxShadow = "none";
                }
              }}
            />
            {error && (
              <p className="mt-1.5 text-xs" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              if (!loading && password) {
                (e.target as HTMLButtonElement).style.background =
                  "var(--accent-hover)";
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background =
                "var(--accent)";
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
