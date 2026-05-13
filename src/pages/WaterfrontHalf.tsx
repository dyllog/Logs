import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { waterfrontStats } from '@/data/aklSeriesData';

// Waterfront Half Marathon — Auckland CBD waterfront, Waitemata Harbour, ~0–12 m asl
const elevation: [number, number][] = [
  [0,4],[1,4],[2,5],[3,5],[4,6],[5,7],[6,7],[7,8],
  [8,9],[9,10],[10,11],[11,12],[12,11],[13,10],[14,9],
  [15,8],[16,7],[17,6],[18,6],[19,5],[20,5],[21,4],[21.1,4],
];

const annotations = [
  { km: 0,    label: 'Viaduct Harbour' },
  { km: 7,    label: 'St Heliers' },
  { km: 14,   label: 'Turnpoint' },
  { km: 21.1, label: 'Finish · Britomart' },
];

const recordM = { time: '1:03:12', holder: 'Alex Perry',      nationality: 'NZL', club: '—', year: 2025, previous: '1:03:36 — Alex Perry (NZL) 2024' };
const recordW = { time: '1:15:54', holder: 'Sophie Watts',    nationality: 'NZL', club: '—', year: 2024, previous: '1:17:08 — Jess McKenzie (NZL) 2023' };

export default function WaterfrontHalf() {
  const [tab, setTab] = useState<'men' | 'women'>('men');
  const navigate = useNavigate();

  const record = tab === 'men' ? recordM : recordW;

  const seedCR = useMemo(() => {
    const crM = Math.min(...waterfrontStats.map(s => s.winnerM));
    const crW = Math.min(...waterfrontStats.map(s => s.winnerW));
    return (tab === 'men' ? crM : crW) + 1;
  }, [tab]);

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Auckland Half Marathon Series · Auckland CBD</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Waterfront Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <span className="pill active">21.1 km</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Auckland CBD</div></div>
              <div><div className="label mb-8">Course</div><div>Waterfront out-and-back</div></div>
              <div><div className="label mb-8">Established</div><div>2015</div></div>
              <div><div className="label mb-8">Series</div><div>Auckland Half Marathon Series</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Results */}
      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            dist="21.1 km"
            raceId="waterfront-half"
            onOpenAthlete={() => navigate('/athletes')}
          />
        </div>
      </section>

      {/* 2. Course profile */}
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
              Sealed road · Waitemata waterfront · flat and fast
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={elevation} annotations={annotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~40 m',  sub: '↑ cumulative' },
                  { label: 'Descent', val: '~40 m',  sub: '↓ cumulative' },
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
                <div>Sealed road · flat</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>The fastest race in the series and the largest by field. Starting from the Viaduct Harbour, the course traces Auckland's iconic waterfront promenade east through Mission Bay to St Heliers before returning to a Britomart finish. Altitude 0–12 m asl — ideal for personal bests.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Averages */}
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
          <AveragesChart stats={waterfrontStats} />
        </div>
      </section>

      {/* 4. Course records */}
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
                <CRWinnerChart stats={waterfrontStats} gender={tab} seedCR={seedCR} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
