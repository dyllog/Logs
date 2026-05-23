import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { tamakiHalfStats, tamaki10kStats } from '@/data/tamakiData';

const halfElevation: [number, number][] = [
  [0, 3], [1, 4], [2, 5], [3, 4], [4, 3], [5, 4],
  [6, 5], [7, 4], [8, 3], [9, 4], [10, 3],
  [10.55, 3], [11, 4], [12, 5], [13, 4], [14, 3],
  [15, 4], [16, 5], [17, 4], [18, 3], [19, 4],
  [20, 3], [21, 3], [21.1, 3],
];

const halfAnnotations = [
  { km: 0,    label: 'Start' },
  { km: 10.5, label: 'Turnaround' },
  { km: 21.1, label: 'Finish' },
];

const tenKElevation: [number, number][] = [
  [0, 3], [1, 4], [2, 5], [3, 4], [4, 3],
  [5, 3], [6, 4], [7, 5], [8, 4], [9, 3], [10, 3],
];

const tenKAnnotations = [
  { km: 0,  label: 'Start' },
  { km: 5,  label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

export default function TamakiRiver() {
  const navigate = useNavigate();
  const [distId, setDistId] = useState<'half' | '10k'>('half');

  const seedCRM    = useMemo(() => Math.min(...tamakiHalfStats.map(s => s.winnerM)) + 1, []);
  const seedCRW    = useMemo(() => Math.min(...tamakiHalfStats.map(s => s.winnerW)) + 1, []);
  const seedCRM10k = useMemo(() => Math.min(...tamaki10kStats.map(s => s.winnerM)) + 1, []);
  const seedCRW10k = useMemo(() => Math.min(...tamaki10kStats.map(s => s.winnerW)) + 1, []);

  const recordM    = { time: '1:10:54', holder: 'Jake Hendrickx',   nationality: 'NZL', club: '—', year: 2022, previous: '—' };
  const recordW    = { time: '1:27:54', holder: 'Laura Holyoake',   nationality: 'NZL', club: '—', year: 2024, previous: '—' };
  const recordM10k = { time: '34:55',   holder: 'Clinton Loveday',  nationality: 'NZL', club: '—', year: 2025, previous: '—' };
  const recordW10k = { time: '41:33',   holder: 'Katie Curd',       nationality: 'NZL', club: '—', year: 2023, previous: '—' };

  const isHalf = distId === 'half';

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Auckland · Panmure</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Tamaki River Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <button className={`pill ${isHalf ? 'active' : ''}`} onClick={() => setDistId('half')}>21.1 km</button>
                <button className={`pill ${!isHalf ? 'active' : ''}`} onClick={() => setDistId('10k')}>10 km</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Panmure, Auckland</div></div>
              <div><div className="label mb-8">Course</div><div>Out & back</div></div>
              <div><div className="label mb-8">Next edition</div><div>2026</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://run21.co.nz/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>run21.co.nz ↗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            dist={isHalf ? '21.1 km' : '10 km'}
            raceId={isHalf ? 'tamaki-half' : 'tamaki-10k'}
            onOpenAthlete={() => navigate('/athletes')}
          />
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview · {isHalf ? '21.1 km' : '10 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {isHalf ? 'Half marathon' : '10 km'} course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Road · Tamaki River out & back
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart
                data={isHalf ? halfElevation : tenKElevation}
                annotations={isHalf ? halfAnnotations : tenKAnnotations}
              />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: isHalf ? '~20 m' : '~10 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: isHalf ? '~20 m' : '~10 m', sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',                       sub: 'out & back' },
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
                <div>Sealed road · flat riverside path</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>{isHalf
                  ? 'A flat out-and-back along the Tamaki River in East Auckland, running through Panmure and along the waterway shared pathway. One of the Run21 Auckland series events, offering a fast and scenic riverside route with views of the Tamaki estuary. Held annually since 2021.'
                  : 'A fast 10 km out-and-back along the Tamaki River shared path, ideal for personal bests. The flat sealed riverside route runs through Panmure with the turnaround at the halfway mark.'
                }</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Averages · {isHalf ? '21.1 km' : '10 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Median finish · winning times · by year
              </h2>
            </div>
          </div>
          <AveragesChart stats={isHalf ? tamakiHalfStats : tamaki10kStats} />
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course records · {isHalf ? '21.1 km' : '10 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {isHalf ? '21.1 km' : '10 km'} · current marks
              </h2>
            </div>
          </div>
          <div className="card-dark">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginTop: 8 }}>
              {([['Men · Open', isHalf ? recordM : recordM10k], ['Women · Open', isHalf ? recordW : recordW10k]] as [string, typeof recordM][]).map(([label, rec], col) => (
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
                <CRWinnerChart stats={isHalf ? tamakiHalfStats : tamaki10kStats} gender="men" seedCR={isHalf ? seedCRM : seedCRM10k} />
              </div>
              <div>
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Women · winner vs CR</div>
                <CRWinnerChart stats={isHalf ? tamakiHalfStats : tamaki10kStats} gender="women" seedCR={isHalf ? seedCRW : seedCRW10k} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
