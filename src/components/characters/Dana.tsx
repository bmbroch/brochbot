export default function Dana({ hover }: { hover: boolean }) {
  const c = "#22c55e";
  const skin = "#c68642";
  const hair = "#1a1a1a";
  const top = "#14532d";
  return (
    <svg viewBox="0 0 220 160" fill="none" className="w-full h-full">
      {/* Desk */}
      <rect x="10" y="105" width="200" height="8" rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="18" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />
      <rect x="198" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />

      {/* Main monitor with charts */}
      <rect x="65" y="56" width="58" height="42" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="69" y="60" width="50" height="34" rx="2" fill={hover ? "#0a140a" : "#0a0a0a"} />
      <rect x="89" y="98" width="10" height="7" rx="1" fill="#1a1a1a" />
      {/* Chart on screen */}
      <polyline points="75,86 83,78 91,82 99,72 107,76 113,68" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none">
        <animate attributeName="points" values="75,86 83,78 91,82 99,72 107,76 113,68;75,84 83,75 91,80 99,68 107,72 113,65;75,86 83,78 91,82 99,72 107,76 113,68" dur="4s" repeatCount="indefinite" />
      </polyline>
      {/* Bar chart mini */}
      <rect x="76" y="66" width="5" height="8" rx="1" fill={c} fillOpacity="0.3" />
      <rect x="83" y="62" width="5" height="12" rx="1" fill={c} fillOpacity="0.4" />
      <rect x="90" y="64" width="5" height="10" rx="1" fill={c} fillOpacity="0.35" />

      {/* Side monitor */}
      <rect x="135" y="62" width="42" height="34" rx="3" fill="#111" stroke="#333" strokeWidth="1" />
      <rect x="138" y="65" width="36" height="26" rx="2" fill={hover ? "#0a140a" : "#0a0a0a"} />
      <rect x="151" y="96" width="8" height="9" rx="1" fill="#1a1a1a" />
      {/* Pie chart on side */}
      <circle cx="156" cy="78" r="8" fill="none" stroke={c} strokeWidth="2" strokeOpacity="0.3" strokeDasharray="12 38" />
      <circle cx="156" cy="78" r="8" fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="18 32" strokeDashoffset="-12" />

      {/* Scattered papers */}
      <rect x="18" y="88" width="24" height="16" rx="2" fill={c} fillOpacity="0.04" stroke={c} strokeWidth="0.5" strokeOpacity="0.15" transform="rotate(-6 30 96)" />
      <rect x="20" y="92" width="16" height="1.5" rx="0.5" fill={c} fillOpacity="0.1" transform="rotate(-6 28 93)" />

      {/* Coffee cup */}
      <g transform="translate(42, 90)">
        <rect x="0" y="2" width="12" height="12" rx="3" fill="#292524" stroke={c} strokeWidth="0.8" strokeOpacity="0.3" />
        <path d="M12 5 Q17 7 12 11" stroke="#555" strokeWidth="0.8" fill="none" />
        <path d="M4 0 Q6 -5 8 0" stroke={c} strokeWidth="0.6" fill="none" strokeOpacity="0.25">
          <animate attributeName="d" values="M4,0 Q6,-5 8,0;M4,-2 Q6,-7 8,-2;M4,0 Q6,-5 8,0" dur="3s" repeatCount="indefinite" />
        </path>
      </g>

      {/* ─── Dana Character ─── */}
      <g transform="translate(62, 2)">
        {/* Chair */}
        <ellipse cx="38" cy="100" rx="22" ry="5" fill="#292524" />
        <rect x="16" y="64" width="44" height="36" rx="10" fill="#1f1f1f" stroke="#333" strokeWidth="1" />

        {/* Body */}
        <path d="M22 58 Q22 48 38 46 Q54 48 54 58 V86 Q54 90 38 90 Q22 90 22 86Z" fill={top} stroke="#166534" strokeWidth="1" />
        {/* V-neck detail */}
        <path d="M32 48 L38 56 L44 48" stroke="#22c55e" strokeWidth="0.6" fill="none" strokeOpacity="0.3" />

        {/* Neck */}
        <rect x="33" y="40" width="10" height="8" rx="3" fill={skin} />

        {/* Head */}
        <ellipse cx="38" cy="26" rx="15" ry="17" fill={skin} />
        {/* Short natural hair */}
        <path d="M23 22 Q21 8 32 4 Q38 2 44 4 Q53 8 53 22" fill={hair} />
        <path d="M25 20 Q24 16 26 14" stroke={hair} strokeWidth="2" fill="none" />
        <path d="M51 20 Q52 16 50 14" stroke={hair} strokeWidth="2" fill="none" />

        {/* Glasses */}
        <rect x="27" y="22" width="12" height="10" rx="4" fill="none" stroke="#666" strokeWidth="1.5" />
        <rect x="43" y="22" width="12" height="10" rx="4" fill="none" stroke="#666" strokeWidth="1.5" />
        <line x1="39" y1="27" x2="43" y2="27" stroke="#666" strokeWidth="1" />
        <line x1="23" y1="27" x2="27" y2="27" stroke="#666" strokeWidth="0.8" />
        <line x1="55" y1="27" x2="58" y2="25" stroke="#666" strokeWidth="0.8" />
        {/* Lens reflection */}
        <path d="M30 24 L32 26" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
        <path d="M46 24 L48 26" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />

        {/* Eyes behind glasses */}
        <ellipse cx="33" cy="27" rx="2.5" ry="2.8" fill="white" />
        <ellipse cx="49" cy="27" rx="2.5" ry="2.8" fill="white" />
        <circle cx="34" cy="27.5" r="1.8" fill="#2c1810" />
        <circle cx="50" cy="27.5" r="1.8" fill="#2c1810" />
        <circle cx="34.3" cy="27" r="0.6" fill="white" />
        <circle cx="50.3" cy="27" r="0.6" fill="white" />
        {/* Eyebrows */}
        <path d="M28 20 Q33 18 38 20" stroke={hair} strokeWidth="1.2" fill="none" />
        <path d="M42 20 Q47 18 54 20" stroke={hair} strokeWidth="1.2" fill="none" />
        {/* Nose */}
        <path d="M38 30 Q36 33 38 34" stroke="#b07a42" strokeWidth="0.7" fill="none" />
        {/* Thoughtful smile */}
        <path d="M33 37 Q38 40 43 37" stroke="#a06a38" strokeWidth="1" strokeLinecap="round" fill="none" />

        {/* Arms - typing posture */}
        <path d="M22 56 Q12 62 8 72" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="6" cy="74" r="4" fill={skin} />
        <path d="M54 56 Q64 62 68 72" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="70" cy="74" r="4" fill={skin} />

        {/* Legs */}
        <rect x="26" y="88" width="10" height="16" rx="4" fill="#1e293b" />
        <rect x="40" y="88" width="10" height="16" rx="4" fill="#1e293b" />

        <animateTransform attributeName="transform" type="translate" values="62,2;62,3;62,2" dur="4.2s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}
