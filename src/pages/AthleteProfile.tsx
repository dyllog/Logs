import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import '../styles/athlete-profile.css';
import { formatAgeGrade } from '../lib/athleteMetrics';
import {
  buildProfileModel,
  eventLabel,
  nationalPlacing,
  nfmt,
  ordinal,
  pctTop,
  resultLocation,
  ROAD_DIST_LABEL,
  type ArcPoint,
  type CanonProfile,
  type CanonResult,
  type ModuleList,
  type Progression,
  type ProfileModel,
  type NatCohorts,
} from '../lib/athleteProfileModel';

/**
 * The athlete profile — one component, five states, driven entirely by data.
 *
 * The rule the whole page obeys: a module renders only when its data earns it.
 * There are no zero-states, no placeholders and no "no data" messages anywhere
 * below. A two-result profile is not a stripped-down version of a better page;
 * it is simply a shorter one. Every condition that decides presence lives in
 * athleteProfileModel.ts, so it can be reasoned about without reading JSX.
 *
 * The single exception to "absence is invisible" is the vertical-gain slot in
 * the trail block, which is deliberately held open: the archive would rather
 * show an empty, hatched cell than an estimated climb.
 */

/**
 * Career reports are parked, awaiting the accounts / claim-records cluster.
 *
 * The feature was built when the archive held 24 profiles; it now holds 74,116,
 * of which 22 have a report — and those 22 are not a selection but a fossil of
 * the pre-Phase-0 hardcoded registry. Generation is per-token billable, and it
 * belongs behind an account: a runner who has just claimed their records is
 * exactly the person who wants one, and by then the profile is verified rather
 * than name-matched.
 *
 * This is a display gate, not a teardown. The presence check, the route, the
 * generator and the 22 existing reports all stay — flip this to true to bring
 * the entry point back.
 */
const REPORTS_ENABLED = false;

const TRAIL_NOTE =
  'Trail courses are re-measured each year, so trail results carry the year’s real distance. ' +
  'They are never reduced to personal bests, never age-graded, and never combined with road figures.';

function AgeGradeNote() {
  return (
    <p className="ag-note">
      <b>Age grade</b> compares a time against the age standard for the athlete’s age and gender,
      using the <Link to="/methodology#age-grading">World Masters Athletics tables</Link> (2025 revision).
      100% is a world-best-equivalent run; above 80% is national class. The archive records an age
      band rather than a birth date, so age is taken as the band’s midpoint and the grade is shown
      to whole numbers — the ±2-year estimate doesn’t support a decimal place. Road only: terrain
      and vertical gain aren’t modelled, so trail results are never age-graded.
    </p>
  );
}

function shardKey(slug: string): string {
  const s = slug.replace(/[^a-z0-9]/g, '');
  return (s.slice(0, 2) || '_').padEnd(2, '_');
}

function SectionRule({ title }: { title: string }) {
  return (
    <div className="section-rule-bar">
      <div className="line" />
      <div className="title">{title}</div>
      <div className="line" />
    </div>
  );
}

// ── Road progression ─────────────────────────────────────────────────────────
// Only reached when a single distance holds 3+ road results.

function ProgressionChart({ prog }: { prog: Progression }) {
  const pts = prog.pts;
  const W = 760, H = 220, L = 54, R = 730, T = 26, B = 176;
  const ss = pts.map(p => p.sec);
  const lo = Math.min(...ss), hi = Math.max(...ss), span = hi - lo || 1;
  const X = (i: number) => L + (i * (R - L)) / Math.max(1, pts.length - 1);
  const Y = (s: number) => T + ((s - lo) / span) * (B - T);

  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.sec).toFixed(1)}`).join(' ');
  const fastest = pts.reduce((a, p) => (p.sec < a.sec ? p : a));
  const slowest = pts.reduce((a, p) => (p.sec > a.sec ? p : a));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={L} x2={R} y1={T} y2={T} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
      <line x1={L} x2={R} y1={B} y2={B} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
      <text x="0" y={T + 4} fontFamily="DM Mono, monospace" fontSize="9.5" fill="currentColor" fillOpacity="0.5">{fastest.time}</text>
      <text x="0" y={B + 4} fontFamily="DM Mono, monospace" fontSize="9.5" fill="currentColor" fillOpacity="0.5">{slowest.time}</text>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1" />
      {pts.map((p, i) =>
        p.isPB ? (
          <circle key={i} cx={X(i)} cy={Y(p.sec)} r="4.5" fill="var(--accent)" stroke="var(--accent)" />
        ) : (
          <circle key={i} cx={X(i)} cy={Y(p.sec)} r="2.8" fill="var(--bg)" stroke="currentColor" strokeWidth="1" />
        )
      )}
      <g fontFamily="DM Mono, monospace" fontSize="10" fill="currentColor" fillOpacity="0.55" letterSpacing="0.08em">
        {pts.map((p, i) => (
          <text key={i} x={X(i)} y="200" textAnchor="middle">{p.year}</text>
        ))}
      </g>
    </svg>
  );
}

// ── Trail distance arc ───────────────────────────────────────────────────────
// Not faster — longer. A step chart of the first finish at each sub-event
// distance, labelled with the real course distance as run that year.

function DistanceArc({ pts }: { pts: ArcPoint[] }) {
  const W = 760, H = 230, L = 62, R = 720, T = 52, B = 176;
  const hi = Math.max(...pts.map(p => p.km)) * 1.08;
  const X = (i: number) => L + (i * (R - L)) / Math.max(1, pts.length - 1);
  const Y = (d: number) => B - (d / hi) * (B - T);

  let step = `M${X(0)},${Y(pts[0].km)}`;
  pts.forEach((p, i) => {
    if (i) step += ` L${X(i)},${Y(pts[i - 1].km)} L${X(i)},${Y(p.km)}`;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      <line x1={L} x2={R} y1={B} y2={B} stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" />
      <path d={step} fill="none" stroke="currentColor" strokeWidth="1" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={X(i)} cy={Y(p.km)} r="3.4" fill="var(--bg)" stroke="currentColor" strokeWidth="1" />
          <text x={X(i)} y={Y(p.km) - 32} textAnchor="middle" fontFamily="DM Serif Display, serif" fontSize="17" fill="currentColor">{p.label}</text>
          <text x={X(i)} y={Y(p.km) - 17} textAnchor="middle" fontFamily="DM Mono, monospace" fontSize="9.5" fill="currentColor" fillOpacity="0.5" letterSpacing="0.08em">{p.km} KM</text>
        </g>
      ))}
      <g fontFamily="DM Mono, monospace" fontSize="10" fill="currentColor" fillOpacity="0.55" letterSpacing="0.08em">
        {pts.map((p, i) => (
          <text key={i} x={X(i)} y="200" textAnchor="middle">{p.year}</text>
        ))}
      </g>
    </svg>
  );
}

// ── Modules ──────────────────────────────────────────────────────────────────

function ModuleCard({ mod, n }: { mod: ModuleList; n: number }) {
  return (
    <div className="ap-mod">
      <div className="num">No. {String(n).padStart(2, '0')} · {mod.kicker}</div>
      <h4>{mod.title}</h4>
      <div className="desc">{mod.desc}</div>
      <ul>
        {mod.rows.map(([a, b], i) => (
          <li key={i}><span className="nm">{a}</span><span className="vv">{b}</span></li>
        ))}
      </ul>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AthleteProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CanonProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [hasReport, setHasReport] = useState(false);
  const [progDist, setProgDist] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setStatus('loading');
    setProfile(null);
    setProgDist(null);
    fetch(`/data/athletes/${shardKey(slug)}.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('shard missing'))))
      .then((shard: Record<string, CanonProfile>) => {
        if (cancelled) return;
        const p = shard[slug];
        if (p) { setProfile(p); setStatus('ok'); }
        else setStatus('missing');
      })
      .catch(() => { if (!cancelled) setStatus('missing'); });
    return () => { cancelled = true; };
  }, [slug]);

  // A written report exists for only a subset of athletes — gate the CTA on its
  // presence. Confirming the response is JSON (not just a 200) keeps the check
  // correct on SPA hosts that rewrite unknown paths to index.html.
  useEffect(() => {
    if (!slug) return;
    // Retained verbatim but idle while reports are parked: with no CTA to gate,
    // this would be a HEAD request on every one of 74k profile views that could
    // not change what renders. Flipping REPORTS_ENABLED restores both together.
    if (!REPORTS_ENABLED) return;
    let cancelled = false;
    setHasReport(false);
    fetch(`/data/reports/${slug}.json`, { method: 'HEAD' })
      .then(r => {
        const isJson = r.ok && (r.headers.get('content-type') ?? '').includes('application/json');
        if (!cancelled) setHasReport(isJson);
      })
      .catch(() => { if (!cancelled) setHasReport(false); });
    return () => { cancelled = true; };
  }, [slug]);

  // Cohort sizes live per race-year rather than on every result row — see
  // NatCohorts. Fetched once; national placing simply doesn't render until it
  // arrives, which is the same rule as any other module that can't be honest yet.
  const [natCohorts, setNatCohorts] = useState<NatCohorts>({});
  useEffect(() => {
    let cancelled = false;
    fetch('/data/nat-cohorts.json')
      .then(r => (r.ok ? r.json() : {}))
      .then((c: NatCohorts) => { if (!cancelled) setNatCohorts(c); })
      .catch(() => { /* no national placing without it */ });
    return () => { cancelled = true; };
  }, []);

  const model: ProfileModel | null = useMemo(
    () => (profile ? buildProfileModel(profile, natCohorts) : null),
    [profile, natCohorts]
  );

  if (status === 'loading') {
    return (
      <main className="athlete-profile">
        <section className="section"><div className="page dimmed">Loading athlete…</div></section>
      </main>
    );
  }

  if (status === 'missing' || !profile || !model) {
    return (
      <main className="athlete-profile">
        <section className="section">
          <div className="page">
            <div className="eyebrow mb-8">Athlete</div>
            <h1 className="serif" style={{ fontSize: 32, margin: '0 0 12px' }}>Profile not found</h1>
            <p className="dimmed" style={{ maxWidth: 480 }}>
              No standalone profile exists for this athlete. Only athletes with two or more logged races
              get a profile page — everyone else remains searchable.
            </p>
            <button className="btn mt-16" onClick={() => navigate('/athletes')}>Browse athletes →</button>
          </div>
        </section>
      </main>
    );
  }

  const { flagged } = model;
  const activeProg =
    model.progressions.find(p => p.distId === progDist) ?? model.progressions[0] ?? null;

  const anyAgeGrade = model.bests.some(b => b.ageGrade != null);
  const bestsLabel = flagged
    ? 'Fastest recorded under this name'
    : model.trail
      ? 'Road · personal bests'
      : 'Performance summary';

  // "results logged" everywhere except flagged, where nothing licenses calling
  // this collection one person's results.
  const countLabel = flagged
    ? `${profile.results.length} records under this name`
    : `${profile.results.length} result${profile.results.length === 1 ? '' : 's'} logged`;

  const genderLabel = profile.gender === 'M' ? 'Men' : profile.gender === 'W' || profile.gender === 'F' ? 'Women' : null;
  const span = model.yearFrom === model.yearTo ? String(model.yearFrom) : `${model.yearFrom} — ${model.yearTo}`;
  const bandLabel = flagged
    ? (model.conflictBands.length ? model.conflictBands.join(' · ') : null)
    : model.currentBand;

  const identBits: React.ReactNode[] = [];
  if (profile.nationality) identBits.push(profile.nationality);
  if (genderLabel) identBits.push(genderLabel);
  if (bandLabel) identBits.push(bandLabel);
  // "results logged" everywhere except flagged, where the archive cannot say
  // whose results these are — including on the road/trail split.
  identBits.push(
    flagged
      ? <><span className="v">{profile.results.length}</span> records under this name{model.multiSurface && <> · <span className="v">{model.roadCount}</span> road, <span className="v">{model.trailCount}</span> trail</>}</>
      : model.multiSurface
        ? <><span className="v">{profile.results.length}</span> results · <span className="v">{model.roadCount}</span> road, <span className="v">{model.trailCount}</span> trail</>
        : <><span className="v">{profile.results.length}</span> results logged</>
  );
  identBits.push(<span className="v">{span}</span>);

  const roadPB = model.bests[0];

  return (
    <main className="athlete-profile">
      {/* Identity */}
      <div className="page">
        <section className="ap-ident">
          <h1>{profile.name}</h1>
          <div className="idmeta">
            {identBits.map((b, i) => (
              <span key={i}>{i > 0 && <span className="dot"> · </span>}{b}</span>
            ))}
          </div>

          {flagged && (
            <div className="chiprow">
              <span className="shared-chip">Shared name · records may span several runners</span>
            </div>
          )}

          <div className="actions">
            {/* Compare works on road times only — a trail time has nothing to
                compare against, and must never be fed into a road model. It is
                also withheld while flagged: sending the fastest time recorded
                under a shared name into Compare would assert it as one
                runner's PB, which is the very thing in question. */}
            {roadPB && !flagged && (
              <button
                className="btn"
                style={{ fontSize: 10.5 }}
                onClick={() => {
                  const d = roadPB.distId === 'mar' ? 42 : roadPB.distId === 'half' ? 21 : roadPB.distId === '10k' ? 10 : 5;
                  navigate(`/compare?time=${encodeURIComponent(roadPB.time)}&dist=${d}`);
                }}
              >
                Open in Compare →
              </button>
            )}
            {/* Career reports are PARKED, not removed — see REPORTS_ENABLED.
                The route and the presence check above stay live, so existing
                links still resolve; only the entry point is withheld. */}
            {REPORTS_ENABLED && hasReport && !flagged && (
              <button className="btn" style={{ fontSize: 10.5 }} onClick={() => navigate(`/athletes/${profile.slug}/report`)}>
                View Report →
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Road performance summary. Flagged profiles keep the tiles — every time
          shown is real — but lose the age grade, which presumes we know whose
          age band applies. Field percentile stays: it is a per-result fact. */}
      {model.bests.length > 0 && (
        <>
          <div className="page">
            <section className="section" style={{ paddingBottom: 22 }}>
              <SectionRule title={bestsLabel} />
            </section>
          </div>
          <div className={`ap-perf n${Math.min(model.bests.length, 4)}`}>
            {model.bests.map(b => (
              <div className="tile" key={b.distId}>
                <div>
                  <div className="tk">{b.label}</div>
                  <div className="tt">{b.time}</div>
                  <div className="tw">{b.race} · {b.year}</div>
                </div>
                <div className={`diffs${b.ageGrade == null ? ' one' : ''}`}>
                  {/* A win is not a percentile story — lead with the placing. */}
                  {b.podium ? (
                    <div>
                      <div className="dk">Placing</div>
                      <div className="dv">{ordinal(b.pos)}</div>
                      <div className="dn">of {nfmt(b.total)} finishers</div>
                    </div>
                  ) : (
                    <div>
                      <div className="dk">Field percentile</div>
                      <div className="dv">{b.pct != null ? `Top ${b.pct}%` : '—'}</div>
                      <div className="dn">{nfmt(b.pos)} of {nfmt(b.total)} finishers</div>
                    </div>
                  )}
                  {b.ageGrade != null && (
                    <div>
                      <div className="dk has-def" title="World Masters Athletics age grading: this time as a percentage of the age standard for the athlete's age and gender. 100% = world-best equivalent.">Age grade</div>
                      <div className="dv">{formatAgeGrade(b.ageGrade)}</div>
                      <div className="dn">
                        {b.ageGrade.estimated
                          ? <>WMA 2025 · {b.cat} band, age ~{b.ageGrade.ageUsed}</>
                          : <>WMA 2025 · age {b.ageGrade.ageUsed}</>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {anyAgeGrade && <div className="page"><AgeGradeNote /></div>}
        </>
      )}

      {/* Trail — results in context. Never bests, never age-graded, never
          summed with road. */}
      {model.trail && (
        <>
          <div className="page">
            <section className="section" style={{ paddingBottom: 22 }}>
              <SectionRule title="Trail · results in context" />
            </section>
          </div>
          <div className="ap-trail">
            <div className="tb-head">
              <span>Not personal bests · not age-graded · not comparable to road</span>
              <span>{model.trail.finishes} trail finishes</span>
            </div>
            <div className={`tb-cum${model.trail.km == null ? ' c2' : ''}`}>
              {model.trail.km != null && (
                <div>
                  <div className="tk">Distance covered</div>
                  <div className="cum">{model.trail.km.toFixed(1)} km</div>
                  <div className="tn">Sum of real course distances across {model.trail.finishes} finishes</div>
                </div>
              )}
              <div>
                <div className="tk">Time on feet</div>
                <div className="cum">{model.trail.hours.toFixed(1)} h</div>
                <div className="tn">Total racing time, trail only</div>
              </div>
              {/* Held open on purpose. An estimated climb is worse than none. */}
              <div className="vert-slot">
                <div className="tk">Vertical gain</div>
                <div className="cum dim">—</div>
                <div className="tn">Awaiting surveyed elevation per course instance. No estimates.</div>
              </div>
            </div>
            <div className={`tb-cells${model.trail.cells.length < 3 ? ` c${model.trail.cells.length}` : ''}`}>
              {model.trail.cells.map((c, i) => (
                <div className="tcell" key={i}>
                  <div className="tk">{c.k}</div>
                  <div className="tv">{c.v}</div>
                  <div className="tn">{c.n}</div>
                </div>
              ))}
            </div>
            {model.trail.loyalty && (
              <div className="tb-foot">
                <span>Event loyalty</span>
                <span className="v">{model.trail.loyalty}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* The turn — derived facts only, no narrative prose. */}
      {model.transition && (
        <div className="page">
          <section className="section" style={{ paddingBottom: 0, borderTop: 0 }}>
            <div className="ap-transition">
              {model.transition.map((f, i) => (
                <div className="row" key={i}>
                  <span className="tw-k">{f.k}</span>
                  <span className="tw-v">{f.v}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* One chronological spine, surface-tagged. Every row is true — which is
          why the flagged state keeps the table in full. */}
      <div className="page">
        <section className="section">
          <SectionRule title="Results" />

          {flagged && (
            <div className="ap-disclosure">
              <div className="body">
                <div className="dh">Shared name · Records may span several runners</div>
                <p>
                  Every result below is accurate, but they are grouped only by name. The archive
                  cannot confirm they belong to one person, so career totals, records, progression
                  lines and age grades are withheld from this profile.
                </p>
                {model.conflictBands.length > 1 && (
                  <p>
                    Age bands recorded under this name in a single year: {model.conflictBands.join(' · ')}.
                  </p>
                )}
              </div>
              <div className="slot">
                Claim your records<br /><span style={{ opacity: 0.5 }}>— reserved —</span>
              </div>
            </div>
          )}

          <div className="tbl-wrap">
            <table className="tbl res-tbl">
              <thead>
                <tr>
                  <th className="col-dt">Year</th>
                  <th>Event</th>
                  {model.multiSurface && <th>Surface</th>}
                  <th>Distance</th>
                  <th>Time</th>
                  <th>Position</th>
                  <th className="col-cat">Age band</th>
                </tr>
              </thead>
              <tbody>
                {model.chrono.map((r: CanonResult, i) => {
                  const { ev, sub } = eventLabel(r);
                  const loc = resultLocation(r);
                  const pct = pctTop(r.pos, r.total);
                  const np = nationalPlacing(r, natCohorts);
                  const href = r.trail
                    ? `/races/${r.raceSlug}?sub=${r.distId}&year=${r.year}`
                    : `/races/${r.raceSlug}?year=${r.year}`;
                  return (
                    <tr className="row" key={i} onClick={() => navigate(href)}>
                      <td className="dt col-dt time">{r.year}</td>
                      <td className="ev">
                        {ev}{sub && <span className="subev"> · {sub}</span>}
                        {loc && <span className="sub">{loc}</span>}
                      </td>
                      {model.multiSurface && (
                        <td><span className={`surf-tag${r.trail ? ' trail' : ''}`}>{r.trail ? 'trail' : 'road'}</span></td>
                      )}
                      <td className="ds">{r.dist}</td>
                      <td className="ti">{r.time}</td>
                      <td className="pos">
                        <span className="x">{nfmt(r.pos)}</span> / {nfmt(r.total)}
                        {r.pos > 3 && pct != null && <span className="real"> · top {pct}%</span>}
                        {np && <span className="natp">{ordinal(np.pos)} {np.nat}</span>}
                      </td>
                      <td className="cat col-cat">{r.cat}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="tbl-foot"><span>{countLabel}</span></div>

          {model.trail && <p className="surface-note">{TRAIL_NOTE}</p>}
        </section>
      </div>

      {/* Progression — a single distance with 3+ road results. Below that there
          is no line to draw, so no chart appears. */}
      {activeProg && (
        <div className="page">
          <section className="section">
            <SectionRule title={model.trail ? 'Road progression' : 'Progression'} />
            <div className="prog-shell">
              <div className="prog-head">
                <div>
                  <div className="eyebrow">{activeProg.label}</div>
                  <h2 className="serif">Season by season.</h2>
                </div>
                {model.progressions.length > 1 && (
                  <div className="flex gap-8">
                    {model.progressions.map(p => (
                      <button
                        key={p.distId}
                        className={`pill ${activeProg.distId === p.distId ? 'active' : ''}`}
                        onClick={() => setProgDist(p.distId)}
                      >
                        {ROAD_DIST_LABEL[p.distId] ?? p.distId}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <ProgressionChart prog={activeProg} />
              <div className="prog-foot">
                <span>{activeProg.pts.length} finishes · {activeProg.label}</span>
                <span>Each logged road finish at this distance, in order</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Trail distance arc — 2+ sub-event distances. */}
      {model.arc && (
        <div className="page">
          <section className="section">
            <SectionRule title="Trail distance arc" />
            <div className="prog-shell">
              <div className="prog-head">
                <div>
                  <div className="eyebrow">First finish at each sub-event distance</div>
                  <h2 className="serif">
                    Not faster — <em style={{ fontStyle: 'italic', color: 'var(--meta)' }}>longer.</em>
                  </h2>
                </div>
              </div>
              <DistanceArc pts={model.arc} />
              <div className="prog-foot">
                <span>{model.arc.length} sub-event distances</span>
                <span>Real course distance, as run</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Derived modules — road and trail kept apart, and each present only if
          it has rows. A profile with none of them simply ends at the table. */}
      {model.modules.length > 0 && (
        <>
          <div className="page">
            <section className="section" style={{ paddingBottom: 22 }}>
              <SectionRule title="Through this record" />
            </section>
          </div>
          <div className="page">
            <div className={`ap-mods${model.modules.length < 3 ? ` m${model.modules.length}` : ''}`}>
              {model.modules.map((m, i) => (
                <ModuleCard key={i} mod={m} n={i + 1} />
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
