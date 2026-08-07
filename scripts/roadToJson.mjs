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
import { fileURLToPath } from 'url';
import { normalizeCat } from './normalizeCats.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const RACE_DIR = path.join(ROOT, 'Race Files');
const OUT_DIR  = path.join(ROOT, 'public', 'data');

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
      // "105K" is 10.5K, and it is the SAME event as the years published as
      // "10K": the two filename styles cover 2018/20/23/24/25 and 2017/19/22,
      // which together are exactly the year set of the 5K, half and marathon —
      // one slot in the programme, labelled inconsistently.
      //
      // The distance is recorded as 10 km on evidence, not on the filename:
      //   • 86 runners ran both a "10K" year and a "105K" year; median time
      //     ratio 0.984, where a genuinely 5% longer course would give ~1.05.
      //     So the two labels are the same course as each other.
      //   • Against known 10 km races elsewhere in the archive that course
      //     reads 1.077 — but Whanganui's half reads 1.068 and its marathon
      //     1.057 at KNOWN 21.1/42.2 km. The inflation is a property of this
      //     event and its field, not of the distance; a true 10.5 km would
      //     read ~1.12.
      // CURATION: if the organiser confirms a measured 10.5 km, split distKey
      // and the PBs computed from it change. Nothing else does.
      { distKey: '10k',  distId: '10k',  dist: '10 km',   label: 'Whanganui 10k',      match: [/^10K Results - (\d{4})\.csv$/i, /^105K Results - (\d{4})\.csv$/i] },
      { distKey: '5k',   distId: '5k',   dist: '5 km',    label: 'Whanganui 5k',       match: [/^5K Results - (\d{4})\.csv$/i] },
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

/** "1st", "23rd", "104" → 1, 23, 104. Non-numeric (DNF) → 0. */
function parsePos(raw) {
  const n = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

// ─── Column resolution by header name ────────────────────────────────────────

/** Header aliases, in preference order. Matching is case/space-insensitive. */
const COLUMNS = {
  pos:     ['position', 'place', 'pos', 'overall'],
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
    const m = cat.match(/^([MWF])\s*(.*)$/i);
    if (m) {
      const letter = m[1].toUpperCase() === 'F' ? 'W' : m[1].toUpperCase();
      const rest = m[2].trim();
      return normalizeCat(rest ? `${letter} ${rest}` : letter);
    }
    // Category without a gender prefix ("40-44") — take gender from its column.
    if (g) return normalizeCat(`${g} ${cat}`);
    return normalizeCat(cat);
  }
  const age = clean(rawAge);
  if (g && age && /^\d{1,3}$/.test(age)) return `${g} ${age}`;
  if (g) return g;
  return '—';
}

// ─── Conversion ──────────────────────────────────────────────────────────────

function convertFile(family, dist, year, filePath, warn) {
  const raw = fs.readFileSync(filePath, 'utf8');
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
      const stat = convertFile(family, dist, year, path.join(dir, file), warn);
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
process.exit(warned ? 0 : 0);
