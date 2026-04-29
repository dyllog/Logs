import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import AveragesChart from '@/components/AveragesChart';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import { race, DISTANCE_OPTIONS, elevation, elevationAnnotations } from '@/data/logsData';
import { courseStats, halfStats, yearStatsForDist } from '@/data/logsDataExt';

type DistId = '42' | '21' | '11' | '5';

export default function Race() {
  const [distId, setDistId] = useState<DistId>('42');
  const [tab, setTab] = useState<'men' | 'women'>('men');
  const navigate = useNavigate();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#results') {
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  const dopt = DISTANCE_OPTIONS.find(d => d.id === distId)!;
  const dist = dopt.label;
  const hasData = distId === '42' || distId === '21';

  const activeYearStats = yearStatsForDist(distId);

  const records = distId === '42' || distId === '21'
    ? (tab === 'men' ? dopt.recordM : dopt.recordW)
    : null;

  const elevData = useMemo(() => {
    if (distId === '42') return elevation;
    return elevation.filter(p => p[0] <= dopt.km);
  }, [distId, dopt.km]);

  const elevAnnot = useMemo(() => {
    return elevationAnnotations.filter(a => a.km <= dopt.km);
  }, [distId, dopt.km]);

  const seedCR = useMemo(() => {
    if (distId === '21') {
      return tab === 'men' ? halfStats[0].winnerM + 1 : halfStats[0].winnerW + 1;
    }
    return tab === 'men' ? activeYearStats[0].winnerM + 1 : activeYearStats[0].winnerW + 1;
  }, [distId, tab, activeYearStats]);

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">
            {race.surface} · Established {race.established} · {race.editions} editions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                Auckland Marathon
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {DISTANCE_OPTIONS.map(d => (
                  <button key={d.id}
                          className={`pill ${distId === d.id ? 'active' : ''}`}
                          onClick={() => { setDistId(d.id as DistId); setTab('men'); }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>{race.location}</div></div>
              <div><div className="label mb-8">Distances</div><div>{race.distances.join(' · ')}</div></div>
              <div><div className="label mb-8">Next edition</div><div>{race.nextDate}</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div><a style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4, cursor: 'pointer' }}>aucklandmarathon.co.nz ↗</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Results */}
      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            dist={dist}
            onOpenAthlete={() => navigate('/athletes/daniel-whareaitu')}
          />
        </div>
      </section>

      {/* 2. Race overview */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview · {dopt.label}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {dopt.long} course profile
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              {dopt.courseNote}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart key={distId} data={elevData} annotations={elevAnnot} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: `${dopt.climb} m`,   sub: '↑ cumulative' },
                  { label: 'Descent', val: `${dopt.descent} m`, sub: '↓ cumulative' },
                  { label: 'Net',     val: `+${dopt.net} m`,    sub: 'finish vs start' },
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
                <div>{courseStats.surface}</div>
                <div className="label mt-16 mb-8">Certification</div>
                <div>{courseStats.certified}</div>
              </div>
              {distId === '42' && (
                <div className="mt-24" style={{ borderLeft: '2px solid var(--ink)', paddingLeft: 16, fontSize: 12.5, lineHeight: 1.55, fontFamily: '"DM Serif Display", Georgia, serif', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
                  Course revised 2019 — finish relocated to Victoria Park interior, adding 340 m and removing the Fanshawe Street dogleg. Pre-2019 records archived separately.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Averages */}
      {hasData && (
        <section className="section">
          <div className="page">
            <div className="section-header">
              <div>
                <div className="eyebrow mb-8">Averages · {dopt.label}</div>
                <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                  Median finish · winning times · by year
                </h2>
              </div>
              <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
                Computed from every certified finish on record. 2020·21 editions cancelled.
              </div>
            </div>
            <AveragesChart key={distId} stats={activeYearStats} />
          </div>
        </section>
      )}

      {/* 4. Course records */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course records · {dopt.label}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {dopt.label} · current marks
              </h2>
            </div>
            {hasData && (
              <div className="flex gap-8">
                <button className={`pill ${tab === 'men' ? 'active' : ''}`} onClick={() => setTab('men')}>Men</button>
                <button className={`pill ${tab === 'women' ? 'active' : ''}`} onClick={() => setTab('women')}>Women</button>
              </div>
            )}
          </div>

          {!hasData ? (
            <div style={{ padding: '64px 0', borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
              <div className="dimmed" style={{ fontSize: 13, textAlign: 'center' }}>
                {dopt.label} records not yet archived.
              </div>
            </div>
          ) : records && (
            <div className="card-dark">
              <div className="flex between ai-baseline">
                <span className="label">{tab === 'men' ? 'Men · Open' : 'Women · Open'} · {dopt.label}</span>
                {records.broken && (
                  <span style={{ color: 'var(--accent)', border: '0.5px solid var(--accent)', padding: '3px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 999, fontFamily: '"DM Mono", monospace' }}>
                    ● Record broken {records.year}
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, marginTop: 24, alignItems: 'start' }} className="record-grid">
                <div>
                  <div className="serif" style={{ fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.02em' }}>{records.time}</div>
                  <div className="mt-24">
                    <div className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>{records.holder}</div>
                    <div className="label mt-8" style={{ color: 'var(--on-dark-meta)' }}>
                      {records.club} · {records.nationality} · set {records.year}
                    </div>
                  </div>
                  <div className="mt-24" style={{ fontSize: 11, color: 'var(--on-dark-meta)', letterSpacing: '0.04em' }}>
                    Previous: <span style={{ color: 'var(--on-dark)' }}>{records.previous}</span>
                  </div>
                </div>
                <div style={{ color: 'var(--on-dark)' }}>
                  <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Winner vs CR · 2014–2025</div>
                  <CRWinnerChart
                    stats={activeYearStats}
                    gender={tab}
                    seedCR={seedCR}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
