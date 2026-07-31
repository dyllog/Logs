import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  type TrailEventFamily, type CourseInstance, type SubEventYear,
  subEventYears, latestCourse, archiveSpan,
} from '@/data/trailEventConfig';
import { normalise, getAthleteSlug, preloadAthleteIndex } from '@/data/athleteProfiles';

/**
 * Trail family race page — the Event Family → Sub-Event → Edition → Course
 * Instance model rendered.
 *
 * Two axes: sub-event (primary, pills) and year within it (secondary, strip).
 * The invariants this layout exists to protect:
 *   • The real measured distance for the selected year is ALWAYS on screen —
 *     two different courses are never presented as silently equivalent.
 *   • Cancelled editions, and held editions where this sub-event didn't run,
 *     stay in the year strip as annotated gaps instead of vanishing.
 *   • Records are per course era. A sub-event whose course changed gets no
 *     unqualified "course record"; the cross-era line is labelled as such.
 */

interface Winner { name: string; sec: number; time: string; year?: number }
interface YearStat { year: number; finishers: number; medianSec: number; winnerM: Winner | null; winnerW: Winner | null }
interface Era {
  distanceKm: number; from: number; to: number;
  years: number[];      // eligible (non-contingency) years — records come from these
  excluded: number[];   // contingency years: in the timeline, out of the records
  recordM: Winner | null; recordW: Winner | null;
  fastestM: Winner | null; fastestW: Winner | null;  // including contingency years
  contingencyOnly: boolean;                          // no eligible year → no record exists
}
interface SubEventStats { years: YearStat[]; eras: Era[]; allTime: { recordM: Winner | null; recordW: Winner | null; crossCourse: boolean } }
interface FamilyStats { familySlug: string; subEvents: Record<string, SubEventStats> }

interface ResultRow { pos: number; name: string; bib: number; nat: string; cat: string; time: string; sec: number }

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/** "102 km · landslip contingency course" — the chip that must never be absent. */
function courseChip(course: CourseInstance): string {
  return [`${course.distanceKm} km`, course.courseNote].filter(Boolean).join(' · ');
}

// ── Progression chart with course-change markers ─────────────────────────────
// Handoff rule: a progression may span course changes ONLY with a visible
// marker at each transition. Contingency years are ringed, not hidden.
function TrailProgression({ stats, courses }: { stats: YearStat[]; courses: Map<number, CourseInstance> }) {
  const [hover, setHover] = useState<number | null>(null);
  if (stats.length < 2) return null;

  const W = 680, H = 240, padX = 52, padTop = 24, padBot = 52;
  const years = stats.map(s => s.year);
  const vals = stats.flatMap(s => [s.medianSec, s.winnerM?.sec ?? 0, s.winnerW?.sec ?? 0].filter(Boolean));
  const sMin = Math.min(...vals) * 0.96;
  const sMax = Math.max(...vals) * 1.04;
  const x = (yr: number) => padX + (years.indexOf(yr) / (years.length - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - (v - sMin) / (sMax - sMin)) * (H - padTop - padBot);

  const path = (pick: (s: YearStat) => number | undefined) => {
    const pts = stats.map(s => ({ yr: s.year, v: pick(s) })).filter(p => p.v);
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.yr).toFixed(1)},${y(p.v!).toFixed(1)}`).join(' ');
  };

  // A transition sits between two consecutive plotted years whose course
  // distance differs — drawn midway, so it reads as "the course changed here".
  const transitions: { at: number; label: string }[] = [];
  for (let i = 1; i < stats.length; i++) {
    const prev = courses.get(stats[i - 1].year), cur = courses.get(stats[i].year);
    if (prev && cur && prev.distanceKm !== cur.distanceKm) {
      transitions.push({
        at: (x(stats[i - 1].year) + x(stats[i].year)) / 2,
        label: `${prev.distanceKm} → ${cur.distanceKm} km`,
      });
    }
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const yy = padTop + f * (H - padTop - padBot);
          return (
            <g key={i}>
              <line x1={padX} x2={W - padX} y1={yy} y2={yy} stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.5" />
              <text x={padX - 10} y={yy + 3} textAnchor="end" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.5" letterSpacing="0.06em">
                {fmtSec(Math.round(sMin + (1 - f) * (sMax - sMin)))}
              </text>
            </g>
          );
        })}

        {transitions.map((t, i) => (
          <g key={i}>
            <line x1={t.at} x2={t.at} y1={padTop - 6} y2={H - padBot} stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="0.75" strokeDasharray="2 3" />
            <text x={t.at} y={padTop - 10} textAnchor="middle" fontSize="8" fontFamily="DM Mono, monospace" fill="var(--accent)" fillOpacity="0.85" letterSpacing="0.06em">
              {t.label}
            </text>
          </g>
        ))}

        <path d={path(s => s.medianSec)} fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d={path(s => s.winnerM?.sec)} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.75" />
        <path d={path(s => s.winnerW?.sec)} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.75" strokeDasharray="3 3" />

        {stats.map((s, i) => {
          const ci = courses.get(s.year);
          return (
            <g key={s.year}>
              <circle cx={x(s.year)} cy={y(s.medianSec)} r={hover === i ? 4 : 2.5} fill="var(--bg)" stroke="currentColor" strokeWidth="1" />
              {s.winnerM && <circle cx={x(s.year)} cy={y(s.winnerM.sec)} r={hover === i ? 3.5 : 2} fill="var(--bg)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />}
              {s.winnerW && <circle cx={x(s.year)} cy={y(s.winnerW.sec)} r={hover === i ? 3.5 : 2} fill="var(--bg)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />}
              {ci?.contingency && (
                <circle cx={x(s.year)} cy={y(s.medianSec)} r="7" fill="none" stroke="var(--accent)" strokeOpacity="0.7" strokeWidth="0.75" />
              )}
              <text x={x(s.year)} y={H - padBot + 16} textAnchor="middle" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.55" letterSpacing="0.08em">{s.year}</text>
              <text x={x(s.year)} y={H - padBot + 28} textAnchor="middle" fontSize="7.5" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.38" letterSpacing="0.04em">{ci ? `${ci.distanceKm}k` : ''}</text>
              <rect x={x(s.year) - 16} y={padTop} width="32" height={H - padTop - padBot} fill="transparent"
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
            </g>
          );
        })}

        {hover !== null && (() => {
          const s = stats[hover]; const ci = courses.get(s.year); const xx = x(s.year);
          const lines: [string, string][] = [
            ['Course', ci ? `${ci.distanceKm} km` : '—'],
            ['Median', fmtSec(s.medianSec)],
            ['M winner', s.winnerM ? fmtSec(s.winnerM.sec) : '—'],
            ['W winner', s.winnerW ? fmtSec(s.winnerW.sec) : '—'],
            ['Finishers', s.finishers.toLocaleString()],
          ];
          return (
            <g pointerEvents="none">
              <line x1={xx} x2={xx} y1={padTop} y2={H - padBot} stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
              <g transform={`translate(${Math.min(xx + 10, W - 150)},${padTop + 4})`}>
                <rect width="138" height={22 + lines.length * 12} fill="var(--bg)" stroke="currentColor" strokeWidth="0.5" />
                <text x="10" y="14" fontSize="10" fontFamily="DM Mono, monospace" fill="currentColor" letterSpacing="0.12em">{s.year}</text>
                {lines.map((l, li) => (
                  <g key={li}>
                    <text x="10" y={28 + li * 12} fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.55" letterSpacing="0.04em">{l[0]}</text>
                    <text x="128" y={28 + li * 12} textAnchor="end" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor">{l[1]}</text>
                  </g>
                ))}
              </g>
            </g>
          );
        })()}
      </svg>
      <div className="flex gap-24 mt-16" style={{ fontSize: 11, color: 'var(--meta)', flexWrap: 'wrap' }}>
        <div className="flex ai-center gap-8"><span style={{ width: 18, height: 1.25, background: 'currentColor', display: 'inline-block' }} />Median finish</div>
        <div className="flex ai-center gap-8"><span style={{ width: 18, height: 0.75, background: 'currentColor', opacity: 0.6, display: 'inline-block' }} />Men winner</div>
        <div className="flex ai-center gap-8"><span style={{ width: 18, display: 'inline-block', height: 0, borderTop: '0.75px dashed currentColor', opacity: 0.6 }} />Women winner</div>
        {transitions.length > 0 && (
          <div className="flex ai-center gap-8" style={{ color: 'var(--accent)' }}>
            <span style={{ width: 18, display: 'inline-block', height: 0, borderTop: '0.75px dashed currentColor' }} />Course change
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TrailRaceProfile({ family }: { family: TrailEventFamily }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSubs = family.subEvents.filter(s => !s.retired && !s.oneOff);
  const historicSubs = family.subEvents.filter(s => s.retired || s.oneOff);

  const subParam = searchParams.get('sub');
  const initialSub = family.subEvents.some(s => s.id === subParam)
    ? subParam!
    : (currentSubs[0] ?? family.subEvents[0]).id;
  const [subId, setSubId] = useState(initialSub);

  const strip = useMemo(() => subEventYears(family, subId), [family, subId]);
  const runYears = useMemo(() => strip.filter(s => s.course), [strip]);

  const yearParam = Number(searchParams.get('year'));
  const [year, setYear] = useState<number>(
    runYears.some(s => s.year === yearParam) ? yearParam : runYears[0]?.year
  );

  // Keep the selected year valid when the sub-event changes (T16 only ran 2026).
  useEffect(() => {
    if (!runYears.some(s => s.year === year)) setYear(runYears[0]?.year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subId]);

  // Follow same-page deep links (athlete profile → ?sub=t102&year=2019).
  useEffect(() => {
    const s = searchParams.get('sub');
    const y = Number(searchParams.get('year'));
    if (s && family.subEvents.some(x => x.id === s)) setSubId(s);
    if (y) setYear(prev => (Number.isFinite(y) ? y : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const subEvent = family.subEvents.find(s => s.id === subId)!;
  const active: SubEventYear | undefined = strip.find(s => s.year === year);
  const course = active?.course;

  const [stats, setStats] = useState<FamilyStats | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(`/data/trail/${family.familySlug}-stats.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled) setStats(d); })
      .catch(() => { /* stats are supplementary — results still render */ });
    return () => { cancelled = true; };
  }, [family.familySlug]);

  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!course) { setRows([]); return; }
    let cancelled = false;
    setLoading(true); setRows([]);
    fetch(`/data/${course.resultsFile}`)
      .then(r => (r.ok ? r.json() : []))
      .then((d: ResultRow[]) => { if (!cancelled) { setRows(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setRows([]); setLoading(false); } });
    return () => { cancelled = true; };
  }, [course?.resultsFile]);

  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  useEffect(() => { setPage(1); setQ(''); }, [subId, year]);

  const ql = normalise(q.trim());
  const filtered = useMemo(() => {
    if (!ql) return rows;
    if (/^\d+$/.test(ql)) return rows.filter(r => String(r.bib).includes(ql) || String(r.pos) === ql);
    return rows.filter(r => normalise(r.name).includes(ql) || r.nat.toLowerCase().includes(ql));
  }, [rows, ql]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  // Resolve athlete profile links for the visible rows.
  const [, bump] = useState(0);
  const idxLoaded = useRef(new Set<string>());
  useEffect(() => {
    const letters = new Set(pageRows.map(r => {
      const c = normalise(r.name)[0];
      return c >= 'a' && c <= 'z' ? c : '_';
    }));
    const missing = [...letters].filter(l => !idxLoaded.current.has(l));
    if (!missing.length) return;
    missing.forEach(l => idxLoaded.current.add(l));
    let cancelled = false;
    Promise.all(pageRows.map(r => preloadAthleteIndex(r.name)))
      .then(() => { if (!cancelled) bump(v => v + 1); });
    return () => { cancelled = true; };
  }, [pageRows]);

  const subStats = stats?.subEvents[subId];
  const yearStat = subStats?.years.find(s => s.year === year);
  const courseByYear = useMemo(() => {
    const m = new Map<number, CourseInstance>();
    for (const s of strip) if (s.course) m.set(s.year, s.course);
    return m;
  }, [strip]);

  const span = archiveSpan(family);
  const current = latestCourse(family, subId);
  // Sub-event that only ever ran contingency courses (the 2014 cyclone one-offs):
  // nothing here establishes a record.
  const allContingency = !!subStats?.eras.length && subStats.eras.every(e => e.contingencyOnly);

  // Gaps inside this sub-event's span, spelled out rather than silently skipped.
  const gaps = strip.filter(s => !s.course);

  // Optional band line: fastest across every sub-event sharing this comparability
  // band. Always cross-course by construction, and labelled that way.
  const bandBest = useMemo(() => {
    if (!subEvent.comparabilityBand || !stats) return null;
    const peers = family.subEvents.filter(s => s.comparabilityBand === subEvent.comparabilityBand);
    if (peers.length < 2) return null;
    const pick = (side: 'recordM' | 'recordW') => {
      let best: (Winner & { sub: string }) | null = null;
      for (const p of peers) {
        const r = stats.subEvents[p.id]?.allTime?.[side];
        if (r && (!best || r.sec < best.sec)) best = { ...r, sub: p.displayName };
      }
      return best;
    };
    return { peers, recordM: pick('recordM'), recordW: pick('recordW') };
  }, [subEvent.comparabilityBand, stats, family.subEvents]);

  const selectYear = (y: number) => {
    setYear(y);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('sub', subId); p.set('year', String(y));
      return p;
    }, { replace: true });
  };
  const selectSub = (id: string) => {
    setSubId(id);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('sub', id); p.delete('year');
      return p;
    }, { replace: true });
  };

  const subPill = (s: typeof family.subEvents[number]) => {
    const c = latestCourse(family, s.id);
    // Suppress the distance suffix when the display name is itself a distance
    // label ('85K' + 87k reads as a contradiction, '65K' + 65k as a stutter).
    // Named sub-events (Miler, T102…) keep it — that's where it informs.
    const showKm = c && !/^\d+\s*K$/i.test(s.displayName.trim());
    return (
      <button key={s.id} className={`pill ${subId === s.id ? 'active' : ''}`} onClick={() => selectSub(s.id)}>
        {s.displayName}{showKm ? <span style={{ opacity: 0.55, marginLeft: 6 }}>{c!.distanceKm}k</span> : null}
      </button>
    );
  };

  return (
    <main>
      {/* Header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">
            {family.surface} · Archive {span.from}–{span.to} · {family.subEvents.length} sub-events
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
                {family.name}
              </h1>
              <div className="flex gap-8 mt-20" style={{ flexWrap: 'wrap' }}>
                {currentSubs.map(subPill)}
              </div>
              {historicSubs.length > 0 && (
                <div className="flex gap-8 mt-12 ai-center" style={{ flexWrap: 'wrap' }}>
                  <span className="label" style={{ marginRight: 4 }}>Historic</span>
                  {historicSubs.map(subPill)}
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              <div><div className="label mb-8">Location</div><div>{family.location}</div></div>
              <div>
                {/* Scoped to the selected sub-event — a family spanning 16–161 km
                    has no single "course" to report. */}
                <div className="label mb-8">{subEvent.displayName} course</div>
                <div>{current ? `${current.distanceKm} km${subEvent.retired || subEvent.oneOff ? ' · retired' : ''}` : '—'}</div>
              </div>
              <div><div className="label mb-8">Next edition</div><div>{family.nextEdition ?? '—'}</div></div>
              <div>
                <div className="label mb-8">Entry</div>
                <div>
                  {family.entryUrl
                    ? <a href={family.entryUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 4 }}>{family.entryText} ↗</a>
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results — year strip + course annotation + table */}
      <section id="results" className="section">
        <div className="page">
          <div className="mb-24">
            <div className="eyebrow mb-8">Results · {family.shortName} {subEvent.displayName}</div>
            <div className="flex ai-baseline gap-16" style={{ flexWrap: 'wrap' }}>
              <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                {course
                  ? <>{year} edition <span style={{ color: 'var(--meta)', fontStyle: 'italic' }}>— {(yearStat?.finishers ?? rows.length).toLocaleString()} finishers</span></>
                  : <>{subEvent.displayName} — no edition selected</>}
              </h2>
              {course && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.06em', padding: '4px 10px', border: `0.5px solid ${course.contingency ? 'var(--accent)' : 'var(--rule)'}`, color: course.contingency ? 'var(--accent)' : 'var(--ink)', borderRadius: 999 }}>
                  {courseChip(course)}
                </span>
              )}
            </div>
            {subEvent.aliases && subEvent.aliases.length > 0 && (
              <div className="dimmed mt-8" style={{ fontSize: 11 }}>
                Also known as {subEvent.aliases.join(' · ')}
              </div>
            )}
          </div>

          {/* Year strip: every edition in this sub-event's span, gaps included. */}
          <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
            {strip.map(s => {
              const isGap = !s.course;
              const label = s.status === 'cancelled' ? `${s.year} · cancelled` : String(s.year);
              return (
                <button
                  key={s.year}
                  className={`pill ${year === s.year && !isGap ? 'active' : ''}`}
                  disabled={isGap}
                  title={s.note ?? (isGap ? `${subEvent.displayName} not run in ${s.year}` : undefined)}
                  onClick={() => !isGap && selectYear(s.year)}
                  style={isGap ? { opacity: 0.4, cursor: 'default', textDecoration: s.status === 'cancelled' ? 'line-through' : undefined } : undefined}
                >
                  {label}
                  {s.status === 'restricted' && <span style={{ opacity: 0.6, marginLeft: 6 }}>·restricted</span>}
                </button>
              );
            })}
          </div>

          {(gaps.length > 0 || active?.note) && (
            <div className="dimmed mb-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
              {active?.note && <div>{year}: {active.note}</div>}
              {gaps.map(g => (
                <div key={g.year}>
                  {g.year}: {g.status === 'cancelled'
                    ? (g.note ?? 'edition cancelled')
                    : `${subEvent.displayName} not run${g.note ? ` — ${g.note}` : ''}`}
                </div>
              ))}
            </div>
          )}

          {!course ? (
            <div style={{ padding: '64px 0', borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
              <div className="dimmed" style={{ fontSize: 13, textAlign: 'center' }}>
                Select an edition above.
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-16 mb-16 ai-end" style={{ flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 360px', maxWidth: 520 }}>
                  <div className="label mb-8">Search · name, bib, nationality</div>
                  <input className="input" placeholder="e.g. Muir · 1003 · NZL"
                         value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
                  {ql && !loading && (
                    <div className="label mt-8">
                      {filtered.length.toLocaleString()} match{filtered.length === 1 ? '' : 'es'} in {year}
                    </div>
                  )}
                </div>
              </div>

              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>Pos</th>
                      <th style={{ width: 70 }}>Bib</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th className="num">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="dimmed" style={{ padding: 40, textAlign: 'center' }}>Loading {year} results…</td></tr>
                    ) : pageRows.length === 0 ? (
                      <tr><td colSpan={5} className="dimmed" style={{ padding: 40, textAlign: 'center' }}>
                        {ql ? `No results match "${q}" in ${year}.` : `No results for ${year}.`}
                      </td></tr>
                    ) : pageRows.map(r => {
                      const slug = getAthleteSlug(r.name);
                      return (
                        <tr key={r.pos} className="row">
                          <td className={`pos ${r.pos === 1 ? 'pos-1' : ''}`}>{r.pos}</td>
                          <td className="dimmed time">{r.bib || '—'}</td>
                          <td>
                            {slug
                              ? <Link to={`/athletes/${slug}`} className="serif" style={{ fontSize: 16, color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--rule)' }}>{r.name}</Link>
                              : <span className="serif" style={{ fontSize: 16 }}>{r.name}</span>}
                            {r.nat && <span className="dimmed" style={{ marginLeft: 8, fontSize: 11 }}>{r.nat}</span>}
                          </td>
                          <td className="dimmed">{r.cat}</td>
                          <td className="num time">{r.time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!loading && (
                <div className="flex between ai-center mt-24" style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div className="label">
                    {filtered.length === 0 ? 'No results'
                      : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} of ${filtered.length.toLocaleString()}`}
                  </div>
                  <div className="flex gap-8 ai-center">
                    <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
                    <span className="label" style={{ padding: '0 8px' }}>Page {page} / {pages}</span>
                    <button className="btn-ghost" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next →</button>
                  </div>
                </div>
              )}
              <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
                Individual finishers only — relay and team entries are excluded, so official
                positions may skip. Times as recorded in published race results.
              </div>
            </>
          )}
        </div>
      </section>

      {/* Course history — makes distance drift legible at a glance */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Course history · {subEvent.displayName}</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                Every edition, with the distance actually run
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 300, textAlign: 'right' }}>
              Distances are as measured that year. Where they differ, the courses differ —
              they are not normalised to a nominal label.
            </div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Year</th>
                  <th style={{ width: 120 }}>Called</th>
                  <th style={{ width: 90 }} className="num">Distance</th>
                  <th style={{ width: 110 }}>Finishers</th>
                  <th>Course note</th>
                </tr>
              </thead>
              <tbody>
                {strip.map(s => {
                  const st = subStats?.years.find(v => v.year === s.year);
                  return (
                    <tr key={s.year} className={s.course ? 'row' : ''}
                        onClick={() => s.course && selectYear(s.year)}
                        style={!s.course ? { opacity: 0.5 } : undefined}>
                      <td className="dimmed">{s.year}</td>
                      <td>{s.course ? <span className="serif" style={{ fontSize: 15 }}>{s.course.label}</span> : '—'}</td>
                      <td className="num time">{s.course ? `${s.course.distanceKm} km` : '—'}</td>
                      <td className="dimmed time">{st ? st.finishers.toLocaleString() : '—'}</td>
                      <td className="dimmed" style={{ fontSize: 12 }}>
                        {s.status === 'cancelled' ? (s.note ?? 'Cancelled')
                          : !s.course ? `Not run${s.note ? ` — ${s.note}` : ''}`
                          : [s.course.contingency ? 'Contingency course' : '', s.course.courseNote, s.status === 'restricted' ? (s.note ?? 'Restricted field') : '']
                              .filter(Boolean).join(' · ') || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Progression */}
      {subStats && subStats.years.length > 1 && (
        <section className="section">
          <div className="page">
            <div className="section-header">
              <div>
                <div className="eyebrow mb-8">Progression · {subEvent.displayName}</div>
                <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                  Median finish · winning times · by year
                </h2>
              </div>
              <div className="dimmed" style={{ fontSize: 12, maxWidth: 300, textAlign: 'right' }}>
                Spans course changes — each transition is marked. Times either side of a
                marker were run on different courses and are not directly comparable.
              </div>
            </div>
            <TrailProgression stats={subStats.years} courses={courseByYear} />
          </div>
        </section>
      )}

      {/* Records — per course era, never an unqualified "course record" */}
      {subStats && subStats.eras.length > 0 && (
        <section className="section">
          <div className="page">
            <div className="section-header">
              <div>
                <div className="eyebrow mb-8">Records · {subEvent.displayName}</div>
                <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                  {allContingency ? 'No course records' : subStats.eras.length > 1 ? 'Fastest on each course' : 'Course records'}
                </h2>
              </div>
              <div className="dimmed" style={{ fontSize: 12, maxWidth: 300, textAlign: 'right' }}>
                {allContingency
                  ? 'Every edition of this sub-event ran a contingency course, so no course record is claimed — only the fastest times on the day.'
                  : subStats.eras.length > 1
                    ? 'This sub-event has run more than one course, so records are held per course — not as a single all-time mark.'
                    : 'One course throughout, so these are true course records.'}
              </div>
            </div>

            <div className="card-dark">
              {subStats.eras.map((era, i) => {
                // A contingency-only era has no record to report — show the
                // day's fastest, labelled as exactly that.
                const pairs: [string, Winner | null][] = era.contingencyOnly
                  ? [['Men · fastest', era.fastestM], ['Women · fastest', era.fastestW]]
                  : [['Men · Open', era.recordM], ['Women · Open', era.recordW]];
                return (
                <div key={i} style={{ paddingTop: i === 0 ? 0 : 28, marginTop: i === 0 ? 0 : 28, borderTop: i === 0 ? 'none' : '0.5px solid var(--on-dark-rule)' }}>
                  <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>
                    {era.distanceKm} km {era.contingencyOnly ? 'contingency course' : 'course'} · {era.from === era.to ? era.from : `${era.from}–${era.to}`}
                    {era.contingencyOnly
                      ? ' · not a course record'
                      : era.excluded.length > 0 && ` · excludes ${era.excluded.join(', ')} contingency`}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    {pairs.map(([label, rec], col) => (
                      <div key={label} style={{ paddingRight: col === 0 ? 40 : 0, paddingLeft: col === 1 ? 40 : 0, borderRight: col === 0 ? '0.5px solid var(--on-dark-rule)' : 'none' }}>
                        <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>{label}</div>
                        <div className="serif" style={{ fontSize: 44, lineHeight: 0.95, letterSpacing: '-0.02em' }}>{rec ? fmtSec(rec.sec) : '—'}</div>
                        {rec && (
                          <div className="mt-20">
                            <div className="serif" style={{ fontSize: 20, lineHeight: 1.15 }}>{rec.name}</div>
                            <div className="label mt-8" style={{ color: 'var(--on-dark-meta)' }}>
                              {era.contingencyOnly ? 'run' : 'set'} {rec.year}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                );
              })}

              {subStats.allTime.crossCourse && (
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '0.5px solid var(--on-dark-rule)', color: 'var(--on-dark)' }}>
                  <div className="label mb-8" style={{ color: 'var(--on-dark-meta)' }}>
                    Fastest across all {subEvent.displayName} courses — cross-course, not a course record
                  </div>
                  <div style={{ fontSize: 12.5, fontFamily: "'DM Mono', monospace", lineHeight: 1.7 }}>
                    {subStats.allTime.recordM && <div>M · {fmtSec(subStats.allTime.recordM.sec)} — {subStats.allTime.recordM.name} ({subStats.allTime.recordM.year})</div>}
                    {subStats.allTime.recordW && <div>W · {fmtSec(subStats.allTime.recordW.sec)} — {subStats.allTime.recordW.name} ({subStats.allTime.recordW.year})</div>}
                  </div>
                </div>
              )}

              {bandBest && (
                <div style={{ marginTop: 24, paddingTop: 24, borderTop: '0.5px solid var(--on-dark-rule)', color: 'var(--on-dark)' }}>
                  <div className="label mb-8" style={{ color: 'var(--on-dark-meta)' }}>
                    Fastest across all {subEvent.comparabilityBand} courses ({bandBest.peers.map(p => p.displayName).join(' · ')}) — cross-course, not a course record
                  </div>
                  <div style={{ fontSize: 12.5, fontFamily: "'DM Mono', monospace", lineHeight: 1.7 }}>
                    {bandBest.recordM && <div>M · {fmtSec(bandBest.recordM.sec)} — {bandBest.recordM.name} ({bandBest.recordM.sub} {bandBest.recordM.year})</div>}
                    {bandBest.recordW && <div>W · {fmtSec(bandBest.recordW.sec)} — {bandBest.recordW.name} ({bandBest.recordW.sub} {bandBest.recordW.year})</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
