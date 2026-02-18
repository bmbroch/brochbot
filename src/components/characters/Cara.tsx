export default function Cara({ hover }: { hover: boolean }) {
  const c = "#a855f7";
  const skin = "#f0c8a0";
  const hair = "#8B4513";
  const top = "#4c1d95";
  return (
    <svg viewBox="0 0 220 160" fill="none" className="w-full h-full">
      {/* Desk */}
      <rect x="5" y="105" width="210" height="8" rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="12" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />
      <rect x="204" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />

      {/* Triple monitors */}
      <rect x="10" y="62" width="42" height="34" rx="3" fill="#111" stroke="#333" strokeWidth="1" />
      <rect x="13" y="65" width="36" height="26" rx="2" fill={hover ? "#120a18" : "#0a0a0a"} />
      <rect x="58" y="56" width="52" height="42" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="62" y="60" width="44" height="34" rx="2" fill={hover ? "#120a18" : "#0a0a0a"} />
      <rect x="116" y="62" width="42" height="34" rx="3" fill="#111" stroke="#333" strokeWidth="1" />
      <rect x="119" y="65" width="36" height="26" rx="2" fill={hover ? "#120a18" : "#0a0a0a"} />
      {/* Monitor stands */}
      <rect x="26" y="96" width="8" height="9" rx="1" fill="#1a1a1a" />
      <rect x="80" y="98" width="8" height="7" rx="1" fill="#1a1a1a" />
      <rect x="132" y="96" width="8" height="9" rx="1" fill="#1a1a1a" />
      {/* Ticket list on main screen */}
      {[0, 6, 12, 18].map(y => (
        <g key={y}>
          <circle cx="68" cy={66 + y} r="1.5" fill="#22c55e" fillOpacity={0.5 - y * 0.01} />
          <rect x="72" y={64.5 + y} width={22 - y * 0.5} height="2" rx="1" fill={c} fillOpacity={0.3 - y * 0.02} />
        </g>
      ))}

      {/* ─── Cara Character ─── */}
      <g transform="translate(65, 2)">
        {/* Chair */}
        <ellipse cx="42" cy="100" rx="22" ry="5" fill="#292524" />
        <rect x="20" y="64" width="44" height="36" rx="10" fill="#1f1f1f" stroke="#333" strokeWidth="1" />

        {/* Body */}
        <path d="M26 58 Q26 48 42 46 Q58 48 58 58 V86 Q58 90 42 90 Q26 90 26 86Z" fill={top} stroke="#5b21b6" strokeWidth="1" />

        {/* Neck */}
        <rect x="37" y="40" width="10" height="8" rx="3" fill={skin} />

        {/* Head */}
        <ellipse cx="42" cy="26" rx="16" ry="18" fill={skin} />
        {/* Long wavy hair */}
        <path d="M26 22 Q22 8 34 4 Q42 2 50 4 Q60 8 58 22" fill={hair} />
        <path d="M26 22 Q24 32 22 42 Q20 52 24 56" stroke={hair} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M58 22 Q60 32 62 42 Q64 52 60 56" stroke={hair} strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Hair highlights */}
        <path d="M28 28 Q26 36 24 44" stroke="#a0622a" strokeWidth="1" fill="none" strokeOpacity="0.3" />
        <path d="M56 28 Q58 36 60 44" stroke="#a0622a" strokeWidth="1" fill="none" strokeOpacity="0.3" />

        {/* Headphones */}
        <path d="M22 24 Q22 6 42 6 Q62 6 62 24" stroke="#555" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="14" y="18" width="12" height="14" rx="5" fill="#444" stroke="#555" strokeWidth="1.5" />
        <rect x="16" y="20" width="8" height="10" rx="3" fill={c} fillOpacity="0.3" />
        <rect x="58" y="18" width="12" height="14" rx="5" fill="#444" stroke="#555" strokeWidth="1.5" />
        <rect x="60" y="20" width="8" height="10" rx="3" fill={c} fillOpacity="0.3" />
        {/* Mic boom */}
        <path d="M14 28 Q6 34 10 42" stroke="#555" strokeWidth="2" fill="none" />
        <circle cx="10" cy="44" r="3" fill="#333" stroke="#555" strokeWidth="1" />

        {/* Eyes - friendly, warm */}
        <ellipse cx="35" cy="26" rx="3.2" ry="3.5" fill="white" />
        <ellipse cx="49" cy="26" rx="3.2" ry="3.5" fill="white" />
        <circle cx="36" cy="26.5" r="2.2" fill="#5b3a1a" />
        <circle cx="50" cy="26.5" r="2.2" fill="#5b3a1a" />
        <circle cx="36.5" cy="26" r="0.8" fill="white" />
        <circle cx="50.5" cy="26" r="0.8" fill="white" />
        {/* Eyelashes */}
        <path d="M32 23 Q34 22 36 23" stroke="#5b3a1a" strokeWidth="0.6" fill="none" />
        <path d="M48 23 Q50 22 52 23" stroke="#5b3a1a" strokeWidth="0.6" fill="none" />
        {/* Friendly smile */}
        <path d="M36 34 Q42 39 48 34" stroke="#c08a60" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Blush */}
        <ellipse cx="32" cy="32" rx="3" ry="1.5" fill="#e8a0a0" fillOpacity="0.2" />
        <ellipse cx="52" cy="32" rx="3" ry="1.5" fill="#e8a0a0" fillOpacity="0.2" />
        {/* Nose */}
        <path d="M42 29 Q40 32 42 33" stroke="#d4a574" strokeWidth="0.7" fill="none" />

        {/* Arms on desk */}
        <path d="M26 56 Q16 62 10 68" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="8" cy="70" r="4.5" fill={skin} />
        <path d="M58 56 Q68 62 74 68" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="76" cy="70" r="4.5" fill={skin} />

        {/* Legs */}
        <rect x="30" y="88" width="10" height="16" rx="4" fill="#312e81" />
        <rect x="44" y="88" width="10" height="16" rx="4" fill="#312e81" />

        {/* Breathing */}
        <animateTransform attributeName="transform" type="translate" values="65,2;65,3;65,2" dur="3.8s" repeatCount="indefinite" />
      </g>

      {/* Small plant on desk */}
      <g transform="translate(172, 78)">
        <rect x="0" y="14" width="12" height="12" rx="3" fill="#292524" stroke="#3f3f3f" strokeWidth="0.5" />
        <path d="M6 14 Q2 6 6 4 Q10 6 6 14" fill="#22c55e" fillOpacity="0.3" />
        <path d="M6 12 Q0 8 4 4" stroke="#22c55e" strokeWidth="0.8" fill="none" strokeOpacity="0.4" />
        <path d="M6 12 Q12 8 8 4" stroke="#22c55e" strokeWidth="0.8" fill="none" strokeOpacity="0.4" />
      </g>
    </svg>
  );
}
