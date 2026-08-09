/**
 * The archive's one CSV parser.
 *
 * WHY THIS EXISTS. Seven converters split each line on `,`. That is correct
 * until a field is quoted and contains a comma — a name entered as
 * `"Wing Chuen, Kevin"` — at which point every column after it shifts by one
 * and the row still parses. It does not throw; it produces a plausible-looking
 * finisher with the bib in the time field, the time in the category field, and
 * a name truncated at the comma:
 *
 *   {"name":"\"WINGCHUEN", "cat":"M 2:04:25", "time":"2487", "sec":0}
 *
 * Twelve such rows reached the archive across six files. They were invisible
 * because a shifted row looks like data, not like an error — the same failure
 * shape as the stale race-key maps. Fixing it once here, rather than in each
 * converter, is what stops the next ingestion wave inheriting it.
 *
 * Handles: quoted fields, escaped quotes (`""`), embedded commas, embedded
 * newlines inside quotes, and a UTF-8 BOM. Blank lines are dropped, matching
 * what the line-splitting converters did.
 */

/**
 * Parse CSV text into a grid of rows of raw string cells.
 * Row 0 is the header, exactly as with the line-splitting it replaces, so a
 * converter keeps its existing column indexes.
 *
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsvGrid(text) {
  const rows = [];
  let field = '', row = [], inQuotes = false;
  const src = String(text ?? '').replace(/^﻿/, '');
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

export default parseCsvGrid;
