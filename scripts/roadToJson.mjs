/**
 * Road result converter — config-driven, one family per invocation.
 *
 *   node scripts/roadToJson.mjs whanganui
 *   node scripts/roadToJson.mjs --all
 *
 * WHY THIS EXISTS. The per-family converters (csvToJson, chcToJson, qtHbToJson,
 * …) each re-implement the same parse with hardcoded column INDEXES. Wave 1's
 * sources do not share a column layout — across eight families the header is
 * some subset of
 *
 *   Position, Name, Bib, Time, Net Time, Category, Category Position,
 *   Gender, Gender Position, Age, City, Club, Course, Nationality, …
 *
 * in varying order, and it changes between years of the SAME race. Index-based
 * parsing reads whatever happens to sit in that slot, which fails silently:
 * a shifted column yields plausible-looking rows with the wrong field in them.
 * Columns here are resolved by HEADER NAME, and a required column that cannot
 * be found is a hard error rather than an empty string.
 *
 * Distances are declared per family. A distance may match several filename
 * patterns, which is how a sub-event whose published distance label changed
 * between years stays one continuous series.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { normalizeCat } from './normalizeCats.mjs';
import { splitByHeading, describeSplit } from './lib/splitMultiEvent.mjs';
import { pdfLines, taupoHeadingOf, resolveTaupoHeading, parseTaupoRow } from './lib/taupoPdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const RACE_DIR = path.join(ROOT, 'Race Files');
const OUT_DIR  = path.join(ROOT, 'public', 'data');

/**
 * Results the archive holds but knows to be incomplete.
 *
 * A name the source published without a surname canonicalises as its own
 * athlete and is effectively unmatchable — "Sarah" will never join the rest of
 * Sarah's results. Recording them as published is right; leaving them looking
 * like ordinary data is not. Written to public/data/incomplete-records.json so
 * the fact travels with the archive rather than living in a converter warning,
 * and so a contribute page can offer them for correction.
 */
const INCOMPLETE_RECORDS = [];

// ─── Family configuration ────────────────────────────────────────────────────
//
// `key` is the results-file key prefix: results-{key}-{distKey}-{year}.json.
// It must match an entry in FILE_META in scripts/buildAthleteCanon.mjs, or the
// canon will warn and skip the file.

export const ROAD_FAMILIES = {
  whanganui: {
    label:    'Whanganui Three Bridges',
    dir:      'Whanganui Three Bridges Marathon',
    key:      'whanganui',
    raceSlug: 'whanganui-three-bridges-marathon',
    // Per-year summary stats are WRITTEN by this script, not pasted from its
    // output. The older families keep hand-copied numbers in their data file,
    // which drifts silently the moment a source is corrected or re-ingested.
    tsFile:   'whanganuiData.ts',
    tsPrefix: 'WHANGANUI',
    tsVar:    'whanganui',
    distances: [
      { distKey: 'mar',  distId: 'mar',  dist: '42.2 km', label: 'Whanganui Marathon', match: [/^Marathon Results - (\d{4})\.csv$/i] },
      { distKey: 'half', distId: 'half', dist: '21.1 km', label: 'Whanganui Half',     match: [/^Half Results - (\d{4})\.csv$/i] },
      // The QUARTER MARATHON — 10.55 km — published as "105K" in
      // 2018/20/23/24/25 and, loosely, as "10K" in 2017/19/22. One event: those
      // two year sets are together exactly the year set of the 5K, half and
      // marathon, and 86 runners appear under both labels at a median time
      // ratio of 0.984, so the labels are the same course as each other.
      //
      // It is 10.55 km by CONSTRUCTION, not by inference. The course is a
      // single lap from Kowhai Park — four laps for the marathon, two for the
      // half, one for the quarter — so the lap is 42.2/4 = 10.55 km, and the
      // marathon and half are AIMS certified at 42.2/21.1. There is no 10 km
      // event in the programme at all.
      //
      // An earlier pass here recorded it as 10 km, comparing these times
      // against known 10 km races and correcting by an inflation factor taken
      // from Whanganui's half and marathon. That was the wrong instrument
      // twice over: it measured against a distance the programme never had,
      // and it carried a factor derived from one field into another. Solving
      // the distance from Whanganui's OWN results instead — calibrating the
      // fatigue exponent on the half/marathon pairs, which are known 21.1/42.2
      // — puts the quarter at 10.96 km (n=103, IQR 10.48–11.49). 10.55 falls
      // inside that interval; 10.00 falls outside it.
      //
      // distId is 'quarter', NOT '10k': a 10.55 km time must never become a
      // 10 km PB, and there is no WMA age-grading standard for the distance,
      // so GRADED_DISTS correctly excludes it.
      { distKey: 'quarter', distId: 'quarter', dist: '10.5 km', label: 'Whanganui Quarter', match: [/^10K Results - (\d{4})\.csv$/i, /^105K Results - (\d{4})\.csv$/i] },
      { distKey: '5k',   distId: '5k',   dist: '5 km',    label: 'Whanganui 5k',       match: [/^5K Results - (\d{4})\.csv$/i] },
    ],
  },

  saintclair: {
    label:    'Saint Clair Vineyard Half',
    dir:      'Saint Clair Vineyard Half',
    key:      'saintclair',
    raceSlug: 'saint-clair-vineyard-half-marathon',
    tsFile:   'saintClairData.ts',
    tsPrefix: 'SAINTCLAIR',
    tsVar:    'saintClair',
    // TIME CONVENTION, worth stating because it departs from the archive's.
    // The 2022/2023 exports carry both a `Time` and a `Run` column, and `Run`
    // runs 13-59s LONGER with a spread that grows with field size and distance
    // — the signature of gun vs net, with `Run` as gun. But the published
    // positions follow `Time` with ZERO inversions, against 28-135 for `Run`.
    // `Time` is therefore the official ranking time, and it is the NET one.
    // Recording gun here would put the archive's stored times at odds with
    // every position the organiser published, so `Time` wins by header order.
    // CURATION: Saint Clair times are net where other road families are gun,
    // so they read very slightly fast in cross-race comparison (~1 min on the
    // half). Flagged rather than silently normalised.
    distances: [
      { distKey: 'half', distId: 'half', dist: '21.1 km', label: 'Saint Clair Half', match: [/^Half Results - (\d{4})\.csv$/i] },
      // 12 km, as the filename states. Checked rather than assumed, using the
      // same same-runner method that reclassified Whanganui's quarter: solving
      // against this family's known 21.1 km half gives an implied 12.35-12.84
      // km (n=162), with 12.00 inside the IQR at the lower fatigue exponents
      // and just outside at the highest.
      //
      // The lean is kept as a note, not acted on, because the two cases are not
      // alike. Whanganui had a construction argument (one lap of a four-lap
      // 42.2 km course) and a rival candidate the evidence excluded. Here there
      // is neither, and there is a plausible confound: the 12k field is heavily
      // recreational (371W/63M in 2021), so runners who enter both are likely
      // treating the 12k as the easier option and running it relatively slower,
      // which biases the implied distance long.
      // CURATION: a course certificate would settle it; the filename stands.
      { distKey: '12k',  distId: '12k',  dist: '12 km',   label: 'Saint Clair 12k',  match: [/^12K Results - (\d{4})\.csv$/i] },
    ],
  },

  taupo: {
    label:    'Taupō Marathon',
    dir:      'Taupo Marathon',
    key:      'taupo',
    raceSlug: 'taupo-marathon',
    tsFile:   'taupoData.ts',
    tsPrefix: 'TAUPO',
    tsVar:    'taupo',
    // Five header shapes across seven years, differing only in where the split
    // columns sit and whether the club column is "Club" or "Team/Club". Name
    // resolution absorbs all five; the splits are simply not columns this
    // archive stores.
    //
    // The "All Results" PDFs mostly duplicate the CSVs — EXCEPT for the 2023
    // and 2025 halves, where the organiser's CSV is a byte-identical copy of
    // that year's marathon file. For those two editions the PDF is the only
    // source there is, so they are read from it rather than deferred.
    //
    // The reader is verified against every marathon that exists in BOTH
    // formats before it is trusted here: scripts/verifyTaupoPdf.mjs reproduces
    // 1,408 finishers across six years exactly on position and time.
    // The PDFs also hold the ONLY copy of the 10 km and 5 km fields for most
    // years — no CSV was ever shipped for them. Taken here because the reader
    // is already proven against known-good data and the alternative is leaving
    // real results unretrieved behind a mechanism that works.
    //   10k: 2025 comes from its CSV, which is the better source; the PDF
    //        supplies 2020-2024.
    //   5k:  no CSV exists in any year, so every edition is PDF-sourced.
    // 2019's PDF holds a marathon only.
    pdf: {
      file: (year) => `All Results - ${year}.pdf`,
      take: [
        { distKey: 'half', years: [2023, 2025] },
        { distKey: '10k',  years: [2020, 2021, 2022, 2023, 2024] },
        { distKey: '5k',   years: [2020, 2021, 2022, 2023, 2024, 2025] },
      ],
    },
    distances: [
      { distKey: 'mar',  distId: 'mar',  dist: '42.2 km', label: 'Taupō Marathon', match: [/^Marathon Results - (\d{4})\.csv$/i] },
      { distKey: 'half', distId: 'half', dist: '21.1 km', label: 'Taupō Half',     match: [/^Half Results - (\d{4})\.csv$/i] },
      { distKey: '10k',  distId: '10k',  dist: '10 km',   label: 'Taupō 10k',      match: [/^10K Results - (\d{4})\.csv$/i] },
      // No CSV in any year — PDF-sourced throughout.
      { distKey: '5k',   distId: '5k',   dist: '5 km',    label: 'Taupō 5k',       match: [/^5K Results - (\d{4})\.csv$/i] },
    ],
  },

  huntly: {
    label:    'Huntly Half Marathon',
    dir:      'Huntly Half Marathon',
    key:      'huntly',
    raceSlug: 'huntly-half-marathon',
    tsFile:   'huntlyData.ts',
    tsPrefix: 'HUNTLY',
    tsVar:    'huntly',
    // ONLY the half is declared, because only the half has DATA. Huntly has
    // run a 10 km since 1996 (the organiser's history dates it to the year the
    // Hamilton club took over), but every "10K Results - YYYY.csv" it ships is
    // byte-identical to that year's "Half Results" file AND its own Course
    // column reads "Running | Half marathon" — two independent proofs of the
    // same export error. Declaring a 10 km here would manufacture five years
    // of it out of half marathon times. The 10 km is a known coverage gap,
    // recorded as such; the unclaimed files are reported on every run.
    //
    // The Course column is the authority over the filename wherever it exists;
    // 2019 predates it and is attributed by filename, which is safe because
    // that year's file holds a single distance.
    courseMap: (value) => {
      const v = value.toLowerCase();
      if (/21\s*km|half\s*marathon/.test(v)) return 'half';
      if (/\b10\s*km\b/.test(v)) return '10k';
      if (/\b5\s*km\b/.test(v)) return '5k';
      return null; // unrecognised → the file is skipped rather than guessed at
    },
    distances: [
      { distKey: 'half', distId: 'half', dist: '21.1 km', label: 'Huntly Half', match: [/^Half Results - (\d{4})\.csv$/i] },
    ],
  },
};

// ─── CSV parsing (quotes, embedded commas, embedded newlines) ────────────────

function parseCsv(text) {
  const rows = [];
  let field = '', row = [], inQuotes = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some(f => f.trim() !== '')) rows.push(row);
  return rows;
}

const clean = (s) => String(s ?? '').replace(/[ \s]+/g, ' ').trim();

/**
 * Title-case a name. Word starts are found by PUNCTUATION, not \b\w, because
 * those classes are ASCII-only and would capitalise the letter after a macron
 * ("Hākopa" → "HāKopa"). Must stay in step with titleCaseName() in
 * scripts/build-search-index.mjs — the index derives its key from this name,
 * and a disagreement makes the name unreachable.
 */
function titleCase(s) {
  return s.toLowerCase()
    .replace(/(?:^|[\s\-'’])\S/gu, c => c.toUpperCase())
    .replace(/\bMc(\S)/gu, (_, c) => 'Mc' + c.toUpperCase())
    .replace(/\bO(['’])(\S)/gu, (_, ap, c) => 'O' + ap + c.toUpperCase());
}

/**
 * Seconds from "H:MM:SS(.cc)" or "MM:SS(.cc)". Sub-second precision is dropped
 * by TRUNCATION, which is the timing convention: a 2:49:12.99 is a 2:49:12,
 * not a 2:49:13. Returns 0 for anything that is not a clock time (DNF, DNS).
 */
function toSec(t) {
  const s = clean(t);
  if (!s.includes(':')) return 0;
  const p = s.split(':');
  if (p.some(x => x === '' || isNaN(Number(x)))) return 0;
  const n = p.map(Number);
  const v = n.length === 3 ? n[0] * 3600 + n[1] * 60 + n[2]
          : n.length === 2 ? n[0] * 60 + n[1]
          : 0;
  return Math.floor(v);
}

/**
 * HH:MM:SS, hours zero-padded. The archive holds three shapes — 323 files use
 * HH:MM:SS, 81 use H:MM:SS and 18 use M:SS — so a results table can show
 * "02:52:48" and "2:49:12" side by side for the same runner. New ingestion
 * follows the dominant form rather than adding a fourth variant.
 */
function fmtSec(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function parseBib(raw) {
  const n = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

/** "1st", "23rd", "104" → 1, 23, 104. Anything without digits → 0. */
function parsePos(raw) {
  const n = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

/**
 * A position cell that declares the entrant did NOT finish.
 *
 * These carry a time, which is what makes them dangerous: Taupō marks four
 * runners DNF while recording 3:58:41, 4:14:56, 4:31:40 and 2:45:19 against
 * them, so a time-based filter passes them straight through and the archive
 * counts them as finishers at position 0. Only the position cell says
 * otherwise, and only the PDF made it legible — the CSV renders it as a bare
 * unparseable value indistinguishable from a formatting quirk.
 */
const NON_FINISH_POS = /^\s*(dnf|dns|dq|dsq|dnq|withdrawn|scratch(ed)?)\s*$/i;

// ─── Column resolution by header name ────────────────────────────────────────

/** Header aliases, in preference order. Matching is case/space-insensitive. */
const COLUMNS = {
  // 'net pos' is last: where a file has both, the plain Position column is the
  // published finish order. Saint Clair's 2022 exports drop Position entirely
  // and carry only Net Pos, which without this alias would fail the required-
  // column check and skip the file.
  pos:     ['position', 'place', 'pos', 'overall', 'net pos'],
  name:    ['name', 'athlete', 'full name'],
  bib:     ['bib', 'race number', 'number', 'no'],
  time:    ['time', 'gun time', 'finish time', 'chip time', 'nett time', 'net time'],
  netTime: ['net time', 'nett time', 'chip time'],
  cat:     ['category', 'division', 'age group', 'grade'],
  gender:  ['gender', 'sex'],
  age:     ['age'],
  club:    ['club', 'team/club', 'team'],
  nat:     ['nationality', 'country', 'nat'],
  course:  ['course', 'contest', 'event', 'race'],
};

const normHeader = (h) => clean(h).toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Map logical field → column index, by header name.
 *
 * Time is deliberate: where a file carries BOTH a gun and a net column, `time`
 * takes the gun column and `netTime` the net one, so the archive stays aligned
 * on gun while preserving net. A file with only a net column uses it as `time`
 * — one recorded time is better than none — and reports the substitution.
 */
function resolveColumns(header) {
  const norm = header.map(normHeader);
  const idx = {};
  for (const [field, aliases] of Object.entries(COLUMNS)) {
    for (const alias of aliases) {
      const i = norm.indexOf(normHeader(alias));
      if (i !== -1) { idx[field] = i; break; }
    }
  }
  // "Time" and "Net Time" share aliases; if both resolved to the same column
  // there is only one time in this file, so there is no net to preserve.
  if (idx.netTime !== undefined && idx.netTime === idx.time) delete idx.netTime;
  // Where the only time column IS the net one, `time` will have landed on it
  // via the alias list. Flag that so the diagnostics can say so.
  const gunHeader = idx.time !== undefined ? norm[idx.time] : '';
  idx._timeIsNet = /net|nett|chip/.test(gunHeader);
  return idx;
}

/** Gender letter from an explicit gender column. */
function genderLetter(raw) {
  const s = clean(raw).toLowerCase();
  if (!s) return '';
  if (s.startsWith('f') || s.startsWith('w')) return 'W';
  if (s.startsWith('m')) return 'M';
  return '';
}

/**
 * Category as the archive stores it: "M 40–44".
 *
 * Sources write the women's prefix as F; the archive uses W throughout. Where
 * a file has no category column but does have gender + age, the band is NOT
 * invented — an exact age is recorded as-is ("W 37"), because manufacturing a
 * 5-year band from one number asserts a grouping the source never published.
 */
function buildCat(rawCat, rawGender, rawAge) {
  const cat = clean(rawCat);
  const g   = genderLetter(rawGender);
  if (cat) {
    // Strip a leading gender, whether a single letter ("M 40-44") or a whole
    // word ("Male Open (20-39 Years)"). The letter form MUST be followed by a
    // boundary: an earlier version anchored on /^([MWF])\s*/, which matched the
    // M of "Male" and left every Taupō category as "M ale Open (20-39 Years)".
    let rest = cat, letter = '';
    // A whole word, or a bare letter followed by anything that is NOT another
    // letter. \b will not do for the bare form: there is no word boundary
    // between the W and the 1 of "W18-39", so an earlier version failed to
    // match it, fell through to a default, and recorded 114 women as men.
    // The negative lookahead also stops "Mike" being read as an M category.
    const gm = rest.match(/^(male|female|men|women)\b[\s.:-]*/i)
            ?? rest.match(/^([mwf])(?![a-z])[\s.:-]*/i);
    if (gm) {
      const word = gm[1].toLowerCase();
      letter = /^(f|w|female|women)$/.test(word) ? 'W' : 'M';
      rest = rest.slice(gm[0].length).trim();
    }
    const gFinal = letter || g;

    // Pull the age band out of whatever wrapping the source used:
    //   "Open (20-39 Years)" · "45-49yrs" · "Unstoppables (70+ Years)" · "40-44"
    // The organiser's name for the band ("Veteran", "Legend") is dropped — the
    // archive stores age ranges, and the same band carries different names at
    // different races.
    // No gender fallback. Where the source does not say, the band is recorded
    // without one and the canon treats the row as unknown-gender — asserting a
    // gender to make the string well-formed is exactly the kind of tidy
    // fabrication this pipeline is meant to avoid.
    const band = rest.match(/(\d{1,3})\s*[-–—]\s*(\d{1,3})/);
    if (band) return gFinal ? normalizeCat(`${gFinal} ${band[1]}-${band[2]}`) : `${band[1]}–${band[2]}`;
    const open = rest.match(/(\d{1,3})\s*\+/);
    if (open) return gFinal ? normalizeCat(`${gFinal} ${open[1]}+`) : `${open[1]}+`;
    // "Junior (U13 Years)" / "U20" — an upper bound, recorded literally as
    // 0-(n-1). Not narrowed to a competitive junior band: U13 at a community
    // 10 km means anyone under 13, and inventing a floor would assert an age
    // range the entrant never declared.
    // Both spellings: "U13" and "Under 20". Huntly's 2019 file writes the
    // latter with the gender AFTER the band ("Under 20 Male"), which the
    // leading-gender strip cannot see and the hyphen-band match does not fit —
    // it became the category "M Under 20 Male".
    const under = rest.match(/\b(?:U|under)\s*(\d{1,3})\b/i);
    if (under) {
      const hi = Math.max(0, parseInt(under[1], 10) - 1);
      return gFinal ? normalizeCat(`${gFinal} 0-${hi}`) : `0–${hi}`;
    }

    // What is left is either an age the source published bare, or noise.
    //
    // A BARE NUMBER is an age: Saint Clair writes its top band as "M60"
    // alongside "M16-39" and "M40-59", and dropping the 60 would throw away
    // the only age information those rows carry.
    //
    // A PARENTHESISED number is not. Taupō's 2022 PDF publishes one row as
    // "Grace Ryan Female (42) (1) 57:38" with no age group at all, and the
    // stray gender place became the category "W (42)".
    const bare = rest.match(/^\(?\s*(\d{1,3})\s*\)?$/);
    const meaningful = bare && !/[()]/.test(rest) ? bare[1]
                     : /[a-z]/i.test(rest) ? rest
                     : '';
    if (gFinal) return meaningful ? normalizeCat(`${gFinal} ${meaningful}`) : gFinal;
    return meaningful ? normalizeCat(meaningful) : '—';
  }
  const age = clean(rawAge);
  if (g && age && /^\d{1,3}$/.test(age)) return `${g} ${age}`;
  if (g) return g;
  return '—';
}

// ─── Conversion ──────────────────────────────────────────────────────────────

function convertFile(family, dist, year, filePath, warn, seenContent) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // ── Duplicate sources ───────────────────────────────────────────────────
  // Taupō ships "Half Results - 2023.csv" byte-identical to that year's
  // marathon file, and the same for 2025. Ingesting both would file one
  // event's finishers under two distances, giving every one of them a
  // fabricated result at a distance they did not run. Content is hashed
  // across the family so the copy is caught wherever it appears.
  const hash = crypto.createHash('sha1').update(raw).digest('hex');
  const prior = seenContent.get(hash);
  if (prior) {
    warn(`${path.basename(filePath)}: byte-identical to ${prior} — SKIPPED (one event cannot be two distances; the source needs re-issuing)`);
    return null;
  }
  seenContent.set(hash, path.basename(filePath));
  const grid = parseCsv(raw);
  const rel = path.basename(filePath);
  if (grid.length < 2) { warn(`${rel}: no data rows`); return null; }

  const idx = resolveColumns(grid[0]);
  for (const required of ['pos', 'name', 'time']) {
    if (idx[required] === undefined) {
      warn(`${rel}: no "${required}" column in header [${grid[0].map(clean).join(' | ')}] — SKIPPED`);
      return null;
    }
  }
  if (idx._timeIsNet) warn(`${rel}: only a net/chip time column present; using it as the recorded time`);

  const rows = [];
  let dnf = 0, badTime = 0, noCat = 0;
  const seen = new Set();

  for (let i = 1; i < grid.length; i++) {
    const g = grid[i];
    const name = titleCase(clean(g[idx.name] ?? ''));
    if (!name) continue;

    // Declared non-finishers are excluded even when a time is recorded — the
    // organiser's own position cell is the authority on whether this counts.
    if (NON_FINISH_POS.test(String(g[idx.pos] ?? ''))) { dnf++; continue; }

    const sec = toSec(g[idx.time]);
    if (sec <= 0) { dnf++; continue; }
    // A road time under 10 minutes or over 12 hours is not a finish time for
    // any distance in this archive; it is a mis-parsed cell.
    if (sec < 600 || sec > 12 * 3600) { badTime++; warn(`${rel} row ${i + 1}: implausible time ${clean(g[idx.time])} for ${name}`); continue; }

    const cat = buildCat(g[idx.cat], g[idx.gender], g[idx.age]);
    if (cat === '—') noCat++;

    // Same person, same time, listed twice — a source duplicate, not a result.
    const dedupe = `${name}|${sec}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    const row = {
      pos:  parsePos(g[idx.pos]),
      name,
      bib:  idx.bib !== undefined ? parseBib(g[idx.bib]) : 0,
      nat:  idx.nat !== undefined ? clean(g[idx.nat]).toUpperCase() : '',
      cat,
      club: idx.club !== undefined ? (clean(g[idx.club]) || '—') : '—',
      time: fmtSec(sec),
      sec,
    };
    if (idx.netTime !== undefined) {
      const net = toSec(g[idx.netTime]);
      if (net > 0 && net !== sec) row.netSec = net;
    }
    rows.push(row);
  }

  if (!rows.length) { warn(`${rel}: parsed 0 finishers`); return null; }

  // ── Appended tables ───────────────────────────────────────────────────────
  // A results file is one event, so the position sequence should rise once. A
  // RESET means a second table has been pasted onto the end. Taupō's 2025
  // marathon export is 518 marathon finishers followed by seven ten-row
  // top-10 leaderboards for the half, 10 km and 5 km — which, taken at face
  // value, made a 17-minute run the marathon course record.
  //
  // Only the leading table is kept, and only when it clearly dominates. If the
  // blocks are comparable in size this is not an appended extract but
  // something the converter does not understand, and the file is skipped
  // rather than half-ingested.
  // ── Course column: the source stating the distance per row ────────────────
  // The strongest evidence there is, and it OVERRULES the filename. Huntly's
  // "10K Results" files contain nothing but half marathon rows — every one of
  // them says "Running | Half marathon" — and a filename-driven importer would
  // have created a 10 km series out of half marathon times.
  //
  // This verifies rather than reattributes: a file whose rows belong to a
  // different distance is skipped with its evidence, because moving them
  // silently would be the same guessing this exists to prevent.
  if (idx.course !== undefined && family.courseMap) {
    const byCourse = new Map();
    for (const g of grid.slice(1)) {
      const v = clean(g[idx.course]);
      if (!v) continue;
      byCourse.set(v, (byCourse.get(v) ?? 0) + 1);
    }
    const wrong = [];
    for (const [value, n] of byCourse) {
      const mapped = family.courseMap(value);
      if (mapped === null) { warn(`${rel}: unrecognised Course value ${JSON.stringify(value)} (${n} rows) — cannot attribute`); return null; }
      if (mapped !== dist.distKey) wrong.push(`${JSON.stringify(value)} → ${mapped} (${n} rows)`);
    }
    if (wrong.length) {
      warn(`${rel}: filed as "${dist.distKey}" but its Course column says otherwise — ${wrong.join('; ')} — SKIPPED, the column is the authority`);
      return null;
    }
  }

  // ── "Surname, Firstname" exports ──────────────────────────────────────────
  // Taupō's 2025 files publish every name reversed. Left alone, "Stansloski,
  // Joel" never clusters with the "Joel Stansloski" the same runner appears as
  // everywhere else, so one athlete silently becomes two.
  //
  // Inverted only when the WHOLE FILE agrees — a file-level convention, not a
  // stray comma in one entry. A single "Smith, John" among 500 normal names is
  // far more likely to be a name that genuinely contains a comma, and is left
  // exactly as published.
  maybeInvertNames(rows, rel, warn);

  // A new table starts only where the position sequence RESTARTS AT 1. An
  // out-of-order row, or one whose position did not parse (pos 0), is a stray
  // within the same table — Taupō's 2023 marathon has three such rows at
  // plausible marathon times, and treating those as a new table would discard
  // real finishers.
  const blocks = [];
  {
    let cur = [];
    for (const r of rows) {
      if (r.pos === 1 && cur.length) { blocks.push(cur); cur = []; }
      cur.push(r);
    }
    if (cur.length) blocks.push(cur);
  }
  if (blocks.length > 1) {
    const lead = blocks[0];
    const tail = blocks.slice(1);
    const largestTail = Math.max(...tail.map(b => b.length));
    const describe = tail.map(b => `${b.length} rows ${fmtSec(Math.min(...b.map(r => r.sec)))}–${fmtSec(Math.max(...b.map(r => r.sec)))}`).join('; ');
    // Scale, not share: an appended extract is a top-10 leaderboard next to a
    // full field, so the lead outweighs the largest tail by an order of
    // magnitude. Blocks of comparable size are two real fields in one file,
    // which this cannot attribute to distances and must not guess at.
    if (lead.length >= 10 * largestTail) {
      warn(`${rel}: ${blocks.length} tables in one file — kept the leading ${lead.length}, DROPPED ${rows.length - lead.length} row(s) in ${tail.length} appended table(s): ${describe}`);
      rows.length = 0;
      rows.push(...lead);
    } else {
      warn(`${rel}: ${blocks.length} tables in one file, largest ${lead.length} vs ${largestTail} — SKIPPED rather than guess which event is which`);
      return null;
    }
  }

  return finaliseAndWrite(family, dist, year, rows, rel, warn, { dnf, badTime, noCat });
}

/**
 * Sanity-check a finished set of rows, write it, and return its summary.
 *
 * Shared by the CSV and PDF paths so a PDF-sourced edition gets exactly the
 * same scrutiny as a CSV-sourced one — the same position checks, the same
 * duplicate and inversion reporting, the same output shape.
 */
/**
 * Undo "Surname, Firstname" publishing, where the WHOLE source agrees.
 *
 * Taupō's 2025 exports — CSV and PDF alike — publish every name reversed.
 * Left alone, "Stansloski, Joel" never clusters with the "Joel Stansloski"
 * the same runner appears as everywhere else, so one athlete silently becomes
 * two. A lone "Smith, John" among 500 normal names is far more likely to be a
 * name that genuinely contains a comma, and is left exactly as published.
 */
function maybeInvertNames(rows, rel, warn) {
  const inverted = /^([^,]+),\s+([^,]+)$/;
  const matching = rows.filter(r => inverted.test(r.name));
  if (matching.length < rows.length * 0.9 || matching.length <= 5) return;
  for (const r of rows) {
    const m = r.name.match(inverted);
    if (m) r.name = `${m[2].trim()} ${m[1].trim()}`;
  }
  warn(`${rel}: names published "Surname, Firstname" (${matching.length}/${rows.length}) — inverted so they match the rest of the archive`);
}

function finaliseAndWrite(family, dist, year, rows, rel, warn, counts) {
  const { dnf = 0, badTime = 0, noCat = 0 } = counts ?? {};

  // Positions come from the source. Where the source did not supply usable
  // ones, derive them from time order rather than leaving zeroes — recordId is
  // built from position, so a zero would collide every finisher onto one id.
  const usablePos = rows.filter(r => r.pos > 0).length;
  if (usablePos < rows.length * 0.9) {
    warn(`${rel}: ${rows.length - usablePos}/${rows.length} rows without a position — deriving from time order`);
    [...rows].sort((a, b) => a.sec - b.sec).forEach((r, i) => { r.pos = i + 1; });
  }

  // A duplicated position means two finishers share a recordId slot. Report it
  // loudly: the canon would silently treat them as one result.
  const posCount = new Map();
  for (const r of rows) posCount.set(r.pos, (posCount.get(r.pos) ?? 0) + 1);
  const dupes = [...posCount.entries()].filter(([, n]) => n > 1);
  if (dupes.length) warn(`${rel}: ${dupes.length} duplicated position(s), e.g. ${dupes.slice(0, 3).map(([p, n]) => `p${p}×${n}`).join(', ')}`);

  // Position should agree with time order. Disagreement is normal in small
  // doses (net-time ordering, manual corrections); a lot of it means the
  // position column is not what it looks like.
  const byPos = [...rows].sort((a, b) => a.pos - b.pos);
  let inversions = 0;
  for (let i = 1; i < byPos.length; i++) if (byPos[i].sec < byPos[i - 1].sec) inversions++;
  if (inversions > rows.length * 0.05) {
    warn(`${rel}: ${inversions}/${rows.length} position/time inversions — position column may not be finish order`);
  }

  const outName = `results-${family.key}-${dist.distKey}-${year}.json`;
  fs.writeFileSync(path.join(OUT_DIR, outName), JSON.stringify(rows));

  const men   = rows.filter(r => r.cat.startsWith('M')).sort((a, b) => a.sec - b.sec);
  const women = rows.filter(r => r.cat.startsWith('W')).sort((a, b) => a.sec - b.sec);
  const sorted = [...rows].sort((a, b) => a.sec - b.sec);
  const mean = (xs) => (xs.length ? Math.round(xs.reduce((s, r) => s + r.sec, 0) / xs.length) : 0);
  return {
    year, file: outName, n: rows.length,
    men: men.length, women: women.length,
    median: sorted[Math.floor(sorted.length / 2)]?.sec ?? 0,
    avgMen: mean(men), avgWomen: mean(women),
    winM: men[0], winW: women[0],
    top10M: mean(men.slice(0, 10)), top10W: mean(women.slice(0, 10)),
    dnf, badTime, noCat,
  };
}

/**
 * Write the family's per-year summary file.
 *
 * The site reads these numbers for its year tables and charts. Emitting them
 * here means they cannot disagree with the result files they describe — the
 * older per-family data modules hold the same numbers copied by hand from a
 * converter's console output, which is only correct until the next re-ingest.
 */
function writeDataFile(family, statsByDist) {
  const pad = (n, w) => String(n).padStart(w);
  const rowOf = (s) =>
    `  { year: ${s.year}, finishers: ${pad(s.n, 4)}, avg: ${pad(s.median, 5)}, avgMen: ${pad(s.avgMen, 5)}, ` +
    `avgWomen: ${pad(s.avgWomen, 5)}, winnerM: ${pad(s.winM?.sec ?? 0, 5)}, winnerW: ${pad(s.winW?.sec ?? 0, 5)}, ` +
    `top10M: ${pad(s.top10M, 5)}, top10W: ${pad(s.top10W, 5)} },`;

  const parts = [
    '// GENERATED by scripts/roadToJson.mjs — do not edit by hand.',
    `// Re-run: node scripts/roadToJson.mjs ${family.key}`,
    '',
    "import type { YearStat } from './logsDataExt';",
    '',
  ];
  for (const dist of family.distances) {
    const stats = statsByDist[dist.distKey];
    if (!stats?.length) continue;
    const YEARS = `${family.tsPrefix}_${dist.distKey.toUpperCase()}_YEARS`;
    const VAR   = `${family.tsVar}${dist.distKey[0].toUpperCase()}${dist.distKey.slice(1)}Stats`;
    parts.push(`export const ${YEARS} = [${stats.map(s => s.year).join(', ')}] as const;`);
    parts.push('');
    parts.push(`export const ${VAR}: YearStat[] = [`);
    parts.push(...stats.map(rowOf));
    parts.push('];');
    parts.push('');
  }
  const out = path.join(ROOT, 'src', 'data', family.tsFile);
  fs.writeFileSync(out, parts.join('\n'));
  console.log(`\n  → src/data/${family.tsFile} written`);
}

function convertFamily(famKey) {
  const family = ROAD_FAMILIES[famKey];
  if (!family) throw new Error(`Unknown family "${famKey}". Known: ${Object.keys(ROAD_FAMILIES).join(', ')}`);

  const dir = path.join(RACE_DIR, family.dir);
  if (!fs.existsSync(dir)) throw new Error(`Source directory not found: ${dir}`);
  const files = fs.readdirSync(dir);

  const warnings = [];
  const warn = (m) => warnings.push(m);
  /** sha1 of source content -> first filename seen, for duplicate detection */
  const seenContent = new Map();

  console.log(`\n══ ${family.label} ══`);
  let totalRows = 0, totalFiles = 0;
  const claimed = new Set();
  const statsByDist = {};

  for (const dist of family.distances) {
    const matches = [];
    for (const f of files) {
      for (const re of dist.match) {
        const m = f.match(re);
        if (m) { matches.push({ file: f, year: parseInt(m[1], 10) }); break; }
      }
    }
    matches.sort((a, b) => a.year - b.year);
    if (!matches.length) { warn(`${dist.label}: no source files matched`); continue; }

    console.log(`\n── ${dist.label} (${dist.dist}) ──`);
    statsByDist[dist.distKey] = [];
    for (const { file, year } of matches) {
      claimed.add(file);
      const stat = convertFile(family, dist, year, path.join(dir, file), warn, seenContent);
      if (!stat) continue;
      statsByDist[dist.distKey].push(stat);
      totalRows += stat.n; totalFiles++;
      const wm = stat.winM ? `♂ ${fmtSec(stat.winM.sec)} ${stat.winM.name}` : '♂ —';
      const ww = stat.winW ? `♀ ${fmtSec(stat.winW.sec)} ${stat.winW.name}` : '♀ —';
      const skipped = stat.dnf ? ` · ${stat.dnf} non-finish` : '';
      console.log(`  ${year}: ${String(stat.n).padStart(4)} finishers (${stat.men}M / ${stat.women}W) · median ${fmtSec(stat.median)} · ${wm} · ${ww}${skipped}`);
    }
  }

  // Any source file no distance claimed is data that would silently not ingest.
  const unclaimed = files.filter(f => /\.csv$/i.test(f) && !claimed.has(f));
  if (unclaimed.length) warn(`${unclaimed.length} CSV(s) matched no distance pattern: ${unclaimed.join(', ')}`);
  const nonCsv = files.filter(f => !/\.csv$/i.test(f));
  if (nonCsv.length) console.log(`\n  (${nonCsv.length} non-CSV source(s) not ingested: ${nonCsv.join(', ')})`);

  // ── PDF sources ───────────────────────────────────────────────────────────
  // Only for editions the CSVs cannot supply. A PDF is a worse source than a
  // CSV — its text layer loses the odd surname — so it is used where there is
  // no alternative, never in preference. Each table is attributed by its
  // HEADING; an unrecognised heading halts the family rather than guessing,
  // because filename-derived distances are exactly what made these files
  // dangerous in the first place.
  if (family.pdf) {
    for (const take of family.pdf.take) {
      const dist = family.distances.find(d => d.distKey === take.distKey);
      if (!dist) throw new Error(`pdf.take names unknown distKey "${take.distKey}"`);
      console.log(`
── ${dist.label} (${dist.dist}) · from PDF ──`);
      for (const year of take.years) {
        const pdfPath = path.join(dir, family.pdf.file(year));
        if (!fs.existsSync(pdfPath)) { warn(`${family.pdf.file(year)}: not found`); continue; }

        const tables = splitByHeading(pdfLines(pdfPath), taupoHeadingOf, resolveTaupoHeading, parseTaupoRow);
        const unknown = tables.filter(x => x.note === 'UNRECOGNISED');
        if (unknown.length) {
          throw new Error(`${family.pdf.file(year)}: ${unknown.length} table(s) with an unrecognised heading `
            + `(${unknown.map(x => JSON.stringify(x.label)).join(', ')}) — refusing to attribute by guesswork`);
        }
        console.log('');
        console.log(describeSplit(family.pdf.file(year), tables));

        const table = tables.find(x => x.distKey === take.distKey);
        if (!table) { warn(`${family.pdf.file(year)}: no "${take.distKey}" table`); continue; }

        const incomplete = [];
        const rows = table.rows.map(r => {
          if (!/\s/.test(r.name)) incomplete.push(r);
          return {
            pos: r.pos,
            name: titleCase(clean(r.name)),
            bib: parseBib(r.bibRaw),
            nat: '',
            cat: buildCat(r.ageGroup, r.gender, ''),
            club: r.club || '—',
            time: fmtSec(toSec(r.time)),
            sec: toSec(r.time),
          };
        }).filter(r => r.sec > 0 && r.name);
        if (incomplete.length) {
          warn(`${family.pdf.file(year)} ${take.distKey}: ${incomplete.length} name(s) have no surname in the PDF text layer`);
          for (const r of incomplete) {
            INCOMPLETE_RECORDS.push({
              recordId: `${family.raceSlug}:${year}:${dist.distId}:p${r.pos}:${toSec(r.time)}`,
              race: dist.label, year, name: titleCase(clean(r.name)), bib: parseBib(r.bibRaw),
              issue: 'name-incomplete',
              detail: 'published without a surname in the PDF text layer',
              source: family.pdf.file(year),
            });
          }
        }

        const rel = `${family.pdf.file(year)} [${take.distKey}]`;
        maybeInvertNames(rows, rel, warn);
        const stat = finaliseAndWrite(family, dist, year, rows, rel, warn, {});
        if (!stat) continue;
        (statsByDist[dist.distKey] ??= []).push(stat);
        statsByDist[dist.distKey].sort((a, b) => a.year - b.year);
        totalRows += stat.n; totalFiles++;
        const wm = stat.winM ? `♂ ${fmtSec(stat.winM.sec)} ${stat.winM.name}` : '♂ —';
        const ww = stat.winW ? `♀ ${fmtSec(stat.winW.sec)} ${stat.winW.name}` : '♀ —';
        console.log(`  ${year}: ${String(stat.n).padStart(4)} finishers (${stat.men}M / ${stat.women}W) · median ${fmtSec(stat.median)} · ${wm} · ${ww}   [from PDF]`);
      }
    }
  }

  if (family.tsFile) writeDataFile(family, statsByDist);

  console.log(`\n  ${totalFiles} files · ${totalRows.toLocaleString()} rows written`);
  if (warnings.length) {
    console.log(`\n  ⚠️  ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`     · ${w}`);
  } else {
    console.log('\n  ✅ no warnings');
  }
  return { totalRows, totalFiles, warnings: warnings.length };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (!args.length) {
  console.error(`Usage: node scripts/roadToJson.mjs <family|--all>\n  families: ${Object.keys(ROAD_FAMILIES).join(', ')}`);
  process.exit(1);
}
const targets = args[0] === '--all' ? Object.keys(ROAD_FAMILIES) : args;
let warned = 0;
for (const t of targets) warned += convertFamily(t).warnings;

// Merge rather than overwrite: a single-family run must not drop the entries
// other families contributed on their own runs.
{
  const out = path.join(OUT_DIR, 'incomplete-records.json');
  const touchedRaces = new Set(targets.map(t => ROAD_FAMILIES[t]?.raceSlug).filter(Boolean));
  let prior = [];
  if (fs.existsSync(out)) {
    try { prior = JSON.parse(fs.readFileSync(out, 'utf8')).records ?? []; } catch { prior = []; }
  }
  const kept = prior.filter(r => !touchedRaces.has(String(r.recordId).split(':')[0]));
  const records = [...kept, ...INCOMPLETE_RECORDS]
    .sort((a, b) => a.recordId.localeCompare(b.recordId));
  fs.writeFileSync(out, JSON.stringify({
    note: 'Results the archive holds but knows to be incomplete. Recorded as published; '
        + 'flagged so they are not mistaken for ordinary data. A name without a surname '
        + 'cannot be matched to the rest of that person\'s results.',
    generatedBy: 'scripts/roadToJson.mjs',
    count: records.length,
    records,
  }, null, 2));
  console.log(`\n  → public/data/incomplete-records.json — ${records.length} known-incomplete record(s)`);
}

