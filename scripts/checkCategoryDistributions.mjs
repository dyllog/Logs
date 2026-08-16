#!/usr/bin/env node
/**
 * checkCategoryDistributions.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Import-time sanity net for corrupted age-category data. Omaha (packed codes
 * mis-decoded to "70+") and Onehunga 2025 (broad-range codes mis-decoded to a
 * dominant "10–19") were both found months later by identity-flag archaeology.
 * This catches the next one at generate time.
 *
 * For every results-*.json it inspects the per-gender age-band distribution and
 * warns when it looks pathological. Broad-band schemes (e.g. "M 10–39", "M 40+")
 * and legitimately Open-only years are NOT flagged — only distributions that are
 * physically implausible for a road race.
 *
 * Console-warning only (never fails the build). Run as part of `npm run generate`.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'public', 'data');

const MIN_GENDER_FIELD = 30;  // ignore tiny fields — too noisy to judge
const MIN_BAND_FIELD   = 200; // "few distinct bands" only meaningful in big fields
const DOMINANCE = 0.60;       // one narrow band holding >60% of a gender = suspect
const IMPLAUSIBLE_DOMINANCE = 0.45; // youth/senior band this dominant = corruption,
                                    // not just "kids run the 5k" (a legit modal band
                                    // sits well below this in a real mixed field)

/** Parse "M 30–39" / "W 40+" into band info, or null for Open/Elite/blank. */
function bandInfo(cat) {
  const s = String(cat || '');
  let m = s.match(/^([MW])\s+(\d{1,3})\s*[–—-]\s*(\d{1,3})$/);
  if (m) return { gender: m[1], lo: +m[2], hi: +m[3], open: false, band: s.slice(2).trim() };
  m = s.match(/^([MW])\s+(\d{1,3})\s*\+$/);
  if (m) return { gender: m[1], lo: +m[2], hi: 200, open: true, band: s.slice(2).trim() };
  return null; // Open / Elite / blank / — → not an age band
}
const span = b => (b.open ? Infinity : b.hi - b.lo);

/**
 * Every category SHAPE the archive is allowed to store.
 *
 * Bands, open-ended bands, a single exact age (sources that publish gender+age
 * rather than a band), the named non-age classes, a bare gender, and the
 * explicit "not recorded" placeholder. Anything else is a format this pipeline
 * does not understand.
 */
const KNOWN_CAT_SHAPES = [
  /^[MW]\s+\d{1,3}\s*[–—-]\s*\d{1,3}$/,   // M 40–44
  /^[MW]\s+\d{1,3}\s*\+$/,                 // W 75+
  /^[MW]\s+\d{1,3}$/,                      // W 37   (exact age, band unpublished)
  /^[MW]\s+(Open|Elite|Senior|Junior|Masters)$/i,
  /^[MW]\s+Under\s*\d{1,3}$/i,             // M Under 10  (youth band, Mt Maunganui 5k)
  /^[MW]$/,                                // gender only
  /^(Open|Elite)$/i,                       // class known, gender not recorded
  /^(—|-)?$/,                              // not recorded
];
const isKnownCatShape = (c) => KNOWN_CAT_SHAPES.some(re => re.test(String(c ?? '').trim()));

const files = fs.readdirSync(dataDir)
  .filter(f => f.startsWith('results-') && f.endsWith('.json'))
  .sort();

const warnings = [];
for (const file of files) {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')); }
  catch { continue; }
  if (!Array.isArray(rows) || !rows.length) continue;

  // Rule D — UNRECOGNISED CATEGORY FORMAT. Deliberately has no threshold.
  //
  // Rules A–C are all proportion- or size-gated (>60% of a gender, ≥200
  // finishers, <4 distinct bands), which is the right instrument for "this
  // distribution looks wrong" but the wrong one for "this string is not a
  // category". Devonport carried 141 packed codes ("M 7099") for years, spread
  // 2–8 per file across 20 files — never close to any threshold, and invisible
  // until the age-grader listed them as ungradable. A category the pipeline
  // cannot parse is a defect at one row, so this counts rather than weighs.
  const unknown = new Map();
  for (const r of rows) {
    const c = String(r.cat ?? '').trim();
    if (isKnownCatShape(c)) continue;
    unknown.set(c, (unknown.get(c) ?? 0) + 1);
  }
  if (unknown.size) {
    const detail = [...unknown].sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([c, n]) => `"${c}"×${n}`).join(', ');
    const total = [...unknown.values()].reduce((a, b) => a + b, 0);
    warnings.push(`${file}: ${total} row(s) in an unrecognised category format — ${detail}`);
  }

  const banded = rows.map(r => bandInfo(r.cat)).filter(Boolean);
  if (!banded.length) continue; // Open-only / no age data — honest absence, skip

  const anyBroad = banded.some(b => span(b) > 15); // broad-scheme race → lenient

  // Per-gender modal-band analysis.
  for (const g of ['M', 'W']) {
    const gb = banded.filter(b => b.gender === g);
    if (gb.length < MIN_GENDER_FIELD) continue;
    const counts = new Map();
    for (const b of gb) counts.set(b.band, (counts.get(b.band) || 0) + 1);
    const [modBand, modN] = [...counts].sort((a, b) => b[1] - a[1])[0];
    const share = modN / gb.length;
    const info = bandInfo(`${g} ${modBand}`);

    // Rule A — an implausible band DOMINATES a gender: a youth band (top ≤ 19)
    // or a masters band (floor ≥ 60) holding a large share can't be the modal
    // group of a real road-race field. The share gate keeps legitimately youth-
    // heavy community events (e.g. a 5k with kids at ~20%) from tripping it.
    //
    // The YOUTH half of the rule does not apply to a 5 km, where a junior
    // majority is the normal shape rather than a symptom. Taupō's 5 km is 52
    // male juniors out of 79 in 2021, and the organiser's own category names
    // say so ("Male Junior (U20 Years)") — flagging that as mis-decoded would
    // train the eye to ignore the rule. A 5 km dominated by 60+ still trips it.
    const is5k = /-5k-\d{4}\.json$/.test(file);
    const implausible = (info?.lo >= 60) || (info?.hi <= 19 && !is5k);
    if (info && implausible && share >= IMPLAUSIBLE_DOMINANCE) {
      warnings.push(`${file}: ${g} modal band "${g} ${modBand}" is implausible as the largest cohort (${modN}/${gb.length}, ${(share*100).toFixed(0)}%) — suspected mis-decoded categories`);
      continue;
    }
    // Rule B — one NARROW band monopolises a gender (>60%). Broad bands are
    // exempt: concentration is expected when the scheme itself is coarse.
    if (info && span(info) <= 15 && share > DOMINANCE) {
      warnings.push(`${file}: single band "${g} ${modBand}" holds ${(share*100).toFixed(0)}% of ${g} finishers (${modN}/${gb.length}) — suspiciously concentrated`);
    }
  }

  // Rule C — a big field carved into too few NARROW bands implies missing bands.
  // Skipped when any broad/open band is present (intentional coarse scheme).
  if (rows.length >= MIN_BAND_FIELD && !anyBroad) {
    const distinct = new Set(banded.map(b => `${b.gender} ${b.band}`));
    if (distinct.size < 4) {
      warnings.push(`${file}: only ${distinct.size} distinct age band(s) across ${rows.length} finishers — possible missing/mis-decoded bands`);
    }
  }
}

console.log('');
console.log('── Category-distribution sanity check ─────────────────────────');
console.log(`   Files scanned            : ${files.length}`);
console.log(`   Suspicious distributions : ${warnings.length}`);
for (const w of warnings) console.log(`   ⚠️  ${w}`);
if (!warnings.length) console.log('   ✅  No pathological category distributions detected.');
console.log('───────────────────────────────────────────────────────────────');
console.log('');
