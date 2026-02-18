export default function Sam({ hover }: { hover: boolean }) {
  const c = "#3b82f6";
  const skin = "#d4a574";
  const hair = "#1a1a1a";
  const shirt = "#1e3a5f";
  return (
    <svg viewBox="0 0 220 160" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="samScreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.08" />
          <stop offset="100%" stopColor={c} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Standing desk */}
      <rect x="20" y="98" width="180" height="8" rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      {/* Desk legs (tall - standing) */}
      <rect x="28" y="106" width="5" height="28" rx="1" fill="#1a1a1a" />
      <rect x="187" y="106" width="5" height="28" rx="1" fill="#1a1a1a" />

      {/* Dual monitors */}
      <rect x="40" y="58" width="48" height="36" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="44" y="62" width="40" height="28" rx="2" fill={hover ? "url(#samScreen)" : "#0a0a0a"} />
      <rect x="100" y="58" width="48" height="36" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="104" y="62" width="40" height="28" rx="2" fill={hover ? "url(#samScreen)" : "#0a0a0a"} />
      {/* Monitor stands */}
      <rect x="59" y="94" width="10" height="4" rx="1" fill="#1a1a1a" />
      <rect x="119" y="94" width="10" height="4" rx="1" fill="#1a1a1a" />
      {/* Dashboard lines on screens */}
      <rect x="48" y="66" width="16" height="2" rx="1" fill={c} fillOpacity="0.4" />
      <rect x="48" y="71" width="28" height="2" rx="1" fill={c} fillOpacity="0.25" />
      <rect x="48" y="76" width="20" height="2" rx="1" fill={c} fillOpacity="0.15" />
      <rect x="108" y="66" width="24" height="10" rx="2" fill={c} fillOpacity="0.08" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" />
      <rect x="108" y="80" width="14" height="2" rx="1" fill={c} fillOpacity="0.2" />

      {/* ─── Sam Character (standing) ─── */}
      <g transform="translate(68, -5)">
        {/* Body - sharp blazer/button-up */}
        <path d="M25 58 Q25 48 42 46 Q59 48 59 58 V92 Q59 96 42 96 Q25 96 25 92Z" fill={shirt} stroke="#2a4a6f" strokeWidth="1" />
        {/* Collar / lapels */}
        <path d="M34 48 L38 56 L42 48" stroke="#6b9bd2" strokeWidth="0.8" fill="none" />
        <path d="M50 48 L46 56 L42 48" stroke="#6b9bd2" strokeWidth="0.8" fill="none" />
        {/* Button line */}
        <circle cx="42" cy="60" r="1" fill="#6b9bd2" fillOpacity="0.4" />
        <circle cx="42" cy="68" r="1" fill="#6b9bd2" fillOpacity="0.4" />
        <circle cx="42" cy="76" r="1" fill="#6b9bd2" fillOpacity="0.4" />

        {/* Neck */}
        <rect x="37" y="40" width="10" height="8" rx="3" fill={skin} />

        {/* Head */}
        <ellipse cx="42" cy="28" rx="16" ry="18" fill={skin} />
        {/* Clean short hair */}
        <path d="M26 24 Q24 10 35 6 Q42 4 49 6 Q58 10 58 24 Q56 20 52 18 Q42 14 32 18 Q28 20 26 24" fill={hair} />
        {/* Clean fade on sides */}
        <path d="M26 24 Q26 28 27 30" stroke={hair} strokeWidth="1.5" fill="none" />
        <path d="M58 24 Q58 28 57 30" stroke={hair} strokeWidth="1.5" fill="none" />

        {/* Eyes - confident */}
        <ellipse cx="35" cy="28" rx="3" ry="3" fill="white" />
        <ellipse cx="49" cy="28" rx="3" ry="3" fill="white" />
        <circle cx="36" cy="28" r="2" fill="#2c1810" />
        <circle cx="50" cy="28" r="2" fill="#2c1810" />
        <circle cx="36.5" cy="27.5" r="0.8" fill="white" />
        <circle cx="50.5" cy="27.5" r="0.8" fill="white" />
        {/* Strong eyebrows */}
        <path d="M31 23 Q35 21 39 23" stroke={hair} strokeWidth="1.5" fill="none" />
        <path d="M45 23 Q49 21 53 23" stroke={hair} strokeWidth="1.5" fill="none" />
        {/* Nose */}
        <path d="M42 31 Q40 34 42 35" stroke="#c08a5a" strokeWidth="0.8" fill="none" />
        {/* Confident smile */}
        <path d="M35 38 Q42 42 49 38" stroke="#b07a50" strokeWidth="1.2" strokeLinecap="round" fill="none" />

        {/* Right arm - holding tablet */}
        <path d="M59 54 Q68 58 66 72" stroke={shirt} strokeWidth="8" strokeLinecap="round" fill="none" />
        <circle cx="66" cy="74" r="4.5" fill={skin} />
        {/* Tablet in hand */}
        <rect x="58" y="68" width="20" height="28" rx="3" fill="#222" stroke={c} strokeWidth="0.8" strokeOpacity="0.3" />
        <rect x="61" y="71" width="14" height="20" rx="1.5" fill={c} fillOpacity="0.06" />
        <rect x="63" y="74" width="8" height="1.5" rx="0.5" fill={c} fillOpacity="0.3" />
        <rect x="63" y="78" width="10" height="1.5" rx="0.5" fill={c} fillOpacity="0.2" />
        <rect x="63" y="82" width="6" height="1.5" rx="0.5" fill={c} fillOpacity="0.15" />

        {/* Left arm */}
        <path d="M25 54 Q16 58 18 72" stroke={shirt} strokeWidth="8" strokeLinecap="round" fill="none" />
        <circle cx="18" cy="74" r="4.5" fill={skin} />

        {/* Legs (standing) */}
        <rect x="30" y="94" width="10" height="22" rx="4" fill="#1e293b" />
        <rect x="44" y="94" width="10" height="22" rx="4" fill="#1e293b" />
        {/* Shoes */}
        <ellipse cx="35" cy="117" rx="7" ry="3" fill="#111" />
        <ellipse cx="49" cy="117" rx="7" ry="3" fill="#111" />

        {/* Signal indicator above head */}
        <circle cx="42" cy="6" r="3" fill={c} fillOpacity="0.5" filter="url(#benGlow)">
          <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="42" cy="6" r="7" fill="none" stroke={c} strokeWidth="0.6" strokeOpacity="0.15">
          <animate attributeName="r" values="7;12;7" dur="3s" repeatCount="indefinite" />
          <animate attributeName="strokeOpacity" values="0.15;0;0.15" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Breathing */}
        <animateTransform attributeName="transform" type="translate" values="68,-5;68,-4;68,-5" dur="3.5s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}
