#!/usr/bin/env node
/**
 * buildAthleteCanon.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical athlete identity resolution over every public/data/results-*.json.
 *
 * Pipeline:
 *   1. Load + normalise every result row (name key, gender, race/dist/year).
 *   2. Block by nameKey; split blocks that span more than one real gender.
 *   3. Merge registry aliases + manual overrides (the ONLY non-exact merges —
 *      conservative stance: fuzzy matches are surfaced for review, never auto-merged).
 *   4. Assign stable canonical ids/slugs (existing 26 registry slugs preserved;
 *      prior athleteCanon.json reused so slugs don't drift between runs).
 *   5. Emit sharded, fetched outputs (multi-race athletes only for browse/profile;
 *      single-race names stay searchable via the existing search index):
 *        public/data/athletes/{aa}.json        profile data, sharded by 2-char slug prefix
 *        public/data/athlete-index/{letter}.json browse index, sharded by first letter
 *        src/data/athleteCanon.json             full canonical registry (id/slug/keys)
 *        athlete-review-queue.csv               fuzzy candidates for manual resolution
 *
 * Run from project root:  node scripts/buildAthleteCanon.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeName, nameKey } from './normalizeAthleteName.mjs';
import { trailFileMeta } from '../src/data/trailEvents.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const DATA_DIR  = path.join(ROOT, 'public', 'data');
const SRC_DATA  = path.join(ROOT, 'src', 'data');
const ATHLETES_OUT = path.join(DATA_DIR, 'athletes');
const INDEX_OUT    = path.join(DATA_DIR, 'athlete-index');
const CANON_PATH   = path.join(SRC_DATA, 'athleteCanon.json');
const OVERRIDES_PATH = path.join(SRC_DATA, 'athleteIdentityOverrides.json');
const REGISTRY_PATH  = path.join(SRC_DATA, 'athleteRegistry.ts');
const REVIEW_PATH    = path.join(ROOT, 'athlete-review-queue.csv');
const REPORT_PATH    = path.join(ROOT, 'athlete-canon-report.json');

// ─── File-key → race metadata ────────────────────────────────────────────────
// key = filename minus "results-" prefix and "-YYYY.json" suffix.
const FILE_META = {
  '':                { label: 'Auckland Marathon',     raceSlug: 'auckland-marathon',        dist: '42.2 km', distId: 'mar'  },
  'half':            { label: 'Auckland Half',         raceSlug: 'auckland-marathon',        dist: '21.1 km', distId: 'half' },
  'rot':             { label: 'Rotorua Marathon',      raceSlug: 'rotorua-marathon',         dist: '42.2 km', distId: 'mar'  },
  'rot-half':        { label: 'Rotorua Half',          raceSlug: 'rotorua-marathon',         dist: '21.1 km', distId: 'half' },
  'chc':             { label: 'Christchurch Marathon', raceSlug: 'christchurch-marathon',    dist: '42.2 km', distId: 'mar'  },
  'chc-half':        { label: 'Christchurch Half',     raceSlug: 'christchurch-marathon',    dist: '21.1 km', distId: 'half' },
  'qt':              { label: 'Queenstown Marathon',   raceSlug: 'queenstown-marathon',      dist: '42.2 km', distId: 'mar'  },
  'qt-half':         { label: 'Queenstown Half',       raceSlug: 'queenstown-marathon',      dist: '21.1 km', distId: 'half' },
  'hb':              { label: "Hawke's Bay Marathon",  raceSlug: 'hawkes-bay-marathon',      dist: '42.2 km', distId: 'mar'  },
  'hb-half':         { label: "Hawke's Bay Half",      raceSlug: 'hawkes-bay-marathon',      dist: '21.1 km', distId: 'half' },
  'wf-half':         { label: 'Waterfront Half',       raceSlug: 'waterfront-half-marathon', dist: '21.1 km', distId: 'half' },
  'wf-10k':          { label: 'Waterfront 10k',        raceSlug: 'waterfront-half-marathon', dist: '10 km',   distId: '10k'  },
  'dev-half':        { label: 'Devonport Half',        raceSlug: 'devonport-half-marathon',  dist: '21.1 km', distId: 'half' },
  'dev-10k':         { label: 'Devonport 10k',         raceSlug: 'devonport-half-marathon',  dist: '10 km',   distId: '10k'  },
  'coast-half':      { label: 'Coatesville Half',      raceSlug: 'coatesville-half-marathon',dist: '21.1 km', distId: 'half' },
  'omaha-half':      { label: 'Omaha Half',            raceSlug: 'omaha-half-marathon',      dist: '21.1 km', distId: 'half' },
  'omaha-10k':       { label: 'Omaha 10k',             raceSlug: 'omaha-half-marathon',      dist: '10 km',   distId: '10k'  },
  'maraetai-half':   { label: 'Maraetai Half',         raceSlug: 'maraetai-half-marathon',   dist: '21.1 km', distId: 'half' },
  'maraetai-10k':    { label: 'Maraetai 10k',          raceSlug: 'maraetai-half-marathon',   dist: '10 km',   distId: '10k'  },
  'kerikeri-half':   { label: 'Kerikeri Half',         raceSlug: 'kerikeri-half-marathon',   dist: '21.1 km', distId: 'half' },
  'wellington-mar':  { label: 'Wellington Marathon',   raceSlug: 'wellington-marathon',      dist: '42.2 km', distId: 'mar'  },
  'wellington-half': { label: 'Wellington Half',       raceSlug: 'wellington-marathon',      dist: '21.1 km', distId: 'half' },
  'onehunga-half':   { label: 'Onehunga Half',         raceSlug: 'onehunga-half-marathon',   dist: '21.1 km', distId: 'half' },
  'onehunga-10k':    { label: 'Onehunga 10k',          raceSlug: 'onehunga-half-marathon',   dist: '10 km',   distId: '10k'  },
  'orewa-half':      { label: 'Orewa Half',            raceSlug: 'orewa-half-marathon',      dist: '21.1 km', distId: 'half' },
  'orewa-10k':       { label: 'Orewa 10k',             raceSlug: 'orewa-half-marathon',      dist: '10 km',   distId: '10k'  },
  'tamaki-half':     { label: 'Tamaki River Half',     raceSlug: 'tamaki-river-half-marathon',dist: '21.1 km', distId: 'half' },
  'tamaki-10k':      { label: 'Tamaki River 10k',      raceSlug: 'tamaki-river-half-marathon',dist: '10 km',   distId: '10k'  },
  'mtm-half':        { label: 'Mt Maunganui Half',     raceSlug: 'mount-maunganui-half-marathon', dist: '21.1 km', distId: 'half' },
  'mtm-10k':         { label: 'Mt Maunganui 10k',      raceSlug: 'mount-maunganui-half-marathon', dist: '10 km',   distId: '10k'  },
  'mtm-5k':          { label: 'Mt Maunganui 5k',       raceSlug: 'mount-maunganui-half-marathon', dist: '5 km',    distId: '5k'   },
  // Whanganui's 10k was published as "10K" in 2017/19/22 and "105K" (10.5K) in
  // 2018/20/23/24/25 — one event, two labels. Recorded as 10 km on evidence:
  // see the note in ROAD_FAMILIES in scripts/roadToJson.mjs.
  'whanganui-mar':   { label: 'Whanganui Marathon',    raceSlug: 'whanganui-three-bridges-marathon', dist: '42.2 km', distId: 'mar'  },
  'whanganui-half':  { label: 'Whanganui Half',        raceSlug: 'whanganui-three-bridges-marathon', dist: '21.1 km', distId: 'half' },
  'whanganui-10k':   { label: 'Whanganui 10k',         raceSlug: 'whanganui-three-bridges-marathon', dist: '10 km',   distId: '10k'  },
  'whanganui-5k':    { label: 'Whanganui 5k',          raceSlug: 'whanganui-three-bridges-marathon', dist: '5 km',    distId: '5k'   },
};

// Trail file keys ({familySlug}-{subEventId}) come from the trail config so the
// canon can't drift from what the converter emitted. subEventId occupies the
// distId slot — era-stable, so recordIds survive rebrands (TUM 102 → T102).
// The dist string is the REAL measured distance for that year, per the config.
const TRAIL_FILE_META = trailFileMeta();

function fileMeta(filename) {
  const base = path.basename(filename);
  const key  = base.replace(/^results-/, '').replace(/-?\d{4}\.json$/, '');
  const yM   = base.match(/(\d{4})\.json$/);
  const year = yM ? parseInt(yM[1], 10) : 0;
  const meta = FILE_META[key];
  if (meta) return { ...meta, year, key };
  const tm = TRAIL_FILE_META[key];
  if (tm) {
    const km = tm.distByYear[year];
    return {
      label: tm.label, raceSlug: tm.raceSlug, distId: tm.distId,
      dist: km ? `${km} km` : 'trail',
      trail: true, seasonMonth: tm.seasonMonth,
      year, key,
    };
  }
  return null;
}

function genderOf(cat) {
  const m = (cat ?? '').match(/^([MW])/);
  return m ? m[1] : '?';
}

/** Lower bound of an age band, for coarse trajectory checks. null if unknown. */
function bandLower(cat) {
  const m = (cat ?? '').match(/(\d{2,3})/);
  return m ? parseInt(m[1], 10) : null;
}

// Stable per-result identity: one finisher occupies exactly one (race, year,
// distance, position) slot, so this is globally unique and — unlike an array
// index — survives re-runs regardless of clustering order. Used by manual splits
// and by scripts/flagInconsistentClusters.mjs (must stay in sync).
function recordId(r) {
  return `${r.raceSlug}:${r.year}:${r.distId}:p${r.pos}:${r.sec}`;
}

function slugify(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Jaro-Winkler (for review-queue candidate scoring only) ──────────────────
function jaroWinkler(a, b) {
  if (a === b) return 1;
  const la = a.length, lb = b.length;
  if (!la || !lb) return 0;
  const range = Math.max(0, Math.floor(Math.max(la, lb) / 2) - 1);
  const ma = new Array(la).fill(false);
  const mb = new Array(lb).fill(false);
  let matches = 0;
  for (let i = 0; i < la; i++) {
    const lo = Math.max(0, i - range), hi = Math.min(i + range + 1, lb);
    for (let j = lo; j < hi; j++) {
      if (mb[j] || a[i] !== b[j]) continue;
      ma[i] = mb[j] = true; matches++; break;
    }
  }
  if (!matches) return 0;
  let t = 0, k = 0;
  for (let i = 0; i < la; i++) {
    if (!ma[i]) continue;
    while (!mb[k]) k++;
    if (a[i] !== b[k]) t++;
    k++;
  }
  t /= 2;
  const jaro = (matches / la + matches / lb + (matches - t) / matches) / 3;
  let prefix = 0;
  for (let i = 0; i < Math.min(4, la, lb); i++) {
    if (a[i] === b[i]) prefix++; else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

// ─── 1. Load + normalise every row ───────────────────────────────────────────
console.log('Loading result files…');
const files = fs.readdirSync(DATA_DIR)
  .filter(f => f.startsWith('results-') && f.endsWith('.json'))
  .sort();

// ─── Nationality ─────────────────────────────────────────────────────────────
// Sources write '—' for "not recorded"; it is a placeholder, not a value.
// Normalisation is mechanical only — trim and upper-case. Codes are NOT mapped
// onto a canonical IOC list: a handful of low-frequency values are non-IOC
// ('IRA', 'PRU', 'MLD'), and guessing what a provider meant would be curation
// dressed up as cleaning. They are reported instead, for a curated decision.
const normNat = (v) => {
  const s = (v ?? '').toString().trim().toUpperCase();
  return s && s !== '—' && s !== '-' ? s : '';
};

// ─── Club / team: deliberately NOT carried ───────────────────────────────────
// The 2023–24 Auckland exports publish a "Team" column, and csvToJson.mjs now
// captures it into the results JSON — it is real published source data and is
// kept there. It stops at that boundary on purpose: the values are entry-form
// text, not affiliation data. The year is baked into names ('KPMG2023',
// 'Beca24'), one entity is spelled differently across years (Liberty → Liberty
// Financial, DUAL New Zealand → DUAL NZ), and single-event corporate entries
// sit alongside genuine clubs with nothing to separate them mechanically.
// No aggregation the canon could offer would be honest, so none is offered.
// Reviving this needs curated entity resolution, not raw entry text.

// Cohort sizes are a property of a RACE-YEAR, not of a result. Repeating the
// same number on all 115,547 rows that carried it cost 1.71 MB of profile
// shards to say one thing 115,547 times. Emitted once here and looked up by
// the profile page instead.
//   { "raceSlug:year:distId": { NZL: 884, AUS: 61, ... } }
const natCohorts = {};

/** Minimum share of a field carrying a nationality before national placing is computed. */
const NAT_COVERAGE_MIN = 0.90;

/** file → { total, covered, coverage }, reported so the threshold stays evidence-led. */
const natCoverageByFile = new Map();

// clusterKey (nameKey|gender) → cluster { key, display, gender, results[], nameKeys:Set }
const clusters = new Map();
let rowCount = 0, skippedFiles = 0;

for (const file of files) {
  const meta = fileMeta(file);
  if (!meta) { console.warn(`⚠️  Unmapped file key, skipping ${file}`); skippedFiles++; continue; }
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')); }
  catch { console.warn(`⚠️  Bad JSON, skipping ${file}`); skippedFiles++; continue; }
  if (!Array.isArray(rows)) continue;
  const total = rows.length;

  // ── National placing, computed within the field as recorded ──────────────
  // Rank among finishers of the same nationality in this exact race-year. It
  // is only meaningful if the field's nationality coverage is substantially
  // complete: a "9th NZ" computed over half a field is simply wrong, and wrong
  // in a way a reader cannot detect. Coverage across the archive is cleanly
  // bimodal — files are either at zero or above 93% — so this threshold
  // separates the two populations rather than splitting a continuum.
  const natCovered = rows.filter(r => normNat(r.nat)).length;
  const natCoverage = total ? natCovered / total : 0;
  natCoverageByFile.set(file, { total, covered: natCovered, coverage: natCoverage });

  const natRank = new Map();
  if (natCoverage >= NAT_COVERAGE_MIN) {
    const byNat = new Map();
    for (const r of rows) {
      const n = normNat(r.nat);
      if (!n) continue;
      if (!byNat.has(n)) byNat.set(n, []);
      byNat.get(n).push(r);
    }
    for (const [natCode, rs] of byNat) {
      // Order by the finishing position the race recorded — never by time,
      // which would silently re-rank a field whose positions came from gun.
      rs.sort((a, b) => (a.pos ?? Infinity) - (b.pos ?? Infinity));
      rs.forEach((r, i) => natRank.set(r, { pos: i + 1 }));
      const cohortKey = `${meta.raceSlug}:${meta.year}:${meta.distId}`;
      (natCohorts[cohortKey] ??= {})[natCode] = rs.length;
    }
  }

  for (const r of rows) {
    const raw = (r.name ?? '').trim();
    if (!raw) continue;
    const key = nameKey(raw);
    if (!key) continue;
    rowCount++;

    const gender = genderOf(r.cat);
    const clusterKey = `${key}|${gender}`;
    let c = clusters.get(clusterKey);
    if (!c) {
      c = { key, gender, display: normalizeName(raw), nameKeys: new Set([key]), results: [] };
      clusters.set(clusterKey, c);
    }
    c.results.push({
      year: meta.year,
      race: meta.label,
      raceSlug: meta.raceSlug,
      dist: meta.dist,
      distId: meta.distId,
      time: r.time ?? '',
      sec: r.sec ?? 0,
      pos: r.pos ?? 0,
      total,
      cat: r.cat ?? '',
      // Omitted entirely when not recorded — 42% of rows have no nationality,
      // and an empty key on each of them is pure payload.
      ...(normNat(r.nat) ? { nat: normNat(r.nat) } : {}),
      // Raw value kept only where normalisation actually changed something —
      // the catRaw principle (never lose what the source said) without paying
      // for a duplicate field on 296k rows that are already identical.
      ...(r.nat != null && String(r.nat).trim() !== '' && String(r.nat).trim() !== normNat(r.nat)
        ? { natRaw: String(r.nat).trim() }
        : {}),
      ...(natRank.has(r) ? { natPos: natRank.get(r).pos } : {}),
      // Trail rows are results-in-context: excluded from PBs, rendered with
      // family + sub-event + real distance on profiles (road-only Compare).
      ...(meta.trail ? { trail: true, seasonMonth: meta.seasonMonth ?? 6 } : {}),
    });
  }
}

// Reattach '?'-gender clusters onto the sole real-gender cluster of the same name,
// when unambiguous (name key has exactly one real gender). Otherwise keep separate.
{
  const byName = new Map();
  for (const c of clusters.values()) {
    if (!byName.has(c.key)) byName.set(c.key, []);
    byName.get(c.key).push(c);
  }
  for (const group of byName.values()) {
    const real = group.filter(c => c.gender !== '?');
    const unknown = group.filter(c => c.gender === '?');
    const realGenders = new Set(real.map(c => c.gender));
    if (unknown.length && realGenders.size === 1) {
      const target = real[0];
      for (const u of unknown) {
        target.results.push(...u.results);
        clusters.delete(`${u.key}|?`);
      }
    }
  }
}

// Distinct exact-normalized-name blocks (before any alias/override merges).
const uniqueNameKeys = new Set([...clusters.values()].map(c => c.key)).size;

console.log(`  ${rowCount.toLocaleString()} rows across ${files.length - skippedFiles} files`);
console.log(`  ${clusters.size.toLocaleString()} clusters after exact-block + gender split`);

// ─── 2. Registry (existing 26 slugs + aliases) ───────────────────────────────
function parseRegistry() {
  const src = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const entries = [];
  for (const line of src.split('\n')) {
    const nm = line.match(/name:\s*'([^']+)'/);
    const sl = line.match(/slug:\s*'([^']+)'/);
    if (!nm || !sl) continue;
    const aliasBlock = line.match(/aliases:\s*\[([^\]]*)\]/);
    const aliases = aliasBlock
      ? [...aliasBlock[1].matchAll(/'([^']+)'/g)].map(m => m[1])
      : [];
    entries.push({ name: nm[1], slug: sl[1], aliases });
  }
  return entries;
}
const registry = parseRegistry();

// Merge each registry alias cluster into the primary name's cluster (same gender).
let aliasMergedRecords = 0; // result rows folded in via registry aliases
for (const e of registry) {
  const primKey = nameKey(e.name);
  for (const alias of e.aliases) {
    const aKey = nameKey(alias);
    if (aKey === primKey) continue;
    for (const g of ['M', 'W', '?']) {
      const from = clusters.get(`${aKey}|${g}`);
      if (!from) continue;
      const into = clusters.get(`${primKey}|${g}`) ?? clusters.get(`${primKey}|M`) ?? clusters.get(`${primKey}|W`);
      if (!into) continue;
      into.results.push(...from.results);
      into.nameKeys.add(aKey);
      aliasMergedRecords += from.results.length;
      clusters.delete(`${aKey}|${g}`);
    }
  }
}

// ─── 3. Manual overrides (merge / split), applied last so they always win ─────
let overrides = { merge: [], split: [], splits: [], knownMultiPerson: [] };
if (fs.existsSync(OVERRIDES_PATH)) {
  try { overrides = { merge: [], split: [], splits: [], knownMultiPerson: [], ...JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) }; }
  catch { console.warn('⚠️  Could not parse athleteIdentityOverrides.json — ignoring'); }
}
// Slugs of clusters known to combine ≥2 real people that the data cannot safely
// partition (peer-entangled: same age/pace, same series races). Stamped onto the
// profile so a future UI can surface "this profile may combine multiple athletes"
// and seed the user-claiming feature. Review-verified, never automatic.
const KNOWN_MULTI_PERSON = new Set(overrides.knownMultiPerson ?? []);
// merge: [{ keep: "name key", gender:"M", absorb:["other key", ...] }]
let overrideMergesApplied = 0;    // override entries that actually folded ≥1 cluster
let overrideMergedRecords = 0;    // result rows folded in via manual overrides
for (const m of overrides.merge ?? []) {
  const g = m.gender ?? 'M';
  const into = clusters.get(`${nameKey(m.keep)}|${g}`);
  if (!into) continue;
  let appliedHere = false;
  for (const other of m.absorb ?? []) {
    const from = clusters.get(`${nameKey(other)}|${g}`);
    if (!from) continue;
    into.results.push(...from.results);
    into.nameKeys.add(nameKey(other));
    overrideMergedRecords += from.results.length;
    appliedHere = true;
    clusters.delete(`${nameKey(other)}|${g}`);
  }
  if (appliedHere) overrideMergesApplied++;
}

// ─── 3b. Manual splits (peel record rows into new canonical athletes) ─────────
// Applied AFTER all merges but BEFORE slug assignment, so a peeled fragment can
// be pinned to a reviewer-chosen slug (including reusing the source's slug). A
// split names the exact record rows (by recordId) that belong to a distinct
// person; each group becomes its own cluster carrying a forcedSlug. Never
// automatic — driven entirely by athleteIdentityOverrides.json `splits`.
//   splits: [{ sourceSlug, groups: [{ newSlug, recordIds: [...] }, ...] }]
let splitGroupsApplied = 0, splitRecordsMoved = 0;
for (const sp of overrides.splits ?? []) {
  const groups = sp.groups ?? [];
  if (!groups.length) continue;
  // Index every current row by recordId (rebuilt per source so it reflects
  // prior merges; row object identity is what we actually move). recordId is
  // normally unique, but a duplicate finish position in one race edition can
  // make two different runners collide on the same recordId — so map to a LIST
  // and disambiguate by the split's declared sourceSlug below.
  const idToRows = new Map();
  for (const c of clusters.values()) for (const row of c.results) {
    const rid = recordId(row);
    let arr = idToRows.get(rid);
    if (!arr) { arr = []; idToRows.set(rid, arr); }
    arr.push({ c, row });
  }

  for (const g of groups) {
    const wantSlug = g.newSlug;
    const ids = g.recordIds ?? [];
    if (!wantSlug || !ids.length) continue;
    const rows = [];
    let srcCluster = null;
    for (const id of ids) {
      const cands = idToRows.get(id);
      if (!cands || !cands.length) { console.warn(`⚠️  split ${sp.sourceSlug}: recordId not found, skipping: ${id}`); continue; }
      let hit = cands[0];
      if (cands.length > 1) {
        // Ambiguous recordId (duplicate position collision): pick the row whose
        // cluster belongs to the declared source person, never a bystander.
        const match = cands.find(h => slugify(h.c.display) === sp.sourceSlug);
        if (match) hit = match;
        else console.warn(`⚠️  split ${sp.sourceSlug}: recordId ${id} collides across ${cands.length} runners and none match sourceSlug; using "${hit.c.display}"`);
      }
      rows.push(hit.row);
      srcCluster = srcCluster ?? hit.c;
    }
    if (!rows.length) continue;
    const rowSet = new Set(rows);
    // Remove these rows from whichever cluster(s) hold them (normally one).
    for (const c of clusters.values()) {
      if (c.results.some(r => rowSet.has(r))) c.results = c.results.filter(r => !rowSet.has(r));
    }
    // Materialise the fragment as its own cluster with a pinned slug.
    clusters.set(`__split__:${wantSlug}`, {
      key: srcCluster?.key ?? slugify(wantSlug).replace(/-/g, ' '),
      gender: srcCluster?.gender ?? genderOf(rows[0].cat),
      display: srcCluster?.display ?? wantSlug,
      nameKeys: new Set(srcCluster ? [...srcCluster.nameKeys] : []),
      results: rows,
      forcedSlug: wantSlug,
    });
    splitGroupsApplied++;
    splitRecordsMoved += rows.length;
  }
  // Drop any source cluster left empty after all its rows were peeled out.
  for (const [ck, c] of [...clusters]) if (c.results.length === 0) clusters.delete(ck);
}
if (splitGroupsApplied) {
  console.log(`  ${splitGroupsApplied} split group(s) applied, ${splitRecordsMoved.toLocaleString()} records repartitioned`);
}

// ─── 4. Assign stable canonical ids + slugs ──────────────────────────────────
// Reuse prior canon so slugs/ids never drift between runs.
let priorCanon = [];
if (fs.existsSync(CANON_PATH)) {
  try { priorCanon = JSON.parse(fs.readFileSync(CANON_PATH, 'utf8')); } catch { /* first run */ }
}
const priorBySlug = new Map(priorCanon.map(c => [c.slug, c]));
// nameKey|gender → prior slug. When a manual split has produced multiple prior
// clusters sharing one nameKey (base "bill-richardson" + peeled "bill-richardson-2",
// both carrying nameKey "bill richardson"), the LARGEST prior cluster wins the
// mapping — so the primary person reclaims the clean base slug every run and the
// peeled fragment keeps its own forced slug. A naive last-write-wins here let the
// tiny fragment capture the base's slug, thrashing the primary to "…-2-2".
const keyToPriorSlug = new Map();
const keyPriorRaces  = new Map();
for (const c of priorCanon) {
  const races = c.races ?? c.racesLogged ?? 0;
  for (const k of c.nameKeys ?? []) {
    const kk = `${k}|${c.gender}`;
    if (!keyToPriorSlug.has(kk) || races > (keyPriorRaces.get(kk) ?? -1)) {
      keyToPriorSlug.set(kk, c.slug);
      keyPriorRaces.set(kk, races);
    }
  }
}

const registrySlugByKey = new Map(registry.map(e => [nameKey(e.name), e.slug]));
const usedSlugs = new Set();
const list = [...clusters.values()];

// Deterministic order: most results first, then name — keeps primary/suffix stable.
list.sort((a, b) => (b.results.length - a.results.length) || a.display.localeCompare(b.display) || a.gender.localeCompare(b.gender));

let nextId = priorCanon.reduce((mx, c) => Math.max(mx, c.id ?? 0), 0) + 1;

function assignSlug(base) {
  let s = base || 'athlete';
  if (!usedSlugs.has(s)) { usedSlugs.add(s); return s; }
  for (let n = 2; ; n++) {
    const cand = `${s}-${n}`;
    if (!usedSlugs.has(cand)) { usedSlugs.add(cand); return cand; }
  }
}

for (const c of list) {
  // 0) split-pinned slug (reviewer's call), 1) registry pin, 2) prior canon, 3) fresh
  let slug = c.forcedSlug ?? registrySlugByKey.get(c.key);
  if (!slug) {
    for (const k of c.nameKeys) {
      const p = keyToPriorSlug.get(`${k}|${c.gender}`);
      if (p) { slug = p; break; }
    }
  }
  if (slug && !usedSlugs.has(slug)) usedSlugs.add(slug);
  else if (!slug) slug = assignSlug(slugify(c.display));
  else slug = assignSlug(slug); // prior slug collided (shouldn't) — resuffix defensively
  c.slug = slug;
  c.id = priorBySlug.get(slug)?.id ?? nextId++;
}

// ─── 5a. Build per-athlete profile objects ───────────────────────────────────
const SEASON = { mar: 5, half: 5, '10k': 4, '5k': 4 }; // rough month for intra-year sort
const seasonOf = (r) => SEASON[r.distId] ?? r.seasonMonth ?? 6; // trail rows carry their family's month
function toProfile(c) {
  const results = c.results.slice().sort(
    (a, b) => (a.year - b.year) || (seasonOf(a) - seasonOf(b)) || a.race.localeCompare(b.race)
  );
  // PBs per distId — road only. Trail results are results-in-context, never
  // PBs (standing decision: no trail PBs anywhere, Compare stays road-only).
  const pbs = {};
  for (const r of results) {
    if (!r.sec || r.trail) continue;
    if (!pbs[r.distId] || r.sec < pbs[r.distId].sec) {
      pbs[r.distId] = { time: r.time, sec: r.sec, race: r.race, year: r.year };
    }
  }
  for (const r of results) r.isPB = !r.trail && !!(pbs[r.distId] && r.sec === pbs[r.distId].sec && r.time === pbs[r.distId].time);
  // Headline PB: prefer marathon, then half, then whatever exists
  const headlineDist = pbs.mar ? 'mar' : pbs.half ? 'half' : Object.keys(pbs)[0];
  const headline = headlineDist ? pbs[headlineDist] : null;
  const nat = results.map(r => r.nat).find(Boolean) || '';
  return {
    id: c.id, slug: c.slug, name: c.display, gender: c.gender,
    nationality: nat,
    racesLogged: results.length,
    pbTime: headline ? headline.time : '',
    pbRace: headline ? `${headline.race} ${headline.year}` : '',
    pbs,
    ...(KNOWN_MULTI_PERSON.has(c.slug) ? { knownMultiPerson: true } : {}),
    // seasonMonth is a build-time sort key only — keep the shipped rows lean.
    // `nat` and its placing DO ship: national placing is a genuine trail
    // differentiator on the internationally-contested Tarawera fields.
    results: results.map(({ seasonMonth: _s, ...rest }) => rest),
  };
}

const profiles = list.map(toProfile);
const multi = profiles.filter(p => p.racesLogged >= 2);

console.log(`  ${profiles.length.toLocaleString()} canonical athletes`);
console.log(`  ${multi.length.toLocaleString()} multi-race (get profile pages + browse index)`);
console.log(`  ${(profiles.length - multi.length).toLocaleString()} single-race (searchable only)`);

// ─── 5b. Write sharded profile data (2-char slug prefix) ─────────────────────
function shardKey(slug) {
  const s = slug.replace(/[^a-z0-9]/g, '');
  return (s.slice(0, 2) || '_').padEnd(2, '_');
}
fs.rmSync(ATHLETES_OUT, { recursive: true, force: true });
fs.mkdirSync(ATHLETES_OUT, { recursive: true });
const profileShards = new Map();
for (const p of multi) {
  const sk = shardKey(p.slug);
  if (!profileShards.has(sk)) profileShards.set(sk, {});
  profileShards.get(sk)[p.slug] = p;
}
for (const [sk, obj] of profileShards) {
  fs.writeFileSync(path.join(ATHLETES_OUT, `${sk}.json`), JSON.stringify(obj));
}

// ─── 5c. Write name→slug map shards (first letter of normalised name) ────────
// Keyed with the SAME normalisation as src/data/athleteProfiles.normalise so the
// app's getAthleteSlug lookups match. Only multi-race athletes get a slug here;
// single-race names stay unlinked (searchable, no standalone page).
function profileNormalise(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['’‘`]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
fs.rmSync(INDEX_OUT, { recursive: true, force: true });
fs.mkdirSync(INDEX_OUT, { recursive: true });
const slugShards = new Map();
const slugRaces = new Map(); // normName → race count, so homonyms keep the busier profile
for (const p of multi) {
  const nn = profileNormalise(p.name);
  if (!nn) continue;
  if (slugRaces.has(nn) && slugRaces.get(nn) >= p.racesLogged) continue;
  slugRaces.set(nn, p.racesLogged);
  const first = nn[0]?.match(/[a-z]/) ? nn[0] : '_';
  if (!slugShards.has(first)) slugShards.set(first, {});
  slugShards.get(first)[nn] = p.slug;
}
for (const [letter, obj] of slugShards) {
  fs.writeFileSync(path.join(INDEX_OUT, `${letter}.json`), JSON.stringify(obj));
}
const manifest = {
  generatedAt: new Date().toISOString(),
  totalAthletes: profiles.length,
  browseable: multi.length,
  letters: Object.fromEntries([...slugShards.entries()].map(([l, o]) => [l, Object.keys(o).length]).sort()),
};
fs.writeFileSync(path.join(INDEX_OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

// ─── 5d. Persist canonical registry (id/slug/keys) for stable re-runs ────────
const canon = list.map(c => ({
  id: c.id, slug: c.slug, name: c.display, gender: c.gender,
  nameKeys: [...c.nameKeys], races: c.results.length,
}));
canon.sort((a, b) => a.id - b.id);
fs.writeFileSync(CANON_PATH, JSON.stringify(canon));
fs.writeFileSync(path.join(DATA_DIR, 'nat-cohorts.json'), JSON.stringify(natCohorts));
if (!fs.existsSync(OVERRIDES_PATH)) {
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify({ merge: [], split: [], splits: [] }, null, 2));
}

// ─── 6. Fuzzy review queue (candidates only — never auto-merged) ─────────────
// Bucket by (gender, last name token); flag same-last-name first-name variants.
function lastToken(key) { const p = key.split(' '); return p[p.length - 1] || key; }
function firstToken(key) { return key.split(' ')[0] || key; }

const buckets = new Map();
for (const c of list) {
  if (c.gender === '?') continue;
  const bk = `${c.gender}|${lastToken(c.key)}`;
  if (!buckets.has(bk)) buckets.set(bk, []);
  buckets.get(bk).push(c);
}

const candidates = [];
for (const [, group] of buckets) {
  if (group.length < 2 || group.length > 400) continue; // skip huge common-surname buckets
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i], b = group[j];
      if (a.slug === b.slug) continue;
      const fa = firstToken(a.key), fb = firstToken(b.key);
      const prefix = fa !== fb && (fa.startsWith(fb) || fb.startsWith(fa)) && Math.min(fa.length, fb.length) >= 3;
      const jw = jaroWinkler(a.key, b.key);
      if (!prefix && jw < 0.92) continue;

      // Plausibility notes (do not auto-merge — human decides)
      const notes = [];
      if (prefix) notes.push('firstname-prefix (nickname?)');
      const bandsA = a.results.map(r => bandLower(r.cat)).filter(Boolean);
      const bandsB = b.results.map(r => bandLower(r.cat)).filter(Boolean);
      const yearsA = a.results.map(r => r.year);
      const yearsB = b.results.map(r => r.year);
      if (bandsA.length && bandsB.length) {
        const gap = Math.abs(Math.min(...bandsA) - Math.min(...bandsB));
        const span = Math.abs(Math.min(...yearsA, ...yearsB) - Math.max(...yearsA, ...yearsB));
        if (gap > span / 5 + 10) notes.push('age-band trajectory implausible');
      }
      const bestA = Math.min(...a.results.map(r => r.sec).filter(Boolean), Infinity);
      const bestB = Math.min(...b.results.map(r => r.sec).filter(Boolean), Infinity);
      if (isFinite(bestA) && isFinite(bestB)) {
        const ratio = Math.max(bestA, bestB) / Math.min(bestA, bestB);
        if (ratio > 1.5) notes.push('large PB gap');
      }
      candidates.push({
        a: a.display, b: b.display, gender: a.gender, jw: jw.toFixed(3),
        aYears: `${Math.min(...yearsA)}-${Math.max(...yearsA)}`,
        bYears: `${Math.min(...yearsB)}-${Math.max(...yearsB)}`,
        aRaces: a.results.length, bRaces: b.results.length,
        aSlug: a.slug, bSlug: b.slug,
        note: notes.join('; ') || 'name-similar',
      });
    }
  }
}
candidates.sort((x, y) => parseFloat(y.jw) - parseFloat(x.jw));

const csvHead = 'name_a,name_b,gender,jaro_winkler,a_years,b_years,a_races,b_races,a_slug,b_slug,note';
const csvBody = candidates.map(c =>
  [c.a, c.b, c.gender, c.jw, c.aYears, c.bYears, c.aRaces, c.bRaces, c.aSlug, c.bSlug, c.note]
    .map(v => /[",]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')
).join('\n');
fs.writeFileSync(REVIEW_PATH, `${csvHead}\n${csvBody}\n`);

// ─── Report ──────────────────────────────────────────────────────────────────
console.log('');
console.log('✅  Canonical athlete build complete');
console.log(`   Profile shards   : ${profileShards.size}  → public/data/athletes/`);
console.log(`   Index shards     : ${slugShards.size}  → public/data/athlete-index/`);
console.log(`   Canon registry   : ${canon.length.toLocaleString()} → src/data/athleteCanon.json`);
console.log(`   Review queue     : ${candidates.length.toLocaleString()} candidate pairs → athlete-review-queue.csv`);
console.log('');

// ─── Summary report (athlete-canon-report.json) ──────────────────────────────
// Emitted every run so the identity pass is never a black box. NOTE: the only
// non-exact merges are registry aliases + manual overrides — fuzzy matches are
// surfaced to the review queue, NEVER auto-merged. So `autoMerged` counts records
// folded by those deterministic rules, and `flaggedForReview` is the fuzzy queue.
const singleResultAthletes = profiles.filter(p => p.racesLogged === 1).length;
const totalResults = profiles.reduce((sum, p) => sum + p.racesLogged, 0);
const overridesInFile = (overrides.merge?.length ?? 0) + (overrides.split?.length ?? 0);

// ─── Nationality report ──────────────────────────────────────────────────────
// The distinct value set is published so oddities stay visible rather than
// being silently coerced, and coverage is published so NAT_COVERAGE_MIN can be
// argued from evidence rather than taste.
const natValueCounts = new Map();
for (const c of clusters.values()) {
  for (const r of c.results) if (r.nat) natValueCounts.set(r.nat, (natValueCounts.get(r.nat) ?? 0) + 1);
}
const natSorted = [...natValueCounts.entries()].sort((a, b) => b[1] - a[1]);
const wellFormed = ([code]) => /^[A-Z]{3}$/.test(code);

const covEntries = [...natCoverageByFile.entries()];
const withNat = covEntries.filter(([, v]) => v.covered > 0);
const gradedFiles = covEntries.filter(([, v]) => v.coverage >= NAT_COVERAGE_MIN);
const partialFiles = covEntries.filter(([, v]) => v.covered > 0 && v.coverage < NAT_COVERAGE_MIN);

const natReport = {
  threshold: NAT_COVERAGE_MIN,
  filesTotal: covEntries.length,
  filesWithAnyNationality: withNat.length,
  filesMeetingThreshold: gradedFiles.length,
  filesBelowThresholdButNonZero: partialFiles.length,
  belowThreshold: partialFiles
    .sort((a, b) => a[1].coverage - b[1].coverage)
    .map(([f, v]) => ({ file: f, covered: v.covered, total: v.total, coverage: +v.coverage.toFixed(4) })),
  distinctValues: natSorted.length,
  // Anything not three upper-case letters is a source defect, not a country.
  malformedValues: natSorted.filter(e => !wellFormed(e)).map(([code, n]) => ({ code, records: n })),
  // Reviewed by eye: a curated IOC mapping is a decision for the archivist,
  // not something this script should guess at.
  rareValues: natSorted.filter(wellFormed).filter(([, n]) => n <= 2).map(([code, n]) => ({ code, records: n })),
  valueCounts: Object.fromEntries(natSorted),
};

const report = {
  totalRawRecords: rowCount,
  uniqueNameKeys,                                    // exact-normalized-name blocks
  canonicalAthletes: profiles.length,                // after alias/override merges
  autoMerged: aliasMergedRecords + overrideMergedRecords, // records folded into an existing cluster (registry aliases + overrides — NO fuzzy auto-merge)
  flaggedForReview: candidates.length,               // review-queue candidate pairs (fuzzy, human-decided)
  overridesApplied: overrideMergesApplied,           // merge entries from athleteIdentityOverrides.json that folded ≥1 cluster
  avgResultsPerAthlete: profiles.length ? +(totalResults / profiles.length).toFixed(3) : 0,
  singleResultAthletes,                              // athletes with exactly 1 race — main symptom of over-splitting
  // Context so the numbers are self-explaining without reading the source:
  _meta: {
    generatedAt: new Date().toISOString(),
    multiRaceAthletes: multi.length,
    aliasMergedRecords,
    overrideMergedRecords,
    overrideEntriesInFile: overridesInFile,
    splitGroupsApplied,
    splitRecordsMoved,
    fuzzyAutoMerge: false,
    note: 'autoMerged reflects deterministic registry-alias + manual-override merges only; fuzzy candidates are review-queue-only and never auto-merged.',
  },
  nationality: natReport,
};
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

console.log('── Identity resolution report ─────────────────────────────────');
console.log(`   Total raw records      : ${report.totalRawRecords.toLocaleString()}`);
console.log(`   Unique name keys       : ${report.uniqueNameKeys.toLocaleString()}  (exact-normalized blocks)`);
console.log(`   Canonical athletes     : ${report.canonicalAthletes.toLocaleString()}`);
console.log(`   Auto-merged records    : ${report.autoMerged.toLocaleString()}  (registry aliases + overrides; NO fuzzy auto-merge)`);
console.log(`   Flagged for review     : ${report.flaggedForReview.toLocaleString()}  (fuzzy candidate pairs, human-decided)`);
console.log(`   Overrides applied      : ${report.overridesApplied.toLocaleString()}  (of ${overridesInFile} entries in overrides file)`);
console.log(`   Avg results / athlete  : ${report.avgResultsPerAthlete}`);
console.log(`   Single-result athletes : ${report.singleResultAthletes.toLocaleString()}  (${((singleResultAthletes / profiles.length) * 100).toFixed(1)}% — main over-split symptom)`);
console.log(`   Nationality            : ${natReport.distinctValues} distinct codes · ${natReport.filesMeetingThreshold}/${natReport.filesTotal} race-years at >=${(NAT_COVERAGE_MIN * 100).toFixed(0)}% coverage (national placing computed there)`);
if (natReport.filesBelowThresholdButNonZero) {
  console.log(`     ⚠️  ${natReport.filesBelowThresholdButNonZero} race-year(s) carry partial nationality — no national placing computed for them`);
}
if (natReport.malformedValues.length) {
  console.log(`     ⚠️  malformed codes (kept as recorded, not coerced): ${natReport.malformedValues.map(v => `${v.code}×${v.records}`).join(', ')}`);
}
console.log(`   → athlete-canon-report.json`);
console.log('───────────────────────────────────────────────────────────────');
console.log('');
