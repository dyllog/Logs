import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { chcStats, chcHalfStats } from '@/data/chcData';

// Christchurch Marathon — flat river loop, ~15m asl
const chcElevation: [number, number][] = [
  [0,15],[1,15],[2,16],[3,16],[4,15],[5,15],[6,14],[7,14],
  [8,15],[9,15],[10,15],[11,16],[12,16],[13,15],[14,15],[15,15],
  [16,14],[17,14],[18,15],[19,15],[20,15],[21.1,15],
];

const chcAnnotations = [
  { km: 0,    label: 'Hagley Park' },
  { km: 10,   label: 'Ferrymead' },
  { km: 21.1, label: 'Finish' },
];

const chcElevationFull: [number, number][] = [
  [0,15],[1,15],[2,16],[3,16],[4,15],[5,15],[6,14],[7,14],
  [8,15],[9,15],[10,15],[11,16],[12,16],[13,15],[14,15],[15,15],
  [16,14],[17,14],[18,15],[19,15],[20,15],[21,15],[22,15],[23,16],
  [24,16],[25,15],[26,14],[27,14],[28,15],[29,15],[30,15],[31,16],
  [32,16],[33,15],[34,15],[35,14],[36,14],[37,15],[38,15],[39,15],
  [40,15],[41,15],[42.2,15],
];

const chcAnnotationsFull = [
  { km: 0,    label: 'Hagley Park' },
  { km: 10,   label: 'Ferrymead' },
  { km: 21.1, label: 'Halfway' },
  { km: 35,   label: 'Return' },
  { km: 42.2, label: 'Finish' },
];

export default function Christchurch() {
  const [searchParams] = useSearchParams();
  const initDist = (searchParams.get('dist') === '21' || searchParams.get('race') === 'chc-half') ? '21' : '42' as '42' | '21';
  const initYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

  const [distId, setDistId] = useState<'42' | '21'>(initDist);
  const navigate = useNavigate();
  const isHalf = distId === '21';

  const activeStats = isHalf ? chcHalfStats : chcStats;

  const seedCRM = useMemo(() => activeStats.length === 0 ? 0 : Math.min(...activeStats.map(s => s.winnerM)) + 1, [activeStats]);
  const seedCRW = useMemo(() => activeStats.length === 0 ? 0 : Math.min(...activeStats.map(s => s.winnerW)) + 1, [activeStats]);

  const marRecordM  = { time: '2:16:28', holder: 'Samuel Wreford',   nationality: 'NZL', club: '—', year: 2014, previous: '2:17:30 — Samuel Wreford (NZL) 2012' };
  const marRecordW  = { time: '2:38:14', holder: 'Becky Aitkenhead', nationality: 'NZL', club: '—', year: 2026, previous: '2:39:17 — Alice Mason (NZL) 2019' };
  const halfRecordM = { time: '1:03:15', holder: 'Toby Gualter',     nationality: 'NZL', club: '—', year: 2026, previous: '1:03:30 — Toby Gualter (NZL) 2025' };
  const halfRecordW = { time: '1:12:28', holder: 'Lisa Weightman',   nationality: 'AUS', club: '—', year: 2009, previous: '1:13:08 — Kate Smyth (AUS) 2007' };

  const recordM = isHalf ? halfRecordM : marRecordM;
  const recordW = isHalf ? halfRecordW : marRecordW;

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Canterbury · Hagley Park loop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Christchurch Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {([['42', '42.2 km'], ['21', '21.1 km']] as ['42'|'21', string][]).map(([id, label]) => (
                  <button key={id} className={`pill ${distId === id ? 'active' : ''}`} onClick={() => setDistId(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Christchurch, Canterbury</div></div>
              <div><div className="label mb-8">Course</div><div>Hagley Park river loop</div></div>
              <div><div className="label mb-8">Next edition</div><div>TBC 2027</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://www.christchurchmarathon.co.nz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>christchurchmarathon.co.nz ↗</a></div>
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
            raceId={isHalf ? 'chc-half' : 'chc'}
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
              Flat sealed road · Avon River corridor · central Christchurch
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart
                data={isHalf ? chcElevation : chcElevationFull}
                annotations={isHalf ? chcAnnotations : chcAnnotationsFull}
              />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~30 m',  sub: '↑ cumulative' },
                  { label: 'Descent', val: '~30 m',  sub: '↓ cumulative' },
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
                <div>Sealed road · flat to negligible gradient</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>Canterbury's premier road marathon. One of NZ's flattest courses, following the Avon River through central Christchurch and Hagley Park. Altitude ~15 m asl.</div>
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
                  {rec.previous !== '—' && (
                    <div className="mt-20" style={{ fontSize: 11, color: 'var(--on-dark-meta)', letterSpacing: '0.04em' }}>
                      Previous: <span style={{ color: 'var(--on-dark)' }}>{rec.previous}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {activeStats.length > 0 && (
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
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
