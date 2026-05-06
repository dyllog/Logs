/**
 * qtHbToJson.mjs — Queenstown / Hawkes Bay Marathon CSV → public/data JSON
 *
 * Usage (batch):
 *   node scripts/qtHbToJson.mjs --race qt
 *   node scripts/qtHbToJson.mjs --race hb
 *
 * Single file:
 *   node scripts/qtHbToJson.mjs --race qt --file "Queenstown Marathon - Marathon Results - 2025.csv" --year 2025
 *
 * Handles category variations across years:
 *   "20-29 years", "Runner 20-29 years", "Runner 20-29", "20-29", "30-34", "70+ years"
 * Gender comes from the Gender column ("Male" / "Female").
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function toSec(t) {
  if (!t || !t.includes(':')) return 0;
  // Strip sub-second ".xx" if present
  const clean = t.split('.')[0];
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      fields.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

function normalizeCategory(rawCat, gender) {
  const g = gender.toLowerCase().startsWith('f') ? 'W' : 'M';

  // Strip "Runner " / "Walker " prefix, " years" suffix
  let c = rawCat.trim()
    .replace(/^(Runner|Walker)\s+/i, '')
    .replace(/\s+years$/i, '')
    .trim();

  // "70+" → keep as is
  // "20-29" or "20–29" → normalize dash to en-dash
  c = c.replace(/-/g, '–');

  return `${g} ${c}`;
}

function isValidPosition(pos) {
  // Filter out DNF, DNS, "Not yet started", "Started and running", etc.
  return /^\d+$/.test(pos.trim());
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  const colIdx = name => header.indexOf(name);
  const iPos  = colIdx('position');
  const iName = colIdx('name');
  const iBib  = colIdx('bib');
  const iTime = colIdx('time');
  const iNat  = colIdx('nationality');
  const iCat  = colIdx('category');
  const iGend = colIdx('gender');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const get = idx => (idx >= 0 && cols[idx] !== undefined) ? cols[idx].trim() : '';

    const posRaw = get(iPos);
    if (!isValidPosition(posRaw)) continue;

    const time = get(iTime);
    if (!time || !time.includes(':')) continue;

    // Skip obvious DNF times (00:00:00)
    const sec = toSec(time);
    if (sec < 60) continue;

    const catRaw = get(iCat);
    const gender = get(iGend);
    if (!catRaw || !gender) continue;

    rows.push({
      pos:  parseInt(posRaw, 10),
      bib:  parseInt(get(iBib), 10) || 0,
      name: get(iName).replace(/\s+/g, ' '),
      nat:  iNat >= 0 ? (get(iNat) || '—') : '—',
      cat:  normalizeCategory(catRaw, gender),
      club: '—',
      time,
      sec,
    });
  }
  return rows;
}

function computeStats(rows, year) {
  if (rows.length === 0) return null;
  const men   = rows.filter(r => r.cat.startsWith('M'));
  const women = rows.filter(r => r.cat.startsWith('W'));
  const avg = arr => arr.length ? Math.round(arr.reduce((a, r) => a + r.sec, 0) / arr.length) : 0;
  const sorted = [...rows].sort((a, b) => a.sec - b.sec);
  const median = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM  = [...men].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW  = [...women].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const top10M   = men.slice(0, 10).reduce((a, r) => a + r.sec, 0) / Math.min(10, men.length) || 0;
  const top10W   = women.slice(0, 10).reduce((a, r) => a + r.sec, 0) / Math.min(10, women.length) || 0;
  return {
    year,
    finishers: rows.length,
    avg: median,
    avgMen: avg(men),
    avgWomen: avg(women),
    winnerM,
    winnerW,
    top10M: Math.round(top10M),
    top10W: Math.round(top10W),
  };
}

function processFile(csvPath, prefix, year, isHalf) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(text);
  const outFile = isHalf ? `results-${prefix}-half-${year}.json` : `results-${prefix}-${year}.json`;
  const outDir = path.join(root, 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, outFile), JSON.stringify(rows));

  const winM = rows.find(r => r.cat.startsWith('M'))?.time ?? '—';
  const winW = rows.find(r => r.cat.startsWith('W'))?.time ?? '—';
  console.log(`✓ ${year} ${isHalf ? 'half' : 'marathon'}: ${rows.length} finishers  M: ${winM}  W: ${winW}`);
  return computeStats(rows, year);
}

const args = process.argv.slice(2);
const raceArg = args[args.indexOf('--race') + 1];
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const yearArg = args.includes('--year') ? parseInt(args[args.indexOf('--year') + 1], 10) : null;

if (!raceArg || !['qt', 'hb'].includes(raceArg)) {
  console.error('Usage: node scripts/qtHbToJson.mjs --race qt|hb [--file <filename> --year <year>]');
  process.exit(1);
}

const config = {
  qt: { folder: 'Queenstown Marathon', prefix: 'qt', dataConst: 'qt' },
  hb: { folder: 'Hawkes Bay Marathon', prefix: 'hb', dataConst: 'hb' },
}[raceArg];

const folder = path.join(root, config.folder);
const prefix = config.prefix;

if (fileArg && yearArg) {
  const isHalf = fileArg.toLowerCase().includes('half');
  processFile(path.join(folder, fileArg), prefix, yearArg, isHalf);
} else {
  // Batch mode
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.csv')).sort();
  const marStats = [];
  const halfStats = [];

  for (const file of files) {
    const yearMatch = file.match(/(\d{4})\.csv$/);
    if (!yearMatch) continue;
    const year = parseInt(yearMatch[1], 10);
    const isHalf = file.toLowerCase().includes('half');
    const stats = processFile(path.join(folder, file), prefix, year, isHalf);
    if (stats) (isHalf ? halfStats : marStats).push(stats);
  }

  const fmt = arr => arr
    .sort((a, b) => a.year - b.year)
    .map(s => `  { year: ${s.year}, finishers: ${s.finishers.toString().padStart(4)}, avg: ${s.avg}, avgMen: ${s.avgMen}, avgWomen: ${s.avgWomen}, winnerM: ${s.winnerM}, winnerW: ${s.winnerW}, top10M: ${s.top10M}, top10W: ${s.top10W} },`)
    .join('\n');

  const varName = raceArg === 'qt' ? 'qt' : 'hb';
  console.log(`\n--- ${varName}Data.ts stats ---`);
  console.log(`export const ${varName}Stats: YearStat[] = [\n${fmt(marStats)}\n];`);
  console.log(`\nexport const ${varName}HalfStats: YearStat[] = [\n${fmt(halfStats)}\n];`);
}
