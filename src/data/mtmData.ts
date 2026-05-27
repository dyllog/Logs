import type { YearStat } from './logsDataExt';

export const MTM_HALF_YEARS = [2016, 2017, 2018, 2019, 2020, 2022, 2023, 2024, 2025] as const;
export const MTM_10K_YEARS  = [2016, 2017, 2018, 2019, 2020, 2022, 2023, 2024, 2025] as const;
export const MTM_5K_YEARS   = [2016, 2017, 2018, 2019, 2020, 2022, 2023, 2024, 2025] as const;

export const mtmHalfStats: YearStat[] = [
  { year: 2016, finishers:  947, avg:  7758, avgMen:  7360, avgWomen:  8810, winnerM:  4637, winnerW:  4919, top10M:  4797, top10W:  5512 },
  { year: 2017, finishers:  923, avg:  7777, avgMen:  7322, avgWomen:  8891, winnerM:  4245, winnerW:  4804, top10M:  4673, top10W:  5354 },
  { year: 2018, finishers:  591, avg:  7584, avgMen:  7313, avgWomen:  8884, winnerM:  4346, winnerW:  4930, top10M:  4693, top10W:  5647 },
  { year: 2019, finishers:  788, avg:  7529, avgMen:  7099, avgWomen:  8716, winnerM:  4245, winnerW:  4767, top10M:  4730, top10W:  5532 },
  { year: 2020, finishers:  736, avg:  7300, avgMen:  7119, avgWomen:  8518, winnerM:  3952, winnerW:  4611, top10M:  4706, top10W:  5440 },
  { year: 2022, finishers:  861, avg:  7197, avgMen:  7176, avgWomen:  8329, winnerM:  4627, winnerW:  5007, top10M:  4802, top10W:  5529 },
  { year: 2023, finishers: 1008, avg:  7217, avgMen:  6994, avgWomen:  8438, winnerM:  4221, winnerW:  4604, top10M:  4455, top10W:  5150 },
  { year: 2024, finishers: 1654, avg:  7259, avgMen:  6998, avgWomen:  8162, winnerM:  4033, winnerW:  4682, top10M:  4333, top10W:  5103 },
  { year: 2025, finishers: 1739, avg:  7079, avgMen:  6922, avgWomen:  8151, winnerM:  4227, winnerW:  4788, top10M:  4475, top10W:  5053 },
];

export const mtm10kStats: YearStat[] = [
  { year: 2016, finishers:  547, avg:  4240, avgMen:  4016, avgWomen:  4740, winnerM:  2417, winnerW:  2536, top10M:  2591, top10W:  2786 },
  { year: 2017, finishers:  545, avg:  4125, avgMen:  3908, avgWomen:  4671, winnerM:  2106, winnerW:  2616, top10M:  2383, top10W:  2850 },
  { year: 2018, finishers:  434, avg:  4131, avgMen:  3903, avgWomen:  4755, winnerM:  2285, winnerW:  2602, top10M:  2451, top10W:  2803 },
  { year: 2019, finishers:  608, avg:  4227, avgMen:  3980, avgWomen:  4624, winnerM:  2177, winnerW:  2421, top10M:  2555, top10W:  2757 },
  { year: 2020, finishers:  655, avg:  4044, avgMen:  3825, avgWomen:  4594, winnerM:  2032, winnerW:  2453, top10M:  2266, top10W:  2660 },
  { year: 2022, finishers:  793, avg:  4057, avgMen:  3912, avgWomen:  4670, winnerM:  2162, winnerW:  2239, top10M:  2259, top10W:  2610 },
  { year: 2023, finishers:  776, avg:  4034, avgMen:  3851, avgWomen:  4650, winnerM:  2077, winnerW:  2276, top10M:  2192, top10W:  2644 },
  { year: 2024, finishers: 1030, avg:  3932, avgMen:  3809, avgWomen:  4384, winnerM:  2134, winnerW:  2285, top10M:  2210, top10W:  2564 },
  { year: 2025, finishers: 1169, avg:  4066, avgMen:  4162, avgWomen:  4543, winnerM:  1960, winnerW:  2622, top10M:  2203, top10W:  2741 },
];

export const mtm5kStats: YearStat[] = [
  { year: 2016, finishers:  173, avg:  2502, avgMen:  2355, avgWomen:  2779, winnerM:  1461, winnerW:  1671, top10M:  1592, top10W:  1815 },
  { year: 2017, finishers:  161, avg:  2469, avgMen:  2216, avgWomen:  2836, winnerM:  1356, winnerW:  1399, top10M:  1516, top10W:  1732 },
  { year: 2018, finishers:  160, avg:  2321, avgMen:  2259, avgWomen:  2703, winnerM:  1369, winnerW:  1417, top10M:  1494, top10W:  1739 },
  { year: 2019, finishers:  208, avg:  2730, avgMen:  2504, avgWomen:  2981, winnerM:  1283, winnerW:  1561, top10M:  1447, top10W:  1822 },
  { year: 2020, finishers:  316, avg:  2630, avgMen:  2340, avgWomen:  2889, winnerM:  1086, winnerW:  1208, top10M:  1278, top10W:  1505 },
  { year: 2022, finishers:  307, avg:  2435, avgMen:  2308, avgWomen:  2876, winnerM:  1127, winnerW:  1342, top10M:  1332, top10W:  1634 },
  { year: 2023, finishers:  388, avg:  2717, avgMen:  2676, avgWomen:  2962, winnerM:  1191, winnerW:  1343, top10M:  1296, top10W:  1582 },
  { year: 2024, finishers:  466, avg:  2710, avgMen:  2647, avgWomen:  2965, winnerM:  1198, winnerW:  1322, top10M:  1311, top10W:  1510 },
  { year: 2025, finishers:  451, avg:  2434, avgMen:  2405, avgWomen:  2737, winnerM:  1053, winnerW:  1202, top10M:  1240, top10W:  1465 },
];
