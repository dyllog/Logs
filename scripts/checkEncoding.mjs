#!/usr/bin/env node
/**
 * checkEncoding.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Encoding + mojibake gate for source files, run BEFORE conversion.
 *
 * Two different defects, deliberately reported apart, because they have
 * different causes and different fixes:
 *
 *  1. ENCODING — is the file actually UTF-8? A file that is really Windows-1252
 *     read as UTF-8 yields U+FFFD replacement characters. That is OUR bug and
 *     the converter must be told the right encoding.
 *
 *  2. MOJIBAKE — the file is valid UTF-8, but the text inside it was already
 *     mis-decoded before it reached us and the error was then saved as correct
 *     UTF-8. "RONÚ THOMPSON" is stored as C3 9A: a legitimate encoding of a
 *     wrong character. No amount of care on our side recovers that; it has to
 *     be re-sourced. Detecting it stops a contaminated family at import instead
 *     of it surfacing in a search index months later.
 *
 * The NZ stake: macrons. Read UTF-8 as Latin-1 and "ā" becomes "Ä". An archive
 * of New Zealand running that mangles Māori names has failed at more than data
 * hygiene, so macron-bearing files are reported explicitly as a positive check
 * rather than merely "not flagged".
 *
 *   node scripts/checkEncoding.mjs "Race Files/Hamilton Half Marathon"
 *   node scripts/checkEncoding.mjs            # every CSV under Race Files/
 *
 * Exit code 1 if any file trips the gate.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/**
 * Sequences that indicate text mis-decoded before it reached us.
 *
 * Deliberately anchored to letter context rather than matching bare accented
 * characters: "Ú" is a real letter in Spanish and Portuguese names, and a
 * detector that flags every one of them would be noise the moment an
 * international trail field lands. These patterns catch an accented capital
 * sitting mid-word among capitals, or the classic UTF-8-read-as-Latin-1 pairs.
 */
const MOJIBAKE = [
  { re: /[ÃÂ][-¿]/u, why: 'UTF-8 read as Latin-1 (Ã/Â + continuation byte)' },
  { re: /â€[“”˜™]/u, why: 'UTF-8 smart quote read as Latin-1 (â€™ / â€œ)' },
  { re: /[A-ZÀ-Þ]{2,}[ÆÚÕÐØÞ][A-ZÀ-Þ]/u, why: 'accented capital mid-word in an all-caps name (DOS codepage mis-decode)' },
  { re: /[a-zà-þ]+[ÆÚÕÐÞ][A-Za-z]/u, why: 'accented capital inside a lowercase word' },
  { re: /�/u, why: 'U+FFFD replacement character — file is NOT valid UTF-8' },
];

const MACRONS = /[āēīōūĀĒĪŌŪ]/u;

/** Is this byte buffer valid UTF-8? Decoding with fatal:true answers exactly. */
function isValidUtf8(buf) {
  try { new TextDecoder('utf-8', { fatal: true }).decode(buf); return true; }
  catch { return false; }
}

function scanFile(abs) {
  const buf = fs.readFileSync(abs);
  const hasBom = buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  const validUtf8 = isValidUtf8(buf);
  // Read the way the converters do, so what we scan is what they would import.
  const text = buf.toString('utf8').replace(/^﻿/, '');

  const hits = [];
  const seen = new Set();
  for (const line of text.split(/\r?\n/)) {
    for (const { re, why } of MOJIBAKE) {
      if (!re.test(line)) continue;
      const key = why + '|' + line.slice(0, 60);
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ why, sample: line.trim().slice(0, 70) });
      break;
    }
  }
  return { hasBom, validUtf8, macrons: MACRONS.test(text), hits, bytes: buf.length };
}

// ─── Collect targets ─────────────────────────────────────────────────────────
const arg = process.argv[2];
const base = arg ? path.resolve(ROOT, arg) : path.join(ROOT, 'Race Files');
const files = [];
(function walk(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.csv$/i.test(e.name)) files.push(p);
  }
})(base);

if (!files.length) {
  console.error(`❌  No CSV files found under ${path.relative(ROOT, base) || base}`);
  process.exit(1);
}

// ─── Scan ────────────────────────────────────────────────────────────────────
const bad = [], boms = [], withMacrons = [], notUtf8 = [];
for (const abs of files) {
  const rel = path.relative(ROOT, abs);
  const r = scanFile(abs);
  if (r.hasBom) boms.push(rel);
  if (!r.validUtf8) notUtf8.push(rel);
  if (r.macrons) withMacrons.push(rel);
  if (r.hits.length) bad.push({ rel, hits: r.hits });
}

console.log('');
console.log('── Source encoding check ──────────────────────────────────────');
console.log(`   Files scanned          : ${files.length}`);
console.log(`   Valid UTF-8            : ${files.length - notUtf8.length}/${files.length}`);
console.log(`   With UTF-8 BOM         : ${boms.length}   (stripped on read, never treated as content)`);
console.log(`   Containing macrons     : ${withMacrons.length}   (ā ē ī ō ū — must survive import exactly)`);
console.log(`   Files with mojibake    : ${bad.length}`);

if (notUtf8.length) {
  console.log('\n   ❌ NOT valid UTF-8 — converter is reading these wrongly:');
  for (const f of notUtf8.slice(0, 20)) console.log(`      ${f}`);
}

if (bad.length) {
  console.log('\n   ⚠️  Mojibake — text mis-decoded BEFORE it reached us and saved as');
  console.log('      valid UTF-8. Not recoverable by reading differently; the file');
  console.log('      needs re-sourcing. Ingesting it imports the corruption verbatim.\n');
  for (const b of bad.slice(0, 25)) {
    console.log(`      ${b.rel}`);
    for (const h of b.hits.slice(0, 3)) console.log(`         ${h.why}\n            ${h.sample}`);
  }
  if (bad.length > 25) console.log(`      … and ${bad.length - 25} more file(s)`);
}

if (withMacrons.length) {
  console.log('\n   ✅ Macron-bearing files (verify these round-trip):');
  for (const f of withMacrons.slice(0, 10)) console.log(`      ${f}`);
}

console.log('───────────────────────────────────────────────────────────────');
console.log('');

if (bad.length || notUtf8.length) {
  console.error(`❌  Gate failed: ${notUtf8.length} file(s) not UTF-8, ${bad.length} file(s) carrying mojibake.`);
  console.error('    Resolve or explicitly accept these before ingesting the family.');
  process.exit(1);
}
console.log('✅  No encoding defects detected.\n');
