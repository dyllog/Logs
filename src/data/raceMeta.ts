// Data-driven race metadata — faithful port of the 16 static race pages.
// Consumed by src/pages/RaceProfile.tsx via getRaceMeta(slug).

import type { YearStat } from './logsDataExt';
import {
  yearStats, halfStats, courseStats,
  rotoruaStats, rotoruaHalfStats,
} from './logsDataExt';
import {
  DISTANCE_OPTIONS, race,
  elevation as aucklandElevation,
  elevationAnnotations as aucklandAnnotations,
} from './logsData';
import { chcStats, chcHalfStats } from './chcData';
import { qtStats, qtHalfStats } from './qtData';
import { hbStats, hbHalfStats } from './hbData';
import { wfHalfStats, wf10kStats } from './waterfrontData';
import { devHalfStats, dev10kStats } from './devonportData';
import { coastStats } from './coatesvilleData';
import { omahaHalfStats, omaha10kStats } from './omahaData';
import { maraetaiHalfStats, maraetai10kStats } from './maraetaiData';
import { kerikeriStats } from './kerikeriData';
import { wellingtonMarStats, wellingtonHalfStats } from './wellingtonData';
import { onehungaHalfStats, onehunga10kStats } from './onehungaData';
import { orewaHalfStats, orewa10kStats } from './orewaData';
import { tamakiHalfStats, tamaki10kStats } from './tamakiData';
import { mtmHalfStats, mtm10kStats, mtm5kStats } from './mtmData';
import { whanganuiMarStats, whanganuiHalfStats, whanganuiQuarterStats, whanganui5kStats } from './whanganuiData';
import { saintClairHalfStats, saintClair12kStats } from './saintClairData';
import { taupoMarStats, taupoHalfStats, taupo10kStats, taupo5kStats } from './taupoData';

export type RaceResultsId =
  | 'auckland' | 'rotorua' | 'rotorua-half' | 'chc' | 'chc-half' | 'hb' | 'hb-half'
  | 'qt' | 'qt-half' | 'wf-half' | 'wf-10k' | 'dev-half' | 'dev-10k' | 'coast-half'
  | 'omaha-half' | 'omaha-10k' | 'maraetai-half' | 'maraetai-10k' | 'kerikeri-half'
  | 'wellington-mar' | 'wellington-half' | 'onehunga-half' | 'onehunga-10k'
  | 'orewa-half' | 'orewa-10k' | 'tamaki-half' | 'tamaki-10k'
  | 'mtm-half' | 'mtm-10k' | 'mtm-5k'
  | 'whanganui-mar' | 'whanganui-half' | 'whanganui-quarter' | 'whanganui-5k'
  | 'saintclair-half' | 'saintclair-12k'
  | 'taupo-mar' | 'taupo-half' | 'taupo-10k' | 'taupo-5k';

export interface RaceRecord {
  time: string;
  holder: string;
  nationality: string;
  club: string;
  year: number;
  previous?: string;
}

export interface RaceDistance {
  key: string;
  raceId: RaceResultsId;
  /** URL ?dist= value that selects this distance (Auckland + full-marathon pages). */
  matchDist?: string;
  /** URL ?race= value that selects this distance. */
  matchRace?: string;
  /** Pill label, RaceResultsBlock dist, and every "· {distLabel}" header. */
  distLabel: string;
  /** Heading noun in "{profileLong} course profile". */
  profileLong: string;
  stats: YearStat[];
  /** Averages + full record card only render when hasData !== false. */
  hasData?: boolean;
  /**
   * Indicative elevation trace. OPTIONAL, and absent is a valid state rather
   * than a gap to fill: these traces are hand-estimated from known route
   * characteristics, not surveyed, so authoring one for a race nobody has
   * ridden would be inventing data. RaceProfile omits the course-profile chart
   * and the climb/descent/net figures when it is missing, and still renders
   * surface and character. Existing estimated traces keep their caveat.
   */
  elevation?: [number, number][];
  annotations?: { km: number; label: string }[];
  climb?: string;
  descent?: string;
  net?: string;
  netSub?: string;
  /** Overrides meta.overviewRight for this distance (Auckland). */
  overviewRight?: string;
  /** Overrides meta.courseField for this distance (Devonport, Mount Maunganui). */
  courseField?: string;
  /** Overrides meta.secondaryBody for this distance. */
  secondaryBody?: string;
  /** Italic revision note under the sidebar (Auckland 42.2 km only). */
  note?: string;
  recordM?: RaceRecord;
  recordW?: RaceRecord;
}

export interface RaceMeta {
  slug: string;
  eyebrow: string;
  title: string;
  /** Defaults to 'clamp(36px,5vw,64px)'. */
  titleClamp?: string;
  location: string;
  /** Defaults to 'Course'. */
  courseFieldLabel?: string;
  /**
   * The following are all OPTIONAL, and each omits its own row when absent.
   *
   * They were required, which meant registering a new family demanded four
   * separate pieces of course prose — courseField, overviewRight, surface and
   * secondaryBody — before the page would typecheck. In practice a newly
   * ingested race has one short factual description available, and requiring
   * four invites three of them to be invented. Supply what is known; the page
   * renders the rest away.
   */
  courseField?: string;
  nextEdition?: string;
  entryUrl?: string;
  /** Defaults to the entry URL with its scheme stripped. */
  entryText?: string;
  overviewRight?: string;
  surface?: string;
  /** 'Certification' (Auckland) or 'Character' (all others, and the default). */
  secondaryLabel?: string;
  secondaryBody: string;
  averagesNote?: string;
  decorativePills?: string[];
  distances: RaceDistance[];
}

// ── Auckland (built from the shared DISTANCE_OPTIONS source) ──────────────
const aucklandStatsFor = (id: string): YearStat[] =>
  id === '42' ? yearStats : id === '21' ? halfStats : [];

const aucklandDistances: RaceDistance[] = DISTANCE_OPTIONS.map((d) => {
  const hasData = d.id === '42' || d.id === '21';
  return {
    key: `auckland-${d.id}`,
    raceId: 'auckland' as const,
    matchDist: d.id,
    matchRace: d.id === '21' ? 'auckland-half' : undefined,
    distLabel: d.label,
    profileLong: d.long,
    stats: aucklandStatsFor(d.id),
    hasData,
    elevation: d.id === '42' ? aucklandElevation : aucklandElevation.filter((p) => p[0] <= d.km),
    annotations: aucklandAnnotations.filter((a) => a.km <= d.km),
    climb: `${d.climb} m`,
    descent: `${d.descent} m`,
    net: `+${d.net} m`,
    netSub: 'finish vs start',
    overviewRight: d.courseNote,
    note: d.id === '42' ? race.courseNote : undefined,
    recordM: hasData ? d.recordM : undefined,
    recordW: hasData ? d.recordW : undefined,
  };
});

// ── Elevation profiles ────────────────────────────────────────────────────
const rotoruaElevation: [number, number][] = [
  [0,280],[1,281],[2,282],[3,282],[4,282],[5,283],[6,283],[7,282],
  [8,281],[9,280],[10,279],[11,279],[12,278],[13,279],[14,280],[15,281],
  [16,282],[17,282],[18,281],[19,280],[20,280],[21,279],[22,278],[23,278],
  [24,278],[25,279],[26,280],[27,281],[28,281],[29,280],[30,279],[31,279],
  [32,280],[33,281],[34,282],[35,282],[36,281],[37,281],[38,280],[39,280],
  [40,280],[41,280],[42.2,280],
];
const rotoruaAnnotations = [
  { km: 0, label: 'Rotorua CBD' },
  { km: 10, label: 'Sulphur Point' },
  { km: 21.1, label: 'Halfway' },
  { km: 35, label: 'Ohinemutu' },
  { km: 42.2, label: 'Finish · Memorial Park' },
];

const chcElevation: [number, number][] = [
  [0,15],[1,15],[2,16],[3,16],[4,15],[5,15],[6,14],[7,14],
  [8,15],[9,15],[10,15],[11,16],[12,16],[13,15],[14,15],[15,15],
  [16,14],[17,14],[18,15],[19,15],[20,15],[21.1,15],
];
const chcAnnotations = [
  { km: 0, label: 'Hagley Park' },
  { km: 10, label: 'Ferrymead' },
  { km: 21.1, label: 'Finish' },
];
const chcElevationFull: [number, number][] = [
  [0,15],[1,15],[2,16],[3,16],[4,15],[5,15],[6,14],[7,14],
  [8,15],[9,15],[10,15],[11,16],[12,16],[13,15],[14,15],[15,15],
  [16,14],[17,14],[18,15],[19,15],[20,15],[21,15],[22,15],[23,16],
  [24,16],[25,15],[26,14],[27,14],[28,15],[29,15],[30,15],[31,16],
  [32,16],[33,15],[34,15],[35,14],[36,14],[37,15],[38,15],[39,15],
  [40,15],[41,15],[42.2,15],
];
const chcAnnotationsFull = [
  { km: 0, label: 'Hagley Park' },
  { km: 10, label: 'Ferrymead' },
  { km: 21.1, label: 'Halfway' },
  { km: 35, label: 'Return' },
  { km: 42.2, label: 'Finish' },
];

const qtElevationFull: [number, number][] = [
  [0,310],[1,315],[2,320],[3,328],[4,332],[5,328],[6,322],[7,318],
  [8,315],[9,318],[10,325],[11,335],[12,348],[13,360],[14,370],[15,375],
  [16,378],[17,375],[18,368],[19,358],[20,345],[21,335],[21.1,332],
  [22,325],[23,318],[24,312],[25,310],[26,312],[27,315],[28,318],
  [29,322],[30,328],[31,335],[32,345],[33,358],[34,368],[35,375],
  [36,378],[37,372],[38,362],[39,348],[40,335],[41,320],[42.2,310],
];
const qtAnnotationsFull = [
  { km: 0, label: 'Queenstown' },
  { km: 10, label: 'Arrowtown' },
  { km: 21.1, label: 'Halfway' },
  { km: 35, label: 'Arrow Rd' },
  { km: 42.2, label: 'Finish' },
];
const qtElevationHalf: [number, number][] = [
  [0,310],[1,315],[2,320],[3,328],[4,332],[5,328],[6,322],[7,318],
  [8,315],[9,318],[10,325],[11,335],[12,348],[13,360],[14,370],[15,375],
  [16,378],[17,375],[18,368],[19,358],[20,345],[21,335],[21.1,332],
];
const qtAnnotationsHalf = [
  { km: 0, label: 'Queenstown' },
  { km: 10, label: 'Arrowtown' },
  { km: 21.1, label: 'Finish' },
];

const hbElevationFull: [number, number][] = [
  [0,12],[1,12],[2,13],[3,14],[4,15],[5,15],[6,14],[7,13],
  [8,12],[9,12],[10,13],[11,15],[12,18],[13,20],[14,22],[15,24],
  [16,26],[17,28],[18,28],[19,26],[20,24],[21,22],[21.1,20],
  [22,18],[23,16],[24,14],[25,12],[26,12],[27,13],[28,14],
  [29,15],[30,16],[31,18],[32,20],[33,22],[34,22],[35,20],
  [36,18],[37,16],[38,14],[39,13],[40,12],[41,12],[42.2,12],
];
const hbAnnotationsFull = [
  { km: 0, label: 'Napier' },
  { km: 14, label: 'Havelock North' },
  { km: 21.1, label: 'Halfway' },
  { km: 35, label: 'Return' },
  { km: 42.2, label: 'Finish' },
];
const hbElevationHalf: [number, number][] = [
  [0,12],[1,12],[2,13],[3,14],[4,15],[5,15],[6,14],[7,13],
  [8,12],[9,12],[10,13],[11,15],[12,18],[13,20],[14,22],[15,24],
  [16,26],[17,28],[18,28],[19,26],[20,24],[21,22],[21.1,20],
];
const hbAnnotationsHalf = [
  { km: 0, label: 'Napier' },
  { km: 14, label: 'Havelock North' },
  { km: 21.1, label: 'Finish' },
];

const wfHalfElevation: [number, number][] = [
  [0,3],[1,3],[2,4],[3,4],[4,3],[5,3],[6,4],[7,4],
  [8,3],[9,3],[10,4],[10.55,4],
  [11,4],[12,3],[13,3],[14,4],[15,4],[16,3],[17,3],[18,4],[19,4],[20,3],[21,3],[21.1,3],
];
const wfHalfAnnotations = [
  { km: 0, label: 'Start' },
  { km: 10.55, label: 'Turnaround' },
  { km: 21.1, label: 'Finish' },
];
const wf10kElevation: [number, number][] = [
  [0,3],[1,3],[2,4],[3,4],[4,3],[5,3],
  [6,4],[7,3],[8,3],[9,4],[10,3],
];
const wf10kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 5, label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

const devHalfElevation: [number, number][] = [
  [0,5],[1,8],[2,10],[3,10],[3.7,8],
  [4.5,8],[5,10],[6,15],[6.5,40],[7.5,87],[8,55],[8.5,8],
  [9,5],[9.3,5],[10,5],
  [11,8],[12,10],[13,10],[13.7,8],
  [14.5,8],[15,10],[16,15],[16.5,40],[17.5,87],[18,55],[18.5,8],
  [19,5],[19.3,5],[20,5],
  [20.5,5],[21.1,5],
];
const devHalfAnnotations = [
  { km: 0, label: 'Start' },
  { km: 3.7, label: 'Narrow Neck' },
  { km: 7.5, label: 'North Head' },
  { km: 13.7, label: 'Narrow Neck' },
  { km: 17.5, label: 'North Head' },
  { km: 21.1, label: 'Finish' },
];
const dev10kElevation: [number, number][] = [
  [0,5],[1,8],[2,10],[3,10],[3.7,8],
  [4.5,8],[5,10],[6,15],[6.5,40],[7.5,87],[8,55],[8.5,8],
  [9,5],[9.3,5],[10,5],
];
const dev10kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 3.7, label: 'Narrow Neck' },
  { km: 7.5, label: 'North Head' },
  { km: 10, label: 'Finish' },
];

const coastElevation: [number, number][] = [
  [0,25],[1,55],[2,90],[3,70],[4,45],
  [5,75],[6,110],[7,135],[8,115],[9,80],
  [10,50],[11,65],[12,95],[13,120],[14,95],
  [15,70],[16,85],[17,60],[18,45],[19,35],
  [20,28],[21,25],[21.1,25],
];
const coastAnnotations = [
  { km: 0, label: 'Start' },
  { km: 7, label: 'Highest point' },
  { km: 21.1, label: 'Finish' },
];

const omahaHalfElevation: [number, number][] = [
  [0,3],[1,4],[2,5],[3,6],[4,5],[5,4],
  [6,5],[7,6],[8,7],[9,6],[10,5],
  [11,4],[12,5],[13,6],[14,5],[15,4],
  [16,5],[17,6],[18,5],[19,4],[20,3],
  [21,3],[21.1,3],
];
const omahaHalfAnnotations = [
  { km: 0, label: 'Start' },
  { km: 10.5, label: 'Turnaround' },
  { km: 21.1, label: 'Finish' },
];
const omaha10kElevation: [number, number][] = [
  [0,3],[1,4],[2,5],[3,6],[4,5],[5,4],
  [6,5],[7,6],[8,5],[9,4],[10,3],
];
const omaha10kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 5, label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

const maraetaiHalfElevation: [number, number][] = [
  [0,5],[1,6],[2,7],[3,8],[4,7],[5,6],
  [6,7],[7,8],[8,9],[9,8],[10,7],
  [10.55,7],[11,8],[12,9],[13,8],[14,7],
  [15,6],[16,7],[17,8],[18,7],[19,6],
  [20,5],[21,5],[21.1,5],
];
const maraetaiHalfAnnotations = [
  { km: 0, label: 'Start' },
  { km: 10.5, label: 'Turnaround' },
  { km: 21.1, label: 'Finish' },
];
const maraetai10kElevation: [number, number][] = [
  [0,5],[1,6],[2,7],[3,8],[4,7],[5,6],
  [6,7],[7,8],[8,7],[9,6],[10,5],
];
const maraetai10kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 5, label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

const kerikeriElevation: [number, number][] = [
  [0,10],[1,30],[2,65],[3,95],[4,80],
  [5,55],[6,40],[7,60],[8,85],[9,110],
  [10,90],[11,65],[12,45],[13,70],[14,95],
  [15,75],[16,50],[17,35],[18,20],[19,15],
  [20,10],[21,10],[21.1,10],
];
const kerikeriAnnotations = [
  { km: 0, label: 'Start' },
  { km: 9, label: 'Highest point' },
  { km: 21.1, label: 'Finish' },
];

const wellingtonElevationFull: [number, number][] = [
  [0,5],[1,6],[2,7],[3,8],[4,9],[5,10],[6,10],[7,9],[8,8],
  [9,7],[10,6],[11,5],[12,6],[13,7],[14,8],[15,9],[16,10],
  [17,11],[18,12],[19,11],[20,10],[21,9],[21.1,9],
  [22,8],[23,7],[24,6],[25,5],[26,6],[27,7],[28,8],
  [29,9],[30,10],[31,11],[32,12],[33,11],[34,10],[35,9],
  [36,8],[37,7],[38,6],[39,5],[40,5],[41,5],[42.2,5],
];
const wellingtonAnnotationsFull = [
  { km: 0, label: 'Start · Westpac Stadium' },
  { km: 21.1, label: 'Halfway · Oriental Bay' },
  { km: 42.2, label: 'Finish · Queens Wharf' },
];
const wellingtonElevationHalf: [number, number][] = [
  [0,5],[1,6],[2,7],[3,8],[4,9],[5,10],[6,10],[7,9],[8,8],
  [9,7],[10,6],[11,5],[12,6],[13,7],[14,8],[15,9],[16,10],
  [17,11],[18,12],[19,11],[20,10],[21,9],[21.1,9],
];
const wellingtonAnnotationsHalf = [
  { km: 0, label: 'Start' },
  { km: 10, label: 'Oriental Bay' },
  { km: 21.1, label: 'Finish' },
];

const onehungaHalfElevation: [number, number][] = [
  [0,4],[1,5],[2,6],[3,5],[4,4],[5,5],
  [6,4],[7,5],[8,6],[9,5],[10,4],
  [10.55,4],[11,5],[12,6],[13,5],[14,4],
  [15,5],[16,4],[17,5],[18,6],[19,5],
  [20,4],[21,4],[21.1,4],
];
const onehungaHalfAnnotations = [
  { km: 0, label: 'Start' },
  { km: 10.5, label: 'Turnaround' },
  { km: 21.1, label: 'Finish' },
];
const onehunga10kElevation: [number, number][] = [
  [0,4],[1,5],[2,6],[3,5],[4,4],
  [5,4],[6,5],[7,4],[8,5],[9,4],[10,4],
];
const onehunga10kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 5, label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

const orewaHalfElevation: [number, number][] = [
  [0,3],[1,4],[2,5],[3,4],[4,3],[5,4],
  [6,3],[7,4],[8,5],[9,4],[10,3],
  [10.55,3],[11,4],[12,5],[13,4],[14,3],
  [15,4],[16,3],[17,4],[18,5],[19,4],
  [20,3],[21,3],[21.1,3],
];
const orewaHalfAnnotations = [
  { km: 0, label: 'Start' },
  { km: 10.5, label: 'Turnaround' },
  { km: 21.1, label: 'Finish' },
];
const orewa10kElevation: [number, number][] = [
  [0,3],[1,4],[2,5],[3,4],[4,3],
  [5,3],[6,4],[7,3],[8,4],[9,3],[10,3],
];
const orewa10kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 5, label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

const tamakiHalfElevation: [number, number][] = [
  [0,3],[1,4],[2,5],[3,4],[4,3],[5,4],
  [6,5],[7,4],[8,3],[9,4],[10,3],
  [10.55,3],[11,4],[12,5],[13,4],[14,3],
  [15,4],[16,5],[17,4],[18,3],[19,4],
  [20,3],[21,3],[21.1,3],
];
const tamakiHalfAnnotations = [
  { km: 0, label: 'Start' },
  { km: 10.5, label: 'Turnaround' },
  { km: 21.1, label: 'Finish' },
];
const tamaki10kElevation: [number, number][] = [
  [0,3],[1,4],[2,5],[3,4],[4,3],
  [5,3],[6,4],[7,5],[8,4],[9,3],[10,3],
];
const tamaki10kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 5, label: 'Turnaround' },
  { km: 10, label: 'Finish' },
];

const mtmHalfElevation: [number, number][] = [
  [0,2],[1,3],[2,4],[3,5],[3.5,8],[4,12],[4.5,10],
  [5,6],[6,4],[7,3],[8,3],[9,4],[10,5],
  [11,6],[11.5,10],[12,14],[12.5,10],[13,6],
  [14,4],[15,3],[16,3],[17,4],[18,5],[19,4],[20,3],[21,2],[21.1,2],
];
const mtmHalfAnnotations = [
  { km: 0, label: 'Start — Marine Parade' },
  { km: 4, label: 'Mauao base loop' },
  { km: 12, label: 'Mauao base loop' },
  { km: 21.1, label: 'Finish — Marine Parade' },
];
const mtm10kElevation: [number, number][] = [
  [0,2],[1,3],[2,4],[3,5],[3.5,8],[4,12],[4.5,10],
  [5,6],[6,4],[7,3],[8,4],[9,5],[10,2],
];
const mtm10kAnnotations = [
  { km: 0, label: 'Start — Marine Parade' },
  { km: 4, label: 'Mauao base loop' },
  { km: 10, label: 'Finish' },
];
const mtm5kElevation: [number, number][] = [
  [0,2],[1,3],[2,4],[3,5],[3.5,8],[4,12],[4.5,10],[5,4],
];
const mtm5kAnnotations = [
  { km: 0, label: 'Start' },
  { km: 4, label: 'Mauao base' },
  { km: 5, label: 'Finish' },
];

// ── Race registry ─────────────────────────────────────────────────────────
export const RACE_META: RaceMeta[] = [
  {
    slug: 'auckland-marathon',
    eyebrow: `${race.surface} · Established ${race.established} · ${race.editions} editions`,
    title: 'Auckland Marathon',
    location: race.location,
    courseFieldLabel: 'Distances',
    courseField: race.distances.join(' · '),
    nextEdition: race.nextDate,
    entryUrl: 'https://www.aucklandmarathon.co.nz',
    entryText: 'aucklandmarathon.co.nz',
    overviewRight: DISTANCE_OPTIONS[0].courseNote,
    surface: courseStats.surface,
    secondaryLabel: 'Certification',
    secondaryBody: courseStats.certified,
    averagesNote: 'Computed from every finish on record. 2020·21 editions cancelled.',
    distances: aucklandDistances,
  },
  {
    slug: 'rotorua-marathon',
    eyebrow: 'Road · Established 1967 · Lake Rotorua loop',
    title: 'Rotorua Marathon',
    location: 'Rotorua, Bay of Plenty',
    courseField: 'Lake Rotorua loop',
    nextEdition: '2 May 2027',
    entryUrl: 'https://www.rotoruamarathon.co.nz',
    entryText: 'rotoruamarathon.co.nz',
    overviewRight: 'Full loop of Lake Rotorua · sealed road · geothermal terrain',
    surface: 'Sealed road · flat to gently rolling',
    secondaryLabel: 'Character',
    secondaryBody: "One of NZ's oldest road marathons. The lake loop is renowned for its consistently flat profile, geothermal scenery, and reliable fast times. Altitude ~280 m asl.",
    averagesNote: 'Computed from every finish on record. 2014 includes walkers category.',
    decorativePills: ['10 km'],
    distances: [
      {
        key: 'rotorua-42', raceId: 'rotorua', matchDist: '42', distLabel: '42.2 km', profileLong: 'Marathon',
        stats: rotoruaStats, elevation: rotoruaElevation, annotations: rotoruaAnnotations,
        climb: '~55 m', descent: '~55 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '2:21:49', holder: 'Malcolm Hicks', nationality: 'NZL', club: '—', year: 2023, previous: '2:21:58 — Saeki Makino (JPN) 2017' },
        recordW: { time: '2:45:58', holder: 'Sally Gibbs', nationality: 'NZL', club: '—', year: 2014 },
      },
      {
        key: 'rotorua-21', raceId: 'rotorua-half', matchDist: '21', matchRace: 'rotorua-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: rotoruaHalfStats, elevation: rotoruaElevation, annotations: rotoruaAnnotations,
        climb: '~55 m', descent: '~55 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '1:06:07', holder: 'Michael Voss', nationality: 'NZL', club: '—', year: 2016 },
        recordW: { time: '1:15:34', holder: 'Lisa Robertson', nationality: 'NZL', club: '—', year: 2015 },
      },
    ],
  },
  {
    slug: 'christchurch-marathon',
    eyebrow: 'Road · Canterbury · Hagley Park loop',
    title: 'Christchurch Marathon',
    location: 'Christchurch, Canterbury',
    courseField: 'Hagley Park river loop',
    nextEdition: 'TBC 2027',
    entryUrl: 'https://www.christchurchmarathon.co.nz',
    entryText: 'christchurchmarathon.co.nz',
    overviewRight: 'Flat sealed road · Avon River corridor · central Christchurch',
    surface: 'Sealed road · flat to negligible gradient',
    secondaryLabel: 'Character',
    secondaryBody: "Canterbury's premier road marathon. One of NZ's flattest courses, following the Avon River through central Christchurch and Hagley Park. Altitude ~15 m asl.",
    distances: [
      {
        key: 'chc-42', raceId: 'chc', matchDist: '42', distLabel: '42.2 km', profileLong: 'Marathon',
        stats: chcStats, elevation: chcElevationFull, annotations: chcAnnotationsFull,
        climb: '~30 m', descent: '~30 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '2:16:28', holder: 'Samuel Wreford', nationality: 'NZL', club: '—', year: 2014, previous: '2:17:30 — Samuel Wreford (NZL) 2012' },
        recordW: { time: '2:38:14', holder: 'Becky Aitkenhead', nationality: 'NZL', club: '—', year: 2026, previous: '2:39:17 — Alice Mason (NZL) 2019' },
      },
      {
        key: 'chc-21', raceId: 'chc-half', matchDist: '21', matchRace: 'chc-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: chcHalfStats, elevation: chcElevation, annotations: chcAnnotations,
        climb: '~30 m', descent: '~30 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '1:03:15', holder: 'Toby Gualter', nationality: 'NZL', club: '—', year: 2026, previous: '1:03:30 — Toby Gualter (NZL) 2025' },
        recordW: { time: '1:12:28', holder: 'Lisa Weightman', nationality: 'AUS', club: '—', year: 2009, previous: '1:13:08 — Kate Smyth (AUS) 2007' },
      },
    ],
  },
  {
    slug: 'queenstown-marathon',
    eyebrow: 'Road · Otago · Queenstown–Arrowtown',
    title: 'Queenstown Marathon',
    location: 'Queenstown, Otago',
    courseField: 'Lakefront to Arrowtown',
    nextEdition: 'Nov 2026',
    entryUrl: 'https://www.queenstownmarathon.co.nz',
    entryText: 'queenstownmarathon.co.nz',
    overviewRight: 'Sealed road & trail · Queenstown lakefront and Arrowtown river loop',
    surface: 'Mixed sealed road and gravel trail · moderate undulation',
    secondaryLabel: 'Character',
    secondaryBody: "One of NZ's most scenic marathons. The course follows the Queenstown lakefront before climbing through vineyards and pine forest to Arrowtown, returning along the Arrow River. Altitude ~310–380 m asl.",
    distances: [
      {
        key: 'qt-42', raceId: 'qt', matchDist: '42', distLabel: '42.2 km', profileLong: 'Marathon',
        stats: qtStats, elevation: qtElevationFull, annotations: qtAnnotationsFull,
        climb: '~370 m', descent: '~370 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '2:25:02', holder: 'Jack Moody', nationality: 'NZL', club: '—', year: 2025, previous: '2:26:30 — Daniel Jones (NZL) 2022' },
        recordW: { time: '2:48:31', holder: 'Bara Styblova', nationality: 'CZE', club: '—', year: 2025, previous: '2:49:50 — Hannah Oldroyd (GBR) 2023' },
      },
      {
        key: 'qt-21', raceId: 'qt-half', matchDist: '21', matchRace: 'qt-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: qtHalfStats, elevation: qtElevationHalf, annotations: qtAnnotationsHalf,
        climb: '~370 m', descent: '~370 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '1:06:29', holder: 'Taonga Mbambo', nationality: 'NZL', club: '—', year: 2024, previous: '1:07:27 — Vajin Armstrong (NZL) 2017' },
        recordW: { time: '1:16:47', holder: 'Rebekah Greene', nationality: 'NZL', club: '—', year: 2023, previous: '1:17:14 — Becky Aitkenhead (NZL) 2025' },
      },
    ],
  },
  {
    slug: 'hawkes-bay-marathon',
    eyebrow: "Road · Hawke's Bay · Napier–Havelock North",
    title: "Hawke's Bay Marathon",
    location: "Napier, Hawke's Bay",
    courseField: 'Napier to Havelock North',
    nextEdition: 'Jun 2026',
    entryUrl: 'https://www.hawkesbaymarathon.co.nz',
    entryText: 'hawkesbaymarathon.co.nz',
    overviewRight: "Sealed road · Hawke's Bay wine and orchard country",
    surface: 'Sealed road · flat to gently rolling',
    secondaryLabel: 'Character',
    secondaryBody: "A fast, flat course through Hawke's Bay's famous wine and orchard country. Routes pass through Napier and Havelock North, with vineyard views and reliable spring weather. Altitude ~10–30 m asl.",
    distances: [
      {
        key: 'hb-42', raceId: 'hb', matchDist: '42', distLabel: '42.2 km', profileLong: 'Marathon',
        stats: hbStats, elevation: hbElevationFull, annotations: hbAnnotationsFull,
        climb: '~180 m', descent: '~180 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '2:24:02', holder: 'Michael Voss', nationality: 'NZL', club: '—', year: 2022, previous: '2:25:33 — Daniel Jones (NZL) 2021' },
        recordW: { time: '2:46:47', holder: 'Ingrid Cree', nationality: 'NZL', club: '—', year: 2024, previous: '2:47:42 — unknown (NZL) 2023' },
      },
      {
        key: 'hb-21', raceId: 'hb-half', matchDist: '21', matchRace: 'hb-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: hbHalfStats, elevation: hbElevationHalf, annotations: hbAnnotationsHalf,
        climb: '~180 m', descent: '~180 m', net: '0 m', netSub: 'loop course',
        recordM: { time: '1:05:34', holder: 'Cameron Graves', nationality: 'NZL', club: '—', year: 2025, previous: '1:06:23 — Cameron Graves (NZL) 2024' },
        recordW: { time: '1:14:43', holder: 'Camille French', nationality: 'NZL', club: '—', year: 2023, previous: '1:17:27 — Anneke Arlidge (NZL) 2025' },
      },
    ],
  },
  {
    slug: 'waterfront-half-marathon',
    eyebrow: 'Road · Auckland · Waterfront',
    title: 'Waterfront Half Marathon',
    location: 'Auckland',
    courseField: 'Waterfront out-and-back',
    nextEdition: '2027',
    entryUrl: 'https://waterfront.werun.nz/',
    entryText: 'waterfront.werun.nz',
    overviewRight: 'Sealed road · Auckland waterfront & harbour',
    surface: 'Sealed road · flat waterfront promenade',
    secondaryLabel: 'Character',
    secondaryBody: "A fast, flat out-and-back course along Auckland's iconic harbour waterfront. One of New Zealand's fastest half marathon courses, run at sea level with the city skyline as a backdrop.",
    distances: [
      {
        key: 'wf-half', raceId: 'wf-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: wfHalfStats, elevation: wfHalfElevation, annotations: wfHalfAnnotations,
        climb: '~30 m', descent: '~30 m', net: '0 m', netSub: 'out-and-back',
        secondaryBody: "A fast, flat out-and-back course along Auckland's iconic harbour waterfront. One of New Zealand's fastest half marathon courses, run at sea level with the city skyline as a backdrop.",
        recordM: { time: '1:06:56', holder: 'Malcolm Hicks', nationality: 'NZL', club: '—', year: 2023, previous: '1:07:34 — Michael Voss (NZL) 2019' },
        recordW: { time: '1:14:37', holder: "Lydia O'Donnell", nationality: 'NZL', club: '—', year: 2019 },
      },
      {
        key: 'wf-10k', raceId: 'wf-10k', matchRace: 'wf-10k', distLabel: '10 km', profileLong: '10 km',
        stats: wf10kStats, elevation: wf10kElevation, annotations: wf10kAnnotations,
        climb: '~15 m', descent: '~15 m', net: '0 m', netSub: 'out-and-back',
        secondaryBody: "A fast, flat out-and-back 10 km course along Auckland's iconic harbour waterfront. Run at sea level with views of the harbour and city skyline.",
        recordM: { time: '32:32', holder: 'Matthew Arnold', nationality: 'NZL', club: '—', year: 2024 },
        recordW: { time: '35:49', holder: 'Katrina Andrew', nationality: 'NZL', club: '—', year: 2025 },
      },
    ],
  },
  {
    slug: 'devonport-half-marathon',
    eyebrow: 'Road · Auckland · Devonport',
    title: 'Devonport Half Marathon',
    location: 'Devonport, Auckland',
    courseField: '2-lap loop',
    nextEdition: '27 Sep 2026',
    entryUrl: 'https://devonport.werun.nz/',
    entryText: 'devonport.werun.nz',
    overviewRight: 'Mixed · road, trail & seawall · Devonport peninsula',
    surface: 'Mixed · sealed road, trail path, shell seawall',
    secondaryLabel: 'Character',
    secondaryBody: 'Two laps of the Devonport peninsula loop, finishing with a short out-and-back. The course climbs North Head twice, rewarding runners with panoramic views of Rangitoto Island and the Auckland city skyline. One of the most scenic — and most challenging — half marathons in Auckland.',
    distances: [
      {
        key: 'dev-half', raceId: 'dev-half', distLabel: '21.1 km', profileLong: 'Half marathon', courseField: '2-lap loop',
        stats: devHalfStats, elevation: devHalfElevation, annotations: devHalfAnnotations,
        climb: '~170 m', descent: '~170 m', net: '0 m', netSub: 'loop to start',
        secondaryBody: 'Two laps of the Devonport peninsula loop, finishing with a short out-and-back. The course climbs North Head twice, rewarding runners with panoramic views of Rangitoto Island and the Auckland city skyline. One of the most scenic — and most challenging — half marathons in Auckland.',
        recordM: { time: '1:10:59', holder: 'Fabe Downs', nationality: 'NZL', club: '—', year: 2020 },
        recordW: { time: '1:21:27', holder: 'Hannah Oldroyd', nationality: 'NZL', club: '—', year: 2018 },
      },
      {
        key: 'dev-10k', raceId: 'dev-10k', matchRace: 'dev-10k', distLabel: '10 km', profileLong: '10 km', courseField: 'Peninsula loop',
        stats: dev10kStats, elevation: dev10kElevation, annotations: dev10kAnnotations,
        climb: '~85 m', descent: '~85 m', net: '0 m', netSub: 'loop to start',
        secondaryBody: 'A single loop tour of the eastern Devonport peninsula. Mostly flat with a turnaround at Narrow Neck Beach before the challenging climb up North Head, with views of Rangitoto Island and the city skyline on the descent.',
        recordM: { time: '32:10', holder: 'Andre Waring', nationality: 'NZL', club: '—', year: 2018 },
        recordW: { time: '38:31', holder: 'Tara la Grange', nationality: 'NZL', club: '—', year: 2011 },
      },
    ],
  },
  {
    slug: 'coatesville-half-marathon',
    eyebrow: 'Road · Auckland · Coatesville',
    title: 'Coatesville Half Marathon',
    location: 'Coatesville, Rodney',
    courseField: 'Rural loop',
    nextEdition: '2027',
    entryUrl: 'https://coatesville.werun.nz/',
    entryText: 'coatesville.werun.nz',
    overviewRight: 'Road & trail · Coatesville rural loop',
    surface: 'Sealed road and gravel trail',
    secondaryLabel: 'Character',
    secondaryBody: "A challenging rural loop through the Coatesville countryside north of Auckland. Multiple significant climbs reward runners with sweeping views across the Rodney farmland. One of Auckland's hilliest and most scenic half marathons, held annually since 2011.",
    distances: [
      {
        key: 'coast-half', raceId: 'coast-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: coastStats, elevation: coastElevation, annotations: coastAnnotations,
        climb: '~250 m', descent: '~250 m', net: '0 m', netSub: 'loop to start',
        recordM: { time: '1:13:31', holder: 'Jonathan Jackson', nationality: 'NZL', club: '—', year: 2019 },
        recordW: { time: '1:20:10', holder: 'Katrina Andrew', nationality: 'NZL', club: '—', year: 2024 },
      },
    ],
  },
  {
    slug: 'omaha-half-marathon',
    eyebrow: 'Road · Auckland · Omaha Beach',
    title: 'Omaha Half Marathon',
    location: 'Omaha Beach, Rodney',
    courseField: 'Out & back',
    nextEdition: '2026',
    entryUrl: 'https://omaha.werun.nz/',
    entryText: 'omaha.werun.nz',
    overviewRight: 'Road · Omaha Beach coastal out & back',
    surface: 'Sealed road · flat coastal terrain',
    secondaryLabel: 'Character',
    secondaryBody: 'A fast out-and-back along the Omaha Beach coastline north of Auckland. One of the flattest and quickest half marathons in the Auckland region, drawing fast times and strong fields each summer. The exposed beachside setting can bring sea breeze but rewards runners with stunning coastal scenery.',
    distances: [
      {
        key: 'omaha-half', raceId: 'omaha-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: omahaHalfStats, elevation: omahaHalfElevation, annotations: omahaHalfAnnotations,
        climb: '~40 m', descent: '~40 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A fast out-and-back along the Omaha Beach coastline north of Auckland. One of the flattest and quickest half marathons in the Auckland region, drawing fast times and strong fields each summer. The exposed beachside setting can bring sea breeze but rewards runners with stunning coastal scenery.',
        recordM: { time: '1:12:43', holder: 'Rodwyn Isaacs', nationality: 'NZL', club: '—', year: 2024 },
        recordW: { time: '1:21:20', holder: 'Salome De Barthez', nationality: 'NZL', club: '—', year: 2024 },
      },
      {
        key: 'omaha-10k', raceId: 'omaha-10k', matchRace: 'omaha-10k', distLabel: '10 km', profileLong: '10 km',
        stats: omaha10kStats, elevation: omaha10kElevation, annotations: omaha10kAnnotations,
        climb: '~20 m', descent: '~20 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A flat out-and-back along Omaha Beach, ideal for chasing 10 km personal bests. The sealed road course hugs the coastline north of Auckland, with the turnaround at the halfway mark and a tailwind finish on good days.',
        recordM: { time: '34:49', holder: 'Marek Schirnack', nationality: 'NZL', club: '—', year: 2021 },
        recordW: { time: '38:59', holder: 'Tayla Cox', nationality: 'NZL', club: '—', year: 2021 },
      },
    ],
  },
  {
    slug: 'maraetai-half-marathon',
    eyebrow: 'Road · Auckland · Maraetai Beach',
    title: 'Maraetai Half Marathon',
    location: 'Maraetai Beach, Auckland',
    courseField: 'Out & back',
    nextEdition: '2027',
    entryUrl: 'https://maraetai.werun.nz/',
    entryText: 'maraetai.werun.nz',
    overviewRight: 'Road · Maraetai Beach coastal out & back',
    surface: 'Sealed road · flat coastal terrain',
    secondaryLabel: 'Character',
    secondaryBody: 'A flat out-and-back along the Maraetai Beach coastline southeast of Auckland. One of the fastest half marathons in the Auckland region, run along the Pohutukawa Coast with views across the Hauraki Gulf. Part of the Auckland Half Marathon Series, held annually since 2019.',
    distances: [
      {
        key: 'maraetai-half', raceId: 'maraetai-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: maraetaiHalfStats, elevation: maraetaiHalfElevation, annotations: maraetaiHalfAnnotations,
        climb: '~35 m', descent: '~35 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A flat out-and-back along the Maraetai Beach coastline southeast of Auckland. One of the fastest half marathons in the Auckland region, run along the Pohutukawa Coast with views across the Hauraki Gulf. Part of the Auckland Half Marathon Series, held annually since 2019.',
        recordM: { time: '1:09:26', holder: 'Michael Voss', nationality: 'NZL', club: '—', year: 2019 },
        recordW: { time: '1:17:02', holder: 'Lisa Cross', nationality: 'NZL', club: '—', year: 2024 },
      },
      {
        key: 'maraetai-10k', raceId: 'maraetai-10k', matchRace: 'maraetai-10k', distLabel: '10 km', profileLong: '10 km',
        stats: maraetai10kStats, elevation: maraetai10kElevation, annotations: maraetai10kAnnotations,
        climb: '~18 m', descent: '~18 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A fast out-and-back along the Maraetai Beach foreshore, ideal for 10 km personal bests. The sealed coastal road hugs the Pohutukawa Coast southeast of Auckland, with the turnaround at the halfway mark and stunning Hauraki Gulf scenery throughout.',
        recordM: { time: '33:26', holder: 'Ethan Verner', nationality: 'NZL', club: '—', year: 2021 },
        recordW: { time: '38:39', holder: 'Krystyna Knight', nationality: 'NZL', club: '—', year: 2025 },
      },
    ],
  },
  {
    slug: 'kerikeri-half-marathon',
    eyebrow: 'Road · Northland · Kerikeri',
    title: 'Kerikeri Half Marathon',
    location: 'Kerikeri, Northland',
    courseField: 'Rural loop',
    nextEdition: '2026',
    entryUrl: 'https://www.kerikerimarathon.co.nz/',
    entryText: 'kerikerimarathon.co.nz',
    overviewRight: 'Road · Kerikeri rural loop',
    surface: 'Sealed road',
    secondaryLabel: 'Character',
    secondaryBody: "A challenging rural loop through the Bay of Islands countryside around Kerikeri. The course features rolling hills and significant climbs through the Northland farmland, rewarding runners with sweeping views across one of New Zealand's most historic regions. Held annually since 2003, it is one of Northland's premier running events.",
    distances: [
      {
        key: 'kerikeri-half', raceId: 'kerikeri-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: kerikeriStats, elevation: kerikeriElevation, annotations: kerikeriAnnotations,
        climb: '~300 m', descent: '~300 m', net: '0 m', netSub: 'loop to start',
        recordM: { time: '1:04:58', holder: 'Craig Lautenslager', nationality: 'NZL', club: '—', year: 2017 },
        recordW: { time: '1:15:58', holder: 'Annika Pfitzinger', nationality: 'NZL', club: '—', year: 2017 },
      },
    ],
  },
  {
    slug: 'wellington-marathon',
    eyebrow: 'Road · Wellington · Waterfront',
    title: 'Wellington Marathon',
    location: 'Wellington, NZ',
    courseField: 'Flat waterfront circuit',
    nextEdition: 'Jun 2026',
    entryUrl: 'https://www.wellingtonmarathon.co.nz',
    entryText: 'wellingtonmarathon.co.nz',
    overviewRight: 'Road · Wellington waterfront',
    surface: 'Sealed road · Wellington waterfront promenade',
    secondaryLabel: 'Character',
    secondaryBody: "One of New Zealand's fastest road races, the Wellington Marathon runs along the city's iconic waterfront. The predominantly flat course hugs the harbour from Westpac Stadium through the CBD, along Oriental Parade, and back — ideal for personal bests. The half marathon has been held since 1996; the full marathon joined in 2005.",
    distances: [
      {
        key: 'wellington-42', raceId: 'wellington-mar', matchDist: '42', distLabel: '42.2 km', profileLong: 'Marathon',
        stats: wellingtonMarStats, elevation: wellingtonElevationFull, annotations: wellingtonAnnotationsFull,
        climb: '~65 m', descent: '~65 m', net: '0 m', netSub: 'point to point',
        recordM: { time: '2:22:43', holder: 'Dan Lowry', nationality: 'NZL', club: '—', year: 2017 },
        recordW: { time: '2:48:19', holder: 'Ingrid Cree', nationality: 'NZL', club: '—', year: 2023 },
      },
      {
        key: 'wellington-21', raceId: 'wellington-half', matchDist: '21', matchRace: 'wellington-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: wellingtonHalfStats, elevation: wellingtonElevationHalf, annotations: wellingtonAnnotationsHalf,
        climb: '~65 m', descent: '~65 m', net: '0 m', netSub: 'point to point',
        recordM: { time: '1:04:32', holder: 'Toby Gualter', nationality: 'NZL', club: '—', year: 2025 },
        recordW: { time: '1:13:37', holder: 'Lisa Cross', nationality: 'NZL', club: '—', year: 2025 },
      },
    ],
  },
  {
    slug: 'onehunga-half-marathon',
    eyebrow: 'Road · Auckland · Onehunga',
    title: 'Onehunga Half Marathon',
    location: 'Onehunga, Auckland',
    courseField: 'Out & back',
    nextEdition: '2026',
    entryUrl: 'https://run21.co.nz/',
    entryText: 'run21.co.nz',
    overviewRight: 'Road · Onehunga Harbour foreshore out & back',
    surface: 'Sealed road · flat harbour foreshore',
    secondaryLabel: 'Character',
    secondaryBody: 'A flat out-and-back along the Onehunga foreshore and Manukau Harbour coastline in South Auckland. One of the Run21 Auckland series events, offering fast conditions along the waterfront with views across the Manukau Harbour. Run annually since 2021.',
    distances: [
      {
        key: 'onehunga-half', raceId: 'onehunga-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: onehungaHalfStats, elevation: onehungaHalfElevation, annotations: onehungaHalfAnnotations,
        climb: '~30 m', descent: '~30 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A flat out-and-back along the Onehunga foreshore and Manukau Harbour coastline in South Auckland. One of the Run21 Auckland series events, offering fast conditions along the waterfront with views across the Manukau Harbour. Run annually since 2021.',
        recordM: { time: '1:13:07', holder: 'David Atkinson', nationality: 'NZL', club: '—', year: 2025 },
        recordW: { time: '1:24:02', holder: 'Jaye Atkin', nationality: 'NZL', club: '—', year: 2023 },
      },
      {
        key: 'onehunga-10k', raceId: 'onehunga-10k', distLabel: '10 km', profileLong: '10 km',
        stats: onehunga10kStats, elevation: onehunga10kElevation, annotations: onehunga10kAnnotations,
        climb: '~15 m', descent: '~15 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A fast 10 km out-and-back along the Onehunga foreshore, ideal for personal bests. The flat sealed route follows the Manukau Harbour edge with the turnaround at the halfway mark.',
        recordM: { time: '33:30', holder: 'Patrich Bravo', nationality: 'NZL', club: '—', year: 2023 },
        recordW: { time: '40:25', holder: 'Katie Curd', nationality: 'NZL', club: '—', year: 2023 },
      },
    ],
  },
  {
    slug: 'orewa-half-marathon',
    eyebrow: 'Road · Auckland · Orewa',
    title: 'Orewa Half Marathon',
    location: 'Orewa, Auckland',
    courseField: 'Out & back',
    nextEdition: '2026',
    entryUrl: 'https://run21.co.nz/',
    entryText: 'run21.co.nz',
    overviewRight: 'Road · Orewa Beach coastal out & back',
    surface: 'Sealed road · flat coastal terrain',
    secondaryLabel: 'Character',
    secondaryBody: 'A flat out-and-back along the Orewa Beach foreshore on the Hibiscus Coast north of Auckland. One of the fastest half marathons in the Run21 Auckland series, run along the estuary with views of the Orewa River and Hauraki Gulf. Held annually since 2021.',
    distances: [
      {
        key: 'orewa-half', raceId: 'orewa-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: orewaHalfStats, elevation: orewaHalfElevation, annotations: orewaHalfAnnotations,
        climb: '~25 m', descent: '~25 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A flat out-and-back along the Orewa Beach foreshore on the Hibiscus Coast north of Auckland. One of the fastest half marathons in the Run21 Auckland series, run along the estuary with views of the Orewa River and Hauraki Gulf. Held annually since 2021.',
        recordM: { time: '1:11:24', holder: 'Jake Hendrickx', nationality: 'NZL', club: '—', year: 2022 },
        recordW: { time: '1:13:05', holder: 'Laura Roberts', nationality: 'NZL', club: '—', year: 2022 },
      },
      {
        key: 'orewa-10k', raceId: 'orewa-10k', distLabel: '10 km', profileLong: '10 km',
        stats: orewa10kStats, elevation: orewa10kElevation, annotations: orewa10kAnnotations,
        climb: '~12 m', descent: '~12 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A fast 10 km out-and-back along the Orewa Beach foreshore, ideal for personal bests. The flat sealed coastal road follows the beachfront with the turnaround at the halfway mark.',
        recordM: { time: '32:37', holder: 'Rodwyn Isaacs', nationality: 'NZL', club: '—', year: 2023 },
        recordW: { time: '41:08', holder: 'Paula Sievers', nationality: 'NZL', club: '—', year: 2025 },
      },
    ],
  },
  {
    slug: 'tamaki-river-half-marathon',
    eyebrow: 'Road · Auckland · Panmure',
    title: 'Tamaki River Half Marathon',
    location: 'Panmure, Auckland',
    courseField: 'Out & back',
    nextEdition: '2026',
    entryUrl: 'https://run21.co.nz/',
    entryText: 'run21.co.nz',
    overviewRight: 'Road · Tamaki River out & back',
    surface: 'Sealed road · flat riverside path',
    secondaryLabel: 'Character',
    secondaryBody: 'A flat out-and-back along the Tamaki River in East Auckland, running through Panmure and along the waterway shared pathway. One of the Run21 Auckland series events, offering a fast and scenic riverside route with views of the Tamaki estuary. Held annually since 2021.',
    distances: [
      {
        key: 'tamaki-half', raceId: 'tamaki-half', distLabel: '21.1 km', profileLong: 'Half marathon',
        stats: tamakiHalfStats, elevation: tamakiHalfElevation, annotations: tamakiHalfAnnotations,
        climb: '~20 m', descent: '~20 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A flat out-and-back along the Tamaki River in East Auckland, running through Panmure and along the waterway shared pathway. One of the Run21 Auckland series events, offering a fast and scenic riverside route with views of the Tamaki estuary. Held annually since 2021.',
        recordM: { time: '1:10:54', holder: 'Jake Hendrickx', nationality: 'NZL', club: '—', year: 2022 },
        recordW: { time: '1:27:54', holder: 'Laura Holyoake', nationality: 'NZL', club: '—', year: 2024 },
      },
      {
        key: 'tamaki-10k', raceId: 'tamaki-10k', distLabel: '10 km', profileLong: '10 km',
        stats: tamaki10kStats, elevation: tamaki10kElevation, annotations: tamaki10kAnnotations,
        climb: '~10 m', descent: '~10 m', net: '0 m', netSub: 'out & back',
        secondaryBody: 'A fast 10 km out-and-back along the Tamaki River shared path, ideal for personal bests. The flat sealed riverside route runs through Panmure with the turnaround at the halfway mark.',
        recordM: { time: '34:55', holder: 'Clinton Loveday', nationality: 'NZL', club: '—', year: 2025 },
        recordW: { time: '41:33', holder: 'Katie Curd', nationality: 'NZL', club: '—', year: 2023 },
      },
    ],
  },
  {
    slug: 'mount-maunganui-half-marathon',
    eyebrow: 'Road · Bay of Plenty · Mount Maunganui',
    title: 'Mount Maunganui Half Marathon',
    titleClamp: 'clamp(32px,5vw,64px)',
    location: 'Mount Maunganui, Bay of Plenty',
    courseField: 'Beach & Mauao loop',
    nextEdition: '2026',
    entryUrl: 'https://www.mountmarathon.co.nz/',
    entryText: 'mountmarathon.co.nz',
    overviewRight: 'Road · Marine Parade & Mauao base · Mount Maunganui',
    surface: 'Sealed road · flat coastal path',
    secondaryLabel: 'Character',
    secondaryBody: "A fast, flat course along Marine Parade and around the base of Mauao (Mount Maunganui). Starting and finishing at the beach, the route follows the iconic waterfront boulevard before looping around the ancient volcanic rock, delivering dramatic views of Tauranga Harbour and the Pacific Ocean. One of New Zealand's most scenic and spectator-friendly half marathons.",
    distances: [
      {
        key: 'mtm-half', raceId: 'mtm-half', distLabel: '21.1 km', profileLong: 'Half marathon', courseField: 'Beach & Mauao loop',
        stats: mtmHalfStats, elevation: mtmHalfElevation, annotations: mtmHalfAnnotations,
        climb: '~40 m', descent: '~40 m', net: '0 m', netSub: 'point to point',
        secondaryBody: "A fast, flat course along Marine Parade and around the base of Mauao (Mount Maunganui). Starting and finishing at the beach, the route follows the iconic waterfront boulevard before looping around the ancient volcanic rock, delivering dramatic views of Tauranga Harbour and the Pacific Ocean. One of New Zealand's most scenic and spectator-friendly half marathons.",
        recordM: { time: '1:05:52', holder: 'Matthew Baxter', nationality: 'NZL', club: '—', year: 2020 },
        recordW: { time: '1:16:44', holder: "Lydia O'Donnell", nationality: 'NZL', club: '—', year: 2023 },
      },
      {
        key: 'mtm-10k', raceId: 'mtm-10k', matchRace: 'mtm-10k', distLabel: '10 km', profileLong: '10 km', courseField: 'Mauao loop',
        stats: mtm10kStats, elevation: mtm10kElevation, annotations: mtm10kAnnotations,
        climb: '~25 m', descent: '~25 m', net: '0 m', netSub: 'point to point',
        secondaryBody: "A flat loop along the Mount Maunganui waterfront and around the base of Mauao. The course hugs Marine Parade before rounding the iconic volcanic mount, offering sweeping harbour and ocean views throughout. Fast and beginner-friendly, it is one of the Bay of Plenty's most popular running events.",
        recordM: { time: '32:40', holder: 'Max Green', nationality: 'NZL', club: '—', year: 2025 },
        recordW: { time: '37:19', holder: 'Esther Keown', nationality: 'NZL', club: '—', year: 2022 },
      },
      {
        key: 'mtm-5k', raceId: 'mtm-5k', matchRace: 'mtm-5k', distLabel: '5 km', profileLong: '5 km', courseField: 'Mauao base',
        stats: mtm5kStats, elevation: mtm5kElevation, annotations: mtm5kAnnotations,
        climb: '~15 m', descent: '~15 m', net: '0 m', netSub: 'point to point',
        secondaryBody: 'A short, flat course along the waterfront, partly rounding the base of Mauao. Ideal for first-timers and families, the 5 km showcases the stunning coastal scenery of Mount Maunganui with a fast, runnable surface throughout.',
        recordM: { time: '17:33', holder: 'William Leroy', nationality: 'NZL', club: '—', year: 2025 },
        recordW: { time: '20:02', holder: 'Georgia Stanton', nationality: 'NZL', club: '—', year: 2025 },
      },
    ],
  },
  {
    // No elevation trace anywhere below, deliberately: the existing ones are
    // hand-estimated and carry that caveat, and inventing one for a course
    // nobody here has measured would be fabrication. RaceProfile omits the
    // course-profile chart and the climb/descent figures when it is absent.
    slug: 'whanganui-three-bridges-marathon',
    eyebrow: 'Road · Manawatū-Whanganui · Whanganui',
    title: 'Whanganui Three Bridges Marathon',
    titleClamp: 'clamp(28px,5vw,64px)',
    location: 'Whanganui, Manawatū-Whanganui',
    courseField: 'Riverbank loop · three bridges',
    nextEdition: '2026',
    entryUrl: 'https://whanganuithreebridges.co.nz/',
    overviewRight: 'Road · Whanganui River banks · start and finish at Kowhai Park',
    surface: 'Sealed road edge, footpaths, grass and walking track · generally flat',
    secondaryLabel: 'Character',
    secondaryBody: "Run along the banks of the Whanganui River and crossing three of the city's bridges, the course is a multi-lap loop starting and finishing at Kowhai Park — four laps for the marathon, two for the half, one for the quarter. Terrain varies from sealed road edge to footpaths, grass and walking tracks, and is generally flat. The marathon and half marathon courses are AIMS certified, and the marathon forms part of the AbbottWMM Wanda Age Group World Rankings qualifying series. The event is organised by the Wanganui Harrier Club, which celebrated its centenary in June 2025.",
    distances: [
      {
        key: 'whanganui-mar', raceId: 'whanganui-mar', matchRace: 'whanganui-mar',
        distLabel: '42.2 km', profileLong: 'Marathon', stats: whanganuiMarStats,
        courseField: 'Four laps · riverbank loop',
      },
      {
        key: 'whanganui-half', raceId: 'whanganui-half', matchRace: 'whanganui-half',
        distLabel: '21.1 km', profileLong: 'Half marathon', stats: whanganuiHalfStats,
        courseField: 'Two laps · riverbank loop',
      },
      {
        // 10.55 km — one lap of the four-lap marathon course. Published as
        // "10K" in some years and "105K" in others; see src/data/roadEvents.mjs.
        key: 'whanganui-quarter', raceId: 'whanganui-quarter', matchRace: 'whanganui-quarter',
        distLabel: '10.5 km', profileLong: 'Quarter marathon', stats: whanganuiQuarterStats,
        courseField: 'One lap · riverbank loop',
      },
      {
        key: 'whanganui-5k', raceId: 'whanganui-5k', matchRace: 'whanganui-5k',
        distLabel: '5 km', profileLong: '5 km', stats: whanganui5kStats,
        courseField: 'Riverbank · out and back',
      },
    ],
  },
  {
    // No elevation trace, for the same reason as Whanganui: the existing ones
    // are hand-estimated and say so, and this course has not been measured
    // here. RaceProfile renders the section without a chart.
    slug: 'saint-clair-vineyard-half-marathon',
    eyebrow: 'Road · Marlborough · Blenheim',
    title: 'Saint Clair Vineyard Half Marathon',
    titleClamp: 'clamp(28px,5vw,64px)',
    location: 'Blenheim, Marlborough',
    courseField: 'Wairau Valley · finish at Saint Clair Vineyard Kitchen',
    // The 2026 edition is already in the archive; early May puts the next one
    // in 2027.
    nextEdition: '2027',
    entryUrl: 'https://vineyardhalf.com/',
    overviewRight: 'Vineyard rows, stop banks and river tracks · Wairau Valley · Blenheim',
    surface: 'Vineyard rows, stop banks and river tracks · around 4 km sealed road · mostly flat',
    secondaryLabel: 'Character',
    secondaryBody: 'Set in the Wairau Valley, the course starts and finishes at the Saint Clair Vineyard Kitchen on Selmes Rd, just outside Blenheim. The 21.1 km course winds between rows of vineyards, up and over short stop banks and alongside the Wairau River, with the Wither Hills to the south and the Richmond Ranges to the north. The terrain is mostly flat, with around 4 km on sealed road. The 12 km course begins separately at The Vines Village on Rapaura Rd and finishes at the same place. The event is held in early May, with the vineyards in autumn colour.',
    distances: [
      {
        key: 'saintclair-half', raceId: 'saintclair-half', matchRace: 'saintclair-half',
        distLabel: '21.1 km', profileLong: 'Half marathon', stats: saintClairHalfStats,
        courseField: 'Loop from the Vineyard Kitchen',
      },
      {
        // A separate point-to-point route, not a subset of the half — which is
        // why the same-runner distance check that reclassified Whanganui's
        // quarter has no purchase here: it would be comparing two courses, not
        // two labels for one.
        key: 'saintclair-12k', raceId: 'saintclair-12k', matchRace: 'saintclair-12k',
        distLabel: '12 km', profileLong: '12 km', stats: saintClair12kStats,
        courseField: 'Point to point · The Vines Village to the Vineyard Kitchen',
      },
    ],
  },
  {
    // No elevation trace: the existing ones are hand-estimated and say so, and
    // this course has not been measured here.
    slug: 'taupo-marathon',
    eyebrow: 'Road · Waikato · Taupō',
    title: 'Taupō Marathon',
    location: 'Taupō, Waikato',
    courseField: 'Lakefront · Great Lake Pathway',
    nextEdition: '2026',
    entryUrl: 'https://www.taupomarathon.co.nz/',
    overviewRight: 'Road and pathway · Lake Taupō shoreline · start and finish at Tongariro Domain',
    surface: 'Sealed road and shared pathway · roughly 10 km of each lap on the Great Lake Pathway',
    secondaryLabel: 'Character',
    secondaryBody: 'The marathon starts on Tongariro Street and finishes at the Tongariro Domain, home of the Great Lake Centre. From the start it runs down Tongariro Street and Roberts Street before beginning the first of two laps of the half marathon course, which has run for 33 years, with the addition of a loop through the Ngāroto Estate subdivision. Each lap heads out to the airport roundabout, turns right onto SH1 and continues to 5 Mile Bay, returning along roughly 10 km of the Great Lake Pathway with views across the lake to the mountains beyond. Runners turn at Te Ātea – Tapuaeharuru to begin the second lap, returning to the Tongariro Domain to finish.',
    distances: [
      {
        // Two laps of the half course, plus a loop through Ngāroto Estate.
        key: 'taupo-mar', raceId: 'taupo-mar', matchRace: 'taupo-mar',
        distLabel: '42.2 km', profileLong: 'Marathon', stats: taupoMarStats,
        courseField: 'Two laps · Tongariro Domain finish',
      },
      {
        // 2023 and 2025 are recovered from the organiser's all-distance PDFs;
        // the CSVs shipped for those years are copies of the marathon file.
        key: 'taupo-half', raceId: 'taupo-half', matchRace: 'taupo-half',
        distLabel: '21.1 km', profileLong: 'Half marathon', stats: taupoHalfStats,
        courseField: 'One lap · airport roundabout to 5 Mile Bay',
      },
      {
        key: 'taupo-10k', raceId: 'taupo-10k', matchRace: 'taupo-10k',
        distLabel: '10 km', profileLong: '10 km', stats: taupo10kStats,
        courseField: 'Lakefront · Great Lake Pathway',
      },
      {
        key: 'taupo-5k', raceId: 'taupo-5k', matchRace: 'taupo-5k',
        distLabel: '5 km', profileLong: '5 km', stats: taupo5kStats,
        courseField: 'Lakefront · Great Lake Pathway',
      },
    ],
  },
];

const RACE_META_BY_SLUG: Record<string, RaceMeta> = Object.fromEntries(
  RACE_META.map((m) => [m.slug, m]),
);

export function getRaceMeta(slug: string | undefined): RaceMeta | undefined {
  if (!slug) return undefined;
  return RACE_META_BY_SLUG[slug];
}
