const fs = require('fs');
const path = require('path');
const { mapRaceCategory } = require('./scripts/lib/categoryCodes.cjs');

const BASE = path.join(path.resolve('.'), 'Race Files', 'Auckland Half Marathon Series', 'Omaha Half Marathon');
const OUT  = path.join(path.resolve('.'), 'public', 'data');

// Collect any category codes the shared decoder can't parse so the import fails
// loudly instead of silently corrupting bands (the original Omaha "70+" bug).
const unknownCats = new Map();
const noteUnknown = raw => unknownCats.set(raw, (unknownCats.get(raw) || 0) + 1);

function parseCsv(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const rows = [];
  for (const line of lines) {
    const cols = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

function toSec(t) {
  const parts = t.replace(/^0+/, '').split(':').map(Number);
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*60  + parts[1];
  return 0;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a,b) => a-b);
  const mid = Math.floor(s.length/2);
  return s.length % 2 ? s[mid] : Math.round((s[mid-1]+s[mid])/2);
}

function avg(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
}

// ------- half -------
const halfYears = [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
const halfStats = [];

for (const year of halfYears) {
  const file = path.join(BASE, `Omaha Half Marathon - Half Results - ${year}.csv`);
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const header = rows[0].map(h => h.toLowerCase());
  const posI  = header.indexOf('position');
  const nameI = header.indexOf('name');
  const bibI  = header.indexOf('bib');
  const timeI = header.indexOf('time');
  const catI  = header.indexOf('category');
  const genI  = header.indexOf('gender');

  const results = [];
  const menSec=[], womenSec=[], allSec=[];

  for (const r of rows.slice(1)) {
    if (!r[posI]) continue;
    const sec = toSec(r[timeI]);
    if (!sec) continue;
    const gender = (r[genI]||'').toLowerCase();
    const isMale = gender === 'male' || gender === 'm';
    const catRaw = catI >= 0 ? (r[catI]||'') : '';
    const cat = catI >= 0
      ? mapRaceCategory(catRaw, r[genI]||'', noteUnknown)
      : (isMale ? 'M' : 'W');
    results.push({ pos: +r[posI], bib: r[bibI]||'', name: r[nameI]||'', nat:'NZL', cat, catRaw, club:'—', time: r[timeI], sec });
    allSec.push(sec);
    if (isMale) menSec.push(sec); else womenSec.push(sec);
  }

  fs.writeFileSync(path.join(OUT, `results-omaha-half-${year}.json`), JSON.stringify(results));
  console.log(`half ${year}: ${results.length} finishers`);

  const menSorted  = [...menSec].sort((a,b)=>a-b);
  const womenSorted = [...womenSec].sort((a,b)=>a-b);
  halfStats.push({
    year,
    finishers: results.length,
    avg: median(allSec),
    avgMen: median(menSec),
    avgWomen: median(womenSec),
    winnerM: menSorted[0]||0,
    winnerW: womenSorted[0]||0,
    top10M: avg(menSorted.slice(0,10)),
    top10W: avg(womenSorted.slice(0,10)),
  });
}

// ------- 10k -------
const k10Years = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
const k10Stats = [];

for (const year of k10Years) {
  const file = path.join(BASE, `Omaha Half Marathon - 10k Results - ${year}.csv`);
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const header = rows[0].map(h => h.toLowerCase());
  const posI  = header.indexOf('position');
  const nameI = header.indexOf('name');
  const bibI  = header.indexOf('bib');
  const timeI = header.indexOf('time');
  const catI  = header.indexOf('category');
  const genI  = header.indexOf('gender');

  const results = [];
  const menSec=[], womenSec=[], allSec=[];

  for (const r of rows.slice(1)) {
    if (!r[posI]) continue;
    const sec = toSec(r[timeI]);
    if (!sec) continue;
    const gender = (r[genI]||'').toLowerCase();
    const isMale = gender === 'male' || gender === 'm';
    const catRaw = catI >= 0 ? (r[catI]||'') : '';
    const cat = catI >= 0
      ? mapRaceCategory(catRaw, r[genI]||'', noteUnknown)
      : (isMale ? 'M' : 'W');
    results.push({ pos: +r[posI], bib: r[bibI]||'', name: r[nameI]||'', nat:'NZL', cat, catRaw, club:'—', time: r[timeI], sec });
    allSec.push(sec);
    if (isMale) menSec.push(sec); else womenSec.push(sec);
  }

  fs.writeFileSync(path.join(OUT, `results-omaha-10k-${year}.json`), JSON.stringify(results));
  console.log(`10k  ${year}: ${results.length} finishers`);

  const menSorted   = [...menSec].sort((a,b)=>a-b);
  const womenSorted = [...womenSec].sort((a,b)=>a-b);
  k10Stats.push({
    year,
    finishers: results.length,
    avg: median(allSec),
    avgMen: median(menSec),
    avgWomen: median(womenSec),
    winnerM: menSorted[0]||0,
    winnerW: womenSorted[0]||0,
    top10M: avg(menSorted.slice(0,10)),
    top10W: avg(womenSorted.slice(0,10)),
  });
}

if (unknownCats.size) {
  console.error('\n❌  Unrecognized Omaha category codes (NOT mapped to a band — fix the decoder):');
  for (const [raw, n] of unknownCats) console.error(`     ${JSON.stringify(raw)} × ${n}`);
  process.exitCode = 1;
}

console.log('\n--- HALF STATS ---');
for (const s of halfStats) console.log(JSON.stringify(s)+',');
console.log('\n--- 10K STATS ---');
for (const s of k10Stats)  console.log(JSON.stringify(s)+',');

// Logan totals for half
const h2023 = JSON.parse(fs.readFileSync(path.join(OUT,'results-omaha-half-2023.json'),'utf8'));
const h2024 = JSON.parse(fs.readFileSync(path.join(OUT,'results-omaha-half-2024.json'),'utf8'));
console.log('\nLogan 2023 total:', h2023.length);
console.log('Logan 2024 total:', h2024.length);
const fabe2019 = JSON.parse(fs.readFileSync(path.join(OUT,'results-omaha-half-2019.json'),'utf8'));
console.log('Fabe 2019 total:', fabe2019.length);
