import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import catCodes from './lib/categoryCodes.cjs';
import { parseCsvGrid } from './lib/parseCsv.mjs';

const { mapRaceCategory } = catCodes;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join('C:\\Users\\Dylan Logan\\logs-simple\\Race Files\\Run21');
const outDir = path.join(__dirname, '../public/data');

// Report any category codes the shared decoder can't parse, rather than letting
// an unknown code silently become a fabricated band.
const unknownCats = new Map();
const noteUnknown = raw => unknownCats.set(raw, (unknownCats.get(raw) || 0) + 1);

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

function parseCSV(text) {
  const lines = parseCsvGrid(text);
  if (lines.length < 2) return [];

  const header = lines[0].map(h => h.toLowerCase().trim());
  const posI  = header.indexOf('position');
  const nameI = header.indexOf('name');
  const bibI  = header.indexOf('bib');
  const timeI = header.indexOf('time');
  const catI  = header.indexOf('category');
  const genI  = header.indexOf('gender');

  const rows = [];
  let nextPos = 1;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i];
    const time = cols[timeI]?.trim() ?? '';
    if (!time || !time.includes(':')) continue;
    const sec = toSec(time);
    if (sec <= 0) continue;
    const rawPos = parseInt(cols[posI]?.trim() ?? '', 10);
    const pos = !isNaN(rawPos) && rawPos > 0 ? rawPos : nextPos;
    if (pos >= nextPos) nextPos = pos + 1;
    const name = titleCase(cols[nameI]?.trim() ?? '');
    const bib  = parseBib(cols[bibI]?.trim() ?? '');
    const catRaw    = cols[catI]?.trim() ?? 'MOPEN';
    const genderRaw = cols[genI]?.trim() ?? 'M';
    const cat = mapRaceCategory(catRaw, genderRaw, noteUnknown);
    rows.push({ pos, name, bib, nat: '', cat, catRaw, club: '—', time, sec });
  }
  return rows;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function processYear(raceDir, year, dist, outName) {
  const prefix = dist === 'half' ? 'Half' : '10k';
  const csvName = `${prefix} Results - ${year}.csv`;
  const file = path.join(BASE, raceDir, csvName);
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

  const males   = rows.filter(r => r.cat.startsWith('M'));
  const females = rows.filter(r => r.cat.startsWith('W'));
  const sorted  = [...rows].sort((a, b) => a.sec - b.sec);
  const median  = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM = [...males].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW = [...females].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const top10M  = [...males].sort((a, b) => a.sec - b.sec).slice(0, 10).reduce((s, r) => s + r.sec, 0) / Math.min(10, males.length);
  const top10W  = [...females].sort((a, b) => a.sec - b.sec).slice(0, 10).reduce((s, r) => s + r.sec, 0) / Math.min(10, females.length);
  const avgM    = Math.round(males.reduce((s, r) => s + r.sec, 0) / males.length);
  const avgW    = Math.round(females.reduce((s, r) => s + r.sec, 0) / females.length);

  const outFile = path.join(outDir, outName);
  fs.writeFileSync(outFile, JSON.stringify(rows));
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  const winnerMName = [...males].sort((a, b) => a.sec - b.sec)[0]?.name ?? '?';
  const winnerWName = [...females].sort((a, b) => a.sec - b.sec)[0]?.name ?? '?';
  console.log(`  ${year}: ${rows.length} finishers (${males.length}M/${females.length}W) · median ${fmt(median)} · ♂ ${fmt(winnerM)} ${winnerMName} · ♀ ${fmt(winnerW)} ${winnerWName} · ${kb}KB`);

  return {
    year,
    finishers: rows.length,
    avg:      median,
    avgMen:   avgM,
    avgWomen: avgW,
    winnerM,
    winnerW,
    top10M: Math.round(top10M),
    top10W: Math.round(top10W),
  };
}

function fmtRow(s) {
  return `  { year: ${s.year}, finishers: ${String(s.finishers).padStart(4)}, avg: ${String(s.avg).padStart(5)}, avgMen: ${String(s.avgMen).padStart(5)}, avgWomen: ${String(s.avgWomen).padStart(5)}, winnerM: ${String(s.winnerM).padStart(5)}, winnerW: ${String(s.winnerW).padStart(5)}, top10M: ${String(s.top10M).padStart(5)}, top10W: ${String(s.top10W).padStart(5)} },`;
}

const years = [2021, 2022, 2023, 2024, 2025];

const races = [
  { name: 'Onehunga Half Marathon', dir: 'Onehunga Half Marathon', slug: 'onehunga' },
  { name: 'Orewa Half Marathon',    dir: 'Orewa Half Marathon',    slug: 'orewa'    },
  { name: 'Tamaki River Half Marathon', dir: 'Tamaki River Half Marathon', slug: 'tamaki' },
];

for (const race of races) {
  console.log(`\n── ${race.name} (21.1 km) ──`);
  const halfStats = [];
  for (const year of years) {
    const s = processYear(race.dir, year, 'half', `results-${race.slug}-half-${year}.json`);
    if (s) halfStats.push(s);
  }

  console.log(`\n── ${race.name} (10 km) ──`);
  const tenKStats = [];
  for (const year of years) {
    const s = processYear(race.dir, year, '10k', `results-${race.slug}-10k-${year}.json`);
    if (s) tenKStats.push(s);
  }

  console.log(`\n── Paste into ${race.slug}Data.ts ──`);
  console.log(`\n${race.slug}HalfStats:`);
  halfStats.forEach(s => console.log(fmtRow(s)));
  console.log(`\n${race.slug}10kStats:`);
  tenKStats.forEach(s => console.log(fmtRow(s)));
}

if (unknownCats.size) {
  console.error('\n❌  Unrecognized category codes (NOT mapped to a band — fix the decoder):');
  for (const [raw, n] of unknownCats) console.error(`     ${JSON.stringify(raw)} × ${n}`);
  process.exitCode = 1;
}
