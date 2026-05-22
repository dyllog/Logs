#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../public/data');
const OUT_FILE = path.join(DATA_DIR, 'search-index.json');

const REGISTRY = [
  { name: 'Michael Voss',         slug: 'michael-voss',         aliases: [] },
  { name: 'Daniel Balchin',       slug: 'daniel-balchin',       aliases: [] },
  { name: 'Cameron Graves',       slug: 'cameron-graves',       aliases: ['Cam Graves'] },
  { name: 'Oska Inkster-Baynes',  slug: 'oska-inkster-baynes',  aliases: ['Oska Baynes'] },
  { name: 'Christopher Dryden',   slug: 'christopher-dryden',   aliases: [] },
  { name: 'Jonathan Jackson',     slug: 'jonathan-jackson',     aliases: ['Jono Jackson'] },
  { name: 'Blair McWhirter',      slug: 'blair-mcwhirter',      aliases: [] },
  { name: 'Aaron Pulford',        slug: 'aaron-pulford',        aliases: [] },
  { name: 'Daniel Jones',         slug: 'daniel-jones',         aliases: [] },
  { name: 'Ciaran Faherty',       slug: 'ciaran-faherty',       aliases: [] },
  { name: 'Hiro Tanimoto',        slug: 'hiro-tanimoto',        aliases: ['Hirotaka Tanimoto'] },
  { name: 'Fabe Downs',           slug: 'fabe-downs',           aliases: ['Fabian Downs'] },
  { name: 'Cullern Thorby',       slug: 'cullern-thorby',       aliases: [] },
  { name: 'Casey Thorby',         slug: 'casey-thorby',         aliases: [] },
  { name: 'Jack Moody',           slug: 'jack-moody',           aliases: [] },
  { name: 'Brent Godfrey',        slug: 'brent-godfrey',        aliases: [] },
  { name: 'Ben Twyman',           slug: 'ben-twyman',           aliases: [] },
  { name: 'Dougal Thorburn',      slug: 'dougal-thorburn',      aliases: [] },
  { name: 'Orestas Rimkus',       slug: 'orestas-rimkus',       aliases: [] },
  { name: 'Brett Tingay',         slug: 'brett-tingay',         aliases: [] },
  { name: 'Mike Phillips',        slug: 'mike-phillips',        aliases: [] },
  { name: 'Scott Knowles',        slug: 'scott-knowles',        aliases: [] },
  { name: 'Dylan Logan',          slug: 'dylan-logan',          aliases: [] },
];

const registryNames = new Set(REGISTRY.map(r => r.name.toLowerCase()));
const aliasMap = new Map();
for (const r of REGISTRY) {
  aliasMap.set(r.name.toLowerCase(), { canonical: r.name, slug: r.slug });
  for (const a of r.aliases) {
    aliasMap.set(a.toLowerCase(), { canonical: r.name, slug: r.slug });
  }
}

const RACES = [
  { name: 'Auckland Marathon',           href: '/races/auckland-marathon',           dist: '42.2 · 21.1 · 11 · 5 km' },
  { name: 'Rotorua Marathon',            href: '/races/rotorua-marathon',            dist: '42.2 · 21.1 km' },
  { name: 'Christchurch Marathon',       href: '/races/christchurch-marathon',       dist: '42.2 · 21.1 km' },
  { name: 'Queenstown Marathon',         href: '/races/queenstown-marathon',         dist: '42.2 · 21.1 km' },
  { name: "Hawke's Bay Marathon",        href: '/races/hawkes-bay-marathon',         dist: '42.2 · 21.1 km' },
  { name: 'Waterfront Half Marathon',    href: '/races/waterfront-half-marathon',    dist: '21.1 km' },
  { name: 'Devonport Half Marathon',     href: '/races/devonport-half-marathon',     dist: '21.1 · 10 km' },
  { name: 'Coatesville Half Marathon',   href: '/races/coatesville-half-marathon',   dist: '21.1 km' },
  { name: 'Omaha Half Marathon',         href: '/races/omaha-half-marathon',         dist: '21.1 km' },
];

// A name is valid if it looks like a real person's name
function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const t = name.trim();
  if (t.length < 4 || t.length > 60) return false;
  // Must contain at least one space (first + last name)
  if (!t.includes(' ')) return false;
  // No digits
  if (/\d/.test(t)) return false;
  // No quotes or angle brackets
  if (/["'<>]/.test(t)) return false;
  // Not all caps (catches "DNF", "DNS", "NZL" etc)
  if (t === t.toUpperCase()) return false;
  // No slash, backslash, comma at start
  if (/^[,\/\\]/.test(t)) return false;
  // No obvious placeholders
  const low = t.toLowerCase();
  if (['unknown', 'n/a', 'tbc', 'tba', 'team', 'relay'].some(x => low.includes(x))) return false;
  return true;
}

// Scan all result files
const counts = new Map(); // canonical name → count
const natMap  = new Map(); // canonical name → nat
const slugMap = new Map(); // canonical name → slug

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== 'search-index.json');
console.log(`Scanning ${files.length} result files…`);

for (const file of files) {
  let rows;
  try { rows = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')); }
  catch { continue; }
  if (!Array.isArray(rows)) continue;

  for (const row of rows) {
    const rawName = row.name;
    if (!isValidName(rawName)) continue;
    const lower = rawName.trim().toLowerCase();
    const reg   = aliasMap.get(lower);
    const canon = reg ? reg.canonical : rawName.trim();
    const slug  = reg ? reg.slug : undefined;

    counts.set(canon, (counts.get(canon) || 0) + 1);
    if (!natMap.has(canon) && row.nat && row.nat !== '—') natMap.set(canon, row.nat);
    if (slug && !slugMap.has(canon)) slugMap.set(canon, slug);
  }
}

// Keep registry entries always; keep others only with 2+ appearances
const athletes = [];
for (const [name, count] of counts) {
  const inRegistry = registryNames.has(name.toLowerCase());
  if (count < 2 && !inRegistry) continue;
  athletes.push({
    name,
    nat: natMap.get(name) || '—',
    slug: slugMap.get(name) || null,
  });
}

// Sort alphabetically by last name (last token), then first
athletes.sort((a, b) => {
  const aLast = a.name.split(' ').pop().toLowerCase();
  const bLast = b.name.split(' ').pop().toLowerCase();
  if (aLast !== bLast) return aLast < bLast ? -1 : 1;
  return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
});

console.log(`Indexed ${athletes.length} athletes (after filtering).`);

const index = { athletes, races: RACES };
const json = JSON.stringify(index);
fs.writeFileSync(OUT_FILE, json);
const kb = Math.round(json.length / 1024);
console.log(`Written to ${OUT_FILE} (${kb} KB, ${athletes.length} athletes)`);
