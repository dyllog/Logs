import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCat } from './normalizeCats.mjs';
import { parseCsvGrid } from './lib/parseCsv.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvDir = path.join('C:\\Users\\Dylan Logan\\logs-simple\\Race Files\\Auckland Half Marathon Series\\Maraetai Half Marathon');
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

// Parse category like "M2029" → { genderPfx: 'M', ageCat: '20-29' }
function parseOldCat(code) {
  if (!code || code.length < 5) return { genderPfx: 'M', ageCat: 'Open' };
  const gChar = code[0].toUpperCase();
  const genderPfx = gChar === 'F' ? 'W' : 'M';
  const digits = code.slice(1).replace(/[^0-9]/g, '');
  if (digits.length >= 4) {
    let start = parseInt(digits.slice(0, 2), 10);
    const end = parseInt(digits.slice(2, 4), 10);
    if (start < 18) start = 18;
    return { genderPfx, ageCat: `${start}-${end}` };
  }
  return { genderPfx, ageCat: 'Open' };
}

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

    const name = titleCase(cols[1]?.trim() ?? '');
    const bib = parseBib(cols[2]?.trim() ?? '');
    const catRaw = cols[4]?.trim() ?? '';
    const genderRaw = cols[6]?.trim() ?? '';

    const { genderPfx, ageCat } = parseOldCat(catRaw);
    // Override gender from dedicated column if present
    const gFinal = genderRaw === 'Female' ? 'W' : genderRaw === 'Male' ? 'M' : genderPfx;

    const cat = normalizeCat(`${gFinal} ${ageCat}`);
    rows.push({ pos, name, bib, nat: '', cat, club: '—', time, sec });
  }
  return rows;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function fmtMin(s) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

function processYear(year, csvName, outName) {
  const file = path.join(csvDir, csvName);
  if (!fs.existsSync(file)) {
    console.log(`  ${year}: MISSING ${csvName}`);
    return null;
  }
  const text = fs.readFileSync(file, 'utf8');
  const rawRows = parseCSV(text);

  const seen = new Set();
  const rows = rawRows.filter(r => {
    const key = `${r.name}|${r.sec}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const males = rows.filter(r => r.cat.startsWith('M'));
  const females = rows.filter(r => r.cat.startsWith('W'));
  const sorted = [...rows].sort((a, b) => a.sec - b.sec);
  const median = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM = [...males].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW = [...females].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const top10M = [...males].sort((a, b) => a.sec - b.sec).slice(0, 10).reduce((s, r) => s + r.sec, 0) / Math.min(10, males.length);
  const top10W = [...females].sort((a, b) => a.sec - b.sec).slice(0, 10).reduce((s, r) => s + r.sec, 0) / Math.min(10, females.length);
  const avgM = Math.round(males.reduce((s, r) => s + r.sec, 0) / males.length);
  const avgW = Math.round(females.reduce((s, r) => s + r.sec, 0) / females.length);

  const outFile = path.join(outDir, outName);
  fs.writeFileSync(outFile, JSON.stringify(rows));
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  const winnerMName = [...males].sort((a, b) => a.sec - b.sec)[0]?.name ?? '?';
  const winnerWName = [...females].sort((a, b) => a.sec - b.sec)[0]?.name ?? '?';
  console.log(`  ${year}: ${rows.length} finishers (${males.length}M / ${females.length}W) · median ${fmt(median)} · ♂ ${fmt(winnerM)} ${winnerMName} · ♀ ${fmt(winnerW)} ${winnerWName} · ${kb}KB`);

  return {
    year,
    finishers: rows.length,
    avg: median,
    avgMen: avgM,
    avgWomen: avgW,
    winnerM,
    winnerW,
    top10M: Math.round(top10M),
    top10W: Math.round(top10W),
  };
}

const halfYears  = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const tenKYears  = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

console.log('\n── Maraetai Half Marathon (21.1 km) ──');
const halfStats = [];
for (const year of halfYears) {
  const s = processYear(year, `Half Results - ${year}.csv`, `results-maraetai-half-${year}.json`);
  if (s) halfStats.push(s);
}

console.log('\n── Maraetai 10 km ──');
const tenKStats = [];
for (const year of tenKYears) {
  const s = processYear(year, `10k Results - ${year}.csv`, `results-maraetai-10k-${year}.json`);
  if (s) tenKStats.push(s);
}

function fmtRow(s) {
  return `  { year: ${s.year}, finishers: ${String(s.finishers).padStart(4)}, avg: ${String(s.avg).padStart(5)}, avgMen: ${String(s.avgMen).padStart(5)}, avgWomen: ${String(s.avgWomen).padStart(5)}, winnerM: ${String(s.winnerM).padStart(5)}, winnerW: ${String(s.winnerW).padStart(5)}, top10M: ${String(s.top10M).padStart(5)}, top10W: ${String(s.top10W).padStart(5)} },`;
}

console.log('\n── Paste into maraetaiData.ts ──');
console.log('\nmaraetaiHalfStats:');
halfStats.forEach(s => console.log(fmtRow(s)));
console.log('\nmaraetai10kStats:');
tenKStats.forEach(s => console.log(fmtRow(s)));
