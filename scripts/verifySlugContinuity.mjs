#!/usr/bin/env node
/**
 * verifySlugContinuity.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Confirms every previously-hardcoded athlete slug still maps to the SAME person
 * after the canonical identity rebuild.
 *
 * The legacy slugs + their expected identity (name / PB time / race count) live
 * in src/data/athleteRegistry.ts — the single source that used to drive the 25
 * bespoke athlete pages. For each we check:
 *    1. the slug still exists in src/data/athleteCanon.json (no 404),
 *    2. the canonical NAME matches the registry name (a slug resolving to a
 *       DIFFERENT person is worse than a 404),
 *    3. PB time + race count are consistent (eyeball — new data may add races or
 *       a faster PB, but a wildly different PB signals a wrong resolution).
 *
 * Read-only. Run from project root:  node scripts/verifySlugContinuity.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT     = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const CANON_PATH    = path.join(ROOT, 'src', 'data', 'athleteCanon.json');
const REGISTRY_PATH = path.join(ROOT, 'src', 'data', 'athleteRegistry.ts');
const ATHLETES_OUT  = path.join(DATA_DIR, 'athletes');

// ─── Parse legacy registry (name, slug, pbTime, racesLogged) ─────────────────
function parseRegistry() {
  const src = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const entries = [];
  for (const line of src.split('\n')) {
    const nm = line.match(/name:\s*'([^']+)'/);
    const sl = line.match(/slug:\s*'([^']+)'/);
    if (!nm || !sl) continue;
    const pb = line.match(/pbTime:\s*'([^']+)'/);
    const rl = line.match(/racesLogged:\s*(\d+)/);
    entries.push({
      name: nm[1], slug: sl[1],
      pbTime: pb ? pb[1] : '',
      racesLogged: rl ? parseInt(rl[1], 10) : null,
    });
  }
  return entries;
}

// ─── shardKey — must match buildAthleteCanon.mjs exactly ─────────────────────
function shardKey(slug) {
  const s = slug.replace(/[^a-z0-9]/g, '');
  return (s.slice(0, 2) || '_').padEnd(2, '_');
}
const shardCache = new Map();
function loadShard(sk) {
  if (shardCache.has(sk)) return shardCache.get(sk);
  const p = path.join(ATHLETES_OUT, `${sk}.json`);
  let obj = null;
  try { obj = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { obj = null; }
  shardCache.set(sk, obj);
  return obj;
}

function normName(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

/** H:MM:SS or HH:MM:SS or MM:SS → seconds. null if unparseable. */
function toSec(t) {
  const s = String(t || '').trim();
  let m = s.match(/^(\d+):(\d{2}):(\d{2})$/);
  if (m) return (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
  m = s.match(/^(\d+):(\d{2})$/);
  if (m) return (+m[1]) * 60 + (+m[2]);
  return null;
}

// ─── Run ─────────────────────────────────────────────────────────────────────
const registry = parseRegistry();
const canon = JSON.parse(fs.readFileSync(CANON_PATH, 'utf8'));
const canonBySlug = new Map(canon.map(c => [c.slug, c]));

console.log(`\nVerifying ${registry.length} legacy slugs against athleteCanon.json (${canon.length.toLocaleString()} athletes)\n`);
console.log('  status  slug                       registry name        → canon name            found  reg-PB  (headline)  races');
console.log('  ' + '─'.repeat(112));

let ok = 0, warn = 0, fail = 0;
for (const e of registry) {
  const c = canonBySlug.get(e.slug);
  if (!c) {
    fail++;
    console.log(`  ❌ 404  ${e.slug.padEnd(26)} ${e.name.padEnd(20)} → (slug not in canon)`);
    continue;
  }
  const shard = loadShard(shardKey(e.slug));
  const profile = shard ? shard[e.slug] : null;
  const profilePb = profile ? profile.pbTime : '(single-race: no shard)';
  const profileRaces = profile ? profile.racesLogged : c.races;

  const nameMatch = normName(c.name) === normName(e.name);

  // Continuity signal: the registry's known PB performance should still be
  // attributed to this slug. The old headline PB was often a HALF PB whereas the
  // new profile headline prefers the MARATHON — so compare the registry PB (in
  // seconds) against EVERY result row + every per-distance PB, not the headline.
  const regSec = toSec(e.pbTime);
  let pbFound = null; // null = can't tell (single-race / no data), true/false otherwise
  if (profile && regSec != null) {
    const allSecs = new Set();
    for (const r of profile.results ?? []) if (r.sec) allSecs.add(r.sec);
    for (const k of Object.keys(profile.pbs ?? {})) if (profile.pbs[k]?.sec) allSecs.add(profile.pbs[k].sec);
    // exact match, or within 1s to tolerate rounding between H:MM:SS sources
    pbFound = [...allSecs].some(s => Math.abs(s - regSec) <= 1);
  }

  let flag = '✅ OK ';
  const problems = [];
  if (!nameMatch) {
    problems.push('NAME MISMATCH → different person?'); flag = '❌ BAD'; fail++;
  } else if (pbFound === false) {
    problems.push(`registry PB ${e.pbTime} NOT found in this athlete's result history → possible wrong resolution`);
    flag = '⚠️  CHK'; warn++;
  } else {
    ok++;
  }

  const pbCol = pbFound === true ? `PB✓` : pbFound === false ? `PB✗` : `PB?`;
  console.log(
    `  ${flag}  ${e.slug.padEnd(26)} ${e.name.padEnd(20)} → ${String(c.name).padEnd(22)} ${pbCol}  ${String(e.pbTime).padEnd(8)} (hl:${String(profilePb).padEnd(9)}) ${String(e.racesLogged)}→${profileRaces}`
  );
  if (problems.length) console.log(`          ↳ ${problems.join('; ')}`);
}

console.log('  ' + '─'.repeat(112));
console.log(`\n  ${ok} ok · ${warn} to check · ${fail} failing   (of ${registry.length} legacy slugs)\n`);
if (fail > 0) process.exitCode = 1;
