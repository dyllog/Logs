import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvDir  = path.join(__dirname, '../Auckland Marathon');
const outDir  = path.join(__dirname, '../public/data');

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

// Convert old-style category codes like "M1834", "F3539" to "M 18-34", "W 35-39"
function parseOldCat(code) {
  if (!code || code.length < 5) return { genderPfx: 'M', ageCat: 'Open' };
  const gChar = code[0].toUpperCase();
  const genderPfx = gChar === 'F' ? 'W' : 'M';
  const digits = code.slice(1).replace(/[^0-9]/g, '');
  if (digits.length >= 4) {
    let start = parseInt(digits.slice(0, 2), 10);
    const end = parseInt(digits.slice(2, 4), 10);
    if (start < 18) start = 18;
    return { genderPfx, ageCat: `${start}-${end}` };
  }
  return { genderPfx, ageCat: 'Open' };
}

function parseCSV(text) {
  const clean = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasNetTime    = header.includes('net time');
  const hasNationality = header.includes('nationality');

  // Column index map based on format
  // Old-with-nettime:  Pos,Name,Bib,Time,NetTime,Cat,CatPos,Gender,GenderPos,...
  // Old-no-nettime:    Pos,Name,Bib,Time,Cat,CatPos,Gender,GenderPos,...
  // New (2021+):       Pos,Name,Bib,Time,Nat,Cat,CatPos,Gender,GenderPos
  const iTime   = 3;
  const iNat    = hasNationality ? 4 : -1;
  const iCat    = hasNationality ? 5 : hasNetTime ? 5 : 4;
  const iGender = hasNationality ? 7 : hasNetTime ? 7 : 6;

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const posRaw = cols[0]?.trim() ?? '';
    const pos = parseInt(posRaw, 10);

    // Skip DNF, DQ, blank positions, and rows with no valid time
    if (!pos || pos <= 0 || isNaN(pos)) continue;

    const time = cols[iTime]?.trim() ?? '';
    if (!time || !time.includes(':')) continue;

    const sec = toSec(time);
    if (sec <= 0) continue;

    const name = titleCase(cols[1]?.trim() ?? '');
    const bib  = parseBib(cols[2]?.trim() ?? '');
    const nat  = iNat >= 0 ? (cols[iNat]?.trim() ?? '') : '';
    const catRaw = cols[iCat]?.trim() ?? '';
    const genderRaw = cols[iGender]?.trim() ?? '';

    let genderPfx, ageCat;
    if (hasNationality) {
      // New format: gender is "Male"/"Female", cat is "Elite"/"25-29" etc.
      genderPfx = genderRaw === 'Female' ? 'W' : 'M';
      ageCat    = catRaw;
    } else {
      // Old format: cat encodes gender+age like "M1834", "F3539"
      const parsed = parseOldCat(catRaw);
      genderPfx = parsed.genderPfx;
      ageCat    = parsed.ageCat;
      // Fallback: if separate gender col exists ("M"/"F"), use that
      if (genderRaw === 'F') genderPfx = 'W';
      else if (genderRaw === 'M') genderPfx = 'M';
    }

    const cat = `${genderPfx} ${ageCat}`;
    rows.push({ pos, name, bib, nat, cat, club: '—', time, sec });
  }
  return rows;
}

const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
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

  const males   = rows.filter(r => r.cat.startsWith('M'));
  const females = rows.filter(r => r.cat.startsWith('W'));
  const sorted  = [...rows].sort((a, b) => a.sec - b.sec);
  const median  = sorted[Math.floor(sorted.length / 2)]?.sec ?? 0;
  const winnerM = [...males].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const winnerW = [...females].sort((a, b) => a.sec - b.sec)[0]?.sec ?? 0;
  const avgM    = Math.round(males.reduce((s, r) => s + r.sec, 0) / males.length);
  const avgW    = Math.round(females.reduce((s, r) => s + r.sec, 0) / females.length);

  statsOut.push({ year, finishers: rows.length, avg: median, avgMen: avgM, avgWomen: avgW, winnerM, winnerW });

  const outFile = path.join(outDir, `results-${year}.json`);
  fs.writeFileSync(outFile, JSON.stringify(rows));

  const kb = Math.round(fs.statSync(outFile).size / 1024);
  console.log(`${year}: ${rows.length} finishers (${males.length}M / ${females.length}W) · median ${fmt(median)} · winner ${fmt(winnerM)} / ${fmt(winnerW)} · ${kb}KB`);
}

function fmt(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
  return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

console.log('\nyearStats to paste into logsDataExt.ts:');
console.log(statsOut.map(s =>
  `  { year: ${s.year}, finishers: ${String(s.finishers).padStart(4)}, avg: ${String(s.avg).padStart(5)}, avgMen: ${String(s.avgMen).padStart(5)}, avgWomen: ${String(s.avgWomen).padStart(5)}, winnerM: ${String(s.winnerM).padStart(5)}, winnerW: ${String(s.winnerW).padStart(5)} },`
).join('\n'));
