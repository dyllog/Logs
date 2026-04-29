/**
 * Normalise all result JSON files to the World Athletics / AIMS 5-year band standard.
 *
 * Standard output bands:
 *   M/W Elite
 *   M/W 18–19
 *   M/W 20–24  25–29  30–34  35–39  40–44  45–49  50–54  55–59  60–64  65–69  70–74  75+
 *
 * Broad historical bands that span multiple standard bands (e.g. "M 20–39") are kept as-is
 * because we lack individual birth years to split them.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'public', 'data');

export function normalizeCat(cat) {
  if (!cat || cat === '—') return cat;

  const m = cat.match(/^([MW])\s+(.+)$/);
  if (!m) return cat;
  const g = m[1];
  let rest = m[2].trim();

  if (/^elite$/i.test(rest)) return `${g} Elite`;
  if (/^open$/i.test(rest))  return `${g} Open`;

  // "Under 20" / "U20" → 18–19
  if (/^(under\s*20|u\s*20)$/i.test(rest)) return `${g} 18–19`;

  // Normalise hyphen-minus to en-dash throughout
  rest = rest.replace(/-/g, '–');

  // 15–19, 16–19 → 18–19
  if (/^1[456]–19$/.test(rest)) return `${g} 18–19`;

  // Any sub-18 start to 34 → 18–34 (historical broad band, retain)
  if (/^\d{1,2}–34$/.test(rest) && parseInt(rest, 10) < 18) return `${g} 18–34`;

  // 75–xx, 76–xx → 75+
  if (/^7[56]–\d+$/.test(rest)) return `${g} 75+`;

  // 80–xx, 85–xx, 90–xx → 75+
  if (/^[89]\d–/.test(rest)) return `${g} 75+`;

  // 80+, 85+, 90+ → 75+
  if (/^[89]\d\+$/.test(rest)) return `${g} 75+`;

  // Already "75+"
  if (rest === '75+') return `${g} 75+`;

  // All other bands: return with normalised en-dash
  return `${g} ${rest}`;
}

// ── Apply to every JSON file in public/data ───────────────────────────────────

let totalChanged = 0;
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = 0;
  const updated = rows.map(r => {
    const newCat = normalizeCat(r.cat);
    if (newCat !== r.cat) changed++;
    return { ...r, cat: newCat };
  });
  if (changed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(updated));
    console.log(`  ${file}: ${changed} rows updated`);
    totalChanged += changed;
  }
}

console.log(`\nDone — ${totalChanged} rows updated across ${files.length} files.`);

// Summary of unique categories remaining
const allCats = new Set();
for (const file of files) {
  JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')).forEach(r => allCats.add(r.cat));
}
console.log('\nUnique categories after normalisation:');
[...allCats].sort().forEach(c => console.log(' ', c));
