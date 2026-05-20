import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCat } from './normalizeCats.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvDir = 'C:\\Users\\Dylan Logan\\logs-simple\\Race Files\\Kerikeri Half Marathon';
const outDir = path.join(__dirname, '../public/data');

function toSec(t) {
  if (!t) return 0;
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

// Handles formats:
//   "Male Open" / "Female 40-44"  (2008-2011)
//   "M00-34" / "F45-49"           (2013+)
//   "M" / "F" from gender column  (override)
function parseCatAndGender(catRaw, genderColRaw) {
  let genderPfx, ageCat;

  const gRaw = catRaw.trim();

  // Format: "Male Open", "Female 40-44", "Male 40-44" etc.
  const longMatch = gRaw.match(/^(Male|Female)\s*(.*)$/i);
  if (longMatch) {
    genderPfx = longMatch[1].toLowerCase() === 'female' ? 'W' : 'M';
    const rest = longMatch[2].trim();
    ageCat = rest === '' || /^open$/i.test(rest) ? 'Open' : rest;
  } else {
    // Format: "M00-34", "F45-49", "M35-39" etc.
    const shortMatch = gRaw.match(/^([MF])(\d{2})-?(\d{2,3})$/i);
    if (shortMatch) {
      genderPfx = shortMatch[1].toUpperCase() === 'F' ? 'W' : 'M';
      let start = parseInt(shortMatch[2], 10);
      const end   = parseInt(shortMatch[3], 10);
      if (start < 18) start = 18;
      ageCat = `${start}-${end}`;
    } else {
      // Fallback
      genderPfx = 'M';
      ageCat = 'Open';
    }
  }

  // Override gender from dedicated gender column if present
  const g = genderColRaw?.trim().toUpperCase();
  if (g === 'F') genderPfx = 'W';
  else if (g === 'M') genderPfx = 'M';

  return { genderPfx, ageCat };
}

function parseCSV(text) {
  const clean = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasNetTime = header.includes('net time');

  // Column layout:
  // With Net Time:    Pos,Name,Bib,Time,NetTime,Cat,CatPos,Gender,GenderPos,...
  // Without Net Time: Pos,Name,Bib,Time,Cat,CatPos,Gender,GenderPos,...
  const iCat    = hasNetTime ? 5 : 4;
  const iGender = hasNetTime ? 7 : 6;

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const pos = parseInt(cols[0]?.trim() ?? '', 10);
    if (!pos || pos <= 0 || isNaN(pos)) continue;

    const time = cols[3]?.trim() ?? '';
    if (!time || !time.includes(':')) continue;
    const sec = toSec(time);
    if (sec <= 0) continue;

    const name = titleCase(cols[1]?.trim() ?? '');
    const bib  = parseBib(cols[2]?.trim() ?? '');
    const catRaw    = cols[iCat]?.trim() ?? '';
    const genderRaw = cols[iGender]?.trim() ?? '';

    const { genderPfx, ageCat } = parseCatAndGender(catRaw, genderRaw);
    const cat = normalizeCat(`${genderPfx} ${ageCat}`);
    rows.push({ pos, name, bib, nat: '', cat, club: '—', time, sec });
  }
  return rows;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function processYear(year) {
  const file = path.join(csvDir, `Kerikeri Half Marathon - Half Results - ${year}.csv`);
  if (!fs.existsSync(file)) { console.log(`  ${year}: MISSING`); return null; }

  const text = fs.readFileSync(file, 'utf8');
  const rawRows = parseCSV(text);

  const seen = new Set();
  const rows = rawRows.filter(r => {
    const key = `${r.name}|${r.sec}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const males   = rows.filter(r => r.cat.startsWith('M'));
  const females = rows.filter(r => r.cat.startsWith('W'));
  const sorted  = [...rows].sort((a, b) => a.sec - b.sec);
  const median  = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM = [...males].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW = [...females].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const top10M  = Math.round([...males].sort((a, b) => a.sec - b.sec).slice(0, 10).reduce((s, r) => s + r.sec, 0) / Math.min(10, males.length));
  const top10W  = Math.round([...females].sort((a, b) => a.sec - b.sec).slice(0, 10).reduce((s, r) => s + r.sec, 0) / Math.min(10, females.length));
  const avgM    = Math.round(males.reduce((s, r) => s + r.sec, 0) / males.length);
  const avgW    = Math.round(females.reduce((s, r) => s + r.sec, 0) / females.length);

  const winNameM = [...males].sort((a, b) => a.sec - b.sec)[0]?.name ?? '?';
  const winNameW = [...females].sort((a, b) => a.sec - b.sec)[0]?.name ?? '?';

  const outFile = path.join(outDir, `results-kerikeri-half-${year}.json`);
  fs.writeFileSync(outFile, JSON.stringify(rows));
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`  ${year}: ${rows.length} finishers (${males.length}M / ${females.length}W) · median ${fmt(median)} · ♂ ${fmt(winnerM)} ${winNameM} · ♀ ${fmt(winnerW)} ${winNameW} · ${kb}KB`);

  return { year, finishers: rows.length, avg: median, avgMen: avgM, avgWomen: avgW, winnerM, winnerW, top10M, top10W };
}

const years = [2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024];

console.log('\n── Kerikeri Half Marathon (21.1 km) ──');
const stats = [];
for (const year of years) {
  const s = processYear(year);
  if (s) stats.push(s);
}

function fmtRow(s) {
  return `  { year: ${s.year}, finishers: ${String(s.finishers).padStart(4)}, avg: ${String(s.avg).padStart(5)}, avgMen: ${String(s.avgMen).padStart(5)}, avgWomen: ${String(s.avgWomen).padStart(5)}, winnerM: ${String(s.winnerM).padStart(5)}, winnerW: ${String(s.winnerW).padStart(5)}, top10M: ${String(s.top10M).padStart(5)}, top10W: ${String(s.top10W).padStart(5)} },`;
}

console.log('\n── Paste into kerikeriData.ts ──');
stats.forEach(s => console.log(fmtRow(s)));
