export type DistId = 'mar' | 'half';

export interface AthleteResult {
  dateNum: number;
  year: number;
  race: string;
  short: string;
  dist: '42.2 km' | '21.1 km';
  distId: DistId;
  time: string;
  sec: number;
  pos: number;
  total: number;
  cat: string;
  isPB: boolean;
}

export interface AthletePBs {
  mar?: { time: string; sec: number; race: string; year: number };
  half?: { time: string; sec: number; race: string; year: number };
}

export interface AthleteProfile {
  name: string;
  slug: string;
  initials: string;
  gender: 'M' | 'F';
  category: string;
  nationality: string;
  birthYear: number;
  results: AthleteResult[];
  pbs: AthletePBs;
}

// Maps race name to the stats key used in athletePayload.ts
export function getRaceKey(raceName: string, distId: DistId): string {
  const n = raceName.toLowerCase();
  if (n.includes('auckland'))    return distId === 'mar' ? 'akl-mar'  : 'akl-half';
  if (n.includes('rotorua'))     return distId === 'mar' ? 'rot-mar'  : 'rot-half';
  if (n.includes('christchurch'))return distId === 'mar' ? 'chc-mar'  : 'chc-half';
  if (n.includes('hawke'))       return distId === 'mar' ? 'hb-mar'   : 'hb-half';
  if (n.includes('waterfront'))  return 'wf-half';
  if (n.includes('queenstown'))  return distId === 'mar' ? 'qt-mar'   : 'qt-half';
  return 'unknown';
}

const ALL_ATHLETES: AthleteProfile[] = [
  {
    name: 'Michael Voss',
    slug: 'michael-voss',
    initials: 'MV',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1998,
    pbs: {
      mar:  { time: '2:21:01', sec: 8461, race: 'Auckland Marathon',          year: 2025 },
      half: { time: '1:04:30', sec: 3870, race: 'Christchurch Half Marathon', year: 2024 },
    },
    results: [
      { dateNum: 2014 + 4/12,  year: 2014, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half', time: '1:15:31', sec: 4531, pos: 5,  total: 1817, cat: 'M 20–39', isPB: false },
      { dateNum: 2015 + 4/12,  year: 2015, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half', time: '1:08:36', sec: 4116, pos: 2,  total: 1042, cat: 'M 20–39', isPB: false },
      { dateNum: 2015 + 5/12,  year: 2015, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:08:26', sec: 4106, pos: 11, total: 2038, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 4/12,  year: 2016, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half', time: '1:06:07', sec: 3967, pos: 1,  total:  873, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 5/12,  year: 2016, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:06:50', sec: 4010, pos: 3,  total: 1786, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 10/12, year: 2016, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:14:43', sec: 4483, pos: 10, total: 5673, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 4/12,  year: 2018, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:46:25', sec: 9985, pos: 7,  total:  940, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 5/12,  year: 2018, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:08:20', sec: 4100, pos: 4,  total: 1574, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:07:42', sec: 4062, pos: 2,  total: 5572, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 3/12,  year: 2019, race: 'Waterfront Half Marathon',   short: 'WF Half',  dist: '21.1 km', distId: 'half', time: '1:07:34', sec: 4054, pos: 1,  total: 2015, cat: 'M 20–29', isPB: false },
      { dateNum: 2019 + 4/12,  year: 2019, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:27:35', sec: 8855, pos: 3,  total:  720, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:22:34', sec: 8554, pos: 2,  total: 1650, cat: 'M 20–39', isPB: false },
      { dateNum: 2020 + 4/12,  year: 2020, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:31:13', sec: 9073, pos: 1,  total:  446, cat: 'M 20–39', isPB: false },
      { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:32:29', sec: 9149, pos: 5,  total: 1619, cat: 'M 20–39', isPB: false },
      { dateNum: 2021 + 4/12,  year: 2021, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:29:29', sec: 8969, pos: 1,  total:  746, cat: 'M 20–39', isPB: false },
      { dateNum: 2021 + 5/12,  year: 2021, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:09', sec: 3909, pos: 2,  total: 1332, cat: 'M 20–39', isPB: false },
      { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:07:23', sec: 4043, pos: 1,  total: 2492, cat: 'M 20–39', isPB: false },
      { dateNum: 2022 + 4/12,  year: 2022, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:29:21', sec: 8961, pos: 1,  total:  476, cat: 'M 20–39', isPB: false },
      { dateNum: 2022 + 4.5/12,year: 2022, race: "Hawke's Bay Marathon",       short: 'HB',       dist: '42.2 km', distId: 'mar',  time: '2:24:02', sec: 8642, pos: 1,  total:  415, cat: 'M 20–29', isPB: false },
      { dateNum: 2022 + 10/12, year: 2022, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:06:35', sec: 3995, pos: 2,  total: 3988, cat: 'M 20–39', isPB: false },
      { dateNum: 2023 + 4/12,  year: 2023, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:24:03', sec: 8643, pos: 2,  total:  796, cat: 'M 20–39', isPB: false },
      { dateNum: 2023 + 10/12, year: 2023, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:07:07', sec: 4027, pos: 3,  total: 4293, cat: 'M 20–39', isPB: false },
      { dateNum: 2024 + 4/12,  year: 2024, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:23:48', sec: 8628, pos: 1,  total: 1151, cat: 'M 20–39', isPB: false },
      { dateNum: 2024 + 4.5/12,year: 2024, race: "Hawke's Bay Marathon",       short: 'HB',       dist: '42.2 km', distId: 'mar',  time: '2:25:25', sec: 8725, pos: 1,  total:  789, cat: 'M 25–29', isPB: false },
      { dateNum: 2024 + 5/12,  year: 2024, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:04:30', sec: 3870, pos: 1,  total: 2172, cat: 'M 20–39', isPB: true  },
      { dateNum: 2024 + 10/12, year: 2024, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:22:55', sec: 8575, pos: 3,  total: 2439, cat: 'M 20–39', isPB: false },
      { dateNum: 2025 + 4/12,  year: 2025, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:26:52', sec: 8812, pos: 3,  total:  897, cat: 'M 20–39', isPB: false },
      { dateNum: 2025 + 5/12,  year: 2025, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:04:39', sec: 3879, pos: 6,  total: 2858, cat: 'M 20–39', isPB: false },
      { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:21:01', sec: 8461, pos: 2,  total: 2775, cat: 'M Elite',  isPB: true  },
      { dateNum: 2026 + 3/12,  year: 2026, race: 'Waterfront Half Marathon',   short: 'WF Half',  dist: '21.1 km', distId: 'half', time: '1:08:16', sec: 4096, pos: 1,  total: 3006, cat: 'M 20–29', isPB: false },
    ],
  },
  {
    name: 'Daniel Balchin',
    slug: 'daniel-balchin',
    initials: 'DB',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1990,
    pbs: {
      mar:  { time: '2:19:55', sec: 8395, race: 'Auckland Marathon',          year: 2025 },
      half: { time: '1:05:16', sec: 3916, race: 'Christchurch Half Marathon', year: 2024 },
    },
    results: [
      { dateNum: 2014 + 5/12,  year: 2014, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:07:55', sec: 4075, pos: 8, total: 1589, cat: 'M 20–39', isPB: false },
      { dateNum: 2014 + 10/12, year: 2014, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:08:47', sec: 4127, pos: 2, total: 7125, cat: 'M 18–34', isPB: false },
      { dateNum: 2015 + 5/12,  year: 2015, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:53', sec: 3953, pos: 4, total: 2038, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 5/12,  year: 2016, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:07:54', sec: 4074, pos: 4, total: 1786, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 10/12, year: 2016, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:09:04', sec: 4144, pos: 2, total: 5673, cat: 'M 18–34', isPB: false },
      { dateNum: 2017 + 5/12,  year: 2017, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:07:26', sec: 4046, pos: 1, total: 1579, cat: 'M 20–39', isPB: false },
      { dateNum: 2017 + 10/12, year: 2017, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:09:08', sec: 4148, pos: 2, total: 5706, cat: 'M 18–34', isPB: false },
      { dateNum: 2019 + 5/12,  year: 2019, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:06:41', sec: 4001, pos: 1, total: 1504, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:06:58', sec: 4018, pos: 3, total: 5204, cat: 'M 18–34', isPB: false },
      { dateNum: 2021 + 5/12,  year: 2021, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:23', sec: 3923, pos: 3, total: 1332, cat: 'M 20–39', isPB: false },
      { dateNum: 2022 + 10/12, year: 2022, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:22:25', sec: 8545, pos: 2, total: 1299, cat: 'M 30–34', isPB: false },
      { dateNum: 2023 + 5/12,  year: 2023, race: 'Christchurch Marathon',      short: 'CHC',      dist: '42.2 km', distId: 'mar',  time: '2:20:31', sec: 8431, pos: 1, total:  521, cat: 'M 20–39', isPB: false },
      { dateNum: 2023 + 10/12, year: 2023, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:23:09', sec: 8589, pos: 1, total: 1765, cat: 'M 30–34', isPB: false },
      { dateNum: 2024 + 5/12,  year: 2024, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:16', sec: 3916, pos: 3, total: 2172, cat: 'M 20–39', isPB: true  },
      { dateNum: 2024 + 10/12, year: 2024, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:22:00', sec: 8520, pos: 2, total: 2439, cat: 'M 30–34', isPB: false },
      { dateNum: 2025 + 4/12,  year: 2025, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:24:41', sec: 8681, pos: 1, total:  897, cat: 'M 20–39', isPB: false },
      { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:19:55', sec: 8395, pos: 1, total: 2775, cat: 'M Elite',  isPB: true  },
    ],
  },
  {
    name: 'Cameron Graves',
    slug: 'cameron-graves',
    initials: 'CG',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1992,
    pbs: {
      mar:  { time: '2:21:04', sec: 8464, race: 'Auckland Marathon',    year: 2025 },
      half: { time: '1:04:17', sec: 3857, race: 'Christchurch Half Marathon', year: 2025 },
    },
    results: [
      { dateNum: 2017 + 10/12, year: 2017, race: 'Auckland Half Marathon',     short: 'AUC½', dist: '21.1 km', distId: 'half', time: '1:13:29', sec: 4409, pos: 9,  total: 5706, cat: 'M 18–34', isPB: false },
      { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Half Marathon',     short: 'AUC½', dist: '21.1 km', distId: 'half', time: '1:08:27', sec: 4107, pos: 3,  total: 5572, cat: 'M 18–34', isPB: false },
      { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',     short: 'AUC½', dist: '21.1 km', distId: 'half', time: '1:05:51', sec: 3951, pos: 2,  total: 5204, cat: 'M 18–34', isPB: false },
      { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Half Marathon',     short: 'AUC½', dist: '21.1 km', distId: 'half', time: '1:05:23', sec: 3923, pos: 1,  total: 4628, cat: 'M 18–34', isPB: false },
      { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Marathon',          short: 'AUC',  dist: '42.2 km', distId: 'mar',  time: '2:27:44', sec: 8864, pos: 2,  total:  870, cat: 'M 18–34', isPB: false },
      { dateNum: 2022 + 11/12, year: 2022, race: 'Queenstown Half Marathon',   short: 'QT½',  dist: '21.1 km', distId: 'half', time: '1:14:08', sec: 4448, pos: 5,  total: 4142, cat: 'M 30–39', isPB: false },
      { dateNum: 2023 + 5/12,  year: 2023, race: "Hawke's Bay Half Marathon",  short: 'HB½',  dist: '21.1 km', distId: 'half', time: '1:07:25', sec: 4045, pos: 2,  total: 1554, cat: 'M 30–39', isPB: false },
      { dateNum: 2024 + 5/12,  year: 2024, race: "Hawke's Bay Half Marathon",  short: 'HB½',  dist: '21.1 km', distId: 'half', time: '1:06:23', sec: 3983, pos: 1,  total: 2751, cat: 'M 30–34', isPB: false },
      { dateNum: 2024 + 10/12, year: 2024, race: 'Auckland Marathon',          short: 'AUC',  dist: '42.2 km', distId: 'mar',  time: '2:35:33', sec: 9333, pos: 10, total: 2439, cat: 'M 30–34', isPB: false },
      { dateNum: 2025 + 5/12,  year: 2025, race: "Hawke's Bay Half Marathon",  short: 'HB½',  dist: '21.1 km', distId: 'half', time: '1:05:34', sec: 3934, pos: 1,  total: 3818, cat: 'M 30–34', isPB: false },
      { dateNum: 2025 + 6/12,  year: 2025, race: 'Christchurch Half Marathon', short: 'CHC½', dist: '21.1 km', distId: 'half', time: '1:04:17', sec: 3857, pos: 5,  total: 2858, cat: 'M 20–39', isPB: true  },
      { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Marathon',          short: 'AUC',  dist: '42.2 km', distId: 'mar',  time: '2:21:04', sec: 8464, pos: 3,  total: 2775, cat: 'M Elite',  isPB: false },
    ],
  },
  {
    name: 'Jonathan Jackson',
    slug: 'jonathan-jackson',
    initials: 'JJ',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1988,
    pbs: {
      mar:  { time: '2:26:38', sec: 8798, race: 'Auckland Marathon',          year: 2016 },
      half: { time: '1:07:22', sec: 4042, race: 'Christchurch Half Marathon', year: 2015 },
    },
    results: [
      { dateNum: 2014 + 10/12, year: 2014, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:09:01', sec: 4141, pos: 3,  total: 7125, cat: 'M 20–39', isPB: false },
      { dateNum: 2015 + 4/12,  year: 2015, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:30:25', sec: 9025, pos: 3,  total: 1172, cat: 'M 20–39', isPB: false },
      { dateNum: 2015 + 5/12,  year: 2015, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:07:22', sec: 4042, pos: 7,  total: 2038, cat: 'M 20–39', isPB: true  },
      { dateNum: 2015 + 10/12, year: 2015, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:27:32', sec: 8852, pos: 2,  total: 1507, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 4/12,  year: 2016, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:30:37', sec: 9037, pos: 3,  total:  449, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 10/12, year: 2016, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:26:38', sec: 8798, pos: 2,  total: 1630, cat: 'M 20–39', isPB: true  },
      { dateNum: 2017 + 4/12,  year: 2017, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:32:44', sec: 9164, pos: 3,  total:  833, cat: 'M 20–39', isPB: false },
      { dateNum: 2017 + 10/12, year: 2017, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:09:51', sec: 4191, pos: 4,  total: 5706, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 3/12,  year: 2018, race: 'Waterfront Half Marathon',   short: 'WF Half',  dist: '21.1 km', distId: 'half', time: '1:10:34', sec: 4234, pos: 1,  total: 1371, cat: 'M 20–29', isPB: false },
      { dateNum: 2018 + 4/12,  year: 2018, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half', time: '1:13:18', sec: 4398, pos: 1,  total:  825, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 5/12,  year: 2018, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:10:29', sec: 4229, pos: 11, total: 1574, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:28:51', sec: 8931, pos: 6,  total: 1653, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 4/12,  year: 2019, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half', time: '1:13:44', sec: 4424, pos: 1,  total:  720, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 5/12,  year: 2019, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:09:47', sec: 4187, pos: 5,  total: 1504, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:11:10', sec: 4270, pos: 8,  total: 5204, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 11/12, year: 2019, race: 'Queenstown Marathon',        short: 'QT',       dist: '42.2 km', distId: 'mar',  time: '2:38:04', sec: 9484, pos: 3,  total: 2262, cat: 'M 20–29', isPB: false },
      { dateNum: 2021 + 4/12,  year: 2021, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half', time: '1:16:12', sec: 4572, pos: 3,  total:  958, cat: 'M 20–39', isPB: false },
      { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:36:16', sec: 9376, pos: 5,  total:  870, cat: 'M 20–39', isPB: false },
      { dateNum: 2023 + 3/12,  year: 2023, race: 'Waterfront Half Marathon',   short: 'WF Half',  dist: '21.1 km', distId: 'half', time: '1:12:48', sec: 4368, pos: 6,  total: 1414, cat: 'M 30–39', isPB: false },
      { dateNum: 2023 + 4/12,  year: 2023, race: 'Rotorua Marathon',           short: 'ROT',      dist: '42.2 km', distId: 'mar',  time: '2:36:26', sec: 9386, pos: 4,  total:  796, cat: 'M 20–39', isPB: false },
      { dateNum: 2023 + 10/12, year: 2023, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:35:49', sec: 9349, pos: 6,  total: 1765, cat: 'M 20–39', isPB: false },
    ],
  },
  {
    name: 'Oska Inkster-Baynes',
    slug: 'oska-inkster-baynes',
    initials: 'OI',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1980,
    pbs: {
      mar:  { time: '2:18:11', sec: 8291, race: 'Christchurch Marathon',     year: 2019 },
      half: { time: '1:04:59', sec: 3899, race: 'Christchurch Half Marathon', year: 2021 },
    },
    results: [
      { dateNum: 2009 + 5/12, year: 2009, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:17:52', sec: 4672, pos: 36, total: 2081, cat: 'M 20–39', isPB: false },
      { dateNum: 2010 + 5/12, year: 2010, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:13:10', sec: 4390, pos: 18, total: 2337, cat: 'M 20–39', isPB: false },
      { dateNum: 2011 + 5/12, year: 2011, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:09:58', sec: 4198, pos: 5,  total: 1342, cat: 'M 20–39', isPB: false },
      { dateNum: 2012 + 5/12, year: 2012, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:09:16', sec: 4156, pos: 6,  total: 1680, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 5/12, year: 2019, race: 'Christchurch Marathon',      short: 'CHC',      dist: '42.2 km', distId: 'mar',  time: '2:18:11', sec: 8291, pos: 1,  total:  476, cat: 'M 20–39', isPB: true  },
      { dateNum: 2021 + 5/12, year: 2021, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:04:59', sec: 3899, pos: 1,  total: 1332, cat: 'M 20–39', isPB: true  },
      { dateNum: 2023 + 5/12, year: 2023, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:04', sec: 3904, pos: 2,  total: 1544, cat: 'M 20–39', isPB: false },
      { dateNum: 2025 + 5/12, year: 2025, race: 'Christchurch Marathon',      short: 'CHC',      dist: '42.2 km', distId: 'mar',  time: '2:20:20', sec: 8420, pos: 1,  total:  957, cat: 'M 20–39', isPB: false },
    ],
  },
  {
    name: 'Christopher Dryden',
    slug: 'christopher-dryden',
    initials: 'CD',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1992,
    pbs: {
      half: { time: '1:04:11', sec: 3851, race: 'Christchurch Half Marathon', year: 2025 },
    },
    results: [
      { dateNum: 2017 + 5/12,  year: 2017, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:10:22', sec: 4222, pos: 7,  total: 1579, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 5/12,  year: 2019, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:07:27', sec: 4047, pos: 3,  total: 1504, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:07:39', sec: 4059, pos: 4,  total: 5204, cat: 'M 20–39', isPB: false },
      { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:07:30', sec: 4050, pos: 2,  total: 4628, cat: 'M 20–39', isPB: false },
      { dateNum: 2021 + 5/12,  year: 2021, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:49', sec: 3949, pos: 4,  total: 1332, cat: 'M 20–39', isPB: false },
      { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:09:24', sec: 4164, pos: 2,  total: 2492, cat: 'M 20–39', isPB: false },
      { dateNum: 2022 + 10/12, year: 2022, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:08:28', sec: 4108, pos: 5,  total: 3988, cat: 'M 20–39', isPB: false },
      { dateNum: 2023 + 5/12,  year: 2023, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:20', sec: 3920, pos: 3,  total: 1544, cat: 'M 20–39', isPB: false },
      { dateNum: 2024 + 5/12,  year: 2024, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:10', sec: 3910, pos: 2,  total: 2172, cat: 'M 20–39', isPB: false },
      { dateNum: 2024 + 11/12, year: 2024, race: 'Queenstown Half Marathon',   short: 'QT Half',  dist: '21.1 km', distId: 'half', time: '1:07:04', sec: 4024, pos: 2,  total: 4828, cat: 'M 25–29', isPB: false },
      { dateNum: 2025 + 5/12,  year: 2025, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:04:11', sec: 3851, pos: 4,  total: 2858, cat: 'M 20–39', isPB: true  },
      { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:05:24', sec: 3924, pos: 1,  total: 6614, cat: 'M 20–39', isPB: false },
      { dateNum: 2026 + 5/12,  year: 2026, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:05:55', sec: 3955, pos: 2,  total: 3456, cat: 'M 20–39', isPB: false },
    ],
  },
  {
    name: 'Aaron Pulford',
    slug: 'aaron-pulford',
    initials: 'AP',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1988,
    pbs: {
      mar:  { time: '2:27:01', sec: 8821, race: 'Auckland Marathon',          year: 2015 },
      half: { time: '1:06:11', sec: 3971, race: 'Christchurch Half Marathon', year: 2013 },
    },
    results: [
      { dateNum: 2013 + 5/12,  year: 2013, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:06:11', sec: 3971, pos: 3,  total: 1948, cat: 'M 20–39', isPB: true  },
      { dateNum: 2014 + 5/12,  year: 2014, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:06:45', sec: 4005, pos: 4,  total: 1589, cat: 'M 20–39', isPB: false },
      { dateNum: 2015 + 5/12,  year: 2015, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:06:15', sec: 3975, pos: 5,  total: 2038, cat: 'M 20–39', isPB: false },
      { dateNum: 2015 + 10/12, year: 2015, race: 'Auckland Marathon',          short: 'AKL',      dist: '42.2 km', distId: 'mar',  time: '2:27:01', sec: 8821, pos: 1,  total: 1507, cat: 'M 20–39', isPB: true  },
      { dateNum: 2016 + 5/12,  year: 2016, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:06:34', sec: 3994, pos: 2,  total: 1786, cat: 'M 20–39', isPB: false },
      { dateNum: 2017 + 5/12,  year: 2017, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:08:01', sec: 4081, pos: 2,  total: 1579, cat: 'M 20–39', isPB: false },
      { dateNum: 2017 + 10/12, year: 2017, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:07:18', sec: 4038, pos: 1,  total: 5706, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 5/12,  year: 2018, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half', time: '1:06:24', sec: 3984, pos: 2,  total: 1574, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:09:28', sec: 4168, pos: 6,  total: 5572, cat: 'M 20–39', isPB: false },
      { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half', time: '1:09:47', sec: 4187, pos: 5,  total: 5204, cat: 'M 20–39', isPB: false },
      { dateNum: 2020 + 4/12,  year: 2020, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half', time: '1:15:22', sec: 4522, pos: 1,  total:  360, cat: 'M 20–39', isPB: false },
      { dateNum: 2021 + 3/12,  year: 2021, race: 'Waterfront Half Marathon',   short: 'WF Half',  dist: '21.1 km', distId: 'half', time: '1:09:47', sec: 4187, pos: 1,  total: 1611, cat: 'M 20–29', isPB: false },
    ],
  },
  {
    name: 'Daniel Jones',
    slug: 'daniel-jones',
    initials: 'DJ',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1988,
    pbs: {
      mar: { time: '2:20:00', sec: 8400, race: 'Auckland Marathon', year: 2021 },
    },
    results: [
      { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Marathon',    short: 'AUC', dist: '42.2 km', distId: 'mar', time: '2:24:48', sec: 8688, pos: 2,  total: 1653, cat: 'M 18–34', isPB: false },
      { dateNum: 2018 + 11/12, year: 2018, race: 'Queenstown Marathon',  short: 'QT',  dist: '42.2 km', distId: 'mar', time: '2:32:09', sec: 9129, pos: 1,  total: 1954, cat: 'M 20–29', isPB: false },
      { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Marathon',    short: 'AUC', dist: '42.2 km', distId: 'mar', time: '2:21:57', sec: 8517, pos: 1,  total: 1619, cat: 'M 18–34', isPB: false },
      { dateNum: 2021 + 5/12,  year: 2021, race: "Hawke's Bay Marathon", short: 'HB',  dist: '42.2 km', distId: 'mar', time: '2:25:33', sec: 8733, pos: 1,  total: 1025, cat: 'M 30–39', isPB: false },
      { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Marathon',    short: 'AUC', dist: '42.2 km', distId: 'mar', time: '2:20:00', sec: 8400, pos: 1,  total:  870, cat: 'M 18–34', isPB: true  },
      { dateNum: 2022 + 10/12, year: 2022, race: 'Auckland Marathon',    short: 'AUC', dist: '42.2 km', distId: 'mar', time: '2:21:52', sec: 8512, pos: 1,  total: 1299, cat: 'M 18–34', isPB: false },
      { dateNum: 2022 + 11/12, year: 2022, race: 'Queenstown Marathon',  short: 'QT',  dist: '42.2 km', distId: 'mar', time: '2:26:30', sec: 8790, pos: 1,  total: 1740, cat: 'M 30–39', isPB: false },
      { dateNum: 2023 + 11/12, year: 2023, race: 'Queenstown Marathon',  short: 'QT',  dist: '42.2 km', distId: 'mar', time: '2:31:13', sec: 9073, pos: 1,  total: 1841, cat: 'M 30–39', isPB: false },
    ],
  },
  {
    name: 'Hiro Tanimoto',
    slug: 'hiro-tanimoto',
    initials: 'HT',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1989,
    pbs: {
      mar: { time: '2:29:17', sec: 8957, race: "Hawke's Bay Marathon", year: 2022 },
    },
    results: [
      { dateNum: 2019 + 11/12, year: 2019, race: 'Queenstown Marathon',  short: 'QT', dist: '42.2 km', distId: 'mar', time: '2:31:10', sec: 9070, pos: 2, total: 2262, cat: 'M 30–39', isPB: false },
      { dateNum: 2022 + 4.5/12,year: 2022, race: "Hawke's Bay Marathon", short: 'HB', dist: '42.2 km', distId: 'mar', time: '2:29:17', sec: 8957, pos: 2, total:  415, cat: 'M 30–39', isPB: true  },
      { dateNum: 2022 + 11/12, year: 2022, race: 'Queenstown Marathon',  short: 'QT', dist: '42.2 km', distId: 'mar', time: '2:31:33', sec: 9093, pos: 2, total: 1740, cat: 'M 30–39', isPB: false },
      { dateNum: 2025 + 4.5/12,year: 2025, race: "Hawke's Bay Marathon", short: 'HB', dist: '42.2 km', distId: 'mar', time: '2:29:55', sec: 8995, pos: 3, total: 1184, cat: 'M 35–39', isPB: false },
    ],
  },
  {
    name: 'Ciaran Faherty',
    slug: 'ciaran-faherty',
    initials: 'CF',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1987,
    pbs: {
      mar:  { time: '2:24:11', sec: 8651, race: 'Christchurch Marathon',    year: 2017 },
      half: { time: '1:09:47', sec: 4187, race: 'Waterfront Half Marathon', year: 2019 },
    },
    results: [
      { dateNum: 2014 + 10/12, year: 2014, race: 'Auckland Marathon',        short: 'AUC', dist: '42.2 km', distId: 'mar',  time: '2:53:09', sec: 10389, pos: 36, total: 2306, cat: 'M 18–34', isPB: false },
      { dateNum: 2015 + 4/12,  year: 2015, race: 'Rotorua Marathon',         short: 'ROT', dist: '42.2 km', distId: 'mar',  time: '2:40:52', sec: 9652,  pos: 7,  total: 1172, cat: 'M 18–34', isPB: false },
      { dateNum: 2015 + 10/12, year: 2015, race: 'Auckland Marathon',        short: 'AUC', dist: '42.2 km', distId: 'mar',  time: '2:30:37', sec: 9037,  pos: 5,  total: 1507, cat: 'M 18–34', isPB: false },
      { dateNum: 2016 + 4/12,  year: 2016, race: 'Rotorua Marathon',         short: 'ROT', dist: '42.2 km', distId: 'mar',  time: '2:28:22', sec: 8902,  pos: 3,  total: 1018, cat: 'M 18–34', isPB: false },
      { dateNum: 2016 + 6/12,  year: 2016, race: 'Christchurch Marathon',    short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:26:38', sec: 8798,  pos: 2,  total:  449, cat: 'M 20–39', isPB: false },
      { dateNum: 2016 + 10/12, year: 2016, race: 'Auckland Marathon',        short: 'AUC', dist: '42.2 km', distId: 'mar',  time: '2:29:38', sec: 8978,  pos: 4,  total: 1630, cat: 'M 18–34', isPB: false },
      { dateNum: 2017 + 6/12,  year: 2017, race: 'Christchurch Marathon',    short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:24:11', sec: 8651,  pos: 1,  total:  420, cat: 'M 20–39', isPB: true  },
      { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Marathon',        short: 'AUC', dist: '42.2 km', distId: 'mar',  time: '2:27:19', sec: 8839,  pos: 4,  total: 1653, cat: 'M 18–34', isPB: false },
      { dateNum: 2019 + 3/12,  year: 2019, race: 'Waterfront Half Marathon', short: 'WF Half', dist: '21.1 km', distId: 'half', time: '1:09:47', sec: 4187, pos: 4, total: 2015, cat: 'M 30–39', isPB: true  },
      { dateNum: 2019 + 4/12,  year: 2019, race: 'Rotorua Marathon',         short: 'ROT', dist: '42.2 km', distId: 'mar',  time: '2:25:38', sec: 8738,  pos: 1,  total:  720, cat: 'M 18–34', isPB: false },
      { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Marathon',        short: 'AUC', dist: '42.2 km', distId: 'mar',  time: '2:31:07', sec: 9067,  pos: 3,  total:  870, cat: 'M 18–34', isPB: false },
      { dateNum: 2023 + 11/12, year: 2023, race: 'Queenstown Marathon',      short: 'QT',  dist: '42.2 km', distId: 'mar',  time: '2:40:38', sec: 9638,  pos: 4,  total: 1841, cat: 'M 30–39', isPB: false },
      { dateNum: 2024 + 11/12, year: 2024, race: 'Queenstown Marathon',      short: 'QT',  dist: '42.2 km', distId: 'mar',  time: '2:34:05', sec: 9245,  pos: 1,  total: 2522, cat: 'M 35–39', isPB: false },
    ],
  },
  {
    name: 'Blair McWhirter',
    slug: 'blair-mcwhirter',
    initials: 'BM',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1985,
    pbs: {
      mar:  { time: '2:25:24', sec: 8724, race: 'Christchurch Marathon', year: 2012 },
      half: { time: '1:08:50', sec: 4130, race: 'Christchurch Half Marathon', year: 2018 },
    },
    results: [
      { dateNum: 2007 + 6/12,  year: 2007, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:48:07', sec: 10087, pos: 9,  total:  350, cat: 'M 20–39', isPB: false },
      { dateNum: 2011 + 6/12,  year: 2011, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:34:30', sec: 9270,  pos: 3,  total:  317, cat: 'M 20–39', isPB: false },
      { dateNum: 2012 + 6/12,  year: 2012, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:25:24', sec: 8724,  pos: 3,  total:  367, cat: 'M 20–39', isPB: true  },
      { dateNum: 2017 + 10/12, year: 2017, race: 'Auckland Marathon',     short: 'AUC', dist: '42.2 km', distId: 'mar',  time: '2:25:59', sec: 8759,  pos: 3,  total: 1565, cat: 'M 35–39', isPB: false },
      { dateNum: 2017 + 11/12, year: 2017, race: 'Queenstown Marathon',   short: 'QT',  dist: '42.2 km', distId: 'mar',  time: '2:32:45', sec: 9165,  pos: 2,  total: 1556, cat: 'M 30–39', isPB: false },
      { dateNum: 2018 + 4/12,  year: 2018, race: 'Rotorua Marathon',      short: 'ROT', dist: '42.2 km', distId: 'mar',  time: '2:28:59', sec: 8939,  pos: 1,  total:  940, cat: 'M 35–39', isPB: false },
      { dateNum: 2018 + 6/12,  year: 2018, race: 'Christchurch Half Marathon', short: 'CHC½', dist: '21.1 km', distId: 'half', time: '1:08:50', sec: 4130, pos: 7, total: 0, cat: 'M 20–39', isPB: false },
      { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Marathon',     short: 'AUC', dist: '42.2 km', distId: 'mar',  time: '2:27:48', sec: 8868,  pos: 5,  total: 1653, cat: 'M 35–39', isPB: false },
      { dateNum: 2019 + 4/12,  year: 2019, race: 'Rotorua Marathon',      short: 'ROT', dist: '42.2 km', distId: 'mar',  time: '2:26:40', sec: 8800,  pos: 2,  total:  720, cat: 'M 35–39', isPB: false },
      { dateNum: 2019 + 6/12,  year: 2019, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:36:34', sec: 9394,  pos: 8,  total:  476, cat: 'M 20–39', isPB: false },
      { dateNum: 2020 + 4/12,  year: 2020, race: 'Rotorua Marathon',      short: 'ROT', dist: '42.2 km', distId: 'mar',  time: '2:33:48', sec: 9228,  pos: 2,  total:  446, cat: 'M 35–39', isPB: false },
      { dateNum: 2021 + 6/12,  year: 2021, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:29:30', sec: 8970,  pos: 4,  total:  478, cat: 'M 20–39', isPB: false },
      { dateNum: 2025 + 6/12,  year: 2025, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar',  time: '2:29:08', sec: 8948,  pos: 4,  total:  957, cat: 'M 40–49', isPB: false },
      { dateNum: 2025 + 11/12, year: 2025, race: 'Queenstown Marathon',   short: 'QT',  dist: '42.2 km', distId: 'mar',  time: '2:32:10', sec: 9130,  pos: 3,  total: 2929, cat: 'M 40–44', isPB: false },
    ],
  },
  {
    name: 'Fabe Downs',
    slug: 'fabe-downs',
    initials: 'FD',
    gender: 'M',
    category: 'Open',
    nationality: 'NZL',
    birthYear: 1987,
    pbs: {
      mar:  { time: '2:26:34', sec: 8794, race: 'Auckland Marathon',    year: 2020 },
      half: { time: '1:09:07', sec: 4147, race: 'Christchurch Half Marathon', year: 2021 },
    },
    results: [
      { dateNum: 2019 + 11/12, year: 2019, race: 'Queenstown Marathon',       short: 'QT',   dist: '42.2 km', distId: 'mar',  time: '2:28:57', sec: 8937, pos: 1, total: 2262, cat: 'M 30–39', isPB: false },
      { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Marathon',         short: 'AUC',  dist: '42.2 km', distId: 'mar',  time: '2:26:34', sec: 8794, pos: 2, total: 1619, cat: 'M 18–34', isPB: true  },
      { dateNum: 2021 + 5/12,  year: 2021, race: "Hawke's Bay Marathon",      short: 'HB',   dist: '42.2 km', distId: 'mar',  time: '2:28:54', sec: 8934, pos: 2, total: 1025, cat: 'M 30–39', isPB: false },
      { dateNum: 2021 + 6/12,  year: 2021, race: 'Christchurch Half Marathon',short: 'CHC½', dist: '21.1 km', distId: 'half', time: '1:09:07', sec: 4147, pos: 5, total: 1332, cat: 'M 20–39', isPB: false },
    ],
  },
];

export function getAthleteBySlug(slug: string): AthleteProfile | undefined {
  return ALL_ATHLETES.find(a => a.slug === slug);
}

export function getAllAthletes(): AthleteProfile[] {
  return ALL_ATHLETES;
}
