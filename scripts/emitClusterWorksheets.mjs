#!/usr/bin/env node
/**
 * emitClusterWorksheets.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Human-review evidence generator for flagged multi-identity clusters —
 * shared-name mega-clusters that are genuine collisions but NOT clean 2-way
 * splits (several are 3–4 people). Auto-suggested groupings on these aren't
 * trustworthy (proven on Andrew Smith, whose auto-groups placed one race edition
 * twice in a single group), so this script deliberately does NOT propose or
 * encode a partition. It lays out every record with the signals a human needs —
 * implied birth-year window, same-edition-twice anchors, same-year band
 * conflicts, nationality — sorted so natural person-cohorts read off the page.
 * Dylan makes the cuts.
 *
 * Cluster set (Task 8): the Tier 1 review set from athlete-split-review-queue.json,
 * plus any FORCE_INCLUDE slugs, plus the knownMultiPerson clusters. Falls back to
 * the original Task 7c names if the queue file is absent.
 *
 * Trail-aware: `surface` and `subEventId` columns are emitted so multi-event
 * ultra histories are readable, and same-edition-twice is SUB-EVENT scoped —
 * Tarawera T21 + T50 in one edition are two editions, not a conflict.
 *
 * Output (one pair per cluster, under cluster-worksheets/):
 *   cluster-worksheet-{slug}.csv   one row per record, evidence columns
 *   cluster-worksheet-{slug}.txt   header summary + plain-English person-count read
 *
 * NOTHING here writes to athleteIdentityOverrides.json. Read-only review material.
 * Run after buildAthleteCanon.mjs + flagInconsistentClusters.mjs.
 * From project root:  node scripts/emitClusterWorksheets.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { roadWorksheetMeta } from '../src/data/roadEvents.mjs';
import { trailFileMeta } from '../src/data/trailEvents.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const ATHLETES = path.join(DATA_DIR, 'athletes');
const OUT_DIR  = path.join(ROOT, 'cluster-worksheets');
const QUEUE    = path.join(ROOT, 'athlete-split-review-queue.json');
const OVERRIDES_PATH = path.join(ROOT, 'src', 'data', 'athleteIdentityOverrides.json');

// Always emitted regardless of ranking — the known cases we want directly
// verifiable. aaron-smith is the Task 8 spot-check (M 18–29 2020 / M 50–59 2023).
const FORCE_INCLUDE = ['aaron-smith'];
// Fallback when the review queue hasn't been generated (Task 7c set).
const FALLBACK_NAMES = [
  'Andrew Smith', 'Paul Williams', 'James Watson', 'Lisa Harris',
  'Gabriela Diver', 'Aaron Hill', 'Nick Brown', 'David Green',
];

// ─── File-key → race metadata (must mirror buildAthleteCanon.mjs FILE_META) ───
// Needed to reconstruct each source row's recordId so we can join back the raw
// category / club / nationality that the profile shards drop.
// Road event metadata, derived from the shared road registration.
const FILE_META = roadWorksheetMeta();
// Trail keys ({familySlug}-{subEventId}) come from the trail config, so the
// join can't drift from what the converter emitted.
const TRAIL_META = trailFileMeta();
const TRAIL_KEYS = new Set(Object.keys(TRAIL_META));

function fileMeta(filename) {
  const base = path.basename(filename);
  const key  = base.replace(/^results-/, '').replace(/-?\d{4}\.json$/, '');
  const yM   = base.match(/(\d{4})\.json$/);
  const year = yM ? parseInt(yM[1], 10) : 0;
  if (FILE_META[key]) return { ...FILE_META[key], year, trail: false };
  const tm = TRAIL_META[key];
  if (tm) return { label: tm.label, raceSlug: tm.raceSlug, distId: tm.distId, year, trail: true };
  return null;
}

// Stable per-result identity — must match recordId() in buildAthleteCanon.mjs
// and flagInconsistentClusters.mjs, so IDs copy straight into `splits`.
const recordId  = r => `${r.raceSlug}:${r.year}:${r.distId}:p${r.pos}:${r.sec}`;
// Sub-event scoped: distId holds the subEventId for trail families, so two
// different Tarawera sub-events in one year are two editions, not a conflict.
const editionKey = r => `${r.raceSlug}:${r.year}:${r.distId}`;

/** True when a numeric band fails sanity (zero-width, inverted, implausible).
 *  Such bands are preserved in `ageBandRaw` but excluded from inference. */
function isBadBand(cat) {
  const s = String(cat || '');
  let m = s.match(/(\d{2,3})\s*[–—-]\s*(\d{2,3})/);
  if (m) { const lo = +m[1], hi = +m[2]; return lo >= hi || lo < 5 || hi > 110; }
  m = s.match(/(\d{2,3})\s*\+/);
  if (m) { const lo = +m[1]; return lo < 5 || lo > 110; }
  return false;
}
/** Age category → inclusive [lo,hi] range, or null for open/unknown/bad bands. */
function ageRange(cat) {
  const s = String(cat || '');
  if (isBadBand(s)) return null;
  let m = s.match(/(\d{2,3})\s*[–—-]\s*(\d{2,3})/);
  if (m) return { lo: +m[1], hi: +m[2], open: false };
  m = s.match(/(\d{2,3})\s*\+/);
  if (m) return { lo: +m[1], hi: 200, open: true };
  return null;
}
/** Whole-year gap between two bands: 0 if overlapping/adjacent (a mid-year
 *  birthday can cross exactly one boundary), positive for a real gap. A wide
 *  band overlapping a narrow neighbour yields 0 — not a violation. */
function bandGap(a, b) {
  if (a.lo > b.hi) return a.lo - b.hi - 1;
  if (b.lo > a.hi) return b.lo - a.hi - 1;
  return 0;
}
/** Human-readable implied birth-year window. Wide bands produce WIDE windows. */
function birthWindowStr(year, range) {
  if (!range) return '';
  if (range.open) return `≤${year - range.lo}`;      // "70+" in 2020 → ≤1950
  return `${year - range.hi}–${year - range.lo}`;     // M40–49 2017 → 1968–1977
}
/** Birth-year midpoint for sorting/cohort clustering. Open bands capped to a
 *  nominal 10-year width so the midpoint stays sane. null when no age info. */
function birthMid(year, range) {
  if (!range) return null;
  const hi = Math.min(range.hi, range.lo + 9);
  return Math.round(year - (range.lo + hi) / 2);
}

// ─── Build recordId → { catRaw, club, nat } from source results files ─────────
const rawByRecord = new Map();
const trailRecords = new Set();
for (const f of fs.readdirSync(DATA_DIR).filter(f => f.startsWith('results-') && f.endsWith('.json'))) {
  const meta = fileMeta(f);
  if (!meta) continue;
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')); } catch { continue; }
  if (!Array.isArray(rows)) continue;
  for (const r of rows) {
    const id = `${meta.raceSlug}:${meta.year}:${meta.distId}:p${r.pos ?? 0}:${r.sec ?? 0}`;
    rawByRecord.set(id, {
      catRaw: (r.catRaw && r.catRaw !== '—') ? r.catRaw : (r.cat ?? ''),
      club:   (r.club && r.club !== '—') ? r.club : '',
      nat:    (r.nat && r.nat !== '—') ? r.nat : '',
    });
    if (meta.trail) trailRecords.add(id);
  }
}

// ─── Load profiles ───────────────────────────────────────────────────────────
if (!fs.existsSync(ATHLETES)) {
  console.error('❌  public/data/athletes/ not found — run buildAthleteCanon.mjs first.');
  process.exit(1);
}
const bySlug = new Map();
const byName = new Map();
for (const f of fs.readdirSync(ATHLETES).filter(f => f.endsWith('.json'))) {
  const shard = JSON.parse(fs.readFileSync(path.join(ATHLETES, f), 'utf8'));
  for (const p of Object.values(shard)) {
    bySlug.set(p.slug, p);
    const cur = byName.get(p.name);
    if (!cur || (p.racesLogged ?? 0) > (cur.racesLogged ?? 0)) byName.set(p.name, p);
  }
}

// ─── Decide the cluster set ──────────────────────────────────────────────────
const wanted = [];
const seen = new Set();
const add = (slug, why) => {
  if (!slug || seen.has(slug)) return;
  const p = bySlug.get(slug);
  if (!p) { console.warn(`⚠️  no profile for slug "${slug}" (${why}) — skipping`); return; }
  seen.add(slug);
  wanted.push({ p, why });
};

let queue = null;
if (fs.existsSync(QUEUE)) {
  try { queue = JSON.parse(fs.readFileSync(QUEUE, 'utf8')); } catch { queue = null; }
}
if (queue?.splits?.length) {
  for (const s of queue.splits) add(s.sourceSlug, 'tier1-review-set');
} else {
  console.warn('⚠️  athlete-split-review-queue.json missing/empty — falling back to the Task 7c cluster list');
  for (const n of FALLBACK_NAMES) add(byName.get(n)?.slug, 'fallback-7c');
}
for (const slug of FORCE_INCLUDE) add(slug, 'force-include');
if (fs.existsSync(OVERRIDES_PATH)) {
  try {
    const ov = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'));
    for (const slug of ov.knownMultiPerson ?? []) add(slug, 'knownMultiPerson');
  } catch { /* ignore */ }
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const CSV_HEAD = [
  'recordId', 'surface', 'subEventId', 'race', 'year', 'distance', 'pos', 'time',
  'ageBandRaw', 'ageBandNormalized', 'ageBandUsable', 'impliedBirthYearWindow',
  'nationality', 'club', 'conflictFlags',
].join(',');

const summary = [];
for (const { p, why } of wanted) {
  // Decorate each record with derived evidence.
  const recs = p.results.map(r => {
    const id = recordId(r);
    const raw = rawByRecord.get(id) || {};
    const bad = isBadBand(r.cat);
    const range = ageRange(r.cat);
    const isTrail = !!r.trail || trailRecords.has(id);
    return {
      r, id, range, isTrail, bad,
      catRaw: raw.catRaw || '',
      club:   raw.club || '',
      nat:    raw.nat || '',
      window: birthWindowStr(r.year, range),
      mid:    birthMid(r.year, range),
    };
  });

  // ── Conflict detection (per record) ───────────────────────────────────────
  const flags = new Map(recs.map(x => [x.id, []]));
  // Same-edition-twice: two records in one edition (sub-event scoped for trail)
  // → hard anchor, must be different people.
  const byEd = new Map();
  for (const x of recs) { if (!byEd.has(editionKey(x.r))) byEd.set(editionKey(x.r), []); byEd.get(editionKey(x.r)).push(x); }
  const sameEditionTwice = [];
  for (const [, xs] of byEd) {
    if (xs.length < 2) continue;
    sameEditionTwice.push(`${xs[0].r.race} ${xs[0].r.year}${xs[0].isTrail ? ` [${xs[0].r.distId}]` : ''}: ${xs.map(x => `p${x.r.pos} (${x.r.time})`).join(', ')}`);
    for (const x of xs) for (const o of xs) if (o !== x) flags.get(x.id).push(`SAME_EDITION_TWICE:${o.id}`);
  }
  // Same-year different-band: impossible for one person in one calendar year.
  // Bad bands take no part — they'd manufacture conflicts out of source noise.
  const byYear = new Map();
  for (const x of recs) { if (!byYear.has(x.r.year)) byYear.set(x.r.year, []); byYear.get(x.r.year).push(x); }
  for (const [, xs] of byYear) {
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) {
      if (!xs[i].range || !xs[j].range) continue;
      if (bandGap(xs[i].range, xs[j].range) >= 1) {
        flags.get(xs[i].id).push(`SAME_YEAR_DIFF_BAND:${xs[j].id}(${xs[j].r.cat})`);
        flags.get(xs[j].id).push(`SAME_YEAR_DIFF_BAND:${xs[i].id}(${xs[i].r.cat})`);
      }
    }
  }
  // Nationality mismatch — SOFT support signal, flagged for the eye only.
  const natSet = new Set(recs.map(x => x.nat).filter(Boolean));
  if (natSet.size > 1) for (const x of recs) if (x.nat) flags.get(x.id).push(`NAT:${x.nat}`);
  // Excluded-from-inference marker, so a blank window is explained.
  for (const x of recs) if (x.bad) flags.get(x.id).push('BAD_BAND_EXCLUDED_FROM_AGE_INFERENCE');

  // ── Sort by birth-year midpoint (cohorts adjacent), unknown last, then year ─
  recs.sort((a, b) => {
    const am = a.mid ?? Infinity, bm = b.mid ?? Infinity;
    return (am - bm) || (a.r.year - b.r.year) || (a.r.sec - b.r.sec);
  });

  // ── CSV ────────────────────────────────────────────────────────────────────
  const rows = recs.map(x => [
    x.id, x.isTrail ? 'trail' : 'road', x.isTrail ? x.r.distId : '',
    x.r.race, x.r.year, x.r.dist, x.r.pos, x.r.time,
    x.catRaw, x.r.cat, x.bad ? 'no (bad band)' : (x.range ? 'yes' : 'no (open/absent)'),
    x.window, x.nat, x.club, flags.get(x.id).join(';'),
  ].map(csvCell).join(','));
  const slug = p.slug;
  fs.writeFileSync(path.join(OUT_DIR, `cluster-worksheet-${slug}.csv`), `${CSV_HEAD}\n${rows.join('\n')}\n`);

  // ── Cohort clustering for the plain-English read ────────────────────────────
  // Gap-based cohorts are a LOWER bound only: a single person's implied birth
  // year stays roughly constant, so their midpoints barely move — but wide bands
  // ("M 20–34") produce midpoints that bridge two real cohorts into one chain.
  // The birth-year SPAN is therefore the more reliable multi-person signal, and
  // both are reported so a bridged bimodal cluster still reads as bimodal.
  const mids = recs.map(x => x.mid).filter(m => m != null).sort((a, b) => a - b);
  const cohorts = [];
  for (const m of mids) {
    const last = cohorts[cohorts.length - 1];
    if (last && m - last.vals[last.vals.length - 1] <= 8) last.vals.push(m);
    else cohorts.push({ vals: [m] });
  }
  const centers = cohorts.map(c => Math.round(c.vals.reduce((s, v) => s + v, 0) / c.vals.length));
  const noAge = recs.length - mids.length;
  const badCount = recs.filter(x => x.bad).length;
  const trailCount = recs.filter(x => x.isTrail).length;
  const spanMin = mids.length ? mids[0] : null;
  const spanMax = mids.length ? mids[mids.length - 1] : null;
  const span = mids.length ? spanMax - spanMin : 0;
  const surface = trailCount === 0 ? 'road' : trailCount === recs.length ? 'trail' : 'mixed';

  // ── Companion .txt summary ──────────────────────────────────────────────────
  const L = [];
  L.push(`Cluster worksheet — ${p.name}  (slug: ${slug}, gender: ${p.gender})`);
  L.push(`${'='.repeat(64)}`);
  L.push(`Included because          : ${why}`);
  L.push(`Total records             : ${recs.length}   [surface: ${surface}${trailCount ? ` — ${trailCount} trail` : ''}]`);
  L.push(`Birth-year span           : ${span ? `~${spanMin} to ~${spanMax}  (${span}y)` : '(no age data)'}` +
         (noAge ? `   [+${noAge} record(s) with no usable age band]` : ''));
  L.push(`Gap-separated cohorts     : ${cohorts.length ? centers.map(c => `≈${c}`).join(' / ') : '(none)'}   (lower bound — wide bands bridge cohorts, so trust the span too)`);
  L.push(`Distinct implied windows  : ${new Set(recs.map(x => x.window).filter(Boolean)).size}`);
  if (badCount) L.push(`Bad bands excluded        : ${badCount} record(s) — raw value kept in ageBandRaw, ignored for age inference`);
  L.push(`Nationalities             : ${natSet.size ? [...natSet].join(', ') : '(none recorded)'}${natSet.size > 1 ? '   [SOFT signal — mismatch is Tier 2 only, never grounds to split alone]' : ''}`);
  L.push(`Same-edition-twice        : ${sameEditionTwice.length}${trailCount ? '   (sub-event scoped: two Tarawera sub-events in one year are NOT a conflict)' : ''}`);
  for (const s of sameEditionTwice) L.push(`   • ${s}`);
  L.push('');
  // Plain-English read. Combine three signals: hard same-edition-twice (proves
  // ≥2), gap cohorts (lower bound), and birth-year span (~15y per extra person
  // is a rough guide; a single runner's span stays well under that).
  const nCohort = cohorts.length;
  const spanImplies = span >= 15 ? (1 + Math.floor(span / 15)) : 1;
  const estimate = Math.max(nCohort, spanImplies, sameEditionTwice.length ? 2 : 1);
  let read;
  if (estimate <= 1) {
    read = `${recs.length} records, birth-year span only ${span}y around ≈${centers[0] ?? '?'} — consistent with ONE person on age evidence`;
    read += sameEditionTwice.length ? `, but same-edition-twice proves otherwise.` : ` (no hard conflicts).`;
  } else {
    read = `${recs.length} records spanning ~${span}y of implied birth years (~${spanMin} to ~${spanMax})`;
    read += cohorts.length >= 2 ? `, gap-separated into cohorts ≈${centers.join(' / ')}` : ` (bands overlap, so no clean gap — but the span is far wider than one runner)`;
    read += ` → likely ~${estimate} people`;
    if (sameEditionTwice.length) read += `; ${sameEditionTwice.length} same-edition-twice conflict(s) prove ≥2`;
    read += '. Same-edition records CANNOT share a group; where windows smear together with no clean break, leave that sub-cluster merged (conservative default).';
  }
  L.push('READ: ' + read);
  L.push('');
  L.push('Next: read the CSV (sorted by birth-year midpoint so cohorts are adjacent),');
  L.push('decide the partition, and encode recordIds into athleteIdentityOverrides.json `splits`.');
  fs.writeFileSync(path.join(OUT_DIR, `cluster-worksheet-${slug}.txt`), L.join('\n') + '\n');

  summary.push({ name: p.name, slug, records: recs.length, cohorts: nCohort, centers, srt: sameEditionTwice.length, surface, why });
}

// ─── Console summary ─────────────────────────────────────────────────────────
console.log('');
console.log('── Cluster evidence worksheets (flagged multi-identity clusters) ──');
console.log(`   Output dir : ${path.relative(ROOT, OUT_DIR)}/`);
for (const s of summary.slice(0, 20)) {
  console.log(`   • ${s.name.padEnd(18)} ${String(s.records).padStart(3)} recs · ${s.surface.padEnd(5)} · cohorts ≈${s.centers.join('/')} · same-edition-twice ×${s.srt}`);
}
if (summary.length > 20) console.log(`   … and ${summary.length - 20} more`);
console.log(`   ${summary.length} worksheet pair(s) written (.csv + .txt). No splits encoded — review material only.`);
console.log('───────────────────────────────────────────────────────────────');
console.log('');
