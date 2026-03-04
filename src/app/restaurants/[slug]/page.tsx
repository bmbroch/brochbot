"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import RESTAURANTS from "../data";

export default function RestaurantPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const r = RESTAURANTS.find((x) => x.slug === slug);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!r) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [r]);

  if (!r) return null;

  const { colors } = r;

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#fdf8f0", color: "#1a1a1a" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? `${colors.bg}f7` : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
          padding: scrolled ? "14px 40px" : "24px 40px",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 22 }}>{r.anchor}</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "0.05em" }}>{r.name.toUpperCase()}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["About", "Menu", "Atmosphere", "Contact"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`}
                style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, letterSpacing: "0.08em", textDecoration: "none", fontFamily: "system-ui, sans-serif" }}
              >{l.toUpperCase()}</a>
            ))}
            <a href={`mailto:${r.email}`}
              style={{ background: colors.accent, color: "#fff", padding: "8px 20px", borderRadius: 6, fontSize: 13, fontFamily: "system-ui, sans-serif", fontWeight: 600, textDecoration: "none", letterSpacing: "0.06em" }}
            >RESERVE</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${colors.bg} 0%, ${colors.mid} 60%, ${colors.bg} 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(ellipse at 25% 50%, ${colors.accent}22 0%, transparent 55%), radial-gradient(ellipse at 75% 20%, ${colors.accent}11 0%, transparent 50%)`,
        }} />
        <div style={{ position: "absolute", fontSize: 360, opacity: 0.04, userSelect: "none", pointerEvents: "none" }}>{r.anchor}</div>
        <div style={{ position: "relative", textAlign: "center", padding: "0 24px", maxWidth: 800 }}>
          <p style={{ color: colors.accent, letterSpacing: "0.3em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>{r.sub}</p>
          <h1 style={{ color: "#fff", fontSize: "clamp(44px, 7vw, 82px)", fontWeight: 700, margin: 0, lineHeight: 1.05, letterSpacing: "-0.01em" }}>{r.name}</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "clamp(14px, 2vw, 20px)", margin: "14px 0 0", letterSpacing: "0.15em", fontStyle: "italic" }}>{r.tagline}</p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 17, margin: "28px auto 0", maxWidth: 480, lineHeight: 1.65, fontStyle: "italic" }}>
            &ldquo;{r.heroQuote}&rdquo;
          </p>
          <div style={{ marginTop: 48, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`mailto:${r.email}`} style={{ background: colors.accent, color: "#fff", padding: "14px 36px", borderRadius: 8, fontSize: 14, fontFamily: "system-ui, sans-serif", fontWeight: 700, textDecoration: "none", letterSpacing: "0.08em" }}>
              MAKE A RESERVATION
            </a>
            <a href="#menu" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "14px 36px", borderRadius: 8, fontSize: 14, fontFamily: "system-ui, sans-serif", fontWeight: 600, textDecoration: "none", letterSpacing: "0.08em", border: "1px solid rgba(255,255,255,0.2)" }}>
              VIEW MENU
            </a>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 24, animation: "bounce 2s infinite" }}>↓</div>
      </section>

      {/* ── About ── */}
      <section id="about" style={{ background: "#fff", padding: "100px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: colors.accent, letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>OUR STORY</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, margin: "0 0 28px", color: "#0a0a0a", lineHeight: 1.2 }}>
            {r.name}
          </h2>
          {r.about.map((p, i) => (
            <p key={i} style={{ fontSize: 17, lineHeight: 1.85, color: "#444", margin: i === 0 ? "0 0 20px" : 0 }}>{p}</p>
          ))}
        </div>
        <div style={{ maxWidth: 1000, margin: "72px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 28 }}>
          {r.highlights.map((h) => (
            <div key={h.title} style={{ textAlign: "center", padding: "28px 18px", borderRadius: 16, background: "#fdf8f0", border: "1px solid #f0e8d8" }}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{h.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#0a0a0a", fontFamily: "system-ui, sans-serif" }}>{h.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "#666", margin: 0, fontFamily: "system-ui, sans-serif" }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Menu ── */}
      <section id="menu" style={{ background: "#fdf8f0", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: colors.accent, letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>WHAT WE SERVE</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, margin: 0, color: "#0a0a0a" }}>The Menu</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            {r.menu.map((section) => (
              <div key={section.category} style={{ background: "#fff", borderRadius: 16, padding: "28px", border: "1px solid #e8dfc8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid #f0e8d8" }}>
                  <span style={{ fontSize: 26 }}>{section.icon}</span>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0a0a0a", fontFamily: "system-ui, sans-serif" }}>{section.category}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {section.items.map((item) => (
                    <div key={item.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>{item.name}</span>
                        {item.price && <span style={{ fontSize: 13, fontWeight: 700, color: colors.accent, whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif" }}>{item.price}</span>}
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#777", lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 44, color: "#999", fontSize: 13, fontFamily: "system-ui, sans-serif", fontStyle: "italic" }}>
            Menu changes seasonally. Ask your server about today&apos;s specials.
          </p>
        </div>
      </section>

      {/* ── Atmosphere ── */}
      <section id="atmosphere" style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.mid} 100%)`, padding: "100px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: colors.accent, letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>THE EXPERIENCE</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, margin: "0 0 32px" }}>More than a meal</h2>
          <p style={{ fontSize: 18, lineHeight: 1.85, color: "rgba(255,255,255,0.75)", maxWidth: 640, margin: "0 auto 44px", fontStyle: "italic" }}>
            &ldquo;{r.heroQuote}&rdquo;
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, sans-serif", letterSpacing: "0.1em" }}>— {r.heroQuoteSource}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, flexWrap: "wrap" }}>
            {r.atmosphere.map(({ icon, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui, sans-serif", letterSpacing: "0.08em" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ background: "#fff", padding: "100px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: colors.accent, letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>FIND US</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, margin: 0, color: "#0a0a0a" }}>Come visit</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 28, maxWidth: 800, margin: "0 auto" }}>
            {[
              { icon: "📍", label: "Location", value: r.location, sub: "Swakopmund, Namibia" },
              { icon: "📞", label: "Phone", value: r.phone, sub: "Call to reserve" },
              { icon: "✉️", label: "Email", value: r.email, sub: "We reply same day" },
              { icon: "📸", label: "Instagram", value: r.instagram, sub: "Follow for daily specials" },
            ].map((c) => (
              <div key={c.label} style={{ textAlign: "center", padding: "28px 16px", borderRadius: 16, background: "#fdf8f0", border: "1px solid #f0e8d8" }}>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{c.icon}</div>
                <p style={{ margin: "0 0 5px", fontSize: 11, color: "#999", letterSpacing: "0.15em", fontFamily: "system-ui, sans-serif" }}>{c.label.toUpperCase()}</p>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#0a0a0a", fontFamily: "system-ui, sans-serif", wordBreak: "break-all" }}>{c.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa", fontFamily: "system-ui, sans-serif" }}>{c.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <a href={`mailto:${r.email}`} style={{ background: colors.bg, color: "#fff", padding: "16px 48px", borderRadius: 8, fontSize: 14, fontFamily: "system-ui, sans-serif", fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em", display: "inline-block" }}>
              MAKE A RESERVATION
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: colors.bg, color: "rgba(255,255,255,0.4)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 18 }}>{r.anchor}</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 15, letterSpacing: "0.1em" }}>{r.name.toUpperCase()}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, fontFamily: "system-ui, sans-serif" }}>{r.tagline} · Swakopmund, Namibia</p>
      </footer>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
