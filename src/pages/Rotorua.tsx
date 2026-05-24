import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { rotoruaStats, rotoruaHalfStats } from '@/data/logsDataExt';

// Rotorua Marathon — Lake Rotorua loop, ~280m asl, very flat
// Elevation based on known course characteristics
const rotoruaElevation: [number, number][] = [
  [0,280],[1,281],[2,282],[3,282],[4,282],[5,283],[6,283],[7,282],
  [8,281],[9,280],[10,279],[11,279],[12,278],[13,279],[14,280],[15,281],
  [16,282],[17,282],[18,281],[19,280],[20,280],[21,279],[22,278],[23,278],
  [24,278],[25,279],[26,280],[27,281],[28,281],[29,280],[30,279],[31,279],
  [32,280],[33,281],[34,282],[35,282],[36,281],[37,281],[38,280],[39,280],
  [40,280],[41,280],[42.2,280],
];

const rotoruaAnnotations = [
  { km: 0,    label: 'Rotorua CBD' },
  { km: 10,   label: 'Sulphur Point' },
  { km: 21.1, label: 'Halfway' },
  { km: 35,   label: 'Ohinemutu' },
  { km: 42.2, label: 'Finish · Memorial Park' },
];

export default function Rotorua() {
  const [searchParams] = useSearchParams();
  const initDist = (searchParams.get('dist') === '21' || searchParams.get('race') === 'rotorua-half') ? '21' : '42' as '42' | '21';
  const initYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

  const [distId, setDistId] = useState<'42' | '21'>(initDist);
  const navigate = useNavigate();
  const isHalf = distId === '21';

  const activeStats = isHalf ? rotoruaHalfStats : rotoruaStats;

  const seedCRM = useMemo(() => Math.min(...activeStats.map(s => s.winnerM)) + 1, [activeStats]);
  const seedCRW = useMemo(() => Math.min(...activeStats.map(s => s.winnerW)) + 1, [activeStats]);

  const marRecordM  = { time: '2:21:49', holder: 'Malcolm Hicks',   nationality: 'NZL', club: '—', year: 2023, previous: '2:21:58 — Saeki Makino (JPN) 2017' };
  const marRecordW  = { time: '2:45:58', holder: 'Sally Gibbs',     nationality: 'NZL', club: '—', year: 2014, previous: '—' };
  const halfRecordM = { time: '1:06:07', holder: 'Michael Voss',    nationality: 'NZL', club: '—', year: 2016, previous: '—' };
  const halfRecordW = { time: '1:15:34', holder: 'Lisa Robertson',  nationality: 'NZL', club: '—', year: 2015, previous: '—' };

  const recordM = isHalf ? halfRecordM : marRecordM;
  const recordW = isHalf ? halfRecordW : marRecordW;

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Established 1967 · Lake Rotorua loop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Rotorua Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {([['42', '42.2 km'], ['21', '21.1 km']] as ['42'|'21', string][]).map(([id, label]) => (
                  <button key={id} className={`pill ${distId === id ? 'active' : ''}`} onClick={() => setDistId(id)}>{label}</button>
                ))}
                <span className="pill">10 km</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Rotorua, Bay of Plenty</div></div>
              <div><div className="label mb-8">Course</div><div>Lake Rotorua loop</div></div>
              <div><div className="label mb-8">Next edition</div><div>2 May 2027</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://www.rotoruamarathon.co.nz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>rotoruamarathon.co.nz ↗</a></div>
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
            raceId={isHalf ? 'rotorua-half' : 'rotorua'}
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
              Full loop of Lake Rotorua · sealed road · geothermal terrain
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={rotoruaElevation} annotations={rotoruaAnnotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~55 m',  sub: '↑ cumulative' },
                  { label: 'Descent', val: '~55 m',  sub: '↓ cumulative' },
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
                <div>Sealed road · flat to gently rolling</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>One of NZ's oldest road marathons. The lake loop is renowned for its consistently flat profile, geothermal scenery, and reliable fast times. Altitude ~280 m asl.</div>
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
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Computed from every certified finish on record. 2014 includes walkers category.
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
