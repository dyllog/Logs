// Simple skyline illustration inspired by Auckland. Sized to width 100%.
// Colors come from CSS variables defined in globals.css
export default function Skyline({ className = "", height = 300 }) {
  return (
    <svg
      viewBox="0 0 1440 480"
      width="100%"
      height={height}
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMax slice"
    >
      {/* Far background buildings */}
      <g fill="var(--logs-far)">
        <rect x="60" y="210" width="40" height="120" rx="2" />
        <rect x="110" y="240" width="28" height="90" rx="2" />
        <rect x="175" y="220" width="60" height="120" rx="2" />
        <rect x="255" y="230" width="36" height="110" rx="2" />
        <rect x="320" y="205" width="82" height="135" rx="2" />
        <rect x="420" y="230" width="26" height="110" rx="2" />
        <rect x="980" y="230" width="36" height="110" rx="2" />
        <rect x="1030" y="245" width="22" height="95" rx="2" />
        <rect x="1060" y="210" width="80" height="130" rx="2" />
        <rect x="1160" y="235" width="30" height="105" rx="2" />
      </g>

      {/* Sky Tower silhouette */}
      <g fill="var(--logs-mid)">
        <rect x="140" y="110" width="18" height="220" rx="6" />
        <rect x="136" y="100" width="26" height="8" />
        <rect x="142" y="86" width="14" height="14" rx="2" />
        <rect x="147" y="46" width="4" height="40" />
        <circle cx="149" cy="42" r="4" />
      </g>

      {/* Mid buildings */}
      <g fill="var(--logs-mid)">
        <rect x="260" y="200" width="70" height="150" rx="3" />
        <rect x="350" y="215" width="110" height="135" rx="3" />
        <path d="M520 190 h90 v160 h-90 z" />
        <path d="M630 160 q40 35 30 190 h-80 v-120 q50-5 50-70 z" />
        <rect x="720" y="210" width="65" height="140" rx="3" />
        <rect x="805" y="235" width="42" height="115" rx="3" />
      </g>

      {/* Bridge */}
      <g fill="var(--logs-mid)">
        <path d="M1140 325 h240 v16 h-240 z" />
        <path d="M1140 325 q120 -70 240 0" fill="none" stroke="var(--logs-mid)" strokeWidth="12" />
        <g fill="var(--logs-mid)">
          <rect x="1180" y="325" width="10" height="20" />
          <rect x="1240" y="325" width="10" height="20" />
          <rect x="1300" y="325" width="10" height="20" />
          <rect x="1360" y="325" width="10" height="20" />
        </g>
      </g>

      {/* Foreground land + water ripples */}
      <path
        d="M0 360 C 260 330 520 360 760 350 C 1040 338 1240 360 1440 348 V 480 H 0 Z"
        fill="var(--logs-fore)"
      />
      <g fill="var(--logs-water)">
        <ellipse cx="120" cy="420" rx="46" ry="8" />
        <ellipse cx="320" cy="410" rx="40" ry="7" />
        <ellipse cx="980" cy="415" rx="44" ry="8" />
        <ellipse cx="1280" cy="430" rx="52" ry="9" />
      </g>
    </svg>
  );
}

