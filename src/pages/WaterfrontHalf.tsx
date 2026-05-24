import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { wfHalfStats, wf10kStats } from '@/data/waterfrontData';

const wfHalfElevation: [number, number][] = [
  [0,3],[1,3],[2,4],[3,4],[4,3],[5,3],[6,4],[7,4],
  [8,3],[9,3],[10,4],[10.55,4],
  [11,4],[12,3],[13,3],[14,4],[15,4],[16,3],[17,3],[18,4],[19,4],[20,3],[21,3],[21.1,3],
];

const wfHalfAnnotations = [
  { km: 0,     label: 'Start' },
  { km: 10.55, label: 'Turnaround' },
  { km: 21.1,  label: 'Finish' },
];

const wf10kElevation: [number, number][] = [
  [0,3],[1,3],[2,4],[3,4],[4,3],[5,3],
  [6,4],[7,3],[8,3],[9,4],[10,3],
];

const wf10kAnnotations = [
  { km: 0,  label: 'Start' },
  { km: 5,  label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

export default function WaterfrontHalf() {
  const [searchParams] = useSearchParams();
  const initDist = searchParams.get('race') === 'wf-10k' ? '10k' : 'half' as 'half' | '10k';
  const initYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const navigate = useNavigate();
  const [distId, setDistId] = useState<'half' | '10k'>(initDist);

  const seedCRM    = useMemo(() => Math.min(...wfHalfStats.map(s => s.winnerM)) + 1, []);
  const seedCRW    = useMemo(() => Math.min(...wfHalfStats.map(s => s.winnerW)) + 1, []);
  const seedCRM10k = useMemo(() => Math.min(...wf10kStats.map(s => s.winnerM)) + 1, []);
  const seedCRW10k = useMemo(() => Math.min(...wf10kStats.map(s => s.winnerW)) + 1, []);

  const recordM    = { time: '1:06:56', holder: 'Malcolm Hicks',   nationality: 'NZL', club: '—', year: 2023, previous: '1:07:34 — Michael Voss (NZL) 2019' };
  const recordW    = { time: '1:14:37', holder: "Lydia O'Donnell", nationality: 'NZL', club: '—', year: 2019, previous: '—' };
  const recordM10k = { time: '32:32',   holder: 'Matthew Arnold',  nationality: 'NZL', club: '—', year: 2024, previous: '—' };
  const recordW10k = { time: '35:49',   holder: 'Katrina Andrew',  nationality: 'NZL', club: '—', year: 2025, previous: '—' };

  const isHalf = distId === 'half';

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Auckland · Waterfront</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Waterfront Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <button className={`pill ${isHalf ? 'active' : ''}`} onClick={() => setDistId('half')}>21.1 km</button>
                <button className={`pill ${!isHalf ? 'active' : ''}`} onClick={() => setDistId('10k')}>10 km</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Auckland</div></div>
              <div><div className="label mb-8">Course</div><div>Waterfront out-and-back</div></div>
              <div><div className="label mb-8">Next edition</div><div>2027</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://waterfront.werun.nz/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>waterfront.werun.nz ↗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Results */}
      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            dist={isHalf ? '21.1 km' : '10 km'}
            raceId={isHalf ? 'wf-half' : 'wf-10k'}
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
              <div className="eyebrow mb-8">Race overview · {isHalf ? '21.1 km' : '10 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {isHalf ? 'Half marathon' : '10 km'} course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Sealed road · Auckland waterfront & harbour
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart
                data={isHalf ? wfHalfElevation : wf10kElevation}
                annotations={isHalf ? wfHalfAnnotations : wf10kAnnotations}
              />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: isHalf ? '~30 m' : '~15 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: isHalf ? '~30 m' : '~15 m', sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',                       sub: 'out-and-back' },
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
                <div>Sealed road · flat waterfront promenade</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>{isHalf
                  ? "A fast, flat out-and-back course along Auckland's iconic harbour waterfront. One of New Zealand's fastest half marathon courses, run at sea level with the city skyline as a backdrop."
                  : "A fast, flat out-and-back 10 km course along Auckland's iconic harbour waterfront. Run at sea level with views of the harbour and city skyline."
                }</div>
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
              <div className="eyebrow mb-8">Averages · {isHalf ? '21.1 km' : '10 km'}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Median finish · winning times · by year
              </h2>
            </div>
          </div>
          <AveragesChart stats={isHalf ? wfHalfStats : wf10kStats} />
        </div>
      </section>

      {/* 4. Course records */}
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
                <CRWinnerChart stats={isHalf ? wfHalfStats : wf10kStats} gender="men" seedCR={isHalf ? seedCRM : seedCRM10k} />
              </div>
              <div>
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Women · winner vs CR</div>
                <CRWinnerChart stats={isHalf ? wfHalfStats : wf10kStats} gender="women" seedCR={isHalf ? seedCRW : seedCRW10k} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
