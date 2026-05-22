import type { YearStat } from './logsDataExt';

export const WF_YEARS = [
  2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;

export const wf10kStats: YearStat[] = [
  { year: 2018, finishers:  569, avg: 3976, avgMen: 3552, avgWomen: 4207, winnerM: 1960, winnerW: 2206, top10M: 2168, top10W: 2616 },
  { year: 2019, finishers:  766, avg: 4000, avgMen: 3577, avgWomen: 4228, winnerM: 2011, winnerW: 2212, top10M: 2192, top10W: 2568 },
  { year: 2021, finishers:  765, avg: 4015, avgMen: 3531, avgWomen: 4261, winnerM: 2016, winnerW: 2519, top10M: 2186, top10W: 2619 },
  { year: 2022, finishers:  501, avg: 3908, avgMen: 3487, avgWomen: 4196, winnerM: 2005, winnerW: 2505, top10M: 2118, top10W: 2739 },
  { year: 2023, finishers:  627, avg: 3917, avgMen: 3480, avgWomen: 4216, winnerM: 1969, winnerW: 2395, top10M: 2092, top10W: 2701 },
  { year: 2024, finishers:  737, avg: 3845, avgMen: 3482, avgWomen: 4068, winnerM: 1952, winnerW: 2322, top10M: 2110, top10W: 2492 },
  { year: 2025, finishers:  895, avg: 3860, avgMen: 3519, avgWomen: 4108, winnerM: 1999, winnerW: 2149, top10M: 2108, top10W: 2433 },
  { year: 2026, finishers: 1093, avg: 3915, avgMen: 3496, avgWomen: 4159, winnerM: 1959, winnerW: 2212, top10M: 2036, top10W: 2413 },
];

export const wfHalfStats: YearStat[] = [
  { year: 2018, finishers: 1371, avg: 7183, avgMen: 6716, avgWomen: 7986, winnerM: 4234, winnerW: 4779, top10M: 4567, top10W: 5386 },
  { year: 2019, finishers: 2015, avg: 7197, avgMen: 6702, avgWomen: 8199, winnerM: 4054, winnerW: 4477, top10M: 4321, top10W: 5192 },
  { year: 2021, finishers: 1611, avg: 7372, avgMen: 6933, avgWomen: 8082, winnerM: 4187, winnerW: 4894, top10M: 4472, top10W: 5400 },
  { year: 2022, finishers:  848, avg: 6827, avgMen: 6419, avgWomen: 7582, winnerM: 4277, winnerW: 4601, top10M: 4507, top10W: 5127 },
  { year: 2023, finishers: 1414, avg: 7016, avgMen: 6734, avgWomen: 7841, winnerM: 4016, winnerW: 4943, top10M: 4298, top10W: 5264 },
  { year: 2024, finishers: 1822, avg: 7045, avgMen: 6689, avgWomen: 7686, winnerM: 4073, winnerW: 4728, top10M: 4414, top10W: 5104 },
  { year: 2025, finishers: 2200, avg: 7089, avgMen: 6693, avgWomen: 7692, winnerM: 4137, winnerW: 4784, top10M: 4380, top10W: 5176 },
  { year: 2026, finishers: 3006, avg: 7036, avgMen: 6693, avgWomen: 7609, winnerM: 4096, winnerW: 4836, top10M: 4319, top10W: 5193 },
];
