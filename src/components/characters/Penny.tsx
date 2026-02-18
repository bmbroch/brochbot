export default function Penny({ hover }: { hover: boolean }) {
  const c = "#f43f5e";
  const skin = "#f0c8a0";
  const hair = "#2c1810";
  const top = "#831843";
  return (
    <svg viewBox="0 0 220 160" fill="none" className="w-full h-full">
      {/* Corkboard behind */}
      <rect x="5" y="5" width="90" height="68" rx="4" fill="#78350f" fillOpacity="0.06" stroke="#92400e" strokeWidth="1" strokeOpacity="0.15" />
      {/* Cork texture dots */}
      <circle cx="20" cy="15" r="0.8" fill="#92400e" fillOpacity="0.1" />
      <circle cx="50" cy="25" r="0.8" fill="#92400e" fillOpacity="0.1" />
      <circle cx="75" cy="45" r="0.8" fill="#92400e" fillOpacity="0.1" />
      {/* Pinned items */}
      <rect x="12" y="14" width="22" height="16" rx="1" fill="#3b82f6" fillOpacity="0.05" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx="23" cy="12" r="3" fill={c} fillOpacity="0.6" />
      <rect x="42" y="10" width="26" height="20" rx="1" fill="#22c55e" fillOpacity="0.05" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx="55" cy="8" r="3" fill="#eab308" fillOpacity="0.6" />
      <rect x="14" y="38" width="20" height="14" rx="1" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx="24" cy="36" r="3" fill="#a855f7" fillOpacity="0.6" />
      <rect x="42" y="36" width="24" height="18" rx="1" fill="#f97316" fillOpacity="0.05" stroke="#f97316" strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx="54" cy="34" r="3" fill="#f97316" fillOpacity="0.6" />
      {/* String connecting pins */}
      <path d="M23 14 Q38 20 55 10" stroke="#666" strokeWidth="0.3" fill="none" strokeOpacity="0.3" />

      {/* Desk */}
      <rect x="10" y="105" width="200" height="8" rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="18" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />
      <rect x="200" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />

      {/* Monitor */}
      <rect x="75" y="62" width="50" height="36" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="79" y="66" width="42" height="28" rx="2" fill={hover ? "#180a0e" : "#0a0a0a"} />
      <rect x="95" y="98" width="10" height="7" rx="1" fill="#1a1a1a" />
      {/* Calendar on screen */}
      <rect x="83" y="70" width="34" height="20" rx="1" fill={c} fillOpacity="0.04" stroke={c} strokeWidth="0.5" strokeOpacity="0.15" />
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x={84 + i * 6.5} y="74" width="5" height="4" rx="0.5" fill={c} fillOpacity={i === 2 ? 0.3 : 0.08} stroke={c} strokeWidth="0.3" strokeOpacity="0.1" />
          <rect x={84 + i * 6.5} y="80" width="5" height="4" rx="0.5" fill={c} fillOpacity="0.05" stroke={c} strokeWidth="0.3" strokeOpacity="0.1" />
        </g>
      ))}

      {/* Neat paper stack */}
      <g transform="translate(152, 88)">
        <rect x="0" y="0" width="24" height="3" rx="1" fill="white" fillOpacity="0.03" stroke="#333" strokeWidth="0.5" />
        <rect x="1" y="-3" width="24" height="3" rx="1" fill="white" fillOpacity="0.03" stroke="#333" strokeWidth="0.5" />
        <rect x="0" y="-6" width="24" height="3" rx="1" fill="white" fillOpacity="0.03" stroke="#333" strokeWidth="0.5" />
        <rect x="1" y="-9" width="24" height="3" rx="1" fill="white" fillOpacity="0.04" stroke="#333" strokeWidth="0.5" />
      </g>

      {/* ─── Penny Character ─── */}
      <g transform="translate(62, 2)">
        {/* Chair */}
        <ellipse cx="40" cy="100" rx="22" ry="5" fill="#292524" />
        <rect x="18" y="64" width="44" height="36" rx="10" fill="#1f1f1f" stroke="#333" strokeWidth="1" />

        {/* Body - neat blouse */}
        <path d="M24 56 Q24 46 40 44 Q56 46 56 56 V84 Q56 88 40 88 Q24 88 24 84Z" fill={top} stroke="#9f1239" strokeWidth="1" />
        {/* Peter pan collar */}
        <ellipse cx="34" cy="48" rx="6" ry="3" fill="white" fillOpacity="0.08" />
        <ellipse cx="46" cy="48" rx="6" ry="3" fill="white" fillOpacity="0.08" />

        {/* Neck */}
        <rect x="35" y="38" width="10" height="8" rx="3" fill={skin} />

        {/* Head */}
        <ellipse cx="40" cy="24" rx="15" ry="17" fill={skin} />
        {/* Neat bob hairstyle */}
        <path d="M25 20 Q23 6 34 2 Q40 0 46 2 Q55 6 55 20" fill={hair} />
        <path d="M25 20 Q23 28 24 36" stroke={hair} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M55 20 Q57 28 56 36" stroke={hair} strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Bangs */}
        <path d="M25 18 Q30 14 35 18 Q38 14 42 18 Q46 14 50 18 Q53 14 55 18" fill={hair} />

        {/* Eyes */}
        <ellipse cx="33" cy="24" rx="3" ry="3.2" fill="white" />
        <ellipse cx="47" cy="24" rx="3" ry="3.2" fill="white" />
        <circle cx="34" cy="24.5" r="2" fill="#4a3020" />
        <circle cx="48" cy="24.5" r="2" fill="#4a3020" />
        <circle cx="34.4" cy="24" r="0.7" fill="white" />
        <circle cx="48.4" cy="24" r="0.7" fill="white" />
        {/* Neat eyebrows */}
        <path d="M30 19 Q33 17.5 36 19" stroke={hair} strokeWidth="1" fill="none" />
        <path d="M44 19 Q47 17.5 50 19" stroke={hair} strokeWidth="1" fill="none" />
        {/* Eyelashes */}
        <line x1="30" y1="22" x2="29" y2="21" stroke={hair} strokeWidth="0.5" />
        <line x1="50" y1="22" x2="51" y2="21" stroke={hair} strokeWidth="0.5" />
        {/* Nose */}
        <path d="M40 27 Q38 30 40 31" stroke="#d4a574" strokeWidth="0.7" fill="none" />
        {/* Pleasant smile */}
        <path d="M34 34 Q40 38 46 34" stroke="#c08a60" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        {/* Blush */}
        <ellipse cx="30" cy="30" rx="2.5" ry="1.2" fill="#e8a0a0" fillOpacity="0.15" />
        <ellipse cx="50" cy="30" rx="2.5" ry="1.2" fill="#e8a0a0" fillOpacity="0.15" />

        {/* Earrings */}
        <circle cx="24" cy="28" r="1.5" fill={c} fillOpacity="0.4" />
        <circle cx="56" cy="28" r="1.5" fill={c} fillOpacity="0.4" />

        {/* Arms */}
        <path d="M24 56 Q14 62 10 70" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="8" cy="72" r="4" fill={skin} />
        <path d="M56 56 Q66 62 70 70" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="72" cy="72" r="4" fill={skin} />

        {/* Legs */}
        <rect x="28" y="86" width="10" height="16" rx="4" fill="#292524" />
        <rect x="42" y="86" width="10" height="16" rx="4" fill="#292524" />

        <animateTransform attributeName="transform" type="translate" values="62,2;62,3;62,2" dur="4s" repeatCount="indefinite" />
      </g>

      {/* Pen holder on desk */}
      <g transform="translate(140, 86)">
        <rect x="0" y="4" width="10" height="14" rx="2" fill="#292524" stroke="#444" strokeWidth="0.5" />
        <line x1="3" y1="4" x2="2" y2="-4" stroke={c} strokeWidth="1" />
        <line x1="5" y1="4" x2="5" y2="-6" stroke="#3b82f6" strokeWidth="1" />
        <line x1="7" y1="4" x2="8" y2="-4" stroke="#22c55e" strokeWidth="1" />
      </g>
    </svg>
  );
}
