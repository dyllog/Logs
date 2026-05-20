import type { YearStat } from './logsDataExt';

export const KERIKERI_YEARS = [
  2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024,
] as const;

export const kerikeriStats: YearStat[] = [
  { year: 2008, finishers: 1100, avg:  6881, avgMen:  6547, avgWomen:  7257, winnerM:  4096, winnerW:  4669, top10M:  4394, top10W:  5154 },
  { year: 2009, finishers: 1663, avg:  7603, avgMen:  7247, avgWomen:  8787, winnerM:  4286, winnerW:  4645, top10M:  4654, top10W:  5110 },
  { year: 2010, finishers: 1437, avg:  7571, avgMen:  7224, avgWomen:  8582, winnerM:  4403, winnerW:  4845, top10M:  4657, top10W:  5264 },
  { year: 2011, finishers: 1384, avg:  7496, avgMen:  7177, avgWomen:  8390, winnerM:  4076, winnerW:  4689, top10M:  4441, top10W:  5327 },
  { year: 2013, finishers: 1284, avg:  7333, avgMen:  6913, avgWomen:  8123, winnerM:  4458, winnerW:  4893, top10M:  4703, top10W:  5316 },
  { year: 2014, finishers: 1250, avg:  7460, avgMen:  7243, avgWomen:  8692, winnerM:  4250, winnerW:  4736, top10M:  4718, top10W:  5222 },
  { year: 2015, finishers: 1045, avg:  7468, avgMen:  7265, avgWomen:  8390, winnerM:  4327, winnerW:  5055, top10M:  4697, top10W:  5294 },
  { year: 2016, finishers: 1069, avg:  7363, avgMen:  7135, avgWomen:  8200, winnerM:  4077, winnerW:  5028, top10M:  4539, top10W:  5540 },
  { year: 2017, finishers:  875, avg:  7104, avgMen:  6833, avgWomen:  8066, winnerM:  3898, winnerW:  4558, top10M:  4270, top10W:  4892 },
  { year: 2018, finishers:  834, avg:  7365, avgMen:  7123, avgWomen:  8372, winnerM:  4225, winnerW:  4920, top10M:  4423, top10W:  5297 },
  { year: 2019, finishers:  838, avg:  7363, avgMen:  6982, avgWomen:  8159, winnerM:  4201, winnerW:  4954, top10M:  4479, top10W:  5479 },
  { year: 2022, finishers:  551, avg:  7261, avgMen:  7017, avgWomen:  8003, winnerM:  4187, winnerW:  4875, top10M:  4522, top10W:  5275 },
  { year: 2023, finishers:  613, avg:  7102, avgMen:  6868, avgWomen:  7934, winnerM:  4286, winnerW:  4859, top10M:  4472, top10W:  5247 },
  { year: 2024, finishers:  773, avg:  7412, avgMen:  7145, avgWomen:  8476, winnerM:  4205, winnerW:  4870, top10M:  4507, top10W:  5249 },
];
