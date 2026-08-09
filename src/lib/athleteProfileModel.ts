/**
 * athleteProfileModel — the athlete profile's derived view model.
 * ─────────────────────────────────────────────────────────────────────────────
 * Every module on the profile page renders only when its data earns it. Those
 * conditions live here as explicit predicates rather than inline `&&` in JSX,
 * because they are logic, not styling: "3+ results at a single distance",
 * "2+ trail sub-event distances", "more than one surface", "position ≤ 3".
 * A module that returns null is absent from the page — never a zero-state, a
 * placeholder, or a "no data" message.
 *
 * Two hard partitions the archive depends on:
 *   • Road and trail are never summed, never compared, never co-ranked.
 *     Trail produces no PB and no age grade — trail courses change year to
 *     year, and the WMA tables model neither terrain nor vertical gain.
 *   • A flagged profile (knownMultiPerson) withholds every figure that assumes
 *     one person. Per-result facts survive; career-level aggregates do not.
 */

import { ageGradeForResult, type AgeGradeResult } from './athleteMetrics';
import { getRaceMeta } from '../data/raceMeta';
import { getTrailFamily, getSubEvent } from '../data/trailEventConfig';

// ── Canon shard shape (public/data/athletes/{xx}.json) ───────────────────────

export interface CanonResult {
  year: number;
  race: string;
  raceSlug: string;
  dist: string;        // real course distance as run, e.g. "42.2 km", "161 km"
  distId: string;      // road: 'mar' | 'half' | '10k' | '5k'; trail: sub-event id
  time: string;
  sec: number;
  pos: number;
  total: number;
  cat: string;
  isPB?: boolean;
  trail?: boolean;
  /** Present only where the source published a real age (not yet ingested). */
  age?: number;
  /** IOC-style code, present only where the source recorded one. */
  nat?: string;
  /** Source value, kept only where normalisation changed it. */
  natRaw?: string;
  // NOTE: no `club` field. The 2023–24 Auckland exports publish a "Team" column
  // and it is preserved in the results JSON, but it is entry-form text, not
  // affiliation data: the year is baked into names ('KPMG2023', 'Beca24'), the
  // same entity is spelled differently across years (Liberty → Liberty
  // Financial), and corporate entries sit alongside genuine clubs. No honest
  // aggregation is possible from it, so it is not carried into the canon.
  // Reviving club affiliation would need curated entity resolution, not raw text.
  /**
   * Placing among finishers of the same nationality, computed at build time
   * over the whole field — and only for race-years whose nationality coverage
   * is substantially complete. Absent means it could not be computed honestly.
   *
   * The cohort SIZE is not stored here: it is a property of the race-year, not
   * of one result, and repeating it per row cost 1.71 MB. It comes from
   * public/data/nat-cohorts.json instead — see NatCohorts below.
   */
  natPos?: number;
}

/**
 * Smallest national cohort worth reporting a placing within.
 *
 * "1st NZL of 1" is not an achievement, it is an artefact of being the only
 * one. Below this the placing is true but says nothing, so it isn't shown.
 */
export const NAT_COHORT_MIN = 5;

/**
 * Cohort sizes per race-year: { "raceSlug:year:distId": { NZL: 884, ... } }.
 * Built by buildAthleteCanon.mjs, fetched once by the profile page.
 */
export type NatCohorts = Record<string, Record<string, number>>;

/** National placing for a result, or null where it would be noise. */
export function nationalPlacing(r: CanonResult, cohorts: NatCohorts): { pos: number; total: number; nat: string } | null {
  if (!r.natPos || !r.nat) return null;
  const total = cohorts[`${r.raceSlug}:${r.year}:${r.distId}`]?.[r.nat];
  if (!total || total < NAT_COHORT_MIN) return null;
  return { pos: r.natPos, total, nat: r.nat };
}

export interface CanonPB { time: string; sec: number; race: string; year: number; }

export interface CanonProfile {
  id: number;
  slug: string;
  name: string;
  gender: 'M' | 'W' | 'F' | '?';
  nationality: string;
  racesLogged: number;
  pbTime: string;
  pbRace: string;
  pbs: Record<string, CanonPB>;
  results: CanonResult[];
  /** Derived each generate from unresolved Tier 1 identity conflicts. */
  knownMultiPerson?: boolean;
  /** The age bands actually in conflict, stamped alongside the flag. */
  conflictBands?: string[];
}

export type ProfileState = 'thin' | 'modal' | 'hybrid' | 'trailonly' | 'flagged';

// ── Small helpers ────────────────────────────────────────────────────────────

// Longest first. A distId absent from this list is skipped outright by the
// progression chart below, so a newly ingested non-standard distance has to be
// added here or it silently renders nowhere.
export const ROAD_DIST_ORDER = ['mar', 'half', '12k', 'quarter', '10k', '5k'];
export const ROAD_DIST_LABEL: Record<string, string> = {
  mar: '42.2 km · Marathon',
  half: '21.1 km · Half marathon',
  // Its own bucket, deliberately: a quarter-marathon time is not a 10 km time,
  // and there is no age-grading standard at this distance.
  // Like the quarter, its own bucket with no age-grading standard.
  '12k': '12 km',
  quarter: '10.5 km · Quarter marathon',
  '10k': '10 km',
  '5k': '5 km',
};

export const nfmt = (n: number) => n.toLocaleString('en-NZ');

/** Percentile as "top N%" — position within the field, rounded up, floored at 1. */
export const pctTop = (pos: number, field: number) =>
  field > 0 ? Math.max(1, Math.ceil((pos / field) * 100)) : null;

export const ordinal = (n: number) => {
  const v = n % 100;
  return n + (['th', 'st', 'nd', 'rd'][(v - 20) % 10] || ['th', 'st', 'nd', 'rd'][v] || 'th');
};

/** Real course distance in km, parsed from the canon's `dist` string. */
export function distKm(r: CanonResult): number | null {
  const m = /([\d.]+)/.exec(r.dist ?? '');
  const v = m ? Number(m[1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : null;
}

export function isRoad(r: CanonResult) { return !r.trail; }
export function isTrail(r: CanonResult) { return !!r.trail; }

/** Where a result was run. Road comes from race metadata, trail from the family. */
export function resultLocation(r: CanonResult): string | null {
  if (r.trail) return getTrailFamily(r.raceSlug)?.location ?? null;
  return getRaceMeta(r.raceSlug)?.location ?? null;
}

/** Event / sub-event split for the results table. Road events have no sub-event. */
export function eventLabel(r: CanonResult): { ev: string; sub: string | null } {
  if (r.trail) {
    const fam = getTrailFamily(r.raceSlug);
    const sub = fam ? getSubEvent(fam, r.distId) : undefined;
    if (fam && sub) return { ev: fam.name, sub: sub.displayName };
  }
  return { ev: r.race, sub: null };
}

// ── State ────────────────────────────────────────────────────────────────────

export function profileState(p: CanonProfile): ProfileState {
  if (p.knownMultiPerson) return 'flagged';
  const hasRoad = p.results.some(isRoad);
  const hasTrail = p.results.some(isTrail);
  if (hasRoad && hasTrail) return 'hybrid';
  if (hasTrail) return 'trailonly';
  return p.results.length <= 2 ? 'thin' : 'modal';
}

// ── Road performance tiles ───────────────────────────────────────────────────

export interface RoadBest {
  distId: string;
  label: string;
  time: string;
  race: string;
  year: number;
  pos: number;
  total: number;
  /** Podium finishes lead with the placing — a percentile understates a win. */
  podium: boolean;
  pct: number | null;
  /** Road only, and null whenever the age band can't support an honest grade. */
  ageGrade: AgeGradeResult | null;
  cat: string;
}

export function roadBests(p: CanonProfile, opts: { withAgeGrade: boolean }): RoadBest[] {
  const road = p.results.filter(isRoad);
  if (!road.length) return [];

  const byDist = new Map<string, CanonResult>();
  for (const r of road) {
    const cur = byDist.get(r.distId);
    if (!cur || r.sec < cur.sec) byDist.set(r.distId, r);
  }

  const order = (d: string) => {
    const i = ROAD_DIST_ORDER.indexOf(d);
    return i === -1 ? ROAD_DIST_ORDER.length : i;
  };

  return [...byDist.entries()]
    .sort((a, b) => order(a[0]) - order(b[0]))
    .slice(0, 4)                       // the tile grid is designed for 1–4
    .map(([distId, r]) => ({
      distId,
      label: ROAD_DIST_LABEL[distId] ?? r.dist,
      time: r.time,
      race: r.race,
      year: r.year,
      pos: r.pos,
      total: r.total,
      podium: r.pos <= 3 && r.pos >= 1,
      pct: pctTop(r.pos, r.total),
      // `age` is not yet carried by the canon — the exact-age path activates
      // the moment a source that publishes real ages is ingested.
      ageGrade: opts.withAgeGrade
        ? ageGradeForResult(r.sec, distId, p.gender, r.cat, (r as { age?: number }).age)
        : null,
      cat: r.cat,
    }));
}

// ── Road progression ─────────────────────────────────────────────────────────
// Renders only where a SINGLE distance holds 3+ road results. Two finishes are
// two points, not a progression, and the archive says nothing by joining them.

export interface ProgressionPoint { year: number; sec: number; time: string; race: string; isPB: boolean; }
export interface Progression { distId: string; label: string; pts: ProgressionPoint[]; }

export const PROGRESSION_MIN_RESULTS = 3;

export function progressions(p: CanonProfile): Progression[] {
  const byDist = new Map<string, CanonResult[]>();
  for (const r of p.results.filter(isRoad)) {
    if (!byDist.has(r.distId)) byDist.set(r.distId, []);
    byDist.get(r.distId)!.push(r);
  }

  const out: Progression[] = [];
  for (const distId of ROAD_DIST_ORDER) {
    const rs = byDist.get(distId);
    if (!rs || rs.length < PROGRESSION_MIN_RESULTS) continue;
    const sorted = rs.slice().sort((a, b) => a.year - b.year || a.sec - b.sec);
    let best = Infinity;
    out.push({
      distId,
      label: ROAD_DIST_LABEL[distId] ?? distId,
      pts: sorted.map(r => {
        const isPB = r.sec < best;
        if (isPB) best = r.sec;
        return { year: r.year, sec: r.sec, time: r.time, race: r.race, isPB };
      }),
    });
  }
  return out;
}

// ── Trail: results in context, never bests ───────────────────────────────────

export interface TrailCell { k: string; v: string; n: string; }
export interface TrailSummary {
  finishes: number;
  km: number | null;
  hours: number;
  cells: TrailCell[];
  loyalty: string | null;
}

export function trailSummary(p: CanonProfile, cohorts: NatCohorts): TrailSummary | null {
  const tr = p.results.filter(isTrail);
  if (!tr.length) return null;

  const dists = tr.map(distKm);
  const km = dists.every(d => d != null)
    ? (dists as number[]).reduce((a, b) => a + b, 0)
    : null;                                   // partial sums would be a lie
  const hours = tr.reduce((a, r) => a + r.sec, 0) / 3600;

  const cells: TrailCell[] = [];

  // Best field percentile — a per-result fact, so it survives on trail.
  const ranked = tr.filter(r => r.total > 0);
  if (ranked.length) {
    const best = ranked.reduce((a, r) => (r.pos / r.total < a.pos / a.total ? r : a));
    const pct = pctTop(best.pos, best.total);
    const { ev, sub } = eventLabel(best);
    cells.push({
      k: 'Best field percentile',
      v: best.pos <= 3 ? ordinal(best.pos) : `Top ${pct}%`,
      n: `${nfmt(best.pos)} of ${nfmt(best.total)} · ${sub ? `${ev} ${sub}` : ev} ${best.year}`,
    });
  }

  // National placing — a genuine differentiator on the internationally
  // contested trail fields, where a mid-pack overall result can still be a
  // strong domestic one. Only from race-years with near-complete nationality
  // coverage, and only where the national cohort is large enough to mean
  // something.
  const placed = tr.map(r => ({ r, np: nationalPlacing(r, cohorts) })).filter(x => x.np != null);
  if (placed.length) {
    const best = placed.reduce((a, x) => (x.np!.pos < a.np!.pos ? x : a));
    const { ev, sub } = eventLabel(best.r);
    cells.push({
      k: 'National placing',
      v: `${ordinal(best.np!.pos)} ${best.np!.nat}`,
      n: `of ${nfmt(best.np!.total)} ${best.np!.nat} finishers · ${sub ? `${ev} ${sub}` : ev} ${best.r.year}`,
    });
  }

  // Longest finish — the distance actually covered, as run that year.
  const withDist = tr.filter(r => distKm(r) != null);
  if (withDist.length) {
    const longest = withDist.reduce((a, r) => (distKm(r)! > distKm(a)! ? r : a));
    const { ev, sub } = eventLabel(longest);
    cells.push({
      k: 'Longest finish',
      v: `${distKm(longest)} km`,
      n: `${sub ? `${ev} ${sub}` : ev} ${longest.year} · ${longest.time}`,
    });
  }

  // Event loyalty — repeat starts at one family, counted across its sub-events.
  let loyalty: string | null = null;
  const byFamily = new Map<string, CanonResult[]>();
  for (const r of tr) {
    if (!byFamily.has(r.raceSlug)) byFamily.set(r.raceSlug, []);
    byFamily.get(r.raceSlug)!.push(r);
  }
  const top = [...byFamily.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  if (top && top[1].length >= 2) {
    const fam = getTrailFamily(top[0]);
    const subs = new Set(top[1].map(r => r.distId)).size;
    loyalty = `${fam?.name ?? top[1][0].race} · ${top[1].length} finishes across ${subs} sub-event${subs === 1 ? '' : 's'}`;
  }

  return { finishes: tr.length, km, hours, cells, loyalty };
}

// ── Trail distance arc ───────────────────────────────────────────────────────
// Renders only across 2+ sub-event distances. Plots the FIRST finish at each,
// labelled with the real course distance as run that year — not a nominal one.

export interface ArcPoint { year: number; km: number; label: string; time: string; }

export const ARC_MIN_DISTANCES = 2;

export function trailArc(p: CanonProfile): ArcPoint[] | null {
  const tr = p.results.filter(isTrail).filter(r => distKm(r) != null);
  const bySub = new Map<string, CanonResult>();
  for (const r of tr) {
    const key = `${r.raceSlug}|${r.distId}`;
    const cur = bySub.get(key);
    if (!cur || r.year < cur.year) bySub.set(key, r);
  }
  if (bySub.size < ARC_MIN_DISTANCES) return null;

  return [...bySub.values()]
    .sort((a, b) => a.year - b.year || distKm(a)! - distKm(b)!)
    .map(r => {
      const { sub } = eventLabel(r);
      return { year: r.year, km: distKm(r)!, label: sub ?? r.dist, time: r.time };
    });
}

// ── The transition (hybrid only) ─────────────────────────────────────────────
// Derived facts only — first trail finish, last road marathon, and the year a
// running trail total first passed the road total. No narrative prose.

export interface TransitionFact { k: string; v: string; }

export function transition(p: CanonProfile): TransitionFact[] | null {
  const road = p.results.filter(isRoad);
  const trail = p.results.filter(isTrail);
  if (!road.length || !trail.length) return null;

  const facts: TransitionFact[] = [];

  const firstTrail = trail.reduce((a, r) => (r.year < a.year ? r : a));
  const ft = eventLabel(firstTrail);
  facts.push({ k: 'First trail finish', v: `${ft.sub ? `${ft.ev} ${ft.sub}` : ft.ev} · ${firstTrail.year}` });

  const marathons = road.filter(r => r.distId === 'mar');
  if (marathons.length) {
    const last = marathons.reduce((a, r) => (r.year > a.year ? r : a));
    facts.push({ k: 'Last road marathon', v: `${last.race} · ${last.year} · ${last.time}` });
  }

  const years = [...new Set(p.results.map(r => r.year))].sort((a, b) => a - b);
  let cr = 0, ct = 0, crossed: number | null = null;
  for (const y of years) {
    cr += road.filter(r => r.year === y).length;
    ct += trail.filter(r => r.year === y).length;
    if (crossed == null && ct > cr) crossed = y;
  }

  // Holding both surfaces is not, by itself, a transition. Without the crossing
  // there is no turn to report, and a "transition" block that merely restates
  // two dates would be a zero-state wearing a heading.
  if (crossed == null) return null;

  facts.push({ k: 'Trail passed road', v: `${crossed} — cumulative trail finishes first exceeded road` });
  return facts;
}

// ── Conditional modules ──────────────────────────────────────────────────────
// Each returns null when empty. A zero is never rendered.

export interface ModuleList { kicker: string; title: string; desc: string; rows: [string, string][]; }

export function winsModule(p: CanonProfile): ModuleList | null {
  const podiums = p.results.filter(r => r.pos >= 1 && r.pos <= 3);
  if (!podiums.length) return null;
  const rows = podiums
    .slice()
    .sort((a, b) => a.pos - b.pos || b.year - a.year)
    .slice(0, 8)
    .map(r => {
      const { ev, sub } = eventLabel(r);
      return [`${sub ? `${ev} ${sub}` : ev} ${r.year}`, `${ordinal(r.pos)} of ${nfmt(r.total)}`] as [string, string];
    });
  return {
    kicker: 'Placings',
    title: podiums.every(r => r.pos === 1) ? 'Wins' : 'Wins and podiums',
    desc: 'Top-three finishes across all logged fields, both surfaces.',
    rows,
  };
}

export function repeatsModule(p: CanonProfile): ModuleList | null {
  const byEvent = new Map<string, CanonResult[]>();
  for (const r of p.results) {
    const { ev } = eventLabel(r);
    if (!byEvent.has(ev)) byEvent.set(ev, []);
    byEvent.get(ev)!.push(r);
  }
  const rows = [...byEvent.entries()]
    .filter(([, rs]) => rs.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8)
    .map(([ev, rs]) => {
      const ys = rs.map(r => r.year);
      return [ev, `${rs.length} finishes · ${Math.min(...ys)}–${Math.max(...ys)}`] as [string, string];
    });
  if (!rows.length) return null;
  return {
    kicker: 'Repeat starts',
    title: 'Most-run events',
    desc: 'Events finished three or more times.',
    rows,
  };
}

/** The only honest time comparison on trail: the same course instance, run again. */
export function sameCourseModule(p: CanonProfile): ModuleList | null {
  const byCourse = new Map<string, CanonResult[]>();
  for (const r of p.results.filter(isTrail)) {
    const km = distKm(r);
    if (km == null) continue;
    const key = `${r.raceSlug}|${r.distId}|${km}`;   // same distance as run
    if (!byCourse.has(key)) byCourse.set(key, []);
    byCourse.get(key)!.push(r);
  }
  const rows: [string, string][] = [];
  for (const rs of byCourse.values()) {
    if (rs.length < 2) continue;
    const sorted = rs.slice().sort((a, b) => a.year - b.year);
    const { ev, sub } = eventLabel(sorted[0]);
    rows.push([
      `${sub ? `${ev} ${sub}` : ev} · ${distKm(sorted[0])} km`,
      sorted.map(r => `${r.year} ${r.time}`).join(' → '),
    ]);
  }
  if (!rows.length) return null;
  return {
    kicker: 'Trail',
    title: 'Same course, later year',
    desc: 'The only honest time comparison on trail: the same course instance, run again.',
    rows: rows.slice(0, 8),
  };
}

/** Two sub-events finished at the same running of one event family. */
export function multiSubModule(p: CanonProfile): ModuleList | null {
  const byEdition = new Map<string, CanonResult[]>();
  for (const r of p.results.filter(isTrail)) {
    const key = `${r.raceSlug}|${r.year}`;
    if (!byEdition.has(key)) byEdition.set(key, []);
    byEdition.get(key)!.push(r);
  }
  const rows: [string, string][] = [];
  for (const rs of byEdition.values()) {
    const subs = new Set(rs.map(r => r.distId));
    if (subs.size < 2) continue;
    const fam = getTrailFamily(rs[0].raceSlug);
    rows.push([
      `${fam?.name ?? rs[0].race} ${rs[0].year}`,
      rs.map(r => `${eventLabel(r).sub ?? r.dist} ${r.time}`).join(' · '),
    ]);
  }
  if (!rows.length) return null;
  return {
    kicker: 'Trail',
    title: 'Two sub-events, one edition',
    desc: 'Both distances finished at the same running of the event.',
    rows: rows.slice(0, 8),
  };
}

// ── Assembled model ──────────────────────────────────────────────────────────

export interface ProfileModel {
  state: ProfileState;
  flagged: boolean;
  /** Renders only where a profile holds more than one surface. */
  multiSurface: boolean;
  yearFrom: number;
  yearTo: number;
  roadCount: number;
  trailCount: number;
  /** The age bands in conflict — flagged profiles show all of them. */
  conflictBands: string[];
  /** Latest recorded band, for unflagged profiles that can name one. */
  currentBand: string | null;
  bests: RoadBest[];
  progressions: Progression[];
  trail: TrailSummary | null;
  arc: ArcPoint[] | null;
  transition: TransitionFact[] | null;
  modules: ModuleList[];
  chrono: CanonResult[];
}

export function buildProfileModel(p: CanonProfile, cohorts: NatCohorts = {}): ProfileModel {
  const flagged = !!p.knownMultiPerson;
  const years = p.results.map(r => r.year);
  const chrono = p.results.slice().sort((a, b) => b.year - a.year || a.sec - b.sec);

  // A flagged profile withholds everything that assumes one person: career
  // totals, wins, podiums, progression, the distance arc, repeat events, and
  // age grade (which depends on knowing whose age band applies — the very
  // thing in question). Field percentile stays: it is a per-result fact.
  const modules = flagged
    ? []
    : [winsModule(p), repeatsModule(p), sameCourseModule(p), multiSubModule(p)]
        .filter((m): m is ModuleList => m != null);

  return {
    state: profileState(p),
    flagged,
    multiSurface: new Set(p.results.map(r => (r.trail ? 'trail' : 'road'))).size > 1,
    yearFrom: Math.min(...years),
    yearTo: Math.max(...years),
    roadCount: p.results.filter(isRoad).length,
    trailCount: p.results.filter(isTrail).length,
    conflictBands: p.conflictBands ?? [],
    currentBand: flagged ? null : (chrono.find(r => r.cat)?.cat ?? null),
    bests: roadBests(p, { withAgeGrade: !flagged }),
    progressions: flagged ? [] : progressions(p),
    // Every figure in the trail block — distance covered, time on feet, best
    // percentile, event loyalty — is an aggregate across the whole record. On a
    // flagged profile that record may span several runners, so the block is a
    // career total by another name and is withheld with the rest. The trail
    // finishes themselves stay: they appear, surface-tagged, in the table.
    trail: flagged ? null : trailSummary(p, cohorts),
    arc: flagged ? null : trailArc(p),
    transition: flagged ? null : transition(p),
    modules,
    chrono,
  };
}
