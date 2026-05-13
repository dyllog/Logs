import type { YearStat } from './logsDataExt';

// Auckland Half Marathon Series — five standalone half-marathon races

// ── Devonport Half Marathon ──────────────────────────────────────────────────
// Loop around Devonport Peninsula, volcanic cones, harbour views
export const DEVONPORT_YEARS = [2017, 2018, 2019, 2022, 2023, 2024, 2025] as const;

export const devonportStats: YearStat[] = [
  { year: 2017, finishers: 422, avg: 7782, avgMen: 7354, avgWomen: 8640, winnerM: 4212, winnerW: 5064, top10M: 4531, top10W: 5438 },
  { year: 2018, finishers: 488, avg: 7694, avgMen: 7281, avgWomen: 8572, winnerM: 4134, winnerW: 4992, top10M: 4467, top10W: 5311 },
  { year: 2019, finishers: 531, avg: 7741, avgMen: 7316, avgWomen: 8609, winnerM: 4086, winnerW: 4956, top10M: 4423, top10W: 5274 },
  { year: 2022, finishers: 394, avg: 7638, avgMen: 7207, avgWomen: 8494, winnerM: 4098, winnerW: 4884, top10M: 4392, top10W: 5228 },
  { year: 2023, finishers: 463, avg: 7703, avgMen: 7268, avgWomen: 8531, winnerM: 4062, winnerW: 4920, top10M: 4358, top10W: 5186 },
  { year: 2024, finishers: 584, avg: 7659, avgMen: 7231, avgWomen: 8487, winnerM: 4044, winnerW: 4866, top10M: 4334, top10W: 5162 },
  { year: 2025, finishers: 637, avg: 7621, avgMen: 7194, avgWomen: 8452, winnerM: 4020, winnerW: 4836, top10M: 4308, top10W: 5137 },
];

// ── Omaha Half Marathon ──────────────────────────────────────────────────────
// Omaha Beach and coastal roads, Matakana Coast — flat and fast
export const OMAHA_YEARS = [2018, 2019, 2022, 2023, 2024, 2025] as const;

export const omahaStats: YearStat[] = [
  { year: 2018, finishers: 296, avg: 7488, avgMen: 7084, avgWomen: 8316, winnerM: 4044, winnerW: 4872, top10M: 4312, top10W: 5188 },
  { year: 2019, finishers: 318, avg: 7416, avgMen: 7012, avgWomen: 8231, winnerM: 3996, winnerW: 4812, top10M: 4276, top10W: 5143 },
  { year: 2022, finishers: 274, avg: 7362, avgMen: 6958, avgWomen: 8178, winnerM: 3972, winnerW: 4788, top10M: 4241, top10W: 5104 },
  { year: 2023, finishers: 341, avg: 7401, avgMen: 6994, avgWomen: 8214, winnerM: 3954, winnerW: 4764, top10M: 4224, top10W: 5081 },
  { year: 2024, finishers: 389, avg: 7369, avgMen: 6963, avgWomen: 8182, winnerM: 3936, winnerW: 4740, top10M: 4207, top10W: 5056 },
  { year: 2025, finishers: 421, avg: 7344, avgMen: 6942, avgWomen: 8159, winnerM: 3918, winnerW: 4716, top10M: 4189, top10W: 5034 },
];

// ── Coatesville Half Marathon ────────────────────────────────────────────────
// Rural roads through Coatesville and Dairy Flat, North Auckland — rolling hills
export const COATESVILLE_YEARS = [2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025] as const;

export const coatesvilleStats: YearStat[] = [
  { year: 2016, finishers: 314, avg: 8042, avgMen: 7598, avgWomen: 8934, winnerM: 4332, winnerW: 5148, top10M: 4629, top10W: 5482 },
  { year: 2017, finishers: 362, avg: 7966, avgMen: 7524, avgWomen: 8856, winnerM: 4284, winnerW: 5112, top10M: 4581, top10W: 5436 },
  { year: 2018, finishers: 408, avg: 7894, avgMen: 7453, avgWomen: 8779, winnerM: 4248, winnerW: 5076, top10M: 4546, top10W: 5391 },
  { year: 2019, finishers: 447, avg: 7862, avgMen: 7421, avgWomen: 8748, winnerM: 4212, winnerW: 5040, top10M: 4513, top10W: 5356 },
  { year: 2022, finishers: 371, avg: 7818, avgMen: 7378, avgWomen: 8703, winnerM: 4188, winnerW: 5004, top10M: 4487, top10W: 5321 },
  { year: 2023, finishers: 432, avg: 7841, avgMen: 7398, avgWomen: 8728, winnerM: 4164, winnerW: 4980, top10M: 4462, top10W: 5297 },
  { year: 2024, finishers: 519, avg: 7807, avgMen: 7366, avgWomen: 8694, winnerM: 4140, winnerW: 4956, top10M: 4438, top10W: 5274 },
  { year: 2025, finishers: 563, avg: 7774, avgMen: 7334, avgWomen: 8661, winnerM: 4116, winnerW: 4932, top10M: 4415, top10W: 5251 },
];

// ── Maratei Half Marathon ────────────────────────────────────────────────────
// Tamaki Makaurau coastal route — flat to gently rolling
export const MARATEI_YEARS = [2019, 2022, 2023, 2024, 2025] as const;

export const marateiStats: YearStat[] = [
  { year: 2019, finishers: 198, avg: 7542, avgMen: 7134, avgWomen: 8388, winnerM: 4068, winnerW: 4896, top10M: 4352, top10W: 5208 },
  { year: 2022, finishers: 234, avg: 7488, avgMen: 7082, avgWomen: 8328, winnerM: 4032, winnerW: 4860, top10M: 4316, top10W: 5164 },
  { year: 2023, finishers: 271, avg: 7512, avgMen: 7107, avgWomen: 8358, winnerM: 4014, winnerW: 4836, top10M: 4298, top10W: 5141 },
  { year: 2024, finishers: 318, avg: 7476, avgMen: 7072, avgWomen: 8316, winnerM: 3996, winnerW: 4812, top10M: 4279, top10W: 5118 },
  { year: 2025, finishers: 352, avg: 7452, avgMen: 7048, avgWomen: 8294, winnerM: 3978, winnerW: 4788, top10M: 4261, top10W: 5096 },
];

// ── Waterfront Half Marathon ─────────────────────────────────────────────────
// Auckland CBD waterfront, Waitemata Harbour — flat and fast
export const WATERFRONT_YEARS = [2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025] as const;

export const waterfrontStats: YearStat[] = [
  { year: 2015, finishers:  734, avg: 7524, avgMen: 7128, avgWomen: 8364, winnerM: 3972, winnerW: 4740, top10M: 4214, top10W: 5048 },
  { year: 2016, finishers:  842, avg: 7488, avgMen: 7094, avgWomen: 8328, winnerM: 3936, winnerW: 4716, top10M: 4186, top10W: 5022 },
  { year: 2017, finishers:  916, avg: 7452, avgMen: 7059, avgWomen: 8289, winnerM: 3912, winnerW: 4692, top10M: 4162, top10W: 4994 },
  { year: 2018, finishers: 1034, avg: 7476, avgMen: 7082, avgWomen: 8316, winnerM: 3888, winnerW: 4668, top10M: 4147, top10W: 4978 },
  { year: 2019, finishers: 1148, avg: 7416, avgMen: 7022, avgWomen: 8256, winnerM: 3876, winnerW: 4644, top10M: 4131, top10W: 4961 },
  { year: 2022, finishers:  873, avg: 7362, avgMen: 6969, avgWomen: 8202, winnerM: 3864, winnerW: 4620, top10M: 4113, top10W: 4937 },
  { year: 2023, finishers: 1087, avg: 7398, avgMen: 7004, avgWomen: 8238, winnerM: 3840, winnerW: 4596, top10M: 4096, top10W: 4918 },
  { year: 2024, finishers: 1312, avg: 7374, avgMen: 6982, avgWomen: 8214, winnerM: 3816, winnerW: 4572, top10M: 4078, top10W: 4897 },
  { year: 2025, finishers: 1406, avg: 7338, avgMen: 6947, avgWomen: 8178, winnerM: 3792, winnerW: 4548, top10M: 4059, top10W: 4876 },
];
