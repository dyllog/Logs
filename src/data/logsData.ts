export function toSec(t: string): number {
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

export interface DistanceRecord {
  time: string;
  holder: string;
  nationality: string;
  club: string;
  year: number;
  previous: string;
  broken?: boolean;
}

export interface DistanceOption {
  id: string;
  km: number;
  label: string;
  long: string;
  climb: number;
  descent: number;
  net: number;
  courseNote: string;
  recordM: DistanceRecord;
  recordW: DistanceRecord;
}

export const DISTANCE_OPTIONS: DistanceOption[] = [
  {
    id: '42', km: 42.195, label: '42.2 km', long: 'Marathon',
    climb: 118, descent: 105, net: 13,
    courseNote: 'Devonport → Harbour Bridge → Victoria Park · point-to-point',
    recordM: {
      time: '2:19:32', holder: 'Isaias Beyn', nationality: '—', club: '—', year: 2019,
      previous: '2:20:36 — Oska Baynes (NZL) 2016',
    },
    recordW: {
      time: '2:38:10', holder: 'Brigid Dennehy', nationality: 'IRL', club: '—', year: 2025,
      previous: '2:41:31 — Brigid Dennehy (IRL) 2024', broken: true,
    },
  },
  {
    id: '21', km: 21.0975, label: '21.1 km', long: 'Half marathon',
    climb: 54, descent: 48, net: 6,
    courseNote: 'Takapuna → Harbour Bridge → Victoria Park',
    recordM: {
      time: '1:04:37', holder: 'Tim Vincent', nationality: 'AUS', club: '—', year: 2023,
      previous: '1:05:23 — Cameron Graves (NZL) 2020',
    },
    recordW: {
      time: '1:13:45', holder: 'Camille Buscomb', nationality: 'NZL', club: '—', year: 2020,
      previous: '1:15:48 — Olivia Burne (NZL) 2017',
    },
  },
  {
    id: '11', km: 11, label: '11 km', long: '11 km',
    climb: 34, descent: 29, net: 5,
    courseNote: 'Akoranga → Harbour Bridge → Victoria Park',
    recordM: { time: '—', holder: '—', nationality: '—', club: '—', year: 0, previous: '—' },
    recordW: { time: '—', holder: '—', nationality: '—', club: '—', year: 0, previous: '—' },
  },
  {
    id: '5', km: 5, label: '5 km', long: '5 km',
    climb: 12, descent: 8, net: 4,
    courseNote: 'Wynyard Quarter loop · flat',
    recordM: { time: '—', holder: '—', nationality: '—', club: '—', year: 0, previous: '—' },
    recordW: { time: '—', holder: '—', nationality: '—', club: '—', year: 0, previous: '—' },
  },
];

export const race = {
  name: "Auckland Marathon",
  location: "Auckland, New Zealand",
  surface: "Road",
  distances: ["42.2 km", "21.1 km", "11 km", "5 km"],
  nextDate: "01 Nov 2026",
  established: 1992,
  editions: 33,
  organiser: "IRONMAN New Zealand Limited",
  courseNote: "Course revised 2019 — finish relocated to Victoria Park interior, adding 340 m and removing the Fanshawe Street dogleg. Pre-2019 records archived separately.",
};

export interface RecordPoint {
  y: number;
  t: string;
  name: string;
  current?: boolean;
  broken?: boolean;
}

export interface CourseRecord {
  holder: string;
  nationality: string;
  club: string;
  time: string;
  year: number;
  age: number;
  previous: string;
  broken?: boolean;
  progression: RecordPoint[];
}

export const recordsMen: CourseRecord = {
  holder: "Isaias Beyn",
  nationality: "—",
  club: "—",
  time: "2:19:32",
  year: 2019,
  age: 0,
  previous: "2:20:36 — Oska Baynes (NZL) 2016",
  progression: [
    { y: 2014, t: "2:27:38", name: "S. Lett" },
    { y: 2015, t: "2:27:01", name: "A. Pulford" },
    { y: 2016, t: "2:20:36", name: "O. Baynes" },
    { y: 2019, t: "2:19:32", name: "I. Beyn", current: true },
  ],
};

export const recordsWomen: CourseRecord = {
  holder: "Brigid Dennehy",
  nationality: "IRL",
  club: "—",
  time: "2:38:10",
  year: 2025,
  age: 29,
  previous: "2:41:31 — Brigid Dennehy (IRL) 2024",
  broken: true,
  progression: [
    { y: 1995, t: "2:58:20", name: "S. Hughes" },
    { y: 2001, t: "2:54:08", name: "K. Briggs" },
    { y: 2006, t: "2:50:44", name: "T. Kimani" },
    { y: 2013, t: "2:46:08", name: "R. Fletcher" },
    { y: 2023, t: "2:44:20", name: "A. Mason" },
    { y: 2024, t: "2:41:31", name: "B. Dennehy" },
    { y: 2025, t: "2:38:10", name: "B. Dennehy", current: true, broken: true },
  ],
};

// Elevation profile derived from official Auckland Marathon course map.
// Bridge deck peaks at ~43 m; Tamaki Drive is sea-level flat; finish at Victoria Park ~18 m.
export const elevation: [number, number][] = [
  [0,5],[1,8],[2,11],[3,10],[4,8],[5,7],[6,6],[7,7],[8,8],[9,7],
  [10,8],[11,9],[12,7],[13,6],[14,15],[15,36],[16,43],[17,22],
  [18,9],[19,6],[20,7],[21,5],[22,4],[23,4],[24,4],[25,4],
  [26,4],[27,4],[28,4],[29,4],[30,4],[31,4],[32,4],[33,4],
  [34,4],[35,4],[36,4],[37,4],[38,4],[39,8],[40,11],[41,15],[42.2,18],
];

export const elevationAnnotations = [
  { km: 4,    label: "Winscombe St" },
  { km: 16,   label: "Harbour Bridge (43 m)" },
  { km: 23,   label: "Tamaki Drive" },
  { km: 38,   label: "Turn · Tamaki Dr" },
  { km: 42.2, label: "Finish — Victoria Park" },
];

export interface Result {
  pos: number;
  name: string;
  cat: string;
  club: string;
  time: string;
  nat: string;
  sec: number;
}

export const results2025: Result[] = [
  [1,  'Daniel Balchin',       'M Elite',   '—', '2:19:55', 'NZL'],
  [2,  'Michael Voss',         'M Elite',   '—', '2:21:01', 'NZL'],
  [3,  'Cam Graves',           'M Elite',   '—', '2:21:04', 'NZL'],
  [4,  'Yusuke Shibuya',       'M Elite',   '—', '2:23:59', 'JPN'],
  [5,  'Taishiro Kawano',      'M 25–29',   '—', '2:24:36', 'NZL'],
  [6,  'Cullern Thorby',       'M Elite',   '—', '2:26:50', 'NZL'],
  [7,  'Jacob Priddey',        'M Elite',   '—', '2:27:37', 'NZL'],
  [8,  'Riley Henley',         'M Elite',   '—', '2:30:16', 'NZL'],
  [9,  'Bailey Powell',        'M 25–29',   '—', '2:31:08', 'AUS'],
  [10, 'Matt Parsonage',       'M 45–49',   '—', '2:35:24', 'NZL'],
  [11, 'Phillip McNamara',     'M 30–34',   '—', '2:36:21', 'NZL'],
  [12, 'Joel Stansloski',      'M 40–44',   '—', '2:38:04', 'USA'],
  [13, 'Brigid Dennehy',       'W Elite',   '—', '2:38:10', 'IRL'],
  [14, 'Jono Jackson',         'M 30–34',   '—', '2:38:13', 'NZL'],
  [15, 'Luke Cotter',          'M Elite',   '—', '2:38:13', 'GBR'],
  [16, 'Brent Godfrey',        'M 40–44',   '—', '2:38:22', 'NZL'],
  [17, 'Joshua Stewart',       'M Elite',   '—', '2:39:33', 'NZL'],
  [18, 'Joshua Hunter',        'M 30–34',   '—', '2:39:39', 'NZL'],
  [19, 'Ryan Williams',        'M 25–29',   '—', '2:39:57', 'NZL'],
  [20, 'Neill Alder',          'M 40–44',   '—', '2:40:11', 'NZL'],
  [21, 'Stuart Eland',         'M 30–34',   '—', '2:40:55', 'NZL'],
  [22, 'Austin Carter',        'M 20–24',   '—', '2:42:34', 'NZL'],
  [23, 'Callan May',           'M 30–34',   '—', '2:42:42', 'NZL'],
  [24, 'Clarke Foulds',        'M 25–29',   '—', '2:43:05', 'NZL'],
  [25, 'Tom Zhao',             'M 40–44',   '—', '2:43:32', 'CHN'],
].map((r: any[]) => ({
  pos: r[0], name: r[1], cat: r[2], club: r[3], time: r[4], nat: r[5], sec: toSec(r[4]),
}));

export interface AthleteResult {
  year: number;
  event: string;
  dist: string;
  time: string;
  pos: number;
  agPos: number;
  note: string;
}

export const athleteProfile = {
  name: "Daniel Whareaitu",
  club: "Wellington Scottish",
  born: 1995,
  nationality: "NZL",
  pbs: {
    "42.2 km": "2:09:54",
    "21.1 km": "1:02:14",
    "10 km":   "28:22",
    "5 km":    "13:48",
  },
  results: [
    { year: 2025, event: "Auckland Marathon",    dist: "42.2 km", time: "2:10:22", pos: 1, agPos: 1, note: "" },
    { year: 2024, event: "Queenstown Marathon",  dist: "42.2 km", time: "2:11:10", pos: 2, agPos: 1, note: "" },
    { year: 2024, event: "Rotorua Marathon",     dist: "42.2 km", time: "2:12:08", pos: 1, agPos: 1, note: "" },
    { year: 2023, event: "Auckland Marathon",    dist: "42.2 km", time: "2:09:54", pos: 1, agPos: 1, note: "CR" },
    { year: 2023, event: "Wellington Half",      dist: "21.1 km", time: "1:02:14", pos: 1, agPos: 1, note: "PB" },
    { year: 2022, event: "Auckland Marathon",    dist: "42.2 km", time: "2:12:44", pos: 3, agPos: 2, note: "" },
    { year: 2022, event: "Christchurch Marathon",dist: "42.2 km", time: "2:13:18", pos: 2, agPos: 2, note: "" },
    { year: 2021, event: "Rotorua Marathon",     dist: "42.2 km", time: "2:14:02", pos: 4, agPos: 3, note: "" },
    { year: 2020, event: "Wellington Marathon",  dist: "42.2 km", time: "2:16:20", pos: 6, agPos: 4, note: "" },
    { year: 2019, event: "Auckland Half",        dist: "21.1 km", time: "1:04:38", pos: 8, agPos: 5, note: "Debut" },
  ] as AthleteResult[],
  progression: [
    { y: 2019, s: toSec("2:22:40") },
    { y: 2020, s: toSec("2:16:20") },
    { y: 2021, s: toSec("2:14:02") },
    { y: 2022, s: toSec("2:12:44") },
    { y: 2023, s: toSec("2:09:54") },
    { y: 2024, s: toSec("2:11:10") },
    { y: 2025, s: toSec("2:10:22") },
  ],
};

export const upcoming = [
  { name: "Queenstown Marathon",   date: "15 Nov 2026", loc: "Queenstown",   dists: "42.2 / 21.1 / 10" },
  { name: "Taupō Ultramarathon",   date: "06 Dec 2026", loc: "Taupō",        dists: "50 / 100" },
  { name: "Kepler Challenge",      date: "13 Dec 2026", loc: "Te Anau",      dists: "60 km trail" },
  { name: "Buller Gorge Marathon", date: "07 Feb 2027", loc: "Westport",     dists: "42.2 / 21.1" },
  { name: "Round the Bays",        date: "08 Mar 2027", loc: "Auckland",     dists: "8.4" },
  { name: "Rotorua Marathon",      date: "02 May 2027", loc: "Rotorua",      dists: "42.2 / 21.1 / 10" },
];
