#!/usr/bin/env node
/**
 * flagInconsistentClusters.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Split-review pass. The canon pipeline validates NEW fuzzy matches for
 * plausibility but never re-examines EXISTING exact-name-key clusters for the
 * same thing. A cluster like "Andrew Smith" (75 races) formed purely because
 * every row shares the exact normalized name — nothing checked whether those
 * rows are internally consistent with being ONE person.
 *
 * This runs the plausibility logic in the other direction: for each multi-race
 * canonical athlete, check chronological internal consistency and flag clusters
 * that are almost-certainly (Tier 1) or plausibly (Tier 2) multiple people.
 *
 * SCOPE: shared-name collisions only (over-merge). The opposite problem — one
 * person split across name variants (Dave/David/D Smith) — is the 62.9%
 * single-result cohort and stays deferred to Phase 1.
 *
 * Review-and-flag ONLY. Nothing auto-splits. Emits:
 *   athlete-split-review-queue.csv   human-eyeball summary, Tier 1 first
 *   athlete-split-review-queue.json  ready-to-paste `splits` scaffolds (Tier 1)
 *
 * Reads buildAthleteCanon.mjs output (public/data/athletes/*.json). Run after it.
 * Read-only w.r.t. canon. From project root: node scripts/flagInconsistentClusters.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const ATHLETES = path.join(ROOT, 'public', 'data', 'athletes');
const CSV_OUT  = path.join(ROOT, 'athlete-split-review-queue.csv');
const JSON_OUT = path.join(ROOT, 'athlete-split-review-queue.json');

const TOP_N = 50; // cap the initial pass at the 50 highest-racesLogged clusters

// Must stay in sync with recordId() in buildAthleteCanon.mjs.
function recordId(r) {
  return `${r.raceSlug}:${r.year}:${r.distId}:p${r.pos}:${r.sec}`;
}

// Identifies a single race edition (one race, one year, one distance). Two
// finishing positions sharing this key cannot be the same person.
function editionKey(r) {
  return `${r.raceSlug}:${r.year}:${r.distId}`;
}

/** Parse an age category into an inclusive [lo, hi] year range, or null if the
 *  band is open/unbounded/unknown (e.g. "M Open", "Senior"). Handles "30–39",
 *  "30-39", "70+", "70–99". */
function ageRange(cat) {
  const s = String(cat || '');
  let m = s.match(/(\d{2,3})\s*[–—-]\s*(\d{2,3})/);
  if (m) return { lo: +m[1], hi: +m[2] };
  m = s.match(/(\d{2,3})\s*\+/);
  if (m) return { lo: +m[1], hi: 200 };
  return null; // Open / unbounded / no age info
}

/** Whole years separating two ranges: 0 if they overlap or merely touch,
 *  positive if there is a real gap between them. Age is taken on race day, so a
 *  runner can cross exactly ONE band boundary within a calendar year (turn 40
 *  mid-season → "M35-39" then "M40-44"). Touching bands are therefore legitimate;
 *  only a genuine gap (e.g. M30-39 vs M50-54) is physically impossible same-year. */
function bandGap(a, b) {
  if (a.lo > b.hi) return a.lo - b.hi - 1;
  if (b.lo > a.hi) return b.lo - a.hi - 1;
  return 0; // overlapping or adjacent
}

/** Implied birth-year window [lo, hi] for a result at `year` in band [lo,hi]. */
function birthWindow(year, range) {
  if (!range) return null;
  return { lo: year - range.hi, hi: year - range.lo };
}

/** Intersect two birth-year windows, tolerating `slack` years of separation so a
 *  mid-year birthday crossing (adjacent bands) stays in one group. Returns the
 *  tightened window (clamped to the real overlap) or null if truly incompatible. */
function intersect(a, b, slack = 2) {
  const lo = Math.max(a.lo, b.lo), hi = Math.min(a.hi, b.hi);
  if (lo <= hi) return { lo, hi };
  if (lo - hi <= slack) return { lo: Math.min(a.hi, b.hi), hi: Math.max(a.lo, b.lo) };
  return null;
}

// ─── Consistency check for one cluster ───────────────────────────────────────
function checkCluster(p) {
  const results = p.results.slice().sort((a, b) => a.year - b.year);
  const impossible = []; // top-priority: two finishes in the SAME race edition
  const tier1 = [];
  const tier2 = [];

  // ── Impossible: two finishing positions in one race edition (same race, year,
  // distance). One person cannot finish the same race twice — the single
  // strongest split signal, and category-independent (works even for Open/blank
  // fields where the age-band checks below are blind).
  const byEdition = new Map();
  for (const r of results) {
    const k = editionKey(r);
    if (!byEdition.has(k)) byEdition.set(k, []);
    byEdition.get(k).push(r);
  }
  for (const [, rs] of byEdition) {
    if (rs.length < 2) continue;
    const label = `${rs[0].race} ${rs[0].year}`;
    const positions = rs.map(r => `p${r.pos} (${r.time})`).join(', ');
    impossible.push({
      kind: 'same-race-twice',
      detail: `${label}: ${rs.length} finishes — ${positions}`,
    });
  }

  // ── Tier 1a: same calendar year, disjoint age bands (physically impossible).
  const byYear = new Map();
  for (const r of results) {
    if (!byYear.has(r.year)) byYear.set(r.year, []);
    byYear.get(r.year).push(r);
  }
  for (const [year, rs] of byYear) {
    const ranged = rs.map(r => ({ r, range: ageRange(r.cat) })).filter(x => x.range);
    for (let i = 0; i < ranged.length; i++) {
      for (let j = i + 1; j < ranged.length; j++) {
        const gap = bandGap(ranged[i].range, ranged[j].range);
        if (gap >= 1) { // real gap → not a mid-year birthday crossing
          tier1.push({
            kind: 'same-year-different-band',
            year,
            detail: `${year}: ${ranged[i].r.cat} (${ranged[i].r.race}) vs ${ranged[j].r.cat} (${ranged[j].r.race}) — ${gap}y gap`,
          });
        }
      }
    }
  }

  // ── Tier 1b: concurrent-race conflict.
  // NOTE: source rows carry year + a coarse per-distance season, not full dates,
  // so true same-day/different-region detection isn't possible from this data.
  // The strongest concurrency signal we CAN prove is 1a (same-year disjoint
  // bands). Documented here so a future dated-calendar source can extend this.

  // ── Tier 2a: age-band trajectory oddity across years.
  // For one person the implied birth year is ~constant (allowing ~±5 for band
  // scheme differences). A wide spread, or bands running backwards vs aging,
  // is a soft signal.
  const impliedBirths = results
    .map(r => ({ r, range: ageRange(r.cat) }))
    .filter(x => x.range)
    .map(x => {
      // Cap open-ended bands ("70+" stored as hi:200) to a nominal 10-year width
      // so the midpoint stays sane; normal 5/10-year bands are unaffected.
      const hi = Math.min(x.range.hi, x.range.lo + 9);
      return { r: x.r, mid: x.r.year - (x.range.lo + hi) / 2 };
    });
  if (impliedBirths.length >= 2) {
    const mids = impliedBirths.map(x => x.mid);
    const spread = Math.max(...mids) - Math.min(...mids);
    if (spread > 12) {
      const loRec = impliedBirths.reduce((a, b) => (a.mid < b.mid ? a : b));
      const hiRec = impliedBirths.reduce((a, b) => (a.mid > b.mid ? a : b));
      tier2.push({
        kind: 'age-trajectory-spread',
        detail: `implied birth-year spread ${spread.toFixed(0)}y: ${loRec.r.cat}@${loRec.r.year} vs ${hiRec.r.cat}@${hiRec.r.year}`,
      });
    }
  }

  // ── Tier 2b: performance-band implausibility between results close in time.
  // Same distance, ≤3 years apart, best/worst ratio beyond ~1.6× (allows aging
  // and a bad day, flags a gulf that suggests two different runners).
  const byDist = new Map();
  for (const r of results) {
    if (!r.sec) continue;
    if (!byDist.has(r.distId)) byDist.set(r.distId, []);
    byDist.get(r.distId).push(r);
  }
  for (const [distId, rs] of byDist) {
    rs.sort((a, b) => a.year - b.year);
    for (let i = 1; i < rs.length; i++) {
      const a = rs[i - 1], b = rs[i];
      if (b.year - a.year > 3) continue;
      const ratio = Math.max(a.sec, b.sec) / Math.min(a.sec, b.sec);
      if (ratio > 1.6) {
        tier2.push({
          kind: 'performance-gap',
          detail: `${distId} ${ratio.toFixed(2)}×: ${a.time}@${a.year} vs ${b.time}@${b.year}`,
        });
      }
    }
  }

  return { impossible, tier1, tier2 };
}

/** Suggested Tier-1 grouping: partition rows into age-consistent sub-sequences
 *  by intersecting implied birth-year windows. A hard constraint overrides the
 *  age logic: a group may NEVER contain two records from the same race edition
 *  (same race/year/distance), since one person can't finish a race twice — so
 *  such rows are always forced into separate groups. Open-band rows attach to
 *  the largest compatible group. Suggestion only — never applied automatically. */
function suggestGroups(p) {
  const results = p.results.slice().sort((a, b) => a.year - b.year);
  const groups = []; // { window|null, editions:Set, rows[] }
  const openRows = [];
  const canTake = (g, r) => !g.editions.has(editionKey(r)); // no same-edition clash
  for (const r of results) {
    const w = birthWindow(r.year, ageRange(r.cat));
    if (!w) { openRows.push(r); continue; }
    let placed = null;
    for (const g of groups) {
      if (!g.window || !canTake(g, r)) continue;
      const nx = intersect(g.window, w);
      if (nx) { g.window = nx; g.rows.push(r); g.editions.add(editionKey(r)); placed = g; break; }
    }
    if (!placed) groups.push({ window: { ...w }, editions: new Set([editionKey(r)]), rows: [r] });
  }
  // attach open-band rows to the largest compatible group (respecting the
  // same-edition constraint); spill into a fresh group if none can take them.
  if (groups.length === 0 && openRows.length) groups.push({ window: null, editions: new Set(), rows: [] });
  for (const r of openRows) {
    const target = groups
      .filter(g => canTake(g, r))
      .sort((a, b) => b.rows.length - a.rows.length)[0]
      || (() => { const ng = { window: null, editions: new Set(), rows: [] }; groups.push(ng); return ng; })();
    target.rows.push(r);
    target.editions.add(editionKey(r));
  }
  groups.sort((a, b) => b.rows.length - a.rows.length);
  return groups.map(g => g.rows);
}

// ─── Load multi-race clusters ────────────────────────────────────────────────
if (!fs.existsSync(ATHLETES)) {
  console.error('❌  public/data/athletes/ not found — run buildAthleteCanon.mjs first.');
  process.exit(1);
}
const profiles = [];
for (const f of fs.readdirSync(ATHLETES).filter(f => f.endsWith('.json'))) {
  const shard = JSON.parse(fs.readFileSync(path.join(ATHLETES, f), 'utf8'));
  for (const p of Object.values(shard)) if ((p.racesLogged ?? 0) > 1) profiles.push(p);
}
profiles.sort((a, b) => b.racesLogged - a.racesLogged);
const top = profiles.slice(0, TOP_N);

// ─── Run the checks ──────────────────────────────────────────────────────────
const flagged = [];
for (const p of top) {
  const { impossible, tier1, tier2 } = checkCluster(p);
  if (!impossible.length && !tier1.length && !tier2.length) continue;
  const tier = (impossible.length || tier1.length) ? 1 : 2;
  const suggested = tier === 1 ? suggestGroups(p) : null;
  flagged.push({ p, tier, impossible, tier1, tier2, suggested });
}
// Tier 1 before Tier 2; within Tier 1, clusters carrying an impossible
// same-race-twice finding rank first; then by racesLogged descending.
flagged.sort((a, b) =>
  (a.tier - b.tier) ||
  ((b.impossible.length ? 1 : 0) - (a.impossible.length ? 1 : 0)) ||
  (b.p.racesLogged - a.p.racesLogged));

const tier1Clusters = flagged.filter(f => f.tier === 1);
const tier2Clusters = flagged.filter(f => f.tier === 2);
const impossibleClusters = flagged.filter(f => f.impossible.length);

// ─── CSV output (Tier 1 first) ───────────────────────────────────────────────
function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvHead = 'tier,same_race_twice,name,slug,races,num_suggested_groups,findings,suggested_groups';
const csvRows = flagged.map(f => {
  const findings = [...f.impossible, ...f.tier1, ...f.tier2].map(x => x.detail).join(' ; ');
  const groups = f.suggested
    ? f.suggested.map((rows, i) => `G${i + 1}[${rows.length}]:` + rows.map(recordId).join(',')).join(' | ')
    : '';
  return [f.tier, f.impossible.length, f.p.name, f.p.slug, f.p.racesLogged, f.suggested ? f.suggested.length : '', findings, groups]
    .map(csvCell).join(',');
});
fs.writeFileSync(CSV_OUT, `${csvHead}\n${csvRows.join('\n')}\n`);

// ─── JSON scaffold: ready-to-paste `splits` blocks for Tier 1 ────────────────
const scaffold = {
  _instructions:
    'Review each Tier-1 cluster below. Edit `newSlug` per group to decide which fragment keeps the ' +
    'original URL (no default rule is applied). Delete groups/records you disagree with. When happy, ' +
    'move the corrected entries into src/data/athleteIdentityOverrides.json under "splits", then re-run ' +
    '`npm run generate`. recordIds are stable (raceSlug:year:distId:pPOS:sec).',
  generatedAt: new Date().toISOString(),
  clustersChecked: top.length,
  impossibleCount: impossibleClusters.length,
  tier1Count: tier1Clusters.length,
  tier2Count: tier2Clusters.length,
  splits: tier1Clusters.map(f => ({
    sourceSlug: f.p.slug,
    _name: f.p.name,
    _races: f.p.racesLogged,
    _sameRaceTwice: f.impossible.map(x => x.detail),
    _conflicts: f.tier1.map(x => x.detail),
    groups: f.suggested.map((rows, i) => ({
      newSlug: i === 0 ? f.p.slug : `${f.p.slug}-${i + 1}`,
      _years: `${Math.min(...rows.map(r => r.year))}-${Math.max(...rows.map(r => r.year))}`,
      recordIds: rows.map(recordId),
    })),
  })),
  tier2Context: tier2Clusters.map(f => ({
    slug: f.p.slug, name: f.p.name, races: f.p.racesLogged,
    signals: f.tier2.map(x => x.detail),
  })),
};
fs.writeFileSync(JSON_OUT, JSON.stringify(scaffold, null, 2));

// ─── Console summary ─────────────────────────────────────────────────────────
console.log('');
console.log('── Split-review (internally-inconsistent clusters) ────────────');
console.log(`   Multi-race clusters      : ${profiles.length.toLocaleString()}`);
console.log(`   Checked (top by races)   : ${top.length}${profiles.length > TOP_N ? ` of ${profiles.length.toLocaleString()} (capped at ${TOP_N})` : ''}`);
console.log(`   Same-race-twice (proof)  : ${impossibleClusters.length}`);
console.log(`   Tier 1 (near-certain)    : ${tier1Clusters.length}`);
console.log(`   Tier 2 (worth a look)    : ${tier2Clusters.length}`);
if (tier1Clusters.length) {
  console.log('   Tier 1 clusters:');
  for (const f of tier1Clusters) {
    const mark = f.impossible.length ? ` [same-race-twice ×${f.impossible.length}]` : '';
    console.log(`     • ${f.p.name} (${f.p.slug}) — ${f.p.racesLogged} races, ${f.suggested.length} suggested groups${mark}`);
  }
}
console.log('   → athlete-split-review-queue.csv / .json');
console.log('───────────────────────────────────────────────────────────────');
console.log('');
