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
}

export const YEARS = [2021, 2022, 2023, 2024, 2025] as const;

// Real values computed from full CSV fields
export const yearStats: YearStat[] = [
  { year: 2021, finishers:  870, avg: 15813, avgMen: 15908, avgWomen: 17756, winnerM:  8400, winnerW: 10244 },
  { year: 2022, finishers: 1300, avg: 14980, avgMen: 15021, avgWomen: 16880, winnerM:  8512, winnerW: 10170 },
  { year: 2023, finishers: 1765, avg: 14820, avgMen: 14930, avgWomen: 16573, winnerM:  8589, winnerW:  9860 },
  { year: 2024, finishers: 2439, avg: 14839, avgMen: 14810, avgWomen: 16309, winnerM:  8509, winnerW:  9691 },
  { year: 2025, finishers: 2825, avg: 15033, avgMen: 14988, avgWomen: 16416, winnerM:  8395, winnerW:  9490 },
];

const cache: Record<number, ResultRow[]> = {};
const inflight: Record<number, Promise<ResultRow[]>> = {};

export async function loadResults(year: number): Promise<ResultRow[]> {
  if (cache[year]) return cache[year];
  if (!inflight[year]) {
    inflight[year] = fetch(`/data/results-${year}.json`)
      .then(r => r.json())
      .then((rows: ResultRow[]) => {
        cache[year] = rows;
        return rows;
      });
  }
  return inflight[year];
}

export function getResults(year: number): ResultRow[] {
  return cache[year] ?? [];
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
