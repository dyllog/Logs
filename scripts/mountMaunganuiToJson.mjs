import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCat } from './normalizeCats.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvDir = 'C:\\Users\\Dylan Logan\\logs-simple\\Race Files\\Mount Maunganui Half Marathon';
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
    .replace(/\bO'(\w)/g, (_, c) => "O'" + c.toUpperCase());
}

function parseBib(raw) {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

// Format: Position,Name,Bib,Time,Gender,Gender Position,Age Group,Age Group Position
// Col 0: Position, Col 1: Name, Col 2: Bib, Col 3: Time,
// Col 4: Gender (M/F), Col 5: Gender Position, Col 6: Age Group, Col 7: Age Group Position
function parseCSV(text) {
  const lines = parseCsvGrid(text);
  if (lines.length < 2) return [];

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i];
    const pos = parseInt(cols[0]?.trim() ?? '', 10);
    if (!pos || pos <= 0 || isNaN(pos)) continue;

    const time = cols[3]?.trim() ?? '';
    if (!time || !time.includes(':')) continue;
    const sec = toSec(time);
    if (sec <= 0) continue;

    const name     = titleCase(cols[1]?.trim() ?? '');
    const bib      = parseBib(cols[2]?.trim() ?? '');
    const genderRaw = cols[4]?.trim() ?? '';
    const ageCat    = cols[6]?.trim() ?? 'Open';

    const genderPfx = genderRaw.toUpperCase() === 'F' ? 'W' : 'M';
    const cat = normalizeCat(`${genderPfx} ${ageCat}`);

    rows.push({ pos, name, bib, nat: '', cat, club: '—', time, sec });
  }
  return rows;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    : `${m}:${String(ss).padStart(2, '0')}`;
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

function processYear(csvName, outName, year) {
  const file = path.join(csvDir, csvName);
  if (!fs.existsSync(file)) { console.log(`  ${year}: MISSING (${csvName})`); return null; }

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
  const winnerM = males.length   ? [...males].sort((a, b) => a.sec - b.sec)[0].sec : 0;
  const winnerW = females.length ? [...females].sort((a, b) => a.sec - b.sec)[0].sec : 0;
  const avgM    = males.length   ? safeAvg(males)   : 0;
  const avgW    = females.length ? safeAvg(females) : 0;
  const top10M  = males.length   ? safeTop10Avg(males)   : 0;
  const top10W  = females.length ? safeTop10Avg(females) : 0;

  const winNameM = males.length   ? [...males].sort((a, b) => a.sec - b.sec)[0].name : '?';
  const winNameW = females.length ? [...females].sort((a, b) => a.sec - b.sec)[0].name : '?';

  const outFile = path.join(outDir, outName);
  fs.writeFileSync(outFile, JSON.stringify(rows));
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`  ${year}: ${rows.length} finishers (${males.length}M / ${females.length}W) · median ${fmt(median)} · ♂ ${fmt(winnerM)} ${winNameM} · ♀ ${fmt(winnerW)} ${winNameW} · ${kb}KB`);

  return { year, finishers: rows.length, avg: median, avgMen: avgM, avgWomen: avgW, winnerM, winnerW, top10M, top10W };
}

function fmtRow(s) {
  return `  { year: ${s.year}, finishers: ${String(s.finishers).padStart(4)}, avg: ${String(s.avg).padStart(5)}, avgMen: ${String(s.avgMen).padStart(5)}, avgWomen: ${String(s.avgWomen).padStart(5)}, winnerM: ${String(s.winnerM).padStart(5)}, winnerW: ${String(s.winnerW).padStart(5)}, top10M: ${String(s.top10M).padStart(5)}, top10W: ${String(s.top10W).padStart(5)} },`;
}

const years = [2016, 2017, 2018, 2019, 2020, 2022, 2023, 2024, 2025];

// ── Half Marathon ─────────────────────────────────────────────────────────────
console.log('\n── Mt Maunganui Half Marathon (21.1 km) ──');
const halfStats = [];
for (const year of years) {
  // Handle typo in 2024 filename: "Half Reuslts - 2024.csv"
  const csvName = year === 2024
    ? `Half Reuslts - ${year}.csv`
    : `Half Results - ${year}.csv`;
  const s = processYear(csvName, `results-mtm-half-${year}.json`, year);
  if (s) halfStats.push(s);
}

// ── 10k ───────────────────────────────────────────────────────────────────────
console.log('\n── Mt Maunganui 10k ──');
const tenKStats = [];
for (const year of years) {
  // Handle typo in 2025 filename: "10k Reuslts - 2025.csv"
  const csvName = year === 2025
    ? `10k Reuslts - ${year}.csv`
    : `10k Results - ${year}.csv`;
  const s = processYear(csvName, `results-mtm-10k-${year}.json`, year);
  if (s) tenKStats.push(s);
}

// ── 5k ────────────────────────────────────────────────────────────────────────
console.log('\n── Mt Maunganui 5k ──');
const fiveKStats = [];
for (const year of years) {
  const s = processYear(`5k Results - ${year}.csv`, `results-mtm-5k-${year}.json`, year);
  if (s) fiveKStats.push(s);
}

// ── Stats output ──────────────────────────────────────────────────────────────
console.log('\n── Paste into mtmData.ts: halfStats ──');
halfStats.forEach(s => console.log(fmtRow(s)));
console.log('\n── Paste into mtmData.ts: tenKStats ──');
tenKStats.forEach(s => console.log(fmtRow(s)));
console.log('\n── Paste into mtmData.ts: fiveKStats ──');
fiveKStats.forEach(s => console.log(fmtRow(s)));

// ── Winner breakdown (for course records) ─────────────────────────────────────
console.log('\n── Half winners by year ──');
for (const year of years) {
  const csvName = year === 2024 ? `Half Reuslts - ${year}.csv` : `Half Results - ${year}.csv`;
  const file = path.join(csvDir, csvName);
  if (!fs.existsSync(file)) continue;
  const rows = parseCSV(fs.readFileSync(file, 'utf8'));
  const males   = rows.filter(r => r.cat.startsWith('M')).sort((a, b) => a.sec - b.sec);
  const females = rows.filter(r => r.cat.startsWith('W')).sort((a, b) => a.sec - b.sec);
  const mW = males[0];
  const fW = females[0];
  console.log(`  ${year}: ♂ ${mW ? fmt(mW.sec) + ' ' + mW.name : '?'}  ♀ ${fW ? fmt(fW.sec) + ' ' + fW.name : '?'}`);
}

// Rebuild search index
import { execSync } from 'child_process';
import { parseCsvGrid } from './lib/parseCsv.mjs';
execSync('node scripts/build-search-index.mjs', { stdio: 'inherit' });
