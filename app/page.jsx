"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f6f7fb",
        fontFamily: "system-ui, Arial, sans-serif",
        color: "#0A1F35",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        {/* Logo placeholder */}
        <div style={{ fontSize: 20, fontWeight: 700 }}>LOGS</div>

        {/* Nav placeholder */}
        <nav style={{ display: "flex", gap: 24 }}>
          <a href="#features" style={{ textDecoration: "none", color: "#0A1F35" }}>
            Features
          </a>
          <a href="#about" style={{ textDecoration: "none", color: "#0A1F35" }}>
            About
          </a>
          <a href="#contact" style={{ textDecoration: "none", color: "#0A1F35" }}>
            Contact
          </a>
        </nav>
      </header>

      {/* Hero section */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px 20px",
        }}
      >
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>
          Building Compliance Made Simple
        </h1>
        <p style={{ fontSize: 18, maxWidth: 600, marginBottom: 40, color: "#374151" }}>
          LOGS provides a modern, digital logbook for inspections and compliance —
          accessible via QR codes on-site, secure cloud storage, and instant reporting.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 16 }}>
          <a
            href="/scan?site=58A%20Tarawera%20Terrace"
            style={{
              background: "#2ECC71",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 6,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Try a Demo
          </a>
          <a
            href="#contact"
            style={{
              background: "#0A1F35",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 6,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Contact Us
          </a>
        </div>
      </section>

      {/* Feature highlights */}
      <section
        id="features"
        style={{
          background: "#fff",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 40 }}>Why LOGS?</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>📋 Simple Logging</h3>
            <p style={{ fontSize: 14, color: "#374151" }}>
              QR codes link directly to digital inspection forms. Easy to use, even for
              non-technical staff.
            </p>
          </div>
          <div
            style={{
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>🔒 Secure Records</h3>
            <p style={{ fontSize: 14, color: "#374151" }}>
              All data stored securely in the cloud, ensuring compliance with record
              keeping requirements.
            </p>
          </div>
          <div
            style={{
              padding: 20,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>📑 Easy Exports</h3>
            <p style={{ fontSize: 14, color: "#374151" }}>
              Download PDF records instantly for audits — 24 months always available at
              your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0A1F35",
          color: "#fff",
          textAlign: "center",
          padding: "20px",
          fontSize: 14,
        }}
      >
        © {new Date().getFullYear()} LOGS. All rights reserved. |{" "}
        <a href="#privacy" style={{ color: "#9ca3af", textDecoration: "none" }}>
          Privacy Policy
        </a>
      </footer>
    </main>
  );
}
