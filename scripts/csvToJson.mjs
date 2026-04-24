import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvDir  = path.join(__dirname, '../Auckland Marathon');
const outDir  = path.join(__dirname, '../public/data');

function toSec(t) {
  const p = t.split(':').map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  return p[0] * 60 + p[1];
}

function titleCase(s) {
  return s.toLowerCase()
    .replace(/(?:^|[\s\-'])\S/g, c => c.toUpperCase())
    .replace(/\bMc(\w)/g, (_, c) => 'Mc' + c.toUpperCase())
    .replace(/\bO'(\w)/g,  (_, c) => "O'" + c.toUpperCase());
}

function parseBib(raw) {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

function parseCSV(text) {
  // Strip BOM, normalise line endings
  const clean = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').filter(l => l.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 8) continue;
    const pos    = parseInt(cols[0], 10);
    const name   = titleCase(cols[1].trim());
    const bib    = parseBib(cols[2].trim());
    const time   = cols[3].trim();
    const nat    = cols[4].trim();
    const agCat  = cols[5].trim();
    const gender = cols[7].trim();   // "Male" / "Female"
    const genderPfx = gender === 'Female' ? 'W' : 'M';
    const cat = `${genderPfx} ${agCat}`;
    if (!time || !pos) continue;
    rows.push({ pos, name, bib, nat, cat, club: '—', time, sec: toSec(time) });
  }
  return rows;
}

const years = [2021, 2022, 2023, 2024, 2025];
const statsOut = [];

for (const year of years) {
  const file = path.join(csvDir, `Auckland Marathon - Marathon Results - ${year}.csv`);
  const text = fs.readFileSync(file, 'utf8');
  const rawRows = parseCSV(text);
  // Deduplicate — CSVs sometimes repeat top N rows
  // Use name+sec as key: bibs like "M2"/"F2" both parse to 2, causing false deduplication
  const seen = new Set();
  const rows = rawRows.filter(r => {
    const key = `${r.name}|${r.sec}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Compute stats
  const males   = rows.filter(r => r.cat.startsWith('M'));
  const females = rows.filter(r => r.cat.startsWith('W'));
  const sorted  = [...rows].sort((a, b) => a.sec - b.sec);
  const median  = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM = males.sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW = females.sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const avgAll  = Math.round(rows.reduce((s, r) => s + r.sec, 0) / rows.length);
  const avgM    = Math.round(males.reduce((s, r) => s + r.sec, 0) / males.length);
  const avgW    = Math.round(females.reduce((s, r) => s + r.sec, 0) / females.length);

  statsOut.push({ year, finishers: rows.length, avg: median, avgMen: avgM, avgWomen: avgW, winnerM, winnerW });

  const outFile = path.join(outDir, `results-${year}.json`);
  fs.writeFileSync(outFile, JSON.stringify(rows));

  const kb = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`${year}: ${rows.length} finishers (${males.length}M / ${females.length}W) · median ${formatT(median)} · winner ${formatT(winnerM)} / ${formatT(winnerW)} · ${kb}KB`);
}

function formatT(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
  return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

console.log('\nyearStats to paste into logsDataExt.ts:');
console.log(statsOut.map(s =>
  `  { year: ${s.year}, finishers: ${s.finishers}, avg: ${s.avg}, avgMen: ${s.avgMen}, avgWomen: ${s.avgWomen}, winnerM: ${s.winnerM}, winnerW: ${s.winnerW} },`
).join('\n'));
