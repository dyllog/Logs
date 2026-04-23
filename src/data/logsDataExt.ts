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

const firstM = ["Daniel","Jonah","Sam","Lachlan","Eoin","Rohan","Tane","Matthew","Hayden","Jack","Oliver","Finn","Charlie","Toby","Michael","Ben","Tom","Liam","Nathan","Hugo","Caleb","Patrick","Josh","Ryan","Cameron","Dylan","Luke","Alex","Owen","Ethan","Noah","Hamish","Angus","Callum","Fergus","Jamie","Rhys","Cory","Reuben","Kieran","Marcus","Leon","Troy","Wiremu","Arama","Manaia","Kaelen","Ari","Dominic","Sebastian","Flynn","Jude","Pita","Tipene","Hemi","Rawiri","Mateo","Santiago","Luca"];
const firstW = ["Camille","Mei","Isla","Lauren","Priya","Rebecca","Aroha","Ella","Lucy","Emma","Hannah","Georgia","Sophia","Nina","Ruby","Anika","Millie","Holly","Rose","Clara","Imogen","Beatrice","Tara","Nadia","Kiri","Moana","Waimarie","Heeni","Tui","Ivy","Olive","Poppy","Eloise","Thea","Freya","Matilda","Arabella","Sienna","Charlotte","Chloe","Ava","Mia","Zoe","Lily","Maeve","Sadie","Harper","Alani","Vaitea","Fiamma","Lorenza"];
const last = ["Whareaitu","Kiplimo","Tuwhare","Voigt","Tesfaye","Buchanan","Whitelock","Armitage","Tanaka","McPherson","O'Sullivan","Deane","Henare","Shelley","Orr","Summerfield","Ramanathan","Tremain","Dillon","Bennington","Ngata","Carrington","Wen","Walsh","Alderton","Kingsford","Hollis","Laver","Marston","Pemberton","Quincey","Rothwell","Sinclair","Templeton","Underhill","Vickery","Wainwright","Yelverton","Zhou","Bennett","Cartwright","Drummond","Ellington","Forsythe","Galloway","Harcourt","Inchbald","Jamieson","Karlsson","Lintott","Mainwaring","Nielsen","Oakeshott","Priestley","Ravenscroft","Stokes","Thornhill","Upjohn","Venables","Westbrook","Xiao","Yardley","Zeller","Abbott","Beaumont","Cresswell","Dashwood","Eastwood","Fairweather","Greenhalgh","Heathcote","Ingleton","Jephcott","Kettering","Langridge","Moriarty","Northbrook","Oldershaw","Pinkerton","Quayle","Rashford","Satterthwaite","Tindall","Usherwood","Viret","Wolseley","Yardsley","Addison","Brailsford","Cockburn","Devereux","Enfield","Featherstone","Gascoigne","Hetherington","Irongate","Jardine","Kettlewell","Lacey","Motu","Ngawaka","Paraone","Rangi","Tainui","Uruao","Waititi","Yeoman"];
const clubs = ["Wellington Scottish","Auckland Harriers","Christchurch AC","Owairaka AC","Papakura Striders","Hamilton City","North Harbour Bays","Manawatū Striders","Calliope Harriers","Takapuna Harriers","Lynndale","Waitakere City","Taranaki Harriers","Dunedin AC","Nelson Athletic","Hutt Valley Harriers","Hawke's Bay","Rotorua Road","Marlborough","Tauranga Ramblers","Kapiti Coast","—","—","—","—","—"];
const nats = ["NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","NZL","AUS","AUS","KEN","ETH","GBR","JPN","USA","IRL","CAN","FRA","RSA"];
const cats: [string, number][] = [
  ["M U20",0.02],["M 20–24",0.07],["M 25–29",0.13],["M 30–34",0.15],["M 35–39",0.13],
  ["M 40–44",0.10],["M 45–49",0.07],["M 50–54",0.05],["M 55–59",0.03],["M 60–64",0.015],["M 65+",0.01],
  ["W U20",0.01],["W 20–24",0.04],["W 25–29",0.08],["W 30–34",0.08],["W 35–39",0.07],
  ["W 40–44",0.05],["W 45–49",0.03],["W 50–54",0.02],["W 55–59",0.01],["W 60+",0.005],
];

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

const yearFields: Record<number, number> = {
  2017: 2102, 2018: 2244, 2019: 2402,
  2022: 2180, 2023: 2448, 2024: 2640, 2025: 2775,
};

export interface ResultRow extends Result {
  bib: number;
}

function genYear(year: number): ResultRow[] {
  const rng = mulberry32(year * 991);
  const n = yearFields[year] ?? 2400;
  const yearOffset: Record<number, number> = { 2017: 10, 2018: 0, 2019: -20, 2022: 40, 2023: -30, 2024: -60, 2025: -80 };
  const offset = yearOffset[year] ?? 0;
  const median = 15000 + offset;
  const winnerM = 7800 + Math.floor(rng() * 300) + offset;
  const winnerW = 8800 + Math.floor(rng() * 400) + offset;

  const elite: { gender: string; t: number }[] = [];
  for (let i = 0; i < 22; i++) {
    elite.push({ gender: 'M', t: winnerM + Math.floor(i * (60 + rng() * 50) + rng() * 30) });
  }
  for (let i = 0; i < 8; i++) {
    elite.push({ gender: 'W', t: winnerW + Math.floor(i * (90 + rng() * 60) + rng() * 40) });
  }
  elite.sort((a, b) => a.t - b.t);

  const used = new Set<string>();
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

  const leaderSeed2025: [string, string, string, string][] = [
    ["Daniel Whareaitu","M 25–29","Wellington Scottish","NZL"],
    ["Kipsang Kiplimo","M 30–34","—","KEN"],
    ["Jonah Tuwhare","M 25–29","Auckland Harriers","NZL"],
    ["Michael Voigt","M 35–39","Christchurch AC","NZL"],
    ["Abel Tesfaye","M 25–29","—","ETH"],
  ];

  const rows: ResultRow[] = [];

  for (let i = 0; i < elite.length; i++) {
    const e = elite[i];
    let name: string, cat: string, club: string, nat: string;
    if (year === 2025 && e.gender === 'M' && i < leaderSeed2025.length) {
      [name, cat, club, nat] = leaderSeed2025[i];
      used.add(name);
    } else {
      name = pickName(e.gender);
      cat = pickCat(e.gender);
      club = clubs[Math.floor(rng() * clubs.length)];
      nat = nats[Math.floor(rng() * nats.length)];
    }
    rows.push({
      pos: rows.length + 1,
      bib: 100 + Math.floor(rng() * 900),
      name, cat, club, nat,
      time: formatTime(e.t),
      sec: e.t,
    });
  }

  if (year === 2025) {
    const camilleT = 8890;
    rows.push({
      pos: 0, bib: 412,
      name: "Camille Buchanan",
      cat: "W 30–34", club: "Auckland Harriers", nat: "NZL",
      time: formatTime(camilleT), sec: camilleT,
    });
  }

  for (let i = rows.length; i < n; i++) {
    const u = rng() + rng() + rng() - 1.5;
    const sec = Math.max(9200, Math.floor(median + u * 1700 + rng() * 200));
    const gender = rng() < 0.62 ? 'M' : 'W';
    rows.push({
      pos: 0, bib: 1000 + i,
      name: pickName(gender),
      cat: pickCat(gender),
      club: clubs[Math.floor(rng() * clubs.length)],
      nat: nats[Math.floor(rng() * nats.length)],
      time: formatTime(sec), sec,
    });
  }

  rows.sort((a, b) => a.sec - b.sec);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return rows;
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

function computeYearStats(rows: ResultRow[]): Omit<YearStat, 'year'> {
  const men = rows.filter(r => r.cat.startsWith('M'));
  const women = rows.filter(r => r.cat.startsWith('W'));
  const avg = (arr: ResultRow[]) =>
    arr.length ? Math.round(arr.reduce((s, r) => s + r.sec, 0) / arr.length) : 0;
  return {
    finishers: rows.length,
    avg: avg(rows),
    avgMen: avg(men),
    avgWomen: avg(women),
    winnerM: men[0]?.sec ?? 0,
    winnerW: women[0]?.sec ?? 0,
  };
}

const cache: Record<number, ResultRow[]> = {};

export function getResults(year: number): ResultRow[] {
  if (!cache[year]) cache[year] = genYear(year);
  return cache[year];
}

export const YEARS = [2017, 2018, 2019, 2022, 2023, 2024, 2025] as const;

export const yearStats: YearStat[] = YEARS.map(y => ({
  year: y,
  ...computeYearStats(getResults(y)),
}));

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

export { formatTime, toSec };
