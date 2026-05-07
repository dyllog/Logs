import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressionChart from '@/components/ProgressionChart';
import { recordsMen, results2025, upcoming } from '@/data/logsData';

const distTags = ['all', '42.2', '21.1'];

export default function Index() {
  const [distFilter, setDistFilter] = useState('all');
  const navigate = useNavigate();

  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="page">
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 48, alignItems: 'start' }} className="hero-grid">
            {/* Left */}
            <div>
              <div className="eyebrow mb-24">The New Zealand competitive running archive</div>
              <h1 className="serif" style={{ fontSize: 'clamp(40px,5vw,64px)', lineHeight: 1.02, margin: 0, letterSpacing: '-0.02em' }}>
                Every result. Every course record.<br />
                <em style={{ fontStyle: 'italic', color: 'var(--meta)' }}>The ones that ran them.</em>
              </h1>
              <p style={{ maxWidth: 520, marginTop: 28, fontSize: 15, lineHeight: 1.65, color: 'var(--ink-soft)' }}>
                LOGS holds the complete field data for New Zealand's major road, trail, and ultra events — going back, in the case of Auckland, to the 1992 inaugural running. No subscriptions, no promotion. A reference, kept current.
              </p>
              <div className="flex gap-8 mt-32" style={{ flexWrap: 'wrap' }}>
                {distTags.map(t => (
                  <button key={t} className={`pill ${distFilter === t ? 'active' : ''}`} onClick={() => setDistFilter(t)}>
                    {t === 'all' ? 'All distances' : t === '42.2' ? '42.2 km' : t === '21.1' ? '21.1 km' : t}
                  </button>
                ))}
              </div>
              <div className="mt-48 flex gap-32" style={{ fontVariantNumeric: 'tabular-nums' }}>
                <div>
                  <div className="serif" style={{ fontSize: 36, lineHeight: 1 }}>5</div>
                  <div className="label mt-8">Tracked events</div>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 36, lineHeight: 1 }}>239,741</div>
                  <div className="label mt-8">Finisher records</div>
                </div>
                <div>
                  <div className="serif" style={{ fontSize: 36, lineHeight: 1 }}>1992</div>
                  <div className="label mt-8">Earliest edition</div>
                </div>
              </div>
            </div>

            {/* Right — record card */}
            <div className="card-dark">
              <div className="flex between ai-baseline">
                <span className="label">Course record · Featured</span>
                <span className="label">Auckland Marathon</span>
              </div>
              <div className="mt-24" style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                <div className="serif" style={{ fontSize: 54, lineHeight: 1, letterSpacing: '-0.01em' }}>
                  {recordsMen.time}
                </div>
                <div style={{ color: 'var(--on-dark-meta)', fontSize: 12 }}>
                  <div>Men · 42.2 km</div>
                  <div>Set {recordsMen.year}</div>
                </div>
              </div>
              <div className="mt-24">
                <div className="serif" style={{ fontSize: 22 }}>{recordsMen.holder}</div>
                <div className="label" style={{ color: 'var(--on-dark-meta)' }}>
                  {recordsMen.club} · {recordsMen.age} · {recordsMen.nationality}
                </div>
              </div>
              <hr style={{ border: 0, borderTop: '0.5px solid var(--on-dark-rule)', margin: '28px 0 24px' }} />
              <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Progression · 2014–2019</div>
              <div style={{ color: 'var(--on-dark)' }}>
                <ProgressionChart data={recordsMen.progression} height={140} />
              </div>
              <div className="mt-16 flex between ai-baseline" style={{ fontSize: 11, color: 'var(--on-dark-meta)' }}>
                <span>Previous: {recordsMen.previous}</span>
                <Link to="/races/auckland-marathon" style={{ color: 'var(--on-dark)', textDecoration: 'underline', textUnderlineOffset: 4 }}>Race page →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming races */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Calendar</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>Upcoming races</h2>
            </div>
            <Link to="/races" className="btn-ghost">Full calendar →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderTop: '0.5px solid var(--rule)' }} className="upcoming-grid">
            {upcoming.map((r, i) => (
              <div key={i}
                style={{
                  padding: '24px 24px 28px',
                  borderRight: (i % 3 !== 2) ? '0.5px solid var(--rule-soft)' : 'none',
                  borderBottom: i < 3 ? '0.5px solid var(--rule-soft)' : 'none',
                  cursor: r.href ? 'pointer' : 'default',
                  transition: 'background 100ms',
                }}
                onClick={() => r.href && navigate(r.href)}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = r.href ? 'var(--hover)' : 'transparent'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div className="label">{r.date}</div>
                <div className="serif mt-8" style={{ fontSize: 22, lineHeight: 1.15 }}>{r.name}</div>
                <div className="dimmed mt-8" style={{ fontSize: 12 }}>{r.loc}</div>
                <div className="mt-16 label" style={{ color: 'var(--ink)' }}>{r.dists} km</div>
                {r.href && <div className="mt-8 dimmed" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>Race page →</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent results */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Most recent edition</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Auckland Marathon <span style={{ color: 'var(--meta)', fontStyle: 'italic' }}>— 2025</span>
              </h2>
            </div>
            <Link to="/races/auckland-marathon#results" className="btn-ghost">Full results →</Link>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Pos</th>
                <th>Name</th>
                <th>Category</th>
                <th>Club</th>
                <th className="num">Time</th>
              </tr>
            </thead>
            <tbody>
              {results2025.slice(0, 8).map(r => (
                <tr key={r.pos} className="row">
                  <td className={`pos ${r.pos === 1 ? 'pos-1' : ''}`}>{r.pos}</td>
                  <td>
                    <span className="serif" style={{ fontSize: 16 }}>{r.name}</span>
                    <span className="dimmed" style={{ marginLeft: 8, fontSize: 11 }}>{r.nat}</span>
                  </td>
                  <td className="dimmed">{r.cat}</td>
                  <td className="dimmed">{r.club}</td>
                  <td className="num time">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
