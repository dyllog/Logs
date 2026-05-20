import type { YearStat } from './logsDataExt';

export const COAST_YEARS = [
  2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;

export const coastStats: YearStat[] = [
  { year: 2011, finishers:  421, avg: 7102, avgMen: 6629, avgWomen: 7831, winnerM: 4813, winnerW: 5629, top10M: 5110, top10W: 5961 },
  { year: 2012, finishers:  400, avg: 7232, avgMen: 6825, avgWomen: 7900, winnerM: 4522, winnerW: 5247, top10M: 4878, top10W: 5639 },
  { year: 2013, finishers:  679, avg: 7532, avgMen: 6974, avgWomen: 8165, winnerM: 4556, winnerW: 5150, top10M: 4913, top10W: 5649 },
  { year: 2014, finishers:  432, avg: 7183, avgMen: 6805, avgWomen: 7666, winnerM: 4470, winnerW: 5239, top10M: 4812, top10W: 5875 },
  { year: 2015, finishers:  561, avg: 7426, avgMen: 7042, avgWomen: 8088, winnerM: 4873, winnerW: 5467, top10M: 5093, top10W: 5890 },
  { year: 2016, finishers:  420, avg: 7495, avgMen: 6971, avgWomen: 7996, winnerM: 4451, winnerW: 5451, top10M: 4981, top10W: 6068 },
  { year: 2017, finishers:  774, avg: 7565, avgMen: 6918, avgWomen: 8165, winnerM: 4581, winnerW: 5227, top10M: 4886, top10W: 5645 },
  { year: 2018, finishers:  629, avg: 7315, avgMen: 6880, avgWomen: 8272, winnerM: 4622, winnerW: 5461, top10M: 4930, top10W: 6035 },
  { year: 2019, finishers:  984, avg: 7710, avgMen: 7049, avgWomen: 8953, winnerM: 4411, winnerW: 5362, top10M: 4840, top10W: 5772 },
  { year: 2020, finishers: 1037, avg: 7679, avgMen: 7037, avgWomen: 8517, winnerM: 4474, winnerW: 5142, top10M: 4819, top10W: 5740 },
  { year: 2021, finishers:  732, avg: 7504, avgMen: 7045, avgWomen: 8552, winnerM: 4453, winnerW: 5242, top10M: 5051, top10W: 5780 },
  { year: 2022, finishers:  435, avg: 7157, avgMen: 6826, avgWomen: 8056, winnerM: 4940, winnerW: 5535, top10M: 5168, top10W: 5826 },
  { year: 2023, finishers:  325, avg: 7198, avgMen: 6959, avgWomen: 8094, winnerM: 4748, winnerW: 5441, top10M: 4964, top10W: 5919 },
  { year: 2024, finishers:  675, avg: 7357, avgMen: 6994, avgWomen: 8134, winnerM: 4455, winnerW: 4810, top10M: 4710, top10W: 5757 },
  { year: 2025, finishers:  626, avg: 7341, avgMen: 6883, avgWomen: 8145, winnerM: 4557, winnerW: 5254, top10M: 4758, top10W: 5731 },
  { year: 2026, finishers:  574, avg: 7596, avgMen: 7141, avgWomen: 8159, winnerM: 4470, winnerW: 5264, top10M: 4817, top10W: 5806 },
];
