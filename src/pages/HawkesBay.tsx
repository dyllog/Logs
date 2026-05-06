import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import AveragesChart from '@/components/AveragesChart';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import { hbStats, hbHalfStats } from '@/data/hbData';

// Hawke's Bay Marathon — flat coastal & orchard roads ~10–30 m asl
const hbElevationFull: [number, number][] = [
  [0,12],[1,12],[2,13],[3,14],[4,15],[5,15],[6,14],[7,13],
  [8,12],[9,12],[10,13],[11,15],[12,18],[13,20],[14,22],[15,24],
  [16,26],[17,28],[18,28],[19,26],[20,24],[21,22],[21.1,20],
  [22,18],[23,16],[24,14],[25,12],[26,12],[27,13],[28,14],
  [29,15],[30,16],[31,18],[32,20],[33,22],[34,22],[35,20],
  [36,18],[37,16],[38,14],[39,13],[40,12],[41,12],[42.2,12],
];

const hbAnnotationsFull = [
  { km: 0,    label: 'Napier' },
  { km: 14,   label: 'Havelock North' },
  { km: 21.1, label: 'Halfway' },
  { km: 35,   label: 'Return' },
  { km: 42.2, label: 'Finish' },
];

const hbElevationHalf: [number, number][] = [
  [0,12],[1,12],[2,13],[3,14],[4,15],[5,15],[6,14],[7,13],
  [8,12],[9,12],[10,13],[11,15],[12,18],[13,20],[14,22],[15,24],
  [16,26],[17,28],[18,28],[19,26],[20,24],[21,22],[21.1,20],
];

const hbAnnotationsHalf = [
  { km: 0,    label: 'Napier' },
  { km: 14,   label: 'Havelock North' },
  { km: 21.1, label: 'Finish' },
];

export default function HawkesBay() {
  const [distId, setDistId] = useState<'42' | '21'>('42');
  const [tab, setTab] = useState<'men' | 'women'>('men');
  const navigate = useNavigate();
  const isHalf = distId === '21';

  const activeStats = isHalf ? hbHalfStats : hbStats;

  const seedCR = useMemo(() => {
    if (activeStats.length === 0) return 0;
    const crM = Math.min(...activeStats.map(s => s.winnerM));
    const crW = Math.min(...activeStats.map(s => s.winnerW));
    return (tab === 'men' ? crM : crW) + 1;
  }, [tab, activeStats]);

  const marRecordM = { time: '2:24:02', holder: 'Michael Voss',     nationality: 'NZL', club: '—', year: 2022, previous: '2:25:33 — Daniel Jones (NZL) 2021' };
  const marRecordW = { time: '2:46:47', holder: 'Ingrid Cree',      nationality: 'NZL', club: '—', year: 2024, previous: '2:47:42 — unknown (NZL) 2023' };
  const halfRecordM = { time: '1:05:34', holder: 'Cameron Graves',  nationality: 'NZL', club: '—', year: 2025, previous: '1:06:23 — Cameron Graves (NZL) 2024' };
  const halfRecordW = { time: '1:14:43', holder: 'Camille French',  nationality: 'NZL', club: '—', year: 2023, previous: '1:17:27 — Anneke Arlidge (NZL) 2025' };

  const record = isHalf
    ? (tab === 'men' ? halfRecordM : halfRecordW)
    : (tab === 'men' ? marRecordM  : marRecordW);

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">Road · Hawke's Bay · Napier–Havelock North</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Hawke's Bay Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {([['42', '42.2 km'], ['21', '21.1 km']] as ['42'|'21', string][]).map(([id, label]) => (
                  <button key={id} className={`pill ${distId === id ? 'active' : ''}`} onClick={() => setDistId(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>Napier, Hawke's Bay</div></div>
              <div><div className="label mb-8">Course</div><div>Napier to Havelock North</div></div>
              <div><div className="label mb-8">Next edition</div><div>Jun 2026</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><span style={{ color: 'var(--meta)' }}>hawkesbaymarathon.co.nz</span></div>
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
            raceId={isHalf ? 'hb-half' : 'hb'}
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
              Sealed road · Hawke's Bay wine and orchard country
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart
                data={isHalf ? hbElevationHalf : hbElevationFull}
                annotations={isHalf ? hbAnnotationsHalf : hbAnnotationsFull}
              />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: '~180 m', sub: '↑ cumulative' },
                  { label: 'Descent', val: '~180 m', sub: '↓ cumulative' },
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
                <div>A fast, flat course through Hawke's Bay's famous wine and orchard country. Routes pass through Napier and Havelock North, with vineyard views and reliable spring weather. Altitude ~10–30 m asl.</div>
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
            <div className="flex gap-8">
              <button className={`pill ${tab === 'men' ? 'active' : ''}`} onClick={() => setTab('men')}>Men</button>
              <button className={`pill ${tab === 'women' ? 'active' : ''}`} onClick={() => setTab('women')}>Women</button>
            </div>
          </div>
          <div className="card-dark">
            <div className="flex between ai-baseline">
              <span className="label">{tab === 'men' ? 'Men · Open' : 'Women · Open'} · {isHalf ? '21.1 km' : '42.2 km'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, marginTop: 24, alignItems: 'start' }} className="record-grid">
              <div>
                <div className="serif" style={{ fontSize: record.time === '—' ? 36 : 72, lineHeight: 0.95, letterSpacing: '-0.02em' }}>{record.time}</div>
                {record.holder !== '—' && (
                  <div className="mt-24">
                    <div className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>{record.holder}</div>
                    <div className="label mt-8" style={{ color: 'var(--on-dark-meta)' }}>
                      {record.club} · {record.nationality} · set {record.year}
                    </div>
                  </div>
                )}
                {record.previous !== '—' && (
                  <div className="mt-24" style={{ fontSize: 11, color: 'var(--on-dark-meta)', letterSpacing: '0.04em' }}>
                    Previous: <span style={{ color: 'var(--on-dark)' }}>{record.previous}</span>
                  </div>
                )}
              </div>
              {activeStats.length > 0 && (
                <div style={{ color: 'var(--on-dark)' }}>
                  <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Winner vs CR · historical</div>
                  <CRWinnerChart stats={activeStats} gender={tab} seedCR={seedCR} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
