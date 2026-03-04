"use client";

import { useState, useEffect } from "react";

const NAV_LINKS = ["About", "Menu", "Atmosphere", "Contact"];

const MENU = [
  {
    category: "Starters",
    icon: "🥗",
    items: [
      { name: "Namibian Oysters", desc: "Fresh from Lüderitz Bay, shallot vinaigrette, lemon", price: "N$85" },
      { name: "Smoked Snoek Pâté", desc: "House-smoked fish, warm toast, caperberries", price: "N$75" },
      { name: "Soup of the Day", desc: "Ask your server for today's catch", price: "N$60" },
    ],
  },
  {
    category: "From the Sea",
    icon: "🐟",
    items: [
      { name: "Grilled Kabeljou", desc: "Whole or fillet, lemon butter, seasonal vegetables", price: "N$220" },
      { name: "Seafood Platter", desc: "Lobster, prawns, mussels, calamari — for two", price: "N$680" },
      { name: "Calamari", desc: "Lightly dusted, sweet chilli dip, garden salad", price: "N$135" },
    ],
  },
  {
    category: "From the Grill",
    icon: "🥩",
    items: [
      { name: "Namibian Beef Fillet", desc: "300g, creamy mushroom sauce, hand-cut fries", price: "N$265" },
      { name: "Lamb Rack", desc: "Karoo-style, rosemary jus, roasted root vegetables", price: "N$295" },
      { name: "Chicken Supreme", desc: "Free-range, lemon herb butter, potato gratin", price: "N$175" },
    ],
  },
  {
    category: "Wine Bar",
    icon: "🍷",
    items: [
      { name: "Curated South African Cellar", desc: "Constantia, Stellenbosch & Swartland selections", price: "" },
      { name: "Wines by the Glass", desc: "Ask about today's open bottles", price: "from N$65" },
      { name: "Sundowner Board", desc: "Charcuterie, local cheeses, preserves & crackers", price: "N$195" },
    ],
  },
];

const HIGHLIGHTS = [
  { icon: "🌊", title: "Coastal Namibia", desc: "Seafood caught fresh from the cold Benguela Current — the same water that makes Namibian oysters world-class." },
  { icon: "🍷", title: "Wine Bar", desc: "A carefully curated cellar featuring South Africa's finest estates, served by staff who actually know their grapes." },
  { icon: "🌿", title: "Locally Sourced", desc: "From Namibian beef to Lüderitz oysters — we work with local producers who share our standard." },
  { icon: "👨‍👩‍👧", title: "Family Friendly", desc: "A warm, relaxed atmosphere where everyone from toddlers to grandparents feels at home." },
];

export default function AnkerplatzPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#fdf8f0", color: "#1a1a1a" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10,20,40,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
          padding: scrolled ? "14px 40px" : "24px 40px",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 22 }}>⚓</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: "0.05em" }}>ANKERPLATZ</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, letterSpacing: "0.08em", textDecoration: "none", fontFamily: "system-ui, sans-serif" }}
                className="hover:text-white transition-colors"
              >
                {l.toUpperCase()}
              </a>
            ))}
            <a
              href="mailto:ankerplatzrestaurant@gmail.com"
              style={{
                background: "#d97706",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 6,
                fontSize: 13,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "0.06em",
              }}
            >
              RESERVE
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0a1428 0%, #0e2d4a 40%, #0f3d5c 70%, #1a5276 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle wave pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(14,116,144,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(217,119,6,0.08) 0%, transparent 50%)",
        }} />

        {/* Anchor watermark */}
        <div style={{ position: "absolute", fontSize: 400, opacity: 0.03, userSelect: "none", pointerEvents: "none" }}>⚓</div>

        <div style={{ position: "relative", textAlign: "center", padding: "0 24px" }}>
          <p style={{ color: "#d97706", letterSpacing: "0.3em", fontSize: 13, fontFamily: "system-ui, sans-serif", marginBottom: 20 }}>
            SWAKOPMUND, NAMIBIA
          </p>
          <h1 style={{ color: "#fff", fontSize: "clamp(52px, 8vw, 96px)", fontWeight: 700, margin: 0, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
            Ankerplatz
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(16px, 2.5vw, 22px)", margin: "16px 0 0", letterSpacing: "0.15em", fontStyle: "italic" }}>
            Restaurant &amp; Wine Bar
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, margin: "28px auto 0", maxWidth: 480, lineHeight: 1.6, fontStyle: "italic" }}>
            &ldquo;Where the Namib meets the sea — and the table is always set.&rdquo;
          </p>
          <div style={{ marginTop: 48, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="mailto:ankerplatzrestaurant@gmail.com"
              style={{
                background: "#d97706",
                color: "#fff",
                padding: "14px 36px",
                borderRadius: 8,
                fontSize: 15,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.08em",
              }}
            >
              MAKE A RESERVATION
            </a>
            <a
              href="#menu"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "14px 36px",
                borderRadius: 8,
                fontSize: 15,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "0.08em",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              VIEW MENU
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 24, animation: "bounce 2s infinite" }}>
          ↓
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" style={{ background: "#fff", padding: "100px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#d97706", letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>OUR STORY</p>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, margin: "0 0 28px", color: "#0a1428", lineHeight: 1.15 }}>
            Your anchor in Swakopmund
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.85, color: "#444", margin: "0 0 20px" }}>
            Tucked into the heart of Swakopmund, Ankerplatz is the kind of place you find once and return to three times. Named after the German word for <em>anchorage</em>, it&apos;s exactly that — a place to stop, breathe, and eat something genuinely good.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.85, color: "#444", margin: 0 }}>
            The kitchen runs on fresh, locally-sourced ingredients — Namibian beef, Lüderitz oysters, Atlantic fish pulled from the cold Benguela Current just kilometres away. The wine bar pairs it all with South Africa&apos;s finest. The staff know what they&apos;re serving and why it matters.
          </p>
        </div>

        {/* Highlights */}
        <div style={{ maxWidth: 1000, margin: "72px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 32 }}>
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} style={{ textAlign: "center", padding: "32px 20px", borderRadius: 16, background: "#fdf8f0", border: "1px solid #f0e8d8" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{h.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 10px", color: "#0a1428", fontFamily: "system-ui, sans-serif" }}>{h.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#666", margin: 0, fontFamily: "system-ui, sans-serif" }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Menu ── */}
      <section id="menu" style={{ background: "#fdf8f0", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#d97706", letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>WHAT WE SERVE</p>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, margin: 0, color: "#0a1428" }}>The Menu</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
            {MENU.map((section) => (
              <div key={section.category} style={{ background: "#fff", borderRadius: 16, padding: "32px", border: "1px solid #e8dfc8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f0e8d8" }}>
                  <span style={{ fontSize: 28 }}>{section.icon}</span>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0a1428", fontFamily: "system-ui, sans-serif" }}>{section.category}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {section.items.map((item) => (
                    <div key={item.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>{item.name}</span>
                        {item.price && <span style={{ fontSize: 13, fontWeight: 700, color: "#d97706", whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif" }}>{item.price}</span>}
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#777", lineHeight: 1.5, fontFamily: "system-ui, sans-serif" }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 48, color: "#999", fontSize: 14, fontFamily: "system-ui, sans-serif", fontStyle: "italic" }}>
            Menu changes seasonally. Ask your server about today&apos;s specials.
          </p>
        </div>
      </section>

      {/* ── Atmosphere ── */}
      <section id="atmosphere" style={{ background: "linear-gradient(135deg, #0a1428 0%, #0e2d4a 100%)", padding: "100px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#d97706", letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>THE EXPERIENCE</p>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, margin: "0 0 32px" }}>More than a meal</h2>
          <p style={{ fontSize: 19, lineHeight: 1.85, color: "rgba(255,255,255,0.75)", maxWidth: 680, margin: "0 auto 48px", fontStyle: "italic" }}>
            &ldquo;We returned 3 times. The staff are professional, knowledgeable about what they serve. Food quality excellent, fresh and well-presented. Prices are fair.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, sans-serif", letterSpacing: "0.1em" }}>— TRIPADVISOR REVIEW</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, flexWrap: "wrap" }}>
            {[["🌅", "Outdoor Seating"], ["🪑", "Dine-in"], ["🍾", "Special Occasions"], ["👨‍👩‍👧", "Family Welcome"]].map(([icon, label]) => (
              <div key={label as string} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui, sans-serif", letterSpacing: "0.08em" }}>{label as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" style={{ background: "#fff", padding: "100px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#d97706", letterSpacing: "0.25em", fontSize: 12, fontFamily: "system-ui, sans-serif", marginBottom: 16 }}>FIND US</p>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700, margin: 0, color: "#0a1428" }}>Come visit</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, maxWidth: 800, margin: "0 auto" }}>
            {[
              { icon: "📍", label: "Location", value: "Swakopmund, Namibia", sub: "Town centre" },
              { icon: "📞", label: "Phone", value: "+264 81 398 9625", sub: "Call to reserve" },
              { icon: "✉️", label: "Email", value: "ankerplatzrestaurant\n@gmail.com", sub: "We reply same day" },
              { icon: "📸", label: "Instagram", value: "@ankerplatz", sub: "Follow for daily specials" },
            ].map((c) => (
              <div key={c.label} style={{ textAlign: "center", padding: "32px 20px", borderRadius: 16, background: "#fdf8f0", border: "1px solid #f0e8d8" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{c.icon}</div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#999", letterSpacing: "0.15em", fontFamily: "system-ui, sans-serif" }}>{c.label.toUpperCase()}</p>
                <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0a1428", fontFamily: "system-ui, sans-serif", whiteSpace: "pre-line" }}>{c.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa", fontFamily: "system-ui, sans-serif" }}>{c.sub}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <a
              href="mailto:ankerplatzrestaurant@gmail.com"
              style={{
                background: "#0a1428",
                color: "#fff",
                padding: "16px 48px",
                borderRadius: 8,
                fontSize: 15,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.1em",
                display: "inline-block",
              }}
            >
              MAKE A RESERVATION
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0a1428", color: "rgba(255,255,255,0.4)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 18 }}>⚓</span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 16, letterSpacing: "0.1em" }}>ANKERPLATZ</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, fontFamily: "system-ui, sans-serif" }}>
          Restaurant &amp; Wine Bar · Swakopmund, Namibia
        </p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
