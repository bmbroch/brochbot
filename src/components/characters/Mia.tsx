export default function Mia({ hover }: { hover: boolean }) {
  const c = "#d946ef";
  const skin = "#e8c4a0";
  const hair = "#1a0a1e";
  const top = "#701a75";
  return (
    <svg viewBox="0 0 220 160" fill="none" className="w-full h-full">
      {/* Desk */}
      <rect x="10" y="105" width="200" height="8" rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="18" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />
      <rect x="204" y="113" width="4" height="18" rx="1" fill="#1a1a1a" />

      {/* Monitor */}
      <rect x="70" y="60" width="52" height="38" rx="4" fill="#111" stroke="#333" strokeWidth="1.5" />
      <rect x="74" y="64" width="44" height="30" rx="2" fill={hover ? "#180a1a" : "#0a0a0a"} />
      <rect x="91" y="98" width="10" height="7" rx="1" fill="#1a1a1a" />
      {/* Social feed on screen */}
      <rect x="78" y="68" width="36" height="8" rx="1.5" fill={c} fillOpacity="0.06" stroke={c} strokeWidth="0.3" strokeOpacity="0.15" />
      <rect x="78" y="79" width="36" height="8" rx="1.5" fill={c} fillOpacity="0.04" stroke={c} strokeWidth="0.3" strokeOpacity="0.1" />
      <circle cx="82" cy="72" r="2" fill={c} fillOpacity="0.3" />
      <rect x="86" y="70" width="16" height="1.5" rx="0.5" fill={c} fillOpacity="0.2" />
      <circle cx="82" cy="83" r="2" fill={c} fillOpacity="0.2" />
      <rect x="86" y="81" width="14" height="1.5" rx="0.5" fill={c} fillOpacity="0.15" />

      {/* Floating social icons */}
      <g opacity="0.5">
        {/* TikTok */}
        <g>
          <circle cx="155" cy="30" r="12" fill="#06b6d4" fillOpacity="0.08" stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.2">
            <animate attributeName="cy" values="30;26;30" dur="3s" repeatCount="indefinite" />
          </circle>
          <text x="155" y="34" textAnchor="middle" fontSize="11" fill="#06b6d4" fillOpacity="0.5">♪</text>
        </g>
        {/* Instagram */}
        <g>
          <circle cx="172" cy="55" r="11" fill="#ec4899" fillOpacity="0.08" stroke="#ec4899" strokeWidth="0.8" strokeOpacity="0.2">
            <animate attributeName="cy" values="55;51;55" dur="3.5s" repeatCount="indefinite" />
          </circle>
          <rect x="167" y="50" width="10" height="10" rx="3" fill="none" stroke="#ec4899" strokeWidth="0.8" strokeOpacity="0.3" />
          <circle cx="172" cy="55" r="2.5" fill="none" stroke="#ec4899" strokeWidth="0.6" strokeOpacity="0.3" />
        </g>
        {/* Heart */}
        <text x="148" y="68" fontSize="10" fillOpacity="0.4">❤️<animate attributeName="y" values="68;64;68" dur="2.5s" repeatCount="indefinite" /></text>
        {/* Like count */}
        <text x="185" y="78" fontSize="6" fill={c} fillOpacity="0.3" fontFamily="Inter, sans-serif">
          +2.4K
          <animate attributeName="fillOpacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
        </text>
      </g>

      {/* Phone on desk */}
      <rect x="28" y="84" width="18" height="26" rx="4" fill="#222" stroke={c} strokeWidth="0.8" strokeOpacity="0.3" />
      <rect x="31" y="88" width="12" height="18" rx="2" fill={c} fillOpacity="0.04" />

      {/* ─── Mia Character ─── */}
      <g transform="translate(58, 2)">
        {/* Chair */}
        <ellipse cx="40" cy="100" rx="22" ry="5" fill="#292524" />
        <rect x="18" y="64" width="44" height="36" rx="10" fill="#1f1f1f" stroke="#333" strokeWidth="1" />

        {/* Body - trendy crop top / blouse */}
        <path d="M24 56 Q24 46 40 44 Q56 46 56 56 V84 Q56 88 40 88 Q24 88 24 84Z" fill={top} stroke="#86198f" strokeWidth="1" />
        {/* Necklace */}
        <path d="M30 48 Q40 54 50 48" stroke={c} strokeWidth="0.6" fill="none" strokeOpacity="0.4" />
        <circle cx="40" cy="53" r="2" fill={c} fillOpacity="0.3" />

        {/* Neck */}
        <rect x="35" y="38" width="10" height="8" rx="3" fill={skin} />

        {/* Head */}
        <ellipse cx="40" cy="24" rx="15" ry="17" fill={skin} />
        {/* Long stylish hair with highlights */}
        <path d="M25 20 Q22 6 34 2 Q40 0 46 2 Q58 6 55 20" fill={hair} />
        <path d="M25 20 Q22 30 20 42 Q18 54 22 60" stroke={hair} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M55 20 Q58 30 60 42 Q62 54 58 60" stroke={hair} strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* Hair highlights - purple tint */}
        <path d="M27 24 Q24 34 22 44" stroke={c} strokeWidth="1.2" fill="none" strokeOpacity="0.15" />
        <path d="M53 24 Q56 34 58 44" stroke={c} strokeWidth="1.2" fill="none" strokeOpacity="0.15" />
        {/* Side part */}
        <path d="M30 8 Q35 6 42 8" stroke={hair} strokeWidth="1" fill="none" />

        {/* Eyes - trendy, expressive */}
        <ellipse cx="33" cy="24" rx="3.2" ry="3.5" fill="white" />
        <ellipse cx="47" cy="24" rx="3.2" ry="3.5" fill="white" />
        <circle cx="34" cy="24.5" r="2.2" fill="#3a2a1a" />
        <circle cx="48" cy="24.5" r="2.2" fill="#3a2a1a" />
        <circle cx="34.5" cy="24" r="0.8" fill="white" />
        <circle cx="48.5" cy="24" r="0.8" fill="white" />
        {/* Winged eyeliner */}
        <path d="M29.5 22 Q33 21 36 22.5" stroke="#1a1a1a" strokeWidth="0.8" fill="none" />
        <path d="M44 22.5 Q47 21 50.5 22" stroke="#1a1a1a" strokeWidth="0.8" fill="none" />
        <line x1="29" y1="22.5" x2="27.5" y2="21" stroke="#1a1a1a" strokeWidth="0.6" />
        <line x1="51" y1="22.5" x2="52.5" y2="21" stroke="#1a1a1a" strokeWidth="0.6" />
        {/* Nose */}
        <path d="M40 27 Q38 30 40 31" stroke="#d4a574" strokeWidth="0.7" fill="none" />
        {/* Playful smile */}
        <path d="M34 34 Q40 39 46 34" stroke="#c08a60" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Glossy lips */}
        <path d="M35 35 Q40 37 45 35" fill={c} fillOpacity="0.15" />
        {/* Blush */}
        <ellipse cx="30" cy="30" rx="3" ry="1.5" fill="#e8a0b0" fillOpacity="0.15" />
        <ellipse cx="50" cy="30" rx="3" ry="1.5" fill="#e8a0b0" fillOpacity="0.15" />

        {/* Earrings - hoops */}
        <circle cx="24" cy="30" r="3" fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="56" cy="30" r="3" fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.4" />

        {/* Right arm - phone in hand */}
        <path d="M56 56 Q66 60 68 52" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="50" r="4" fill={skin} />
        {/* Phone in raised hand */}
        <rect x="62" y="34" width="14" height="22" rx="3" fill="#222" stroke={c} strokeWidth="0.6" strokeOpacity="0.3" />
        <rect x="64" y="37" width="10" height="15" rx="1.5" fill={c} fillOpacity="0.06" />
        {/* Selfie indicator */}
        <circle cx="69" cy="39" r="1.5" fill={c} fillOpacity="0.3">
          <animate attributeName="fillOpacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Left arm */}
        <path d="M24 56 Q14 62 10 70" stroke={top} strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="8" cy="72" r="4" fill={skin} />

        {/* Legs */}
        <rect x="28" y="86" width="10" height="16" rx="4" fill="#292524" />
        <rect x="42" y="86" width="10" height="16" rx="4" fill="#292524" />

        <animateTransform attributeName="transform" type="translate" values="58,2;58,3;58,2" dur="3.6s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}
