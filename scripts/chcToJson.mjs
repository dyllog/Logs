/**
 * chcToJson.mjs — Christchurch Marathon CSV → public/data JSON
 *
 * Usage (single file):
 *   node scripts/chcToJson.mjs "Christchurch Marathon/2024.csv" 2024 half
 *
 * Usage (batch — processes all files in folder):
 *   node scripts/chcToJson.mjs --batch
 *
 * CSV columns: Position, Name, Bib, Time, Net Time, Category, Category Position, Gender, Gender Position, col10
 * Category format: M20-39, W20-39, VM40-49, VW40-49, VM70+, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function toSec(t) {
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

// Parse a CSV line respecting quoted fields
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

function normalizeCat(raw) {
  const c = raw.trim();
  // VM/VW prefix (Veteran) → strip V, map gender
  // Gender prefix: M→M, W→W, VM→M, VW→W, F→W
  const genderMap = (prefix) => {
    if (prefix === 'W' || prefix === 'VW' || prefix === 'F') return 'W';
    return 'M';
  };

  // VM40-49, VW40-49, VM70+, VM70-99
  let m = c.match(/^(V?[MWF])(\d+)[–\-](\d+)$/);
  if (m) {
    const g = genderMap(m[1]);
    return `${g} ${m[2]}–${m[3]}`;
  }

  // VM70+, VW70+
  m = c.match(/^(V?[MWF])(\d+)\+$/);
  if (m) {
    const g = genderMap(m[1]);
    return `${g} ${m[2]}+`;
  }

  // M20-39 etc (already matched above but catches M20, W20)
  m = c.match(/^(V?[MWF])(\d+)$/);
  if (m) {
    const g = genderMap(m[1]);
    // M20 / W20 are the open age categories
    return `${g} 20–39`;
  }

  return c;
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
  const header = parseCSVLine(lines[0]).map(h => h.toLowerCase());

  const col = name => header.indexOf(name);
  const iPos  = col('position');
  const iName = col('name');
  const iBib  = col('bib');
  const iTime = col('time');
  const iCat  = col('category');
  const iGend = col('gender');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const get = idx => (idx >= 0 && cols[idx] !== undefined) ? cols[idx].trim() : '';
    const time = get(iTime);
    if (!time || !time.includes(':')) continue;
    const catRaw = get(iCat);
    // Skip if category looks like a time (malformed row)
    if (/^\d{2}:\d{2}/.test(catRaw)) continue;

    rows.push({
      pos:  parseInt(get(iPos), 10) || i,
      bib:  parseInt(get(iBib), 10) || 0,
      name: get(iName).replace(/\s+/g, ' '),
      nat:  '—',
      cat:  normalizeCat(catRaw),
      time,
      sec:  toSec(time),
    });
  }
  return rows;
}

function computeStats(rows, year) {
  if (rows.length === 0) return null;
  const finishers = rows.length;
  const men = rows.filter(r => r.cat.startsWith('M'));
  const women = rows.filter(r => r.cat.startsWith('W'));
  const avg = s => Math.round(s.reduce((a, r) => a + r.sec, 0) / s.length);
  const sorted = [...rows].sort((a, b) => a.sec - b.sec);
  const median = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM = men.sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW = women.sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const top10M = men.slice(0, 10).reduce((a, r) => a + r.sec, 0) / Math.min(10, men.length);
  const top10W = women.slice(0, 10).reduce((a, r) => a + r.sec, 0) / Math.min(10, women.length);
  return {
    year,
    finishers,
    avg: median,
    avgMen: avg(men),
    avgWomen: avg(women),
    winnerM,
    winnerW,
    top10M: Math.round(top10M),
    top10W: Math.round(top10W),
  };
}

function processFile(csvPath, year, isHalf) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(text);
  const outFile = isHalf
    ? `results-chc-half-${year}.json`
    : `results-chc-${year}.json`;
  const outDir = path.join(root, 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, outFile), JSON.stringify(rows));
  const stats = computeStats(rows, year);
  const winM = rows.find(r => r.cat.startsWith('M'))?.time ?? '—';
  const winW = rows.find(r => r.cat.startsWith('W'))?.time ?? '—';
  console.log(`✓ ${year} ${isHalf ? 'half' : 'marathon'}: ${rows.length} finishers  M: ${winM}  W: ${winW}`);
  return stats;
}

const batchMode = process.argv[2] === '--batch';

if (batchMode) {
  const folder = path.join(root, 'Christchurch Marathon');
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.csv'));

  const marStats = [];
  const halfStats = [];

  for (const file of files.sort()) {
    const yearMatch = file.match(/(\d{4})\.csv$/);
    if (!yearMatch) continue;
    const year = parseInt(yearMatch[1], 10);
    const isHalf = file.includes('Half');
    const stats = processFile(path.join(folder, file), year, isHalf);
    if (stats) (isHalf ? halfStats : marStats).push(stats);
  }

  // Print chcData.ts content
  const fmt = arr => arr
    .sort((a, b) => a.year - b.year)
    .map(s => `  { year: ${s.year}, finishers: ${s.finishers}, avg: ${s.avg}, avgMen: ${s.avgMen}, avgWomen: ${s.avgWomen}, winnerM: ${s.winnerM}, winnerW: ${s.winnerW}, top10M: ${s.top10M}, top10W: ${s.top10W} },`)
    .join('\n');

  console.log('\n--- chcData.ts ---');
  console.log(`export const chcStats: YearStat[] = [\n${fmt(marStats)}\n];`);
  console.log(`\nexport const chcHalfStats: YearStat[] = [\n${fmt(halfStats)}\n];`);
} else {
  const [,, csvPath, yearStr, distFlag] = process.argv;
  if (!csvPath || !yearStr) {
    console.error('Usage: node scripts/chcToJson.mjs <csv-path> <year> [half]');
    process.exit(1);
  }
  processFile(path.resolve(root, csvPath), parseInt(yearStr, 10), distFlag === 'half');
}
