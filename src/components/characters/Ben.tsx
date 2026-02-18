export default function Ben({ hover }: { hover: boolean }) {
  const c = "#f59e0b";
  const skin = "#e8b88a";
  const hair = "#4a3728";
  const hoodie = "#374151";
  return (
    <svg viewBox="0 0 220 160" fill="none" className="w-full h-full">
      <defs>
        <radialGradient id="benLamp" cx="30%" cy="40%">
          <stop offset="0%" stopColor={c} stopOpacity="0.12" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </radialGradient>
        <filter id="benGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* L-shaped corner desk */}
      <path d="M10 105 h200 v10 h-200z" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      <path d="M180 60 h10 v55 h-10z" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      {/* Desk legs */}
      <rect x="15" y="115" width="4" height="18" rx="1" fill="#1a1a1a" />
      <rect x="200" y="115" width="4" height="18" rx="1" fill="#1a1a1a" />

      {/* CEO nameplate */}
      <rect x="90" y="97" width="40" height="8" rx="2" fill="#292524" stroke={c} strokeWidth="0.5" strokeOpacity="0.4" />
      <text x="110" y="104" textAnchor="middle" fill={c} fontSize="5" fontWeight="600" fontFamily="Inter, sans-serif" fillOpacity="0.7">CEO</text>

      {/* Monitor */}
      <rect x="120" y="64" width="50" height="36" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="124" y="68" width="42" height="28" rx="2" fill={hover ? "#1a150a" : "#0a0a0a"} />
      {/* Monitor stand */}
      <rect x="140" y="100" width="10" height="5" rx="1" fill="#1a1a1a" />
      {/* Screen content */}
      <rect x="128" y="72" width="18" height="2" rx="1" fill={c} fillOpacity="0.3" />
      <rect x="128" y="77" width="30" height="2" rx="1" fill={c} fillOpacity="0.2" />
      <rect x="128" y="82" width="24" height="2" rx="1" fill={c} fillOpacity="0.15" />

      {/* Coffee mug */}
      <g transform="translate(30, 88)">
        <rect x="0" y="2" width="14" height="14" rx="3" fill="#292524" stroke={c} strokeWidth="1" strokeOpacity="0.4" />
        <path d="M14 5 Q20 8 14 13" stroke={c} strokeWidth="1" fill="none" strokeOpacity="0.3" />
        {/* Steam */}
        <path d="M4 0 Q6 -6 8 0" stroke={c} strokeWidth="0.7" fill="none" strokeOpacity="0.3">
          <animate attributeName="d" values="M4,0 Q6,-6 8,0;M4,-2 Q6,-8 8,-2;M4,0 Q6,-6 8,0" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M7 -1 Q9 -8 11 -1" stroke={c} strokeWidth="0.5" fill="none" strokeOpacity="0.2">
          <animate attributeName="d" values="M7,-1 Q9,-8 11,-1;M7,-3 Q9,-10 11,-3;M7,-1 Q9,-8 11,-1" dur="3.5s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Desk lamp */}
      <g transform="translate(175, 42)">
        <line x1="0" y1="58" x2="0" y2="25" stroke="#444" strokeWidth="2" />
        <line x1="0" y1="25" x2="-18" y2="12" stroke="#444" strokeWidth="2" />
        <ellipse cx="-22" cy="10" rx="10" ry="5" fill={c} fillOpacity="0.15" stroke={c} strokeWidth="0.8" strokeOpacity="0.3" />
        <ellipse cx="-22" cy="30" rx="25" ry="18" fill="url(#benLamp)" />
      </g>

      {/* ─── Ben Character ─── */}
      <g transform="translate(55, 8)">
        {/* Chair */}
        <ellipse cx="35" cy="98" rx="24" ry="6" fill="#292524" />
        <rect x="12" y="60" width="46" height="40" rx="10" fill="#1f1f1f" stroke="#333" strokeWidth="1" />
        <rect x="16" y="40" width="38" height="24" rx="8" fill="#1f1f1f" stroke="#333" strokeWidth="1" />

        {/* Body - hoodie */}
        <path d="M18 62 Q18 50 35 48 Q52 50 52 62 V88 Q52 94 35 94 Q18 94 18 88Z" fill={hoodie} stroke="#4b5563" strokeWidth="1" />
        {/* Hoodie pocket */}
        <path d="M24 76 h22 v8 Q35 88 24 84z" fill="#2d3748" strokeOpacity="0.3" stroke="#4b5563" strokeWidth="0.5" />
        {/* Hoodie strings */}
        <line x1="30" y1="52" x2="28" y2="62" stroke="#6b7280" strokeWidth="0.8" />
        <line x1="40" y1="52" x2="42" y2="62" stroke="#6b7280" strokeWidth="0.8" />

        {/* Neck */}
        <rect x="30" y="42" width="10" height="8" rx="3" fill={skin} />

        {/* Head */}
        <ellipse cx="35" cy="30" rx="17" ry="19" fill={skin} />
        {/* Messy hair */}
        <path d="M18 26 Q16 12 25 8 Q32 4 35 6 Q38 3 45 8 Q52 12 52 22 Q54 18 50 26" fill={hair} />
        <path d="M20 24 Q18 20 22 18" stroke={hair} strokeWidth="2" fill="none" />
        <path d="M48 22 Q52 18 50 24" stroke={hair} strokeWidth="2" fill="none" />
        {/* Stray hair strands */}
        <path d="M28 6 Q26 2 30 4" stroke={hair} strokeWidth="1.2" fill="none" />
        <path d="M40 5 Q42 1 38 3" stroke={hair} strokeWidth="1.2" fill="none" />

        {/* Eyes */}
        <ellipse cx="28" cy="30" rx="3" ry="3.2" fill="white" />
        <ellipse cx="42" cy="30" rx="3" ry="3.2" fill="white" />
        <circle cx="29" cy="30" r="2" fill="#4a3728" />
        <circle cx="43" cy="30" r="2" fill="#4a3728" />
        <circle cx="29.5" cy="29.5" r="0.8" fill="white" />
        <circle cx="43.5" cy="29.5" r="0.8" fill="white" />
        {/* Eyebrows - relaxed */}
        <path d="M24 25 Q28 23 32 25" stroke={hair} strokeWidth="1.2" fill="none" />
        <path d="M38 25 Q42 23 46 25" stroke={hair} strokeWidth="1.2" fill="none" />
        {/* Nose */}
        <path d="M35 33 Q33 36 35 37" stroke="#d4a574" strokeWidth="0.8" fill="none" />
        {/* Relaxed smile */}
        <path d="M28 39 Q35 44 42 39" stroke="#c48a60" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* 5 o'clock shadow */}
        <ellipse cx="35" cy="40" rx="10" ry="5" fill={hair} fillOpacity="0.06" />

        {/* Arms - relaxed, one behind head */}
        <path d="M52 56 Q62 48 58 38" stroke={hoodie} strokeWidth="8" strokeLinecap="round" fill="none" />
        <circle cx="58" cy="36" r="5" fill={skin} /> {/* Hand behind head */}
        {/* Other arm on desk */}
        <path d="M18 62 Q8 68 12 80" stroke={hoodie} strokeWidth="8" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="82" r="5" fill={skin} />

        {/* Legs */}
        <rect x="22" y="90" width="10" height="16" rx="4" fill="#1e293b" />
        <rect x="38" y="90" width="10" height="16" rx="4" fill="#1e293b" />
        {/* Shoes */}
        <ellipse cx="27" cy="107" rx="7" ry="3" fill="#292524" />
        <ellipse cx="43" cy="107" rx="7" ry="3" fill="#292524" />

        {/* Idle breathing animation */}
        <animateTransform attributeName="transform" type="translate" values="55,8;55,9;55,8" dur="4s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}
