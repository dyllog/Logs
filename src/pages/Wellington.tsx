import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { wellingtonMarStats, wellingtonHalfStats } from '@/data/wellingtonData';

// Wellington Marathon — flat coastal harbour circuit, Westpac Stadium to Queens Wharf
const wellingtonElevationFull: [number, number][] = [
  [0,5],[1,6],[2,7],[3,8],[4,9],[5,10],[6,10],[7,9],[8,8],
  [9,7],[10,6],[11,5],[12,6],[13,7],[14,8],[15,9],[16,10],
  [17,11],[18,12],[19,11],[20,10],[21,9],[21.1,9],
  [22,8],[23,7],[24,6],[25,5],[26,6],[27,7],[28,8],
  [29,9],[30,10],[31,11],[32,12],[33,11],[34,10],[35,9],
  [36,8],[37,7],[38,6],[39,5],[40,5],[41,5],[42.2,5],
];

const wellingtonAnnotationsFull = [
  { km: 0,    label: 'Start · Westpac Stadium' },
  { km: 21.1, label: 'Halfway · Oriental Bay' },
  { km: 42.2, label: 'Finish · Queens Wharf' },
];

const wellingtonElevationHalf: [number, number][] = [
  [0,5],[1,6],[2,7],[3,8],[4,9],[5,10],[6,10],[7,9],[8,8],
  [9,7],[10,6],[11,5],[12,6],[13,7],[14,8],[15,9],[16,10],
  [17,11],[18,12],[19,11],[20,10],[21,9],[21.1,9],
];

const wellingtonAnnotationsHalf = [
  { km: 0,    label: 'Start' },
  { km: 10,   label: 'Oriental Bay' },
  { km: 21.1, label: 'Finish' },
];

export default function Wellington() {
  const [searchParams] = useSearchParams();
  const initDist = (searchParams.get('dist') === '21' || searchParams.get('race') === 'wellington-half') ? '21' : '42' as '42' | '21';
  const initYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const [distId, setDistId] = useState<'42' | '21'>(initDist);
  const navigate = useNavigate();
  const isHalf = distId === '21';

  const activeStats = isHalf ? wellingtonHalfStats : wellingtonMarStats;

  const seedCRM = useMemo(() => activeStats.length === 0 ? 0 : Math.min(...activeStats.map(s => s.winnerM)) + 1, [activeStats]);
  const seedCRW = useMemo(() => activeStats.length === 0 ? 0 : Math.min(...activeStats.map(s => s.winnerW)) + 1, [activeStats]);

  const marRecordM  = { time: '2:22:43', holder: 'Dan Lowry',       nationality: 'NZL', club: '—', year: 2017, previous: '—' };
  const marRecordW  = { time: '2:48:19', holder: 'Ingrid Cree',     nationality: 'NZL', club: '—', year: 2023, previous: '—' };
  const halfRecordM = { time: '1:04:32', holder: 'Toby Gualter',    nationality: 'NZL', club: '—', year: 2025, previous: '—' };
  const halfRecordW = { time: '1:13:37', holder: 'Lisa Cross',      nationality: 'NZL', club: '—', year: 2025, previous: '—' };

  const recordM = isHalf ? halfRecordM : marRecordM;
  const recordW = isHalf ? halfRecordW : marRecordW;

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Wellington · Waterfront</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Wellington Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {([['42', '42.2 km'], ['21', '21.1 km']] as ['42'|'21', string][]).map(([id, label]) => (
                  <button key={id} className={`pill ${distId === id ? 'active' : ''}`} onClick={() => setDistId(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Wellington, NZ</div></div>
              <div><div className="label mb-8">Course</div><div>Flat waterfront circuit</div></div>
              <div><div className="label mb-8">Next edition</div><div>Jun 2026</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://www.wellingtonmarathon.co.nz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>wellingtonmarathon.co.nz ↗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Results */}
      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            dist={isHalf ? '21.1 km' : '42.2 km'}
            raceId={isHalf ? 'wellington-half' : 'wellington-mar'}
            initialYear={initYear}
            onOpenAthlete={() => navigate('/athletes')}
          />
        </div>
      </section>

      {/* 2. Course profile */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview · {isHalf ? '21.1 km' : '42.2 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {isHalf ? 'Half marathon' : 'Marathon'} course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Road · Wellington waterfront
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart
                data={isHalf ? wellingtonElevationHalf : wellingtonElevationFull}
                annotations={isHalf ? wellingtonAnnotationsHalf : wellingtonAnnotationsFull}
              />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~65 m',  sub: '↑ cumulative' },
                  { label: 'Descent', val: '~65 m',  sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',    sub: 'point to point' },
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
                <div>Sealed road · Wellington waterfront promenade</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>One of New Zealand's fastest road races, the Wellington Marathon runs along the city's iconic waterfront. The predominantly flat course hugs the harbour from Westpac Stadium through the CBD, along Oriental Parade, and back — ideal for personal bests. The half marathon has been held since 1996; the full marathon joined in 2005.</div>
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
              <div className="eyebrow mb-8">Averages · {isHalf ? '21.1 km' : '42.2 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Median finish · winning times · by year
              </h2>
            </div>
          </div>
          <AveragesChart stats={activeStats} />
        </div>
      </section>

      {/* 4. Course records */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course records · {isHalf ? '21.1 km' : '42.2 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {isHalf ? '21.1 km' : '42.2 km'} · current marks
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
                <CRWinnerChart stats={activeStats} gender="men" seedCR={seedCRM} />
              </div>
              <div>
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Women · winner vs CR</div>
                <CRWinnerChart stats={activeStats} gender="women" seedCR={seedCRW} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
