"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f3b3f] text-[#f5eadf]">
      <header className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-8 sm:px-8 md:pt-16">
          <h1 className="font-extrabold tracking-tight leading-none text-5xl sm:text-6xl md:text-7xl" aria-label="LOGS">LOGS</h1>
          <p className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">Building Compliance Made Simple</p>
          <p className="mt-6 max-w-3xl text-[#d6cbc0] leading-relaxed">
            LOGS provides a modern, digital logbook for inspections and compliance — accessible via QR codes on-site, secure cloud storage, and instant reporting.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/demo" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold shadow-sm bg-[#164c51] hover:bg-[#1a595f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d2c6ba]">Try a Demo</a>
            <a href="/contact" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold ring-1 ring-inset ring-[#2b5f63] hover:bg-[#113c40]/40">Contact Us</a>
          </div>
        </div>
      </header>

      <section className="bg-[#f5eadf] text-[#0f2f32]">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Why LOGS?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Simple Logging" desc="QR codes link directly to digital inspection forms. Easy for non-technical staff." icon="📝" />
            <Card title="Secure Records" desc="Data stored securely in the cloud to meet compliance requirements." icon="🔒" />
            <Card title="Easy Exports" desc="Export PDFs instantly for audits — 24 months always available." icon="📤" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc, icon }) {
  return (
    <div className="rounded-2xl border border-[#e7ded3] bg-white p-6 shadow-sm">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#415457] leading-relaxed">{desc}</p>
    </div>
  );
}

