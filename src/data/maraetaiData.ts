import type { YearStat } from './logsDataExt';

export const MARAETAI_HALF_YEARS = [
  2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;

export const MARAETAI_10K_YEARS = [
  2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;

export const maraetaiHalfStats: YearStat[] = [
  { year: 2019, finishers: 1310, avg:  7923, avgMen:  7626, avgWomen:  9151, winnerM:  4166, winnerW:  4844, top10M:  4907, top10W:  5521 },
  { year: 2020, finishers: 1179, avg:  7735, avgMen:  7492, avgWomen:  8986, winnerM:  4590, winnerW:  4761, top10M:  4883, top10W:  5636 },
  { year: 2021, finishers:  874, avg:  7478, avgMen:  7350, avgWomen:  8648, winnerM:  4615, winnerW:  5110, top10M:  4887, top10W:  5585 },
  { year: 2022, finishers:  477, avg:  7180, avgMen:  7167, avgWomen:  8293, winnerM:  4609, winnerW:  4763, top10M:  4932, top10W:  5625 },
  { year: 2023, finishers:  603, avg:  7485, avgMen:  7309, avgWomen:  8616, winnerM:  4711, winnerW:  5654, top10M:  4951, top10W:  5883 },
  { year: 2024, finishers:  809, avg:  7534, avgMen:  7409, avgWomen:  8679, winnerM:  4547, winnerW:  4622, top10M:  4825, top10W:  5629 },
  { year: 2025, finishers:  823, avg:  7355, avgMen:  7283, avgWomen:  8404, winnerM:  4572, winnerW:  5234, top10M:  4808, top10W:  5732 },
  { year: 2026, finishers:  756, avg:  7411, avgMen:  7248, avgWomen:  8551, winnerM:  4562, winnerW:  5157, top10M:  4742, top10W:  5527 },
];

export const maraetai10kStats: YearStat[] = [
  { year: 2019, finishers:  536, avg:  4225, avgMen:  3946, avgWomen:  4703, winnerM:  2237, winnerW:  2528, top10M:  2476, top10W:  2792 },
  { year: 2020, finishers:  555, avg:  4041, avgMen:  3859, avgWomen:  4571, winnerM:  2183, winnerW:  2621, top10M:  2459, top10W:  2764 },
  { year: 2021, finishers:  531, avg:  4049, avgMen:  3737, avgWomen:  4613, winnerM:  2006, winnerW:  2481, top10M:  2303, top10W:  2684 },
  { year: 2022, finishers:  269, avg:  4023, avgMen:  3844, avgWomen:  4413, winnerM:  2311, winnerW:  2558, top10M:  2566, top10W:  2905 },
  { year: 2023, finishers:  350, avg:  4114, avgMen:  3799, avgWomen:  4685, winnerM:  2146, winnerW:  2654, top10M:  2450, top10W:  2941 },
  { year: 2024, finishers:  429, avg:  4030, avgMen:  3840, avgWomen:  4435, winnerM:  2243, winnerW:  2544, top10M:  2369, top10W:  2920 },
  { year: 2025, finishers:  523, avg:  3989, avgMen:  3786, avgWomen:  4380, winnerM:  2209, winnerW:  2319, top10M:  2479, top10W:  2688 },
  { year: 2026, finishers:  428, avg:  3952, avgMen:  3712, avgWomen:  4408, winnerM:  2284, winnerW:  2397, top10M:  2434, top10W:  2704 },
];
