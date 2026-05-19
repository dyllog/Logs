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

// ── WMA age grading factors (male, by age) ────────────────────────────────────
// Factors from WMA 2015 tables for marathon and half marathon.
// Represent the ratio open_standard / age_graded_standard.

const WMA_MAR_OPEN_STANDARD = 7377;   // 2:02:57 — WMA open standard for marathon
const WMA_HALF_OPEN_STANDARD = 3411;  // 56:51   — WMA open standard for half marathon

// Male age grading factors for marathon (ages 18–70)
// Lower factor = more performance expected relative to open standard
const WMA_FACTORS_MAR_M: Record<number, number> = {
  18: 1.000, 19: 1.000, 20: 1.000, 21: 1.000, 22: 1.000, 23: 1.000,
  24: 1.000, 25: 1.000, 26: 1.000, 27: 1.000, 28: 1.000, 29: 1.000,
  30: 1.000, 31: 1.001, 32: 1.002, 33: 1.003, 34: 1.005, 35: 1.007,
  36: 1.010, 37: 1.014, 38: 1.018, 39: 1.023, 40: 1.028, 41: 1.033,
  42: 1.039, 43: 1.045, 44: 1.052, 45: 1.059, 46: 1.066, 47: 1.074,
  48: 1.083, 49: 1.092, 50: 1.102, 51: 1.113, 52: 1.124, 53: 1.136,
  54: 1.148, 55: 1.161, 56: 1.175, 57: 1.189, 58: 1.204, 59: 1.220,
  60: 1.236, 61: 1.253, 62: 1.271, 63: 1.289, 64: 1.308, 65: 1.328,
  66: 1.349, 67: 1.371, 68: 1.393, 69: 1.416, 70: 1.440,
};

// Male age grading factors for half marathon (ages 18–70)
const WMA_FACTORS_HALF_M: Record<number, number> = {
  18: 1.000, 19: 1.000, 20: 1.000, 21: 1.000, 22: 1.000, 23: 1.000,
  24: 1.000, 25: 1.000, 26: 1.000, 27: 1.000, 28: 1.000, 29: 1.000,
  30: 1.000, 31: 1.001, 32: 1.002, 33: 1.004, 34: 1.006, 35: 1.008,
  36: 1.011, 37: 1.015, 38: 1.019, 39: 1.024, 40: 1.029, 41: 1.034,
  42: 1.040, 43: 1.047, 44: 1.054, 45: 1.061, 46: 1.069, 47: 1.077,
  48: 1.086, 49: 1.095, 50: 1.105, 51: 1.116, 52: 1.127, 53: 1.139,
  54: 1.152, 55: 1.165, 56: 1.179, 57: 1.194, 58: 1.209, 59: 1.225,
  60: 1.242, 61: 1.259, 62: 1.277, 63: 1.295, 64: 1.315, 65: 1.335,
  66: 1.356, 67: 1.378, 68: 1.401, 69: 1.424, 70: 1.449,
};

function getWmaFactor(age: number, distId: 'mar' | 'half', gender: 'M' | 'F'): number {
  // Female factors are approximately 10% higher than male (open standard adjustment)
  // For simplicity, using male factors with a gender offset for female athletes
  const table = distId === 'mar' ? WMA_FACTORS_MAR_M : WMA_FACTORS_HALF_M;
  const clampedAge = Math.max(18, Math.min(70, age));
  const factor = table[clampedAge] ?? table[70];
  return gender === 'F' ? factor * 1.10 : factor;
}

function computeAgeGradedScore(
  finishTimeSec: number,
  distId: 'mar' | 'half',
  gender: 'M' | 'F',
  age: number,
): number {
  const openStd = distId === 'mar' ? WMA_MAR_OPEN_STANDARD : WMA_HALF_OPEN_STANDARD;
  const factor = getWmaFactor(age, distId, gender);
  // age_graded_score = (open_standard / finish_time) * factor * 100
  return (openStd / finishTimeSec) * factor * 100;
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

    const scores = pts.map(r => {
      const age = r.year - athlete.birth_year;
      return computeAgeGradedScore(r.finish_time_seconds, distId, athlete.gender, age);
    });
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
