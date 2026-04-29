import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCat } from './normalizeCats.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvDir = path.join(__dirname, '..', 'Rotorua Marathon');
const outDir = path.join(__dirname, '..', 'public', 'data');

function toTitle(s) {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function parseOrdinalPos(s) {
  if (!s) return null;
  const t = s.trim();
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const m = t.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function toSec(t) {
  if (!t) return 0;
  const clean = t.trim().replace(/^0+(?=\d)/, '');
  const parts = clean.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function normTime(t) {
  const s = toSec(t);
  if (!s) return '';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function normCat(cat, genderCol) {
  if (!cat) return '—';
  const c = cat.trim();

  // 2024/2025 format: separate gender column, cat is just age band "18-34"
  if (genderCol) {
    const g = genderCol.trim().toLowerCase().startsWith('f') ? 'W' : 'M';
    return `${g} ${c.replace('-', '–')}`;
  }

  // "Male 15 to 34" / "Female 45 to 49" / "Female 75 and over"
  let m = c.match(/^(Male|Female)\s+(\d+)\s+to\s+(\d+)/i);
  if (m) {
    const g = m[1].toLowerCase() === 'female' ? 'W' : 'M';
    return `${g} ${m[2]}–${m[3]}`;
  }
  m = c.match(/^(Male|Female)\s+(\d+)\s+and\s+over/i);
  if (m) {
    const g = m[1].toLowerCase() === 'female' ? 'W' : 'M';
    return `${g} ${m[2]}+`;
  }

  // "M 15-34" / "F 40-44" / "M 16-34"
  m = c.match(/^([MFmf])\s+(\d+)[–-](\d+)/);
  if (m) {
    const g = m[1].toLowerCase() === 'f' ? 'W' : 'M';
    return `${g} ${m[2]}–${m[3]}`;
  }
  m = c.match(/^([MFmf])\s+(\d+)\+/);
  if (m) {
    const g = m[1].toLowerCase() === 'f' ? 'W' : 'M';
    return `${g} ${m[2]}+`;
  }

  return c;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    // Simple CSV split (no quoted fields in this data)
    rows.push(line.split(','));
  }
  return rows;
}

const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const stats = [];

for (const year of years) {
  const file = path.join(csvDir, `Rotorua Marathon - Marathon Results - ${year}.csv`);
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCsv(text);
  const header = rows[0].map(h => h.trim().toLowerCase());

  const hasGenderCol = header.includes('gender');
  const hasBibCol = header.includes('bib');
  const posIdx = 0;  // always first
  const nameIdx = 1; // always second
  const bibIdx = hasBibCol ? header.indexOf('bib') : -1;
  const timeIdx = hasBibCol ? 3 : 2;  // 2024/2025 has bib before time
  const catIdx = hasBibCol ? 4 : 3;
  const genderIdx = hasGenderCol ? header.indexOf('gender') : -1;

  const results = [];
  let bibCounter = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] || !r[0].trim()) continue;

    const posRaw = r[posIdx]?.trim() || '';
    const nameRaw = r[nameIdx]?.trim() || '';
    const timeRaw = r[timeIdx]?.trim() || '';
    const catRaw  = r[catIdx]?.trim()  || '';
    const genderRaw = genderIdx >= 0 ? (r[genderIdx]?.trim() || '') : '';

    // Skip header rows, "Started" (DNF) rows, Walker rows, relay teams
    if (posRaw === 'Position' || posRaw === '' || posRaw === 'Started') continue;
    if (catRaw.toLowerCase().includes('walker')) continue;
    if (catRaw === '' && genderRaw === '') continue; // no category = other distance

    const pos = parseOrdinalPos(posRaw);
    if (!pos || pos < 1) continue;

    const sec = toSec(timeRaw);
    // Filter: marathon time must be >= 1:30:00 and <= 12:00:00
    if (sec < 5400 || sec > 43200) continue;

    const name = hasBibCol ? toTitle(nameRaw) : nameRaw;
    const bib = bibIdx >= 0 ? (parseInt(r[bibIdx]?.trim() || '0', 10) || 0) : 0;
    const cat = normCat(catRaw, hasGenderCol ? genderRaw : '');
    const time = normTime(timeRaw);

    results.push({ pos, name, bib, time, cat: normalizeCat(cat), nat: '—', sec });
  }

  // Re-sequence positions (in case of filtering gaps)
  results.sort((a, b) => a.sec - b.sec);
  results.forEach((r, i) => { r.pos = i + 1; });

  const outFile = path.join(outDir, `results-rot-${year}.json`);
  fs.writeFileSync(outFile, JSON.stringify(results));

  // Compute year stats
  const mResults = results.filter(r => r.cat.startsWith('M '));
  const wResults = results.filter(r => r.cat.startsWith('W '));
  const sorted = [...results].sort((a, b) => a.sec - b.sec);
  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.sec, 0) / results.length) : 0;
  const winnerM = mResults.length ? Math.min(...mResults.map(r => r.sec)) : 0;
  const winnerW = wResults.length ? Math.min(...wResults.map(r => r.sec)) : 0;
  const top10M = mResults.length >= 10
    ? Math.round([...mResults].sort((a,b) => a.sec-b.sec).slice(0,10).reduce((s,r) => s+r.sec,0) / 10)
    : (mResults.length ? Math.round(mResults.reduce((s,r) => s+r.sec,0) / mResults.length) : 0);
  const top10W = wResults.length >= 10
    ? Math.round([...wResults].sort((a,b) => a.sec-b.sec).slice(0,10).reduce((s,r) => s+r.sec,0) / 10)
    : (wResults.length ? Math.round(wResults.reduce((s,r) => s+r.sec,0) / wResults.length) : 0);
  const avgMen = mResults.length ? Math.round(mResults.reduce((s,r) => s+r.sec,0) / mResults.length) : 0;
  const avgWomen = wResults.length ? Math.round(wResults.reduce((s,r) => s+r.sec,0) / wResults.length) : 0;

  stats.push({ year, finishers: results.length, avg, avgMen, avgWomen, winnerM, winnerW, top10M, top10W });
  console.log(`${year}: ${results.length} finishers  M winner: ${mResults.length ? sorted.find(r=>r.cat.startsWith('M'))?.time : '—'}  W winner: ${wResults.length ? sorted.find(r=>r.cat.startsWith('W'))?.time : '—'}`);
}

console.log('\n=== rotoruaStats for logsDataExt.ts ===');
stats.forEach(s => {
  console.log(`  { year: ${s.year}, finishers: ${s.finishers}, avg: ${s.avg}, avgMen: ${s.avgMen}, avgWomen: ${s.avgWomen}, winnerM: ${s.winnerM}, winnerW: ${s.winnerW}, top10M: ${s.top10M}, top10W: ${s.top10W} },`);
});
