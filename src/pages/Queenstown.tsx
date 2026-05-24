import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { qtStats, qtHalfStats } from '@/data/qtData';

// Queenstown International Marathon — rolling lakefront & forest trails ~310–380 m asl
const qtElevationFull: [number, number][] = [
  [0,310],[1,315],[2,320],[3,328],[4,332],[5,328],[6,322],[7,318],
  [8,315],[9,318],[10,325],[11,335],[12,348],[13,360],[14,370],[15,375],
  [16,378],[17,375],[18,368],[19,358],[20,345],[21,335],[21.1,332],
  [22,325],[23,318],[24,312],[25,310],[26,312],[27,315],[28,318],
  [29,322],[30,328],[31,335],[32,345],[33,358],[34,368],[35,375],
  [36,378],[37,372],[38,362],[39,348],[40,335],[41,320],[42.2,310],
];

const qtAnnotationsFull = [
  { km: 0,    label: 'Queenstown' },
  { km: 10,   label: 'Arrowtown' },
  { km: 21.1, label: 'Halfway' },
  { km: 35,   label: 'Arrow Rd' },
  { km: 42.2, label: 'Finish' },
];

const qtElevationHalf: [number, number][] = [
  [0,310],[1,315],[2,320],[3,328],[4,332],[5,328],[6,322],[7,318],
  [8,315],[9,318],[10,325],[11,335],[12,348],[13,360],[14,370],[15,375],
  [16,378],[17,375],[18,368],[19,358],[20,345],[21,335],[21.1,332],
];

const qtAnnotationsHalf = [
  { km: 0,    label: 'Queenstown' },
  { km: 10,   label: 'Arrowtown' },
  { km: 21.1, label: 'Finish' },
];

export default function Queenstown() {
  const [searchParams] = useSearchParams();
  const initDist = (searchParams.get('dist') === '21' || searchParams.get('race') === 'qt-half') ? '21' : '42' as '42' | '21';
  const initYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const [distId, setDistId] = useState<'42' | '21'>(initDist);
  const navigate = useNavigate();
  const isHalf = distId === '21';

  const activeStats = isHalf ? qtHalfStats : qtStats;

  const seedCRM = useMemo(() => activeStats.length === 0 ? 0 : Math.min(...activeStats.map(s => s.winnerM)) + 1, [activeStats]);
  const seedCRW = useMemo(() => activeStats.length === 0 ? 0 : Math.min(...activeStats.map(s => s.winnerW)) + 1, [activeStats]);

  const marRecordM  = { time: '2:25:02', holder: 'Jack Moody',      nationality: 'NZL', club: '—', year: 2025, previous: '2:26:30 — Daniel Jones (NZL) 2022' };
  const marRecordW  = { time: '2:48:31', holder: 'Bara Styblova',   nationality: 'CZE', club: '—', year: 2025, previous: '2:49:50 — Hannah Oldroyd (GBR) 2023' };
  const halfRecordM = { time: '1:06:29', holder: 'Taonga Mbambo',   nationality: 'NZL', club: '—', year: 2024, previous: '1:07:27 — Vajin Armstrong (NZL) 2017' };
  const halfRecordW = { time: '1:16:47', holder: 'Rebekah Greene',  nationality: 'NZL', club: '—', year: 2023, previous: '1:17:14 — Becky Aitkenhead (NZL) 2025' };

  const recordM = isHalf ? halfRecordM : marRecordM;
  const recordW = isHalf ? halfRecordW : marRecordW;

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Otago · Queenstown–Arrowtown</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Queenstown Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {([['42', '42.2 km'], ['21', '21.1 km']] as ['42'|'21', string][]).map(([id, label]) => (
                  <button key={id} className={`pill ${distId === id ? 'active' : ''}`} onClick={() => setDistId(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Queenstown, Otago</div></div>
              <div><div className="label mb-8">Course</div><div>Lakefront to Arrowtown</div></div>
              <div><div className="label mb-8">Next edition</div><div>Nov 2026</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://www.queenstownmarathon.co.nz" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>queenstownmarathon.co.nz ↗</a></div>
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
            raceId={isHalf ? 'qt-half' : 'qt'}
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
              Sealed road & trail · Queenstown lakefront and Arrowtown river loop
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart
                data={isHalf ? qtElevationHalf : qtElevationFull}
                annotations={isHalf ? qtAnnotationsHalf : qtAnnotationsFull}
              />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~370 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: '~370 m', sub: '↓ cumulative' },
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
                <div>Mixed sealed road and gravel trail · moderate undulation</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>One of NZ's most scenic marathons. The course follows the Queenstown lakefront before climbing through vineyards and pine forest to Arrowtown, returning along the Arrow River. Altitude ~310–380 m asl.</div>
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
