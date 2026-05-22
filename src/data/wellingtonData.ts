import type { YearStat } from './logsDataExt';

export const WELLINGTON_MAR_YEARS = [
  2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,
  2022,2023,2024,2025,
] as const;

export const WELLINGTON_HALF_YEARS = [
  1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,
  2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,
  2022,2023,2024,2025,
] as const;

export const wellingtonMarStats: YearStat[] = [
  { year: 2005, finishers:   186, avg: 14000, avgMen: 14038, avgWomen: 15824, winnerM:  9507, winnerW: 12015, top10M: 10391, top10W: 13458 },
  { year: 2006, finishers:   195, avg: 14081, avgMen: 13947, avgWomen: 14777, winnerM:  9098, winnerW: 11428, top10M: 10302, top10W: 12905 },
  { year: 2007, finishers:   242, avg: 14061, avgMen: 14015, avgWomen: 15294, winnerM:  9687, winnerW: 11575, top10M: 10456, top10W: 12722 },
  { year: 2008, finishers:   233, avg: 14079, avgMen: 13973, avgWomen: 15209, winnerM:  9436, winnerW: 11228, top10M: 10432, top10W: 12249 },
  { year: 2009, finishers:   299, avg: 13880, avgMen: 13758, avgWomen: 15503, winnerM:  9415, winnerW: 10857, top10M: 10294, top10W: 12564 },
  { year: 2010, finishers:   387, avg: 14337, avgMen: 14297, avgWomen: 15581, winnerM:  9331, winnerW: 11313, top10M: 10167, top10W: 12053 },
  { year: 2011, finishers:   370, avg: 14260, avgMen: 14301, avgWomen: 15536, winnerM:  9489, winnerW: 11017, top10M: 10210, top10W: 12221 },
  { year: 2012, finishers:   361, avg: 13884, avgMen: 13705, avgWomen: 15252, winnerM:  9238, winnerW: 10120, top10M:  9817, top10W: 12104 },
  { year: 2013, finishers:   443, avg: 13817, avgMen: 13569, avgWomen: 14953, winnerM:  8733, winnerW: 10418, top10M:  9331, top10W: 11768 },
  { year: 2014, finishers:   375, avg: 14381, avgMen: 14199, avgWomen: 15885, winnerM:  9445, winnerW: 12022, top10M: 10006, top10W: 12871 },
  { year: 2015, finishers:   416, avg: 14286, avgMen: 14365, avgWomen: 15677, winnerM:  9611, winnerW: 10148, top10M: 10032, top10W: 11664 },
  { year: 2016, finishers:   335, avg: 14855, avgMen: 14587, avgWomen: 16698, winnerM:  9416, winnerW: 10966, top10M: 10418, top10W: 12144 },
  { year: 2017, finishers:   338, avg: 14849, avgMen: 14560, avgWomen: 16398, winnerM:  8563, winnerW: 10116, top10M:  9363, top10W: 11544 },
  { year: 2018, finishers:   315, avg: 14807, avgMen: 14911, avgWomen: 15590, winnerM:  9604, winnerW: 11103, top10M: 10350, top10W: 12039 },
  { year: 2019, finishers:   349, avg: 15236, avgMen: 15095, avgWomen: 16800, winnerM:  8832, winnerW: 10966, top10M:  9635, top10W: 12164 },
  { year: 2022, finishers:   339, avg: 14922, avgMen: 15180, avgWomen: 16934, winnerM:  9009, winnerW: 11259, top10M: 10130, top10W: 12165 },
  { year: 2023, finishers:   373, avg: 14380, avgMen: 14435, avgWomen: 16740, winnerM:  8900, winnerW: 10099, top10M:  9446, top10W: 11907 },
  { year: 2024, finishers:   498, avg: 14327, avgMen: 14287, avgWomen: 16810, winnerM:  8851, winnerW: 11160, top10M:  9448, top10W: 11828 },
  { year: 2025, finishers:   479, avg: 14390, avgMen: 14299, avgWomen: 16085, winnerM:  8725, winnerW: 10372, top10M:  9470, top10W: 11216 },
];

export const wellingtonHalfStats: YearStat[] = [
  { year: 1996, finishers:   547, avg:  6122, avgMen:  6122, avgWomen:  6122, winnerM:  4029, winnerW:  4029, top10M:  4314, top10W:  4314 },
  { year: 1997, finishers:   608, avg:  6284, avgMen:  6072, avgWomen:  7207, winnerM:  4204, winnerW:  4863, top10M:  4456, top10W:  5359 },
  { year: 1998, finishers:   672, avg:  6462, avgMen:  6205, avgWomen:  7270, winnerM:  4237, winnerW:  5118, top10M:  4404, top10W:  5446 },
  { year: 1999, finishers:   611, avg:  6466, avgMen:  6270, avgWomen:  7285, winnerM:  4346, winnerW:  5180, top10M:  4522, top10W:  5409 },
  { year: 2000, finishers:   639, avg:  6647, avgMen:  6524, avgWomen:  7425, winnerM:  4422, winnerW:  4789, top10M:  4812, top10W:  5434 },
  { year: 2001, finishers:   540, avg:  6361, avgMen:  6155, avgWomen:  7133, winnerM:  4330, winnerW:  4885, top10M:  4613, top10W:  5497 },
  { year: 2002, finishers:   426, avg:  6161, avgMen:  6161, avgWomen:  6161, winnerM:  4195, winnerW:  4195, top10M:  4544, top10W:  4544 },
  { year: 2003, finishers:   704, avg:  6548, avgMen:  6352, avgWomen:  7162, winnerM:  4347, winnerW:  5139, top10M:  4647, top10W:  5492 },
  { year: 2004, finishers:   886, avg:  6444, avgMen:  6236, avgWomen:  7105, winnerM:  4267, winnerW:  5107, top10M:  4527, top10W:  5393 },
  { year: 2005, finishers:  1308, avg:  6607, avgMen:  6384, avgWomen:  7269, winnerM:  4245, winnerW:  4850, top10M:  4489, top10W:  5267 },
  { year: 2006, finishers:  1255, avg:  6617, avgMen:  6308, avgWomen:  7240, winnerM:  4276, winnerW:  4752, top10M:  4480, top10W:  5156 },
  { year: 2007, finishers:  1281, avg:  6791, avgMen:  6514, avgWomen:  7404, winnerM:  4301, winnerW:  4975, top10M:  4503, top10W:  5307 },
  { year: 2008, finishers:  1358, avg:  6927, avgMen:  6553, avgWomen:  7586, winnerM:  4407, winnerW:  4669, top10M:  4568, top10W:  5050 },
  { year: 2009, finishers:  1597, avg:  6862, avgMen:  6506, avgWomen:  7586, winnerM:  4155, winnerW:  4691, top10M:  4375, top10W:  5146 },
  { year: 2010, finishers:  1687, avg:  6780, avgMen:  6473, avgWomen:  7467, winnerM:  4082, winnerW:  4821, top10M:  4268, top10W:  5110 },
  { year: 2011, finishers:  1451, avg:  7028, avgMen:  6744, avgWomen:  7748, winnerM:  4394, winnerW:  5005, top10M:  4572, top10W:  5227 },
  { year: 2012, finishers:  1504, avg:  6883, avgMen:  6565, avgWomen:  7598, winnerM:  3987, winnerW:  4883, top10M:  4363, top10W:  5200 },
  { year: 2013, finishers:  1565, avg:  6959, avgMen:  6644, avgWomen:  7539, winnerM:  4182, winnerW:  4826, top10M:  4479, top10W:  5142 },
  { year: 2014, finishers:  1554, avg:  6892, avgMen:  6529, avgWomen:  7628, winnerM:  4112, winnerW:  4730, top10M:  4197, top10W:  4970 },
  { year: 2015, finishers:  1260, avg:  7095, avgMen:  6741, avgWomen:  7877, winnerM:  4106, winnerW:  4676, top10M:  4455, top10W:  5196 },
  { year: 2016, finishers:  1256, avg:  7184, avgMen:  6826, avgWomen:  7808, winnerM:  4214, winnerW:  5103, top10M:  4503, top10W:  5318 },
  { year: 2017, finishers:  1028, avg:  7021, avgMen:  6714, avgWomen:  7764, winnerM:  4029, winnerW:  4660, top10M:  4350, top10W:  5092 },
  { year: 2018, finishers:  1143, avg:  7219, avgMen:  6992, avgWomen:  8051, winnerM:  4258, winnerW:  5104, top10M:  4493, top10W:  5583 },
  { year: 2019, finishers:  1060, avg:  7172, avgMen:  6816, avgWomen:  8183, winnerM:  4134, winnerW:  4637, top10M:  4312, top10W:  5205 },
  { year: 2022, finishers:  1002, avg:  7095, avgMen:  6851, avgWomen:  7955, winnerM:  4033, winnerW:  4626, top10M:  4259, top10W:  4908 },
  { year: 2023, finishers:  1227, avg:  7100, avgMen:  6851, avgWomen:  8022, winnerM:  3981, winnerW:  4544, top10M:  4184, top10W:  4966 },
  { year: 2024, finishers:  1549, avg:  7242, avgMen:  6978, avgWomen:  8058, winnerM:  3929, winnerW:  4705, top10M:  4157, top10W:  5071 },
  { year: 2025, finishers:  1628, avg:  7175, avgMen:  6903, avgWomen:  7995, winnerM:  3872, winnerW:  4417, top10M:  4165, top10W:  4786 },
];
