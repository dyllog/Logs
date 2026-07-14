#!/usr/bin/env node
/**
 * spotCheckAthleteCanon.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Manual-eyeball sampler for the canonical athlete identity pass.
 *
 * Pulls ~30 canonical athletes from src/data/athleteCanon.json and prints each
 * one's FULL result history (name, race, year, cat, time) reconstructed straight
 * from the raw public/data/results-*.json rows — so single-race athletes (which
 * are NOT materialised into public/data/athletes/) are covered too.
 *
 * Sample composition (per the Phase 0 follow-up handoff):
 *    10 completely random canonical athletes
 *    10 from the single-result set (checking these aren't people who should have
 *       merged with an existing multi-race athlete under a name variant)
 *    10 of the highest-racesLogged athletes (checking these aren't two different
 *       people wrongly merged)
 *
 * Read-only. Run from project root:  node scripts/spotCheckAthleteCanon.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nameKey } from './normalizeAthleteName.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const CANON_PATH = path.join(ROOT, 'src', 'data', 'athleteCanon.json');

// ─── File-key → race metadata (mirrors buildAthleteCanon.mjs FILE_META) ───────
const FILE_META = {
  '':                { label: 'Auckland Marathon',     distId: 'mar'  },
  'half':            { label: 'Auckland Half',         distId: 'half' },
  'rot':             { label: 'Rotorua Marathon',      distId: 'mar'  },
  'rot-half':        { label: 'Rotorua Half',          distId: 'half' },
  'chc':             { label: 'Christchurch Marathon', distId: 'mar'  },
  'chc-half':        { label: 'Christchurch Half',     distId: 'half' },
  'qt':              { label: 'Queenstown Marathon',   distId: 'mar'  },
  'qt-half':         { label: 'Queenstown Half',       distId: 'half' },
  'hb':              { label: "Hawke's Bay Marathon",  distId: 'mar'  },
  'hb-half':         { label: "Hawke's Bay Half",      distId: 'half' },
  'wf-half':         { label: 'Waterfront Half',       distId: 'half' },
  'wf-10k':          { label: 'Waterfront 10k',        distId: '10k'  },
  'dev-half':        { label: 'Devonport Half',        distId: 'half' },
  'dev-10k':         { label: 'Devonport 10k',         distId: '10k'  },
  'coast-half':      { label: 'Coatesville Half',      distId: 'half' },
  'omaha-half':      { label: 'Omaha Half',            distId: 'half' },
  'omaha-10k':       { label: 'Omaha 10k',             distId: '10k'  },
  'maraetai-half':   { label: 'Maraetai Half',         distId: 'half' },
  'maraetai-10k':    { label: 'Maraetai 10k',          distId: '10k'  },
  'kerikeri-half':   { label: 'Kerikeri Half',         distId: 'half' },
  'wellington-mar':  { label: 'Wellington Marathon',   distId: 'mar'  },
  'wellington-half': { label: 'Wellington Half',       distId: 'half' },
  'onehunga-half':   { label: 'Onehunga Half',         distId: 'half' },
  'onehunga-10k':    { label: 'Onehunga 10k',          distId: '10k'  },
  'orewa-half':      { label: 'Orewa Half',            distId: 'half' },
  'orewa-10k':       { label: 'Orewa 10k',             distId: '10k'  },
  'tamaki-half':     { label: 'Tamaki River Half',     distId: 'half' },
  'tamaki-10k':      { label: 'Tamaki River 10k',      distId: '10k'  },
  'mtm-half':        { label: 'Mt Maunganui Half',     distId: 'half' },
  'mtm-10k':         { label: 'Mt Maunganui 10k',      distId: '10k'  },
  'mtm-5k':          { label: 'Mt Maunganui 5k',       distId: '5k'   },
};

function fileMeta(filename) {
  const base = path.basename(filename);
  const key  = base.replace(/^results-/, '').replace(/-?\d{4}\.json$/, '');
  const yM   = base.match(/(\d{4})\.json$/);
  const year = yM ? parseInt(yM[1], 10) : 0;
  const meta = FILE_META[key];
  return meta ? { ...meta, year } : null;
}

function genderOf(cat) {
  const m = (cat ?? '').match(/^([MW])/);
  return m ? m[1] : '?';
}

// ─── Rebuild clusters (nameKey|gender → rows) exactly like the pipeline ───────
console.log('Reconstructing result histories from raw rows…');
const files = fs.readdirSync(DATA_DIR)
  .filter(f => f.startsWith('results-') && f.endsWith('.json'))
  .sort();

const clusters = new Map(); // `${key}|${gender}` → rows[]
for (const file of files) {
  const meta = fileMeta(file);
  if (!meta) continue;
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')); }
  catch { continue; }
  if (!Array.isArray(rows)) continue;
  for (const r of rows) {
    const raw = (r.name ?? '').trim();
    if (!raw) continue;
    const key = nameKey(raw);
    if (!key) continue;
    const gender = genderOf(r.cat);
    const ck = `${key}|${gender}`;
    if (!clusters.has(ck)) clusters.set(ck, []);
    clusters.get(ck).push({
      name: raw, race: meta.label, year: meta.year,
      cat: r.cat ?? '', time: r.time ?? '', sec: r.sec ?? 0,
    });
  }
}

// '?'-gender reattach: fold unknown-gender rows onto the sole real-gender cluster
// of the same name key when unambiguous (mirrors buildAthleteCanon.mjs).
{
  const byKey = new Map();
  for (const ck of clusters.keys()) {
    const [key, g] = ck.split('|');
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(g);
  }
  for (const [key, genders] of byKey) {
    const real = genders.filter(g => g !== '?');
    if (genders.includes('?') && new Set(real).size === 1) {
      const target = `${key}|${real[0]}`;
      const src = `${key}|?`;
      clusters.get(target).push(...clusters.get(src));
      clusters.delete(src);
    }
  }
}

/** Gather all raw rows for a canonical athlete via its nameKeys at its gender. */
function historyFor(athlete) {
  const rows = [];
  for (const k of athlete.nameKeys ?? []) {
    const ck = `${k}|${athlete.gender}`;
    if (clusters.has(ck)) rows.push(...clusters.get(ck));
  }
  rows.sort((a, b) => (a.year - b.year) || a.race.localeCompare(b.race));
  return rows;
}

// ─── Load canon + build the three samples ────────────────────────────────────
const canon = JSON.parse(fs.readFileSync(CANON_PATH, 'utf8'));
const singles = canon.filter(c => (c.races ?? 0) === 1);
const byRaces = [...canon].sort((a, b) => (b.races ?? 0) - (a.races ?? 0));

function sample(arr, n) {
  const pool = [...arr];
  const out = [];
  while (out.length < n && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

const groups = [
  ['10 RANDOM canonical athletes', sample(canon, 10)],
  ['10 SINGLE-RESULT athletes (should any have merged under a name variant?)', sample(singles, 10)],
  ['10 HIGHEST racesLogged (are any two different people wrongly merged?)', byRaces.slice(0, 10)],
];

function printAthlete(a) {
  const rows = historyFor(a);
  const keys = (a.nameKeys ?? []).join(' | ');
  console.log(`\n  ▸ ${a.name}   [${a.gender}]   slug=${a.slug}   canonRaces=${a.races}   reconstructed=${rows.length}`);
  console.log(`    nameKeys: ${keys}`);
  if (rows.length !== (a.races ?? 0)) {
    console.log(`    ⚠️  reconstructed row count (${rows.length}) != canon races (${a.races}) — inspect`);
  }
  for (const r of rows) {
    const race = r.race.padEnd(22).slice(0, 22);
    const rawNote = r.name !== a.name ? `  (raw: ${r.name})` : '';
    console.log(`      ${r.year}  ${race}  ${(r.cat || '—').padEnd(8)}  ${r.time || '—'}${rawNote}`);
  }
}

console.log(`\nCanon size: ${canon.length.toLocaleString()} athletes  ·  single-result: ${singles.length.toLocaleString()}\n`);
for (const [title, group] of groups) {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ${title}`);
  console.log('═══════════════════════════════════════════════════════════════');
  for (const a of group) printAthlete(a);
}
console.log('');
