import { toSec, type Result } from './logsData';

function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const firstM = ["Daniel","Jonah","Sam","Lachlan","Eoin","Rohan","Tane","Matthew","Hayden","Jack","Oliver","Finn","Charlie","Toby","Michael","Ben","Tom","Liam","Nathan","Hugo","Caleb","Patrick","Josh","Ryan","Cameron","Luke","Alex","Owen","Ethan","Noah","Hamish","Angus","Callum","Fergus","Jamie","Rhys","Cory","Reuben","Kieran","Marcus","Leon","Troy","Wiremu","Arama","Manaia","Kaelen","Ari","Dominic","Sebastian","Flynn","Jude","Pita","Tipene","Hemi","Rawiri","Mateo","Santiago","Luca"];
const firstW = ["Camille","Mei","Isla","Lauren","Priya","Rebecca","Aroha","Ella","Lucy","Emma","Hannah","Georgia","Sophia","Nina","Ruby","Anika","Millie","Holly","Rose","Clara","Imogen","Beatrice","Tara","Nadia","Kiri","Moana","Waimarie","Heeni","Tui","Ivy","Olive","Poppy","Eloise","Thea","Freya","Matilda","Arabella","Sienna","Charlotte","Chloe","Ava","Mia","Zoe","Lily","Maeve","Sadie","Harper","Alani","Vaitea","Fiamma","Lorenza"];
const last = ["Whareaitu","Kiplimo","Tuwhare","Voigt","Tesfaye","Buchanan","Whitelock","Armitage","Tanaka","McPherson","O'Sullivan","Deane","Henare","Shelley","Orr","Summerfield","Ramanathan","Tremain","Dillon","Bennington","Ngata","Carrington","Wen","Walsh","Alderton","Kingsford","Hollis","Laver","Marston","Pemberton","Quincey","Rothwell","Sinclair","Templeton","Underhill","Vickery","Wainwright","Yelverton","Zhou","Bennett","Cartwright","Drummond","Ellington","Forsythe","Galloway","Harcourt","Inchbald","Jamieson","Karlsson","Lintott","Mainwaring","Nielsen","Oakeshott","Priestley","Ravenscroft","Stokes","Thornhill","Upjohn","Venables","Westbrook","Xiao","Yardley","Zeller","Abbott","Beaumont","Cresswell","Dashwood","Eastwood","Fairweather","Greenhalgh","Heathcote","Ingleton","Jephcott","Kettering","Langridge","Moriarty","Northbrook","Oldershaw","Pinkerton","Quayle","Rashford","Satterthwaite","Tindall","Usherwood","Viret","Wolseley","Addison","Brailsford","Cockburn","Devereux","Enfield","Featherstone","Gascoigne","Hetherington","Jardine","Kettlewell","Lacey","Motu","Ngawaka","Paraone","Rangi","Tainui","Waititi","Yeoman"];
const clubs = ["Wellington Scottish","Auckland Harriers","Christchurch AC","Owairaka AC","Papakura Striders","Hamilton City","North Harbour Bays","Manawatū Striders","Calliope Harriers","Takapuna Harriers","Lynndale","Waitakere City","Taranaki Harriers","Dunedin AC","Nelson Athletic","Hutt Valley Harriers","Hawke's Bay","Rotorua Road","Marlborough","Tauranga Ramblers","Kapiti Coast","—","—","—","—","—"];
const nats = ["NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","AUS","AUS","KEN","ETH","GBR","JPN","USA","IRL","CAN","FRA","RSA"];
const cats: [string, number][] = [
  ["M U20",0.02],["M 20–24",0.07],["M 25–29",0.13],["M 30–34",0.15],["M 35–39",0.13],
  ["M 40–44",0.10],["M 45–49",0.07],["M 50–54",0.05],["M 55–59",0.03],["M 60–64",0.015],["M 65+",0.01],
  ["W U20",0.01],["W 20–24",0.04],["W 25–29",0.08],["W 30–34",0.08],["W 35–39",0.07],
  ["W 40–44",0.05],["W 45–49",0.03],["W 50–54",0.02],["W 55–59",0.01],["W 60+",0.005],
];

export function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export interface ResultRow extends Result {
  bib: number;
}

// Real top 25 per year: [pos, name, bib, nat, cat, time]
type RealRow = [number, string, number, string, string, string];

const realTopByYear: Record<number, RealRow[]> = {
  2025: [
    [1,  'Daniel Balchin',         3,     'NZL', 'M Elite',  '2:19:55'],
    [2,  'Michael Voss',           4,     'NZL', 'M Elite',  '2:21:01'],
    [3,  'Cam Graves',             2,     'NZL', 'M Elite',  '2:21:04'],
    [4,  'Yusuke Shibuya',         11,    'JPN', 'M Elite',  '2:23:59'],
    [5,  'Taishiro Kawano',        13055, 'NZL', 'M 25–29',  '2:24:36'],
    [6,  'Cullern Thorby',         1,     'NZL', 'M Elite',  '2:26:50'],
    [7,  'Jacob Priddey',          9,     'NZL', 'M Elite',  '2:27:37'],
    [8,  'Riley Henley',           6,     'NZL', 'M Elite',  '2:30:16'],
    [9,  'Bailey Powell',          12106, 'AUS', 'M 25–29',  '2:31:08'],
    [10, 'Matt Parsonage',         12015, 'NZL', 'M 45–49',  '2:35:24'],
    [11, 'Phillip McNamara',       11722, 'NZL', 'M 30–34',  '2:36:21'],
    [12, 'Joel Stansloski',        12437, 'USA', 'M 40–44',  '2:38:04'],
    [13, 'Brigid Dennehy',         2,     'IRL', 'W Elite',  '2:38:10'],
    [14, 'Jono Jackson',           13532, 'NZL', 'M 30–34',  '2:38:13'],
    [15, 'Luke Cotter',            7,     'GBR', 'M Elite',  '2:38:13'],
    [16, 'Brent Godfrey',          13070, 'NZL', 'M 40–44',  '2:38:22'],
    [17, 'Joshua Stewart',         5,     'NZL', 'M Elite',  '2:39:33'],
    [18, 'Joshua Hunter',          11154, 'NZL', 'M 30–34',  '2:39:39'],
    [19, 'Ryan Williams',          12780, 'NZL', 'M 25–29',  '2:39:57'],
    [20, 'Neill Alder',            13066, 'NZL', 'M 40–44',  '2:40:11'],
    [21, 'Stuart Eland',           10722, 'NZL', 'M 30–34',  '2:40:55'],
    [22, 'Austin Carter',          10014, 'NZL', 'M 20–24',  '2:42:34'],
    [23, 'Callan May',             11651, 'NZL', 'M 30–34',  '2:42:42'],
    [24, 'Clarke Foulds',          13111, 'NZL', 'M 25–29',  '2:43:05'],
    [25, 'Tom Zhao',               12887, 'CHN', 'M 40–44',  '2:43:32'],
  ],
  2024: [
    [1,  'Oska Baynes',            8,     'NZL', 'M 30–34',  '2:21:49'],
    [2,  'Daniel Balchin',         10,    'NZL', 'M 30–34',  '2:22:00'],
    [3,  'Michael Voss',           17,    'NZL', 'M 25–29',  '2:22:55'],
    [4,  'Cullern Thorby',         9,     'NZL', 'M 20–24',  '2:22:59'],
    [5,  'Jono Wilkins',           16,    'NZL', 'M 30–34',  '2:25:38'],
    [6,  'Nathan Tse',             12983, 'NZL', 'M 25–29',  '2:26:39'],
    [7,  'Jacob Hendrickx',        10896, 'NZL', 'M 35–39',  '2:28:21'],
    [8,  'Rodwyn Isaacs',          11,    'NZL', 'M 35–39',  '2:29:11'],
    [9,  'Joel Bickers',           13,    'NZL', 'M 20–24',  '2:34:33'],
    [10, 'Cam Graves',             12,    'NZL', 'M 30–34',  '2:35:33'],
    [11, 'Nathan Coombes',         10581, 'NZL', 'M 30–34',  '2:36:09'],
    [12, 'Paul Barwick',           10369, 'NZL', 'M 45–49',  '2:38:14'],
    [13, 'Brent Godfrey',          12853, 'NZL', 'M 40–44',  '2:38:32'],
    [14, 'David Atkinson',         10338, 'GBR', 'M 35–39',  '2:38:39'],
    [15, 'Robert Lee',             12211, 'NZL', 'M 30–34',  '2:39:06'],
    [16, 'Peter Bracken',          12846, 'AUS', 'M 40–44',  '2:39:18'],
    [17, 'Neill Alder',            12838, 'NZL', 'M 40–44',  '2:39:23'],
    [18, 'Sunny Ding',             10241, 'NZL', 'M 30–34',  '2:39:43'],
    [19, 'David Latham',           10035, 'GBR', 'M 35–39',  '2:40:00'],
    [20, 'Joshua Hunter',          10961, 'NZL', 'M 30–34',  '2:40:14'],
    [21, 'Ben Parker',             12270, 'ZAF', 'M 25–29',  '2:40:41'],
    [22, "Will O'Connor",          12855, 'NZL', 'M 35–39',  '2:41:00'],
    [23, 'Brigid Dennehy',         5,     'IRL', 'W 25–29',  '2:41:31'],
    [24, 'Anthony Kenyon-Slade',   12767, 'NZL', 'M 20–24',  '2:41:46'],
    [25, 'Ollie Palmer',           15,    'NZL', 'M 30–34',  '2:42:51'],
  ],
  2023: [
    [1,  'Daniel Balchin',         5,     'NZL', 'M 30–34',  '2:23:09'],
    [2,  'Luke Cotter',            1,     'NZL', 'M 25–29',  '2:25:41'],
    [3,  'Robert Collins',         4,     'AUS', 'M 30–34',  '2:25:48'],
    [4,  'Brett Ellis',            6,     'AUS', 'M 25–29',  '2:28:59'],
    [5,  'Rodwyn Isaacs',          8,     'NZL', 'M 35–39',  '2:29:37'],
    [6,  'Jonathan Jackson',       10209, 'NZL', 'M 30–34',  '2:35:49'],
    [7,  'Arnaud Betems',          10261, 'FRA', 'M 25–29',  '2:37:11'],
    [8,  'Simon Cochrane',         9,     'NZL', 'M 35–39',  '2:38:37'],
    [9,  'Sam Herring',            10799, 'NZL', 'M 35–39',  '2:39:03'],
    [10, 'Brent Godfrey',          10153, 'NZL', 'M 35–39',  '2:39:17'],
    [11, 'Josh Dunstan-Brown',     10165, 'NZL', 'M 30–34',  '2:42:01'],
    [12, 'Gene Rand',              464,   'NZL', 'M 45–49',  '2:42:59'],
    [13, 'Hamish Robertson',       11886, 'NZL', 'M 35–39',  '2:43:41'],
    [14, 'Alice Mason',            12,    'NZL', 'W 35–39',  '2:44:20'],
    [15, 'Dylan Logan',            11036, 'NZL', 'M 25–29',  '2:45:22'],
    [16, 'Benjamin Parker',        11289, 'NZL', 'M 25–29',  '2:45:58'],
    [17, 'Michael Beckmann',       10342, 'NZL', 'M 25–29',  '2:47:01'],
    [18, 'James Walton',           11629, 'NZL', 'M 25–29',  '2:47:58'],
    [19, 'Blair Coleman',          10488, 'NZL', 'M 40–44',  '2:48:11'],
    [20, 'Callan May',             11097, 'NZL', 'M 30–34',  '2:49:08'],
    [21, 'Richard Ellison',        10606, 'NZL', 'M 35–39',  '2:49:57'],
    [22, 'Mitch Cantlon',          10436, 'NZL', 'M 45–49',  '2:49:58'],
    [23, 'Sam Walker',             10048, 'NZL', 'M 40–44',  '2:50:06'],
    [24, 'James Marsh',            11080, 'GBR', 'M 30–34',  '2:50:17'],
    [25, 'Keith Burrows',          591,   'NZL', 'M 45–49',  '2:50:35'],
  ],
  2022: [
    [1,  'Daniel Jones',           10,    '', 'M 18–34',  '2:21:52'],
    [2,  'Daniel Balchin',         17,    '', 'M 18–34',  '2:22:25'],
    [3,  'Luke Cotter',            11,    '', 'M 18–34',  '2:22:49'],
    [4,  'Jacob Hendrickx',        18,    '', 'M 35–39',  '2:29:39'],
    [5,  'William Harris',         13,    '', 'M 18–34',  '2:29:52'],
    [6,  'Michael Marantelli',     16,    '', 'M 35–39',  '2:30:06'],
    [7,  'Jason Hunt',             11349, '', 'M 18–34',  '2:30:16'],
    [8,  'Rodwyn Isaacs',          11396, '', 'M 35–39',  '2:31:17'],
    [9,  'Wayne Spies',            14,    '', 'M 50–54',  '2:36:52'],
    [10, 'Simon Mace',             12,    '', 'M 45–49',  '2:39:23'],
    [11, "Will O'Connor",          10747, '', 'M 18–34',  '2:39:44'],
    [12, 'Benoît Valadier',        11045, '', 'M 35–39',  '2:39:59'],
    [13, 'Tom Mowbray',            10704, '', 'M 18–34',  '2:43:48'],
    [14, 'Tim Hitchcock',          11378, '', 'M 35–39',  '2:44:14'],
    [15, 'Bert Kempenaers',        10503, '', 'M 35–39',  '2:44:33'],
    [16, 'Simon McLean',           10664, '', 'M 18–34',  '2:44:50'],
    [17, 'Sam Walker',             11183, '', 'M 40–44',  '2:44:55'],
    [18, 'Mitch Cantlon',          11284, '', 'M 45–49',  '2:47:20'],
    [19, 'Alvirg Busa',            10138, '', 'M 35–39',  '2:47:36'],
    [20, 'Riley Grove',            10379, '', 'M 18–34',  '2:48:26'],
    [21, 'Simon Keller',           10501, '', 'M 45–49',  '2:49:15'],
    [22, 'Harvey Walsh',           11066, '', 'M 18–34',  '2:49:17'],
    [23, 'Michael Anderson',       10032, '', 'M 40–44',  '2:49:29'],
    [24, 'Hannah Oldroyd',         8,     '', 'W 35–39',  '2:49:30'],
    [25, 'Mitchell Carlyle',       11215, '', 'M 18–34',  '2:50:23'],
  ],
  2021: [
    [1,  'Daniel Jones',           1,     '', 'M 18–34',  '2:20:00'],
    [2,  'Cameron Graves',         2,     '', 'M 18–34',  '2:27:44'],
    [3,  'Ciaran Faherty',         10253, '', 'M 18–34',  '2:31:07'],
    [4,  'Nathan Tse',             4,     '', 'M 18–34',  '2:32:12'],
    [5,  'Jonathan Jackson',       5,     '', 'M 18–34',  '2:36:16'],
    [6,  'Brent Godfrey',          11165, '', 'M 35–39',  '2:44:25'],
    [7,  'Jono Wilkins',           10911, '', 'M 18–34',  '2:44:38'],
    [8,  'Jeroen Mattheus',        10543, '', 'M 18–34',  '2:44:40'],
    [9,  'Daniel Coates',          11109, '', 'M 50–54',  '2:44:50'],
    [10, 'Lisa Cross',             9,     '', 'W 35–39',  '2:50:44'],
    [11, 'Sam Walker',             11167, '', 'M 35–39',  '2:51:44'],
    [12, 'Keith Burrows',          10104, '', 'M 45–49',  '2:52:04'],
    [13, 'Hannah Oldroyd',         8,     '', 'W 18–34',  '2:52:49'],
    [14, 'Haoting Ma',             10512, '', 'M 18–34',  '2:53:54'],
    [15, 'Troy Field',             11243, '', 'M 40–44',  '2:54:15'],
    [16, 'Robert Humby',           11203, '', 'M 18–34',  '2:56:35'],
    [17, 'Harvey Walsh',           10881, '', 'M 18–34',  '2:57:09'],
    [18, 'Kevin Crowe',            11149, '', 'M 18–34',  '2:57:30'],
    [19, 'Benjamin Pretty',        10687, '', 'M 18–34',  '2:57:34'],
    [20, 'Tom Osborne',            10643, '', 'M 35–39',  '2:57:36'],
    [21, 'Seamus Kelly',           11125, '', 'M 18–34',  '2:57:52'],
    [22, 'Marwane El Kamraoui',    10241, '', 'M 40–44',  '2:58:39'],
    [23, 'Brent Nijssen',          10632, '', 'M 40–44',  '2:58:44'],
    [24, 'Craig Smith',            11013, '', 'M 40–44',  '2:59:14'],
    [25, 'Jamie Whyte',            11174, '', 'M 40–44',  '2:59:20'],
  ],
};

const yearFinisherCounts: Record<number, number> = {
  2021: 870,
  2022: 1300,
  2023: 1213,
  2024: 1075,
  2025: 1216,
};

function genYear(year: number): ResultRow[] {
  const realData = realTopByYear[year] || [];
  const realRows: ResultRow[] = realData.map(([pos, name, bib, nat, cat, time]) => ({
    pos, name, bib, nat, cat, club: '—', time, sec: toSec(time),
  }));

  const n = yearFinisherCounts[year] ?? 1200;
  const rng = mulberry32(year * 991);
  const lastRealSec = realRows.length ? realRows[realRows.length - 1].sec : 8700;
  const minProcSec = lastRealSec + 90;

  // Advance RNG past where real-result slots would have seeded it
  for (let i = 0; i < 600; i++) rng();

  const used = new Set<string>(realRows.map(r => r.name));

  const pickName = (gender: string) => {
    for (let i = 0; i < 40; i++) {
      const pool = gender === 'M' ? firstM : firstW;
      const f = pool[Math.floor(rng() * pool.length)];
      const l = last[Math.floor(rng() * last.length)];
      const full = `${f} ${l}`;
      if (!used.has(full)) { used.add(full); return full; }
    }
    return `${gender === 'M' ? firstM[0] : firstW[0]} ${last[0]}-${Math.floor(rng() * 999)}`;
  };

  const pickCat = (gender: string) => {
    const pool = cats.filter(c => c[0].startsWith(gender));
    const total = pool.reduce((s, c) => s + c[1], 0);
    let r = rng() * total;
    for (const c of pool) { r -= c[1]; if (r <= 0) return c[0]; }
    return pool[0][0];
  };

  const procRows: ResultRow[] = [];
  for (let i = realRows.length; i < n; i++) {
    const u = rng() + rng() + rng() - 1.5;
    const sec = Math.max(minProcSec, Math.floor(17100 + u * 2200 + rng() * 400));
    const gender = rng() < 0.62 ? 'M' : 'W';
    procRows.push({
      pos: 0,
      bib: 1000 + Math.floor(rng() * 12000),
      name: pickName(gender),
      cat: pickCat(gender),
      club: clubs[Math.floor(rng() * clubs.length)],
      nat: nats[Math.floor(rng() * nats.length)],
      time: formatTime(sec), sec,
    });
  }

  const all = [...realRows, ...procRows];
  all.sort((a, b) => a.sec - b.sec);
  all.forEach((r, i) => { r.pos = i + 1; });
  return all;
}

export interface YearStat {
  year: number;
  finishers: number;
  avg: number;
  avgMen: number;
  avgWomen: number;
  winnerM: number;
  winnerW: number;
}

const cache: Record<number, ResultRow[]> = {};

export function getResults(year: number): ResultRow[] {
  if (!cache[year]) cache[year] = genYear(year);
  return cache[year];
}

export const YEARS = [2021, 2022, 2023, 2024, 2025] as const;

// Real winner times + real finisher counts; medians estimated from field distribution
export const yearStats: YearStat[] = [
  { year: 2021, finishers: 870,  avg: 17640, avgMen: 16920, avgWomen: 19380, winnerM: toSec('2:20:00'), winnerW: toSec('2:50:44') },
  { year: 2022, finishers: 1300, avg: 17460, avgMen: 16800, avgWomen: 19080, winnerM: toSec('2:21:52'), winnerW: toSec('2:49:30') },
  { year: 2023, finishers: 1213, avg: 17280, avgMen: 16560, avgWomen: 18840, winnerM: toSec('2:23:09'), winnerW: toSec('2:44:20') },
  { year: 2024, finishers: 1075, avg: 17100, avgMen: 16380, avgWomen: 18600, winnerM: toSec('2:21:49'), winnerW: toSec('2:41:31') },
  { year: 2025, finishers: 1216, avg: 17220, avgMen: 16500, avgWomen: 18720, winnerM: toSec('2:19:55'), winnerW: toSec('2:38:10') },
];

export const courseStats = {
  climb: 412,
  descent: 404,
  net: 8,
  maxElev: 112,
  minElev: 12,
  longestClimb: "km 5.5 → 7.0 · Harbour Bridge (+54 m)",
  longestDescent: "km 7 → 9 · Curran St descent (-48 m)",
  surface: "Sealed road · 2 bridges · 1 harbour crossing",
  certified: "AIMS/World Athletics · cert. NZ/2019/04",
};

export { toSec };
