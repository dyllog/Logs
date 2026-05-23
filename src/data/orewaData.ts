import type { YearStat } from './logsDataExt';

export const OREWA_HALF_YEARS = [2021, 2022, 2023, 2024, 2025] as const;
export const OREWA_10K_YEARS  = [2021, 2022, 2023, 2024, 2025] as const;

export const orewaHalfStats: YearStat[] = [
  { year: 2021, finishers:  144, avg:  6987, avgMen:  6775, avgWomen:  8006, winnerM:  4567, winnerW:  5820, top10M:  4873, top10W:  6395 },
  { year: 2022, finishers:  183, avg:  6948, avgMen:  6836, avgWomen:  8215, winnerM:  4284, winnerW:  4385, top10M:  4759, top10W:  5407 },
  { year: 2023, finishers:  271, avg:  6870, avgMen:  6933, avgWomen:  8208, winnerM:  4530, winnerW:  5209, top10M:  4794, top10W:  5603 },
  { year: 2024, finishers:  360, avg:  7307, avgMen:  6917, avgWomen:  8004, winnerM:  4457, winnerW:  4620, top10M:  4791, top10W:  5835 },
  { year: 2025, finishers:  482, avg:  7147, avgMen:  6898, avgWomen:  8023, winnerM:  4434, winnerW:  4876, top10M:  4746, top10W:  5740 },
];

export const orewa10kStats: YearStat[] = [
  { year: 2021, finishers:   93, avg:  3807, avgMen:  3519, avgWomen:  4214, winnerM:  2431, winnerW:  2720, top10M:  2701, top10W:  3267 },
  { year: 2022, finishers:   96, avg:  4030, avgMen:  3788, avgWomen:  4232, winnerM:  2488, winnerW:  2592, top10M:  2789, top10W:  2927 },
  { year: 2023, finishers:  140, avg:  3759, avgMen:  3574, avgWomen:  4306, winnerM:  1957, winnerW:  2495, top10M:  2340, top10W:  2983 },
  { year: 2024, finishers:  221, avg:  3968, avgMen:  3598, avgWomen:  4302, winnerM:  2235, winnerW:  2481, top10M:  2620, top10W:  2996 },
  { year: 2025, finishers:  281, avg:  3875, avgMen:  3771, avgWomen:  4164, winnerM:  2090, winnerW:  2468, top10M:  2399, top10W:  2687 },
];
