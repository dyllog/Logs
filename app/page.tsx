"use client";

// Landing page matching the attached mock: large LOGS wordmark, stacked
// tagline, skyline, curved divider into a cream panel with intro + CTAs,
// then three feature cards.

export default function Home() {
  return (
    <main className="min-h-screen bg-logs-teal text-logs-cream">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-[64px] pb-6 sm:px-8 md:pt-20 text-center">
          {/* LOGS wordmark */}
          <h1
            className="font-extrabold leading-none tracking-tight"
            style={{ fontSize: "clamp(72px,12vw,160px)", letterSpacing: "-.02em" }}
          >
            LOGS
          </h1>

          {/* Tagline */}
          <p
            className="mt-4 font-extrabold leading-tight"
            style={{ fontSize: "clamp(24px,3.4vw,40px)", letterSpacing: "-.01em" }}
          >
            Building Compliance
            <span className="block">Made Simple</span>
          </p>
        </div>

        {/* Skyline + wave divider */}
        <HeroVisual />
      </header>

      {/* CREAM PANEL: intro + CTAs + Why LOGS */}
      <section className="bg-logs-cream text-logs-creamText">
        {/* Intro + CTAs */}
        <div className="mx-auto max-w-3xl px-6 pt-8 text-center">
          <p className="text-[18px] leading-[1.8] text-logs-creamText/90">
            LOGS provides a modern, digital logbook for inspections and compliance — accessible via QR codes on-site,
            secure cloud storage, and instant reporting.
          </p>
          <div className="mt-8 mb-10 flex justify-center gap-6">
            <a
              href="/demo"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-[18px] font-semibold shadow-soft bg-logs-fore text-logs-cream hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d2c6ba]"
            >
              Try a Demo
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-[18px] font-semibold ring-1 ring-inset ring-[#2b5f63] hover:bg-logs-teal/10"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Why LOGS */}
        <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
          <h2 className="text-center text-[34px] font-extrabold tracking-tight">Why LOGS?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              title="Simple Logging"
              desc="QR codes link directly to digital inspection forms. Easy to use, even for non-technical staff."
              icon={(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="#0F2F32" strokeWidth="2" />
                  <path d="M8 9h8M8 13h5M8 17h8" stroke="#0F2F32" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            />
            <Card
              title="Secure Records"
              desc="All data stored securely in the cloud, ensuring compliance with record keeping requirements."
              icon={(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="10" width="18" height="11" rx="2" stroke="#0F2F32" strokeWidth="2" />
                  <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="#0F2F32" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            />
            <Card
              title="Easy Exports"
              desc="Download PDF records instantly for audits — 24 months always available at your fingertips."
              icon={(
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="#0F2F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="4" y="15" width="16" height="6" rx="2" stroke="#0F2F32" strokeWidth="2" />
                </svg>
              )}
            />
          </div>

          <p className="mt-10 text-[13px] text-[#415457]/80">© {new Date().getFullYear()} LOGS — Building compliance made simple.</p>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc, icon }) {
  return (
    <div className="rounded-2xl border border-logs-cardBorder bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3 text-logs-teal">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-logs-cream/60">{icon}</div>
        <h3 className="text-[20px] font-extrabold">{title}</h3>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-[#415457]">{desc}</p>
    </div>
  );
}

// Hero skyline with curved divider into the cream section.
function HeroVisual() {
  const far = "#0B2D2F";   // logs.mid2
  const mid = "#114348";   // logs.mid1
  const fore = "#164C51";  // logs.fore
  const water = "#0B2F31"; // logs.water
  return (
    <div className="relative" aria-hidden="true">
      <svg viewBox="0 0 1440 520" xmlns="http://www.w3.org/2000/svg" className="block w-full">
        {/* teal sky */}
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0F3B3F" />
            <stop offset="1" stopColor="#0E373B" />
          </linearGradient>
        </defs>
        <rect width="1440" height="420" fill="url(#sky)" />

        {/* far skyline */}
        <g fill={far}>
          <rect x="120" y="250" width="80" height="80" rx="2" />
          <rect x="220" y="238" width="60" height="92" rx="2" />
          <rect x="300" y="260" width="70" height="70" rx="2" />
          <rect x="390" y="240" width="72" height="90" rx="2" />
          <rect x="480" y="230" width="84" height="100" rx="2" />
          <rect x="1260" y="230" width="64" height="100" rx="2" />
          <rect x="1340" y="210" width="72" height="120" rx="2" />
        </g>

        {/* Sky Tower */}
        <g fill={mid}>
          <rect x="260" y="120" width="24" height="220" rx="10" />
          <rect x="236" y="110" width="72" height="18" rx="8" />
          <rect x="266" y="84" width="12" height="34" rx="3" />
          <rect x="246" y="340" width="52" height="28" rx="3" />
        </g>

        {/* mid towers */}
        <g fill={mid}>
          <rect x="720" y="180" width="64" height="165" rx="3" />
          <rect x="792" y="170" width="58" height="180" rx="3" />
          <rect x="858" y="180" width="70" height="165" rx="3" />
          <rect x="936" y="160" width="60" height="195" rx="3" />
        </g>

        {/* fore buildings & pavilion */}
        <g fill={fore}>
          <path d="M628 347h84V205l-84 32v110z" />
          <path d="M576 340c0-20 44-36 98-36s98 16 98 36H576z" />
          <rect x="1034" y="210" width="40" height="132" rx="3" />
        </g>

        {/* Harbour bridge extended */}
        <g fill="none" stroke={fore} strokeWidth="10" strokeLinecap="round">
          <path d="M1140 330c90 0 150 0 240 0" />
          <path d="M1140 330c70-44 168-44 240 0" />
          <path d="M1162 330c20-18 46-28 76-28" strokeWidth="6" />
          <path d="M1238 330c18-14 40-22 64-22" strokeWidth="6" />
          <path d="M1306 330c16-12 36-18 58-18" strokeWidth="6" />
        </g>
        <g fill={fore}>
          <rect x="1132" y="330" width="22" height="22" />
          <rect x="1368" y="330" width="22" height="22" />
        </g>

        {/* water band */}
        <rect y="350" width="1440" height="70" fill={water} />
        <g stroke="#0F3B3F" strokeWidth="2" opacity=".35">
          <path d="M160 372c44 12 88 12 132 0" />
          <path d="M420 382c36 10 72 10 108 0" />
          <path d="M680 374c40 12 80 12 120 0" />
          <path d="M940 380c36 10 72 10 108 0" />
          <path d="M1200 376c44 12 88 12 132 0" />
        </g>

        {/* wave into cream */}
        <path d="M0,420 C220,470 420,490 720,490 C1020,490 1220,470 1440,420 L1440,520 L0,520 Z" fill="#F5EADF" />
      </svg>
    </div>
  );
}

