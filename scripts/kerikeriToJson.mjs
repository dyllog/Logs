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

// Handles all observed Kerikeri category formats:
//   "Open" / "Corporate" / "Registered Open"  (2003 — no gender, col is "X")
//   "M0139" / "F0139" / "M4044"               (2004–2005 compact 4-digit)
//   "30-39M" / "20-29F"                        (2006 reversed age-then-gender)
//   "M20-29" / "M30-39"                        (2007)
//   "Male Open" / "Female 40-44"               (2008–2011)
//   "M00-34" / "F45-49"                        (2013+)
// Returns { genderPfx: 'M'|'W'|'X', ageCat: string }
function parseCatAndGender(catRaw, genderColRaw) {
  const gRaw = catRaw.trim();
  let genderPfx = 'X';
  let ageCat = 'Open';

  // "Male Open", "Female 40-44" etc.
  const longMatch = gRaw.match(/^(Male|Female)\s*(.*)$/i);
  if (longMatch) {
    genderPfx = longMatch[1].toLowerCase() === 'female' ? 'W' : 'M';
    const rest = longMatch[2].trim();
    ageCat = rest === '' || /^open$/i.test(rest) ? 'Open' : rest;
  }
  // "30-39M" / "20-29F" (reversed: age-gender)
  else if (/^\d{2}-\d{2,3}[MF]$/i.test(gRaw)) {
    const rev = gRaw.match(/^(\d{2})-(\d{2,3})([MF])$/i);
    genderPfx = rev[3].toUpperCase() === 'F' ? 'W' : 'M';
    let start = parseInt(rev[1], 10);
    const end = parseInt(rev[2], 10);
    if (start < 18) start = 18;
    ageCat = `${start}-${end}`;
  }
  // "M00-34", "F45-49", "M20-29", "M0139", "F0139", "M4044" etc.
  else if (/^[MF]\d/i.test(gRaw)) {
    const g = gRaw[0].toUpperCase();
    genderPfx = g === 'F' ? 'W' : 'M';
    const digits = gRaw.slice(1).replace(/[^0-9]/g, '');
    if (digits.length >= 4) {
      let start = parseInt(digits.slice(0, 2), 10);
      const end   = parseInt(digits.slice(2, 4), 10);
      if (start < 18) start = 18;
      ageCat = `${start}-${end}`;
    }
  }
  // Ungrouped / non-gender categories ("Open", "Corporate", "Registered Open")
  // genderPfx stays 'X'

  // Override gender from dedicated gender column (M/F beats category inference; X means no data)
  const g = genderColRaw?.trim().toUpperCase();
  if (g === 'F') genderPfx = 'W';
  else if (g === 'M') genderPfx = 'M';
  // 'X' leaves genderPfx as-is from category parse

  return { genderPfx, ageCat };
}

function parseCSV(text) {
  const clean = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasNetTime = header.includes('net time');

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

    const name      = titleCase(cols[1]?.trim() ?? '');
    const bib       = parseBib(cols[2]?.trim() ?? '');
    const catRaw    = cols[iCat]?.trim() ?? '';
    const genderRaw = cols[iGender]?.trim() ?? '';

    const { genderPfx, ageCat } = parseCatAndGender(catRaw, genderRaw);

    // For ungrouped entries store cat as 'Open' (no gender prefix)
    const cat = genderPfx === 'X'
      ? 'Open'
      : normalizeCat(`${genderPfx} ${ageCat}`);

    rows.push({ pos, name, bib, nat: '', cat, club: '—', time, sec });
  }
  return rows;
}

function fmt(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function safeAvg(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, r) => s + r.sec, 0) / arr.length);
}
function safeTop10Avg(arr) {
  const top = [...arr].sort((a, b) => a.sec - b.sec).slice(0, 10);
  if (!top.length) return 0;
  return Math.round(top.reduce((s, r) => s + r.sec, 0) / top.length);
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

  // For years with no gender data, fall back to overall stats
  const noGender = males.length === 0 && females.length === 0;
  const winnerM  = males.length   ? [...males].sort((a,b) => a.sec-b.sec)[0].sec : (noGender ? sorted[0]?.sec ?? 0 : 0);
  const winnerW  = females.length ? [...females].sort((a,b) => a.sec-b.sec)[0].sec : (noGender ? sorted[0]?.sec ?? 0 : 0);
  const avgM     = males.length   ? safeAvg(males)   : (noGender ? median : 0);
  const avgW     = females.length ? safeAvg(females) : (noGender ? median : 0);
  const top10M   = males.length   ? safeTop10Avg(males)   : (noGender ? safeTop10Avg(sorted) : 0);
  const top10W   = females.length ? safeTop10Avg(females) : (noGender ? safeTop10Avg(sorted) : 0);

  const winNameM = males.length   ? [...males].sort((a,b) => a.sec-b.sec)[0].name : (sorted[0]?.name ?? '?');
  const winNameW = females.length ? [...females].sort((a,b) => a.sec-b.sec)[0].name : (noGender ? '(no gender data)' : '?');

  const outFile = path.join(outDir, `results-kerikeri-half-${year}.json`);
  fs.writeFileSync(outFile, JSON.stringify(rows));
  const kb = Math.round(fs.statSync(outFile).size / 1024);
  const genderNote = noGender ? ' [no gender data]' : `${males.length}M / ${females.length}W`;
  console.log(`  ${year}: ${rows.length} finishers (${genderNote}) · median ${fmt(median)} · ♂ ${fmt(winnerM)} ${winNameM} · ♀ ${fmt(winnerW)} ${winNameW} · ${kb}KB`);

  return { year, finishers: rows.length, avg: median, avgMen: avgM, avgWomen: avgW, winnerM, winnerW, top10M, top10W };
}

const years = [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025];

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
