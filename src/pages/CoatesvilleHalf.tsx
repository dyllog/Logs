import { useState, useMemo } from 'react';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { coatesvilleStats } from '@/data/aklSeriesData';

// Coatesville Half Marathon — rural roads, Coatesville / Dairy Flat, ~30–160 m asl
const elevation: [number, number][] = [
  [0,48],[1,52],[2,62],[3,78],[4,96],[5,118],[6,138],[7,154],
  [8,160],[9,152],[10,138],[11,122],[12,104],[13,88],[14,72],
  [15,60],[16,52],[17,64],[18,82],[19,106],[20,128],[21,96],[21.1,48],
];

const annotations = [
  { km: 0,    label: 'Coatesville' },
  { km: 8,    label: 'Ridge Rd' },
  { km: 14,   label: 'Dairy Flat' },
  { km: 21.1, label: 'Finish' },
];

const recordM = { time: '1:08:36', holder: 'Mitchell Rae',    nationality: 'NZL', club: '—', year: 2025, previous: '1:09:00 — Mitchell Rae (NZL) 2024' };
const recordW = { time: '1:22:10', holder: 'Lucy Shand',      nationality: 'NZL', club: '—', year: 2024, previous: '1:23:44 — Kate Mercer (NZL) 2019' };

export default function CoatesvilleHalf() {
  const [tab, setTab] = useState<'men' | 'women'>('men');

  const record = tab === 'men' ? recordM : recordW;

  const seedCR = useMemo(() => {
    const crM = Math.min(...coatesvilleStats.map(s => s.winnerM));
    const crW = Math.min(...coatesvilleStats.map(s => s.winnerW));
    return (tab === 'men' ? crM : crW) + 1;
  }, [tab]);

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Auckland Half Marathon Series · North Auckland</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Coatesville Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <span className="pill active">21.1 km</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Coatesville, Rodney</div></div>
              <div><div className="label mb-8">Course</div><div>Rural loop</div></div>
              <div><div className="label mb-8">Established</div><div>2016</div></div>
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
              Sealed road · Coatesville rural roads · rolling hills
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={elevation} annotations={annotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~420 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: '~420 m', sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',    sub: 'loop course' },
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
                <div>Sealed road · rolling to hilly</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>The hilliest race in the series. A loop through the rural roads of Coatesville and Dairy Flat northwest of Auckland. Ridge-line climbs offer panoramic views across the Waitākere Ranges and Hauraki Gulf. Altitude 30–160 m asl — a genuine test of strength and pacing.</div>
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
          <AveragesChart stats={coatesvilleStats} />
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
                <CRWinnerChart stats={coatesvilleStats} gender={tab} seedCR={seedCR} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
