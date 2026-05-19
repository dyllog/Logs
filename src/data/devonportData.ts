import type { YearStat } from './logsDataExt';

export const DEV_HALF_YEARS = [
  2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
] as const;

export const DEV_10K_YEARS = [
  2010, 2011, 2012, 2013, 2014, 2015,
  2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
] as const;

export const devHalfStats: YearStat[] = [
  { year: 2016, finishers:  721, avg: 7631, avgMen: 7061, avgWomen: 8226, winnerM: 4594, winnerW: 5090, top10M: 4989, top10W: 5694 },
  { year: 2017, finishers:  834, avg: 7440, avgMen: 6957, avgWomen: 8071, winnerM: 4502, winnerW: 5635, top10M: 4837, top10W: 6022 },
  { year: 2018, finishers: 1050, avg: 7722, avgMen: 7098, avgWomen: 8591, winnerM: 4804, winnerW: 4887, top10M: 5017, top10W: 5619 },
  { year: 2019, finishers: 1162, avg: 7589, avgMen: 7001, avgWomen: 8248, winnerM: 4774, winnerW: 5229, top10M: 4942, top10W: 5604 },
  { year: 2020, finishers:  598, avg: 7312, avgMen: 6851, avgWomen: 8300, winnerM: 4259, winnerW: 5812, top10M: 4874, top10W: 5982 },
  { year: 2021, finishers:  437, avg: 7014, avgMen: 6672, avgWomen: 7845, winnerM: 4610, winnerW: 5491, top10M: 4930, top10W: 5794 },
  { year: 2022, finishers:  509, avg: 7383, avgMen: 7011, avgWomen: 8132, winnerM: 4424, winnerW: 5388, top10M: 4990, top10W: 5784 },
  { year: 2023, finishers:  657, avg: 7419, avgMen: 7093, avgWomen: 8092, winnerM: 4607, winnerW: 5350, top10M: 4979, top10W: 5700 },
  { year: 2024, finishers:  708, avg: 7386, avgMen: 7038, avgWomen: 8185, winnerM: 4501, winnerW: 5472, top10M: 4733, top10W: 5832 },
  { year: 2025, finishers:  718, avg: 7243, avgMen: 6938, avgWomen: 8144, winnerM: 4655, winnerW: 5162, top10M: 4912, top10W: 5589 },
];

export const dev10kStats: YearStat[] = [
  { year: 2010, finishers: 474, avg: 3939, avgMen: 3404, avgWomen: 4637, winnerM: 2243, winnerW: 2576, top10M: 2476, top10W: 2867 },
  { year: 2011, finishers: 332, avg: 3918, avgMen: 3388, avgWomen: 4506, winnerM: 2311, winnerW: 2311, top10M: 2473, top10W: 2837 },
  { year: 2012, finishers: 396, avg: 3949, avgMen: 3312, avgWomen: 4387, winnerM: 2049, winnerW: 2348, top10M: 2334, top10W: 2770 },
  { year: 2013, finishers: 154, avg: 3838, avgMen: 3215, avgWomen: 4163, winnerM: 2275, winnerW: 2369, top10M: 2617, top10W: 2942 },
  { year: 2014, finishers: 409, avg: 3871, avgMen: 3439, avgWomen: 3985, winnerM: 2175, winnerW: 2518, top10M: 2462, top10W: 2809 },
  { year: 2015, finishers: 392, avg: 3877, avgMen: 3494, avgWomen: 4036, winnerM: 2100, winnerW: 2494, top10M: 2432, top10W: 2794 },
  { year: 2016, finishers: 338, avg: 4149, avgMen: 3608, avgWomen: 4584, winnerM: 2352, winnerW: 2521, top10M: 2534, top10W: 2955 },
  { year: 2017, finishers: 378, avg: 4111, avgMen: 3563, avgWomen: 4365, winnerM: 2282, winnerW: 2592, top10M: 2432, top10W: 2870 },
  { year: 2018, finishers: 428, avg: 3935, avgMen: 3559, avgWomen: 4150, winnerM: 1930, winnerW: 2608, top10M: 2451, top10W: 2906 },
  { year: 2019, finishers: 500, avg: 4091, avgMen: 3653, avgWomen: 4304, winnerM: 2182, winnerW: 2454, top10M: 2318, top10W: 2740 },
  { year: 2020, finishers: 321, avg: 4001, avgMen: 3508, avgWomen: 4274, winnerM: 2152, winnerW: 2550, top10M: 2360, top10W: 2785 },
  { year: 2021, finishers: 266, avg: 3964, avgMen: 3480, avgWomen: 4363, winnerM: 2008, winnerW: 2569, top10M: 2319, top10W: 2914 },
  { year: 2022, finishers: 324, avg: 4152, avgMen: 3634, avgWomen: 4390, winnerM: 2080, winnerW: 2727, top10M: 2460, top10W: 3040 },
  { year: 2023, finishers: 403, avg: 4100, avgMen: 3581, avgWomen: 4230, winnerM: 2247, winnerW: 2827, top10M: 2420, top10W: 2991 },
  { year: 2024, finishers: 448, avg: 4085, avgMen: 3670, avgWomen: 4318, winnerM: 2073, winnerW: 2412, top10M: 2449, top10W: 2714 },
  { year: 2025, finishers: 496, avg: 4031, avgMen: 3664, avgWomen: 4280, winnerM: 2312, winnerW: 2450, top10M: 2499, top10W: 2766 },
];
