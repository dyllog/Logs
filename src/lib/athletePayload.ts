import { getAthleteBySlug, getRaceKey } from '../data/allAthletes';
import { yearStats, halfStats, rotoruaStats, rotoruaHalfStats } from '../data/logsDataExt';
import { chcStats, chcHalfStats } from '../data/chcData';
import { hbStats, hbHalfStats } from '../data/hbData';
import { qtStats, qtHalfStats } from '../data/qtData';
import { wfHalfStats } from '../data/waterfrontData';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PayloadResult {
  race_name: string;
  race_slug: string;
  year: number;
  distance_km: number;
  finish_time_seconds: number;
  finish_time_display: string;
  overall_place: number;
  field_size_overall: number;
  median_time_seconds: number | null;
  median_time_display: string | null;
  course_record_seconds: number | null;
  course_record_display: string | null;
}

export interface PayloadPB {
  time_display: string;
  time_seconds: number;
  race: string;
  year: number;
}

export interface AthletePayload {
  athlete: {
    name: string;
    slug: string;
    gender: 'M' | 'F';
    category: string;
    nationality: string;
    birth_year: number;
    races_logged: number;
  };
  results: PayloadResult[];
  pbs: {
    marathon?: PayloadPB;
    half_marathon?: PayloadPB;
  };
}

// ── Race stats lookup ──────────────────────────────────────────────────────────

interface RaceStats {
  avg: number;       // field average (used as median proxy)
  finishers: number; // overall field size
}

function getRaceStats(raceKey: string, year: number): RaceStats | null {
  const find = (arr: Array<{ year: number; avg: number; finishers: number }>) =>
    arr.find(s => s.year === year) ?? null;

  switch (raceKey) {
    case 'akl-mar':  return find(yearStats);
    case 'akl-half': return find(halfStats);
    case 'rot-mar':  return find(rotoruaStats);
    case 'rot-half': return find(rotoruaHalfStats);
    case 'chc-mar':  return find(chcStats);
    case 'chc-half': return find(chcHalfStats);
    case 'hb-mar':   return find(hbStats);
    case 'hb-half':  return find(hbHalfStats);
    case 'qt-mar':   return find(qtStats);
    case 'qt-half':  return find(qtHalfStats);
    case 'wf-half':  return find(wfHalfStats);
    default:         return null;
  }
}

// ── Course records (Auckland only — hardcoded from logsData) ──────────────────

const COURSE_RECORDS: Record<string, { M: number; W: number }> = {
  'akl-mar':  { M: 8372,  W: 9490  }, // 2:19:32 / 2:38:10
  'akl-half': { M: 3877,  W: 4425  }, // 1:04:37 / 1:13:45
};

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    : `${m}:${String(ss).padStart(2, '0')}`;
}

function toRaceSlug(raceName: string): string {
  const n = raceName.toLowerCase();
  if (n.includes('auckland') && n.includes('marathon')) return 'auckland-marathon';
  if (n.includes('auckland') && n.includes('half'))     return 'auckland-half-marathon';
  if (n.includes('rotorua') && n.includes('marathon'))  return 'rotorua-marathon';
  if (n.includes('rotorua') && n.includes('half'))      return 'rotorua-half-marathon';
  if (n.includes('christchurch') && n.includes('marathon')) return 'christchurch-marathon';
  if (n.includes('christchurch') && n.includes('half'))     return 'christchurch-half-marathon';
  if (n.includes('hawke') && n.includes('marathon'))    return 'hawkes-bay-marathon';
  if (n.includes('hawke') && n.includes('half'))        return 'hawkes-bay-half-marathon';
  if (n.includes('waterfront'))                          return 'waterfront-half-marathon';
  if (n.includes('queenstown') && n.includes('marathon')) return 'queenstown-marathon';
  if (n.includes('queenstown') && n.includes('half'))     return 'queenstown-half-marathon';
  return raceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// ── Main function ──────────────────────────────────────────────────────────────

export function buildAthletePayload(slug: string): AthletePayload | null {
  const profile = getAthleteBySlug(slug);
  if (!profile) return null;

  const sorted = [...profile.results].sort((a, b) => a.dateNum - b.dateNum);

  const results: PayloadResult[] = sorted
    .filter(r => r.total > 0)
    .map(r => {
      const raceKey = getRaceKey(r.race, r.distId);
      const stats = getRaceStats(raceKey, r.year);
      const crEntry = COURSE_RECORDS[raceKey];
      const cr = crEntry ? crEntry[profile.gender] : null;

      return {
        race_name:              r.race,
        race_slug:              toRaceSlug(r.race),
        year:                   r.year,
        distance_km:            r.distId === 'mar' ? 42.2 : 21.1,
        finish_time_seconds:    r.sec,
        finish_time_display:    r.time,
        overall_place:          r.pos,
        field_size_overall:     r.total,
        median_time_seconds:    stats ? stats.avg : null,
        median_time_display:    stats ? fmtSec(stats.avg) : null,
        course_record_seconds:  cr ?? null,
        course_record_display:  cr ? fmtSec(cr) : null,
      };
    });

  const pbs: AthletePayload['pbs'] = {};
  if (profile.pbs.mar) {
    pbs.marathon = {
      time_display: profile.pbs.mar.time,
      time_seconds: profile.pbs.mar.sec,
      race:         profile.pbs.mar.race,
      year:         profile.pbs.mar.year,
    };
  }
  if (profile.pbs.half) {
    pbs.half_marathon = {
      time_display: profile.pbs.half.time,
      time_seconds: profile.pbs.half.sec,
      race:         profile.pbs.half.race,
      year:         profile.pbs.half.year,
    };
  }

  return {
    athlete: {
      name:        profile.name,
      slug:        profile.slug,
      gender:      profile.gender,
      category:    profile.category,
      nationality: profile.nationality,
      birth_year:  profile.birthYear,
      races_logged: profile.results.length,
    },
    results,
    pbs,
  };
}

// ── Race recommendation data ───────────────────────────────────────────────────
// Used by computeDerivedMetrics to project where an athlete would place.

export interface RaceSnapshot {
  race_name: string;
  race_slug: string;
  distance: 'mar' | 'half';
  year: number;
  field_size: number;
  avg_seconds: number;
  winner_m_seconds: number;
}

export function getAllRaceSnapshots(): RaceSnapshot[] {
  const latest = <T extends { year: number }>(arr: T[]): T | undefined =>
    arr.slice().sort((a, b) => b.year - a.year)[0];

  const snapshots: RaceSnapshot[] = [];

  const add = (
    stats: Array<{ year: number; finishers: number; avg: number; winnerM: number }>,
    race_name: string,
    race_slug: string,
    distance: 'mar' | 'half',
  ) => {
    const s = latest(stats);
    if (s) snapshots.push({ race_name, race_slug, distance, year: s.year, field_size: s.finishers, avg_seconds: s.avg, winner_m_seconds: s.winnerM });
  };

  add(yearStats,        'Auckland Marathon',           'auckland-marathon',          'mar');
  add(halfStats,        'Auckland Half Marathon',       'auckland-half-marathon',     'half');
  add(rotoruaStats,     'Rotorua Marathon',             'rotorua-marathon',           'mar');
  add(rotoruaHalfStats, 'Rotorua Half Marathon',        'rotorua-half-marathon',      'half');
  add(chcStats,         'Christchurch Marathon',        'christchurch-marathon',      'mar');
  add(chcHalfStats,     'Christchurch Half Marathon',   'christchurch-half-marathon', 'half');
  add(hbStats,          "Hawke's Bay Marathon",         'hawkes-bay-marathon',        'mar');
  add(hbHalfStats,      "Hawke's Bay Half Marathon",    'hawkes-bay-half-marathon',   'half');
  add(qtStats,          'Queenstown Marathon',          'queenstown-marathon',        'mar');
  add(qtHalfStats,      'Queenstown Half Marathon',     'queenstown-half-marathon',   'half');
  add(wfHalfStats,      'Waterfront Half Marathon',     'waterfront-half-marathon',   'half');

  return snapshots;
}
