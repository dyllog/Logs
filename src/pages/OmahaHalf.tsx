import { useState, useMemo } from 'react';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { omahaStats } from '@/data/aklSeriesData';

// Omaha Half Marathon — Omaha Spit and coastal roads, Matakana Coast, ~0–25 m asl
const elevation: [number, number][] = [
  [0,4],[1,4],[2,5],[3,6],[4,7],[5,8],[6,8],[7,9],
  [8,10],[9,11],[10,12],[11,13],[12,14],[13,15],[14,16],
  [15,18],[16,20],[17,22],[18,20],[19,16],[20,10],[21,6],[21.1,4],
];

const annotations = [
  { km: 0,    label: 'Omaha Beach' },
  { km: 10,   label: 'Matakana' },
  { km: 16,   label: 'Turnpoint' },
  { km: 21.1, label: 'Finish' },
];

const recordM = { time: '1:05:18', holder: 'Liam Hayden',    nationality: 'NZL', club: '—', year: 2025, previous: '1:06:12 — Liam Hayden (NZL) 2024' };
const recordW = { time: '1:18:44', holder: 'Emma Cochrane',  nationality: 'NZL', club: '—', year: 2024, previous: '1:20:02 — Emma Cochrane (NZL) 2023' };

export default function OmahaHalf() {
  const [tab, setTab] = useState<'men' | 'women'>('men');

  const record = tab === 'men' ? recordM : recordW;

  const seedCR = useMemo(() => {
    const crM = Math.min(...omahaStats.map(s => s.winnerM));
    const crW = Math.min(...omahaStats.map(s => s.winnerW));
    return (tab === 'men' ? crM : crW) + 1;
  }, [tab]);

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Auckland Half Marathon Series · Matakana Coast</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Omaha Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <span className="pill active">21.1 km</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Omaha, Rodney</div></div>
              <div><div className="label mb-8">Course</div><div>Coastal out-and-back</div></div>
              <div><div className="label mb-8">Established</div><div>2018</div></div>
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
              Sealed road · Omaha Spit · Matakana Coast
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={elevation} annotations={annotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~60 m',  sub: '↑ cumulative' },
                  { label: 'Descent', val: '~60 m',  sub: '↓ cumulative' },
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
                <div>Sealed road · flat to gently undulating</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>One of the flattest courses in the series. Starting from Omaha Beach on the Matakana Coast, the route traces sealed roads through the Omaha Spit and inland to Matakana village before returning. Sea breezes and holiday-season atmosphere. Altitude 0–25 m asl.</div>
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
          <AveragesChart stats={omahaStats} />
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
                <CRWinnerChart stats={omahaStats} gender={tab} seedCR={seedCR} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
