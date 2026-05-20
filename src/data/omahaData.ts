import type { YearStat } from './logsDataExt';

export const OMAHA_HALF_YEARS = [
  2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
] as const;

export const OMAHA_10K_YEARS = [
  2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
] as const;

export const omahaHalfStats: YearStat[] = [
  { year: 2016, finishers:  469, avg: 7477, avgMen: 7034, avgWomen: 8209, winnerM: 4460, winnerW: 5230, top10M: 4997, top10W: 5845 },
  { year: 2017, finishers:  853, avg: 7582, avgMen: 7034, avgWomen: 8367, winnerM: 4653, winnerW: 5469, top10M: 4865, top10W: 5975 },
  { year: 2018, finishers: 1112, avg: 8026, avgMen: 7209, avgWomen: 8915, winnerM: 4755, winnerW: 5199, top10M: 5003, top10W: 5592 },
  { year: 2019, finishers: 1333, avg: 7776, avgMen: 7109, avgWomen: 8512, winnerM: 4511, winnerW: 5180, top10M: 4894, top10W: 5678 },
  { year: 2020, finishers:  951, avg: 7417, avgMen: 6938, avgWomen: 8186, winnerM: 4488, winnerW: 5096, top10M: 4921, top10W: 5558 },
  { year: 2021, finishers:  510, avg: 7021, avgMen: 6640, avgWomen: 7638, winnerM: 4585, winnerW: 4966, top10M: 4826, top10W: 5635 },
  { year: 2022, finishers:  720, avg: 7293, avgMen: 6986, avgWomen: 7786, winnerM: 4612, winnerW: 5578, top10M: 4840, top10W: 5780 },
  { year: 2023, finishers: 1147, avg: 7392, avgMen: 7057, avgWomen: 7872, winnerM: 4613, winnerW: 5227, top10M: 4745, top10W: 5652 },
  { year: 2024, finishers: 1144, avg: 7476, avgMen: 7155, avgWomen: 7993, winnerM: 4363, winnerW: 4880, top10M: 4820, top10W: 5686 },
  { year: 2025, finishers: 1149, avg: 7629, avgMen: 7140, avgWomen: 8210, winnerM: 4545, winnerW: 5394, top10M: 4853, top10W: 5783 },
];

export const omaha10kStats: YearStat[] = [
  { year: 2015, finishers:   71, avg: 3084, avgMen: 2909, avgWomen: 3376, winnerM: 2134, winnerW: 2583, top10M: 2434, top10W: 2923 },
  { year: 2016, finishers:  171, avg: 4346, avgMen: 3606, avgWomen: 4543, winnerM: 2515, winnerW: 2739, top10M: 2769, top10W: 3036 },
  { year: 2017, finishers:  368, avg: 4105, avgMen: 3548, avgWomen: 4457, winnerM: 2284, winnerW: 2504, top10M: 2482, top10W: 2813 },
  { year: 2018, finishers:  403, avg: 4035, avgMen: 3643, avgWomen: 4238, winnerM: 2253, winnerW: 2392, top10M: 2564, top10W: 2712 },
  { year: 2019, finishers:  612, avg: 4184, avgMen: 3544, avgWomen: 4351, winnerM: 2275, winnerW: 2524, top10M: 2422, top10W: 2862 },
  { year: 2020, finishers:  618, avg: 4032, avgMen: 3508, avgWomen: 4345, winnerM: 2176, winnerW: 2509, top10M: 2382, top10W: 2715 },
  { year: 2021, finishers:  315, avg: 4053, avgMen: 3557, avgWomen: 4398, winnerM: 2089, winnerW: 2339, top10M: 2487, top10W: 2909 },
  { year: 2022, finishers:  436, avg: 4054, avgMen: 3576, avgWomen: 4402, winnerM: 2209, winnerW: 2495, top10M: 2485, top10W: 2923 },
  { year: 2023, finishers:  595, avg: 3951, avgMen: 3624, avgWomen: 4140, winnerM: 2272, winnerW: 2467, top10M: 2460, top10W: 2825 },
  { year: 2024, finishers:  649, avg: 3988, avgMen: 3662, avgWomen: 4142, winnerM: 2229, winnerW: 2405, top10M: 2408, top10W: 2810 },
  { year: 2025, finishers:  598, avg: 4118, avgMen: 3719, avgWomen: 4420, winnerM: 2171, winnerW: 2404, top10M: 2494, top10W: 2725 },
];
