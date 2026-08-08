import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import CRWinnerChart from '@/components/CRWinnerChart';
import ElevationChart from '@/components/ElevationChart';
import AveragesChart from '@/components/AveragesChart';
import RaceResultsBlock from '@/components/RaceResultsBlock';
import TrailRaceProfile from './TrailRaceProfile';
import { getRaceMeta } from '@/data/raceMeta';
import { getTrailFamily } from '@/data/trailEventConfig';
import NotFound from './NotFound';

// Dispatcher: trail families (Event Family → Sub-Event → Edition → Course
// Instance model) get their own layout; everything else is the road page.
// Separate components keep hook order legal when the slug switches kinds.
export default function RaceProfile() {
  const { raceSlug } = useParams<{ raceSlug: string }>();
  const trailFamily = getTrailFamily(raceSlug);
  if (trailFamily) return <TrailRaceProfile key={trailFamily.familySlug} family={trailFamily} />;
  return <RoadRaceProfile />;
}

function RoadRaceProfile() {
  const { raceSlug } = useParams<{ raceSlug: string }>();
  const meta = getRaceMeta(raceSlug);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hash } = useLocation();

  // Initial distance from ?dist= / ?race= (defaults to first distance).
  const distParam = searchParams.get('dist');
  const raceParam = searchParams.get('race');
  const initIdx = useMemo(() => {
    if (!meta) return 0;
    if (distParam || raceParam) {
      const found = meta.distances.findIndex(d =>
        (distParam && d.matchDist === distParam) ||
        (raceParam && d.matchRace === raceParam));
      if (found >= 0) return found;
    }
    return 0;
  }, [meta, distParam, raceParam]);

  const initYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

  const [distIdx, setDistIdx] = useState(initIdx);

  useEffect(() => {
    if (hash === '#results') {
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  if (!meta) return <NotFound />;

  const active = meta.distances[distIdx] ?? meta.distances[0];
  const stats = active.stats;
  const hasData = active.hasData !== false;
  // Elevation traces are authored estimates, not survey data, so a newly
  // ingested race legitimately has none. Presence of the trace — not a separate
  // flag — decides whether the course-profile chart and climb figures render.
  const hasCourseProfile = (active.elevation?.length ?? 0) > 0;

  const seedCRM = stats.length === 0 ? 0 : Math.min(...stats.map(s => s.winnerM)) + 1;
  const seedCRW = stats.length === 0 ? 0 : Math.min(...stats.map(s => s.winnerW)) + 1;

  const recordM = active.recordM;
  const recordW = active.recordW;

  const titleClamp = meta.titleClamp ?? 'clamp(36px,5vw,64px)';
  const courseFieldLabel = meta.courseFieldLabel ?? 'Course';
  const courseFieldValue = active.courseField ?? meta.courseField;
  const overviewRight = active.overviewRight ?? meta.overviewRight;
  // Link text defaults to the entry URL's host, so a new family supplies the
  // URL alone rather than the URL and a hand-copied rendering of it.
  const entryText = meta.entryText
    ?? (meta.entryUrl ? meta.entryUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '') : '');
  const secondaryBody = active.secondaryBody ?? meta.secondaryBody;

  return (
    <main>
      {/* Race header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">{meta.eyebrow}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: titleClamp, lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                {meta.title}
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {meta.distances.map((d, i) => (
                  <button key={d.key}
                          className={`pill ${distIdx === i ? 'active' : ''}`}
                          onClick={() => setDistIdx(i)}>
                    {d.distLabel}
                  </button>
                ))}
                {meta.decorativePills?.map(label => (
                  <span key={label} className="pill">{label}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>{meta.location}</div></div>
              {courseFieldValue && (
                <div><div className="label mb-8">{courseFieldLabel}</div><div>{courseFieldValue}</div></div>
              )}
              {meta.nextEdition && (
                <div><div className="label mb-8">Next edition</div><div>{meta.nextEdition}</div></div>
              )}
              {meta.entryUrl && (
                <div>
                  <div className="label mb-8">Entry</div>
                  <div><a href={meta.entryUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>{entryText} ↗</a></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 1. Results */}
      <section id="results" className="section">
        <div className="page">
          <RaceResultsBlock
            key={active.raceId}
            dist={active.distLabel}
            raceId={active.raceId}
            initialYear={initYear}
            onOpenAthlete={() => navigate('/athletes')}
          />
        </div>
      </section>

      {/* 2. Race overview */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race overview · {active.distLabel}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {hasCourseProfile ? `${active.profileLong} course profile` : `${active.profileLong} overview`}
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
              {overviewRight}
            </div>
          </div>
          {/* The elevation traces are hand-estimated, not surveyed (see the caveat
              below), so a race without one shows no chart and no climb figures
              rather than an invented profile. Surface and character still render. */}
          <div
            style={{ display: 'grid', gridTemplateColumns: hasCourseProfile ? '1.6fr 1fr' : '1fr', gap: 48, alignItems: 'start' }}
            className="overview-grid"
          >
            {hasCourseProfile && (
              <div>
                <ElevationChart key={active.key} data={active.elevation!} annotations={active.annotations ?? []} />
                <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.5, fontStyle: 'italic' }}>
                  Course profile shown is indicative, based on known route characteristics — not sourced from GPS/survey data.
                </div>
              </div>
            )}
            <div>
              {hasCourseProfile && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
                {[
                  { label: 'Climb',   val: active.climb,   sub: '↑ cumulative' },
                  { label: 'Descent', val: active.descent, sub: '↓ cumulative' },
                  { label: 'Net',     val: active.net,     sub: active.netSub },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '20px 16px', borderRight: i < 2 ? '0.5px solid var(--rule-soft)' : 'none' }}>
                    <div className="label">{item.label}</div>
                    <div className="serif mt-8" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>{item.val}</div>
                    <div className="dimmed mt-8" style={{ fontSize: 10.5 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              )}
              <div className="mt-24" style={{ fontSize: 12, lineHeight: 1.6 }}>
                {meta.surface && <><div className="label mb-8">Surface</div><div>{meta.surface}</div></>}
                <div className="label mt-16 mb-8">{meta.secondaryLabel ?? 'Character'}</div>
                <div>{secondaryBody}</div>
              </div>
              {active.note && (
                <div className="mt-24" style={{ borderLeft: '2px solid var(--ink)', paddingLeft: 16, fontSize: 12.5, lineHeight: 1.55, fontFamily: '"DM Serif Display", Georgia, serif', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
                  {active.note}
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
                <div className="eyebrow mb-8">Averages · {active.distLabel}</div>
                <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                  Median finish · winning times · by year
                </h2>
              </div>
              {meta.averagesNote && (
                <div className="dimmed" style={{ fontSize: 12, maxWidth: 280, textAlign: 'right' }}>
                  {meta.averagesNote}
                </div>
              )}
            </div>
            <AveragesChart key={active.key} stats={stats} />
          </div>
        </section>
      )}

      {/* 4. Course records */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course records · {active.distLabel}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                {active.distLabel} · current marks
              </h2>
            </div>
          </div>

          {!hasData ? (
            <div style={{ padding: '64px 0', borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
              <div className="dimmed" style={{ fontSize: 13, textAlign: 'center' }}>
                {active.distLabel} records not yet archived.
              </div>
            </div>
          ) : recordM && recordW && (
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
                    {rec.previous && rec.previous !== '—' && (
                      <div className="mt-20" style={{ fontSize: 11, color: 'var(--on-dark-meta)', letterSpacing: '0.04em' }}>
                        Previous: <span style={{ color: 'var(--on-dark)' }}>{rec.previous}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {stats.length > 0 && (
                <div style={{ color: 'var(--on-dark)', marginTop: 40, paddingTop: 32, borderTop: '0.5px solid var(--on-dark-rule)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                  <div>
                    <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Men · winner vs CR</div>
                    <CRWinnerChart stats={stats} gender="men" seedCR={seedCRM} />
                  </div>
                  <div>
                    <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>Women · winner vs CR</div>
                    <CRWinnerChart stats={stats} gender="women" seedCR={seedCRW} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
