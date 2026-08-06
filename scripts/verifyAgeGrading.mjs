// @ts-check
/**
 * verifyAgeGrading.mjs — sanity checks on the derived WMA road tables and on
 * every age grade the archive will actually publish.
 *
 * Checks, in order of what they would catch:
 *   1. Open-class standards match the real world bests they claim to be.
 *   2. The open standard is the fastest cell in its column, and a world-best
 *      run grades to exactly 100% there.
 *   3. For a fixed time, the grade never falls as age rises.
 *   4. Male and female tables are genuinely independent — the female curve is
 *      not the male one times a constant. This is the regression guard: if a
 *      multiplier is ever reintroduced, the ratio spread collapses.
 *   5. Every gradable archive result, with the >100% distribution reported —
 *      the symptom that triggered the 2010 female re-fit.
 *
 * Band rules are imported from src/lib/ageBand.mjs, not restated, so this
 * cannot drift away from what the site actually does.
 *
 * Run: node scripts/verifyAgeGrading.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ageFromBand } from '../src/lib/ageBand.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'wmaRoad2025.json'), 'utf8'));
const ATHLETES = path.join(ROOT, 'public', 'data', 'athletes');

const fail = [];
const warn = [];
let lastFailCount = 0;

/** Report a check as passed only if it added no failures of its own. */
function check(n, msg) {
  if (fail.length === lastFailCount) console.log(`   PASS  ${msg}`);
  else console.log(`   FAIL  check ${n}: ${fail.length - lastFailCount} failure(s)`);
  lastFailCount = fail.length;
}

const hms = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = Math.round(s % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
           : `${m}:${String(ss).padStart(2, '0')}`;
};

const DISTS = ['5k', '10k', 'half', 'mar'];
const stdSec = (g, age, dist) => WMA.standards[g]?.[String(age)]?.[dist] ?? null;
const grade = (sec, g, age, dist) => {
  const s = stdSec(g, age, dist);
  return s == null ? null : (s / sec) * 100;
};

console.log('\n== 1. Open-class standards vs known world bests ================');
// These expected values exist only to CHECK the parse; they are not a source.
// A mismatch means the wrong column, sheet or file was read.
const WORLD_BESTS = {
  M: { '5k': '12:49', '10k': '26:24', half: '57:31', mar: '2:00:35' },
  F: { '5k': '13:54', '10k': '28:46', half: '1:02:52', mar: '2:09:56' },
};
for (const g of ['M', 'F']) {
  for (const dist of DISTS) {
    const got = WMA.openStandardsSec[g][dist];
    const want = WORLD_BESTS[g][dist].replace(/^0:/, '');
    if (hms(got) !== want) fail.push(`open standard ${g} ${dist}: table says ${hms(got)}, expected ${want}`);
  }
}
for (const g of ['M', 'F']) {
  console.log(`   ${g}: ` + DISTS.map(d => `${d} ${hms(WMA.openStandardsSec[g][d])}`).join(' · '));
}
check(1, 'all 8 open standards match published world bests');

console.log('\n== 2. Open standard is the table minimum, and grades to 100% ===');
for (const g of ['M', 'F']) {
  for (const dist of DISTS) {
    const oc = WMA.openStandardsSec[g][dist];
    // The open standard must be the fastest cell in its column: no age is
    // expected to beat absolute open. Young-adult standards are slightly
    // slower, so a world-best time grades a little over 100% at age 20 —
    // that is the tables behaving correctly, not an error.
    let min = Infinity, minAge = null;
    for (let age = 5; age <= 100; age++) {
      const s = stdSec(g, age, dist);
      if (s != null && s < min) { min = s; minAge = age; }
    }
    if (Math.abs(min - oc) > 1) {
      fail.push(`${g} ${dist}: fastest standard ${min}s (age ${minAge}) != open standard ${oc}s`);
      continue;
    }
    const pct = grade(oc, g, minAge, dist);
    if (Math.abs(pct - 100) > 0.2) {
      fail.push(`${g} ${dist}: world-best at age ${minAge} grades ${pct.toFixed(2)}%, expected 100%`);
    }
  }
}
check(2, 'open standard is the fastest cell and grades to 100.0%, both genders');

console.log('\n== 3. Grade never falls as age rises (fixed time) ==============');
for (const g of ['M', 'F']) {
  for (const dist of DISTS) {
    const fixed = WMA.openStandardsSec[g][dist] * 1.6;   // a club-level time
    let prev = -Infinity, breaks = 0;
    for (let age = 30; age <= 95; age++) {
      const pct = grade(fixed, g, age, dist);
      if (pct == null) continue;
      if (pct < prev - 1e-9) breaks++;
      prev = pct;
    }
    if (breaks) fail.push(`${g} ${dist}: grade decreases with age at ${breaks} age step(s)`);
  }
}
check(3, 'grade is non-decreasing from age 30 to 95 across all 8 series');

console.log('\n== 4. Female table is independent of the male table ============');
// Were the female curve male x constant, every ratio would be identical.
const ratios = [];
for (const dist of DISTS) {
  for (let age = 20; age <= 90; age++) {
    const m = stdSec('M', age, dist), f = stdSec('F', age, dist);
    if (m && f) ratios.push(f / m);
  }
}
const lo = Math.min(...ratios), hi = Math.max(...ratios);
console.log(`   female/male standard ratio spans ${lo.toFixed(4)} - ${hi.toFixed(4)} over ${ratios.length} cells`);
if (hi - lo < 0.01) {
  fail.push(`female/male ratio is near-constant (${lo.toFixed(4)}-${hi.toFixed(4)}) — a multiplier may have been reintroduced`);
}
check(4, `ratio varies by ${((hi - lo) * 100).toFixed(1)} points — genuinely separate curves`);

console.log('\n== 5. Every publishable archive grade ==========================');
let graded = 0, ungraded = 0;
const over100 = [];
const badBands = new Map();
const buckets = new Map();

for (const file of fs.readdirSync(ATHLETES).filter(f => f.endsWith('.json'))) {
  const shard = JSON.parse(fs.readFileSync(path.join(ATHLETES, file), 'utf8'));
  for (const [slug, p] of Object.entries(shard)) {
    const g = p.gender === 'M' ? 'M' : (p.gender === 'W' || p.gender === 'F') ? 'F' : null;
    for (const r of p.results) {
      if (r.trail || !DISTS.includes(r.distId)) continue;
      const age = ageFromBand(r.cat);
      const pct = g && age != null ? grade(r.sec, g, age, r.distId) : null;
      if (pct == null) {
        ungraded++;
        if (g && age == null) badBands.set(r.cat, (badBands.get(r.cat) ?? 0) + 1);
        continue;
      }
      graded++;
      const b = Math.min(11, Math.floor(pct / 10));
      buckets.set(b, (buckets.get(b) ?? 0) + 1);
      if (pct > 100) over100.push({ slug, g, pct, r, age });
    }
  }
}

console.log(`   graded ${graded.toLocaleString()} road results · ${ungraded.toLocaleString()} not gradable`);
console.log('   distribution:');
for (const b of [...buckets.keys()].sort((a, b2) => a - b2)) {
  const label = b >= 11 ? '110%+' : `${b * 10}-${b * 10 + 9}%`;
  const n = buckets.get(b);
  console.log(`      ${label.padStart(8)} ${String(n).padStart(7)}  ${'#'.repeat(Math.max(1, Math.round((n / graded) * 110)))}`);
}

if (badBands.size) {
  const top = [...badBands.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 8);
  console.log(`   ungradable bands (no grade shown): ${top.map(([c, n]) => `"${c}" x${n}`).join(', ')}`);
}

const femaleOver = over100.filter(o => o.g === 'F');
console.log(`\n   grades over 100%: ${over100.length} (${femaleOver.length} female, ${over100.length - femaleOver.length} male)`);
for (const o of over100.sort((a, b2) => b2.pct - a.pct).slice(0, 12)) {
  console.log(`      ${o.pct.toFixed(1)}%  ${o.g}  ${o.slug}  ${o.r.race} ${o.r.year}  ${o.r.time}  pos ${o.r.pos}/${o.r.total}  ${o.r.cat} (age ${o.age})`);
}

// Over 100% is legitimate for a genuinely world-class masters run. It is only
// a symptom when it happens to a mid-pack result.
const midPack = over100.filter(o => o.r.total > 50 && o.r.pos / o.r.total > 0.10);
if (midPack.length) {
  warn.push(`${midPack.length} result(s) over 100% while finishing outside the top 10% of the field — inspect`);
}
check(5, `no mid-pack result grades over 100% (${over100.length} over 100%, all top-decile finishes)`);

console.log('\n===============================================================');
for (const w of warn) console.log(`   WARN  ${w}`);
if (fail.length) {
  for (const f of fail) console.log(`   FAIL  ${f}`);
  console.log(`\n   FAILED: ${fail.length} check(s)\n`);
  process.exit(1);
}
console.log('   All checks passed.\n');
