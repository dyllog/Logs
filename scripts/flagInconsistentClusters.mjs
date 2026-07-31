#!/usr/bin/env node
/**
 * flagInconsistentClusters.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Split-review pass. The canon pipeline validates NEW fuzzy matches for
 * plausibility but never re-examines EXISTING exact-name-key clusters for the
 * same thing. A cluster like "Andrew Smith" (78 races) formed purely because
 * every row shares the exact normalized name — nothing checked whether those
 * rows are internally consistent with being ONE person.
 *
 * This runs the plausibility logic in the other direction: for each multi-race
 * canonical athlete, check chronological internal consistency and flag clusters
 * that are almost-certainly (Tier 1) or plausibly (Tier 2) multiple people.
 *
 * SCOPE: shared-name collisions only (over-merge). The opposite problem — one
 * person split across name variants (Dave/David/D Smith) — is the 62.8%
 * single-result cohort and stays deferred.
 *
 * ── Trail-aware (Task 8) ─────────────────────────────────────────────────────
 * Trail ingestion changed what these signals mean, so four things are explicit:
 *
 *  a) Same-race-twice is scoped to the SUB-EVENT, not the family. recordIds are
 *     {familySlug}:{year}:{subEventId}:p{pos}:{sec}, and editionKey uses the
 *     distId slot — which for trail IS the subEventId. So Tarawera T21 + T50 in
 *     one edition are different editions and are NOT flagged; only two records
 *     sharing one subEventId in one year are the hard impossibility.
 *
 *  b) Wide bands WIDEN the implied birth window, never assert a tight centre.
 *     Trail mixes 15-year bands (M 20-34) with 5-year ones (M 35-39), so the
 *     trajectory check intersects windows instead of comparing midpoints — a
 *     wide band overlapping a narrow neighbour is not a violation. Birth-year
 *     SPAN is still reported alongside the cohort chain so a wide band bridging
 *     two genuine cohorts can't silently collapse them (the Aaron Hill case).
 *
 *  c) Bands that fail a sanity parse (zero-width "29-29", inverted "18-17",
 *     implausible bounds) are excluded from age inference and counted. The raw
 *     value is preserved in the data; only inference ignores it. Without this
 *     a garbage band manufactures Tier 1 same-year conflicts out of nothing.
 *
 *  d) Nationality is a SOFT signal: consistent nat weakly supports one person,
 *     a mismatch is Tier 2 only — never Tier 1 alone, never grounds to split.
 *
 * Review-and-flag ONLY. Nothing auto-splits. Emits:
 *   athlete-split-review-queue.csv   human-eyeball summary, Tier 1 first
 *   athlete-split-review-queue.json  ready-to-paste `splits` scaffolds (Tier 1)
 *
 * ── knownMultiPerson is DERIVED here (Task 8b) ───────────────────────────────
 * Only ~50 of the 1,624 Tier 1 clusters will ever be partitioned by hand, but
 * every one of them is currently presented as a single athlete, which is
 * silently wrong. So this pass stamps `knownMultiPerson: true` onto the profile
 * shard of every cluster holding an unresolved Tier 1 conflict, making the flag
 * a live property of the data instead of a hand-maintained annotation:
 *   • partition a cluster → its conflicts vanish → the flag clears next run;
 *   • ingest a race that creates a fresh collision → disclosed immediately.
 * The manual `knownMultiPerson` array in athleteIdentityOverrides.json stays as
 * an ADDITIVE override, for clusters that genuinely combine people while being
 * internally consistent (peer-entangled: same age, same pace, same series) and
 * so throw no hard conflict of their own.
 *
 * TIER 1 ONLY. Tier 2 is 7,547 clusters on soft signals; flagging those would
 * put a doubt notice on ~10% of all profiles on suggestive evidence, which both
 * over-claims and devalues the notice where it is actually warranted.
 *
 * Reads buildAthleteCanon.mjs output (public/data/athletes/*.json). Run after it.
 * Read-only w.r.t. the canon registry (src/data/athleteCanon.json); it does
 * rewrite the derived profile shards to stamp the flag above.
 * From project root: node scripts/flagInconsistentClusters.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { trailFileMeta } from '../src/data/trailEvents.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const ATHLETES = path.join(DATA_DIR, 'athletes');
const CSV_OUT  = path.join(ROOT, 'athlete-split-review-queue.csv');
const JSON_OUT = path.join(ROOT, 'athlete-split-review-queue.json');

// Review set cap. Every multi-race cluster is CHECKED; this only bounds how
// many Tier 1 clusters get scaffolds/worksheets. The true count is reported.
const REVIEW_CAP = 50;

// Must stay in sync with recordId() in buildAthleteCanon.mjs.
function recordId(r) {
  return `${r.raceSlug}:${r.year}:${r.distId}:p${r.pos}:${r.sec}`;
}

// Identifies a single race edition: one race, one year, one distance — and for
// trail families, one SUB-EVENT (distId holds the subEventId). Two finishing
// positions sharing this key cannot be the same person. Deliberately NOT
// family-scoped: multi-event ultra runners legitimately enter two sub-events of
// one edition, and family scoping would flood Tier 1 with exactly those people.
function editionKey(r) {
  return `${r.raceSlug}:${r.year}:${r.distId}`;
}

// ─── Age bands ───────────────────────────────────────────────────────────────

/** True when a category parses to a numeric band that fails sanity: zero-width
 *  ("29-29"), inverted ("18-17"), or implausible bounds. Such bands are source
 *  noise — preserved in the data, excluded from inference. Kept separate from
 *  ageRange so parsing stays side-effect free (it is called several times per
 *  record, so counting inside it would tally attempts, not records). */
function isBadBand(cat) {
  const s = String(cat || '');
  let m = s.match(/(\d{2,3})\s*[–—-]\s*(\d{2,3})/);
  if (m) { const lo = +m[1], hi = +m[2]; return lo >= hi || lo < 5 || hi > 110; }
  m = s.match(/(\d{2,3})\s*\+/);
  if (m) { const lo = +m[1]; return lo < 5 || lo > 110; }
  return false;
}

/** Parse an age category into an inclusive [lo, hi] range, or null when the
 *  band is open-ended/unknown OR fails the sanity check. Pure. */
function ageRange(cat) {
  const s = String(cat || '');
  if (isBadBand(s)) return null;
  let m = s.match(/(\d{2,3})\s*[–—-]\s*(\d{2,3})/);
  if (m) return { lo: +m[1], hi: +m[2], open: false, width: +m[2] - +m[1] };
  m = s.match(/(\d{2,3})\s*\+/);
  if (m) return { lo: +m[1], hi: 200, open: true, width: Infinity };
  return null; // Open / unbounded / no age info — absent, not invalid
}

/** Whole years separating two ranges: 0 if they overlap or merely touch,
 *  positive if there is a real gap. Age is taken on race day, so a runner can
 *  cross exactly ONE band boundary within a calendar year (turn 40 mid-season →
 *  "M35-39" then "M40-44"). Touching bands are therefore legitimate; only a
 *  genuine gap (M30-39 vs M50-54) is impossible in one year. A wide band
 *  overlapping a narrow one yields 0 — correct, and the reason (b) holds. */
function bandGap(a, b) {
  if (a.lo > b.hi) return a.lo - b.hi - 1;
  if (b.lo > a.hi) return b.lo - a.hi - 1;
  return 0;
}

/** Implied birth-year window [lo, hi] for a result at `year`. A wider band
 *  yields a WIDER window — never a tighter assertion. */
function birthWindow(year, range) {
  if (!range) return null;
  return { lo: year - Math.min(range.hi, range.lo + 60), hi: year - range.lo };
}

/** Intersect two birth-year windows, tolerating `slack` years so a mid-year
 *  birthday crossing (adjacent bands) stays in one group. */
function intersect(a, b, slack = 2) {
  const lo = Math.max(a.lo, b.lo), hi = Math.min(a.hi, b.hi);
  if (lo <= hi) return { lo, hi };
  if (lo - hi <= slack) return { lo: Math.min(a.hi, b.hi), hi: Math.max(a.lo, b.lo) };
  return null;
}

/** Midpoint of a record's implied birth window, for span/cohort reporting only
 *  — never for deciding a violation. Open bands capped to a nominal 10y width. */
function birthMid(year, range) {
  if (!range) return null;
  const hi = Math.min(range.hi, range.lo + 9);
  return Math.round(year - (range.lo + hi) / 2);
}

// ─── Consistency check for one cluster ───────────────────────────────────────
function checkCluster(p, natById) {
  const results = p.results.slice().sort((a, b) => a.year - b.year);
  const impossible = []; // top-priority: two finishes in the SAME edition
  const tier1 = [];
  const tier2 = [];

  // ── Impossible: two finishing positions in one edition (race, year, and —
  // for trail — sub-event). Category-independent, so it works even where the
  // age-band checks are blind.
  const byEdition = new Map();
  for (const r of results) {
    const k = editionKey(r);
    if (!byEdition.has(k)) byEdition.set(k, []);
    byEdition.get(k).push(r);
  }
  for (const [, rs] of byEdition) {
    if (rs.length < 2) continue;
    impossible.push({
      kind: 'same-edition-twice',
      detail: `${rs[0].race} ${rs[0].year}: ${rs.length} finishes — ${rs.map(r => `p${r.pos} (${r.time})`).join(', ')}`,
    });
  }

  // ── Tier 1a: same calendar year, disjoint age bands (physically impossible).
  // Only valid bands participate — a garbage band must never manufacture this.
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
        if (gap >= 1) {
          tier1.push({
            kind: 'same-year-different-band',
            year,
            detail: `${year}: ${ranged[i].r.cat} (${ranged[i].r.race}) vs ${ranged[j].r.cat} (${ranged[j].r.race}) — ${gap}y gap`,
          });
        }
      }
    }
  }

  // ── Tier 2a: birth-window trajectory. Windows are INTERSECTED rather than
  // midpoints compared, so a wide band widens the feasible range instead of
  // asserting a centre. A flag fires only when no single birth year can satisfy
  // every record — i.e. the cluster genuinely cannot be one person on age
  // evidence. Span is reported so a wide band bridging two cohorts still shows.
  const windows = results
    .map(r => ({ r, range: ageRange(r.cat) }))
    .filter(x => x.range)
    .map(x => ({ r: x.r, w: birthWindow(x.r.year, x.range), mid: birthMid(x.r.year, x.range) }));
  if (windows.length >= 2) {
    let acc = windows[0].w;
    let breaker = null;
    for (let i = 1; i < windows.length && acc; i++) {
      const nx = intersect(acc, windows[i].w);
      if (!nx) { breaker = windows[i]; acc = null; break; }
      acc = nx;
    }
    if (!acc) {
      const mids = windows.map(x => x.mid).filter(m => m != null).sort((a, b) => a - b);
      const span = mids.length ? mids[mids.length - 1] - mids[0] : 0;
      tier2.push({
        kind: 'age-trajectory-incompatible',
        detail: `no single birth year fits all records (birth-year span ~${span}y, ~${mids[0]}–~${mids[mids.length - 1]}); first incompatible: ${breaker.r.cat}@${breaker.r.year} (${breaker.r.race})`,
      });
    }
  }

  // ── Tier 2b: performance-band implausibility between results close in time.
  // Same distance, ≤3 years apart, best/worst ratio beyond ~1.6×. Trail rows are
  // excluded: a sub-event's course can change year to year, and ultra times
  // swing on weather and conditions far more than a certified road course.
  const byDist = new Map();
  for (const r of results) {
    if (!r.sec || r.trail) continue;
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

  // ── Tier 2c: nationality mismatch. SOFT signal only — people change or
  // mis-enter nationality and providers differ, so this never reaches Tier 1
  // and is never grounds to split on its own.
  const nats = new Map();
  for (const r of results) {
    const n = natById.get(recordId(r));
    if (n) nats.set(n, (nats.get(n) ?? 0) + 1);
  }
  if (nats.size > 1) {
    const listed = [...nats].sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n}×${c}`).join(', ');
    tier2.push({ kind: 'nationality-mismatch', detail: `${nats.size} nationalities across records: ${listed}` });
  }

  return { impossible, tier1, tier2, natCount: nats.size };
}

/** Suggested Tier-1 grouping: partition rows into age-consistent sub-sequences
 *  by intersecting implied birth-year windows. Hard constraint: a group may
 *  NEVER contain two records from the same EDITION (race/year/sub-event), since
 *  one person can't finish a race twice — such rows are always forced apart.
 *  Open/invalid-band rows attach to the largest compatible group. Advisory
 *  only — never applied automatically. */
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

// ─── Load nationality per record (profile shards drop it to stay lean) ───────
const TRAIL_META = trailFileMeta();
const ROAD_META = {
  '': 'auckland-marathon:mar', 'half': 'auckland-marathon:half',
  'rot': 'rotorua-marathon:mar', 'rot-half': 'rotorua-marathon:half',
  'chc': 'christchurch-marathon:mar', 'chc-half': 'christchurch-marathon:half',
  'qt': 'queenstown-marathon:mar', 'qt-half': 'queenstown-marathon:half',
  'hb': 'hawkes-bay-marathon:mar', 'hb-half': 'hawkes-bay-marathon:half',
  'wf-half': 'waterfront-half-marathon:half', 'wf-10k': 'waterfront-half-marathon:10k',
  'dev-half': 'devonport-half-marathon:half', 'dev-10k': 'devonport-half-marathon:10k',
  'coast-half': 'coatesville-half-marathon:half',
  'omaha-half': 'omaha-half-marathon:half', 'omaha-10k': 'omaha-half-marathon:10k',
  'maraetai-half': 'maraetai-half-marathon:half', 'maraetai-10k': 'maraetai-half-marathon:10k',
  'kerikeri-half': 'kerikeri-half-marathon:half',
  'wellington-mar': 'wellington-marathon:mar', 'wellington-half': 'wellington-marathon:half',
  'onehunga-half': 'onehunga-half-marathon:half', 'onehunga-10k': 'onehunga-half-marathon:10k',
  'orewa-half': 'orewa-half-marathon:half', 'orewa-10k': 'orewa-half-marathon:10k',
  'tamaki-half': 'tamaki-river-half-marathon:half', 'tamaki-10k': 'tamaki-river-half-marathon:10k',
  'mtm-half': 'mount-maunganui-half-marathon:half', 'mtm-10k': 'mount-maunganui-half-marathon:10k',
  'mtm-5k': 'mount-maunganui-half-marathon:5k',
};
const natById = new Map();
for (const f of fs.readdirSync(DATA_DIR).filter(f => f.startsWith('results-') && f.endsWith('.json'))) {
  const key = f.replace(/^results-/, '').replace(/-?\d{4}\.json$/, '');
  const yM = f.match(/(\d{4})\.json$/);
  if (!yM) continue;
  const year = parseInt(yM[1], 10);
  let slugDist = ROAD_META[key];
  if (!slugDist && TRAIL_META[key]) slugDist = `${TRAIL_META[key].raceSlug}:${TRAIL_META[key].distId}`;
  if (!slugDist) continue;
  const [raceSlug, distId] = slugDist.split(':');
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')); } catch { continue; }
  if (!Array.isArray(rows)) continue;
  for (const r of rows) {
    const n = (r.nat && r.nat !== '—') ? r.nat.trim() : '';
    if (!n) continue;
    natById.set(`${raceSlug}:${year}:${distId}:p${r.pos ?? 0}:${r.sec ?? 0}`, n);
  }
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

// ─── Run the checks over EVERY multi-race cluster ────────────────────────────
// (Previously capped at the top 50 by racesLogged, which never even looked at
// mid-sized clusters — aaron-smith at 21 races was invisible.)
const surfaceOf = (p) => {
  const t = p.results.filter(r => r.trail).length;
  return t === 0 ? 'road' : t === p.results.length ? 'trail' : 'mixed';
};

const flagged = [];
for (const p of profiles) {
  const { impossible, tier1, tier2 } = checkCluster(p, natById);
  if (!impossible.length && !tier1.length && !tier2.length) continue;
  const tier = (impossible.length || tier1.length) ? 1 : 2;
  flagged.push({ p, tier, impossible, tier1, tier2, surface: surfaceOf(p) });
}
flagged.sort((a, b) =>
  (a.tier - b.tier) ||
  ((b.impossible.length ? 1 : 0) - (a.impossible.length ? 1 : 0)) ||
  (b.p.racesLogged - a.p.racesLogged));

// ─── Bad-band exclusion tally (distinct RECORDS, not parse attempts) ─────────
// Counted over the clusters actually analysed, plus an archive-wide figure so
// the scale of the source problem is visible even outside multi-race clusters.
const badBandSeen = new Set();
const badBandCountsFinal = new Map();
for (const p of profiles) {
  for (const r of p.results) {
    if (!isBadBand(r.cat)) continue;
    const id = recordId(r);
    if (badBandSeen.has(id)) continue;
    badBandSeen.add(id);
    badBandCountsFinal.set(r.cat, (badBandCountsFinal.get(r.cat) ?? 0) + 1);
  }
}
const badBandRowsFinal = badBandSeen.size;

let badBandArchiveWide = 0;
for (const f of fs.readdirSync(DATA_DIR).filter(f => f.startsWith('results-') && f.endsWith('.json'))) {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')); } catch { continue; }
  if (!Array.isArray(rows)) continue;
  for (const r of rows) if (isBadBand(r.cat)) badBandArchiveWide++;
}

const tier1All = flagged.filter(f => f.tier === 1);
const tier2All = flagged.filter(f => f.tier === 2);
const impossibleAll = flagged.filter(f => f.impossible.length);

// Review set: top N Tier 1 by racesLogged. Suggestions computed for these only.
const reviewSet = tier1All.slice(0, REVIEW_CAP);
for (const f of reviewSet) f.suggested = suggestGroups(f.p);

// ─── Stamp knownMultiPerson onto the profile shards ──────────────────────────
// Derived = every Tier 1 cluster (hard conflict, unresolved). Manual = the
// additive override array. The flag is rewritten from scratch every run, so a
// cluster whose conflicts are resolved by an encoded split loses it without
// anyone editing a list.
const manualFlags = (() => {
  const p = path.join(ROOT, 'src', 'data', 'athleteIdentityOverrides.json');
  try { return new Set(JSON.parse(fs.readFileSync(p, 'utf8')).knownMultiPerson ?? []); }
  catch { return new Set(); }
})();
const derivedFlags = new Set(tier1All.map(f => f.p.slug));
const flagSet = new Set([...derivedFlags, ...manualFlags]);
const manualOnly = [...manualFlags].filter(s => !derivedFlags.has(s));

let stampedAdded = 0, stampedRemoved = 0, shardsRewritten = 0;
for (const file of fs.readdirSync(ATHLETES).filter(f => f.endsWith('.json'))) {
  const fp = path.join(ATHLETES, file);
  const shard = JSON.parse(fs.readFileSync(fp, 'utf8'));
  let dirty = false;
  for (const [slug, prof] of Object.entries(shard)) {
    const want = flagSet.has(slug);
    if (want && prof.knownMultiPerson !== true) { prof.knownMultiPerson = true; stampedAdded++; dirty = true; }
    else if (!want && 'knownMultiPerson' in prof) { delete prof.knownMultiPerson; stampedRemoved++; dirty = true; }
  }
  if (dirty) { fs.writeFileSync(fp, JSON.stringify(shard)); shardsRewritten++; }
}

// ─── Delta vs a road-only baseline ───────────────────────────────────────────
// Reconstructs what this pass would have flagged before trail ingestion:
// clustering is by exact nameKey+gender, so dropping trail rows faithfully
// recovers the pre-trail cluster contents. Clusters left with <2 records
// weren't multi-race profiles pre-trail and are excluded.
const preTrailTier1 = new Set();
for (const p of profiles) {
  const roadRows = p.results.filter(r => !r.trail);
  if (roadRows.length < 2) continue;
  const { impossible, tier1 } = checkCluster({ ...p, results: roadRows }, natById);
  if (impossible.length || tier1.length) preTrailTier1.add(p.slug);
}
const newTier1 = tier1All.filter(f => !preTrailTier1.has(f.p.slug));

// ─── CSV output (Tier 1 first) ───────────────────────────────────────────────
function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvHead = 'tier,same_edition_twice,surface,name,slug,races,num_suggested_groups,findings,suggested_groups';
const csvRows = flagged.map(f => {
  const findings = [...f.impossible, ...f.tier1, ...f.tier2].map(x => x.detail).join(' ; ');
  const groups = f.suggested
    ? f.suggested.map((rows, i) => `G${i + 1}[${rows.length}]:` + rows.map(recordId).join(',')).join(' | ')
    : '';
  return [f.tier, f.impossible.length, f.surface, f.p.name, f.p.slug, f.p.racesLogged,
          f.suggested ? f.suggested.length : '', findings, groups].map(csvCell).join(',');
});
fs.writeFileSync(CSV_OUT, `${csvHead}\n${csvRows.join('\n')}\n`);

// ─── JSON scaffold: ready-to-paste `splits` blocks for the review set ────────
const breakdown = (list) => ({
  road:  list.filter(f => f.surface === 'road').length,
  trail: list.filter(f => f.surface === 'trail').length,
  mixed: list.filter(f => f.surface === 'mixed').length,
});
const scaffold = {
  _instructions:
    'Review each Tier-1 cluster below. Edit `newSlug` per group to decide which fragment keeps the ' +
    'original URL (no default rule is applied). Delete groups/records you disagree with. When happy, ' +
    'move the corrected entries into src/data/athleteIdentityOverrides.json under "splits", then re-run ' +
    '`npm run generate`. recordIds are stable (raceSlug:year:distId:pPOS:sec; distId is the subEventId for trail).',
  generatedAt: new Date().toISOString(),
  clustersChecked: profiles.length,
  reviewCap: REVIEW_CAP,
  impossibleCount: impossibleAll.length,
  tier1CountTrue: tier1All.length,
  tier1InReviewSet: reviewSet.length,
  tier1Truncated: Math.max(0, tier1All.length - reviewSet.length),
  tier2Count: tier2All.length,
  surfaceBreakdown: { tier1: breakdown(tier1All), tier2: breakdown(tier2All) },
  knownMultiPerson: {
    total: flagSet.size,
    derivedFromTier1: derivedFlags.size,
    manualOnly,
    note: 'Derived every run from unresolved Tier 1 conflicts, plus the additive manual override array. Tier 2 clusters are never flagged. Resolving a cluster via `splits` clears its flag automatically on the next generate.',
  },
  ageInference: {
    recordsExcludedInCheckedClusters: badBandRowsFinal,
    recordsExcludedArchiveWide: badBandArchiveWide,
    bands: Object.fromEntries([...badBandCountsFinal].sort((a, b) => b[1] - a[1])),
    note: 'Bands failing sanity parse (zero-width "29-29", inverted "18-17", implausible bounds) are excluded from birth-year inference only; raw values remain in the results data. Counts are distinct records, not parse attempts.',
  },
  deltaVsPreTrail: {
    preTrailTier1Count: preTrailTier1.size,
    newTier1Count: newTier1.length,
    newTier1: newTier1.slice(0, 100).map(f => ({ slug: f.p.slug, name: f.p.name, races: f.p.racesLogged, surface: f.surface })),
  },
  splits: reviewSet.map(f => ({
    sourceSlug: f.p.slug,
    _name: f.p.name,
    _races: f.p.racesLogged,
    _surface: f.surface,
    _sameEditionTwice: f.impossible.map(x => x.detail),
    _conflicts: f.tier1.map(x => x.detail),
    groups: f.suggested.map((rows, i) => ({
      newSlug: i === 0 ? f.p.slug : `${f.p.slug}-${i + 1}`,
      _years: `${Math.min(...rows.map(r => r.year))}-${Math.max(...rows.map(r => r.year))}`,
      recordIds: rows.map(recordId),
    })),
  })),
  tier2Context: tier2All.slice(0, 200).map(f => ({
    slug: f.p.slug, name: f.p.name, races: f.p.racesLogged, surface: f.surface,
    signals: f.tier2.map(x => x.detail),
  })),
};
fs.writeFileSync(JSON_OUT, JSON.stringify(scaffold, null, 2));

// ─── Console summary ─────────────────────────────────────────────────────────
const b1 = breakdown(tier1All), b2 = breakdown(tier2All);
console.log('');
console.log('── Split-review (internally-inconsistent clusters) ────────────');
console.log(`   Multi-race clusters      : ${profiles.length.toLocaleString()}`);
console.log(`   Checked                  : ${profiles.length.toLocaleString()}  (all — no pre-filter)`);
console.log(`   Same-edition-twice       : ${impossibleAll.length.toLocaleString()}  (sub-event scoped)`);
console.log(`   Tier 1 (near-certain)    : ${tier1All.length.toLocaleString()}  [road ${b1.road} · trail ${b1.trail} · mixed ${b1.mixed}]`);
console.log(`   Tier 2 (worth a look)    : ${tier2All.length.toLocaleString()}  [road ${b2.road} · trail ${b2.trail} · mixed ${b2.mixed}]`);
if (tier1All.length > REVIEW_CAP) {
  console.log(`   ⚠️  Tier 1 (${tier1All.length.toLocaleString()}) exceeds the review cap — scaffolds emitted for the top ${REVIEW_CAP} by racesLogged; ${(tier1All.length - REVIEW_CAP).toLocaleString()} NOT truncated silently.`);
}
console.log(`   Bad-band records excluded: ${badBandRowsFinal.toLocaleString()} in checked clusters / ${badBandArchiveWide.toLocaleString()} archive-wide  ${badBandCountsFinal.size ? `(${[...badBandCountsFinal].map(([b, n]) => `${b}×${n}`).join(', ')})` : ''}`);
console.log(`   Delta vs pre-trail       : ${preTrailTier1.size.toLocaleString()} Tier 1 on road-only data → ${newTier1.length.toLocaleString()} NEW Tier 1 after trail`);
console.log(`   knownMultiPerson stamped : ${flagSet.size.toLocaleString()} profiles  (${derivedFlags.size.toLocaleString()} derived from Tier 1 + ${manualOnly.length} manual-only${manualOnly.length ? `: ${manualOnly.join(', ')}` : ''})`);
console.log(`                              +${stampedAdded.toLocaleString()} added, −${stampedRemoved.toLocaleString()} cleared across ${shardsRewritten} shard(s)`);
console.log('   Review set (top by races):');
for (const f of reviewSet.slice(0, 15)) {
  const mark = f.impossible.length ? ` [same-edition-twice ×${f.impossible.length}]` : '';
  console.log(`     • ${f.p.name} (${f.p.slug}) — ${f.p.racesLogged} races, ${f.surface}, ${f.suggested.length} groups${mark}`);
}
if (reviewSet.length > 15) console.log(`     … and ${reviewSet.length - 15} more in the scaffold`);
console.log('   → athlete-split-review-queue.csv / .json');
console.log('───────────────────────────────────────────────────────────────');
console.log('');
