/**
 * waterfrontToJson.mjs — Waterfront Half Marathon CSV → public/data JSON
 *
 * Usage (batch — all years):
 *   node scripts/waterfrontToJson.mjs
 *
 * Single file:
 *   node scripts/waterfrontToJson.mjs --file "Half Results - 2025.csv" --year 2025
 *
 * CSV format (no Nationality column, old-style category codes):
 *   Position,Name,Bib,Time,Category,Category Position,Gender,Gender Position
 *   Category examples: M3039, F4049, M0019, M5059
 *
 * Outputs:
 *   public/data/results-wf-half-{year}.json
 *   Prints YearStat rows to paste into src/data/aklSeriesData.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.resolve(__dirname, '..');
const folder    = path.join(root, 'Waterfront Half Marathon');
const outDir    = path.join(root, 'public', 'data');

function toSec(t) {
  if (!t || !t.includes(':')) return 0;
  const clean = t.split('.')[0];
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuote = false;
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { fields.push(cur.trim()); cur = ''; }
    else { cur += ch; }
  }
  fields.push(cur.trim());
  return fields;
}

// "M3039" → { gender: 'M', cat: 'M 30–39' }
// "F4049" → { gender: 'W', cat: 'W 40–49' }
// "M0019" → { gender: 'M', cat: 'M 0–19' }
// "M70+"  → { gender: 'M', cat: 'M 70+' }
function parseCatCode(code) {
  if (!code || code.length < 2) return { gender: 'M', cat: 'M Open' };
  const gChar  = code[0].toUpperCase();
  const gender = gChar === 'F' ? 'W' : 'M';
  const rest   = code.slice(1); // "3039", "0019", "70+", etc.

  if (rest.includes('+')) {
    const n = rest.replace('+', '');
    return { gender, cat: `${gender} ${n}+` };
  }
  if (/^\d{4}$/.test(rest)) {
    const start = parseInt(rest.slice(0, 2), 10);
    const end   = parseInt(rest.slice(2, 4), 10);
    return { gender, cat: `${gender} ${start}–${end}` };
  }
  // Fallback: try to extract a human-readable range from "25-29" style
  if (/^\d+-\d+$/.test(rest)) {
    return { gender, cat: `${gender} ${rest.replace('-', '–')}` };
  }
  return { gender, cat: `${gender} Open` };
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  // Detect columns by name for flexibility
  const col = name => header.indexOf(name);
  const iPos  = col('position');
  const iName = col('name');
  const iBib  = col('bib');
  const iTime = col('time');
  const iCat  = col('category');
  const iNat  = col('nationality'); // -1 if absent
  const iGend = col('gender');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const get  = idx => (idx >= 0 && cols[idx] !== undefined ? cols[idx].trim() : '');

    const posRaw = get(iPos);
    if (!/^\d+$/.test(posRaw)) continue; // skip DNF / DNS / blanks

    const time = get(iTime);
    if (!time || !time.includes(':')) continue;

    const sec = toSec(time);
    if (sec < 60) continue; // skip DNF zeros

    const catRaw = get(iCat);
    if (!catRaw) continue;

    let gender, cat, nat;

    if (iNat >= 0) {
      // New format with Nationality column: category is "30–39" or "Elite", gender is "Male"/"Female"
      const gRaw = get(iGend);
      gender = gRaw.toLowerCase().startsWith('f') ? 'W' : 'M';
      nat    = get(iNat) || '—';
      cat    = `${gender} ${catRaw.replace(/-/g, '–')}`;
    } else {
      // Old format: category encodes gender+age "M3039", "F4049"
      const parsed = parseCatCode(catRaw);
      gender = parsed.gender;
      cat    = parsed.cat;
      nat    = '—';
    }

    const name = get(iName).replace(/\s+/g, ' ')
      .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

    rows.push({
      pos:  parseInt(posRaw, 10),
      bib:  parseInt(get(iBib).replace(/\D/g, ''), 10) || 0,
      name,
      nat,
      cat,
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
  const avg   = arr => arr.length ? Math.round(arr.reduce((a, r) => a + r.sec, 0) / arr.length) : 0;
  const sorted = [...rows].sort((a, b) => a.sec - b.sec);
  const median = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM  = [...men  ].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW  = [...women].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const top10M   = men.slice(0, 10).reduce((a, r) => a + r.sec, 0) / Math.min(10, men.length) || 0;
  const top10W   = women.slice(0, 10).reduce((a, r) => a + r.sec, 0) / Math.min(10, women.length) || 0;
  return { year, finishers: rows.length, avg: median, avgMen: avg(men), avgWomen: avg(women), winnerM, winnerW, top10M: Math.round(top10M), top10W: Math.round(top10W) };
}

function fmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function processFile(csvPath, year) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(text);
  if (rows.length === 0) {
    console.warn(`  ⚠ ${year}: no rows parsed — check CSV format`);
    return null;
  }
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `results-wf-half-${year}.json`);
  fs.writeFileSync(outFile, JSON.stringify(rows));

  const winM = rows.find(r => r.cat.startsWith('M'))?.time ?? '—';
  const winW = rows.find(r => r.cat.startsWith('W'))?.time ?? '—';
  const kb   = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`✓ ${year}: ${rows.length} finishers  M: ${winM}  W: ${winW}  (${kb} KB)`);
  return computeStats(rows, year);
}

const args    = process.argv.slice(2);
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;
const yearArg = args.includes('--year') ? parseInt(args[args.indexOf('--year') + 1], 10) : null;

if (fileArg && yearArg) {
  processFile(path.join(folder, fileArg), yearArg);
} else {
  // Batch: process all CSVs in the folder
  if (!fs.existsSync(folder)) {
    console.error(`Folder not found: ${folder}`);
    console.error('Expected: "Waterfront Half Marathon/" at repo root');
    process.exit(1);
  }
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.csv')).sort();
  const stats = [];

  for (const file of files) {
    const yearMatch = file.match(/(\d{4})\.csv$/i);
    if (!yearMatch) continue;
    const year = parseInt(yearMatch[1], 10);
    const s = processFile(path.join(folder, file), year);
    if (s) stats.push(s);
  }

  if (stats.length === 0) {
    console.log('\nNo files processed.');
  } else {
    const fmt = s =>
      `  { year: ${s.year}, finishers: ${String(s.finishers).padStart(4)}, avg: ${s.avg}, avgMen: ${s.avgMen}, avgWomen: ${s.avgWomen}, winnerM: ${s.winnerM}, winnerW: ${s.winnerW}, top10M: ${s.top10M}, top10W: ${s.top10W} },`;
    console.log('\n─── Paste into src/data/aklSeriesData.ts (waterfrontStats) ───');
    console.log('export const waterfrontStats: YearStat[] = [');
    stats.sort((a, b) => a.year - b.year).forEach(s => console.log(fmt(s)));
    console.log('];');

    console.log('\n─── WATERFRONT_YEARS ───');
    console.log(`export const WATERFRONT_YEARS = [${stats.map(s => s.year).join(', ')}] as const;`);

    console.log('\n─── Course records (men / women by year) ───');
    stats.forEach(s => console.log(`  ${s.year}: M ${fmtTime(s.winnerM)}  W ${fmtTime(s.winnerW)}`));
  }
}
