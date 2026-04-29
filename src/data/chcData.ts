import type { YearStat } from './logsDataExt';

export const CHC_YEARS = [
  2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
  2015, 2016, 2017, 2018, 2019, 2021, 2023, 2024, 2025, 2026,
] as const;

export const chcStats: YearStat[] = [
  { year: 2007, finishers:  350, avg: 13294, avgMen: 13158, avgWomen: 14749, winnerM:  8777, winnerW:  9799, top10M:  9416, top10W: 11219 },
  { year: 2008, finishers:  462, avg: 13766, avgMen: 13533, avgWomen: 14958, winnerM:  8501, winnerW: 10657, top10M:  8875, top10W: 11167 },
  { year: 2009, finishers:  571, avg: 13928, avgMen: 13788, avgWomen: 15078, winnerM:  8298, winnerW: 10347, top10M:  9133, top10W: 10827 },
  { year: 2010, finishers:  620, avg: 14027, avgMen: 13569, avgWomen: 14906, winnerM:  8294, winnerW:  9992, top10M:  9042, top10W: 11016 },
  { year: 2011, finishers:  317, avg: 13987, avgMen: 13872, avgWomen: 15412, winnerM:  8794, winnerW:  9931, top10M:  9510, top10W: 11738 },
  { year: 2012, finishers:  367, avg: 13958, avgMen: 13701, avgWomen: 15440, winnerM:  8250, winnerW:  9942, top10M:  9230, top10W: 11714 },
  { year: 2013, finishers:  399, avg: 14572, avgMen: 14531, avgWomen: 15501, winnerM:  9300, winnerW: 10226, top10M:  9881, top10W: 11332 },
  { year: 2014, finishers:  382, avg: 14115, avgMen: 14050, avgWomen: 15258, winnerM:  8188, winnerW:  9820, top10M:  9381, top10W: 11303 },
  { year: 2015, finishers:  515, avg: 14308, avgMen: 14002, avgWomen: 15257, winnerM:  8653, winnerW:  9943, top10M:  9241, top10W: 11141 },
  { year: 2016, finishers:  449, avg: 14317, avgMen: 14057, avgWomen: 15538, winnerM:  8691, winnerW: 10211, top10M:  9497, top10W: 11303 },
  { year: 2017, finishers:  420, avg: 14069, avgMen: 14023, avgWomen: 15416, winnerM:  8651, winnerW: 10549, top10M:  9477, top10W: 11823 },
  { year: 2018, finishers:  405, avg: 14149, avgMen: 14153, avgWomen: 15595, winnerM:  8859, winnerW: 10086, top10M:  9421, top10W: 11289 },
  { year: 2019, finishers:  476, avg: 14002, avgMen: 13618, avgWomen: 15391, winnerM:  8291, winnerW:  9557, top10M:  9057, top10W: 10467 },
  { year: 2021, finishers:  478, avg: 14725, avgMen: 14415, avgWomen: 15970, winnerM:  8616, winnerW:  9831, top10M:  9100, top10W: 10974 },
  { year: 2023, finishers:  521, avg: 14340, avgMen: 14028, avgWomen: 15675, winnerM:  8431, winnerW:  9861, top10M:  9233, top10W: 10673 },
  { year: 2024, finishers:  715, avg: 14070, avgMen: 14035, avgWomen: 15147, winnerM:  8498, winnerW: 10003, top10M:  9190, top10W: 10712 },
  { year: 2025, finishers:  957, avg: 14083, avgMen: 13935, avgWomen: 15520, winnerM:  8420, winnerW:  9991, top10M:  9043, top10W: 10882 },
  { year: 2026, finishers: 1132, avg: 14340, avgMen: 14157, avgWomen: 15872, winnerM:  8659, winnerW:  9494, top10M:  8970, top10W: 10297 },
];

export const chcHalfStats: YearStat[] = [
  { year: 2007, finishers: 1662, avg: 6747, avgMen: 6356, avgWomen: 7357, winnerM: 3916, winnerW: 4388, top10M: 4071, top10W: 4850 },
  { year: 2008, finishers: 1866, avg: 6851, avgMen: 6512, avgWomen: 7511, winnerM: 3980, winnerW: 4464, top10M: 4099, top10W: 4850 },
  { year: 2009, finishers: 2081, avg: 6952, avgMen: 6598, avgWomen: 7580, winnerM: 3814, winnerW: 4348, top10M: 4063, top10W: 4798 },
  { year: 2010, finishers: 2337, avg: 7021, avgMen: 6638, avgWomen: 7656, winnerM: 3899, winnerW: 4569, top10M: 4012, top10W: 4819 },
  { year: 2011, finishers: 1342, avg: 6950, avgMen: 6677, avgWomen: 7671, winnerM: 3974, winnerW: 4417, top10M: 4192, top10W: 4990 },
  { year: 2012, finishers: 1680, avg: 7104, avgMen: 6772, avgWomen: 7616, winnerM: 3901, winnerW: 4535, top10M: 4142, top10W: 4798 },
  { year: 2013, finishers: 1948, avg: 7070, avgMen: 6732, avgWomen: 7743, winnerM: 3965, winnerW: 4585, top10M: 4035, top10W: 4920 },
  { year: 2014, finishers: 1589, avg: 6911, avgMen: 6590, avgWomen: 7613, winnerM: 3966, winnerW: 4627, top10M: 4041, top10W: 5050 },
  { year: 2015, finishers: 2038, avg: 7056, avgMen: 6572, avgWomen: 7781, winnerM: 3913, winnerW: 4449, top10M: 3993, top10W: 4729 },
  { year: 2016, finishers: 1786, avg: 7083, avgMen: 6643, avgWomen: 7802, winnerM: 3994, winnerW: 4531, top10M: 4123, top10W: 4733 },
  { year: 2017, finishers: 1579, avg: 7120, avgMen: 6760, avgWomen: 7959, winnerM: 4046, winnerW: 4582, top10M: 4195, top10W: 4977 },
  { year: 2018, finishers: 1574, avg: 7072, avgMen: 6753, avgWomen: 7929, winnerM: 3938, winnerW: 4661, top10M: 4100, top10W: 4968 },
  { year: 2019, finishers: 1504, avg: 7087, avgMen: 6872, avgWomen: 7947, winnerM: 4001, winnerW: 4730, top10M: 4230, top10W: 5061 },
  { year: 2021, finishers: 1332, avg: 7312, avgMen: 6952, avgWomen: 8222, winnerM: 3899, winnerW: 4711, top10M: 4152, top10W: 5008 },
  { year: 2023, finishers: 1544, avg: 7067, avgMen: 6788, avgWomen: 7827, winnerM: 3900, winnerW: 4421, top10M: 4137, top10W: 4926 },
  { year: 2024, finishers: 2172, avg: 7198, avgMen: 6851, avgWomen: 7941, winnerM: 3870, winnerW: 4389, top10M: 4046, top10W: 4726 },
  { year: 2025, finishers: 2858, avg: 7281, avgMen: 6909, avgWomen: 8095, winnerM: 3810, winnerW: 4499, top10M: 3882, top10W: 4710 },
  { year: 2026, finishers: 3456, avg: 7399, avgMen: 7055, avgWomen: 8190, winnerM: 3795, winnerW: 4426, top10M: 4051, top10W: 4696 },
];
