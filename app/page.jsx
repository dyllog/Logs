"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-logs-teal text-[#F5EADF]">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-[56px] pb-8 sm:px-8 md:pt-16">
          {/* BIG LOGO WORDMARK */}
          <h1
            className="font-extrabold tracking-tight leading-none"
            style={{ fontSize: 'clamp(56px, 9vw, 112px)' }}
          >
            LOGS
          </h1>

          {/* TAGLINE */}
          <p
            className="mt-3 font-semibold tracking-tight"
            style={{ fontSize: 'clamp(20px, 3.2vw, 36px)' }}
          >
            Building Compliance
            <span className="block">Made Simple</span>
          </p>

          {/* SUBTEXT */}
          <p className="mt-6 max-w-3xl text-logs-creamSub leading-relaxed text-[16px] md:text-[18px]">
            LOGS provides a modern, digital logbook for inspections and compliance — accessible via QR codes on-site,
            secure cloud storage, and instant reporting.
          </p>

          {/* CTAS */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/demo"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-[16px] font-semibold shadow-sm
                         bg-logs-fore hover:bg-[#1A595F] focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-offset-2 focus-visible:outline-[#D2C6BA]"
            >
              Try a Demo
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-[16px] font-semibold
                         ring-1 ring-inset ring-[#2B5F63] hover:bg-[#113C40]/40 text-[#F5EADF]"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* SKYLINE */}
        <Skyline />
      </header>

      {/* WHY LOGS */}
      <section className="bg-logs-cream text-logs-creamText">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
          <h2 className="text-center text-[28px] sm:text-[34px] font-extrabold tracking-tight">Why LOGS?</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              title="Simple Logging"
              desc="QR codes link directly to digital inspection forms. Easy to use, even for non-technical staff."
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="#0F2F32" strokeWidth="2"/>
                  <path d="M8 9h8M8 13h5M8 17h8" stroke="#0F2F32" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
            />
            <Card
              title="Secure Records"
              desc="All data stored securely in the cloud, ensuring compliance with record keeping requirements."
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="10" width="18" height="11" rx="2" stroke="#0F2F32" strokeWidth="2"/>
                  <path d="M7 10V7a5 5 0 0110 0v3" stroke="#0F2F32" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              }
            />
            <Card
              title="Easy Exports"
              desc="Download PDF records instantly for audits — 24 months always available at your fingertips."
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="#0F2F32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="4" y="15" width="16" height="6" rx="2" stroke="#0F2F32" strokeWidth="2"/>
                </svg>
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc, icon }) {
  return (
    <div className="rounded-2xl border border-logs-cardBorder bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-logs-cream/60">{icon}</div>
        <h3 className="text-[18px] font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-[14.5px] leading-relaxed text-[#415457]">{desc}</p>
    </div>
  );
}

/** Inline SVG skyline to match the mock exactly (no plane/birds/church; extended bridge). */
function Skyline() {
  const fillLayer = "#0B2D2F";
  const midLayer  = "#114348";
  const foreLayer = "#164C51";
  const water     = "#0B2F31";

  return (
    <div className="relative" aria-hidden="true">
      <svg viewBox="0 0 1440 420" xmlns="http://www.w3.org/2000/svg" className="block w-full">
        <defs>
          <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0F3B3F" />
            <stop offset="1" stopColor="#0E373B" />
          </linearGradient>
        </defs>

        <rect width="1440" height="420" fill="url(#skyGrad)" />

        {/* distant blocks */}
        <g fill={fillLayer}>
          <rect x="60"  y="230" width="60" height="80"  rx="2" />
          <rect x="136" y="215" width="40" height="95"  rx="2" />
          <rect x="182" y="240" width="55" height="70"  rx="2" />
          <rect x="242" y="220" width="46" height="90"  rx="2" />
          <rect x="302" y="210" width="70" height="100" rx="2" />
          <rect x="392" y="225" width="58" height="85"  rx="2" />
          <rect x="462" y="205" width="76" height="105" rx="2" />
          <rect x="548" y="235" width="26" height="75"  rx="2" />
          <rect x="1198" y="215" width="55" height="95" rx="2" />
          <rect x="1268" y="195" width="70" height="115" rx="2" />
        </g>

        {/* Sky Tower */}
        <g fill={midLayer}>
          <rect x="210" y="90" width="22" height="230" rx="8" />
          <rect x="188" y="80" width="66" height="18" rx="6" />
          <rect x="216" y="60" width="10" height="30" rx="3" />
          <rect x="198" y="310" width="50" height="30" rx="2" />
        </g>

        {/* mid/foreground towers */}
        <g fill={midLayer}>
          <rect x="640" y="170" width="64" height="170" rx="3" />
          <rect x="715" y="155" width="56" height="185" rx="3" />
          <rect x="778" y="165" width="70" height="175" rx="3" />
          <rect x="862" y="145" width="58" height="195" rx="3" />
        </g>

        <g fill={foreLayer}>
          <path d="M560 350h80V190l-80 30v130z" />
          <path d="M510 340c0-18 40-34 90-34s90 16 90 34H510z" />
          <rect x="960" y="210" width="38" height="130" rx="3" />
        </g>

        {/* Extended Harbour Bridge */}
        <g fill="none" stroke={foreLayer} strokeWidth="10" strokeLinecap="round">
          <path d="M1080 328c80 0 140 0 220 0" />
          <path d="M1080 328c65-42 155-42 220 0" />
          <path d="M1100 328c18-18 42-28 70-28" strokeWidth="6" />
          <path d="M1172 328c16-14 36-22 58-22" strokeWidth="6" />
          <path d="M1238 328c14-12 32-18 52-18"  strokeWidth="6" />
        </g>
        <g fill={foreLayer}>
          <rect x="1072" y="328" width="20" height="22" />
          <rect x="1298" y="328" width="22" height="22" />
        </g>

        {/* water */}
        <rect y="348" width="1440" height="72" fill={water} />
        <g stroke="#0F3B3F" strokeWidth="2" opacity=".35">
          <path d="M120 365c40 12 80 12 120 0" />
          <path d="M340 377c30 10 60 10 90 0" />
          <path d="M540 369c36 12 72 12 108 0" />
          <path d="M780 375c32 10 64 10 96 0" />
          <path d="M1020 373c40 12 80 12 120 0" />
        </g>
      </svg>

      {/* thin divider matching the mock */}
      <div className="h-2 w-full bg-logs-water" />
    </div>
  );
}
