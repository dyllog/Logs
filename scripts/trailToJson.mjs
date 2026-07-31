#!/usr/bin/env node
/**
 * trailToJson.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Config-driven trail results converter. Reads src/data/trailEvents.mjs (the
 * trail event-family config) and converts every course instance's source CSV:
 *
 *   Race Files/{sourceDir}/{year}/{label} Results - {year}.csv
 *     → public/data/results-{familySlug}-{subEventId}-{year}.json
 *
 * plus one per-family stats file for the trail race page (medians, winners,
 * per-course-era records):
 *     → public/data/trail/{familySlug}-stats.json
 *
 * Output rows use the exact road row shape: {pos,name,bib,nat,cat,club,time,sec}.
 *
 * Trail-source hazards handled here (all observed in the Tarawera files):
 *   • Quoted fields with embedded commas AND newlines ("FRANCO, JR BAGUNA";
 *     relay gender cells spanning two physical lines) — real CSV parser below.
 *   • Relay/team rows ('2 Person Relay', '4 person', gender 'Mixed', names
 *     starting TEAM) — excluded: this is an individual-results archive. Official
 *     positions are preserved, so position sequences may have honest gaps.
 *   • 'Solo' category (2012–14 era) — the individual category of the relay era,
 *     mapped to Open.
 *   • DNF / DNS / DQ / withdrawal rows — skipped (no valid position+time).
 *   • Optional Nationality and Run (chip time) columns varying per file —
 *     header-driven column mapping; gun Time is authoritative.
 *
 * LOUD FAILURE: a missing source CSV, an unparseable file, or a file yielding
 * zero finishers aborts the build (exit 1). Unknown category shapes are
 * reported per file so the next Omaha-class surprise shows up here, not in
 * identity-flag archaeology months later.
 *
 * Run from project root:  node scripts/trailToJson.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCat } from './normalizeCats.mjs';
import { TRAIL_EVENT_FAMILIES, trailResultsFile } from '../src/data/trailEvents.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const RACE_DIR  = path.join(ROOT, 'Race Files');
const OUT_DIR   = path.join(ROOT, 'public', 'data');
const TRAIL_OUT = path.join(OUT_DIR, 'trail');

// ── CSV parsing (quotes, embedded commas, embedded newlines) ─────────────────
function parseCsv(text) {
  const rows = [];
  let field = '', row = [], inQuotes = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some(f => f.trim() !== '')) rows.push(row);
  return rows;
}

// Collapse NBSP/tabs/newlines inside a cell to single spaces.
const clean = (s) => String(s ?? '').replace(/[\u00A0\s]+/g, ' ').trim();

function toSec(t) {
  const p = t.split(':').map(Number);
  if (p.some(isNaN)) return 0;
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return 0;
}

function fmtSec(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function titleCase(s) {
  return s.toLowerCase()
    .replace(/(?:^|[\s\-'])\S/g, c => c.toUpperCase())
    .replace(/\bMc(\w)/g, (_, c) => 'Mc' + c.toUpperCase())
    .replace(/\bO'(\w)/g,  (_, c) => "O'" + c.toUpperCase());
}

function parseBib(raw) {
  const n = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

const isRelayRow = (cat, gender, name) =>
  /relay/i.test(cat) || /\bperson\b/i.test(cat) || /^mixed/i.test(gender) || /^team\s/i.test(name);

// Age-band / known category shapes we expect from trail timing exports.
const KNOWN_CAT = /^(solo|elite|open|\d{1,2}\s*[-–]\s*\d{1,3}|\d{1,2}\s*\+|under\s*\d+|u\s*\d+)$/i;

// ── Convert one course instance ──────────────────────────────────────────────
function convertCourse(family, edition, ci) {
  const srcFile = path.join(RACE_DIR, family.sourceDir, String(edition.year), `${ci.label} Results - ${edition.year}.csv`);
  if (!fs.existsSync(srcFile)) {
    console.error(`❌  Missing source CSV for ${family.familySlug}/${ci.subEventId}/${edition.year}: ${srcFile}`);
    process.exit(1);
  }

  const table = parseCsv(fs.readFileSync(srcFile, 'utf8'));
  if (table.length < 2) {
    console.error(`❌  ${path.basename(srcFile)}: no data rows parsed`);
    process.exit(1);
  }

  const header = table[0].map(h => clean(h).toLowerCase());
  const col = (name) => header.indexOf(name);
  const iPos = col('position'), iName = col('name'), iBib = col('bib'), iTime = col('time');
  const iNat = col('nationality');            // -1 when absent (pre-2016 / 2017–20 files)
  const iCat = col('category'), iGender = col('gender');
  if (iPos < 0 || iName < 0 || iTime < 0 || iCat < 0 || iGender < 0) {
    console.error(`❌  ${path.basename(srcFile)}: unrecognised header: ${table[0].join(',')}`);
    process.exit(1);
  }

  const rows = [];
  const unknownCats = new Map();
  let relayExcluded = 0, nonFinishers = 0;

  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const posRaw = clean(cells[iPos]);
    const pos = parseInt(posRaw, 10);
    if (!pos || pos <= 0 || isNaN(pos) || !/^\d+$/.test(posRaw)) { nonFinishers++; continue; }

    const time = clean(cells[iTime]);
    if (!time.includes(':')) { nonFinishers++; continue; }
    const sec = toSec(time);
    if (sec <= 0) { nonFinishers++; continue; }

    const rawName = clean(cells[iName]);
    const catRaw  = clean(cells[iCat]);
    const gender  = clean(cells[iGender]);
    if (isRelayRow(catRaw, gender, rawName)) { relayExcluded++; continue; }

    const genderPfx = /^female/i.test(gender) ? 'W' : /^male/i.test(gender) ? 'M' : '?';
    if (genderPfx === '?') { unknownCats.set(`gender:${gender}`, (unknownCats.get(`gender:${gender}`) ?? 0) + 1); continue; }

    // Trail category vocabulary: 'Solo' is the relay-era individual category
    // (no age data → Open); everything else should be an age band.
    let ageCat;
    if (/^solo$/i.test(catRaw) || catRaw === '') ageCat = 'Open';
    else if (KNOWN_CAT.test(catRaw)) ageCat = catRaw;
    else {
      unknownCats.set(catRaw, (unknownCats.get(catRaw) ?? 0) + 1);
      ageCat = 'Open'; // don't invent a band from junk — surface it in the report
    }

    rows.push({
      pos,
      name: titleCase(rawName),
      bib: parseBib(cells[iBib] ?? ''),
      nat: iNat >= 0 ? clean(cells[iNat]) : '',
      cat: normalizeCat(`${genderPfx} ${ageCat}`),
      club: '—',
      time,
      sec,
    });
  }

  // Day-rollover repair: some ultra exports store elapsed time modulo 24 h
  // (2026 TMiler: pos 1 "16:25:52", pos 150 "07:24:16" — really 31:24:16).
  // Position is finish order, so gun times must be non-decreasing; a backwards
  // jump of more than 12 h marks a crossed day boundary. Loud in the report.
  let rolloverFixed = 0;
  {
    let dayOffset = 0, prevSec = 0;
    for (const r of rows) {
      while (r.sec + dayOffset < prevSec - 12 * 3600) dayOffset += 86400;
      if (dayOffset > 0) {
        r.sec += dayOffset;
        r.time = fmtSec(r.sec);
        rolloverFixed++;
      }
      prevSec = r.sec;
    }
  }

  // Same dedupe rule as the road converters.
  const seen = new Set();
  const deduped = rows.filter(r => {
    const key = `${r.name}|${r.sec}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length === 0) {
    console.error(`❌  ${path.basename(srcFile)}: 0 finishers after filtering — inspect the file`);
    process.exit(1);
  }

  const outName = trailResultsFile(family.familySlug, ci.subEventId, edition.year);
  fs.writeFileSync(path.join(OUT_DIR, outName), JSON.stringify(deduped));

  const males   = deduped.filter(r => r.cat.startsWith('M'));
  const females = deduped.filter(r => r.cat.startsWith('W'));
  const bySec   = [...deduped].sort((a, b) => a.sec - b.sec);
  const firstM  = [...males].sort((a, b) => a.sec - b.sec)[0] ?? null;
  const firstW  = [...females].sort((a, b) => a.sec - b.sec)[0] ?? null;
  const median  = bySec[Math.floor(bySec.length / 2)]?.sec ?? 0;

  const flags = [
    relayExcluded ? `${relayExcluded} relay/team rows excluded` : '',
    rolloverFixed ? `⚠️ 24h day-rollover repaired on ${rolloverFixed} times` : '',
    unknownCats.size ? `⚠️ unknown cats: ${[...unknownCats].map(([c, n]) => `"${c}"×${n}`).join(', ')}` : '',
  ].filter(Boolean).join(' · ');

  console.log(`  ${String(edition.year)} ${ci.label.padEnd(14)} ${String(deduped.length).padStart(5)} finishers (${males.length}M/${females.length}W) · median ${fmtSec(median)}${flags ? ' · ' + flags : ''}`);

  return {
    year: edition.year,
    finishers: deduped.length,
    medianSec: median,
    winnerM: firstM ? { name: firstM.name, sec: firstM.sec, time: firstM.time } : null,
    winnerW: firstW ? { name: firstW.name, sec: firstW.sec, time: firstW.time } : null,
  };
}

// ── Per-course-era records ───────────────────────────────────────────────────
// Consecutive course years grouped by distanceKm. Contingency years stay in
// their era's timeline but are EXCLUDED from record computation — a record on
// a contingency route is not a course record.
function buildEras(family, subEventId, yearStats) {
  const courses = [];
  for (const ed of family.editions) {
    const ci = ed.courses.find(c => c.subEventId === subEventId);
    if (ci) courses.push({ year: ed.year, ci });
  }
  const eras = [];
  let cur = null;
  for (const { year, ci } of courses) {
    if (!cur || cur.distanceKm !== ci.distanceKm) {
      cur = { distanceKm: ci.distanceKm, from: year, to: year, years: [], excluded: [] };
      eras.push(cur);
    }
    cur.to = year;
    (ci.contingency ? cur.excluded : cur.years).push(year);
  }

  const best = (years, side) => {
    let rec = null;
    for (const y of years) {
      const s = yearStats.find(st => st.year === y);
      const w = s?.[side];
      if (w && (!rec || w.sec < rec.sec)) rec = { ...w, year: y };
    }
    return rec;
  };

  for (const era of eras) {
    // Records come from eligible (non-contingency) years only.
    era.recordM = best(era.years, 'winnerM');
    era.recordW = best(era.years, 'winnerW');
    // Fastest INCLUDING contingency years — needed because an era can consist
    // entirely of contingency courses (Tarawera's 2014 cyclone sub-events), in
    // which case no record exists but the day's fastest is still real.
    const every = [...era.years, ...era.excluded];
    era.fastestM = best(every, 'winnerM');
    era.fastestW = best(every, 'winnerW');
    era.contingencyOnly = era.years.length === 0;
  }

  const allYears = courses.map(c => c.year);
  const allTime = {
    recordM: best(allYears, 'winnerM'),
    recordW: best(allYears, 'winnerW'),
    // Only meaningful when the sub-event genuinely ran more than one course;
    // per-era contingency exclusions are reported on the era itself.
    crossCourse: eras.length > 1,
  };
  return { eras, allTime };
}

// ── Main ─────────────────────────────────────────────────────────────────────
fs.mkdirSync(TRAIL_OUT, { recursive: true });

for (const family of TRAIL_EVENT_FAMILIES) {
  console.log(`\n── ${family.name} (${family.familySlug}) ──`);
  const subStats = {};
  for (const edition of family.editions) {
    for (const ci of edition.courses) {
      const stat = convertCourse(family, edition, ci);
      (subStats[ci.subEventId] ??= []).push(stat);
    }
  }

  const statsOut = { familySlug: family.familySlug, generatedAt: new Date().toISOString(), subEvents: {} };
  for (const sub of family.subEvents) {
    const years = subStats[sub.id] ?? [];
    if (!years.length) {
      console.warn(`⚠️  Sub-event "${sub.id}" has no course instances — check the config`);
      continue;
    }
    const { eras, allTime } = buildEras(family, sub.id, years);
    statsOut.subEvents[sub.id] = { years, eras, allTime };
  }
  const statsFile = path.join(TRAIL_OUT, `${family.familySlug}-stats.json`);
  fs.writeFileSync(statsFile, JSON.stringify(statsOut));

  const total = Object.values(subStats).flat().reduce((s, y) => s + y.finishers, 0);
  console.log(`  → ${Object.values(subStats).flat().length} course instances, ${total.toLocaleString()} finisher rows · stats → ${path.relative(ROOT, statsFile)}`);
}

console.log('\n✅  Trail conversion complete.\n');
