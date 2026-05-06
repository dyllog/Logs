import type { YearStat } from './logsDataExt';

export const HB_YEARS = [
  2016, 2017, 2018, 2021, 2022, 2023, 2024, 2025,
] as const;

export const hbStats: YearStat[] = [
  { year: 2016, finishers:  780, avg: 16496, avgMen: 16144, avgWomen: 17491, winnerM:  9310, winnerW: 10842, top10M: 10547, top10W: 12282 },
  { year: 2017, finishers:  407, avg: 15685, avgMen: 15532, avgWomen: 17168, winnerM:  8828, winnerW: 11045, top10M: 10314, top10W: 12330 },
  { year: 2018, finishers:  436, avg: 16174, avgMen: 15991, avgWomen: 17765, winnerM:  9171, winnerW: 11479, top10M: 10501, top10W: 12669 },
  { year: 2021, finishers: 1025, avg: 16206, avgMen: 15804, avgWomen: 17914, winnerM:  8733, winnerW: 10587, top10M:  9893, top10W: 11218 },
  { year: 2022, finishers:  415, avg: 14543, avgMen: 14346, avgWomen: 16564, winnerM:  8642, winnerW: 10174, top10M:  9288, top10W: 11337 },
  { year: 2023, finishers:  449, avg: 15006, avgMen: 14892, avgWomen: 16834, winnerM:  8871, winnerW: 10062, top10M:  9810, top10W: 11534 },
  { year: 2024, finishers:  789, avg: 14663, avgMen: 14431, avgWomen: 16375, winnerM:  8725, winnerW: 10007, top10M:  9573, top10W: 11201 },
  { year: 2025, finishers: 1184, avg: 15297, avgMen: 14914, avgWomen: 16683, winnerM:  8686, winnerW: 10067, top10M:  9223, top10W: 11177 },
];

export const hbHalfStats: YearStat[] = [
  { year: 2016, finishers: 2259, avg: 8224, avgMen: 7765, avgWomen: 9140, winnerM: 4398, winnerW: 5160, top10M: 4688, top10W: 5489 },
  { year: 2017, finishers: 1808, avg: 8055, avgMen: 7723, avgWomen: 9113, winnerM: 4334, winnerW: 4869, top10M: 4701, top10W: 5315 },
  { year: 2018, finishers: 1850, avg: 8077, avgMen: 7705, avgWomen: 9241, winnerM: 4063, winnerW: 5200, top10M: 4625, top10W: 5681 },
  { year: 2021, finishers: 3499, avg: 7980, avgMen: 7590, avgWomen: 9094, winnerM: 4032, winnerW: 4788, top10M: 4486, top10W: 5437 },
  { year: 2022, finishers: 1651, avg: 7473, avgMen: 7116, avgWomen: 8607, winnerM: 4256, winnerW: 4996, top10M: 4418, top10W: 5491 },
  { year: 2023, finishers: 1554, avg: 7737, avgMen: 7426, avgWomen: 8892, winnerM: 4003, winnerW: 4483, top10M: 4417, top10W: 5286 },
  { year: 2024, finishers: 2751, avg: 7503, avgMen: 7174, avgWomen: 8452, winnerM: 3983, winnerW: 4857, top10M: 4296, top10W: 5271 },
  { year: 2025, finishers: 3818, avg: 7627, avgMen: 7253, avgWomen: 8599, winnerM: 3934, winnerW: 4647, top10M: 4184, top10W: 5145 },
];
