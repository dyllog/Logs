import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAthleteBySlug, type AthleteProfile } from '../data/allAthletes';
import { ATHLETE_REGISTRY } from '../data/athleteRegistry';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function profileFromRegistry(slug: string): AthleteProfile | undefined {
  const entry = ATHLETE_REGISTRY.find(a => a.slug === slug);
  if (!entry) return undefined;
  const pbRaceName = entry.pbRace.replace(/\s+\d{4}$/, '');
  const pbYear = parseInt(entry.pbRace.match(/\d{4}/)?.[0] ?? '0');
  const parts = entry.pbTime.split(':').map(Number);
  const pbSec = parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
  const isHalf = pbRaceName.toLowerCase().includes('half') ||
    (parts.length === 3 && parts[0] < 2 && !pbRaceName.toLowerCase().includes('marathon'));
  const pbs: AthleteProfile['pbs'] = isHalf
    ? { half: { time: entry.pbTime, sec: pbSec, race: pbRaceName, year: pbYear } }
    : { mar: { time: entry.pbTime, sec: pbSec, race: pbRaceName, year: pbYear } };
  return {
    name: entry.name, slug: entry.slug,
    initials: getInitials(entry.name),
    gender: entry.gender, category: 'Open',
    nationality: entry.nationality, birthYear: 0,
    results: new Array(entry.racesLogged).fill(null) as never[],
    pbs,
  };
}

function resolveProfile(slug: string): AthleteProfile | undefined {
  return getAthleteBySlug(slug) ?? profileFromRegistry(slug);
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReportContent {
  career_summary: string | null;
  trajectory: string | null;
  best_result: string | null;
  distance_profile: string | null;
  where_to_race: string | null;
  qualifying_note?: string | null;
}

interface MetricsSummary {
  trajectory_marathon:      string | null;
  trajectory_half:          string | null;
  best_result_percentile:   number | null;
  best_result_race:         string | null;
  age_grading_marathon:     number | null;
  age_grading_half:         number | null;
  boston_status:            string | null;
  strong_placement_races:   string[];
  challenging_races:        string[];
}

interface ReportFile {
  slug: string;
  generated_at: string;
  report: ReportContent;
  metrics_summary: MetricsSummary;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ReportSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        borderBottom: '0.5px solid var(--rule-soft)', paddingBottom: 12,
      }}>
        <span style={{ color: 'var(--meta)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>—</span>
        <span className="eyebrow">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Prose({ text }: { text: string }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--ink)', margin: 0, maxWidth: 680 }}>
      {text}
    </p>
  );
}

function RaceTable({ races, label }: { races: string[]; label: string }) {
  if (races.length === 0) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <div className="label mb-8" style={{ fontSize: 9, letterSpacing: '0.14em' }}>{label}</div>
      {races.map((r, i) => (
        <div key={i} style={{
          padding: '8px 0',
          borderBottom: '0.5px solid var(--rule-soft)',
          fontSize: 13, color: 'var(--ink)',
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}>
          {r}
        </div>
      ))}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', gap: 4,
      padding: '10px 16px',
      border: '0.5px solid var(--rule-soft)',
      marginRight: 8, marginBottom: 8,
    }}>
      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--meta)', fontFamily: "'DM Mono', monospace" }}>{label}</span>
      <span style={{ fontSize: 15, color: 'var(--ink)', fontFamily: "'DM Mono', monospace" }}>{value}</span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

type LoadState = 'loading' | 'loaded' | 'not-found' | 'no-report';

export default function AthleteReport() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>('loading');
  const [data, setData] = useState<ReportFile | null>(null);

  const profile = slug ? resolveProfile(slug) : undefined;

  useEffect(() => {
    if (!slug || !profile) {
      setState('not-found');
      return;
    }

    fetch(`/data/reports/${slug}.json`)
      .then(r => {
        if (!r.ok) throw new Error('not found');
        return r.json() as Promise<ReportFile>;
      })
      .then(d => {
        setData(d);
        setState('loaded');
      })
      .catch(() => setState('no-report'));
  }, [slug, profile]);

  if (!profile) {
    return (
      <main>
        <section className="section">
          <div className="page">
            <p className="dimmed">Athlete not found.</p>
          </div>
        </section>
      </main>
    );
  }

  const generatedDate = data
    ? new Date(data.generated_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <main>
      {/* ── Header (matches athlete profile) ── */}
      <section style={{
        background: 'var(--surface-dark)', color: 'var(--on-dark)',
        padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)',
      }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>
            <Link to="/athletes" style={{ color: 'inherit', textDecoration: 'none' }}>Athletes</Link>
            {' · '}
            <Link to={`/athletes/${slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{profile.name}</Link>
            {' · '}
            <span style={{ color: 'var(--on-dark)' }}>Report</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em',
              color: 'var(--on-dark)',
            }}>
              {profile.initials}
            </div>
            <div>
              <div className="eyebrow mb-8" style={{ color: 'var(--on-dark-meta)', fontSize: 10 }}>
                Career Report · {profile.nationality}
              </div>
              <h1 className="serif" style={{
                fontSize: 'clamp(28px,4vw,48px)', lineHeight: 0.96,
                margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)',
              }}>
                {profile.name}
              </h1>
              {generatedDate && (
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--on-dark-meta)', fontFamily: "'DM Mono', monospace" }}>
                  Generated {generatedDate}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                    onClick={() => navigate(`/athletes/${slug}`)}>
              ← Athlete profile
            </button>
            {profile.pbs.mar && (
              <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                      onClick={() => navigate(`/compare?time=${profile.pbs.mar!.time}&dist=42`)}>
                Open in Compare →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="section">
        <div className="page">

          {state === 'loading' && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--meta)', fontSize: 13 }}>
              Loading report…
            </div>
          )}

          {state === 'not-found' && (
            <div style={{ padding: '60px 0' }}>
              <p className="dimmed">Athlete not found.</p>
            </div>
          )}

          {state === 'no-report' && (
            <div style={{ padding: '60px 0', maxWidth: 560 }}>
              <div className="eyebrow mb-16">Report not yet generated</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--meta)', margin: '0 0 24px' }}>
                No report exists for {profile.name} yet. To generate one, run:
              </p>
              <pre style={{
                background: 'var(--surface-dark)', color: 'var(--on-dark)',
                padding: '16px 20px', fontSize: 12.5, fontFamily: "'DM Mono', monospace",
                lineHeight: 1.6, overflowX: 'auto',
              }}>
                {`ANTHROPIC_API_KEY=sk-... npx tsx scripts/generateReport.ts ${slug}`}
              </pre>
              <p style={{ fontSize: 12, color: 'var(--meta)', marginTop: 16 }}>
                Output is saved to <code style={{ fontFamily: "'DM Mono', monospace" }}>public/data/reports/{slug}.json</code> and served statically.
              </p>
            </div>
          )}

          {state === 'loaded' && data && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 64, alignItems: 'start' }} className="overview-grid">

              {/* ── Left: narrative sections ── */}
              <div>

                {data.report.career_summary && (
                  <ReportSection label="Career Summary">
                    <Prose text={data.report.career_summary} />
                  </ReportSection>
                )}

                {data.report.trajectory && (
                  <ReportSection label="Trajectory">
                    <Prose text={data.report.trajectory} />
                    {(data.metrics_summary.trajectory_marathon || data.metrics_summary.trajectory_half) && (
                      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                        {data.metrics_summary.trajectory_marathon && (
                          <MetricPill label="Marathon trend" value={data.metrics_summary.trajectory_marathon} />
                        )}
                        {data.metrics_summary.trajectory_half && (
                          <MetricPill label="Half marathon trend" value={data.metrics_summary.trajectory_half} />
                        )}
                      </div>
                    )}
                  </ReportSection>
                )}

                {data.report.best_result && (
                  <ReportSection label="Best Result in Context">
                    <Prose text={data.report.best_result} />
                    {data.metrics_summary.best_result_percentile !== null && (
                      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                        <MetricPill
                          label={data.metrics_summary.best_result_race ?? 'Peak result'}
                          value={`${data.metrics_summary.best_result_percentile.toFixed(1)}th pct`}
                        />
                      </div>
                    )}
                  </ReportSection>
                )}

                {data.report.distance_profile && (
                  <ReportSection label="Distance Profile">
                    <Prose text={data.report.distance_profile} />
                    <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                      {data.metrics_summary.age_grading_marathon !== null && (
                        <MetricPill label="Age-graded · marathon" value={`${data.metrics_summary.age_grading_marathon.toFixed(1)}%`} />
                      )}
                      {data.metrics_summary.age_grading_half !== null && (
                        <MetricPill label="Age-graded · half" value={`${data.metrics_summary.age_grading_half.toFixed(1)}%`} />
                      )}
                    </div>
                  </ReportSection>
                )}

                {data.report.where_to_race && (
                  <ReportSection label="Where to Race">
                    <Prose text={data.report.where_to_race} />
                    <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="race-rec-grid">
                      <RaceTable races={data.metrics_summary.strong_placement_races} label="Strong placement projected" />
                      <RaceTable races={data.metrics_summary.challenging_races} label="Genuinely challenging" />
                    </div>
                  </ReportSection>
                )}

                {data.report.qualifying_note && (
                  <ReportSection label="Qualifying">
                    <Prose text={data.report.qualifying_note} />
                    {data.metrics_summary.boston_status && (
                      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                        <MetricPill
                          label="Boston status"
                          value={data.metrics_summary.boston_status.charAt(0).toUpperCase() + data.metrics_summary.boston_status.slice(1)}
                        />
                      </div>
                    )}
                  </ReportSection>
                )}

              </div>

              {/* ── Right: at-a-glance sidebar ── */}
              <div style={{ position: 'sticky', top: 24 }}>
                <div className="eyebrow mb-16">At a glance</div>

                {[
                  { label: 'Races logged',     val: String(profile.results.length)  },
                  profile.pbs.mar  ? { label: 'Marathon PB',      val: profile.pbs.mar.time  } : null,
                  profile.pbs.half ? { label: 'Half marathon PB', val: profile.pbs.half.time } : null,
                ].filter(Boolean).map((s, i) => (
                  <div key={i} style={{
                    padding: '14px 0', borderBottom: '0.5px solid var(--rule-soft)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12,
                  }}>
                    <div className="label">{s!.label}</div>
                    <div className="serif" style={{ fontSize: 20, letterSpacing: '-0.01em', flexShrink: 0 }}>{s!.val}</div>
                  </div>
                ))}

                {data.metrics_summary.boston_status && (
                  <div style={{ marginTop: 20 }}>
                    <div className="label mb-8">Boston qualifier</div>
                    <div style={{
                      display: 'inline-block', padding: '3px 10px',
                      fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                      fontFamily: "'DM Mono', monospace", borderRadius: 999,
                      border: '0.5px solid',
                      color: data.metrics_summary.boston_status === 'qualified' ? 'var(--accent-good)' : 'var(--meta)',
                      borderColor: data.metrics_summary.boston_status === 'qualified' ? 'var(--accent-good)' : 'var(--rule-soft)',
                    }}>
                      {data.metrics_summary.boston_status}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 32, paddingTop: 20, borderTop: '0.5px solid var(--rule-soft)' }}>
                  <div style={{ fontSize: 10, color: 'var(--meta)', lineHeight: 1.6 }}>
                    Report generated {generatedDate}.<br />
                    Percentiles and projections use field data from LOGS archive.
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          nav, footer, .btn { display: none !important; }
          .overview-grid { grid-template-columns: 1fr !important; }
          .race-rec-grid { grid-template-columns: 1fr 1fr !important; }
          body { background: white !important; color: black !important; }
        }
        @media (max-width: 700px) {
          .overview-grid { grid-template-columns: 1fr !important; }
          .race-rec-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
