#!/usr/bin/env node
/**
 * Checks specific to sources that contain several events.
 *
 * The failure mode this class produces is runners credited with a distance
 * they never ran, and it does not look like an error — the rows are
 * well-formed, the names are real, the times are plausible for SOME distance.
 * These three checks are what would have caught it:
 *
 *   1. A bib appearing in two distances of one edition. Entrants get one bib
 *      per event, so the same bib in the marathon and the half of one year
 *      means a table was attributed to the wrong distance — unless the event
 *      genuinely offers a double, which is reported rather than assumed.
 *   2. A winning time implausible for its distance. This is the check that
 *      catches a 17-minute marathon course record.
 *   3. A field size wildly out of line with neighbouring years of the same
 *      distance, which is what a partially-read or double-counted table looks
 *      like from the outside.
 *
 * Run: node scripts/verifyMultiEventSplit.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { roadFileMeta } from '../src/data/roadEvents.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(path.resolve(__dirname, '..'), 'public', 'data');
const META = roadFileMeta();

/** Plausible winning-time envelope per distId, in seconds. Deliberately wide:
 *  this is a check for the absurd, not a judgement on how fast a race is. */
const WINNER_BOUNDS = {
  mar:     [2 * 3600, 5 * 3600],
  half:    [58 * 60, 2.5 * 3600],
  '12k':   [30 * 60, 90 * 60],
  quarter: [28 * 60, 80 * 60],
  '10k':   [26 * 60, 75 * 60],
  '5k':    [12 * 60, 40 * 60],
};

const problems = [];
const editions = new Map(); // `${raceSlug}:${year}` -> [{distId, file, rows}]

for (const f of fs.readdirSync(DATA)) {
  const m = f.match(/^results-(.*?)-?(\d{4})\.json$/);
  if (!m) continue;
  const meta = META[m[1]];
  if (!meta) continue; // trail and unregistered keys are out of scope here
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); } catch { continue; }
  if (!Array.isArray(rows) || !rows.length) continue;
  const key = `${meta.raceSlug}:${m[2]}`;
  if (!editions.has(key)) editions.set(key, []);
  editions.get(key).push({ distId: meta.distId, label: meta.label, file: f, rows, year: Number(m[2]) });
}

// ── 1. Bib reuse across distances within one edition ─────────────────────────
for (const [key, dists] of editions) {
  if (dists.length < 2) continue;
  const seen = new Map(); // bib -> distId
  const clashes = new Map(); // "a↔b" -> count
  for (const d of dists) {
    for (const r of d.rows) {
      if (!r.bib) continue; // 0 = not recorded; carries no identity
      const prior = seen.get(r.bib);
      if (prior && prior !== d.distId) {
        const pair = [prior, d.distId].sort().join(' ↔ ');
        clashes.set(pair, (clashes.get(pair) ?? 0) + 1);
      } else seen.set(r.bib, d.distId);
    }
  }
  for (const [pair, n] of clashes) {
    const total = dists.reduce((s, d) => s + d.rows.length, 0);
    problems.push(`${key}: ${n} bib(s) shared between ${pair} (of ${total} finishers) — one table may be attributed to the wrong distance, or the event offers a double`);
  }
}

// ── 2. Winning time plausible for the distance ───────────────────────────────
for (const [key, dists] of editions) {
  for (const d of dists) {
    const bounds = WINNER_BOUNDS[d.distId];
    if (!bounds) continue;
    const fastest = Math.min(...d.rows.map(r => r.sec).filter(s => s > 0));
    if (!Number.isFinite(fastest)) continue;
    if (fastest < bounds[0] || fastest > bounds[1]) {
      const mm = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      problems.push(`${key} ${d.distId}: winning time ${mm(fastest)} is outside the plausible range ${mm(bounds[0])}–${mm(bounds[1])} for that distance (${d.file})`);
    }
  }
}

// ── 3. Field size against neighbouring years of the same distance ────────────
const series = new Map(); // `${raceSlug}:${distId}` -> [{year, n}]
for (const [key, dists] of editions) {
  const slug = key.split(':')[0];
  for (const d of dists) {
    const k = `${slug}:${d.distId}`;
    if (!series.has(k)) series.set(k, []);
    series.get(k).push({ year: d.year, n: d.rows.length, file: d.file });
  }
}
for (const [k, pts] of series) {
  if (pts.length < 3) continue;
  pts.sort((a, b) => a.year - b.year);
  const sizes = pts.map(p => p.n).sort((a, b) => a - b);
  const median = sizes[Math.floor(sizes.length / 2)];
  for (const p of pts) {
    if (p.n < median / 4 || p.n > median * 4) {
      problems.push(`${k} ${p.year}: ${p.n} finishers against a series median of ${median} — worth confirming the file is complete (${p.file})`);
    }
  }
}

console.log('\n── Multi-event split checks ─────────────────────────────────');
console.log(`   editions examined : ${editions.size}`);
console.log(`   distance series   : ${series.size}`);
if (!problems.length) {
  console.log('   ✅ no bib shared across distances; every winning time plausible; no field-size outliers');
} else {
  console.log(`   ⚠️  ${problems.length} to review:`);
  for (const p of problems) console.log(`      · ${p}`);
}
console.log('─────────────────────────────────────────────────────────────\n');
