import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { mtmHalfStats, mtm10kStats, mtm5kStats } from '@/data/mtmData';

const halfElevation: [number, number][] = [
  [0, 2], [1, 3], [2, 4], [3, 5], [3.5, 8], [4, 12], [4.5, 10],
  [5, 6], [6, 4], [7, 3], [8, 3], [9, 4], [10, 5],
  [11, 6], [11.5, 10], [12, 14], [12.5, 10], [13, 6],
  [14, 4], [15, 3], [16, 3], [17, 4], [18, 5], [19, 4], [20, 3], [21, 2], [21.1, 2],
];

const halfAnnotations = [
  { km: 0,    label: 'Start — Marine Parade' },
  { km: 4,    label: 'Mauao base loop' },
  { km: 12,   label: 'Mauao base loop' },
  { km: 21.1, label: 'Finish — Marine Parade' },
];

const tenKElevation: [number, number][] = [
  [0, 2], [1, 3], [2, 4], [3, 5], [3.5, 8], [4, 12], [4.5, 10],
  [5, 6], [6, 4], [7, 3], [8, 4], [9, 5], [10, 2],
];

const tenKAnnotations = [
  { km: 0,  label: 'Start — Marine Parade' },
  { km: 4,  label: 'Mauao base loop' },
  { km: 10, label: 'Finish' },
];

const fiveKElevation: [number, number][] = [
  [0, 2], [1, 3], [2, 4], [3, 5], [3.5, 8], [4, 12], [4.5, 10], [5, 4],
];

const fiveKAnnotations = [
  { km: 0, label: 'Start' },
  { km: 4, label: 'Mauao base' },
  { km: 5, label: 'Finish' },
];

type DistId = 'half' | '10k' | '5k';

export default function MountMaunganui() {
  const [searchParams] = useSearchParams();
  const initDist: DistId = searchParams.get('race') === 'mtm-10k'
    ? '10k'
    : searchParams.get('race') === 'mtm-5k'
      ? '5k'
      : 'half';
  const initYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const navigate = useNavigate();
  const [distId, setDistId] = useState<DistId>(initDist);

  const isHalf = distId === 'half';
  const is10k  = distId === '10k';

  const seedHalfM  = useMemo(() => Math.min(...mtmHalfStats.map(s => s.winnerM)) + 1, []);
  const seedHalfW  = useMemo(() => Math.min(...mtmHalfStats.map(s => s.winnerW)) + 1, []);
  const seed10kM   = useMemo(() => Math.min(...mtm10kStats.map(s => s.winnerM)) + 1, []);
  const seed10kW   = useMemo(() => Math.min(...mtm10kStats.map(s => s.winnerW)) + 1, []);
  const seed5kM    = useMemo(() => Math.min(...mtm5kStats.map(s => s.winnerM)) + 1, []);
  const seed5kW    = useMemo(() => Math.min(...mtm5kStats.map(s => s.winnerW)) + 1, []);

  const recordHalfM = { time: '1:05:52', holder: 'Matthew Baxter',   nationality: 'NZL', club: '—', year: 2020 };
  const recordHalfW = { time: '1:16:44', holder: "Lydia O'Donnell",  nationality: 'NZL', club: '—', year: 2023 };
  const record10kM  = { time: '32:40',   holder: 'Max Green',         nationality: 'NZL', club: '—', year: 2025 };
  const record10kW  = { time: '37:19',   holder: 'Esther Keown',      nationality: 'NZL', club: '—', year: 2022 };
  const record5kM   = { time: '17:33',   holder: 'William Leroy',     nationality: 'NZL', club: '—', year: 2025 };
  const record5kW   = { time: '20:02',   holder: 'Georgia Stanton',   nationality: 'NZL', club: '—', year: 2025 };

  const activeStats  = isHalf ? mtmHalfStats  : is10k ? mtm10kStats  : mtm5kStats;
  const seedCRM      = isHalf ? seedHalfM      : is10k ? seed10kM     : seed5kM;
  const seedCRW      = isHalf ? seedHalfW      : is10k ? seed10kW     : seed5kW;
  const recordM      = isHalf ? recordHalfM    : is10k ? record10kM   : record5kM;
  const recordW      = isHalf ? recordHalfW    : is10k ? record10kW   : record5kW;
  const raceId       = isHalf ? 'mtm-half' as const : is10k ? 'mtm-10k' as const : 'mtm-5k' as const;
  const distLabel    = isHalf ? '21.1 km'     : is10k ? '10 km'       : '5 km';
  const elevation    = isHalf ? halfElevation  : is10k ? tenKElevation : fiveKElevation;
  const annotations  = isHalf ? halfAnnotations : is10k ? tenKAnnotations : fiveKAnnotations;

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Bay of Plenty · Mount Maunganui</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(32px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Mount Maunganui Half Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                <button className={`pill ${isHalf ? 'active' : ''}`} onClick={() => setDistId('half')}>21.1 km</button>
                <button className={`pill ${is10k  ? 'active' : ''}`} onClick={() => setDistId('10k')}>10 km</button>
                <button className={`pill ${distId === '5k' ? 'active' : ''}`} onClick={() => setDistId('5k')}>5 km</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Mount Maunganui, Bay of Plenty</div></div>
              <div><div className="label mb-8">Course</div><div>{isHalf ? 'Beach & Mauao loop' : is10k ? 'Mauao loop' : 'Mauao base'}</div></div>
              <div><div className="label mb-8">Next edition</div><div>2026</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a href="https://www.mountmarathon.co.nz/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>mountmarathon.co.nz ↗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Results */}
      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            dist={distLabel}
            raceId={raceId}
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
              <div className="eyebrow mb-8">Race overview · {distLabel}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {isHalf ? 'Half marathon' : is10k ? '10 km' : '5 km'} course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Road · Marine Parade & Mauao base · Mount Maunganui
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={elevation} annotations={annotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: isHalf ? '~40 m' : is10k ? '~25 m' : '~15 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: isHalf ? '~40 m' : is10k ? '~25 m' : '~15 m', sub: '↓ cumulative' },
                  { label: 'Net',     val: '0 m',                                          sub: 'point to point' },
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
                <div>Sealed road · flat coastal path</div>
                <div className="label mt-16 mb-8">Character</div>
                <div>{isHalf
                  ? 'A fast, flat course along Marine Parade and around the base of Mauao (Mount Maunganui). Starting and finishing at the beach, the route follows the iconic waterfront boulevard before looping around the ancient volcanic rock, delivering dramatic views of Tauranga Harbour and the Pacific Ocean. One of New Zealand\'s most scenic and spectator-friendly half marathons.'
                  : is10k
                  ? 'A flat loop along the Mount Maunganui waterfront and around the base of Mauao. The course hugs Marine Parade before rounding the iconic volcanic mount, offering sweeping harbour and ocean views throughout. Fast and beginner-friendly, it is one of the Bay of Plenty\'s most popular running events.'
                  : 'A short, flat course along the waterfront, partly rounding the base of Mauao. Ideal for first-timers and families, the 5 km showcases the stunning coastal scenery of Mount Maunganui with a fast, runnable surface throughout.'
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
              <div className="eyebrow mb-8">Averages · {distLabel}</div>
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
              <div className="eyebrow mb-8">Course records · {distLabel}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {distLabel} · current marks
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
