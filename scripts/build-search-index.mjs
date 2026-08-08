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
 * Each shard is a JSON object mapping a normalised name to POINTER records —
 * just enough to render a result row, never the result arrays themselves:
 *   { "john smith": [ { d: "John Smith", n: 12, a: 2011, b: 2025 } ] }
 *
 * Pointer fields:
 *   d - display name
 *   n - number of results on record
 *   a - first year, b - last year
 *   m - present (1) only when the name is a known shared-name cluster
 *   o - the single result, inlined ONLY when n === 1 (see below)
 *
 * WHY POINTERS. Entries are keyed under their full name AND their surname, so
 * a surname query resolves. Carrying full result arrays into every one of those
 * shards stored the same results two to three times over and made a single
 * keystroke cost megabytes — the `c` shard alone reached 5.7 MB. Detail is
 * fetched from the profile shard when a row is expanded instead; it is already
 * built, already complete, and already fetched when a profile opens.
 *
 * The n === 1 exception: single-result athletes have no profile shard (those
 * hold multi-race athletes only), so their one result is inlined here. It is
 * the only place it exists in a name-indexed form, and dropping it would make
 * 125k rows silently un-expandable.
 *
 * The value is an ARRAY because one name can carry two people — see
 * NAME_DISAMBIGUATION. That split is applied here, at build time, rather than
 * at query time where there are no longer results to partition.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { roadRaceLabels } from '../src/data/roadEvents.mjs';
import { trailFileMeta } from '../src/data/trailEvents.mjs';
import { NAME_DISAMBIGUATION } from '../src/data/nameDisambiguation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const DATA_DIR  = path.join(ROOT, 'public', 'data');
const OUT_DIR   = path.join(DATA_DIR, 'search');
const DETAIL_DIR = path.join(DATA_DIR, 'search-detail');

// ─── Race label map ───────────────────────────────────────────────────────────
// Labels come from the shared road registration. This map used to be a local
// copy that had already drifted — Onehunga and Orewa were missing from it, so
// those results rendered as their raw file key in search.
const RACE_LABELS = roadRaceLabels();

// Trail file keys ({familySlug}-{subEventId}) and their era-stable labels come
// from the trail config — one source of truth with the converter and canon.
for (const [key, meta] of Object.entries(trailFileMeta())) {
  RACE_LABELS[key] = meta.label;
}

/**
 * Title-case a name without ASCII assumptions. Word starts are the string
 * start and anything after whitespace, hyphen or apostrophe — so macrons and
 * other non-ASCII letters never create a spurious word boundary.
 * Must stay in step with displayFromKey() in src/lib/searchIndex.ts.
 */
function titleCaseName(s) {
  return s.toLowerCase()
    .replace(/(?:^|[\s\-'’])\S/gu, c => c.toUpperCase())
    // Same Mc/O' convention the converters apply, so a name reads the same in
    // search as it does in the results table: McGettigan, not Mcgettigan.
    .replace(/\bMc(\S)/gu, (_, c) => 'Mc' + c.toUpperCase())
    // Keep whichever apostrophe the source used. Normalising ’ to ' here would
    // change the key derived from this display, and the name would then be
    // unreachable from the results files that still hold the curly form.
    .replace(/\bO(['’])(\S)/gu, (_, ap, c) => 'O' + ap + c.toUpperCase());
}

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

    // Title Case, then lowercase for the key.
    //
    // Word starts are found by PUNCTUATION, not by \b\w. JavaScript's \w is
    // ASCII-only, so a macron ends a "word" and the next letter gets capitalised
    // mid-name: "Hākopa" became "HāKopa", "Rongoteāio" became "RongoteāIo".
    // That mangles Māori names in a New Zealand running archive, which is worse
    // than a data-hygiene problem. This matches titleCase() in the converters,
    // so the index and the results files now agree.
    const display = titleCaseName(rawName);
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

// ─── Shard by first letter — of the full name AND of the surname ─────────────
// A query loads exactly one shard, chosen by its first letter. Keying only by
// full name therefore made the surname unsearchable: "Skilton" looked in shard
// `s` while "aaron skilton" lived in shard `a`, and a runner searching for
// themselves by surname was told the archive did not hold them.
//
// Each entry is now placed in every shard a reasonable query would reach: the
// full name's initial, the surname's initial, and the initial of each part of a
// hyphenated surname (so "Reti" finds "Toomer-Reti"). The KEY is unchanged —
// still the full normalised name — so every consumer's `key.includes(query)`
// keeps working untouched. Entries whose surname shares the first name's
// initial are placed once, not twice.
/**
 * Which shard a name belongs in — folding diacritics first.
 *
 * Without the fold, "Ānaru Williams" landed in the `_` shard, which no A–Z link
 * points at, and a search for "Ānaru" (reduced to "anaru") looked in `a` and
 * found nothing. Accent-initial names were reachable only by surname: filed
 * where nobody looks. Māori first names beginning with a macron are precisely
 * the case this archive cannot afford to strand.
 *
 * Must stay in step with letterOf() in src/lib/searchIndex.ts, which picks the
 * shard a query loads.
 */
const letterOf = (s) => {
  const c = (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')[0]?.toLowerCase();
  return c && c >= 'a' && c <= 'z' ? c : '_';
};

/**
 * Must match displayFromKey() in src/lib/searchIndex.ts EXACTLY — it decides
 * whether a display name has to be stored, so any divergence either bloats the
 * index with redundant `d` fields or, worse, ships a name rendered wrongly.
 * Title-casing a key is the same operation as title-casing a raw name, so this
 * simply reuses it.
 */
const recoverDisplay = (key) => titleCaseName(key);

// Shared-name clusters, so a search row can carry the chip without a second
// lookup. Derived by flagInconsistentClusters.mjs; absent on a first-ever run.
let flaggedSlugs = new Set();
try {
  flaggedSlugs = new Set(JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'flagged-slugs.json'), 'utf8')));
} catch { /* no flag list yet — chips simply don't render */ }

// name → slug, for the shared-name flag and for linking. Built from the same
// athlete-index the app resolves slugs against, so the two cannot disagree.
const slugByName = {};
try {
  const idxDir = path.join(DATA_DIR, 'athlete-index');
  for (const f of fs.readdirSync(idxDir)) {
    if (f === 'manifest.json') continue;
    Object.assign(slugByName, JSON.parse(fs.readFileSync(path.join(idxDir, f), 'utf8')));
  }
} catch { /* first run: canon not built yet */ }

const profileNormalise = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/['’‘`]/g, '')
  .replace(/-/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Detail for single-result athletes, keyed by name and sharded by that name's
// OWN first letter, so it is stored exactly once no matter how many search
// shards point at it. Fetched only when such a row is expanded.
const detail = new Map();

/** Pointer record for a set of results belonging to one person.
 *
 *  No display name: it is exactly recoverable by title-casing the key, because
 *  that is how the key was produced. Storing it again cost ~19% of every shard
 *  to say something the key already says. */
function toPointer(display, results, norm, idx) {
  const years = results.map(r => r.y).filter(Boolean);
  const slug = slugByName[profileNormalise(display)] ?? null;
  const p = {
    n: results.length,
    a: years.length ? Math.min(...years) : 0,
    b: years.length ? Math.max(...years) : 0,
  };
  // Recovery is exact for ASCII names but NOT for accented ones: JavaScript's
  // JavaScript word-boundary/word-char classes are ASCII-only, so accented
  // names re-case in the wrong places on recovery. 160 of 199,346 names are
  // affected; those carry their display explicitly and the rest keep the ~19%
  // saving. The condition IS the round-trip, so any future failing name is
  // stored automatically.
  // places. 160 of 199,346 names are affected. Those carry their display
  // explicitly; the rest keep the ~19% saving. Checked, not assumed — the
  // condition is the round-trip itself, so any future name that fails it is
  // stored automatically.
  if (recoverDisplay(norm) !== display) p.d = display;
  if (slug && flaggedSlugs.has(slug)) p.m = 1;
  // Anyone WITH a profile expands against their profile shard, which already
  // holds every result. Anyone without one needs their results kept here:
  // single-result athletes (no profile page by design) and the peeled half of
  // a disambiguated name, whose results live under the other person's slug.
  // Stored once, keyed by the name's own letter, never in the search hot path.
  if (!slug) {
    const letter = letterOf(norm);
    if (!detail.has(letter)) detail.set(letter, {});
    const bucket = detail.get(letter);
    (bucket[norm] ??= [])[idx] = results;
  }
  return p;
}

const shards = new Map();
let duplicated = 0;
let disambiguated = 0;

for (const [norm, entry] of index) {
  // One name, possibly two people: the split is resolved here rather than at
  // query time, because pointers carry no results to partition later.
  const conflicts = NAME_DISAMBIGUATION[entry.display];
  let pointers;
  if (conflicts?.length) {
    const isConflict = (r) => conflicts.some(c => c.r === r.r && c.y === r.y);
    const mine   = entry.results.filter(r => !isConflict(r));
    const theirs = entry.results.filter(r =>  isConflict(r));
    pointers = [mine, theirs].filter(g => g.length).map((g, i) => toPointer(entry.display, g, norm, i));
    if (pointers.length > 1) disambiguated++;
  } else {
    pointers = [toPointer(entry.display, entry.results, norm, 0)];
  }

  const targets = new Set([letterOf(norm)]);
  const parts = norm.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    const surname = parts[parts.length - 1];
    targets.add(letterOf(surname));
    for (const piece of surname.split('-').filter(Boolean)) targets.add(letterOf(piece));
  }

  duplicated += targets.size - 1;
  for (const t of targets) {
    if (!shards.has(t)) shards.set(t, {});
    shards.get(t)[norm] = pointers;
  }
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

// ─── Write single-result detail shards ───────────────────────────────────────
fs.rmSync(DETAIL_DIR, { recursive: true, force: true });
fs.mkdirSync(DETAIL_DIR, { recursive: true });
let detailKb = 0, detailNames = 0;
for (const [letter, obj] of [...detail.entries()].sort()) {
  const json = JSON.stringify(obj);
  fs.writeFileSync(path.join(DETAIL_DIR, `${letter}.json`), json, 'utf8');
  detailKb += Math.round(json.length / 1024);
  detailNames += Object.keys(obj).length;
}

// ─── Report ───────────────────────────────────────────────────────────────────
console.log('');
console.log('✅  Search index built → public/data/search/');
console.log('');
console.log(`   Total unique names : ${index.size.toLocaleString()}`);
console.log(`   Shard placements   : ${totalNames.toLocaleString()}  (+${duplicated.toLocaleString()} surname copies, so surnames are searchable)`);
console.log(`   Shards written     : ${shards.size}   (pointer records only — result detail loads on expand)`);
if (disambiguated) console.log(`   Names split in two : ${disambiguated}  (NAME_DISAMBIGUATION applied at build time)`);
console.log(`   Single-result detail: ${detailNames.toLocaleString()} names, ${detailKb.toLocaleString()} KB -> public/data/search-detail/ (stored once, fetched on expand)`);
console.log('');

const maxKb  = Math.max(...stats.map(s => s.kb));
const barMax = 30;
for (const { letter, kb, count } of stats) {
  const bar = '█'.repeat(Math.round((kb / maxKb) * barMax));
  console.log(`   ${letter}  ${String(kb).padStart(5)} KB  ${bar}  (${count.toLocaleString()} names)`);
}
console.log('');
