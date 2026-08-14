/**
 * Multi-event source splitter.
 *
 * WHY THIS EXISTS. Several Wave 1 families publish one file containing more
 * than one event, and the failure mode is the worst kind this archive has:
 * runners credited with a distance they never ran. Taupō's 2025 marathon CSV
 * carried seven appended top-10 leaderboards, which taken whole made a
 * 17-minute run the marathon course record.
 *
 * Three sources of evidence, in descending order of reliability. Always use
 * the strongest one a file offers:
 *
 *   1. COLUMN   — the source states the event per row (Huntly's `Course`).
 *                 Nothing is inferred; use it and skip the heuristics.
 *   2. HEADING  — the source names each table (Taupō's PDF sections). The
 *                 distance comes from the heading, never from the filename.
 *   3. SEQUENCE — no label at all, but each table restarts its positions at 1.
 *                 The weakest signal, and only safe where one table dominates.
 *
 * NO SILENT ATTRIBUTION. A table whose event cannot be determined is returned
 * unattributed with its evidence, and the caller must stop rather than guess.
 * Every split reports what it saw so the decision is auditable after the fact.
 */

/**
 * @typedef {Object} SplitTable
 * @property {string} evidence   'column' | 'heading' | 'sequence'
 * @property {string} label      the raw heading / column value / '' for sequence
 * @property {any[]}  rows
 * @property {string|null} distKey resolved distance key, or null if unattributed
 * @property {string} [note]     why it was excluded, when distKey is null
 */

/**
 * Split rows by a per-row event value — the strongest evidence, because the
 * source is stating the event rather than implying it.
 *
 * @param {any[]} rows
 * @param {(row:any)=>string} valueOf      reads the course/event cell
 * @param {(label:string)=>({distKey:string}|{exclude:string}|null)} resolve
 */
export function splitByColumn(rows, valueOf, resolve) {
  const groups = new Map();
  for (const r of rows) {
    const label = String(valueOf(r) ?? '').trim();
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(r);
  }
  return [...groups].map(([label, rs]) => attribute('column', label, rs, resolve));
}

/**
 * Split a stream of lines into labelled sections, where a heading line marks
 * the start of each. Used for the PDF exports, whose sections are named.
 *
 * @param {string[]} lines
 * @param {(line:string)=>string|null} headingOf  returns the heading text, or null
 * @param {(label:string)=>({distKey:string}|{exclude:string}|null)} resolve
 * @param {(line:string)=>any|null} parseRow
 */
export function splitByHeading(lines, headingOf, resolve, parseRow) {
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const h = headingOf(line);
    if (h !== null) {
      cur = { label: h, rows: [] };
      sections.push(cur);
      continue;
    }
    if (!cur) continue; // preamble before the first heading
    const row = parseRow(line);
    if (row) cur.rows.push(row);
  }
  return sections
    .filter(s => s.rows.length)
    .map(s => attribute('heading', s.label, s.rows, resolve));
}

/**
 * Split where the position sequence RESTARTS AT 1. The restart is a return to
 * 1, NOT merely a decrease: an out-of-order or unparseable row is a stray
 * inside one table, and treating it as a new table discards real finishers.
 *
 * Returns every block; the caller decides whether one dominates enough to keep
 * (see dominantBlock) because that judgement depends on what the file is.
 *
 * @param {any[]} rows
 * @param {(row:any)=>number} posOf
 */
export function splitBySequence(rows, posOf) {
  const blocks = [];
  let cur = [];
  for (const r of rows) {
    if (posOf(r) === 1 && cur.length) { blocks.push(cur); cur = []; }
    cur.push(r);
  }
  if (cur.length) blocks.push(cur);
  return blocks.map(rs => ({ evidence: 'sequence', label: '', rows: rs, distKey: null }));
}

/**
 * The leading block, when it outweighs the largest other block `factor`-fold.
 *
 * Scale, not proportion. An appended extract is a ten-row leaderboard beside a
 * full field; blocks of comparable size are two real fields in one file, which
 * cannot be attributed without a label and must not be guessed at. A 90%
 * share threshold, tried first, discarded 518 genuine finishers at 88%.
 *
 * @returns {{keep:any[], dropped:any[][]}|null} null when nothing dominates
 */
export function dominantBlock(blocks, factor = 10) {
  if (blocks.length <= 1) return { keep: blocks[0]?.rows ?? [], dropped: [] };
  const lead = blocks[0].rows;
  const tail = blocks.slice(1).map(b => b.rows);
  const largest = Math.max(...tail.map(t => t.length));
  if (lead.length < factor * largest) return null;
  return { keep: lead, dropped: tail };
}

function attribute(evidence, label, rows, resolve) {
  const r = resolve(label);
  if (r && 'distKey' in r) return { evidence, label, rows, distKey: r.distKey };
  if (r && 'exclude' in r) return { evidence, label, rows, distKey: null, note: r.exclude };
  return { evidence, label, rows, distKey: null, note: 'UNRECOGNISED' };
}

/** Human-readable split report, so an attribution can be audited later. */
export function describeSplit(sourceName, tables) {
  const lines = [`${sourceName}: ${tables.length} table(s)`];
  for (const t of tables) {
    const what = t.distKey ? `→ ${t.distKey}` : `→ NOT INGESTED (${t.note})`;
    lines.push(`    ${String(t.rows.length).padStart(5)} rows  [${t.evidence}] ${JSON.stringify(t.label)} ${what}`);
  }
  return lines.join('\n');
}
