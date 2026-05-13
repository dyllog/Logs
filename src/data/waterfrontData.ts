import type { YearStat } from './logsDataExt';

export const WF_YEARS = [
  2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;

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
