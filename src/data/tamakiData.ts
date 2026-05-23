import type { YearStat } from './logsDataExt';

export const TAMAKI_HALF_YEARS = [2021, 2022, 2023, 2024, 2025] as const;
export const TAMAKI_10K_YEARS  = [2021, 2022, 2023, 2024, 2025] as const;

export const tamakiHalfStats: YearStat[] = [
  { year: 2021, finishers:   40, avg:  6849, avgMen:  6971, avgWomen:  7574, winnerM:  5149, winnerW:  5915, top10M:  5647, top10W:  7574 },
  { year: 2022, finishers:  124, avg:  7027, avgMen:  6876, avgWomen:  7542, winnerM:  4254, winnerW:  5412, top10M:  5010, top10W:  6240 },
  { year: 2023, finishers:  168, avg:  7010, avgMen:  6973, avgWomen:  7973, winnerM:  4343, winnerW:  5382, top10M:  4812, top10W:  5789 },
  { year: 2024, finishers:  263, avg:  7117, avgMen:  7117, avgWomen:  7988, winnerM:  4447, winnerW:  5274, top10M:  4819, top10W:  5593 },
  { year: 2025, finishers:  421, avg:  7128, avgMen:  6908, avgWomen:  8286, winnerM:  4368, winnerW:  5335, top10M:  4587, top10W:  5911 },
];

export const tamaki10kStats: YearStat[] = [
  { year: 2021, finishers:   51, avg:  3983, avgMen:  3981, avgWomen:  4309, winnerM:  2412, winnerW:  2641, top10M:  2973, top10W:  3395 },
  { year: 2022, finishers:   74, avg:  4036, avgMen:  4092, avgWomen:  4703, winnerM:  2103, winnerW:  2592, top10M:  2678, top10W:  3233 },
  { year: 2023, finishers:   94, avg:  3898, avgMen:  3905, avgWomen:  4486, winnerM:  2168, winnerW:  2493, top10M:  2716, top10W:  3073 },
  { year: 2024, finishers:  138, avg:  3974, avgMen:  3577, avgWomen:  4534, winnerM:  2165, winnerW:  2654, top10M:  2678, top10W:  2975 },
  { year: 2025, finishers:  233, avg:  3918, avgMen:  3730, avgWomen:  4375, winnerM:  2095, winnerW:  2555, top10M:  2502, top10W:  2805 },
];
