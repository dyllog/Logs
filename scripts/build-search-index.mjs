#!/usr/bin/env node
/**
 * build-search-index.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds a sharded name search index from all public/data/results-*.json files.
 * Output: public/data/search/a.json, b.json, ... z.json  (one per first letter)
 *
 * Run from the project root:
 *   node scripts/build-search-index.mjs
 *
 * Each shard is a JSON object:
 *   { "john smith": { display: "John Smith", results: [{r, y, t, p, tot}, ...] } }
 *
 * Fields per result:
 *   r   - race label  (e.g. "Auckland Marathon")
 *   y   - year        (e.g. 2025)
 *   t   - finish time (e.g. "2:45:12")
 *   p   - position    (e.g. 42)
 *   tot - field size  (e.g. 2775)
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const DATA_DIR  = path.join(ROOT, 'public', 'data');
const OUT_DIR   = path.join(DATA_DIR, 'search');

// ─── Race label map ───────────────────────────────────────────────────────────
const RACE_LABELS = {
  '':              'Auckland Marathon',
  'half':          'Auckland Half',
  'chc':           'Christchurch Marathon',
  'chc-half':      'Christchurch Half',
  'rot':           'Rotorua Marathon',
  'rot-half':      'Rotorua Half',
  'qt':            'Queenstown Marathon',
  'qt-half':       'Queenstown Half',
  'hb':            "Hawke's Bay Marathon",
  'hb-half':       "Hawke's Bay Half",
  'wf-half':       'Waterfront Half',
  'wf-10k':        'Waterfront 10k',
  'dev-half':      'Devonport Half',
  'dev-10k':       'Devonport 10k',
  'coast-half':    'Coatesville Half',
  'omaha-half':    'Omaha Half',
  'omaha-10k':     'Omaha 10k',
  'kerikeri-half': 'Kerikeri Half',
  'maraetai-half': 'Maraetai Half',
  'maraetai-10k':  'Maraetai 10k',
};

function fileToMeta(filename) {
  const base  = path.basename(filename);
  const key   = base.replace(/^results-/, '').replace(/-?\d{4}\.json$/, '');
  const yearM = base.match(/(\d{4})\.json$/);
  const year  = yearM ? parseInt(yearM[1], 10) : 0;
  const label = RACE_LABELS[key] ?? key;
  return { label, year };
}

// ─── Build index ──────────────────────────────────────────────────────────────
const resultFiles = fs.readdirSync(DATA_DIR)
  .filter(f => f.startsWith('results-') && f.endsWith('.json'))
  .sort();

if (resultFiles.length === 0) {
  console.error('❌  No results-*.json files found in public/data/');
  process.exit(1);
}

// name_normalised → { display, results[] }
const index = new Map();

for (const file of resultFiles) {
  const { label, year } = fileToMeta(file);
  const raw  = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
  let records;
  try { records = JSON.parse(raw); } catch { console.warn(`⚠️  Skipping ${file}`); continue; }
  if (!Array.isArray(records)) continue;

  const total = records.length;
  for (const r of records) {
    const rawName = (r.name ?? '').trim();
    if (!rawName) continue;

    // Normalise: Title Case, then lowercase key
    const display = rawName.replace(/\b\w/g, c => c.toUpperCase()).replace(/\B\w/g, c => c.toLowerCase());
    const norm    = display.toLowerCase();

    if (!index.has(norm)) index.set(norm, { display, results: [] });
    index.get(norm).results.push({
      r: label,
      y: year,
      t: r.time ?? '',
      p: r.pos  ?? 0,
      tot: total,
    });
  }
}

// Sort each athlete's results by year descending
for (const entry of index.values()) {
  entry.results.sort((a, b) => b.y - a.y);
}

// ─── Shard by first letter ────────────────────────────────────────────────────
const shards = new Map();

for (const [norm, entry] of index) {
  const first = norm[0]?.match(/[a-z]/) ? norm[0] : '_';
  if (!shards.has(first)) shards.set(first, {});
  shards.get(first)[norm] = entry;
}

// ─── Write shards ─────────────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });

let totalNames = 0;
const stats = [];

for (const [letter, shard] of [...shards.entries()].sort()) {
  const outFile = path.join(OUT_DIR, `${letter}.json`);
  const json    = JSON.stringify(shard);
  fs.writeFileSync(outFile, json, 'utf8');
  const count   = Object.keys(shard).length;
  totalNames   += count;
  stats.push({ letter, kb: Math.round(json.length / 1024), count });
}

// ─── Report ───────────────────────────────────────────────────────────────────
console.log('');
console.log('✅  Search index built → public/data/search/');
console.log('');
console.log(`   Total unique names : ${totalNames.toLocaleString()}`);
console.log(`   Shards written     : ${shards.size}`);
console.log('');

const maxKb  = Math.max(...stats.map(s => s.kb));
const barMax = 30;
for (const { letter, kb, count } of stats) {
  const bar = '█'.repeat(Math.round((kb / maxKb) * barMax));
  console.log(`   ${letter}  ${String(kb).padStart(5)} KB  ${bar}  (${count.toLocaleString()} names)`);
}
console.log('');
