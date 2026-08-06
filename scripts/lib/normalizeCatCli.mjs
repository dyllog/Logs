#!/usr/bin/env node
/**
 * normalizeCatCli.mjs — expose normalizeCat() to non-JS converters.
 *
 * Reads a JSON array of raw category strings on stdin, writes a JSON object
 * mapping each input to its normalised form on stdout.
 *
 *   echo '["M 35-39","W 75+"]' | node scripts/lib/normalizeCatCli.mjs
 *   → {"M 35-39":"M 35–39","W 75+":"W 75+"}
 *
 * WHY THIS EXISTS
 * dunedinPdfToJson.py is Python (the source is PDF, and pdfplumber has no JS
 * equivalent worth carrying), but the archive has exactly one authority on
 * category spelling: normalizeCat in scripts/normalizeCats.mjs. Re-implementing
 * its rules in Python would create a second authority that silently drifts —
 * the hyphen/en-dash split is precisely the failure that motivated this.
 * So the Python side shells out here once per file, passing the distinct bands.
 */

import { normalizeCat } from '../normalizeCats.mjs';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw || '[]');
  } catch (err) {
    process.stderr.write(`normalizeCatCli: stdin is not valid JSON — ${err.message}\n`);
    process.exit(1);
  }
  if (!Array.isArray(input)) {
    process.stderr.write('normalizeCatCli: expected a JSON array of strings\n');
    process.exit(1);
  }
  const out = {};
  for (const cat of input) out[cat] = normalizeCat(cat);
  process.stdout.write(JSON.stringify(out));
});
