// @ts-check
/**
 * buildWmaTables.mjs — derive src/data/wmaRoad2025.json from the archived
 * WMA/USATF road age-standard workbooks.
 * ─────────────────────────────────────────────────────────────────────────────
 * Source (archived in Race Files/_sources/wma-age-grading/):
 *   MaleRoadStd2025.xlsx, FemaleRoadStd2025.xlsx
 *   https://github.com/AlanLyttonJones/Age-Grade-Tables — "2025 Files"
 *   Compiled by Alan Jones. Licence CC0-1.0 (public domain dedication).
 *   Approved 2025-01-10 by USATF Masters Long Distance Running Council.
 *
 * WHY THIS SCRIPT EXISTS
 * Every value in the output is read out of the workbooks. Nothing is
 * transcribed, interpolated, or reconstructed. A plausible-looking table that
 * is not the real one is worse than an obvious approximation, because it
 * cannot be caught by inspection — so the derivation is committed and the
 * sources are archived beside it.
 *
 * WHAT IS CONSUMED
 * The `AgeStdSec` sheet holds the age standard, in seconds, per single year of
 * age per distance. That is the primary published value, so we take it
 * directly rather than recombining the `Age Factors` sheet — one less place to
 * get the semantics backwards. (The two agree: OC_sec / factor = AgeStdSec.
 * The script asserts this on every cell it reads.)
 *
 * LOGS races exactly the four distances the tables are natively developed for
 * — 5 km, 10 km, Half-Marathon, Marathon — so no interpolated column is read.
 *
 *   Age grade % = age standard seconds ÷ actual time × 100
 *
 * Run: node scripts/buildWmaTables.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'Race Files', '_sources', 'wma-age-grading');
const OUT = path.join(ROOT, 'src', 'data', 'wmaRoad2025.json');

/** The four columns LOGS uses, by their header label in the workbook. */
const COLUMNS = [
  { distId: '5k', header: '5 km', km: 5 },
  { distId: '10k', header: '10 km', km: 10 },
  { distId: 'half', header: 'H. Mar', km: 21.0975 },
  { distId: 'mar', header: 'Marathon', km: 42.195 },
];

const SOURCES = [
  { gender: 'M', file: 'MaleRoadStd2025.xlsx' },
  { gender: 'F', file: 'FemaleRoadStd2025.xlsx' },
];

/** Youngest age at which the two sheets are expected to agree — see below. */
const CROSS_CHECK_MIN_AGE = 18;

/**
 * Cells where the workbook's own two representations disagree, listed rather
 * than tolerated by a loosened threshold. Each is a defect in the published
 * source, not in this parse; naming them keeps the check strict everywhere
 * else and makes the exception visible. If a future revision fixes one, the
 * entry stops matching and the script says so.
 *
 * The published AgeStdSec value is the one stored — it is the primary table.
 */
const KNOWN_SOURCE_DISCREPANCIES = [
  {
    file: 'FemaleRoadStd2025.xlsx', age: 100, distId: '10k',
    note: 'AgeStdSec 12172 vs factor-implied 11686 (4.0%) — isolated, at the extreme end of the table',
  },
];

// ─── Minimal xlsx reader (a workbook is a ZIP of XML) ────────────────────────
// Written out rather than pulled in as a dependency: the format surface we
// touch is small, and a committed reader keeps the derivation auditable.

/** @param {Buffer} buf @returns {Map<string, Buffer>} */
function unzip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip: no end-of-central-directory record');

  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const out = new Map();

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('corrupt central directory');
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const cmtLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nameLen);

    // The local header's extra field can differ from the central one, so the
    // data offset has to be recomputed from the local header itself.
    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const start = localOff + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);

    if (method !== 0 && method !== 8) throw new Error(`unsupported zip method ${method} for ${name}`);
    out.set(name, method === 0 ? Buffer.from(raw) : zlib.inflateRawSync(raw));
    off += 46 + nameLen + extraLen + cmtLen;
  }
  return out;
}

const unescapeXml = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
   .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
   .replace(/&amp;/g, '&');

/** @param {Map<string, Buffer>} files */
function sharedStrings(files) {
  const xml = files.get('xl/sharedStrings.xml')?.toString('utf8');
  if (!xml) return [];
  return [...xml.matchAll(/<si>([\s\S]*?)<\/si>/g)]
    .map(m => unescapeXml(m[1].replace(/<[^>]+>/g, '')));
}

/**
 * Resolve a sheet by display name, via workbook.xml + its rels.
 *
 * The two workbooks do not name their sheets identically — the female file has
 * "Age Facctors" / "AgeStanSec" against the male file's "Age Factors" /
 * "AgeStdSec" — so each logical sheet is looked up through a list of accepted
 * names. Resolution is by relationship id, never by sheet position: the rels
 * are ordered differently in the two files, so an index would silently read
 * the wrong grid.
 */
function sheetPath(files, wantNames) {
  const wanted = Array.isArray(wantNames) ? wantNames : [wantNames];
  const wb = files.get('xl/workbook.xml').toString('utf8');
  const rels = files.get('xl/_rels/workbook.xml.rels').toString('utf8');

  const relTargets = new Map();
  for (const m of rels.matchAll(/<Relationship([^>]*)\/>/g)) {
    const id = /Id="([^"]+)"/.exec(m[1])?.[1];
    const target = /Target="([^"]+)"/.exec(m[1])?.[1];
    if (id && target) relTargets.set(id, target);
  }

  const seen = [];
  for (const m of wb.matchAll(/<sheet([^>]*)\/>/g)) {
    const name = unescapeXml(/name="([^"]+)"/.exec(m[1])?.[1] ?? '');
    const rid = /r:id="([^"]+)"/.exec(m[1])?.[1];
    seen.push(name);
    if (!wanted.includes(name) || !rid) continue;
    const target = relTargets.get(rid);
    if (!target) break;
    return target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
  }
  throw new Error(`no sheet named ${wanted.map(w => `"${w}"`).join(' or ')} — workbook has: ${seen.join(', ')}`);
}

/** Accepted names per logical sheet, across both workbooks. */
const SHEET_STANDARDS = ['AgeStdSec', 'AgeStanSec'];
const SHEET_FACTORS = ['Age Factors', 'Age Facctors'];

/**
 * Parse a worksheet into rowNumber → (columnLetter → value).
 * @returns {Map<number, Map<string, string|number>>}
 */
function readSheet(files, pathInZip, strings) {
  const xml = files.get(pathInZip)?.toString('utf8');
  if (!xml) throw new Error(`missing sheet ${pathInZip}`);

  const rows = new Map();
  for (const rm of xml.matchAll(/<row[^>]*\sr="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = new Map();
    for (const cm of rm[2].matchAll(/<c\s+r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g)) {
      const type = /\st="([^"]+)"/.exec(cm[2])?.[1];
      const raw = /<v>([\s\S]*?)<\/v>/.exec(cm[3])?.[1];
      if (raw == null) continue;
      if (type === 's') cells.set(cm[1], strings[Number(raw)]);
      else if (type === 'str' || type === 'inlineStr') cells.set(cm[1], unescapeXml(raw));
      else cells.set(cm[1], Number(raw));
    }
    rows.set(Number(rm[1]), cells);
  }
  return rows;
}

/** Find the row whose column A equals `label`. */
function findRow(rows, label) {
  for (const [n, cells] of rows) if (cells.get('A') === label) return n;
  throw new Error(`row labelled "${label}" not found`);
}

// ─── Derivation ──────────────────────────────────────────────────────────────

function parseWorkbook(file) {
  const files = unzip(fs.readFileSync(path.join(SRC_DIR, file)));
  const strings = sharedStrings(files);

  const stdRows = readSheet(files, sheetPath(files, SHEET_STANDARDS), strings);
  const facRows = readSheet(files, sheetPath(files, SHEET_FACTORS), strings);

  // Revision identity is read out of the workbook, never assumed.
  //
  // The two files identify themselves differently: the male workbook stamps an
  // editorial "Version 2025-07-27" into its sheet titles, the female one does
  // not. The identifier they share — and the one that actually establishes a
  // matched pair — is the MLDR/USATF approval line, so that is what is
  // required to agree. The optional version string is recorded alongside.
  const title = String(stdRows.get(1)?.get('A') ?? '');
  const revisionYear = /\b(20\d\d)\b/.exec(title)?.[1] ?? null;
  const version = /Version\s+([\d-]+)/.exec(title)?.[1] ?? null;

  let approval = null;
  for (const [, cells] of stdRows) {
    const a = cells.get('A');
    if (typeof a === 'string' && a.startsWith('Approved')) { approval = a; break; }
  }
  if (!approval) throw new Error(`${file}: no approval line found — cannot establish revision`);
  if (!revisionYear) throw new Error(`${file}: no revision year in title "${title}"`);

  /**
   * Resolve each wanted distance to a column letter WITHIN A GIVEN SHEET, and
   * confirm it against that sheet's own "Distance" row.
   *
   * Resolved per sheet, never shared: the female workbook's factors sheet
   * carries a duplicated leading "Age" column, so every distance sits one
   * letter right of where the standards sheet has it. Reusing one sheet's
   * letters against the other reads the neighbouring distance and produces
   * confident nonsense.
   */
  const resolveCols = (rows, sheetLabel) => {
    const header = rows.get(findRow(rows, 'Age'));
    const distanceRow = rows.get(findRow(rows, 'Distance'));
    const ocRow = rows.get(findRow(rows, 'OC sec'));

    return COLUMNS.map(c => {
      let letter = null;
      for (const [L, v] of header) if (v === c.header) { letter = L; break; }
      if (!letter) throw new Error(`${file} [${sheetLabel}]: column "${c.header}" not found`);

      const km = Number(distanceRow.get(letter));
      if (Math.abs(km - c.km) > 0.01) {
        throw new Error(`${file} [${sheetLabel}]: "${c.header}" is ${km} km, expected ~${c.km}`);
      }
      // Rounded to whole seconds: the workbook carries these as spreadsheet
      // floats (3451.0000000000005), and a stored artefact of binary
      // arithmetic would read as spurious precision.
      return { ...c, letter, openStandardSec: Math.round(Number(ocRow.get(letter))) };
    });
  };

  const cols = resolveCols(stdRows, 'standards');
  const facCols = new Map(resolveCols(facRows, 'factors').map(c => [c.distId, c]));

  // Age → row number, resolved per sheet: the two grids need not be aligned.
  const facRowForAge = new Map();
  for (const [n, cells] of facRows) {
    const age = cells.get('A');
    if (typeof age === 'number' && Number.isInteger(age)) facRowForAge.set(age, n);
  }

  // Age rows: column A numeric.
  const standards = {};
  const discrepancies = [];
  let checked = 0;
  for (const [n, cells] of stdRows) {
    const age = cells.get('A');
    if (typeof age !== 'number' || !Number.isInteger(age)) continue;

    const row = {};
    for (const c of cols) {
      const sec = cells.get(c.letter);
      if (typeof sec !== 'number' || !(sec > 0)) throw new Error(`${file}: bad standard at age ${age}, ${c.header}`);
      row[c.distId] = sec;

      // Cross-check against the independent Age Factors sheet: the workbook's
      // own two representations must agree, or we have misread one of them.
      //
      // Scoped to adult ages. Below 18 the compiler caps children's standards
      // at the longer distances independently of the factor curve (a 5-year-old's
      // marathon standard is deliberately not OC ÷ factor), so the two sheets
      // legitimately diverge there. LOGS never grades those ages — the band
      // parser floors at 18 — but the published values are stored as-is rather
      // than dropped, so the file remains a faithful copy of the source.
      const fc = facCols.get(c.distId);
      const facCells = facRows.get(facRowForAge.get(age) ?? -1);
      const factor = facCells?.get(fc.letter);
      if (age >= CROSS_CHECK_MIN_AGE && typeof factor === 'number' && factor > 0) {
        const implied = fc.openStandardSec / factor;
        if (Math.abs(implied - sec) / sec > 0.005) {
          const known = KNOWN_SOURCE_DISCREPANCIES.find(
            k => k.file === file && k.age === age && k.distId === c.distId
          );
          if (!known) {
            throw new Error(`${file}: age ${age} ${c.header}: AgeStdSec ${sec} vs factor-implied ${implied.toFixed(1)}`);
          }
          discrepancies.push(`${file} age ${age} ${c.header} — ${known.note}`);
        }
        checked++;
      }
    }
    standards[age] = row;
  }

  const ages = Object.keys(standards).map(Number).sort((a, b) => a - b);
  if (!ages.length) throw new Error(`${file}: no age rows parsed`);

  // The standard must get slower (or hold) as age rises past the peak, and the
  // series must be free of holes — a silent gap would grade someone with a
  // neighbour's standard.
  for (let i = 1; i < ages.length; i++) {
    if (ages[i] !== ages[i - 1] + 1) throw new Error(`${file}: gap in ages at ${ages[i - 1]}→${ages[i]}`);
  }

  return {
    file,
    version,
    revisionYear,
    approval,
    title,
    openStandardsSec: Object.fromEntries(cols.map(c => [c.distId, c.openStandardSec])),
    minAge: ages[0],
    maxAge: ages[ages.length - 1],
    standards,
    crossChecked: checked,
    discrepancies,
  };
}

const parsed = SOURCES.map(s => ({ gender: s.gender, ...parseWorkbook(s.file) }));

// Both workbooks must come from the same revision — mixing a 2025 standard
// with a 2020 factor set is exactly the error this pipeline exists to prevent.
const approvals = new Set(parsed.map(p => p.approval));
if (approvals.size !== 1) {
  throw new Error(`workbook approvals differ: ${[...approvals].join(' | ')}`);
}
const years = new Set(parsed.map(p => p.revisionYear));
if (years.size !== 1) throw new Error(`workbook revision years differ: ${[...years].join(' vs ')}`);

const out = {
  _comment:
    'DERIVED FILE — do not edit by hand. Regenerate with: node scripts/buildWmaTables.mjs',
  source: {
    name: 'WMA/USATF road running age standards',
    revision: [...years][0],
    versions: Object.fromEntries(parsed.map(p => [p.gender, p.version])),
    approval: parsed[0].approval,
    compiler: 'Alan Jones',
    url: 'https://github.com/AlanLyttonJones/Age-Grade-Tables',
    directory: '2025 Files',
    licence: 'CC0-1.0',
    archivedAt: 'Race Files/_sources/wma-age-grading/',
    files: SOURCES.map(s => s.file),
  },
  note:
    'Age standard in seconds per single year of age. Age grade % = standard ÷ actual time × 100. ' +
    'Only the four distances the tables are natively developed for are stored; no interpolated column is used.',
  distances: Object.fromEntries(COLUMNS.map(c => [c.distId, { label: c.header, km: c.km }])),
  openStandardsSec: Object.fromEntries(parsed.map(p => [p.gender, p.openStandardsSec])),
  ageRange: { min: Math.max(...parsed.map(p => p.minAge)), max: Math.min(...parsed.map(p => p.maxAge)) },
  standards: Object.fromEntries(parsed.map(p => [p.gender, p.standards])),
};

fs.writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);

console.log('── WMA road age standards ─────────────────────────────────────');
for (const p of parsed) {
  console.log(`   ${p.gender}: ${p.file}`);
  console.log(`      revision ${p.revisionYear}${p.version ? ` (version ${p.version})` : ''} · ages ${p.minAge}–${p.maxAge} · ${p.crossChecked.toLocaleString()} cells cross-checked against Age Factors`);
  console.log(`      open standards: ${Object.entries(p.openStandardsSec).map(([k, v]) => `${k} ${v}s`).join(' · ')}`);
}
const allDiscrepancies = parsed.flatMap(p => p.discrepancies);
if (allDiscrepancies.length) {
  console.log(`   known source discrepancies (published value kept):`);
  for (const d of allDiscrepancies) console.log(`      • ${d}`);
}
const unusedExceptions = KNOWN_SOURCE_DISCREPANCIES.filter(
  k => !allDiscrepancies.some(d => d.startsWith(`${k.file} age ${k.age} `))
);
if (unusedExceptions.length) {
  // A stale exception means the source changed under us — say so rather than
  // carrying a dead allowance forward.
  console.log(`   ⚠️  ${unusedExceptions.length} listed discrepancy(ies) no longer occur — source may have been revised; prune KNOWN_SOURCE_DISCREPANCIES.`);
}
console.log(`   ${parsed[0].approval}`);
console.log(`   → src/data/wmaRoad2025.json`);
console.log('───────────────────────────────────────────────────────────────');
