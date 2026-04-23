import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressionChart from '@/components/ProgressionChart';
import ElevationChart from '@/components/ElevationChart';
import AveragesChart from '@/components/AveragesChart';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import { race, recordsMen, recordsWomen, elevation, elevationAnnotations } from '@/data/logsData';
import { courseStats, yearStats } from '@/data/logsDataExt';

export default function Race() {
  const [tab, setTab] = useState<'men' | 'women'>('men');
  const records = tab === 'men' ? recordsMen : recordsWomen;
  const navigate = useNavigate();

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">
            {race.surface} · Established {race.established} · {race.editions} editions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
              Auckland Marathon
            </h1>
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
      <section className="section">
        <div className="page">
          <RaceResultsBlock onOpenAthlete={() => navigate('/athletes/daniel-whareaitu')} />
        </div>
      </section>

      {/* 2. Race overview */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Devonport → Victoria Park
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              {courseStats.surface} · {courseStats.certified}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <ElevationChart data={elevation} annotations={elevationAnnotations} />
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb', val: `${courseStats.climb} m`, sub: '↑ cumulative' },
                  { label: 'Descent', val: `${courseStats.descent} m`, sub: '↓ cumulative' },
                  { label: 'Net', val: `+${courseStats.net} m`, sub: 'finish vs start' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '20px 16px', borderRight: i < 2 ? '0.5px solid var(--rule-soft)' : 'none' }}>
                    <div className="label">{item.label}</div>
                    <div className="serif mt-8" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>{item.val}</div>
                    <div className="dimmed mt-8" style={{ fontSize: 10.5 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="mt-24" style={{ fontSize: 12, lineHeight: 1.6 }}>
                <div className="label mb-8">Longest sustained climb</div>
                <div>{courseStats.longestClimb}</div>
                <div className="label mt-16 mb-8">Longest sustained descent</div>
                <div>{courseStats.longestDescent}</div>
                <div className="label mt-16 mb-8">Max / min elevation</div>
                <div>{courseStats.maxElev} m / {courseStats.minElev} m</div>
              </div>
              <div className="mt-24" style={{ borderLeft: '2px solid var(--ink)', paddingLeft: 16, fontSize: 12.5, lineHeight: 1.55, fontFamily: '"DM Serif Display", Georgia, serif', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
                Course revised 2019 — finish relocated to Victoria Park interior, adding 340m and removing the Fanshawe Street dogleg. Pre-2019 records archived separately.
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
              <div className="eyebrow mb-8">Averages</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Median finish · winning times · by year
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              Computed from every certified finish on record. 2020·21 editions cancelled.
            </div>
          </div>
          <AveragesChart stats={yearStats} />
        </div>
      </section>

      {/* 4. Course records */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course records</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                42.2 km · current marks
              </h2>
            </div>
            <div className="flex gap-8">
              <button className={`pill ${tab === 'men' ? 'active' : ''}`} onClick={() => setTab('men')}>Men</button>
              <button className={`pill ${tab === 'women' ? 'active' : ''}`} onClick={() => setTab('women')}>Women</button>
            </div>
          </div>
          <div className="card-dark">
            <div className="flex between ai-baseline">
              <span className="label">{tab === 'men' ? 'Men · Open' : 'Women · Open'} · 42.2 km</span>
              {records.broken && (
                <span style={{ color: 'var(--accent)', border: '0.5px solid var(--accent)', padding: '3px 10px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 999, fontFamily: '"DM Mono", monospace' }}>
                  ● Record broken {records.year}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 48, marginTop: 24, alignItems: 'start' }} className="record-grid">
              <div>
                <div className="serif" style={{ fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.02em' }}>{records.time}</div>
                <div className="mt-24">
                  <div className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>{records.holder}</div>
                  <div className="label mt-8" style={{ color: 'var(--on-dark-meta)' }}>
                    {records.club} · {records.age} · {records.nationality} · set {records.year}
                  </div>
                </div>
                <div className="mt-24" style={{ fontSize: 11, color: 'var(--on-dark-meta)', letterSpacing: '0.04em' }}>
                  Previous: <span style={{ color: 'var(--on-dark)' }}>{records.previous}</span>
                </div>
              </div>
              <div style={{ color: 'var(--on-dark)' }}>
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Progression · {records.progression[0].y}–{records.progression[records.progression.length - 1].y}</div>
                <ProgressionChart data={records.progression} height={160} accent={tab === 'women'} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
