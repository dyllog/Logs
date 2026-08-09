import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvGrid } from './lib/parseCsv.mjs';

function normalizeCat(cat) {
  if (!cat || cat === '—') return cat;
  const m = cat.match(/^([MW])\s+(.+)$/);
  if (!m) return cat;
  const g = m[1];
  let rest = m[2].trim();
  if (/^elite$/i.test(rest)) return `${g} Elite`;
  if (/^open$/i.test(rest))  return `${g} Open`;
  if (/^(under\s*20|u\s*20)$/i.test(rest)) return `${g} 18–19`;
  rest = rest.replace(/-/g, '–');
  if (/^1[456]–19$/.test(rest)) return `${g} 18–19`;
  if (/^\d{1,2}–34$/.test(rest) && parseInt(rest, 10) < 18) return `${g} 18–34`;
  if (/^7[56]–\d+$/.test(rest)) return `${g} 75+`;
  if (/^[89]\d–/.test(rest)) return `${g} 75+`;
  if (/^[89]\d\+$/.test(rest)) return `${g} 75+`;
  if (rest === '75+') return `${g} 75+`;
  return `${g} ${rest}`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvDir = 'C:\\Users\\Dylan Logan\\logs-simple\\Race Files\\Wellington Marathon';
const outDir = path.join(__dirname, '../public/data');

function toSec(t) {
  if (!t) return 0;
  const p = t.split(':').map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  return p[0] * 60 + p[1];
}

function titleCase(s) {
  return s.toLowerCase()
    .replace(/(?:^|[\s\-'])\S/g, c => c.toUpperCase())
    .replace(/\bMc(\w)/g, (_, c) => 'Mc' + c.toUpperCase())
    .replace(/\bO'(\w)/g,  (_, c) => "O'" + c.toUpperCase());
}

function parseBib(raw) {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

// Handles all observed Wellington formats:
//   1996 half: no category column, Gender="X"
//   1997-2005 half / 2005 mar: MOPEN / Mopen / M4549 / F3539 etc.  (no Net Time)
//   2006+ half + mar: MOPEN / M18-39 / M40-44 / M18-34 etc.        (has Net Time)
function parseCatAndGender(catRaw, genderColRaw) {
  const gRaw = (catRaw ?? '').trim();
  let genderPfx = 'X';
  let ageCat = 'Open';

  if (gRaw) {
    // "MOPEN", "Mopen", "FOPEN", "Fopen"
    if (/^[MF]OPEN$/i.test(gRaw)) {
      genderPfx = gRaw[0].toUpperCase() === 'F' ? 'W' : 'M';
      ageCat = 'Open';
    }
    // "M18-39", "F40-44", "M13-19", "M20-34", "M35-39" etc.
    else if (/^[MF]\d{1,2}-\d{2,3}$/i.test(gRaw)) {
      const g = gRaw[0].toUpperCase();
      genderPfx = g === 'F' ? 'W' : 'M';
      const digits = gRaw.slice(1).split('-').map(Number);
      let start = digits[0], end = digits[1];
      if (start < 18) start = 18;
      ageCat = `${start}-${end}`;
    }
    // "M3539", "F4044", "M4549" (compact 4-digit, no dash)
    else if (/^[MF]\d{4}$/i.test(gRaw)) {
      const g = gRaw[0].toUpperCase();
      genderPfx = g === 'F' ? 'W' : 'M';
      const digits = gRaw.slice(1);
      let start = parseInt(digits.slice(0, 2), 10);
      const end   = parseInt(digits.slice(2, 4), 10);
      if (start < 18) start = 18;
      ageCat = `${start}-${end}`;
    }
    // "M75+", "F75+"
    else if (/^[MF]\d{2}\+$/i.test(gRaw)) {
      const g = gRaw[0].toUpperCase();
      genderPfx = g === 'F' ? 'W' : 'M';
      ageCat = '75+';
    }
  }

  // Override gender from dedicated gender column (M/F beats category inference)
  const g = genderColRaw?.trim().toUpperCase();
  if (g === 'F') genderPfx = 'W';
  else if (g === 'M') genderPfx = 'M';

  return { genderPfx, ageCat };
}

function parseCSV(text) {
  const lines = parseCsvGrid(text);
  if (lines.length < 2) return [];

  const header = lines[0].join(',').toLowerCase();
  const hasNetTime  = header.includes('net time');
  const hasCategory = header.includes('category');

  // Column layout:
  //   A (1996): Pos,Name,Bib,Time,Gender,GenderPos,col    (no cat, gender=X)
  //   B (no Net Time, has Cat): Pos,Name,Bib,Time,Cat,CatPos,Gender,GenderPos,col
  //   C (has Net Time):         Pos,Name,Bib,Time,NetTime,Cat,CatPos,Gender,GenderPos,col
  const iCat    = !hasCategory ? -1 : hasNetTime ? 5 : 4;
  const iGender = !hasCategory ? 4  : hasNetTime ? 7 : 6;

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i];
    const pos = parseInt(cols[0]?.trim() ?? '', 10);
    if (!pos || pos <= 0 || isNaN(pos)) continue;

    const time = cols[3]?.trim() ?? '';
    if (!time || !time.includes(':')) continue;
    const sec = toSec(time);
    if (sec <= 0) continue;

    const name      = titleCase(cols[1]?.trim() ?? '');
    const bib       = parseBib(cols[2]?.trim() ?? '');
    const catRaw    = iCat >= 0 ? (cols[iCat]?.trim() ?? '') : '';
    const genderRaw = cols[iGender]?.trim() ?? '';

    const { genderPfx, ageCat } = parseCatAndGender(catRaw, genderRaw);

    const cat = genderPfx === 'X'
      ? 'Open'
      : normalizeCat(`${genderPfx} ${ageCat}`);

    rows.push({ pos, name, bib, nat: '', cat, club: '—', time, sec });
  }
  return rows;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
function safeAvg(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, r) => s + r.sec, 0) / arr.length);
}
function safeTop10Avg(arr) {
  const top = [...arr].sort((a, b) => a.sec - b.sec).slice(0, 10);
  if (!top.length) return 0;
  return Math.round(top.reduce((s, r) => s + r.sec, 0) / top.length);
}

function processYear(year, distLabel, filePrefix) {
  const file = path.join(csvDir, `Wellington Marathon - ${filePrefix} - ${year}.csv`);
  if (!fs.existsSync(file)) { console.log(`  ${year}: MISSING`); return null; }

  const text = fs.readFileSync(file, 'utf8');
  const rawRows = parseCSV(text);

  const seen = new Set();
  const rows = rawRows.filter(r => {
    const key = `${r.name}|${r.sec}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const males   = rows.filter(r => r.cat.startsWith('M'));
  const females = rows.filter(r => r.cat.startsWith('W'));
  const sorted  = [...rows].sort((a, b) => a.sec - b.sec);
  const median  = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;

  const noGender = males.length === 0 && females.length === 0;
  const winnerM  = males.length   ? [...males].sort((a,b)=>a.sec-b.sec)[0].sec   : (noGender ? sorted[0]?.sec ?? 0 : 0);
  const winnerW  = females.length ? [...females].sort((a,b)=>a.sec-b.sec)[0].sec : (noGender ? sorted[0]?.sec ?? 0 : 0);
  const avgM     = males.length   ? safeAvg(males)   : (noGender ? median : 0);
  const avgW     = females.length ? safeAvg(females) : (noGender ? median : 0);
  const top10M   = males.length   ? safeTop10Avg(males)   : (noGender ? safeTop10Avg(sorted) : 0);
  const top10W   = females.length ? safeTop10Avg(females) : (noGender ? safeTop10Avg(sorted) : 0);

  const winNameM = males.length   ? [...males].sort((a,b)=>a.sec-b.sec)[0].name   : (sorted[0]?.name ?? '?');
  const winNameW = females.length ? [...females].sort((a,b)=>a.sec-b.sec)[0].name : (noGender ? '(no gender data)' : '?');

  const slug = distLabel === 'mar' ? `results-wellington-mar-${year}.json` : `results-wellington-half-${year}.json`;
  const outFile = path.join(outDir, slug);
  fs.writeFileSync(outFile, JSON.stringify(rows));
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  const genderNote = noGender ? ' [no gender data]' : `${males.length}M / ${females.length}W`;
  console.log(`  ${year}: ${rows.length} finishers (${genderNote}) · median ${fmt(median)} · ♂ ${fmt(winnerM)} ${winNameM} · ♀ ${fmt(winnerW)} ${winNameW} · ${kb}KB`);

  return { year, finishers: rows.length, avg: median, avgMen: avgM, avgWomen: avgW, winnerM, winnerW, top10M, top10W };
}

function fmtRow(s) {
  return `  { year: ${s.year}, finishers: ${String(s.finishers).padStart(5)}, avg: ${String(s.avg).padStart(5)}, avgMen: ${String(s.avgMen).padStart(5)}, avgWomen: ${String(s.avgWomen).padStart(5)}, winnerM: ${String(s.winnerM).padStart(5)}, winnerW: ${String(s.winnerW).padStart(5)}, top10M: ${String(s.top10M).padStart(5)}, top10W: ${String(s.top10W).padStart(5)} },`;
}

// ── Marathon (2005–2025, missing 2020/2021) ──────────────────────────────────
const marYears = [2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2022,2023,2024,2025];
console.log('\n── Wellington Marathon (42.2 km) ──');
const marStats = [];
for (const year of marYears) {
  const s = processYear(year, 'mar', 'Marathon Results');
  if (s) marStats.push(s);
}
console.log('\n── Paste into wellingtonData.ts — marStats ──');
marStats.forEach(s => console.log(fmtRow(s)));

// ── Half Marathon (1996–2025, missing 2020/2021) ─────────────────────────────
const halfYears = [1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2022,2023,2024,2025];
console.log('\n── Wellington Half Marathon (21.1 km) ──');
const halfStats = [];
for (const year of halfYears) {
  const s = processYear(year, 'half', 'Half Results');
  if (s) halfStats.push(s);
}
console.log('\n── Paste into wellingtonData.ts — halfStats ──');
halfStats.forEach(s => console.log(fmtRow(s)));

console.log('\nDone.');
