#!/usr/bin/env node
/**
 * Does the PDF reader agree with the CSV on a year both of them cover?
 *
 * The 2023 and 2025 halves exist only as PDF, so there is nothing to check
 * them against directly. But several MARATHONS exist in both formats, and the
 * CSV-derived JSON is already in the archive and verified. If the reader
 * reproduces those marathons exactly — same finishers, same positions, same
 * times — then it can be trusted on the halves.
 *
 * This is the gate that catches the extraction mode being wrong. `-layout`
 * pairs each runner with another runner's time and would fail here loudly
 * instead of quietly shipping 2,000 mismatched results.
 *
 * Run: node scripts/verifyTaupoPdf.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { splitByHeading, describeSplit } from './lib/splitMultiEvent.mjs';
import { pdfLines, taupoHeadingOf, resolveTaupoHeading, parseTaupoRow } from './lib/taupoPdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'Race Files', 'Taupo Marathon');
const DATA = path.join(ROOT, 'public', 'data');

const toSec = (t) => {
  const p = t.split(':').map(Number);
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
};

let failures = 0;
console.log('\n── Taupō PDF reader verification ────────────────────────────');

for (const year of [2019, 2020, 2021, 2022, 2023, 2024]) {
  const pdf = path.join(PDF_DIR, `All Results - ${year}.pdf`);
  const csvJson = path.join(DATA, `results-taupo-mar-${year}.json`);
  if (!fs.existsSync(pdf) || !fs.existsSync(csvJson)) continue;

  const tables = splitByHeading(pdfLines(pdf), taupoHeadingOf, resolveTaupoHeading, parseTaupoRow);
  const mar = tables.find(t => t.distKey === 'mar');
  if (!mar) { console.log(`   ${year}: no marathon table found in PDF`); failures++; continue; }

  const csv = JSON.parse(fs.readFileSync(csvJson, 'utf8'));

  // Two different questions, kept apart deliberately.
  //
  // MIS-PARSING is a defect in this reader: a finisher the PDF contains but we
  // failed to read, or read at the wrong position or time. Any of these fails
  // the gate — the wrong-extraction-mode bug shows up here as thousands of
  // mismatched times.
  //
  // A NAME the PDF prints less completely than the CSV is not this reader's
  // doing. Position 286 of the 2024 marathon is literally "Sarah" in the PDF
  // and "Sarah Smeath-Armstrong" in the CSV. Counted and shown, not failed —
  // and it is why the CSV stays the preferred source wherever both exist.
  const norm = (s) => s.toLowerCase().normalize('NFC').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  const slot = (pos, sec) => `${pos}|${sec}`;
  const pdfBySlot = new Map(mar.rows.map(r => [slot(r.pos, toSec(r.time)), norm(r.name)]));
  const csvBySlot = new Map(csv.map(r => [slot(r.pos, r.sec), norm(r.name)]));

  const missing = [...csvBySlot.keys()].filter(k => !pdfBySlot.has(k));
  const extra   = [...pdfBySlot.keys()].filter(k => !csvBySlot.has(k));
  const nameDiff = [...csvBySlot].filter(([k, n]) => pdfBySlot.has(k) && pdfBySlot.get(k) !== n);

  const ok = missing.length === 0 && extra.length === 0;
  const nameNote = nameDiff.length ? ` · ${nameDiff.length} name(s) less complete in the PDF` : '';
  console.log(`   ${year} marathon: PDF ${mar.rows.length} · CSV ${csv.length} · ${ok ? '✅ every finisher matched on position and time' : `❌ ${missing.length} missing, ${extra.length} unexpected`}${nameNote}`);
  if (!ok) {
    failures++;
    for (const k of missing.slice(0, 3)) console.log(`        in CSV, not read from PDF: ${csvBySlot.get(k)} @ ${k}`);
    for (const k of extra.slice(0, 3))   console.log(`        read from PDF, not in CSV: ${pdfBySlot.get(k)} @ ${k}`);
  }
  for (const [k, n] of nameDiff.slice(0, 2)) console.log(`        name: CSV "${n}" vs PDF "${pdfBySlot.get(k)}"`);
}

// Show what the splitter sees in a year that has everything, as evidence.
const sample = path.join(PDF_DIR, 'All Results - 2023.pdf');
if (fs.existsSync(sample)) {
  const tables = splitByHeading(pdfLines(sample), taupoHeadingOf, resolveTaupoHeading, parseTaupoRow);
  console.log('\n' + describeSplit('All Results - 2023.pdf', tables));
  const unattributed = tables.filter(t => t.note === 'UNRECOGNISED');
  if (unattributed.length) {
    console.log(`\n   ❌ ${unattributed.length} table(s) with an unrecognised heading — attribution must not be guessed`);
    failures++;
  }
}

console.log(`\n${failures === 0 ? '✅ PDF reader agrees with every CSV-sourced marathon' : `❌ ${failures} failure(s)`}`);
console.log('─────────────────────────────────────────────────────────────\n');
process.exit(failures === 0 ? 0 : 1);
