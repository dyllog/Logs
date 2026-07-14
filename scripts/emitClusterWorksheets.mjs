#!/usr/bin/env node
/**
 * emitClusterWorksheets.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Human-review evidence generator for the deferred multi-identity clusters —
 * shared-name mega-clusters that are genuine collisions but NOT clean 2-way
 * splits (several are 3–4 people). Auto-suggested groupings on these aren't
 * trustworthy (proven on Andrew Smith, whose auto-groups placed one race edition
 * twice in a single group), so this script deliberately does NOT propose or
 * encode a partition. It lays out every record with the signals a human needs —
 * implied birth-year window, same-race-twice anchors, same-year band conflicts —
 * sorted so natural person-cohorts read off the page. Dylan makes the cuts.
 *
 * Output (one pair per cluster, under cluster-worksheets/):
 *   cluster-worksheet-{slug}.csv   one row per record, evidence columns
 *   cluster-worksheet-{slug}.txt   header summary + plain-English person-count read
 *
 * NOTHING here writes to athleteIdentityOverrides.json. Read-only review material.
 * Run after buildAthleteCanon.mjs (needs public/data/athletes/*.json) and after
 * the 7b Omaha/Onehunga re-conversion (so age bands — hence birth windows — are
 * real). From project root:  node scripts/emitClusterWorksheets.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const ATHLETES = path.join(DATA_DIR, 'athletes');
const OUT_DIR  = path.join(ROOT, 'cluster-worksheets');

// Deferred clusters (Task 7c). Resolved by name to the largest multi-race
// profile, so slug suffixes (e.g. andrew-smith-6 after earlier drift) don't
// need to be hard-coded and stay correct if slugs shift again.
const DEFERRED_NAMES = [
  'Andrew Smith', 'Paul Williams', 'James Watson', 'Lisa Harris',
  'Gabriela Diver', 'Aaron Hill', 'Nick Brown', 'David Green',
];

// ─── File-key → race metadata (must mirror buildAthleteCanon.mjs FILE_META) ───
// Needed to reconstruct each source row's recordId so we can join back the raw
// category / club / nationality that the profile shards drop.
const FILE_META = {
  '':                { label: 'Auckland Marathon',     raceSlug: 'auckland-marathon',        distId: 'mar'  },
  'half':            { label: 'Auckland Half',         raceSlug: 'auckland-marathon',        distId: 'half' },
  'rot':             { label: 'Rotorua Marathon',      raceSlug: 'rotorua-marathon',         distId: 'mar'  },
  'rot-half':        { label: 'Rotorua Half',          raceSlug: 'rotorua-marathon',         distId: 'half' },
  'chc':             { label: 'Christchurch Marathon', raceSlug: 'christchurch-marathon',    distId: 'mar'  },
  'chc-half':        { label: 'Christchurch Half',     raceSlug: 'christchurch-marathon',    distId: 'half' },
  'qt':              { label: 'Queenstown Marathon',   raceSlug: 'queenstown-marathon',      distId: 'mar'  },
  'qt-half':         { label: 'Queenstown Half',       raceSlug: 'queenstown-marathon',      distId: 'half' },
  'hb':              { label: "Hawke's Bay Marathon",  raceSlug: 'hawkes-bay-marathon',      distId: 'mar'  },
  'hb-half':         { label: "Hawke's Bay Half",      raceSlug: 'hawkes-bay-marathon',      distId: 'half' },
  'wf-half':         { label: 'Waterfront Half',       raceSlug: 'waterfront-half-marathon', distId: 'half' },
  'wf-10k':          { label: 'Waterfront 10k',        raceSlug: 'waterfront-half-marathon', distId: '10k'  },
  'dev-half':        { label: 'Devonport Half',        raceSlug: 'devonport-half-marathon',  distId: 'half' },
  'dev-10k':         { label: 'Devonport 10k',         raceSlug: 'devonport-half-marathon',  distId: '10k'  },
  'coast-half':      { label: 'Coatesville Half',      raceSlug: 'coatesville-half-marathon',distId: 'half' },
  'omaha-half':      { label: 'Omaha Half',            raceSlug: 'omaha-half-marathon',      distId: 'half' },
  'omaha-10k':       { label: 'Omaha 10k',             raceSlug: 'omaha-half-marathon',      distId: '10k'  },
  'maraetai-half':   { label: 'Maraetai Half',         raceSlug: 'maraetai-half-marathon',   distId: 'half' },
  'maraetai-10k':    { label: 'Maraetai 10k',          raceSlug: 'maraetai-half-marathon',   distId: '10k'  },
  'kerikeri-half':   { label: 'Kerikeri Half',         raceSlug: 'kerikeri-half-marathon',   distId: 'half' },
  'wellington-mar':  { label: 'Wellington Marathon',   raceSlug: 'wellington-marathon',      distId: 'mar'  },
  'wellington-half': { label: 'Wellington Half',       raceSlug: 'wellington-marathon',      distId: 'half' },
  'onehunga-half':   { label: 'Onehunga Half',         raceSlug: 'onehunga-half-marathon',   distId: 'half' },
  'onehunga-10k':    { label: 'Onehunga 10k',          raceSlug: 'onehunga-half-marathon',   distId: '10k'  },
  'orewa-half':      { label: 'Orewa Half',            raceSlug: 'orewa-half-marathon',      distId: 'half' },
  'orewa-10k':       { label: 'Orewa 10k',             raceSlug: 'orewa-half-marathon',      distId: '10k'  },
  'tamaki-half':     { label: 'Tamaki River Half',     raceSlug: 'tamaki-river-half-marathon',distId: 'half' },
  'tamaki-10k':      { label: 'Tamaki River 10k',      raceSlug: 'tamaki-river-half-marathon',distId: '10k'  },
  'mtm-half':        { label: 'Mt Maunganui Half',     raceSlug: 'mount-maunganui-half-marathon', distId: 'half' },
  'mtm-10k':         { label: 'Mt Maunganui 10k',      raceSlug: 'mount-maunganui-half-marathon', distId: '10k'  },
  'mtm-5k':          { label: 'Mt Maunganui 5k',       raceSlug: 'mount-maunganui-half-marathon', distId: '5k'   },
};
function fileMeta(filename) {
  const base = path.basename(filename);
  const key  = base.replace(/^results-/, '').replace(/-?\d{4}\.json$/, '');
  const yM   = base.match(/(\d{4})\.json$/);
  const year = yM ? parseInt(yM[1], 10) : 0;
  const meta = FILE_META[key];
  return meta ? { ...meta, year } : null;
}

// Stable per-result identity — must match recordId() in buildAthleteCanon.mjs
// and flagInconsistentClusters.mjs, so IDs copy straight into `splits`.
const recordId  = r => `${r.raceSlug}:${r.year}:${r.distId}:p${r.pos}:${r.sec}`;
const editionKey = r => `${r.raceSlug}:${r.year}:${r.distId}`;

/** Age category → inclusive [lo,hi] year range, or null for open/unknown bands. */
function ageRange(cat) {
  const s = String(cat || '');
  let m = s.match(/(\d{2,3})\s*[–—-]\s*(\d{2,3})/);
  if (m) return { lo: +m[1], hi: +m[2], open: false };
  m = s.match(/(\d{2,3})\s*\+/);
  if (m) return { lo: +m[1], hi: 200, open: true };
  return null;
}
/** Whole-year gap between two bands: 0 if overlapping/adjacent (a mid-year
 *  birthday can cross exactly one boundary), positive for a real gap. */
function bandGap(a, b) {
  if (a.lo > b.hi) return a.lo - b.hi - 1;
  if (b.lo > a.hi) return b.lo - a.hi - 1;
  return 0;
}
/** Human-readable implied birth-year window string for a band at `year`. */
function birthWindowStr(year, range) {
  if (!range) return '';
  if (range.open) return `≤${year - range.lo}`;      // e.g. "70+" in 2020 → ≤1950
  return `${year - range.hi}–${year - range.lo}`;     // e.g. M40–49 2017 → 1968–1977
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
for (const f of fs.readdirSync(DATA_DIR).filter(f => f.startsWith('results-') && f.endsWith('.json'))) {
  const meta = fileMeta(f);
  if (!meta) continue;
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')); } catch { continue; }
  if (!Array.isArray(rows)) continue;
  for (const r of rows) {
    const id = `${meta.raceSlug}:${meta.year}:${meta.distId}:p${r.pos ?? 0}:${r.sec ?? 0}`;
    rawByRecord.set(id, {
      catRaw: (r.catRaw && r.catRaw !== '—') ? r.catRaw : '',
      club:   (r.club && r.club !== '—') ? r.club : '',
      nat:    (r.nat && r.nat !== '—') ? r.nat : '',
    });
  }
}

// ─── Load profiles, resolve each deferred name to its largest cluster ─────────
if (!fs.existsSync(ATHLETES)) {
  console.error('❌  public/data/athletes/ not found — run buildAthleteCanon.mjs first.');
  process.exit(1);
}
const byName = new Map();
for (const f of fs.readdirSync(ATHLETES).filter(f => f.endsWith('.json'))) {
  const shard = JSON.parse(fs.readFileSync(path.join(ATHLETES, f), 'utf8'));
  for (const p of Object.values(shard)) {
    if (!DEFERRED_NAMES.includes(p.name)) continue;
    const cur = byName.get(p.name);
    if (!cur || (p.racesLogged ?? 0) > (cur.racesLogged ?? 0)) byName.set(p.name, p);
  }
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const CSV_HEAD = [
  'recordId', 'date', 'race', 'year', 'distance', 'pos', 'time',
  'ageBandRaw', 'ageBandNormalized', 'impliedBirthYearWindow',
  'nationality', 'club', 'conflictFlags',
].join(',');

const summary = [];
for (const name of DEFERRED_NAMES) {
  const p = byName.get(name);
  if (!p) { console.warn(`⚠️  no cluster found for "${name}" — skipping`); continue; }

  // Decorate each record with derived evidence.
  const recs = p.results.map(r => {
    const id = recordId(r);
    const raw = rawByRecord.get(id) || {};
    const range = ageRange(r.cat);
    return {
      r, id, range,
      catRaw: raw.catRaw || '',
      club:   raw.club || '',
      nat:    raw.nat || p.nationality || '',
      window: birthWindowStr(r.year, range),
      mid:    birthMid(r.year, range),
    };
  });

  // ── Conflict detection (per record) ───────────────────────────────────────
  const flags = new Map(recs.map(x => [x.id, []]));
  // Same-race-twice: two records in one edition → hard anchor (must be diff people).
  const byEd = new Map();
  for (const x of recs) { if (!byEd.has(editionKey(x.r))) byEd.set(editionKey(x.r), []); byEd.get(editionKey(x.r)).push(x); }
  const sameRaceTwice = [];
  for (const [, xs] of byEd) {
    if (xs.length < 2) continue;
    sameRaceTwice.push(`${xs[0].r.race} ${xs[0].r.year}: ${xs.map(x => `p${x.r.pos} (${x.r.time})`).join(', ')}`);
    for (const x of xs) for (const o of xs) if (o !== x) flags.get(x.id).push(`SAME_RACE_TWICE:${o.id}`);
  }
  // Same-year different-band: physically impossible for one person same calendar year.
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

  // ── Sort by birth-year midpoint (cohorts adjacent), unknown last, then year ─
  recs.sort((a, b) => {
    const am = a.mid ?? Infinity, bm = b.mid ?? Infinity;
    return (am - bm) || (a.r.year - b.r.year) || (a.r.sec - b.r.sec);
  });

  // ── CSV ────────────────────────────────────────────────────────────────────
  const rows = recs.map(x => [
    x.id, '', x.r.race, x.r.year, x.r.dist, x.r.pos, x.r.time,
    x.catRaw, x.r.cat, x.window, x.nat, x.club,
    flags.get(x.id).join(';'),
  ].map(csvCell).join(','));
  const slug = p.slug;
  fs.writeFileSync(path.join(OUT_DIR, `cluster-worksheet-${slug}.csv`), `${CSV_HEAD}\n${rows.join('\n')}\n`);

  // ── Cohort clustering for the plain-English read ────────────────────────────
  // Gap-based cohorts are a LOWER bound only: a single person's implied birth
  // year stays roughly constant, so their midpoints barely move — but wide bands
  // ("M 20–39") produce midpoints that bridge two real cohorts into one chain.
  // The birth-year SPAN is therefore the more reliable multi-person signal.
  const mids = recs.map(x => x.mid).filter(m => m != null).sort((a, b) => a - b);
  const cohorts = [];
  for (const m of mids) {
    const last = cohorts[cohorts.length - 1];
    if (last && m - last.vals[last.vals.length - 1] <= 8) last.vals.push(m);
    else cohorts.push({ vals: [m] });
  }
  const centers = cohorts.map(c => Math.round(c.vals.reduce((s, v) => s + v, 0) / c.vals.length));
  const noAge = recs.length - mids.length;
  const spanMin = mids.length ? mids[0] : null;
  const spanMax = mids.length ? mids[mids.length - 1] : null;
  const span = mids.length ? spanMax - spanMin : 0;

  // ── Companion .txt summary ──────────────────────────────────────────────────
  const L = [];
  L.push(`Cluster worksheet — ${p.name}  (slug: ${slug}, gender: ${p.gender})`);
  L.push(`${'='.repeat(60)}`);
  L.push(`Total records            : ${recs.length}`);
  L.push(`Birth-year span           : ${span ? `~${spanMin} to ~${spanMax}  (${span}y)` : '(no age data)'}` +
         (noAge ? `   [+${noAge} record(s) with no age band]` : ''));
  L.push(`Gap-separated cohorts     : ${cohorts.length ? centers.map(c => `≈${c}`).join(' / ') : '(none)'}   (lower bound — wide bands bridge cohorts)`);
  L.push(`Distinct implied windows  : ${new Set(recs.map(x => x.window).filter(Boolean)).size}`);
  L.push(`Same-race-twice conflicts : ${sameRaceTwice.length}`);
  for (const s of sameRaceTwice) L.push(`   • ${s}`);
  L.push('');
  // Plain-English read. Combine three signals: hard same-race-twice (proves ≥2),
  // gap cohorts (lower bound), and birth-year span (~15y per extra person is a
  // rough guide; a single runner's span stays well under that).
  const nCohort = cohorts.length;
  const spanImplies = span >= 15 ? (1 + Math.floor(span / 15)) : 1;
  const estimate = Math.max(nCohort, spanImplies, sameRaceTwice.length ? 2 : 1);
  let read;
  if (estimate <= 1) {
    read = `${recs.length} records, birth-year span only ${span}y around ≈${centers[0] ?? '?'} — consistent with ONE person on age evidence`;
    read += sameRaceTwice.length ? `, but same-race-twice proves otherwise.` : ` (no hard conflicts).`;
  } else {
    read = `${recs.length} records spanning ~${span}y of implied birth years (~${spanMin} to ~${spanMax})`;
    read += cohorts.length >= 2 ? `, gap-separated into cohorts ≈${centers.join(' / ')}` : ` (bands overlap, so no clean gap — but the span is far wider than one runner)`;
    read += ` → likely ~${estimate} people`;
    if (sameRaceTwice.length) read += `; ${sameRaceTwice.length} same-race-twice conflict(s) prove ≥2`;
    read += '. Same-race-twice records CANNOT share a group; where windows smear together with no clean break, leave that sub-cluster merged (conservative default).';
  }
  L.push('READ: ' + read);
  L.push('');
  L.push('Next: read the CSV (sorted by birth-year midpoint so cohorts are adjacent),');
  L.push('decide the partition, and encode recordIds into athleteIdentityOverrides.json `splits`.');
  fs.writeFileSync(path.join(OUT_DIR, `cluster-worksheet-${slug}.txt`), L.join('\n') + '\n');

  summary.push({ name: p.name, slug, records: recs.length, cohorts: nCohort, centers, srt: sameRaceTwice.length });
}

// ─── Console summary ─────────────────────────────────────────────────────────
console.log('');
console.log('── Cluster evidence worksheets (deferred multi-identity clusters) ─');
console.log(`   Output dir : ${path.relative(ROOT, OUT_DIR)}/`);
for (const s of summary) {
  console.log(`   • ${s.name.padEnd(15)} ${String(s.records).padStart(3)} recs · cohorts ≈${s.centers.join('/')} · same-race-twice ×${s.srt}`);
}
console.log(`   ${summary.length} worksheet pair(s) written (.csv + .txt). No splits encoded — review material only.`);
console.log('───────────────────────────────────────────────────────────────');
console.log('');
