export default function Rotorua() {
  const raceInfo = [
    { label: 'Location', val: 'Rotorua, Bay of Plenty' },
    { label: 'Course', val: 'Lake Rotorua loop · road' },
    { label: 'Distances', val: '42.2 km · 21.1 km · 10 km' },
    { label: 'Next edition', val: '2 May 2027' },
    { label: 'Established', val: '1967' },
    { label: 'Organiser', val: 'Rotorua Marathon Inc.' },
  ];

  const courseStats = [
    { label: 'Climb',   val: '~120 m',  sub: '↑ cumulative' },
    { label: 'Descent', val: '~120 m',  sub: '↓ cumulative' },
    { label: 'Net',     val: '0 m',     sub: 'loop course' },
  ];

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Established 1967 · Lake Rotorua</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Rotorua Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {['42.2 km', '21.1 km', '10 km'].map(d => (
                  <span key={d} className="pill">{d}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              {raceInfo.map(({ label, val }) => (
                <div key={label}>
                  <div className="label mb-8">{label}</div>
                  <div>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results — coming soon */}
      <section id="results" className="section">
        <div className="page">
          <div className="mb-24">
            <div className="eyebrow mb-8">Results</div>
            <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              Race results
            </h2>
          </div>
          <div style={{ padding: '64px 0', borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
            <div className="dimmed" style={{ fontSize: 13, textAlign: 'center' }}>
              Results archive in progress — check back soon.
            </div>
          </div>
        </div>
      </section>

      {/* Course profile */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Marathon course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Full loop of Lake Rotorua · flat to rolling · sealed road
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)', maxWidth: 480 }}>
            {courseStats.map((item, i) => (
              <div key={i} style={{ padding: '20px 16px', borderRight: i < 2 ? '0.5px solid var(--rule-soft)' : 'none' }}>
                <div className="label">{item.label}</div>
                <div className="serif mt-8" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>{item.val}</div>
                <div className="dimmed mt-8" style={{ fontSize: 10.5 }}>{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-32" style={{ maxWidth: 600, fontSize: 13, lineHeight: 1.7, color: 'var(--ink-soft)' }}>
            <p style={{ margin: 0 }}>
              One of New Zealand's oldest and most beloved road marathons, the Rotorua Marathon has circled Lake Rotorua since 1967.
              The loop course is renowned for its flat to gently rolling terrain, geothermal landscape, and reliable fast times —
              it has produced some of New Zealand's most notable marathon performances at both elite and age-group level.
            </p>
          </div>
        </div>
      </section>

      {/* Records — placeholder */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course records</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                42.2 km · current marks
              </h2>
            </div>
          </div>
          <div style={{ padding: '64px 0', borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
            <div className="dimmed" style={{ fontSize: 13, textAlign: 'center' }}>
              Course record archive in progress — check back soon.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
