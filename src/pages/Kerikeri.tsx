import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { kerikeriStats } from '@/data/kerikeriData';

const kerikeriElevation: [number, number][] = [
  [0, 10], [1, 30], [2, 65], [3, 95], [4, 80],
  [5, 55], [6, 40], [7, 60], [8, 85], [9, 110],
  [10, 90], [11, 65], [12, 45], [13, 70], [14, 95],
  [15, 75], [16, 50], [17, 35], [18, 20], [19, 15],
  [20, 10], [21, 10], [21.1, 10],
];

const kerikeriAnnotations = [
  { km: 0,    label: 'Start' },
  { km: 9,    label: 'Highest point' },
  { km: 21.1, label: 'Finish' },
];

export default function Kerikeri() {
  const navigate = useNavigate();

  const seedCRM = useMemo(() => Math.min(...kerikeriStats.map(s => s.winnerM)) + 1, []);
  const seedCRW = useMemo(() => Math.min(...kerikeriStats.map(s => s.winnerW)) + 1, []);

  const recordM = { time: '1:04:58', holder: 'Craig Lautenslager', nationality: 'NZL', club: '—', year: 2017, previous: '—' };
  const recordW = { time: '1:15:58', holder: 'Annika Pfitzinger',  nationality: 'NZL', club: '—', year: 2017, previous: '—' };

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Northland · Kerikeri</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Kerikeri Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <button className="pill active">21.1 km</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Kerikeri, Northland</div></div>
              <div><div className="label mb-8">Course</div><div>Rural loop</div></div>
              <div><div className="label mb-8">Next edition</div><div>2026</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://www.kerikerimarathon.co.nz/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>kerikerimarathon.co.nz ↗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Results */}
      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            dist="21.1 km"
            raceId="kerikeri-half"
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
              Road · Kerikeri rural loop
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={kerikeriElevation} annotations={kerikeriAnnotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~300 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: '~300 m', sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',    sub: 'loop to start' },
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
                <div>Sealed road</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>A challenging rural loop through the Bay of Islands countryside around Kerikeri. The course features rolling hills and significant climbs through the Northland farmland, rewarding runners with sweeping views across one of New Zealand's most historic regions. Held annually since 2003, it is one of Northland's premier running events.</div>
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
          <AveragesChart stats={kerikeriStats} />
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
          </div>
          <div className="card-dark">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginTop: 8 }}>
              {([['Men · Open', recordM], ['Women · Open', recordW]] as [string, typeof recordM][]).map(([label, rec], col) => (
                <div key={label} style={{ paddingRight: col === 0 ? 40 : 0, paddingLeft: col === 1 ? 40 : 0, borderRight: col === 0 ? '0.5px solid var(--on-dark-rule)' : 'none' }}>
                  <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>{label}</div>
                  <div className="serif" style={{ fontSize: 56, lineHeight: 0.95, letterSpacing: '-0.02em' }}>{rec.time}</div>
                  <div className="mt-20">
                    <div className="serif" style={{ fontSize: 22, lineHeight: 1.15 }}>{rec.holder}</div>
                    <div className="label mt-8" style={{ color: 'var(--on-dark-meta)' }}>
                      {rec.club} · {rec.nationality} · set {rec.year}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ color: 'var(--on-dark)', marginTop: 40, paddingTop: 32, borderTop: '0.5px solid var(--on-dark-rule)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Men · winner vs CR</div>
                <CRWinnerChart stats={kerikeriStats} gender="men" seedCR={seedCRM} />
              </div>
              <div>
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Women · winner vs CR</div>
                <CRWinnerChart stats={kerikeriStats} gender="women" seedCR={seedCRW} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
