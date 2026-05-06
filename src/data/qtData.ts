import type { YearStat } from './logsDataExt';

export const QT_YEARS = [
  2014, 2016, 2017, 2018, 2019, 2020, 2022, 2023, 2024, 2025,
] as const;

export const qtStats: YearStat[] = [
  { year: 2014, finishers: 1446, avg: 15641, avgMen: 15308, avgWomen: 16708, winnerM:  9221, winnerW: 10518, top10M: 10049, top10W: 11463 },
  { year: 2016, finishers: 1563, avg: 16395, avgMen: 16216, avgWomen: 17772, winnerM:  9579, winnerW: 10848, top10M: 10293, top10W: 11976 },
  { year: 2017, finishers: 1556, avg: 16410, avgMen: 16101, avgWomen: 17817, winnerM:  8875, winnerW: 10338, top10M:  9641, top10W: 11055 },
  { year: 2018, finishers: 1954, avg: 16979, avgMen: 16627, avgWomen: 18495, winnerM:  9129, winnerW: 10333, top10M: 10014, top10W: 10960 },
  { year: 2019, finishers: 2262, avg: 16596, avgMen: 16069, avgWomen: 18047, winnerM:  8937, winnerW: 10491, top10M:  9664, top10W: 11606 },
  { year: 2020, finishers: 1374, avg: 16465, avgMen: 15904, avgWomen: 17945, winnerM:  9580, winnerW: 10512, top10M: 10005, top10W: 11744 },
  { year: 2022, finishers: 1740, avg: 16357, avgMen: 16006, avgWomen: 17825, winnerM:  8790, winnerW: 10389, top10M:  9717, top10W: 11613 },
  { year: 2023, finishers: 1841, avg: 16657, avgMen: 16357, avgWomen: 18323, winnerM:  9073, winnerW: 10190, top10M:  9792, top10W: 10933 },
  { year: 2024, finishers: 2522, avg: 15812, avgMen: 15482, avgWomen: 17394, winnerM:  9245, winnerW: 10373, top10M:  9749, top10W: 11516 },
  { year: 2025, finishers: 2929, avg: 15604, avgMen: 15376, avgWomen: 17051, winnerM:  8702, winnerW: 10111, top10M:  9353, top10W: 10793 },
];

export const qtHalfStats: YearStat[] = [
  { year: 2015, finishers: 4273, avg: 7923, avgMen: 7497, avgWomen: 8701, winnerM: 4458, winnerW: 5167, top10M: 4634, top10W: 5338 },
  { year: 2016, finishers: 4384, avg: 8083, avgMen: 7650, avgWomen: 8953, winnerM: 4342, winnerW: 5339, top10M: 4584, top10W: 5492 },
  { year: 2017, finishers: 3982, avg: 7978, avgMen: 7511, avgWomen: 8987, winnerM: 4047, winnerW: 4768, top10M: 4370, top10W: 5157 },
  { year: 2018, finishers: 4851, avg: 8122, avgMen: 7711, avgWomen: 9176, winnerM: 4117, winnerW: 4781, top10M: 4402, top10W: 5313 },
  { year: 2019, finishers: 5075, avg: 8308, avgMen: 7801, avgWomen: 9234, winnerM: 4097, winnerW: 5178, top10M: 4589, top10W: 5367 },
  { year: 2020, finishers: 4418, avg: 8099, avgMen: 7683, avgWomen: 9171, winnerM: 4209, winnerW: 5289, top10M: 4517, top10W: 5481 },
  { year: 2022, finishers: 4142, avg: 8260, avgMen: 7787, avgWomen: 9234, winnerM: 4085, winnerW: 4971, top10M: 4427, top10W: 5399 },
  { year: 2023, finishers: 4298, avg: 9071, avgMen: 8557, avgWomen: 10042, winnerM: 4272, winnerW: 4607, top10M: 4649, top10W: 5194 },
  { year: 2024, finishers: 4828, avg: 8003, avgMen: 7653, avgWomen: 8977, winnerM: 3989, winnerW: 4971, top10M: 4244, top10W: 5165 },
  { year: 2025, finishers: 5640, avg: 8031, avgMen: 7683, avgWomen: 8890, winnerM: 4214, winnerW: 4634, top10M: 4596, top10W: 4986 },
];
