export function PlayoffPredictorLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Playoff Predictor logo"
    >
      {/* ── Circle background + border ── */}
      <circle cx="28" cy="28" r="27" fill="currentColor" className="text-background" />
      <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2" />

      {/* Clip everything inside the circle */}
      <clipPath id="circle-clip">
        <circle cx="28" cy="28" r="25" />
      </clipPath>
      <g clipPath="url(#circle-clip)">

        {/* ── Basketball (top-left) ── */}
        <circle cx="15" cy="15" r="10" fill="#E87722" />
        <path d="M15 5 Q18 10 18 15 Q18 20 15 25" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M15 5 Q12 10 12 15 Q12 20 15 25" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M5 15 Q10 12 15 12 Q20 12 25 15" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M5 15 Q10 18 15 18 Q20 18 25 15" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* ── Hockey Puck (top-right) ── */}
        <ellipse cx="41" cy="15" rx="10" ry="6.5" fill="#1a1a1a" />
        <ellipse cx="41" cy="13.5" rx="10" ry="6.5" fill="#2d2d2d" />
        <ellipse cx="41" cy="13.5" rx="8.5" ry="5" fill="#1a1a1a" />
        <ellipse cx="41" cy="12.5" rx="7" ry="3.5" fill="#3a3a3a" />

        {/* ── Football (bottom-left) ── */}
        <ellipse cx="15" cy="41" rx="9" ry="6" fill="#7B4B2A" transform="rotate(-20 15 41)" />
        <ellipse cx="15" cy="41" rx="7.5" ry="4.5" fill="#8B5E3C" transform="rotate(-20 15 41)" />
        <line x1="13" y1="37.5" x2="17" y2="44.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="11.5" y1="39.5" x2="14.5" y2="39.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" transform="rotate(-20 13 39.5)" />
        <line x1="12.5" y1="41.5" x2="15.5" y2="41.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" transform="rotate(-20 14 41.5)" />
        <line x1="13.5" y1="43.5" x2="16.5" y2="43.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" transform="rotate(-20 15 43.5)" />

        {/* ── Baseball (bottom-right) ── */}
        <circle cx="41" cy="41" r="10" fill="#F5F5F0" />
        <path d="M33.5 37 Q36 39 36 41 Q36 43 33.5 45" stroke="#CC2200" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M48.5 37 Q46 39 46 41 Q46 43 48.5 45" stroke="#CC2200" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <line x1="34.5" y1="37.8" x2="36.5" y2="38.5" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="34" y1="39.5" x2="36" y2="40" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="34" y1="41.5" x2="36" y2="41.5" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="34" y1="43.2" x2="36" y2="42.8" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="34.5" y1="44.8" x2="36.5" y2="44" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="47.5" y1="37.8" x2="45.5" y2="38.5" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="48" y1="39.5" x2="46" y2="40" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="48" y1="41.5" x2="46" y2="41.5" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="48" y1="43.2" x2="46" y2="42.8" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="47.5" y1="44.8" x2="45.5" y2="44" stroke="#CC2200" strokeWidth="0.8" strokeLinecap="round" />

      </g>

      {/* Border on top so it's crisp over the clipped content */}
      <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2" />
    </svg>
  )
}
