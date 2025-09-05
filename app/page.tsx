import { Sora, Manrope } from "next/font/google";
import type { ReactNode } from "react";

const display = Sora({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-body" });

export default function LandingPage() {
  return (
    <main className={`min-h-[100dvh] bg-[#0E4F52] text-[#F4EDE4] ${display.variable} ${body.variable}`}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* skyline illustration (improved) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg viewBox="0 0 1440 720" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <defs>
              <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0E4F52" />
                <stop offset="100%" stopColor="#0C454A" />
              </linearGradient>
            </defs>
            <rect width="1440" height="720" fill="#0E4F52" />
            {/* distant blocks */}
            <g fill="#0C4349" opacity="0.55">
              <rect x="300" y="410" width="70" height="140" />
              <rect x="380" y="430" width="90" height="120" />
              <rect x="490" y="420" width="70" height="130" />
              <rect x="570" y="400" width="110" height="150" />
              <rect x="700" y="430" width="80" height="120" />
              <rect x="810" y="440" width="60" height="110" />
            </g>
            {/* Sky Tower (left) */}
            <g transform="translate(170,70)" fill="#0C4349">
              <polygon points="20,0 26,110 14,110" />
              <rect x="6" y="110" width="28" height="18" />
              <rect x="10" y="128" width="20" height="16" />
              <rect x="12" y="144" width="16" height="260" />
            </g>
            {/* foreground platforms */}
            <rect x="0" y="510" width="1440" height="40" fill="#0C454A" />
            {/* bridge (right) */}
            <g fill="#0B3E44">
              <path d="M1080 520 c40-30 80-30 120 0 h180 v18 h-420 v-18 z" />
              <rect x="1060" y="520" width="8" height="26" />
              <rect x="1140" y="520" width="8" height="26" />
              <rect x="1220" y="520" width="8" height="26" />
              <rect x="1300" y="520" width="8" height="26" />
            </g>
            {/* water ripples */}
            <g fill="#0B3E44" opacity="0.5">
              <ellipse cx="220" cy="585" rx="120" ry="8" />
              <ellipse cx="520" cy="600" rx="160" ry="10" />
              <ellipse cx="880" cy="590" rx="140" ry="9" />
              <ellipse cx="1180" cy="610" rx="180" ry="11" />
            </g>
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-10 sm:pt-28 text-center">
          <h1 className="text-[96px] sm:text-[128px] leading-none font-extrabold tracking-tight drop-shadow-sm" style={{ fontFamily: "var(--font-display)" }}>LOGS</h1>
          <p className="mt-4 text-3xl sm:text-4xl font-semibold text-[#F4EDE4]" style={{ fontFamily: "var(--font-body)" }}>Building Compliance</p>
          <p className="text-3xl sm:text-4xl font-semibold text-[#F4EDE4]" style={{ fontFamily: "var(--font-body)" }}>Made Simple</p>
        </div>

        {/* cream panel */}
        <div className="relative z-10 bg-[#F4EDE4] text-[#083C3F]">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14 text-center">
            <p className="text-lg sm:text-xl leading-8 opacity-90" style={{ fontFamily: "var(--font-body)" }}>
              LOGS provides a modern, digital logbook for inspections and compliance — accessible via QR codes on-site, secure cloud storage, and instant exports.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl border border-transparent bg-[#0E4F52] px-6 py-3 text-base font-semibold text-[#F4EDE4] shadow hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E4F52]"
              >
                Try a Demo
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#0E4F52] bg-transparent px-6 py-3 text-base font-semibold text-[#0E4F52] hover:bg-[#0E4F52]/5"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#F4EDE4] text-[#083C3F]">
        <div className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Why LOGS?</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E4F52] text-[#F4EDE4] font-bold">QR</span>}
              title="Simple Logging"
              copy="QR codes link directly to digital inspection forms. Easy to use, even for non‑technical staff."
            />
            <FeatureCard
              icon={<div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E4F52] text-[#F4EDE4]">🔒</div>}
              title="Secure Records"
              copy="All data stored securely in the cloud, ensuring compliance with record‑keeping requirements."
            />
            <FeatureCard
              icon={<div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0E4F52] text-[#F4EDE4]">⬇️</div>}
              title="Easy Exports"
              copy="Download PDF records instantly for audits — 23 months always available at your fingertips."
            />
          </div>
        </div>
      </section>

      {/* FOOTER (optional minimal) */}
      <footer className="bg-[#0E4F52] text-[#F4EDE4]">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm opacity-80">
          © {new Date().getFullYear()} Logs — Building compliance made simple.
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-2xl border border-[#E8DFD3] bg-white/50 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="shrink-0">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#375255]">{copy}</p>
        </div>
      </div>
    </div>
  );
}

