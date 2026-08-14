/**
 * Taupō "All Results" PDF reader.
 *
 * These PDFs are the SOLE source for the 2023 and 2025 halves — the CSVs the
 * organiser shipped for those years are byte-identical copies of the marathon
 * files, an export error rather than a publication gap.
 *
 * EXTRACTION MODE MATTERS. `pdftotext -layout` interleaves the two column
 * blocks in this layout and pairs each runner with a DIFFERENT runner's time:
 * it renders the 2023 winner beside 2:54:48 where he actually ran 2:36:04.
 * `-raw` emits reading order and pairs correctly. The 2023 marathon appears in
 * both the PDF and a CSV, so extraction is verified against that known-good
 * file before the halves are trusted (scripts/verifyTaupoPdf.mjs).
 *
 * Row shape:
 *   1. 307 Nathan Tse Male (1) Male Open (20-39 Years) (1) 2:36:04
 *   ^pos ^bib ^name   ^gender  ^age group          ^agPos ^club? ^time
 */

import { execFileSync } from 'child_process';

/** Section heading → what the archive does with it. */
const HEADINGS = {
  'marathon run':      { distKey: 'mar' },
  'half marathon run': { distKey: 'half' },
  '10km run':          { distKey: '10k' },
  '5km run':           { distKey: '5k' },
  // Recognised and deliberately NOT ingested. LOGS is a running archive; a
  // walk is a different discipline over the same course, and merging the two
  // would put walkers into running fields and course records. Listed
  // explicitly so they are excluded by decision, not by falling through.
  'marathon walk':      { exclude: 'walk — different discipline' },
  'half marathon walk': { exclude: 'walk — different discipline' },
  '10km walk':          { exclude: 'walk — different discipline' },
  '5km walk':           { exclude: 'walk — different discipline' },
};

export function resolveTaupoHeading(label) {
  return HEADINGS[label.trim().toLowerCase()] ?? null;
}

const HEADING_RE = /^((?:Half )?Marathon|10 ?km|5 ?km)\s+(Run|Walk)$/i;

/** The heading text of a line, or null when the line is not a heading. */
export function taupoHeadingOf(line) {
  const m = line.trim().match(HEADING_RE);
  return m ? m[0] : null;
}

// The gender PLACE is optional. Some rows publish "Female Female Open (20-39
// Years) (105)" with no "(N)" after the gender at all — 34 such rows in the
// 2024 marathon alone. Requiring it silently dropped every one of them.
const ROW_RE = new RegExp(
  // The trailing dot is optional: it is present up to 2024 and gone from 2025,
  // which is the same edition the provider changed and started publishing
  // names surname-first.
  '^(\\d+)\\.?\\s+'                       // 1. position
  + '(\\S+)\\s+'                          // 2. bib
  + '(.*?)\\s+'                           // 3. name
  + '(Male|Female)(?:\\s+\\((\\d+)\\))?\\s+' // 4/5 gender + optional place
  + '(.*?)\\s+\\((\\d+)\\)'               // 6/7 age group + its place
  + '\\s*(.*?)\\s*'                       // 8 club (often empty)
  + '(\\d{1,2}:\\d{2}(?::\\d{2})?)$',     // 9 time
);

// "DNF 117 Angus Hayward ... 3:58:41" — a declared non-finisher WITH a time.
// The PDF is what makes this legible; the CSV renders the same entrant with an
// unparseable position that looks like a formatting quirk.
const NON_FINISH_RE = /^\s*(DNF|DNS|DQ|DSQ|DNQ)\b/i;

/** True when the line is a result the organiser marked as not finished. */
export function isTaupoNonFinisher(line) {
  return NON_FINISH_RE.test(line.trim());
}

/** Parse one result line, or null if it is not one (or is a non-finisher). */
export function parseTaupoRow(line) {
  if (isTaupoNonFinisher(line)) return null;
  const m = line.trim().match(ROW_RE);
  if (!m) return null;
  return {
    pos:      parseInt(m[1], 10),
    bibRaw:   m[2],
    name:     m[3].trim(),
    gender:   m[4],
    ageGroup: m[6].trim(),
    club:     (m[8] || '').trim(),
    time:     m[9],
  };
}

/** Every line of a PDF, in reading order. */
/**
 * Every line of a PDF, in reading order.
 *
 * `-enc UTF-8` is not optional: this build of pdftotext defaults to an
 * encoding that DROPS diacritics silently, rendering "Andris Pētersons" as
 * "Andris Ptersons". Given how much of this archive's name handling exists to
 * carry macrons intact, losing them at the point of extraction would undo it
 * at the source.
 */
export function pdfLines(pdfPath) {
  const out = execFileSync('pdftotext', ['-enc', 'UTF-8', '-raw', pdfPath, '-'], {
    encoding: 'utf8', maxBuffer: 1 << 28,
  });
  return out.replace(/\r\n/g, '\n').split('\n');
}
