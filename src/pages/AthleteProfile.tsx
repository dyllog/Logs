import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type DistId = string;

interface Result {
  year: number;
  race: string;
  raceSlug: string;
  dist: string;
  distId: DistId;   // road: 'mar' | 'half' | '10k' | '5k'; trail: the sub-event id ('t102', 'miler', …)
  time: string;
  sec: number;
  pos: number;
  total: number;
  cat: string;
  isPB?: boolean;
  /** Trail results are results-in-context: never PBs, never in Compare. */
  trail?: boolean;
}

interface PB { time: string; sec: number; race: string; year: number; }

interface Profile {
  id: number;
  slug: string;
  name: string;
  gender: 'M' | 'W' | '?';
  nationality: string;
  racesLogged: number;
  pbTime: string;
  pbRace: string;
  pbs: Record<DistId, PB>;
  results: Result[];
  /** Derived each generate from unresolved hard identity conflicts (two finishes
   *  in one edition, or two incompatible age bands in one year). Discloses that
   *  same-name runners may be combined here. See flagInconsistentClusters.mjs. */
  knownMultiPerson?: boolean;
}

const DIST_LABEL: Record<string, string> = { mar: '42.2 km', half: '21.1 km', '10k': '10 km', '5k': '5 km' };
const DIST_ORDER = ['mar', 'half', '10k', '5k'];
const SEASON: Record<string, number> = { mar: 5, half: 5, '10k': 4, '5k': 4 };

function shardKey(slug: string): string {
  const s = slug.replace(/[^a-z0-9]/g, '');
  return (s.slice(0, 2) || '_').padEnd(2, '_');
}

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
}

function pctStr(pos: number, total: number): string {
  if (!total) return '—';
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}

function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th');
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function shortRace(race: string): string {
  return race
    .replace(/\bMarathon\b/i, '')
    .replace(/\bHalf\b/i, 'Half')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16);
}

// Assign a fractional x-position per result so same-year finishes don't collide.
function withDates(results: Result[]): (Result & { dateNum: number })[] {
  const seen: Record<string, number> = {};
  return results.map(r => {
    const k = `${r.year}|${r.distId}`;
    const n = seen[k] ?? 0;
    seen[k] = n + 1;
    return { ...r, dateNum: r.year + ((SEASON[r.distId] ?? 6) + n * 0.6) / 12 };
  });
}

function ProgressionChart({ results, distId }: { results: (Result & { dateNum: number })[]; distId: DistId }) {
  const pts = results.filter(r => r.distId === distId).sort((a, b) => a.dateNum - b.dateNum);
  if (pts.length === 0) return null;

  const W = 640, H = 180;
  const padL = 60, padR = 24, padT = 28, padB = 36;
  const cW = W - padL - padR, cH = H - padT - padB;

  const xMin = pts[0].dateNum - 0.5;
  const xMax = pts[pts.length - 1].dateNum + 0.5;

  const sMin = Math.min(...pts.map(p => p.sec));
  const sMax = Math.max(...pts.map(p => p.sec));
  const sPad = (sMax - sMin) * 0.12 || 60;
  const yLo = sMin - sPad;
  const yHi = sMax + sPad;

  const cx = (v: number) => padL + ((v - xMin) / (xMax - xMin || 1)) * cW;
  const cy = (v: number) => padT + ((v - yLo) / (yHi - yLo || 1)) * cH;

  // Adaptive gridline step: aim for ~5 lines regardless of the athlete's spread.
  const NICE = [30, 60, 120, 180, 300, 600, 900, 1200, 1800, 3600, 7200];
  const span = yHi - yLo;
  const step = NICE.find(s => span / s <= 6) ?? 7200;
  const yTicks: number[] = [];
  for (let s = Math.ceil(yLo / step) * step; s <= yHi; s += step) yTicks.push(s);
  const xYears: number[] = [];
  for (let y = Math.ceil(xMin); y <= Math.floor(xMax); y++) xYears.push(y);

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx(p.dateNum).toFixed(1)},${cy(p.sec).toFixed(1)}`).join(' ');
  const color = distId === 'mar' ? 'var(--on-dark)' : 'var(--accent-good)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      {yTicks.map(s => {
        const yy = cy(s);
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
        const label = h ? `${h}:${String(m).padStart(2, '0')}` : `${m}:00`;
        return (
          <g key={s}>
            <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={color} strokeOpacity="0.1" strokeWidth="0.5" />
            <text x={padL - 8} y={yy + 3.5} textAnchor="end" fontSize="9" fontFamily="DM Mono,monospace" fill={color} fillOpacity="0.5" letterSpacing="0.04em">{label}</text>
          </g>
        );
      })}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
      {pts.map((p, i) => {
        const x = cx(p.dateNum), y = cy(p.sec);
        const labelAbove = i < pts.length - 1 || p.isPB;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={p.isPB ? 5 : 3} fill={p.isPB ? color : 'var(--surface-dark)'} stroke={color} strokeWidth="1.5" />
            <text x={x} y={y + (labelAbove ? -10 : 14)} textAnchor="middle" fontSize="8.5" fontFamily="DM Mono,monospace" fill={color} fillOpacity={p.isPB ? 1 : 0.55} letterSpacing="0.04em">
              {p.isPB ? `${p.time} PB` : shortRace(p.race)}
            </text>
          </g>
        );
      })}
      <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={color} strokeOpacity="0.15" strokeWidth="0.5" />
      {xYears.map(y => (
        <text key={y} x={cx(y)} y={H - padB + 14} textAnchor="middle" fontSize="9" fontFamily="DM Mono,monospace" fill={color} fillOpacity="0.45" letterSpacing="0.1em">{y}</text>
      ))}
    </svg>
  );
}

export default function AthleteProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');
  const [chartDist, setChartDist] = useState<DistId | null>(null);
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setStatus('loading');
    setProfile(null);
    fetch(`/data/athletes/${shardKey(slug)}.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('shard missing'))))
      .then((shard: Record<string, Profile>) => {
        if (cancelled) return;
        const p = shard[slug];
        if (p) { setProfile(p); setStatus('ok'); }
        else setStatus('missing');
      })
      .catch(() => { if (!cancelled) setStatus('missing'); });
    return () => { cancelled = true; };
  }, [slug]);

  // A written report only exists for a subset of athletes — gate the CTA on its
  // presence (same static-JSON presence check the report page itself relies on).
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setHasReport(false);
    // Must confirm the response is actually JSON, not just that it was a 200:
    // an SPA host that rewrites unknown paths to index.html answers 200/text-html
    // for a report that doesn't exist, which would show "View Report" on every
    // profile. vercel.json also excludes /data/ from the rewrite; this keeps the
    // check correct regardless of how the site is hosted.
    fetch(`/data/reports/${slug}.json`, { method: 'HEAD' })
      .then(r => {
        const isJson = r.ok && (r.headers.get('content-type') ?? '').includes('application/json');
        if (!cancelled) setHasReport(isJson);
      })
      .catch(() => { if (!cancelled) setHasReport(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const dated = useMemo(() => (profile ? withDates(profile.results) : []), [profile]);
  const distIds = useMemo(
    () => (profile ? DIST_ORDER.filter(d => profile.results.some(r => r.distId === d)) : []),
    [profile]
  );

  useEffect(() => {
    if (distIds.length) setChartDist(prev => (prev && distIds.includes(prev) ? prev : distIds[0]));
  }, [distIds]);

  if (status === 'loading') {
    return (
      <main>
        <section className="section"><div className="page dimmed">Loading athlete…</div></section>
      </main>
    );
  }

  if (status === 'missing' || !profile) {
    return (
      <main>
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

  const sortedResults = dated.slice().sort((a, b) => b.dateNum - a.dateNum);
  const latestCat = sortedResults[0]?.cat ?? '';
  const years = profile.results.map(r => r.year);
  const yrLo = Math.min(...years), yrHi = Math.max(...years);
  const wins = profile.results.filter(r => r.pos === 1).length;
  const activeDist = chartDist ?? distIds[0];
  const distResults = profile.results.filter(r => r.distId === activeDist);
  const raceCodes = [...new Set(profile.results.map(r => shortRace(r.race)))].slice(0, 8).join(' · ');

  const genderLabel = profile.gender === 'M' ? 'M' : profile.gender === 'W' ? 'W' : '—';

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>
            Athlete{profile.nationality ? ` · ${profile.nationality}` : ''}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>{initials(profile.name)}</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>{profile.name}</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Nationality', v: profile.nationality || '—' },
                  { l: 'Gender', v: genderLabel },
                  { l: 'Category', v: latestCat || '—' },
                  { l: 'Races logged', v: String(profile.racesLogged) },
                ].map(x => (
                  <div key={x.l}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 4 }}>{x.l}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Road PBs only — trail results are results-in-context and never produce PB tiles. */}
            {distIds.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(distIds.length, 1)}, 1fr)`, gap: 0, background: 'var(--on-dark-rule)', border: '0.5px solid var(--on-dark-rule)' }} className="pb-grid">
              {distIds.map((d, i) => {
                const pb = profile.pbs[d];
                const highlight = i === 0;
                return (
                  <div key={d} style={{ background: 'var(--surface-dark)', padding: '20px 20px 18px' }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 12 }}>{DIST_LABEL[d] ?? d}</div>
                    <div className="serif" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em', color: highlight ? 'var(--accent-good)' : 'var(--on-dark)' }}>{pb?.time ?? '—'}</div>
                    <div style={{ marginTop: 10, fontSize: 10, color: 'var(--on-dark-meta)', lineHeight: 1.4 }}>
                      {pb?.race ?? 'not on record'}<br />
                      {pb && <span style={{ color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}>{pb.year}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {profile.pbTime && (
              <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                      onClick={() => {
                        const d = distIds[0] === 'mar' ? 42 : distIds[0] === 'half' ? 21 : distIds[0] === '10k' ? 10 : 5;
                        navigate(`/compare?time=${encodeURIComponent(profile.pbTime)}&dist=${d}`);
                      }}>
                Open in Compare →
              </button>
            )}
            {hasReport && (
              <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                      onClick={() => navigate(`/athletes/${profile.slug}/report`)}>
                View Report →
              </button>
            )}
          </div>

          {/* Data-provenance disclosure, not an error state — deliberately no
              icon, no colour treatment, no effect on the results below. Sits in
              the actions area so the future "claim this profile" CTA can sit
              beside it. Rendered on every profile whose records carry an
              unresolved identity conflict (~1.6k of 74k). */}
          {profile.knownMultiPerson && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '0.5px solid var(--on-dark-rule)', maxWidth: 620, fontSize: 11.5, lineHeight: 1.6, color: 'var(--on-dark-meta)' }}>
              Some results below may belong to another runner of the same name — name-based
              matching can’t always tell them apart. Every finish shown is real and correctly
              recorded; only the grouping is uncertain. Runners will be able to claim their own
              records.
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              {distIds.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                    <div>
                      <div className="eyebrow mb-8">Progression · {DIST_LABEL[activeDist] ?? activeDist}</div>
                      <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>
                        Tracked {DIST_LABEL[activeDist] ?? activeDist} times
                      </h2>
                    </div>
                    {distIds.length > 1 && (
                      <div className="flex gap-8">
                        {distIds.map(d => (
                          <button key={d} className={`pill ${activeDist === d ? 'active' : ''}`} onClick={() => setChartDist(d)}>{DIST_LABEL[d] ?? d}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ background: 'var(--surface-dark)', padding: '24px 20px 16px', position: 'relative' }}>
                    <ProgressionChart results={dated} distId={activeDist} />
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 11, color: 'var(--meta)' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>
                      PB: <span style={{ color: 'var(--ink)' }}>{profile.pbs[activeDist]?.time ?? '—'}</span>
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>
                      {distResults.length} finishes · {Math.min(...distResults.map(r => r.year))}–{Math.max(...distResults.map(r => r.year))}
                    </span>
                  </div>
                </>
              ) : (
                // Trail-only athlete: no road progressions or PBs to chart —
                // their finishes live in the race history table below.
                <div>
                  <div className="eyebrow mb-8">Progression</div>
                  <div className="dimmed" style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 420 }}>
                    No tracked road distances yet. Trail finishes appear in the
                    race history below as results in context — trail courses
                    change year to year, so they don't produce PBs.
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="eyebrow mb-16">At a glance</div>
              {[
                { label: 'Races logged', val: String(profile.racesLogged), sub: `${yrLo}–${yrHi}` },
                ...distIds.map(d => ({
                  label: `${DIST_LABEL[d] ?? d} PB`,
                  val: profile.pbs[d]?.time ?? '—',
                  sub: profile.pbs[d] ? `${profile.pbs[d].race} ${profile.pbs[d].year}` : 'not on record',
                })),
                { label: 'Career wins', val: String(wins), sub: wins ? 'finishes in 1st place' : 'no wins on record' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px 0', borderBottom: '0.5px solid var(--rule-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div>
                    <div className="label mb-4">{s.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--meta)', marginTop: 2, lineHeight: 1.4 }}>{s.sub}</div>
                  </div>
                  <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em', flexShrink: 0 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race history · all distances</div>
              <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>
                {profile.results.length} finishes on record
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12 }}>{yrLo}–{yrHi} · {raceCodes}</div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Race</th>
                  <th>Dist</th>
                  <th className="num">Time</th>
                  <th style={{ textAlign: 'center', width: 60 }}>Overall</th>
                  <th className="num" style={{ width: 70 }}>Percentile</th>
                  <th>Category</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r, i) => {
                  const d = r.distId === 'mar' ? '42' : r.distId === 'half' ? '21' : r.distId === '10k' ? '10' : '5';
                  // Trail rows deep-link to the family page's sub-event + year.
                  const href = r.trail
                    ? `/races/${r.raceSlug}?sub=${r.distId}&year=${r.year}`
                    : `/races/${r.raceSlug}?year=${r.year}&dist=${d}`;
                  return (
                    <tr key={i} className="row" onClick={() => navigate(href)}>
                      <td className="dimmed">{r.year}</td>
                      <td><span className="serif" style={{ fontSize: 15 }}>{r.race}</span></td>
                      <td className="dimmed">{r.dist}</td>
                      <td className="num time" style={{ color: r.isPB ? 'var(--accent-good)' : 'inherit', fontWeight: r.isPB ? 500 : 400 }}>{r.time}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`pos ${r.pos === 1 ? 'pos-1' : ''}`} style={{ color: r.pos <= 3 ? 'var(--ink)' : 'var(--meta)' }}>
                          {ordSuffix(r.pos)}
                        </span>
                      </td>
                      <td className="num dimmed">{pctStr(r.pos, r.total)}</td>
                      <td className="dimmed" style={{ fontSize: 12 }}>{r.cat}</td>
                      <td style={{ textAlign: 'right' }}>
                        {r.isPB && <span style={{ color: 'var(--accent-good)', border: '0.5px solid var(--accent-good)', padding: '2px 8px', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 999, fontFamily: "'DM Mono', monospace" }}>PB</span>}
                        {r.pos === 1 && !r.isPB && <span style={{ color: 'var(--ink)', border: '0.5px solid var(--rule)', padding: '2px 8px', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 999, fontFamily: "'DM Mono', monospace" }}>Win</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
            Percentile computed across all finishers in that event and year. Times as recorded in published race results.
          </div>
        </div>
      </section>
    </main>
  );
}
