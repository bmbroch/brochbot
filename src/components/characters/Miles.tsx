export default function Miles({ hover }: { hover: boolean }) {
  const c = "#f97316";
  const skin = "#e8b88a";
  const hair = "#d4a574";
  const top = "#7c2d12";
  return (
    <svg viewBox="0 0 220 160" fill="none" className="w-full h-full">
      {/* Desk */}
      <rect x="10" y="105" width="140" height="8" rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="18" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />
      <rect x="140" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />

      {/* Whiteboard on wall */}
      <rect x="145" y="10" width="68" height="80" rx="4" fill="#fafafa" fillOpacity="0.04" stroke="#444" strokeWidth="1.5" />
      <rect x="148" y="14" width="62" height="72" rx="2" fill="white" fillOpacity="0.02" />
      {/* Whiteboard scribbles */}
      <path d="M155 24 Q170 20 180 28" stroke={c} strokeWidth="1.2" fill="none" strokeOpacity="0.4" />
      <path d="M155 34 h30" stroke="#666" strokeWidth="0.8" strokeOpacity="0.3" />
      <path d="M155 40 h22" stroke="#666" strokeWidth="0.8" strokeOpacity="0.2" />
      <rect x="155" y="50" width="20" height="14" rx="2" fill={c} fillOpacity="0.06" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" />
      <rect x="180" y="50" width="20" height="14" rx="2" fill="#3b82f6" fillOpacity="0.06" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.2" />
      <text x="165" y="60" textAnchor="middle" fill={c} fontSize="6" fillOpacity="0.4" fontFamily="Inter, sans-serif">Q1</text>
      <text x="190" y="60" textAnchor="middle" fill="#3b82f6" fontSize="6" fillOpacity="0.4" fontFamily="Inter, sans-serif">Q2</text>
      {/* Arrow */}
      <path d="M160 70 L195 70" stroke={c} strokeWidth="1" strokeOpacity="0.3" markerEnd="url(#arrow)" />
      <text x="178" y="80" textAnchor="middle" fill={c} fontSize="5" fillOpacity="0.3" fontFamily="Inter, sans-serif">LAUNCH 🚀</text>

      {/* Monitor */}
      <rect x="60" y="62" width="50" height="36" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="64" y="66" width="42" height="28" rx="2" fill={hover ? "#1a120a" : "#0a0a0a"} />
      <rect x="80" y="98" width="10" height="7" rx="1" fill="#1a1a1a" />
      {/* Rocket sticker on laptop/monitor */}
      <path d="M100 90 L97 96 L100 94 L103 96 Z" fill={c} fillOpacity="0.5" />

      {/* Sticky notes on wall */}
      <rect x="10" y="18" width="22" height="22" rx="2" fill="#eab308" fillOpacity="0.06" stroke="#eab308" strokeWidth="0.5" strokeOpacity="0.2" />
      <rect x="36" y="24" width="22" height="22" rx="2" fill={c} fillOpacity="0.06" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" />
      <rect x="18" y="48" width="22" height="22" rx="2" fill="#ec4899" fillOpacity="0.06" stroke="#ec4899" strokeWidth="0.5" strokeOpacity="0.2" />

      {/* ─── Miles Character (energetic, pointing at whiteboard) ─── */}
      <g transform="translate(55, 2)">
        {/* Chair pushed back (he's half-standing) */}
        <ellipse cx="30" cy="102" rx="20" ry="4" fill="#292524" />

        {/* Body - casual tee */}
        <path d="M16 56 Q16 46 32 44 Q48 46 48 56 V84 Q48 88 32 88 Q16 88 16 84Z" fill={top} stroke="#9a3412" strokeWidth="1" />

        {/* Neck */}
        <rect x="27" y="38" width="10" height="8" rx="3" fill={skin} />

        {/* Head */}
        <ellipse cx="32" cy="24" rx="15" ry="17" fill={skin} />
        {/* Spiky/textured blonde-ish hair */}
        <path d="M17 20 Q15 6 26 2 Q32 0 38 2 Q47 6 47 20" fill={hair} />
        <path d="M20 8 L18 2" stroke={hair} strokeWidth="2" strokeLinecap="round" />
        <path d="M28 4 L26 -2" stroke={hair} strokeWidth="2" strokeLinecap="round" />
        <path d="M36 4 L38 -2" stroke={hair} strokeWidth="2" strokeLinecap="round" />
        <path d="M44 8 L46 2" stroke={hair} strokeWidth="2" strokeLinecap="round" />

        {/* Eyes - wide, excited */}
        <ellipse cx="25" cy="24" rx="3.5" ry="3.8" fill="white" />
        <ellipse cx="39" cy="24" rx="3.5" ry="3.8" fill="white" />
        <circle cx="26" cy="24" r="2.2" fill="#5b6b2a" />
        <circle cx="40" cy="24" r="2.2" fill="#5b6b2a" />
        <circle cx="26.5" cy="23.5" r="0.9" fill="white" />
        <circle cx="40.5" cy="23.5" r="0.9" fill="white" />
        {/* Raised excited eyebrows */}
        <path d="M21 18 Q25 16 29 18" stroke={hair} strokeWidth="1.3" fill="none" />
        <path d="M35 18 Q39 16 43 18" stroke={hair} strokeWidth="1.3" fill="none" />
        {/* Nose */}
        <path d="M32 27 Q30 30 32 31" stroke="#d4a070" strokeWidth="0.7" fill="none" />
        {/* Big excited grin */}
        <path d="M24 34 Q32 42 40 34" stroke="#c08a60" strokeWidth="1.3" strokeLinecap="round" fill="none" />
        <path d="M26 35 Q32 39 38 35" fill="white" fillOpacity="0.3" />

        {/* Right arm - pointing at whiteboard! */}
        <path d="M48 52 Q62 42 80 30" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="82" cy="28" r="4" fill={skin} />
        {/* Pointing finger */}
        <line x1="84" y1="26" x2="92" y2="22" stroke={skin} strokeWidth="3" strokeLinecap="round" />

        {/* Left arm - on hip (confident) */}
        <path d="M16 56 Q6 62 10 74" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="10" cy="76" r="4" fill={skin} />

        {/* Legs - standing */}
        <rect x="20" y="86" width="10" height="20" rx="4" fill="#44403c" />
        <rect x="34" y="86" width="10" height="20" rx="4" fill="#44403c" />
        <ellipse cx="25" cy="107" rx="7" ry="3" fill="#292524" />
        <ellipse cx="39" cy="107" rx="7" ry="3" fill="#292524" />

        <animateTransform attributeName="transform" type="translate" values="55,2;55,3;55,2" dur="3.2s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}
