import type { YearStat } from './logsDataExt';

export const ONEHUNGA_HALF_YEARS = [2021, 2022, 2023, 2024, 2025] as const;
export const ONEHUNGA_10K_YEARS  = [2021, 2022, 2023, 2024, 2025] as const;

export const onehungaHalfStats: YearStat[] = [
  { year: 2021, finishers:  124, avg:  6906, avgMen:  6475, avgWomen:  7864, winnerM:  4543, winnerW:  5781, top10M:  4873, top10W:  6307 },
  { year: 2022, finishers:  147, avg:  7213, avgMen:  7266, avgWomen:  7877, winnerM:  4873, winnerW:  5371, top10M:  5109, top10W:  6098 },
  { year: 2023, finishers:  226, avg:  6901, avgMen:  6891, avgWomen:  7819, winnerM:  4480, winnerW:  5042, top10M:  4708, top10W:  5631 },
  { year: 2024, finishers:  314, avg:  7356, avgMen:  7404, avgWomen:  8623, winnerM:  4564, winnerW:  5472, top10M:  4911, top10W:  5902 },
  { year: 2025, finishers:  364, avg:  7157, avgMen:  7002, avgWomen:  8130, winnerM:  4387, winnerW:  5366, top10M:  4706, top10W:  5690 },
];

export const onehunga10kStats: YearStat[] = [
  { year: 2021, finishers:   90, avg:  4026, avgMen:  3740, avgWomen:  4551, winnerM:  2502, winnerW:  2882, top10M:  2867, top10W:  3434 },
  { year: 2022, finishers:   75, avg:  3962, avgMen:  3516, avgWomen:  4552, winnerM:  2285, winnerW:  2582, top10M:  2529, top10W:  3198 },
  { year: 2023, finishers:  100, avg:  3840, avgMen:  3525, avgWomen:  4458, winnerM:  2010, winnerW:  2425, top10M:  2367, top10W:  2996 },
  { year: 2024, finishers:  165, avg:  4232, avgMen:  4404, avgWomen:  4650, winnerM:  2328, winnerW:  2468, top10M:  2791, top10W:  2920 },
  { year: 2025, finishers:  241, avg:  3907, avgMen:  3955, avgWomen:  4400, winnerM:  2171, winnerW:  2638, top10M:  2476, top10W:  2932 },
];
