import { Sora, Manrope } from "next/font/google";
import type { ReactNode } from "react";

const display = Sora({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-body" });

export default function LandingPage() {
  return (
    <main className={`min-h-[100dvh] bg-[#0E4F52] text-[#F4EDE4] ${display.variable} ${body.variable}`}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <HeroBackdrop />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-end gap-10 px-4 pt-16 pb-8 sm:pt-24 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h1 className="leading-none font-extrabold tracking-tight drop-shadow-sm" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px,10vw,140px)" }}>LOGS</h1>
            <p className="mt-3 text-3xl sm:text-4xl font-semibold" style={{ fontFamily: "var(--font-body)" }}>Building compliance</p>
            <p className="text-3xl sm:text-4xl font-semibold" style={{ fontFamily: "var(--font-body)" }}>made simple</p>
          </div>

          {/* Demo QR plaque */}
          <div className="justify-self-center md:justify-self-end">
            <QRDemoCard />
          </div>
        </div>

        {/* Value prop band with CTAs */}
        <div className="relative z-10 bg-[#F4EDE4] text-[#083C3F]">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 text-center">
            <p className="text-lg sm:text-xl leading-8 opacity-90" style={{ fontFamily: "var(--font-body)" }}>
              Digital logbook for New Zealand buildings. Staff scan a QR code to log inspections on site; records store securely and export to PDF in seconds.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href="/scan" className="inline-flex items-center justify-center rounded-xl bg-[#0E4F52] px-6 py-3 text-base font-semibold text-[#F4EDE4] shadow hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E4F52]">Scan a demo</a>
              <a href="/contact" className="inline-flex items-center justify-center rounded-xl border-2 border-[#0E4F52] bg-transparent px-6 py-3 text-base font-semibold text-[#0E4F52] hover:bg-[#0E4F52]/5">Contact us</a>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#F4EDE4] text-[#083C3F]">
        <div className="mx-auto max-w-6xl px-4 pt-10">
          <h2 className="text-center text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <FeatureCard icon={<IconQR />} title="Scan on site" copy="Place the printed QR at each asset or location. Staff scan it to open the correct digital form." />
            <FeatureCard icon={<IconChecklist />} title="Log the inspection" copy="Complete a short form on phone or tablet. Notes and pass/fail recorded instantly." />
            <FeatureCard icon={<IconPDF />} title="Export records" copy="Filter and export recent records to PDF for audits and reports." />
          </div>
        </div>

        {/* NZ-focused reassurance */}
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="rounded-2xl border border-[#E8DFD3] bg-white/60 p-6">
            <h3 className="text-xl font-semibold">Built for New Zealand sites</h3>
            <ul className="mt-3 grid gap-2 text-sm text-[#375255] sm:grid-cols-2">
              <li>Simple QR workflow for apartments, body corporates, facilities and contractors</li>
              <li>Keep at least 24 months of inspection history available</li>
              <li>Fast PDF exports for audit readiness</li>
              <li>Secure cloud storage and role-based access</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0E4F52] text-[#F4EDE4]">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm opacity-80">
          © {new Date().getFullYear()} LOGS — Building compliance made simple.
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

function HeroBackdrop() {
  return (
    <svg viewBox="0 0 1440 720" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <rect width="1440" height="720" fill="#0E4F52" />
      <g fill="#0C4349" opacity="0.55">
        <rect x="300" y="410" width="70" height="140" />
        <rect x="380" y="430" width="90" height="120" />
        <rect x="490" y="420" width="70" height="130" />
        <rect x="570" y="400" width="110" height="150" />
        <rect x="700" y="430" width="80" height="120" />
        <rect x="810" y="440" width="60" height="110" />
      </g>
      <g transform="translate(170,70)" fill="#0C4349">
        <polygon points="20,0 26,110 14,110" />
        <rect x="6" y="110" width="28" height="18" />
        <rect x="10" y="128" width="20" height="16" />
        <rect x="12" y="144" width="16" height="260" />
      </g>
      <rect x="0" y="510" width="1440" height="40" fill="#0C454A" />
      <g fill="#0B3E44">
        <path d="M1080 520 c40-30 80-30 120 0 h180 v18 h-420 v-18 z" />
        <rect x="1060" y="520" width="8" height="26" />
        <rect x="1140" y="520" width="8" height="26" />
        <rect x="1220" y="520" width="8" height="26" />
        <rect x="1300" y="520" width="8" height="26" />
      </g>
      <g fill="#0B3E44" opacity="0.5">
        <ellipse cx="220" cy="585" rx="120" ry="8" />
        <ellipse cx="520" cy="600" rx="160" ry="10" />
        <ellipse cx="880" cy="590" rx="140" ry="9" />
        <ellipse cx="1180" cy="610" rx="180" ry="11" />
      </g>
    </svg>
  );
}

function QRDemoCard() {
  return (
    <a href="/scan" className="block w-64 rounded-2xl bg-white/90 p-4 text-[#0E4F52] shadow-soft ring-1 ring-[#E8DFD3] hover:opacity-95">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm">Scan to log</p>
          <p className="text-xs opacity-70">Example asset</p>
        </div>
        <MiniQR />
      </div>
    </a>
  );
}

function MiniQR() {
  // Simple stylised QR - not a real code, just a visual
  const s = 6;
  const blk = (x: number, y: number, w = 1, h = 1) => (
    <rect key={`${x}-${y}-${w}-${h}`} x={x * s} y={y * s} width={w * s} height={h * s} fill="#0E4F52" />
  );
  const cells = [
    blk(0, 0, 5, 5), blk(1, 1, 3, 3),
    blk(13, 0, 5, 5), blk(14, 1, 3, 3),
    blk(0, 13, 5, 5), blk(1, 14, 3, 3),
    blk(8, 8), blk(9, 8), blk(8, 9), blk(10, 10), blk(6, 7), blk(11, 6), blk(12, 12), blk(7, 12)
  ];
  return (
    <svg width={s * 18} height={s * 18} viewBox={`0 0 ${s * 18} ${s * 18}`}>
      <rect width="100%" height="100%" fill="#EDEAE3" />
      {cells}
    </svg>
  );
}

function IconQR() {
  return (
    <svg className="h-6 w-6 text-[#0E4F52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM17 13h4v4M13 17h4v4" strokeLinecap="round" />
    </svg>
  );
}

function IconChecklist() {
  return (
    <svg className="h-6 w-6 text-[#0E4F52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <path d="M3 6l2 2 3-3M3 12l2 2 3-3M3 18l2 2 3-3" strokeLinecap="round" />
    </svg>
  );
}

function IconPDF() {
  return (
    <svg className="h-6 w-6 text-[#0E4F52]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v6h6" />
      <path d="M8 14h2a2 2 0 1 1 0 4H8zM13 14h1.5a1.5 1.5 0 0 1 0 3H13zM17 14h2v4" />
    </svg>
  );
}

