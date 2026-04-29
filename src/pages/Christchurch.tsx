import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [distId, setDistId] = useState<'42' | '21'>('42');
  const [tab, setTab] = useState<'men' | 'women'>('men');
  const navigate = useNavigate();
  const isHalf = distId === '21';

  const activeStats = isHalf ? chcHalfStats : chcStats;

  const seedCR = useMemo(() => {
    if (activeStats.length === 0) return 0;
    const crM = Math.min(...activeStats.map(s => s.winnerM));
    const crW = Math.min(...activeStats.map(s => s.winnerW));
    return (tab === 'men' ? crM : crW) + 1;
  }, [tab, activeStats]);

  const marRecordM = { time: '2:16:28', holder: 'Samuel Wreford',   nationality: 'NZL', club: '—', year: 2014, previous: '2:17:30 — Samuel Wreford (NZL) 2012' };
  const marRecordW = { time: '2:38:14', holder: 'Becky Aitkenhead', nationality: 'NZL', club: '—', year: 2026, previous: '2:39:17 — Alice Mason (NZL) 2019' };
  const halfRecordM = { time: '1:03:15', holder: 'Toby Gualter',    nationality: 'NZL', club: '—', year: 2026, previous: '1:03:30 — Toby Gualter (NZL) 2025' };
  const halfRecordW = { time: '1:12:28', holder: 'Lisa Weightman',  nationality: 'AUS', club: '—', year: 2009, previous: '1:13:08 — Kate Smyth (AUS) 2007' };

  const record = isHalf
    ? (tab === 'men' ? halfRecordM : halfRecordW)
    : (tab === 'men' ? marRecordM  : marRecordW);

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
                <div><span style={{ color: 'var(--meta)' }}>christchurchmarathon.co.nz</span></div>
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
                {record.holder === '—' && (
                  <div className="mt-16 dimmed" style={{ fontSize: 12, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif", color: 'var(--on-dark-meta)' }}>
                    Record not yet established in archive.
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
