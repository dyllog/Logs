'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f3b3f] text-[#f5eadf]">
      {/* HERO */}
      <header className="relative overflow-hidden">
        {/* Top band */}
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-8 sm:px-8 md:pt-16">
          <h1
            className="font-extrabold tracking-tight leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            aria-label="LOGS"
          >
            LOGS
          </h1>
          <p
            className="mt-3 font-semibold tracking-tight"
            style={{ fontSize: 'clamp(1.25rem, 3.2vw, 2.25rem)' }}
          >
            Building Compliance Made Simple
          </p>

          <p className="mt-6 max-w-3xl text-[#d6cbc0] leading-relaxed">
            LOGS provides a modern, digital logbook for inspections and compliance — accessible via QR codes on-site, secure cloud storage, and instant reporting.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/demo"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold shadow-sm
                         bg-[#164c51] hover:bg-[#1a595f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d2c6ba]"
            >
              Try a Demo
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold
                         ring-1 ring-inset ring-[#2b5f63] hover:bg-[#113c40]/40"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Skyline (inline SVG) */}
        <Skyline className="w-full text-[#0d3437]" fillLayer="#0b2d2f" midLayer="#114348" foreLayer="#164c51" water="#0b2f31" />
      </header>

      {/* WHY LOGS */}
      <section className="bg-[#f5eadf] text-[#0f2f32]">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Why LOGS?</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              title="Simple Logging"
              desc="QR codes link directly to digital inspection forms. Easy to use, even for non-technical staff."
              icon="🧾"
            />
            <Card
              title="Secure Records"
              desc="All data stored securely in the cloud, ensuring compliance with record-keeping requirements."
              icon="🔒"
            />
            <Card
              title="Easy Exports"
              desc="Download PDF records instantly for audits — 24 months always available at your fingertips."
              icon="📄"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/** Reusable simple card */
function Card({ title, desc, icon }) {
  return (
    <div className="rounded-2xl border border-[#e7ded3] bg-white p-6 shadow-sm">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#415457] leading-relaxed">{desc}</p>
    </div>
  );
}

/**
 * Skyline SVG
 * - Left: Sky Tower
 * - Right: Auckland skyline with extended Harbour Bridge
 * - No plane/birds/church; minimalist, layered depth
 */
function Skyline({
  className = '',
  fillLayer = '#0b2d2f',
  midLayer = '#114348',
  foreLayer = '#164c51',
  water = '#0b2f31',
}) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 420"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
        role="img"
      >
        <title>Auckland skyline with Sky Tower and Harbour Bridge</title>
        <desc>Minimal, layered silhouette of Auckland’s Sky Tower, modern buildings, and an extended Harbour Bridge.</desc>

        {/* Background gradient wash */}
        <defs>
          <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0f3b3f" />
            <stop offset="1" stopColor="#0e373b" />
          </linearGradient>
        </defs>
        <rect width="1440" height="420" fill="url(#skyGrad)" />

        {/* Distant layer silhouettes */}
        <g fill={fillLayer}>
          {/* distant blocks */}
          <rect x="60" y="220" width="60" height="80" rx="2" />
          <rect x="135" y="205" width="40" height="95" rx="2" />
          <rect x="180" y="230" width="55" height="70" rx="2" />
          <rect x="240" y="210" width="46" height="90" rx="2" />
          <rect x="300" y="200" width="70" height="100" rx="2" />
          <rect x="390" y="215" width="58" height="85" rx="2" />
          <rect x="460" y="195" width="76" height="105" rx="2" />
          <rect x="548" y="225" width="26" height="75" rx="2" />
          <rect x="1200" y="205" width="55" height="95" rx="2" />
          <rect x="1270" y="185" width="70" height="115" rx="2" />
        </g>

        {/* Sky Tower (mid layer) */}
        <g fill={midLayer}>
          {/* tower shaft */}
          <rect x="210" y="80" width="22" height="230" rx="8" />
          {/* observation deck */}
          <rect x="188" y="70" width="66" height="18" rx="6" />
          {/* cap */}
          <rect x="216" y="50" width="10" height="30" rx="3" />
          {/* base block */}
          <rect x="198" y="300" width="50" height="30" rx="2" />
        </g>

        {/* Foreground buildings (mid/fore mix for depth) */}
        <g fill={midLayer}>
          <rect x="640" y="160" width="64" height="170" rx="3" />
          <rect x="715" y="145" width="56" height="185" rx="3" />
          <rect x="778" y="155" width="70" height="175" rx="3" />
          <rect x="862" y="135" width="58" height="195" rx="3" />
        </g>
        <g fill={foreLayer}>
          {/* slanted glassy tower */}
          <path d="M560 340h80V180l-80 30v130z" />
          {/* rounded pavilion (Wynyard-ish) */}
          <path d="M510 330c0-18 40-34 90-34s90 16 90 34H510z" />
          {/* right-most slim tower */}
          <rect x="960" y="200" width="38" height="130" rx="3" />
        </g>

        {/* Harbour Bridge — extended & minimal */}
        <g fill="none" stroke={foreLayer} strokeWidth="10" strokeLinecap="round">
          {/* deck */}
          <path d="M1080 318c80 0 140 0 220 0" />
          {/* arch */}
          <path d="M1080 318c65-42 155-42 220 0" />
          {/* simple truss hints */}
          <path d="M1100 318c18-18 42-28 70-28" strokeWidth="6" />
          <path d="M1172 318c16-14 36-22 58-22" strokeWidth="6" />
          <path d="M1238 318c14-12 32-18 52-18" strokeWidth="6" />
        </g>
        {/* bridge supports */}
        <g fill={foreLayer}>
          <rect x="1072" y="318" width="20" height="22" />
          <rect x="1298" y="318" width="22" height="22" />
        </g>

        {/* Water band */}
        <rect y="338" width="1440" height="82" fill={water} />

        {/* Gentle ripples */}
        <g stroke="#0f3b3f" strokeWidth="2" opacity="0.35">
          <path d="M120 360c40 12 80 12 120 0" />
          <path d="M340 372c30 10 60 10 90 0" />
          <path d="M540 364c36 12 72 12 108 0" />
          <path d="M780 370c32 10 64 10 96 0" />
          <path d="M1020 368c40 12 80 12 120 0" />
        </g>
      </svg>

      {/* Thin separator to the light content below */}
      <div className="h-2 w-full bg-[#0b2f31]" />
    </div>
  );
}
