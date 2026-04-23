export function toSec(t: string): number {
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

export const race = {
  name: "Auckland Marathon",
  location: "Auckland, New Zealand",
  surface: "Road",
  distances: ["42.2 km", "21.1 km", "12 km", "5 km"],
  nextDate: "01 Nov 2026",
  established: 1992,
  editions: 33,
  courseNote: "Course revised 2019 — finish relocated to Victoria Park. Historical records pre-2019 noted on the current course for comparability; original-course marks retained separately in the progression chart.",
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
  holder: "Daniel Whareaitu",
  nationality: "NZL",
  club: "Wellington Scottish",
  time: "2:09:54",
  year: 2023,
  age: 28,
  previous: "2:11:08 — Patrick Nthiwa (KEN) 2017",
  progression: [
    { y: 1992, t: "2:21:44", name: "S. McCrae" },
    { y: 1996, t: "2:18:12", name: "S. McCrae" },
    { y: 2001, t: "2:16:05", name: "G. Hargreaves" },
    { y: 2005, t: "2:14:31", name: "R. Hickling" },
    { y: 2009, t: "2:13:18", name: "E. Kibet" },
    { y: 2014, t: "2:12:47", name: "P. Nthiwa" },
    { y: 2017, t: "2:11:08", name: "P. Nthiwa" },
    { y: 2023, t: "2:09:54", name: "D. Whareaitu", current: true },
  ],
};

export const recordsWomen: CourseRecord = {
  holder: "Camille Buchanan",
  nationality: "NZL",
  club: "Auckland Harriers",
  time: "2:27:41",
  year: 2024,
  age: 31,
  previous: "2:29:02 — Lauren Shelley (NZL) 2019",
  broken: true,
  progression: [
    { y: 1994, t: "2:42:11", name: "A. Fellows" },
    { y: 1999, t: "2:38:50", name: "A. Fellows" },
    { y: 2004, t: "2:34:22", name: "J. Bristow" },
    { y: 2010, t: "2:32:06", name: "M. Kibiwott" },
    { y: 2015, t: "2:30:44", name: "M. Kibiwott" },
    { y: 2019, t: "2:29:02", name: "L. Shelley" },
    { y: 2024, t: "2:27:41", name: "C. Buchanan", current: true, broken: true },
  ],
};

export const elevation: [number, number][] = [
  [0,18],[1,22],[2,28],[3,34],[4,40],[5,58],[6,72],
  [7,54],[8,42],[9,38],[10,46],[11,62],[12,80],[13,96],
  [14,84],[15,70],[16,58],[17,68],[18,112],[19,104],
  [20,88],[21,72],[22,58],[23,48],[24,40],[25,46],
  [26,58],[27,72],[28,82],[29,68],[30,54],[31,62],
  [32,74],[33,88],[34,96],[35,82],[36,64],[37,48],
  [38,36],[39,28],[40,22],[41,18],[42.2,14],
];

export const elevationAnnotations = [
  { km: 6,    label: "Harbour Bridge crest" },
  { km: 18,   label: "Curran St climb" },
  { km: 34,   label: "Tāmaki Dr rise" },
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
  [1,  "Daniel Whareaitu",   "M 25–29", "Wellington Scottish",  "2:10:22", "NZL"],
  [2,  "Kipsang Kiplimo",    "M 30–34", "—",                    "2:11:48", "KEN"],
  [3,  "Jonah Tuwhare",      "M 25–29", "Auckland Harriers",    "2:12:15", "NZL"],
  [4,  "Michael Voigt",      "M 35–39", "Christchurch AC",      "2:13:04", "NZL"],
  [5,  "Abel Tesfaye",       "M 25–29", "—",                    "2:13:52", "ETH"],
  [6,  "Camille Buchanan",   "W 30–34", "Auckland Harriers",    "2:28:10", "NZL"],
  [7,  "Sam Whitelock",      "M 30–34", "Papakura Striders",    "2:14:38", "NZL"],
  [8,  "Lachlan Armitage",   "M 25–29", "Hamilton City",        "2:15:02", "NZL"],
  [9,  "Mei Tanaka",         "W 25–29", "—",                    "2:31:44", "JPN"],
  [10, "Isla McPherson",     "W 30–34", "Wellington Scottish",  "2:33:08", "NZL"],
  [11, "Eoin O'Sullivan",    "M 40–44", "Owairaka AC",          "2:16:20", "NZL"],
  [12, "Rohan Deane",        "M 30–34", "North Harbour Bays",   "2:17:04", "NZL"],
  [13, "Tane Henare",        "M 25–29", "Manawatū Striders",    "2:17:38", "NZL"],
  [14, "Lauren Shelley",     "W 35–39", "Auckland Harriers",    "2:34:22", "NZL"],
  [15, "Matthew Orr",        "M 35–39", "Christchurch AC",      "2:18:10", "NZL"],
  [16, "Hayden Summerfield", "M 30–34", "Wellington Scottish",  "2:18:44", "NZL"],
  [17, "Priya Ramanathan",   "W 25–29", "Auckland Harriers",    "2:36:08", "NZL"],
  [18, "Jack Tremain",       "M 25–29", "Owairaka AC",          "2:19:22", "NZL"],
  [19, "Rebecca Dillon",     "W 30–34", "Papakura Striders",    "2:37:44", "NZL"],
  [20, "Oliver Bennington",  "M 40–44", "Hamilton City",        "2:19:58", "NZL"],
  [21, "Aroha Ngata",        "W 25–29", "Manawatū Striders",    "2:38:12", "NZL"],
  [22, "Finn Carrington",    "M 25–29", "North Harbour Bays",   "2:20:30", "NZL"],
  [23, "Charlie Wen",        "M 35–39", "—",                    "2:20:58", "AUS"],
  [24, "Siobhán Walsh",      "W 35–39", "—",                    "2:39:28", "GBR"],
  [25, "Toby Alderton",      "M 30–34", "Wellington Scottish",  "2:21:12", "NZL"],
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
