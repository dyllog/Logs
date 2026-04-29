/**
 * chcToJson.mjs — Christchurch Marathon CSV → public/data JSON
 *
 * Usage:
 *   node scripts/chcToJson.mjs "Christchurch Marathon/2024.csv" 2024
 *   node scripts/chcToJson.mjs "Christchurch Marathon/2024-half.csv" 2024 half
 *
 * Expects CSV with columns (case-insensitive, order flexible):
 *   pos, bib, name, gender, category, time, nationality
 *
 * Outputs:
 *   public/data/results-chc-{year}.json       (marathon)
 *   public/data/results-chc-half-{year}.json  (half marathon)
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

function normalizeCat(cat, gender) {
  if (!cat) return gender === 'F' ? 'W' : 'M';
  const c = cat.trim();
  // Pass through Elite, Wheelchair etc.
  if (/elite/i.test(c)) return gender === 'F' ? 'W Elite' : 'M Elite';
  // Age group: "M40", "M 40-44", "40-44M", "W45–49" etc.
  const m = c.match(/(\d{2})[–\-](\d{2})/);
  if (m) {
    const prefix = gender === 'F' ? 'W' : 'M';
    return `${prefix} ${m[1]}–${m[2]}`;
  }
  return c;
}

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const col = name => header.indexOf(name);

  const iPos  = col('pos');
  const iBib  = col('bib');
  const iName = col('name');
  const iGend = col('gender');
  const iCat  = col('category') >= 0 ? col('category') : col('cat');
  const iTime = col('time');
  const iNat  = col('nationality') >= 0 ? col('nationality') : col('nat');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const get = idx => (idx >= 0 && cols[idx] !== undefined) ? cols[idx].trim() : '';
    const gender = get(iGend).toUpperCase().startsWith('F') ? 'F' : 'M';
    const time = get(iTime);
    if (!time || !time.includes(':')) continue;
    rows.push({
      pos:  parseInt(get(iPos), 10) || i,
      bib:  parseInt(get(iBib), 10) || 0,
      name: get(iName),
      nat:  get(iNat) || '—',
      cat:  normalizeCat(get(iCat), gender),
      time,
      sec:  toSec(time),
    });
  }
  return rows;
}

const [,, csvPath, yearStr, distFlag] = process.argv;
if (!csvPath || !yearStr) {
  console.error('Usage: node scripts/chcToJson.mjs <csv-path> <year> [half]');
  process.exit(1);
}

const year = parseInt(yearStr, 10);
const isHalf = distFlag === 'half';
const outFile = isHalf
  ? `results-chc-half-${year}.json`
  : `results-chc-${year}.json`;

const fullCsvPath = path.resolve(root, csvPath);
const text = fs.readFileSync(fullCsvPath, 'utf8');
const rows = parseCSV(text);

const outDir = path.join(root, 'public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, outFile), JSON.stringify(rows, null, 2));

console.log(`✓ ${rows.length} rows → public/data/${outFile}`);
console.log(`  Winner M: ${rows.find(r => r.cat.startsWith('M') && r.pos === 1)?.time ?? '—'}`);
console.log(`  Winner W: ${rows.find(r => r.cat.startsWith('W') && r.pos === 1)?.time ?? '—'}`);
