import { toSec } from './logsData';
import type { Result } from './logsData';

export interface ResultRow extends Result {
  bib: number;
}

export interface YearStat {
  year: number;
  finishers: number;
  avg: number;
  avgMen: number;
  avgWomen: number;
  winnerM: number;
  winnerW: number;
  top10M: number;
  top10W: number;
}

export const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;
export const ROTORUA_YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

export const yearStats: YearStat[] = [
  { year: 2014, finishers: 2306, avg: 15720, avgMen: 15467, avgWomen: 17176, winnerM:  8858, winnerW: 10062, top10M:  9202, top10W: 11092 },
  { year: 2015, finishers: 1507, avg: 15318, avgMen: 15186, avgWomen: 16760, winnerM:  8821, winnerW:  9755, top10M:  9118, top10W: 10566 },
  { year: 2016, finishers: 1630, avg: 15504, avgMen: 15402, avgWomen: 17056, winnerM:  8436, winnerW: 10065, top10M:  9120, top10W: 10760 },
  { year: 2017, finishers: 1565, avg: 15528, avgMen: 15590, avgWomen: 17407, winnerM:  8654, winnerW: 10451, top10M:  9376, top10W: 11188 },
  { year: 2018, finishers: 1653, avg: 15445, avgMen: 15360, avgWomen: 17227, winnerM:  8653, winnerW: 10111, top10M:  9002, top10W: 11151 },
  { year: 2019, finishers: 1650, avg: 15552, avgMen: 15473, avgWomen: 17188, winnerM:  8372, winnerW: 10247, top10M:  8989, top10W: 11373 },
  { year: 2020, finishers: 1619, avg: 15174, avgMen: 15192, avgWomen: 17212, winnerM:  8517, winnerW:  9812, top10M:  9257, top10W: 10730 },
  { year: 2021, finishers:  870, avg: 15813, avgMen: 15908, avgWomen: 17756, winnerM:  8400, winnerW: 10244, top10M:  9466, top10W: 11662 },
  { year: 2022, finishers: 1299, avg: 14978, avgMen: 15018, avgWomen: 16880, winnerM:  8512, winnerW: 10170, top10M:  8967, top10W: 10827 },
  { year: 2023, finishers: 1765, avg: 14820, avgMen: 14930, avgWomen: 16573, winnerM:  8589, winnerW:  9860, top10M:  9139, top10W: 10733 },
  { year: 2024, finishers: 2439, avg: 14839, avgMen: 14810, avgWomen: 16309, winnerM:  8509, winnerW:  9691, top10M:  8818, top10W: 10350 },
  { year: 2025, finishers: 2775, avg: 15082, avgMen: 15110, avgWomen: 16436, winnerM:  8395, winnerW:  9490, top10M:  8771, top10W: 10663 },
];

export const halfStats: YearStat[] = [
  { year: 2014, finishers: 7125, avg:  8259, avgMen:  7880, avgWomen:  9202, winnerM:  4107, winnerW:  4550, top10M:  4309, top10W:  4869 },
  { year: 2015, finishers: 5009, avg:  8117, avgMen:  7816, avgWomen:  8974, winnerM:  4110, winnerW:  4567, top10M:  4413, top10W:  4941 },
  { year: 2016, finishers: 5673, avg:  8025, avgMen:  7782, avgWomen:  9078, winnerM:  4088, winnerW:  4602, top10M:  4321, top10W:  5070 },
  { year: 2017, finishers: 5706, avg:  8116, avgMen:  7839, avgWomen:  9208, winnerM:  4038, winnerW:  4548, top10M:  4259, top10W:  5179 },
  { year: 2018, finishers: 5572, avg:  8151, avgMen:  7977, avgWomen:  9201, winnerM:  4033, winnerW:  4587, top10M:  4204, top10W:  4946 },
  { year: 2019, finishers: 5204, avg:  7840, avgMen:  7703, avgWomen:  8837, winnerM:  3949, winnerW:  4701, top10M:  4149, top10W:  5190 },
  { year: 2020, finishers: 4628, avg:  7842, avgMen:  7715, avgWomen:  8905, winnerM:  3923, winnerW:  4425, top10M:  4347, top10W:  4998 },
  { year: 2021, finishers: 2492, avg:  7951, avgMen:  7851, avgWomen:  9091, winnerM:  4043, winnerW:  4617, top10M:  4359, top10W:  5303 },
  { year: 2022, finishers: 3988, avg:  7731, avgMen:  7614, avgWomen:  8813, winnerM:  3987, winnerW:  4615, top10M:  4205, top10W:  5004 },
  { year: 2023, finishers: 4293, avg:  7726, avgMen:  7575, avgWomen:  8696, winnerM:  3877, winnerW:  4592, top10M:  4086, top10W:  4965 },
  { year: 2024, finishers: 6161, avg:  7758, avgMen:  7655, avgWomen:  8720, winnerM:  3994, winnerW:  4645, top10M:  4137, top10W:  4932 },
  { year: 2025, finishers: 6614, avg:  7872, avgMen:  7721, avgWomen:  8785, winnerM:  3924, winnerW:  4528, top10M:  4179, top10W:  4844 },
];

const marathonCache: Record<number, ResultRow[]> = {};
const marathonInflight: Record<number, Promise<ResultRow[]>> = {};
const halfCache: Record<number, ResultRow[]> = {};
const halfInflight: Record<number, Promise<ResultRow[]>> = {};

export async function loadResults(year: number, dist: '42.2 km' | '21.1 km' = '42.2 km'): Promise<ResultRow[]> {
  const isHalf = dist === '21.1 km';
  const cache = isHalf ? halfCache : marathonCache;
  const inflight = isHalf ? halfInflight : marathonInflight;
  const url = isHalf ? `/data/results-half-${year}.json` : `/data/results-${year}.json`;

  if (cache[year]) return cache[year];
  if (!inflight[year]) {
    inflight[year] = fetch(url)
      .then(r => r.json())
      .then((rows: ResultRow[]) => {
        cache[year] = rows;
        return rows;
      });
  }
  return inflight[year];
}

export function getResults(year: number): ResultRow[] {
  return marathonCache[year] ?? [];
}

export function getCachedResults(year: number, dist: '42.2 km' | '21.1 km' = '42.2 km'): ResultRow[] {
  if (dist === '21.1 km') return halfCache[year] ?? [];
  return marathonCache[year] ?? [];
}

const rotoruaCache: Record<number, ResultRow[]> = {};
const rotoruaInflight: Record<number, Promise<ResultRow[]>> = {};

export async function loadRotorua(year: number): Promise<ResultRow[]> {
  if (rotoruaCache[year]) return rotoruaCache[year];
  if (!rotoruaInflight[year]) {
    rotoruaInflight[year] = fetch(`/data/results-rot-${year}.json`)
      .then(r => r.json())
      .then((rows: ResultRow[]) => { rotoruaCache[year] = rows; return rows; });
  }
  return rotoruaInflight[year];
}

export function getCachedRotorua(year: number): ResultRow[] {
  return rotoruaCache[year] ?? [];
}

export const rotoruaStats: YearStat[] = [
  { year: 2014, finishers: 2144, avg: 14630, avgMen: 14388, avgWomen: 15150, winnerM: 8865, winnerW: 9958, top10M: 9280, top10W: 10570 },
  { year: 2015, finishers: 1172, avg: 16834, avgMen: 15927, avgWomen: 18233, winnerM: 8943, winnerW: 10402, top10M: 9380, top10W: 11083 },
  { year: 2016, finishers: 1018, avg: 17352, avgMen: 16476, avgWomen: 18867, winnerM: 8859, winnerW: 10525, top10M: 9254, top10W: 11059 },
  { year: 2017, finishers:  833, avg: 17433, avgMen: 16590, avgWomen: 18797, winnerM: 8518, winnerW: 10454, top10M: 9569, top10W: 11548 },
  { year: 2018, finishers:  940, avg: 17239, avgMen: 16279, avgWomen: 18725, winnerM: 8939, winnerW: 10004, top10M: 9756, top10W: 11124 },
  { year: 2019, finishers:  720, avg: 16225, avgMen: 15625, avgWomen: 17388, winnerM: 8738, winnerW: 10277, top10M: 9412, top10W: 11995 },
  { year: 2020, finishers:  446, avg: 17290, avgMen: 16359, avgWomen: 18680, winnerM: 9073, winnerW: 10245, top10M: 9675, top10W: 11703 },
  { year: 2021, finishers:  746, avg: 16909, avgMen: 15884, avgWomen: 18955, winnerM: 8969, winnerW: 10451, top10M: 9498, top10W: 11765 },
  { year: 2022, finishers:  476, avg: 17795, avgMen: 16749, avgWomen: 19860, winnerM: 8961, winnerW: 10808, top10M: 10272, top10W: 12482 },
  { year: 2023, finishers:  796, avg: 16534, avgMen: 15706, avgWomen: 18193, winnerM: 8509, winnerW: 10468, top10M: 9533, top10W: 11823 },
  { year: 2024, finishers: 1151, avg: 16866, avgMen: 15821, avgWomen: 18658, winnerM: 8628, winnerW:  9990, top10M: 9391, top10W: 11364 },
  { year: 2025, finishers:  897, avg: 16717, avgMen: 15899, avgWomen: 18149, winnerM: 8681, winnerW: 11029, top10M: 9224, top10W: 11564 },
];

export function yearStatsForDist(distId: string): YearStat[] {
  if (distId === '21') return halfStats;
  return yearStats;
}

export const courseStats = {
  climb: 118,
  descent: 105,
  net: 13,
  maxElev: 43,
  minElev: 4,
  longestClimb: "km 13.5 → 16.0 · Harbour Bridge (+37 m)",
  longestDescent: "km 16.0 → 18.5 · Bridge descent (−33 m)",
  surface: "Sealed road · Harbour Bridge · 1 harbour crossing",
  certified: "AIMS/World Athletics · cert. NZ/2019/04",
};

export function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export { toSec };
