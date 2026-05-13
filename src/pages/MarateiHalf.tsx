import { useState, useMemo } from 'react';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { marateiStats } from '@/data/aklSeriesData';

// Maratei Half Marathon — coastal route, Tāmaki Makaurau, ~0–25 m asl
const elevation: [number, number][] = [
  [0,5],[1,6],[2,7],[3,9],[4,11],[5,13],[6,14],[7,16],
  [8,18],[9,20],[10,22],[11,22],[12,20],[13,18],[14,15],
  [15,13],[16,11],[17,9],[18,8],[19,7],[20,6],[21,5],[21.1,5],
];

const annotations = [
  { km: 0,    label: 'Start' },
  { km: 10,   label: 'Halfway out' },
  { km: 21.1, label: 'Finish' },
];

const recordM = { time: '1:06:18', holder: 'James Hewitt',    nationality: 'NZL', club: '—', year: 2025, previous: '1:07:06 — James Hewitt (NZL) 2024' };
const recordW = { time: '1:19:48', holder: 'Rachel Norris',   nationality: 'NZL', club: '—', year: 2024, previous: '1:21:30 — Tania Webb (NZL) 2022' };

export default function MarateiHalf() {
  const [tab, setTab] = useState<'men' | 'women'>('men');

  const record = tab === 'men' ? recordM : recordW;

  const seedCR = useMemo(() => {
    const crM = Math.min(...marateiStats.map(s => s.winnerM));
    const crW = Math.min(...marateiStats.map(s => s.winnerW));
    return (tab === 'men' ? crM : crW) + 1;
  }, [tab]);

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Auckland Half Marathon Series · Tāmaki Makaurau</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Maratei Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <span className="pill active">21.1 km</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Tāmaki Makaurau</div></div>
              <div><div className="label mb-8">Course</div><div>Coastal out-and-back</div></div>
              <div><div className="label mb-8">Established</div><div>2019</div></div>
              <div><div className="label mb-8">Series</div><div>Auckland Half Marathon Series</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Course profile */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview · 21.1 km</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Half marathon course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Sealed road · coastal route · flat to gently rolling
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={elevation} annotations={annotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~120 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: '~120 m', sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',    sub: 'out-and-back' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '20px 16px', borderRight: i < 2 ? '0.5px solid var(--rule-soft)' : 'none' }}>
                    <div className="label">{item.label}</div>
                    <div className="serif mt-8" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>{item.val}</div>
                    <div className="dimmed mt-8" style={{ fontSize: 10.5 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="mt-24" style={{ fontSize: 12, lineHeight: 1.6 }}>
                <div className="label mb-8">Surface</div>
                <div>Sealed road · flat to gently rolling</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>A coastal half marathon in Tāmaki Makaurau. The predominantly flat out-and-back course follows sealed roads along the shoreline, making it an accessible and fast race for all ability levels. Altitude 0–25 m asl with consistent harbour views.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Averages */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Averages · 21.1 km</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Median finish · winning times · by year
              </h2>
            </div>
          </div>
          <AveragesChart stats={marateiStats} />
        </div>
      </section>

      {/* 3. Course records */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course records · 21.1 km</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                21.1 km · current marks
              </h2>
            </div>
            <div className="flex gap-8">
              <button className={`pill ${tab === 'men' ? 'active' : ''}`} onClick={() => setTab('men')}>Men</button>
              <button className={`pill ${tab === 'women' ? 'active' : ''}`} onClick={() => setTab('women')}>Women</button>
            </div>
          </div>
          <div className="card-dark">
            <div className="flex between ai-baseline">
              <span className="label">{tab === 'men' ? 'Men · Open' : 'Women · Open'} · 21.1 km</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, marginTop: 24, alignItems: 'start' }} className="record-grid">
              <div>
                <div className="serif" style={{ fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.02em' }}>{record.time}</div>
                <div className="mt-24">
                  <div className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>{record.holder}</div>
                  <div className="label mt-8" style={{ color: 'var(--on-dark-meta)' }}>
                    {record.club} · {record.nationality} · set {record.year}
                  </div>
                </div>
                {record.previous !== '—' && (
                  <div className="mt-24" style={{ fontSize: 11, color: 'var(--on-dark-meta)', letterSpacing: '0.04em' }}>
                    Previous: <span style={{ color: 'var(--on-dark)' }}>{record.previous}</span>
                  </div>
                )}
              </div>
              <div style={{ color: 'var(--on-dark)' }}>
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Winner vs CR · historical</div>
                <CRWinnerChart stats={marateiStats} gender={tab} seedCR={seedCR} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
