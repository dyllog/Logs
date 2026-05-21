import type { YearStat } from './logsDataExt';

export const KERIKERI_YEARS = [
  2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
  2013, 2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025,
] as const;

export const kerikeriStats: YearStat[] = [
  { year: 2003, finishers:  859, avg:  6847, avgMen:  6847, avgWomen:  6847, winnerM:  4211, winnerW:  4211, top10M:  4405, top10W:  4405 },
  { year: 2004, finishers:  977, avg:  6900, avgMen:  6702, avgWomen:  7625, winnerM:  4196, winnerW:  5208, top10M:  4556, top10W:  5398 },
  { year: 2005, finishers: 1141, avg:  6951, avgMen:  6733, avgWomen:  7985, winnerM:  4244, winnerW:  4661, top10M:  4462, top10W:  5049 },
  { year: 2006, finishers: 1229, avg:  7012, avgMen:  6730, avgWomen:  8085, winnerM:  4179, winnerW:  4553, top10M:  4557, top10W:  5059 },
  { year: 2007, finishers: 1096, avg:  7160, avgMen:  6856, avgWomen:  8339, winnerM:  4151, winnerW:  4638, top10M:  4396, top10W:  5095 },
  { year: 2008, finishers: 1503, avg:  7353, avgMen:  7077, avgWomen:  8502, winnerM:  4096, winnerW:  4669, top10M:  4394, top10W:  5154 },
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
  { year: 2023, finishers:  613, avg:  7102, avgMen:  6870, avgWomen:  7934, winnerM:  4286, winnerW:  4859, top10M:  4472, top10W:  5247 },
  { year: 2024, finishers:  773, avg:  7412, avgMen:  7145, avgWomen:  8476, winnerM:  4205, winnerW:  4870, top10M:  4507, top10W:  5249 },
  { year: 2025, finishers:  807, avg:  7155, avgMen:  6998, avgWomen:  8074, winnerM:  4225, winnerW:  5159, top10M:  4543, top10W:  5341 },
];
