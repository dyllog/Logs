import type { AthletePayload, PayloadResult, RaceSnapshot } from './athletePayload';
import { getAllRaceSnapshots } from './athletePayload';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface EnrichedResult extends PayloadResult {
  percentile: number | null;
  field_adjusted_score: number | null;
}

export interface TrajectoryResult {
  result_count: number;
  trend: 'improving' | 'plateauing' | 'declining';
  seconds_per_year: number;
  peak_year: number;
  first_year: number;
  note: string;
}

export interface BestResult {
  race: string;
  year: number;
  overall_place: number;
  field_size: number;
  percentile: number;
  note: string;
}

export interface AgeGrading {
  marathon_avg: number | null;
  half_marathon_avg: number | null;
  stronger_distance: 'marathon' | 'half_marathon' | null;
  note: string;
}

export interface QualifyingStatus {
  standard_display: string;
  standard_seconds: number;
  pb_seconds: number;
  gap_seconds: number;
  status: 'qualified' | 'close' | 'outside';
  note: string;
}

export interface RaceRecommendation {
  race: string;
  race_slug: string;
  year_used: number;
  projected_percentile: number;
  note: string;
}

export interface EnrichedPayload extends AthletePayload {
  results: EnrichedResult[];
  trajectory: {
    marathon: TrajectoryResult | null;
    half_marathon: TrajectoryResult | null;
  };
  best_result: BestResult | null;
  age_grading: AgeGrading;
  qualifying: {
    boston: QualifyingStatus | null;
    comrades: QualifyingStatus | null;
  };
  race_recommendations: {
    strong_placement: RaceRecommendation[];
    challenging: RaceRecommendation[];
  };
}

// ── WMA road age grading ─────────────────────────────────────────────────────
// Standards are the published WMA/USATF 2025 road tables (Alan Jones, CC0),
// parsed from the archived workbooks by scripts/buildWmaTables.mjs. Male and
// female tables are independent: the female curve does not track the male one,
// and approximating it with a constant multiplier reintroduces exactly the
// error the 2010 female re-fit existed to correct.
//
//   age grade % = age standard seconds ÷ actual time × 100
//
// Road only. Trail is never age-graded: the tables model neither terrain nor
// vertical gain, so a normalised trail time would flatter the easier course.

import WMA from '../data/wmaRoad2025.json';

/** Distances the published tables are natively developed for. */
export type GradedDistId = 'mar' | 'half' | '10k' | '5k';

const GRADED_DISTS: readonly string[] = ['mar', 'half', '10k', '5k'];

type WmaGender = 'M' | 'F';

/** Age standard in seconds, or null when the table has no such cell. */
function ageStandardSec(age: number, distId: string, gender: WmaGender): number | null {
  if (!GRADED_DISTS.includes(distId)) return null;
  const byAge = (WMA.standards as Record<string, Record<string, Record<string, number>>>)[gender];
  if (!byAge) return null;
  const row = byAge[String(age)];
  if (!row) return null;
  const sec = row[distId];
  return typeof sec === 'number' && sec > 0 ? sec : null;
}

/**
 * Age grade as a percentage, or null if it cannot be computed from the
 * published tables.
 *
 * There is deliberately no fallback path. If the lookup fails — unsupported
 * distance, unknown gender, age outside the table — the caller renders no
 * grade. An approximated grade is worse than an absent one, because it is
 * indistinguishable from a real one on the page.
 */
export function computeAgeGradedScore(
  finishTimeSec: number,
  distId: string,
  gender: string,
  age: number,
): number | null {
  if (!(finishTimeSec > 0) || !Number.isFinite(age)) return null;
  const g: WmaGender | null = gender === 'M' ? 'M' : gender === 'F' || gender === 'W' ? 'F' : null;
  if (!g) return null;
  const std = ageStandardSec(Math.round(age), distId, g);
  if (std == null) return null;
  return (std / finishTimeSec) * 100;
}

// ── Age from a recorded band ────────────────────────────────────────
// Rules live in ageBand.mjs so the app and the verification script share one
// definition rather than two that can drift apart.

export { ageFromBand } from './ageBand.mjs';
import { ageFromBand as resolveBandAge } from './ageBand.mjs';

export interface AgeGradeResult {
  /** Percentage. Round for display per `estimated`. */
  percent: number;
  ageUsed: number;
  /** True where the age came from a band rather than a published age. */
  estimated: boolean;
}

/**
 * Age grade for a single road result.
 *
 * `exactAge` is used when the source published a real age (some results carry
 * one); otherwise the band's midpoint is used and the result is marked
 * estimated, so the caller can drop the decimal place. Quoting 61.4% from a
 * ±2-year age estimate would overstate what the archive knows.
 */
export function ageGradeForResult(
  finishTimeSec: number,
  distId: string,
  gender: string,
  cat: string,
  exactAge?: number | null,
): AgeGradeResult | null {
  const estimated = !(typeof exactAge === 'number' && Number.isFinite(exactAge));
  const age = estimated ? resolveBandAge(cat) : (exactAge as number);
  if (age == null) return null;

  const percent = computeAgeGradedScore(finishTimeSec, distId, gender, age);
  if (percent == null) return null;

  return { percent, ageUsed: age, estimated };
}

/** Display string: whole numbers for estimated ages, one decimal for exact. */
export function formatAgeGrade(r: AgeGradeResult): string {
  return r.estimated ? `${Math.round(r.percent)}%` : `${r.percent.toFixed(1)}%`;
}


// ── Linear regression (simple 1D) ────────────────────────────────────────────

function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// ── Percentile projection for race recommendations ────────────────────────────
// Uses a simple model: assume time distribution is roughly normal around avg.
// Estimate std dev from (avg - winner) / 2.5 (heuristic for right-skewed distributions).
// Returns projected overall percentile for a given time in a given race.

function projectPercentile(athleteTimeSec: number, snap: RaceSnapshot): number {
  const { avg_seconds, winner_m_seconds, field_size } = snap;
  if (athleteTimeSec <= winner_m_seconds) return 99.9;

  // Linear interpolation: winner = top 0.1%, avg = ~45th percentile from top
  // (roughly 55th percentile overall, since fields skew right)
  const winnerPct = 99.9;
  const avgPct = 55.0; // ~55th percentile overall (avg time)

  if (athleteTimeSec <= avg_seconds) {
    // Between winner and avg: interpolate
    const t = (athleteTimeSec - winner_m_seconds) / (avg_seconds - winner_m_seconds);
    return winnerPct - t * (winnerPct - avgPct);
  }

  // Slower than avg: below 55th percentile
  // Assume distribution tails off: each additional avg_seconds slower drops ~25 pct
  const slowerBy = athleteTimeSec - avg_seconds;
  const drop = (slowerBy / avg_seconds) * 120; // scale factor
  return Math.max(0.5, avgPct - drop);
}

// ── Boston qualifier standards (seconds) by age group and gender ──────────────

const BOSTON_STANDARDS: Record<string, number> = {
  'M_18_34': 10800, // 3:00:00
  'M_35_39': 10800, // 3:00:00
  'M_40_44': 11100, // 3:05:00
  'M_45_49': 11700, // 3:15:00
  'M_50_54': 12300, // 3:25:00
  'M_55_59': 12900, // 3:35:00
  'M_60_64': 13800, // 3:50:00
  'M_65_69': 14700, // 4:05:00
  'M_70_74': 15600, // 4:20:00
  'F_18_34': 12600, // 3:30:00
  'F_35_39': 12600, // 3:30:00
  'F_40_44': 12900, // 3:35:00
  'F_45_49': 13500, // 3:45:00
  'F_50_54': 14100, // 3:55:00
  'F_55_59': 14700, // 4:05:00
  'F_60_64': 15600, // 4:20:00
  'F_65_69': 16500, // 4:35:00
  'F_70_74': 17400, // 4:50:00
};

const COMRADES_STANDARD = 18000; // 5:00:00 (sub-seeding)

function getBostonKey(gender: 'M' | 'F', age: number): string {
  const bands = [[18, 34], [35, 39], [40, 44], [45, 49], [50, 54], [55, 59], [60, 64], [65, 69], [70, 74]];
  for (const [lo, hi] of bands) {
    if (age >= lo && age <= hi) return `${gender}_${lo}_${hi}`;
  }
  return `${gender}_18_34`;
}

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    : `${m}:${String(ss).padStart(2, '0')}`;
}

// ── Main computation function ──────────────────────────────────────────────────

export function computeDerivedMetrics(payload: AthletePayload): EnrichedPayload {
  const { athlete, results, pbs } = payload;

  // 2a + 2b: Percentile and field-adjusted score per result
  const enrichedResults: EnrichedResult[] = results.map(r => ({
    ...r,
    percentile: r.field_size_overall > 0
      ? ((r.field_size_overall - r.overall_place) / r.field_size_overall) * 100
      : null,
    field_adjusted_score: r.field_size_overall > 0
      ? r.overall_place / r.field_size_overall
      : null,
  }));

  // 2c: Trajectory by distance (need ≥ 3 results)
  function computeTrajectory(distId: 'mar' | 'half'): TrajectoryResult | null {
    const pts = enrichedResults
      .filter(r => (distId === 'mar' ? r.distance_km > 30 : r.distance_km <= 30))
      .sort((a, b) => a.year - b.year);

    if (pts.length < 3) return null;

    const xs = pts.map(p => p.year);
    const ys = pts.map(p => p.finish_time_seconds);
    const { slope } = linearRegression(xs, ys);

    const trend: TrajectoryResult['trend'] =
      slope < -30 ? 'improving' :
      slope > 30  ? 'declining' :
      'plateauing';

    const peakResult = pts.reduce((best, r) => r.finish_time_seconds < best.finish_time_seconds ? r : best);

    const secPerYear = Math.round(Math.abs(slope));
    const dir = slope < 0 ? 'Improving' : slope > 0 ? 'Slowing' : 'Broadly flat';
    const note = trend === 'plateauing'
      ? `Broadly flat — within ~${secPerYear}s/year variation`
      : `${dir} at ~${secPerYear} seconds per year`;

    return {
      result_count: pts.length,
      trend,
      seconds_per_year: Math.round(slope),
      peak_year: peakResult.year,
      first_year: pts[0].year,
      note,
    };
  }

  const trajectory = {
    marathon:      computeTrajectory('mar'),
    half_marathon: computeTrajectory('half'),
  };

  // 2d: Best result (highest percentile)
  const validResults = enrichedResults.filter(r => r.percentile !== null);
  let best_result: BestResult | null = null;
  if (validResults.length > 0) {
    const best = validResults.reduce((b, r) => (r.percentile! > b.percentile! ? r : b));
    const fastestSameDistance = validResults
      .filter(r => r.distance_km === best.distance_km)
      .reduce((b, r) => r.finish_time_seconds < b.finish_time_seconds ? r : b);

    const note = best.race_name === fastestSameDistance.race_name && best.year === fastestSameDistance.year
      ? `${best.overall_place} of ${best.field_size_overall.toLocaleString()} — their highest-percentile finish`
      : `${best.overall_place} of ${best.field_size_overall.toLocaleString()} — higher percentile than their faster ${fastestSameDistance.finish_time_display} (${fastestSameDistance.year}) due to field size and composition`;

    best_result = {
      race:          best.race_name,
      year:          best.year,
      overall_place: best.overall_place,
      field_size:    best.field_size_overall,
      percentile:    Math.round(best.percentile! * 10) / 10,
      note,
    };
  }

  // 2e: Age-graded scores
  function avgAgeGraded(distId: 'mar' | 'half'): number | null {
    const pts = enrichedResults.filter(r =>
      distId === 'mar' ? r.distance_km > 30 : r.distance_km <= 30
    );
    if (pts.length === 0) return null;

    // A result the tables can't grade contributes nothing rather than a
    // substituted value — an average is only over what was actually graded.
    const scores = pts
      .map(r => computeAgeGradedScore(
        r.finish_time_seconds, distId, athlete.gender, r.year - athlete.birth_year,
      ))
      .filter((s): s is number => s != null);
    if (scores.length === 0) return null;

    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  }

  const marAvg  = avgAgeGraded('mar');
  const halfAvg = avgAgeGraded('half');

  let stronger: AgeGrading['stronger_distance'] = null;
  let agNote = '';

  if (marAvg !== null && halfAvg !== null) {
    const diff = Math.abs(marAvg - halfAvg);
    if (diff >= 1.5) {
      stronger = marAvg > halfAvg ? 'marathon' : 'half_marathon';
      agNote = `Age-graded scores suggest a ${diff.toFixed(1)}-point advantage at the ${stronger.replace('_', ' ')}`;
    } else {
      agNote = 'Age-graded scores are comparable across both distances';
    }
  } else if (marAvg !== null) {
    agNote = 'Age-graded score based on marathon results only';
  } else if (halfAvg !== null) {
    agNote = 'Age-graded score based on half marathon results only';
  }

  const age_grading: AgeGrading = {
    marathon_avg:      marAvg,
    half_marathon_avg: halfAvg,
    stronger_distance: stronger,
    note: agNote,
  };

  // 2f: Qualifying gaps
  const currentAge = new Date().getFullYear() - athlete.birth_year;

  let bostonQual: QualifyingStatus | null = null;
  if (pbs.marathon) {
    const key = getBostonKey(athlete.gender, currentAge);
    const standard = BOSTON_STANDARDS[key] ?? BOSTON_STANDARDS[`${athlete.gender}_18_34`];
    const gap = standard - pbs.marathon.time_seconds;
    const status: QualifyingStatus['status'] =
      gap >= 0 ? 'qualified' :
      gap >= -300 ? 'close' :
      'outside';

    let note = '';
    if (status === 'qualified') {
      note = `Qualifies with ${fmtSec(gap)} to spare (${fmtSec(standard)} standard)`;
    } else if (status === 'close') {
      note = `${fmtSec(Math.abs(gap))} outside the ${fmtSec(standard)} standard`;
    } else {
      note = `${fmtSec(Math.abs(gap))} outside the ${fmtSec(standard)} standard`;
    }

    bostonQual = {
      standard_display: fmtSec(standard),
      standard_seconds: standard,
      pb_seconds:       pbs.marathon.time_seconds,
      gap_seconds:      gap,
      status,
      note,
    };
  }

  let comradesQual: QualifyingStatus | null = null;
  if (pbs.marathon) {
    const gap = COMRADES_STANDARD - pbs.marathon.time_seconds;
    const status: QualifyingStatus['status'] =
      gap >= 0 ? 'qualified' : gap >= -1800 ? 'close' : 'outside';

    comradesQual = {
      standard_display: fmtSec(COMRADES_STANDARD),
      standard_seconds: COMRADES_STANDARD,
      pb_seconds:       pbs.marathon.time_seconds,
      gap_seconds:      gap,
      status,
      note: status === 'qualified'
        ? `Within Comrades sub-seeding standard (${fmtSec(COMRADES_STANDARD)})`
        : `${fmtSec(Math.abs(gap))} outside Comrades sub-seeding standard`,
    };
  }

  // 2g: Race recommendations
  const snapshots = getAllRaceSnapshots();

  interface Proj { snap: RaceSnapshot; pct: number }
  const projections: Proj[] = [];

  for (const snap of snapshots) {
    const pb = snap.distance === 'mar' ? pbs.marathon : pbs.half_marathon;
    if (!pb) continue;
    const pct = projectPercentile(pb.time_seconds, snap);
    projections.push({ snap, pct });
  }

  projections.sort((a, b) => b.pct - a.pct);

  const strong = projections.slice(0, 3).map(({ snap, pct }) => ({
    race:               snap.race_name,
    race_slug:          snap.race_slug,
    year_used:          snap.year,
    projected_percentile: Math.round(pct * 10) / 10,
    note: `Field of ${snap.field_size.toLocaleString()} in ${snap.year} — projected top ${(100 - pct).toFixed(1)}%`,
  }));

  const challenging = projections.slice(-3).reverse().map(({ snap, pct }) => ({
    race:               snap.race_name,
    race_slug:          snap.race_slug,
    year_used:          snap.year,
    projected_percentile: Math.round(pct * 10) / 10,
    note: `Deep or fast field — projected top ${(100 - pct).toFixed(1)}%`,
  }));

  return {
    ...payload,
    results: enrichedResults,
    trajectory,
    best_result,
    age_grading,
    qualifying: {
      boston:   bostonQual,
      comrades: comradesQual,
    },
    race_recommendations: {
      strong_placement: strong,
      challenging,
    },
  };
}
