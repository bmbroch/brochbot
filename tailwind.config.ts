import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        // Semantic theme tokens — reference CSS custom properties
        // Usage: bg-mc-base, bg-mc-card, text-mc-primary, border-mc-medium, etc.
        mc: {
          base:      "var(--bg-primary)",
          card:      "var(--bg-card)",
          elevated:  "var(--bg-elevated)",
          secondary: "var(--bg-secondary)",
          hover:     "var(--bg-hover)",
          active:    "var(--bg-active)",
          overlay:   "var(--bg-overlay)",
          border:    "var(--border-medium)",
          "border-sm": "var(--border-subtle)",
          "border-lg": "var(--border-strong)",
          primary:   "var(--text-primary)",
          muted:     "var(--text-muted)",
          faint:     "var(--text-faint)",
        },
        // Legacy named surfaces (still here for backward compat, not actively used)
        surface: {
          0: "#0a0a0a",
          1: "#111111",
          2: "#141414",
          3: "#1a1a1a",
        },
        border: {
          subtle: "#222222",
          medium: "#262626",
          strong: "#333333",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-down": "slideDown 0.2s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
