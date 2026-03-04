"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RESTAURANTS from "../data";

// ─────────────────────────────────────────────
// HAFENI — African warmth, kraft paper, organic
// ─────────────────────────────────────────────
function HafeniPage({ r }: { r: (typeof RESTAURANTS)[0] }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);
  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#f5ede0", color: "#2d1810" }}>
      {/* African diamond pattern header */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "18px 40px",
        background: "rgba(45,24,16,0.94)", backdropFilter: "blur(8px)",
        borderBottom: "3px solid #c2610f",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, background: "#c2610f", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ transform: "rotate(-45deg)", fontSize: 18 }}>🍲</span>
          </div>
          <span style={{ color: "#f5e6d3", fontWeight: 700, fontSize: 17, letterSpacing: "0.12em" }}>HAFENI</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["About", "Menu", "Visit"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "rgba(245,230,211,0.7)", fontSize: 12, letterSpacing: "0.15em", textDecoration: "none", fontFamily: "system-ui" }}>{l.toUpperCase()}</a>
          ))}
          <a href="tel:+264813989625" style={{ background: "#c2610f", color: "#fff", padding: "7px 18px", borderRadius: 4, fontSize: 12, fontFamily: "system-ui", fontWeight: 700, textDecoration: "none" }}>BOOK A TABLE</a>
        </div>
      </div>

      {/* Hero — full pattern bg */}
      <div style={{
        minHeight: "100vh", paddingTop: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, #2d1810 0%, #4a2218 50%, #c2610f 100%)",
        backgroundImage: `
          linear-gradient(180deg, #2d1810 0%, #4a2218 50%, #6b3020 100%),
          repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(194,97,15,0.12) 20px, rgba(194,97,15,0.12) 22px),
          repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(194,97,15,0.08) 20px, rgba(194,97,15,0.08) 22px)
        `,
        position: "relative", overflow: "hidden", textAlign: "center", padding: "80px 32px 60px",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at center, rgba(194,97,15,0.3) 0%, transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 24 }}>
            {["◆", "◆", "◆"].map((d, i) => <span key={i} style={{ color: "#c2610f", fontSize: 14 }}>{d}</span>)}
          </div>
          <p style={{ color: "#f5c07a", letterSpacing: "0.35em", fontSize: 11, fontFamily: "system-ui", marginBottom: 18 }}>MONDESA TOWNSHIP · SWAKOPMUND · NAMIBIA</p>
          <h1 style={{ color: "#fdf0e0", fontSize: "clamp(56px, 10vw, 110px)", fontWeight: 700, margin: 0, lineHeight: 0.9, letterSpacing: "-0.02em" }}>Hafeni</h1>
          <p style={{ color: "rgba(253,240,224,0.55)", fontSize: 18, margin: "18px 0 0", fontStyle: "italic" }}>Traditional Restaurant & Cultural Experience</p>
          <div style={{ width: 60, height: 3, background: "#c2610f", margin: "28px auto" }} />
          <p style={{ color: "rgba(253,240,224,0.75)", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.75, fontStyle: "italic" }}>
            &ldquo;{r.heroQuote}&rdquo;
          </p>
          <div style={{ marginTop: 48, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#menu" style={{ background: "#c2610f", color: "#fff", padding: "14px 36px", borderRadius: 4, fontSize: 13, fontFamily: "system-ui", fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>EXPLORE THE MENU</a>
            <a href="#visit" style={{ border: "2px solid rgba(253,240,224,0.3)", color: "#fdf0e0", padding: "14px 36px", borderRadius: 4, fontSize: 13, fontFamily: "system-ui", fontWeight: 600, textDecoration: "none", letterSpacing: "0.1em" }}>FIND US</a>
          </div>
        </div>
      </div>

      {/* Wave cut into next section */}
      <div style={{ background: "#4a2218", marginTop: -2 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60 }}>
          <path d="M0,30 Q360,60 720,30 Q1080,0 1440,30 L1440,60 L0,60 Z" fill="#f5ede0" />
        </svg>
      </div>

      {/* About */}
      <section id="about" style={{ background: "#f5ede0", padding: "80px 32px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
            <div style={{ width: 40, height: 4, background: "#c2610f" }} />
            <span style={{ color: "#c2610f", fontFamily: "system-ui", fontSize: 11, letterSpacing: "0.25em", fontWeight: 700 }}>OUR STORY</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, margin: "0 0 24px", color: "#2d1810", lineHeight: 1.2 }}>Where Namibia eats</h2>
          {r.about.map((p, i) => <p key={i} style={{ fontSize: 17, lineHeight: 1.85, color: "#4a2218", margin: i === 0 ? "0 0 18px" : 0 }}>{p}</p>)}
        </div>
        {/* Highlight tiles */}
        <div style={{ maxWidth: 1000, margin: "64px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {r.highlights.map((h) => (
            <div key={h.title} style={{ padding: "28px 20px", background: "#fff", borderRadius: 12, borderLeft: "5px solid #c2610f", boxShadow: "0 2px 12px rgba(45,24,16,0.08)" }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{h.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#2d1810", fontFamily: "system-ui" }}>{h.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#6b3020", margin: 0, fontFamily: "system-ui" }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu — kraft paper cards */}
      <section id="menu" style={{ background: "#e8d5ba", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ color: "#c2610f" }}>◆◆◆</span>
              <span style={{ color: "#2d1810", fontFamily: "system-ui", fontSize: 11, letterSpacing: "0.3em", fontWeight: 700 }}>THE KITCHEN</span>
              <span style={{ color: "#c2610f" }}>◆◆◆</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, margin: 0, color: "#2d1810" }}>Mama&apos;s Table</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {r.menu.map((section) => (
              <div key={section.category} style={{ background: "#fdf0d8", borderRadius: 8, padding: "28px", boxShadow: "3px 3px 0 #c2610f, inset 0 0 0 1px #d4a87a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "2px dashed #c2610f" }}>
                  <span style={{ fontSize: 24 }}>{section.icon}</span>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#2d1810", fontFamily: "system-ui", letterSpacing: "0.05em" }}>{section.category}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {section.items.map((item) => (
                    <div key={item.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#2d1810" }}>{item.name}</span>
                        {item.price && <span style={{ fontSize: 13, fontWeight: 700, color: "#c2610f", whiteSpace: "nowrap", fontFamily: "system-ui" }}>{item.price}</span>}
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b3020", fontFamily: "system-ui", lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" style={{ background: "#2d1810", padding: "80px 32px", textAlign: "center" }}>
        <p style={{ color: "#c2610f", letterSpacing: "0.25em", fontSize: 11, fontFamily: "system-ui", marginBottom: 16 }}>◆ FIND US ◆</p>
        <h2 style={{ fontSize: 40, fontWeight: 700, color: "#fdf0e0", margin: "0 0 16px" }}>Come to the table</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 40, flexWrap: "wrap" }}>
          {[["📍", "Mondesa Township, Swakopmund"], ["📞", r.phone], ["📸", r.instagram]].map(([icon, val]) => (
            <div key={val as string} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
              <p style={{ margin: 0, fontSize: 14, color: "#f5e6d3", fontFamily: "system-ui" }}>{val as string}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ background: "#1a0a04", padding: "28px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "rgba(245,230,211,0.4)", fontSize: 12, fontFamily: "system-ui" }}>◆ HAFENI TRADITIONAL RESTAURANT · SWAKOPMUND ◆</p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// TIGER REEF — Beach shack, waves, chalkboard
// ─────────────────────────────────────────────
function TigerReefPage({ r }: { r: (typeof RESTAURANTS)[0] }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#0a1f3a", color: "#e0f4ff" }}>
      {/* Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 40px", background: "rgba(10,31,58,0.92)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,180,216,0.2)" }}>
        <span style={{ color: "#00b4d8", fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>TIGER REEF 🐠</span>
        <div style={{ display: "flex", gap: 28 }}>
          {["Menu", "Vibe", "Find Us"].map(l => <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} style={{ color: "rgba(224,244,255,0.65)", fontSize: 13, textDecoration: "none" }}>{l}</a>)}
          <a href={`mailto:${r.email}`} style={{ background: "#00b4d8", color: "#0a1f3a", padding: "7px 18px", borderRadius: 20, fontSize: 12, fontWeight: 800, textDecoration: "none" }}>BOOK</a>
        </div>
      </div>

      {/* Hero with diagonal cut */}
      <div style={{
        minHeight: "100vh", paddingTop: 70, display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #051830 0%, #0a2d4a 50%, #0e3d6e 100%)",
        clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 60% 40%, rgba(0,180,216,0.15) 0%, transparent 50%)" }} />
        <div style={{ textAlign: "center", position: "relative", padding: "0 24px" }}>
          <p style={{ color: "#00b4d8", letterSpacing: "0.2em", fontSize: 12, marginBottom: 20, opacity: 0.8 }}>ATLANTIC BEACHFRONT · SWAKOPMUND</p>
          <h1 style={{ fontSize: "clamp(60px, 11vw, 120px)", fontWeight: 900, margin: 0, color: "#fff", letterSpacing: "-0.04em", lineHeight: 0.9, textTransform: "uppercase" }}>Tiger<br />Reef</h1>
          <p style={{ color: "rgba(224,244,255,0.55)", fontSize: 18, margin: "20px 0 0", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 300 }}>Beach Bar & Grill</p>
          <div style={{ width: 50, height: 3, background: "#00b4d8", margin: "28px auto", borderRadius: 2 }} />
          <p style={{ fontSize: 17, color: "rgba(224,244,255,0.8)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6, fontStyle: "italic", fontFamily: "Georgia, serif" }}>&ldquo;{r.heroQuote}&rdquo;</p>
          <div style={{ marginTop: 48, display: "flex", gap: 16, justifyContent: "center" }}>
            <a href="#menu" style={{ background: "#00b4d8", color: "#0a1f3a", padding: "13px 32px", borderRadius: 4, fontSize: 13, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>See The Menu</a>
            <a href="#find-us" style={{ border: "2px solid rgba(0,180,216,0.4)", color: "#00b4d8", padding: "13px 32px", borderRadius: 4, fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase" }}>Find Us</a>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div style={{ background: "#0f2b1e", marginTop: -2 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 80, marginTop: -40 }}>
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#0a1f3a" />
        </svg>
      </div>

      {/* Chalkboard menu */}
      <section id="menu" style={{ background: "#0f2b1e", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, margin: 0, color: "#e8f5e9", textTransform: "uppercase", letterSpacing: "0.05em" }}>Today&apos;s Board</h2>
            <p style={{ color: "rgba(232,245,233,0.4)", fontSize: 13, marginTop: 8 }}>Fresh. Cold. Just like the Atlantic.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 3, background: "#1a3a2a", padding: 3, borderRadius: 12 }}>
            {r.menu.map((section) => (
              <div key={section.category} style={{ background: "#162d20", padding: "28px", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, paddingBottom: 14, borderBottom: "1px dashed rgba(0,180,216,0.3)" }}>
                  <span style={{ fontSize: 22 }}>{section.icon}</span>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#7dd3e8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{section.category}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {section.items.map((item) => (
                    <div key={item.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#e8f5e9" }}>{item.name}</span>
                        {item.price && <span style={{ fontSize: 13, color: "#00b4d8", fontWeight: 700, whiteSpace: "nowrap" }}>{item.price}</span>}
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(232,245,233,0.5)", lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider 2 */}
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 60, background: "#0a1f3a" }}>
        <path d="M0,40 C360,0 1080,80 1440,40 L1440,0 L0,0 Z" fill="#0f2b1e" />
      </svg>

      {/* Vibe + Contact */}
      <section id="vibe" style={{ background: "#0a1f3a", padding: "60px 32px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "-0.02em" }}>The Vibe</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 40, flexWrap: "wrap" }}>
          {r.atmosphere.map(({ icon, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(224,244,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="find-us" style={{ background: "#051020", padding: "60px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {[["📍", "Atlantic Beachfront, Swakopmund"], ["📞", r.phone], ["📸", r.instagram]].map(([i, v]) => (
            <div key={v as string}><div style={{ fontSize: 26, marginBottom: 8 }}>{i}</div><p style={{ margin: 0, fontSize: 14, color: "rgba(224,244,255,0.7)" }}>{v as string}</p></div>
          ))}
        </div>
      </section>
      <footer style={{ background: "#020a12", padding: "24px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "rgba(0,180,216,0.4)", fontSize: 12, letterSpacing: "0.2em" }}>TIGER REEF BEACH BAR & GRILL · SWAKOPMUND, NAMIBIA</p>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// KÜCKI'S PUB — German tavern, ornate, amber
// ─────────────────────────────────────────────
function KuckisPage({ r }: { r: (typeof RESTAURANTS)[0] }) {
  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#1a0f00", color: "#fef3e2" }}>
      {/* Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 40px", background: "rgba(26,15,0,0.96)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(196,123,10,0.4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ color: "#c47b0a", fontWeight: 700, fontSize: 19, letterSpacing: "0.06em" }}>Kücki&apos;s Pub</span>
          <span style={{ color: "rgba(254,243,226,0.4)", fontSize: 12, marginLeft: 10, fontStyle: "italic" }}>est. Swakopmund</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Speisekarte", "Getränke", "Reservieren"].map(l => <a key={l} href="#menu" style={{ color: "rgba(254,243,226,0.6)", fontSize: 12, letterSpacing: "0.1em", textDecoration: "none" }}>{l}</a>)}
        </div>
      </div>

      {/* Hero */}
      <div style={{
        minHeight: "100vh", paddingTop: 70, display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at center, #3d2200 0%, #1a0f00 70%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 60%, rgba(196,123,10,0.15) 0%, transparent 60%)" }} />
        <div style={{ textAlign: "center", position: "relative", maxWidth: 700, padding: "0 32px" }}>
          {/* Ornate border frame */}
          <div style={{ border: "2px solid rgba(196,123,10,0.5)", padding: "52px 48px", position: "relative", boxShadow: "0 0 0 8px rgba(196,123,10,0.1), 0 0 0 10px rgba(196,123,10,0.05), inset 0 0 40px rgba(196,123,10,0.05)" }}>
            {/* Corner ornaments */}
            {["topleft", "topright", "bottomleft", "bottomright"].map(pos => (
              <div key={pos} style={{ position: "absolute", width: 20, height: 20, color: "#c47b0a", fontSize: 16, lineHeight: 1, [pos.includes("top") ? "top" : "bottom"]: -2, [pos.includes("left") ? "left" : "right"]: -2 }}>◆</div>
            ))}
            <p style={{ color: "#c47b0a", letterSpacing: "0.3em", fontSize: 11, marginBottom: 20, fontFamily: "system-ui" }}>SINCE 1983 · SWAKOPMUND</p>
            <h1 style={{ fontSize: "clamp(48px, 8vw, 88px)", fontWeight: 700, margin: 0, color: "#fef3e2", lineHeight: 1.05 }}>Kücki&apos;s Pub</h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "20px 0" }}>
              <div style={{ height: 1, width: 60, background: "#c47b0a" }} />
              <span style={{ color: "#c47b0a", fontSize: 16 }}>◆</span>
              <div style={{ height: 1, width: 60, background: "#c47b0a" }} />
            </div>
            <p style={{ color: "rgba(254,243,226,0.6)", fontSize: 15, margin: 0, fontStyle: "italic", lineHeight: 1.7 }}>{r.tagline}</p>
            <p style={{ color: "rgba(254,243,226,0.7)", fontSize: 15, margin: "24px 0 0", fontStyle: "italic", lineHeight: 1.75 }}>&ldquo;{r.heroQuote}&rdquo;</p>
            <div style={{ marginTop: 36, display: "flex", gap: 16, justifyContent: "center" }}>
              <a href="#menu" style={{ background: "#c47b0a", color: "#fff", padding: "12px 32px", border: "none", fontSize: 13, fontFamily: "system-ui", fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>DIE SPEISEKARTE</a>
              <a href="#reservieren" style={{ border: "1px solid rgba(196,123,10,0.5)", color: "#c47b0a", padding: "12px 32px", fontSize: 13, fontFamily: "system-ui", fontWeight: 600, textDecoration: "none", letterSpacing: "0.1em" }}>RESERVIERUNG</a>
            </div>
          </div>
        </div>
      </div>

      {/* Menu — formal printed style */}
      <section id="menu" style={{ background: "#fef8ec", padding: "80px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", border: "2px solid #c47b0a", padding: "6px 24px", marginBottom: 20 }}>
              <span style={{ color: "#c47b0a", fontFamily: "system-ui", fontSize: 11, letterSpacing: "0.3em", fontWeight: 700 }}>SPEISEKARTE</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, margin: 0, color: "#1a0f00" }}>The Menu</h2>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <div style={{ height: 1, width: 80, background: "#c47b0a" }} />
              <span style={{ color: "#c47b0a" }}>◆</span>
              <div style={{ height: 1, width: 80, background: "#c47b0a" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {r.menu.map((section) => (
              <div key={section.category} style={{ background: "#fff", padding: "32px", border: "1px solid #e8d5a0", boxShadow: "4px 4px 0 #c47b0a1a" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 17, color: "#1a0f00", borderBottom: "2px solid #c47b0a", paddingBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <span>{section.icon}</span> {section.category}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {section.items.map((item) => (
                    <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#2d1a00", display: "block" }}>{item.name}</span>
                        <span style={{ fontSize: 12, color: "#8b6914", fontStyle: "italic", lineHeight: 1.4, display: "block", marginTop: 3 }}>{item.desc}</span>
                      </div>
                      {item.price && <span style={{ fontSize: 13, fontWeight: 700, color: "#c47b0a", whiteSpace: "nowrap", fontFamily: "system-ui", flexShrink: 0 }}>{item.price}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit / Reservierung */}
      <section id="reservieren" style={{ background: "#1a0f00", padding: "80px 32px", textAlign: "center" }}>
        <div style={{ display: "inline-block", border: "1px solid rgba(196,123,10,0.4)", padding: "6px 24px", marginBottom: 20 }}>
          <span style={{ color: "#c47b0a", fontSize: 11, letterSpacing: "0.3em", fontFamily: "system-ui", fontWeight: 700 }}>BESUCHEN SIE UNS</span>
        </div>
        <h2 style={{ fontSize: 38, fontWeight: 700, color: "#fef3e2", margin: "0 0 40px" }}>Come for a cold one</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          {[["📍", "Town Centre, Swakopmund"], ["📞", r.phone], ["✉️", r.email]].map(([i, v]) => (
            <div key={v as string} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{i}</div>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(254,243,226,0.75)", fontFamily: "system-ui" }}>{v as string}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ background: "#0d0700", padding: "28px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ height: 1, width: 40, background: "#c47b0a", opacity: 0.4 }} />
          <p style={{ margin: 0, color: "rgba(196,123,10,0.5)", fontSize: 12, fontFamily: "system-ui", letterSpacing: "0.15em" }}>KÜCKI&apos;S PUB · SWAKOPMUND, NAMIBIA</p>
          <div style={{ height: 1, width: 40, background: "#c47b0a", opacity: 0.4 }} />
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// FARMHOUSE DELI — Editorial, minimal, magazine
// ─────────────────────────────────────────────
function FarmhousePage({ r }: { r: (typeof RESTAURANTS)[0] }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#fff", color: "#1a1a1a" }}>
      {/* Nav — clean thin line */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 48px", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Georgia', serif", fontWeight: 700, fontSize: 17, color: "#1a1a1a", letterSpacing: "0.02em" }}>Farmhouse Deli</span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Menu", "About", "Visit"].map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "#888", fontSize: 13, textDecoration: "none", letterSpacing: "0.05em" }}>{l}</a>)}
          <a href={`mailto:${r.email}`} style={{ border: "1px solid #1a1a1a", color: "#1a1a1a", padding: "7px 18px", fontSize: 12, fontWeight: 600, textDecoration: "none", letterSpacing: "0.08em" }}>RESERVE</a>
        </div>
      </div>

      {/* Hero — editorial split */}
      <div style={{ minHeight: "100vh", paddingTop: 54, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ background: "#2a4a2a", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 64px" }}>
          <div>
            <p style={{ color: "rgba(240,247,240,0.5)", letterSpacing: "0.25em", fontSize: 11, marginBottom: 24, textTransform: "uppercase" }}>The Mole · Swakopmund</p>
            <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(40px, 5vw, 68px)", fontWeight: 700, margin: 0, color: "#f0f7f0", lineHeight: 1.1 }}>Farmhouse<br />Deli</h1>
            <div style={{ width: 40, height: 2, background: "#7db87d", margin: "24px 0" }} />
            <p style={{ color: "rgba(240,247,240,0.7)", fontSize: 16, lineHeight: 1.75, fontStyle: "italic", maxWidth: 380, margin: 0, fontFamily: "'Georgia', serif" }}>&ldquo;{r.heroQuote}&rdquo;</p>
            <div style={{ marginTop: 40, display: "flex", gap: 14 }}>
              <a href="#menu" style={{ background: "#7db87d", color: "#fff", padding: "12px 28px", fontSize: 12, fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>SEE MENU</a>
              <a href="#visit" style={{ border: "1px solid rgba(125,184,125,0.5)", color: "#7db87d", padding: "12px 28px", fontSize: 12, fontWeight: 600, textDecoration: "none", letterSpacing: "0.1em" }}>FIND US</a>
            </div>
          </div>
        </div>
        <div style={{ background: "#f5f7f5", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 64px", gap: 28 }}>
          {r.highlights.map((h) => (
            <div key={h.title} style={{ display: "flex", gap: 20, alignItems: "flex-start", paddingBottom: 28, borderBottom: "1px solid #e8e8e8" }}>
              <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{h.icon}</div>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Georgia', serif" }}>{h.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#666", lineHeight: 1.6 }}>{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu — clean editorial columns */}
      <section id="menu" style={{ background: "#fff", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 52, borderBottom: "2px solid #1a1a1a", paddingBottom: 20, display: "flex", alignItems: "baseline", gap: 20 }}>
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, margin: 0 }}>Our Menu</h2>
            <p style={{ color: "#888", fontSize: 14, margin: 0, fontStyle: "italic" }}>Changes seasonally · Ask about today&apos;s specials</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0 64px" }}>
            {r.menu.map((section, idx) => (
              <div key={section.category} style={{ paddingTop: idx >= 2 ? 40 : 0, paddingBottom: 40, borderBottom: idx < 2 ? "1px solid #e8e8e8" : "none" }}>
                <h3 style={{ margin: "0 0 24px", fontSize: 13, color: "#7db87d", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{section.icon}</span> {section.category}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {section.items.map((item) => (
                    <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                      <div>
                        <span style={{ fontFamily: "'Georgia', serif", fontWeight: 600, fontSize: 15, color: "#1a1a1a", display: "block" }}>{item.name}</span>
                        <span style={{ fontSize: 12, color: "#999", lineHeight: 1.5, display: "block", marginTop: 3, fontStyle: "italic" }}>{item.desc}</span>
                      </div>
                      {item.price && <span style={{ fontSize: 13, fontWeight: 600, color: "#7db87d", whiteSpace: "nowrap", flexShrink: 0 }}>{item.price}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About + Visit */}
      <section id="about" style={{ background: "#f5f7f5", padding: "80px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div>
            <p style={{ color: "#7db87d", letterSpacing: "0.2em", fontSize: 11, textTransform: "uppercase", marginBottom: 16 }}>Our story</p>
            {r.about.map((p, i) => <p key={i} style={{ fontSize: 16, lineHeight: 1.85, color: "#444", margin: i === 0 ? "0 0 16px" : 0, fontFamily: "'Georgia', serif" }}>{p}</p>)}
          </div>
          <div id="visit">
            <p style={{ color: "#7db87d", letterSpacing: "0.2em", fontSize: 11, textTransform: "uppercase", marginBottom: 16 }}>Find us</p>
            {[["📍", "Location", r.location], ["📞", "Phone", r.phone], ["✉️", "Email", r.email], ["📸", "Instagram", r.instagram]].map(([i, l, v]) => (
              <div key={l as string} style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{i}</span>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" }}>{l as string}</p>
                  <p style={{ margin: 0, fontSize: 14, color: "#1a1a1a", fontWeight: 500 }}>{v as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer style={{ background: "#2a4a2a", padding: "28px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Georgia', serif", color: "rgba(240,247,240,0.7)", fontSize: 14, fontWeight: 700 }}>Farmhouse Deli</span>
        <span style={{ color: "rgba(240,247,240,0.4)", fontSize: 12 }}>Café & Artisan Deli · Swakopmund, Namibia</span>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// BRAUHAUS — Industrial brewery, bold, copper
// ─────────────────────────────────────────────
function BrauhausPage({ r }: { r: (typeof RESTAURANTS)[0] }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#080e14", color: "#fef9ec" }}>
      {/* Nav */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 48px", background: "rgba(8,14,20,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(212,160,23,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22 }}>🍺</span>
          <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: "0.2em", color: "#d4a017", textTransform: "uppercase" }}>Swakopmund Brauhaus</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["Biere", "Speisen", "Besuchen"].map(l => <a key={l} href="#menu" style={{ color: "rgba(254,249,236,0.5)", fontSize: 12, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>{l}</a>)}
          <a href={`mailto:${r.email}`} style={{ background: "#d4a017", color: "#080e14", padding: "8px 20px", fontSize: 11, fontWeight: 900, textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>RESERVIEREN</a>
        </div>
      </div>

      {/* Hero — MASSIVE type, industrial */}
      <div style={{
        minHeight: "100vh", paddingTop: 70, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end",
        background: "linear-gradient(to top right, #080e14 0%, #0d1b2a 40%, #1a2e40 100%)",
        padding: "0 0 80px 80px", position: "relative", overflow: "hidden",
      }}>
        {/* Copper circle watermark */}
        <div style={{ position: "absolute", right: -100, top: "50%", transform: "translateY(-50%)", width: 600, height: 600, borderRadius: "50%", border: "2px solid rgba(212,160,23,0.08)", boxShadow: "0 0 0 40px rgba(212,160,23,0.04), 0 0 0 80px rgba(212,160,23,0.02)" }} />
        <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", fontSize: 200, opacity: 0.06 }}>🍺</div>
        <div style={{ position: "relative" }}>
          <p style={{ color: "#d4a017", letterSpacing: "0.35em", fontSize: 11, marginBottom: 20, textTransform: "uppercase" }}>Swakopmund · Est. 1990 · Microbrewery</p>
          <h1 style={{ fontSize: "clamp(60px, 12vw, 140px)", fontWeight: 900, margin: 0, lineHeight: 0.85, letterSpacing: "-0.04em", textTransform: "uppercase", color: "#fef9ec" }}>
            Brau<br /><span style={{ color: "#d4a017" }}>Haus</span>
          </h1>
          <p style={{ color: "rgba(254,249,236,0.4)", fontSize: 16, margin: "24px 0 0", letterSpacing: "0.2em", textTransform: "uppercase" }}>Microbrewery & Restaurant</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "12px 0 0" }}>
            <div style={{ width: 60, height: 2, background: "#d4a017" }} />
            <p style={{ margin: 0, color: "rgba(254,249,236,0.6)", fontSize: 15, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>&ldquo;{r.heroQuote}&rdquo;</p>
          </div>
          <div style={{ marginTop: 44, display: "flex", gap: 16 }}>
            <a href="#menu" style={{ background: "#d4a017", color: "#080e14", padding: "14px 40px", fontSize: 13, fontWeight: 900, textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase" }}>SPEISEKARTE</a>
            <a href="#besuchen" style={{ border: "1px solid rgba(212,160,23,0.4)", color: "#d4a017", padding: "14px 40px", fontSize: 13, fontWeight: 700, textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase" }}>BESUCHEN</a>
          </div>
        </div>
      </div>

      {/* Beer showcase */}
      <div style={{ background: "#0d1520", padding: "60px 48px", borderTop: "1px solid rgba(212,160,23,0.15)", borderBottom: "1px solid rgba(212,160,23,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ color: "rgba(254,249,236,0.3)", letterSpacing: "0.3em", fontSize: 10, textTransform: "uppercase", marginBottom: 28, textAlign: "center" }}>BREWED ON PREMISES</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            {[
              { name: "Swakop Lager", style: "Crisp Pilsner", abv: "4.8%", color: "#f5c842" },
              { name: "Dune Weissbier", style: "Wheat Beer", abv: "5.2%", color: "#d4a017" },
              { name: "Dark Tide Dunkel", style: "Dark Ale", abv: "6.1%", color: "#8b4513" },
            ].map(beer => (
              <div key={beer.name} style={{ background: "#141e2a", padding: "32px 28px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: beer.color, margin: "0 auto 16px", opacity: 0.85 }} />
                <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 900, color: "#fef9ec", textTransform: "uppercase", letterSpacing: "0.05em" }}>{beer.name}</h3>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#d4a017", letterSpacing: "0.15em" }}>{beer.style}</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(254,249,236,0.4)" }}>{beer.abv} ABV</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <section id="menu" style={{ background: "#080e14", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 52, borderBottom: "1px solid rgba(212,160,23,0.2)", paddingBottom: 20 }}>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 900, margin: 0, textTransform: "uppercase", letterSpacing: "-0.02em" }}>SPEISEKARTE</h2>
            <span style={{ color: "rgba(254,249,236,0.3)", fontSize: 13, letterSpacing: "0.1em" }}>THE MENU</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}>
            {r.menu.map((section) => (
              <div key={section.category} style={{ background: "#0d1520", padding: "28px", borderLeft: "3px solid #d4a017" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 13, color: "#d4a017", letterSpacing: "0.2em", textTransform: "uppercase", paddingBottom: 14, borderBottom: "1px solid rgba(212,160,23,0.15)", display: "flex", gap: 8, alignItems: "center" }}>
                  <span>{section.icon}</span> {section.category}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {section.items.map((item) => (
                    <div key={item.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#fef9ec" }}>{item.name}</span>
                        {item.price && <span style={{ fontSize: 13, color: "#d4a017", fontWeight: 700, whiteSpace: "nowrap" }}>{item.price}</span>}
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(254,249,236,0.4)", lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="besuchen" style={{ background: "#0d1520", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ color: "#d4a017", letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", marginBottom: 16 }}>BESUCHEN SIE UNS</p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 0.9 }}>COME<br /><span style={{ color: "#d4a017" }}>THIRSTY</span></h2>
            <p style={{ color: "rgba(254,249,236,0.6)", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{r.about[0]}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[["📍", "Address", r.location], ["📞", "Phone", r.phone], ["✉️", "Email", r.email]].map(([i, l, v]) => (
              <div key={l as string} style={{ display: "flex", gap: 16, paddingBottom: 20, borderBottom: "1px solid rgba(212,160,23,0.1)", alignItems: "center" }}>
                <span style={{ fontSize: 24, width: 40, textAlign: "center", flexShrink: 0 }}>{i}</span>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 10, color: "#d4a017", letterSpacing: "0.2em", textTransform: "uppercase" }}>{l as string}</p>
                  <p style={{ margin: 0, fontSize: 14, color: "rgba(254,249,236,0.8)" }}>{v as string}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer style={{ background: "#040810", padding: "28px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(212,160,23,0.1)" }}>
        <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.2em", color: "#d4a017", textTransform: "uppercase" }}>Swakopmund Brauhaus</span>
        <span style={{ color: "rgba(254,249,236,0.25)", fontSize: 12 }}>Microbrewery & Restaurant · Swakopmund, Namibia</span>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROUTER — picks design system per restaurant
// ─────────────────────────────────────────────
export default function RestaurantPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const r = RESTAURANTS.find((x) => x.slug === slug);
  if (!r) return <div style={{ padding: 40, fontFamily: "system-ui" }}>Restaurant not found.</div>;

  if (slug === "hafeni") return <HafeniPage r={r} />;
  if (slug === "tiger-reef") return <TigerReefPage r={r} />;
  if (slug === "kuckis-pub") return <KuckisPage r={r} />;
  if (slug === "farmhouse-deli") return <FarmhousePage r={r} />;
  if (slug === "brauhaus") return <BrauhausPage r={r} />;

  return <div style={{ padding: 40 }}>Coming soon.</div>;
}
