"use client";

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-[#0f3b3f] text-[#f5eadf]">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:px-8 md:pt-24">
          <h1 className="font-extrabold tracking-tight leading-none text-[clamp(72px,14vw,180px)]">LOGS</h1>
          <p className="mt-2 text-[clamp(22px,3.5vw,40px)] font-semibold tracking-tight">Building Compliance Made Simple</p>
        </div>

        {/* Skyline illustration */}
        <HeroSkyline />

        {/* Bottom divider strip */}
        <div className="h-2 w-full bg-[#0b2f31]" />
      </section>

      {/* Content + CTAs */}
      <section className="bg-[#f5eadf] text-[#0f2f32]">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
          <p className="mx-auto text-center text-lg leading-8 text-[#24393d]">
            LOGS provides a modern, digital logbook for inspections and compliance — accessible via QR codes on site, secure cloud storage, and instant reporting.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <a href="/demo" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold shadow-sm bg-[#114348] text-[#f5eadf] hover:bg-[#0f3b3f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3b3f]">Try a Demo</a>
            <a href="/contact" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold ring-1 ring-inset ring-[#2b5f63] text-[#0f3b3f] hover:bg-[#113c40]/10">Contact Us</a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-16 sm:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Why LOGS?</h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard title="Simple Logging" desc="QR codes link directly to digital inspection forms. Easy to use, even for non‑technical staff.">
              <IconClipboard />
            </FeatureCard>
            <FeatureCard title="Secure Records" desc="All data stored securely in the cloud, ensuring compliance with record‑keeping requirements.">
              <IconShield />
            </FeatureCard>
            <FeatureCard title="Easy Exports" desc="Download PDF records instantly for audits — 24 months always available at your fingertips.">
              <IconUpload />
            </FeatureCard>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-[#e7ded3] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 text-[#0f3b3f]">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf4f5] text-[#0f3b3f]">
          {children}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#3a4f53]">{desc}</p>
    </div>
  );
}

function HeroSkyline() {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 1440 420"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0f3b3f" />
            <stop offset="1" stopColor="#0e373b" />
          </linearGradient>
        </defs>
        <rect width="1440" height="420" fill="url(#skyGrad)" />

        {/* Distant buildings */}
        <g fill="#0b2d2f">
          <rect x="70" y="220" width="60" height="80" rx="3" />
          <rect x="140" y="205" width="40" height="95" rx="3" />
          <rect x="185" y="230" width="55" height="70" rx="3" />
          <rect x="245" y="210" width="46" height="90" rx="3" />
          <rect x="305" y="200" width="70" height="100" rx="3" />
          <rect x="395" y="215" width="58" height="85" rx="3" />
          <rect x="465" y="195" width="76" height="105" rx="3" />
        </g>

        {/* Sky Tower + foreground */}
        <g fill="#114348">
          <rect x="210" y="80" width="22" height="230" rx="8" />
          <rect x="188" y="70" width="66" height="18" rx="6" />
          <rect x="216" y="50" width="10" height="30" rx="3" />
          <rect x="198" y="300" width="50" height="30" rx="2" />

          <rect x="640" y="160" width="64" height="170" rx="3" />
          <rect x="715" y="145" width="56" height="185" rx="3" />
          <rect x="778" y="155" width="70" height="175" rx="3" />
          <rect x="862" y="135" width="58" height="195" rx="3" />
        </g>

        <g fill="#164c51">
          <path d="M560 340h80V180l-80 30v130z" />
          <path d="M510 330c0-18 40-34 90-34s90 16 90 34H510z" />
          <rect x="960" y="200" width="38" height="130" rx="3" />
        </g>

        {/* Bridge + water */}
        <g fill="none" stroke="#164c51" strokeWidth="10" strokeLinecap="round">
          <path d="M1080 318c80 0 140 0 220 0" />
          <path d="M1080 318c65-42 155-42 220 0" />
          <path d="M1100 318c18-18 42-28 70-28" strokeWidth="6" />
          <path d="M1172 318c16-14 36-22 58-22" strokeWidth="6" />
          <path d="M1238 318c14-12 32-18 52-18" strokeWidth="6" />
        </g>
        <g fill="#164c51">
          <rect x="1072" y="318" width="20" height="22" />
          <rect x="1298" y="318" width="22" height="22" />
        </g>

        <rect y="338" width="1440" height="82" fill="#0b2f31" />
        <g stroke="#0f3b3f" strokeWidth="2" opacity="0.35">
          <path d="M120 360c40 12 80 12 120 0" />
          <path d="M340 372c30 10 60 10 90 0" />
          <path d="M540 364c36 12 72 12 108 0" />
          <path d="M780 370c32 10 64 10 96 0" />
          <path d="M1020 368c40 12 80 12 120 0" />
        </g>
      </svg>
    </div>
  );
}

function IconClipboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M9 2h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V4a2 2 0 0 1 2-2Zm6 3V4H9v1h6ZM7 10h10v2H7v-2Zm0 4h10v2H7v-2Z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 2 4 5v6c0 5.25 3.4 9.78 8 11 4.6-1.22 8-5.75 8-11V5l-8-3Zm0 4.18 6 2.25V11c0 4.05-2.45 7.62-6 8.83C8.45 18.62 6 15.05 6 11V8.43l6-2.25Z" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 3 7 8h3v5h4V8h3l-5-5Zm-7 14h14v2H5v-2Z" />
    </svg>
  );
}

