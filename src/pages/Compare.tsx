import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  YEARS, ROTORUA_YEARS,
  loadResults, getCachedResults,
  loadRotorua, getCachedRotorua,
  loadRotoruaHalf, getCachedRotoruaHalf,
  loadChc, getCachedChc,
  loadChcHalf, getCachedChcHalf,
  loadHb, getCachedHb,
  loadHbHalf, getCachedHbHalf,
  loadQt, getCachedQt,
  loadQtHalf, getCachedQtHalf,
  type ResultRow,
} from '@/data/logsDataExt';
import { CHC_YEARS } from '@/data/chcData';
import { HB_YEARS } from '@/data/hbData';
import { QT_YEARS } from '@/data/qtData';
import { AthleteNameDropdown } from '@/components/InlineSearch';

// ── Helpers ──────────────────────────────────────────────

function parseTimeInput(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const parts = t.split(':').map(p => p.trim());
  if (parts.some(p => !/^\d+(\.\d+)?$/.test(p))) return null;
  const nums = parts.map(parseFloat);
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  return null;
}

function fmtSec(sec: number | null | undefined): string {
  if (sec == null || !isFinite(sec)) return '—';
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ordSuffix(n: number): string {
  const v = n % 100;
  const sfx = ['th', 'st', 'nd', 'rd'];
  return n + (sfx[(v - 20) % 10] || sfx[v] || sfx[0]);
}

function fmtKm(km: number): string {
  if (Math.abs(km - 42.195) < 0.1) return 'Marathon';
  if (Math.abs(km - 21.0975) < 0.1) return 'Half marathon';
  if (Math.abs(km - 10) < 0.1) return '10 km';
  if (Math.abs(km - 5) < 0.1) return '5 km';
  return `${km} km`;
}

function pctFmt(p: number): string {
  return p < 1 ? '<1%' : p >= 99.9 ? '>99%' : p.toFixed(1) + '%';
}

// ── Types ────────────────────────────────────────────────

type Mode = 'racetime' | 'athletes';
type Venue = 'akl' | 'chc' | 'rot' | 'hb' | 'qt';
type DistId = '42' | '21';

interface Placement { pos: number; total: number; beat: number; behind: number; pct: number; }
interface FieldStats { rows: ResultRow[]; winner: number; median: number; last: number; }
interface YearStripItem { year: number; cancelled?: boolean; percentile?: number; beat?: number; behind?: number; finishers?: number; medianSec?: number; loading?: boolean; }
interface BestRace { year: number; raceName: string; equivSec: number; pos: number; total: number; pct: number; }
interface H2HRow { name: string; time: string; pos: number; cat: string; sec: number; foundRace?: string; foundYear?: number; }

interface SharedRace {
  year: number;
  label: string;
  aSec: number;
  bSec: number;
  aWon: boolean;
  dist: string;
  aPos: number;
  bPos: number;
  aTotal: number;
  aPct: number;
  bPct: number;
}

interface FinishRecord {
  race: string;
  km: number;
  year: number;
  sec: number;
  pos: number;
  total: number;
  cat: string;
  club: string;
  percentile: number;
}

interface AthleteStats {
  finishes: FinishRecord[];
  totalFinishes: number;
  firstYear: number;
  latestYear: number;
  seasons: number[];
  activeYears: number;
  club: string;
  primaryDistances: number[];
  wins: number;
  podiums: number;
  top10s: number;
  bestPlacing: number;
  worstPlacing: number;
  avgPlacing: number;
  medianPlacing: number;
  avgPercentile: number;
  medianPercentile: number;
  bestPercentile: number;
  largeFieldPercentile: number | null;
  pctVariance: number;
  racesPerYear: number;
  peakSeason: number | null;
  peakSeasonPercentile: number | null;
  archetype: string;
}

// ── Race config ──────────────────────────────────────────

function getRaceConfig(venue: Venue, distId: DistId) {
  const isHalf = distId === '21';
  const km = isHalf ? '21.1 km' : '42.2 km';
  if (venue === 'akl') return {
    name: isHalf ? 'Auckland Half Marathon' : 'Auckland Marathon',
    km, years: [...YEARS] as number[],
    loadYear: (y: number) => loadResults(y, km as '42.2 km' | '21.1 km'),
    getYear: (y: number) => getCachedResults(y, km as '42.2 km' | '21.1 km'),
  };
  if (venue === 'chc') return {
    name: isHalf ? 'Christchurch Half Marathon' : 'Christchurch Marathon',
    km, years: [...CHC_YEARS] as number[],
    loadYear: (y: number) => isHalf ? loadChcHalf(y) : loadChc(y),
    getYear: (y: number) => isHalf ? getCachedChcHalf(y) : getCachedChc(y),
  };
  if (venue === 'hb') return {
    name: isHalf ? "Hawke's Bay Half Marathon" : "Hawke's Bay Marathon",
    km, years: [...HB_YEARS] as number[],
    loadYear: (y: number) => isHalf ? loadHbHalf(y) : loadHb(y),
    getYear: (y: number) => isHalf ? getCachedHbHalf(y) : getCachedHb(y),
  };
  if (venue === 'qt') return {
    name: isHalf ? 'Queenstown Half Marathon' : 'Queenstown Marathon',
    km, years: [...QT_YEARS] as number[],
    loadYear: (y: number) => isHalf ? loadQtHalf(y) : loadQt(y),
    getYear: (y: number) => isHalf ? getCachedQtHalf(y) : getCachedQt(y),
  };
  return {
    name: isHalf ? 'Rotorua Half Marathon' : 'Rotorua Marathon',
    km, years: [...ROTORUA_YEARS] as number[],
    loadYear: (y: number) => isHalf ? loadRotoruaHalf(y) : loadRotorua(y),
    getYear: (y: number) => isHalf ? getCachedRotoruaHalf(y) : getCachedRotorua(y),
  };
}

const ALL_RACES = [
  { name: 'Auckland Marathon',          km: 42.195,  years: [...YEARS],         getYear: (y: number) => getCachedResults(y, '42.2 km') },
  { name: 'Auckland Half Marathon',     km: 21.0975, years: [...YEARS],         getYear: (y: number) => getCachedResults(y, '21.1 km') },
  { name: 'Christchurch Marathon',      km: 42.195,  years: [...CHC_YEARS],     getYear: getCachedChc },
  { name: 'Christchurch Half Marathon', km: 21.0975, years: [...CHC_YEARS],     getYear: getCachedChcHalf },
  { name: 'Rotorua Marathon',           km: 42.195,  years: [...ROTORUA_YEARS], getYear: getCachedRotorua },
  { name: 'Rotorua Half Marathon',      km: 21.0975, years: [...ROTORUA_YEARS], getYear: getCachedRotoruaHalf },
  { name: "Hawke's Bay Marathon",       km: 42.195,  years: [...HB_YEARS],      getYear: getCachedHb },
  { name: "Hawke's Bay Half Marathon",  km: 21.0975, years: [...HB_YEARS],      getYear: getCachedHbHalf },
  { name: 'Queenstown Marathon',        km: 42.195,  years: [...QT_YEARS],      getYear: getCachedQt },
  { name: 'Queenstown Half Marathon',   km: 21.0975, years: [...QT_YEARS],      getYear: getCachedQtHalf },
];

// ── Stat helpers ──────────────────────────────────────────

function collectAllFinishes(name: string): FinishRecord[] {
  if (!name.trim()) return [];
  const lower = name.trim().toLowerCase();
  const records: FinishRecord[] = [];
  for (const rc of ALL_RACES) {
    for (const y of rc.years) {
      const rows = rc.getYear(y);
      if (rows.length === 0) continue;
      const hit = rows.find(r => r.name.toLowerCase() === lower);
      if (!hit) continue;
      const beat = rows.filter(r => r.sec > hit.sec).length;
      records.push({
        race: rc.name, km: rc.km, year: y, sec: hit.sec,
        pos: hit.pos, total: rows.length,
        cat: hit.cat, club: (hit as ResultRow & { club?: string }).club ?? '',
        percentile: (beat / rows.length) * 100,
      });
    }
  }
  return records.sort((a, b) => a.year - b.year);
}

function computeAthleteStats(finishes: FinishRecord[]): AthleteStats | null {
  if (finishes.length === 0) return null;
  const total = finishes.length;
  const years = finishes.map(f => f.year);
  const seasons = Array.from(new Set(years)).sort((a, b) => a - b);
  const firstYear = Math.min(...years);
  const latestYear = Math.max(...years);

  const sortedByYear = [...finishes].sort((a, b) => b.year - a.year);
  const club = sortedByYear.find(f => f.club)?.club ?? '';

  const distCount = new Map<number, number>();
  finishes.forEach(f => distCount.set(f.km, (distCount.get(f.km) ?? 0) + 1));
  const primaryDistances = Array.from(distCount.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([km]) => km);

  const placingsSorted = finishes.map(f => f.pos).sort((a, b) => a - b);
  const wins = finishes.filter(f => f.pos === 1).length;
  const podiums = finishes.filter(f => f.pos <= 3).length;
  const top10s = finishes.filter(f => f.pos <= 10).length;
  const bestPlacing = placingsSorted[0];
  const worstPlacing = placingsSorted[placingsSorted.length - 1];
  const avgPlacing = placingsSorted.reduce((a, b) => a + b, 0) / total;
  const medianPlacing = placingsSorted[Math.floor(total / 2)];

  const percentiles = finishes.map(f => f.percentile);
  const avgPercentile = percentiles.reduce((a, b) => a + b, 0) / total;
  const sortedPcts = [...percentiles].sort((a, b) => b - a);
  const medianPercentile = sortedPcts[Math.floor(total / 2)];
  const bestPercentile = sortedPcts[0];

  const pctVariance = Math.sqrt(
    percentiles.reduce((a, b) => a + Math.pow(b - avgPercentile, 2), 0) / total
  );

  const largeFin = finishes.filter(f => f.total > 500);
  const largeFieldPercentile = largeFin.length > 0
    ? largeFin.reduce((a, b) => a + b.percentile, 0) / largeFin.length : null;

  const racesPerYear = total / Math.max(1, seasons.length);

  const seasonPcts = new Map<number, number[]>();
  finishes.forEach(f => {
    if (!seasonPcts.has(f.year)) seasonPcts.set(f.year, []);
    seasonPcts.get(f.year)!.push(f.percentile);
  });
  let peakSeason: number | null = null;
  let peakSeasonPercentile: number | null = null;
  seasonPcts.forEach((pcts, year) => {
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    if (peakSeasonPercentile === null || avg > peakSeasonPercentile) {
      peakSeason = year; peakSeasonPercentile = avg;
    }
  });

  const marathonRatio = finishes.filter(f => Math.abs(f.km - 42.195) < 0.1).length / total;
  const halfRatio = finishes.filter(f => Math.abs(f.km - 21.0975) < 0.1).length / total;
  let archetype = 'Road generalist';
  if (total < 3) archetype = 'Limited record';
  else if (marathonRatio > 0.75) archetype = 'Marathon specialist';
  else if (halfRatio > 0.75) archetype = 'Half marathon specialist';
  else if (racesPerYear > 3.5) archetype = 'High-frequency racer';

  return {
    finishes, totalFinishes: total, firstYear, latestYear, seasons,
    activeYears: latestYear - firstYear + 1,
    club, primaryDistances, wins, podiums, top10s,
    bestPlacing, worstPlacing, avgPlacing, medianPlacing,
    avgPercentile, medianPercentile, bestPercentile,
    largeFieldPercentile, pctVariance, racesPerYear,
    peakSeason, peakSeasonPercentile, archetype,
  };
}

// ── Race-time canvas sub-components ──────────────────────

function FieldDistribution({ rows, sec, winner, last }: { rows: ResultRow[]; sec: number; winner: number; last: number }) {
  const W = 720, H = 60;
  const span = last - winner;
  const bins = 40;
  const counts = new Array(bins).fill(0);
  rows.forEach(r => {
    const i = Math.min(bins - 1, Math.max(0, Math.floor((r.sec - winner) / span * bins)));
    counts[i] += 1;
  });
  const max = Math.max(...counts);
  const bw = W / bins;
  const userX = span > 0 ? ((sec - winner) / span) * W : W / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {counts.map((c, i) => {
        const h = max > 0 ? (c / max) * (H - 8) : 0;
        return <rect key={i} x={i * bw + 0.5} y={H - h} width={bw - 1} height={h} fill="var(--rule)" />;
      })}
      <line x1="0" x2={W} y1={H} y2={H} stroke="var(--rule)" strokeWidth="0.5" />
      {userX >= 0 && userX <= W && (
        <g>
          <line x1={userX} x2={userX} y1="0" y2={H} stroke="var(--aA)" strokeWidth="2" />
          <circle cx={userX} cy={2} r="3" fill="var(--aA)" />
        </g>
      )}
    </svg>
  );
}

function RaceTimeCanvas({
  sec, raceName, dist, year, gender, placement, fieldStats, yearStrip,
  hoveredYear, setHoveredYear, bestRace, interpretation,
}: {
  sec: number | null; raceName: string; dist: string; year: number; gender: string;
  placement: Placement | null; fieldStats: FieldStats | null;
  yearStrip: YearStripItem[]; hoveredYear: number | null;
  setHoveredYear: (y: number | null) => void;
  bestRace: BestRace | null;
  interpretation: { kind: string; [k: string]: unknown };
}) {
  const valid = yearStrip.filter(d => !d.cancelled && d.behind !== undefined) as Required<YearStripItem>[];
  const best = valid.length > 0 ? valid.reduce((a, b) => a.percentile < b.percentile ? a : b, valid[0]) : null;

  const gapToMedian = sec != null && fieldStats ? fieldStats.median - sec : null;

  return (
    <div>
      <div className="canvas-head">
        <div className="eyebrow">{`Field stack-up · ${raceName} ${year}`}</div>
        <button className="canvas-share">Share ↗</button>
      </div>

      {sec == null && interpretation.kind === 'empty' && (
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', color: 'var(--meta)', fontSize: 16, lineHeight: 1.6 }}>
          Enter a finish time, athlete name, or bib number in the left panel to compare.
        </div>
      )}

      {sec == null && interpretation.kind === 'unknown' && (
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', color: 'var(--meta)', fontSize: 16, lineHeight: 1.6 }}>
          Couldn't read "{(interpretation as { kind: string; text: string }).text}" — try a time like 3:15:00, a name, or a bib.
        </div>
      )}

      {sec != null && placement && (
        <>
          <div className="rt-hero">
            <div className="rt-cell">
              <div className="k">Overall placement</div>
              <div className="v">
                {placement.pos.toLocaleString()}
                <span className="sup-ord">th</span>
              </div>
              <div className="of">of <span className="v2">{placement.total.toLocaleString()}</span> finishers</div>
            </div>
            <div className="rt-cell">
              <div className="k">Percentile</div>
              <div className="v accent">
                {placement.pct < 1 ? '<1' : placement.pct.toFixed(1)}
                <span style={{ color: 'var(--meta)', fontSize: 32, verticalAlign: 6, marginLeft: 1 }}>%</span>
              </div>
              <div className="of">faster than <span className="v2">{placement.beat.toLocaleString()}</span> finishers</div>
            </div>
            <div className="rt-cell">
              <div className="k">Gap to median</div>
              <div className="v" style={{ fontSize: 40 }}>
                {gapToMedian != null ? (gapToMedian > 0 ? '−' : '+') + fmtSec(Math.abs(gapToMedian)) : '—'}
              </div>
              <div className="of">to <span className="v2">{fmtSec(fieldStats?.median)}</span> · {year}</div>
            </div>
          </div>

          {fieldStats && (
            <div style={{ marginTop: 32 }}>
              <div className="label mb-16">Field distribution · {gender === 'M' ? 'Men' : gender === 'W' ? 'Women' : 'All'} · {dist}</div>
              <FieldDistribution rows={fieldStats.rows} sec={sec} winner={fieldStats.winner} last={fieldStats.last} />
              <div className="flex between mt-8" style={{ fontSize: 11 }}>
                <span className="mono dimmed">{fmtSec(fieldStats.winner)} winner</span>
                <span className="mono dimmed">Median {fmtSec(fieldStats.median)}</span>
                <span className="mono dimmed">{fmtSec(fieldStats.last)} last</span>
              </div>
            </div>
          )}
        </>
      )}

      {sec != null && yearStrip.length > 0 && (
        <div className="cmp-sect">
          <div className="cmp-sect-head">
            <div className="cmp-sect-num">No. 01</div>
            <h2>Year on year · {raceName}</h2>
            <div className="cmp-sect-note">How {fmtSec(sec)} would have placed each year</div>
          </div>
          <div className="year-strip-scroll">
            <div className="year-strip">
              {yearStrip.map(d => {
                if (d.cancelled) return (
                  <div key={d.year} className="year-tile cancelled">
                    <div className="year-tile-y">{d.year}</div>
                    <div className="year-tile-cancelled">CXL</div>
                  </div>
                );
                if (d.loading || d.behind === undefined) return (
                  <div key={d.year} className="year-tile" style={{ opacity: 0.4 }}>
                    <div className="year-tile-y">{d.year}</div>
                    <div className="year-tile-cancelled">…</div>
                  </div>
                );
                const isBest = best?.year === d.year;
                return (
                  <button key={d.year}
                    className={`year-tile${isBest ? ' best' : ''}${hoveredYear === d.year ? ' hover' : ''}`}
                    onMouseEnter={() => setHoveredYear(d.year)}
                    onMouseLeave={() => setHoveredYear(null)}>
                    <div className="year-tile-y">{d.year}</div>
                    <div className="year-tile-pos serif">{ordSuffix((d.behind ?? 0) + 1)}</div>
                    <div className="year-tile-pct">{(d.percentile ?? 0) < 1 ? '<1%' : (d.percentile ?? 0).toFixed(1) + '%'}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {best && (
            <div style={{ marginTop: 16, fontSize: 13, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', color: 'var(--meta)' }}>
              Best placement:{' '}
              <span style={{ color: 'var(--aA)', fontStyle: 'normal', fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.04em' }}>
                {best.year} · {ordSuffix(best.behind + 1)} overall
              </span>
            </div>
          )}
        </div>
      )}

      {sec != null && bestRace && (
        <div className="cmp-sect">
          <div className="cmp-sect-head">
            <div className="cmp-sect-num">No. 02</div>
            <h2>Best race for your time</h2>
            <div className="cmp-sect-note">Highest-percentile finish across all events · Riegel-equivalent</div>
          </div>
          <div className="cmp-card cmp-card-dark">
            <div className="label mb-8" style={{ color: 'var(--on-dark-meta)' }}>All events · all years</div>
            <div className="serif" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: 4 }}>{bestRace.raceName} {bestRace.year}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 12, color: 'var(--on-dark-meta)', fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
              {fmtSec(sec)}{Math.abs(bestRace.equivSec - sec) > 2 ? ` (${fmtSec(bestRace.equivSec)} equivalent)` : ''} would have placed highest here.
            </div>
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '0.5px solid var(--on-dark-rule)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div className="label" style={{ color: 'var(--on-dark-meta)' }}>Overall</div>
                <div className="serif" style={{ fontSize: 40, lineHeight: 1, marginTop: 8, letterSpacing: '-0.02em' }}>{ordSuffix(bestRace.pos)}</div>
              </div>
              <div>
                <div className="label" style={{ color: 'var(--on-dark-meta)' }}>Percentile</div>
                <div className="serif" style={{ fontSize: 40, lineHeight: 1, marginTop: 8, letterSpacing: '-0.02em', color: 'var(--aA)' }}>
                  {bestRace.pct < 1 ? '<1' : bestRace.pct.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Athletes canvas sub-components ───────────────────────

function AthleteCard({ side, row, careerBests, raceName, year, stats,
  searchValue, setSearchValue, dropOpen, setDropOpen, searchRef,
}: {
  side: 'a' | 'b';
  row: H2HRow | null;
  careerBests: { km: number; sec: number; leadA: boolean }[];
  raceName: string;
  year: number;
  stats: AthleteStats | null;
  searchValue: string;
  setSearchValue: (v: string) => void;
  dropOpen: boolean;
  setDropOpen: (v: boolean) => void;
  searchRef: React.RefObject<HTMLDivElement>;
}) {
  const num = side === 'a' ? '01' : '02';
  const firstName = row ? row.name.split(' ')[0] : '';
  const lastName = row ? row.name.split(' ').slice(1).join(' ') || row.name : (side === 'a' ? 'Athlete A' : 'Athlete B');

  if (!row) {
    return (
      <div className={`ath-card ${side}`}>
        <div className="ath-badge"><span className="no">{num}</span></div>
        <h2 className="ath-card-title">{side === 'a' ? 'Athlete A' : 'Athlete B'}</h2>
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div className="ath-card-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flex: '0 0 auto', color: 'var(--meta)' }}>
              <circle cx="10.5" cy="10.5" r="6.5" /><line x1="15.5" y1="15.5" x2="21" y2="21" />
            </svg>
            <input
              value={searchValue}
              onChange={e => { setSearchValue(e.target.value); setDropOpen(e.target.value.length >= 2); }}
              onKeyDown={e => { if (e.key === 'Escape') setDropOpen(false); }}
              placeholder="Search athlete name, bib, or recorded finish…"
              spellCheck={false}
              autoComplete="off"
            />
            {searchValue && (
              <button className="clear-btn" onClick={() => { setSearchValue(''); setDropOpen(false); }}>×</button>
            )}
          </div>
          {dropOpen && (
            <AthleteNameDropdown
              query={searchValue}
              onSelect={name => { setSearchValue(name); setDropOpen(false); }}
              onClose={() => setDropOpen(false)}
            />
          )}
        </div>
        <div className="ath-popular">
          <div className="ath-popular-lbl">Popular searches</div>
          <div className="ath-popular-chips">
            {POPULAR_ATHLETES.map(name => (
              <button key={name} className="ath-chip" onClick={() => { setSearchValue(name); setDropOpen(false); }}>
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`ath-card ${side}`}>
      <div className="ath-badge">
        <span className="no">{num}</span>
        <span className="first">{firstName}</span>
      </div>
      <h2 className="ath-last">{lastName}</h2>

      {/* Identity block */}
      <div className="ath-identity">
        {stats?.club && (
          <div className="ath-id-row">
            <span className="k">Club</span>
            <span className="v">{stats.club}</span>
          </div>
        )}
        {stats && (
          <>
            <div className="ath-id-row">
              <span className="k">Active</span>
              <span className="v">
                {stats.firstYear === stats.latestYear
                  ? `${stats.firstYear}`
                  : `${stats.firstYear}–${stats.latestYear}`}
              </span>
            </div>
            <div className="ath-id-row">
              <span className="k">On file</span>
              <span className="v">{stats.totalFinishes} finish{stats.totalFinishes !== 1 ? 'es' : ''}</span>
            </div>
            <div className="ath-id-row">
              <span className="k">Primary</span>
              <span className="v">{stats.primaryDistances.map(fmtKm).join(' · ')}</span>
            </div>
          </>
        )}
        {!stats && (
          <div className="ath-id-row">
            <span className="k">First found</span>
            <span className="v">{row.foundRace ?? raceName} {row.foundYear ?? year}</span>
          </div>
        )}
      </div>

      {stats && (
        <div className="ath-archetype">{stats.archetype}</div>
      )}

      {careerBests.length > 0 && (
        <>
          <div className="ath-section-title">Career bests on file</div>
          <ul className="ath-pbs">
            {careerBests.map(({ km, sec, leadA }) => {
              const isLead = (side === 'a' && leadA) || (side === 'b' && !leadA);
              return (
                <li key={km} className={isLead ? 'lead' : 'trail'}>
                  <span className="k">{fmtKm(km)}</span>
                  <span className="v">{fmtSec(sec)}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="ath-section-title">Most recent finish</div>
      <div className="ath-summary">
        <div className="stat"><div className="k">Pos</div><div className="v">{row.pos}</div></div>
        <div className="stat"><div className="k">Time</div><div className="v" style={{ fontSize: 18 }}>{row.time}</div></div>
        <div className="stat"><div className="k">Cat</div><div className="v" style={{ fontSize: 16 }}>{row.cat}</div></div>
        <div className="stat"><div className="k">Year</div><div className="v" style={{ fontSize: 18 }}>{row.foundYear ?? year}</div></div>
      </div>
    </div>
  );
}

function EdgeBar({ aName, bName, edgePct, avgGapSec, seriesRecord, narrowestGapSec, totalRaces }: {
  aName: string; bName: string; edgePct: number;
  avgGapSec: number; seriesRecord: [number, number];
  narrowestGapSec: number; totalRaces: number;
}) {
  const aLeads = edgePct >= 0;
  const absPct = Math.abs(edgePct);
  const markerPct = Math.max(2, Math.min(98, 50 - edgePct * 10));
  const fillLeft = aLeads ? markerPct : 50;
  const fillWidth = Math.abs(50 - markerPct);
  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;

  return (
    <div className="edge-bar">
      <div className="eb-head">
        <div>
          <div className="eb-label">Edge overall · {totalRaces} shared race{totalRaces !== 1 ? 's' : ''}</div>
        </div>
        <div className={`eb-featured${aLeads ? '' : ' b'}`}>
          <span className="who">{aLeads ? aName.split(' ')[0] + '. ' + (aName.split(' ').slice(1).join(' ') || '') : bName.split(' ')[0] + '. ' + (bName.split(' ').slice(1).join(' ') || '')}</span>
          <span className="pct">+{absPct.toFixed(1)}<span className="unit">%</span></span>
          <span className="by">faster</span>
        </div>
        <div className="eb-right">
          <div className="eb-label">Race time · actual</div>
        </div>
      </div>

      <div className="eb-axis-wrap">
        <span className="eb-name-a">{aShort}</span>
        <div className="eb-track" />
        <div
          className={`eb-fill${aLeads ? '' : ' b-side'}`}
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
        />
        <div className="eb-center-line" />
        <div
          className={`eb-marker${aLeads ? '' : ' b-side'}`}
          style={{ left: `${markerPct}%` }}
        />
        <span className="eb-name-b">{bShort}</span>
      </div>

      <div className="eb-ticks">
        <span>−5%</span>
        <span>−2.5%</span>
        <span>0</span>
        <span>+2.5%</span>
        <span>+5%</span>
      </div>

      <div className="eb-foot">
        <div className="eb-foot-stat">
          <div className="k">Average gap</div>
          <div className={`v ${aLeads ? 'a' : 'b'}`}>{aLeads ? '+' : '−'}{fmtSec(avgGapSec)}</div>
          <div className="vm">per shared meeting</div>
        </div>
        <div className="eb-foot-stat">
          <div className="k">Series record</div>
          <div className="v">{seriesRecord[0]} — {seriesRecord[1]}</div>
          <div className="vm">A — B convention</div>
        </div>
        <div className="eb-foot-stat">
          <div className="k">Narrowest meeting</div>
          <div className="v">{fmtSec(narrowestGapSec)}</div>
          <div className="vm">closest finish on file</div>
        </div>
        <div className="eb-foot-stat">
          <div className="k">Confidence</div>
          <div className="v">{totalRaces >= 5 ? 'High' : totalRaces >= 2 ? 'Moderate' : 'Low'}</div>
          <div className="vm">≥ 5 shared races = high</div>
        </div>
      </div>
    </div>
  );
}

// ── § 01 — Raw performance metrics ───────────────────────

function RawMetricsSection({ aName, bName, aStats, bStats }: {
  aName: string; bName: string;
  aStats: AthleteStats | null; bStats: AthleteStats | null;
}) {
  if (!aStats && !bStats) return null;

  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;

  type DuelRow = { label: string; aVal: string; bVal: string; aLeads?: boolean | null };

  const rows: DuelRow[] = [
    {
      label: 'Finishes on file',
      aVal: aStats ? aStats.totalFinishes.toString() : '—',
      bVal: bStats ? bStats.totalFinishes.toString() : '—',
      aLeads: aStats && bStats ? aStats.totalFinishes >= bStats.totalFinishes : null,
    },
    {
      label: 'Wins',
      aVal: aStats ? aStats.wins.toString() : '—',
      bVal: bStats ? bStats.wins.toString() : '—',
      aLeads: aStats && bStats ? aStats.wins > bStats.wins : null,
    },
    {
      label: 'Podiums',
      aVal: aStats ? aStats.podiums.toString() : '—',
      bVal: bStats ? bStats.podiums.toString() : '—',
      aLeads: aStats && bStats ? aStats.podiums > bStats.podiums : null,
    },
    {
      label: 'Top-10 finishes',
      aVal: aStats ? aStats.top10s.toString() : '—',
      bVal: bStats ? bStats.top10s.toString() : '—',
      aLeads: aStats && bStats ? aStats.top10s > bStats.top10s : null,
    },
    {
      label: 'Best placing',
      aVal: aStats ? ordSuffix(aStats.bestPlacing) : '—',
      bVal: bStats ? ordSuffix(bStats.bestPlacing) : '—',
      aLeads: aStats && bStats ? aStats.bestPlacing < bStats.bestPlacing : null,
    },
    {
      label: 'Average placing',
      aVal: aStats ? ordSuffix(Math.round(aStats.avgPlacing)) : '—',
      bVal: bStats ? ordSuffix(Math.round(bStats.avgPlacing)) : '—',
      aLeads: aStats && bStats ? aStats.avgPlacing < bStats.avgPlacing : null,
    },
    {
      label: 'Median placing',
      aVal: aStats ? ordSuffix(aStats.medianPlacing) : '—',
      bVal: bStats ? ordSuffix(bStats.medianPlacing) : '—',
      aLeads: aStats && bStats ? aStats.medianPlacing < bStats.medianPlacing : null,
    },
    {
      label: 'Worst placing',
      aVal: aStats ? ordSuffix(aStats.worstPlacing) : '—',
      bVal: bStats ? ordSuffix(bStats.worstPlacing) : '—',
      aLeads: aStats && bStats ? aStats.worstPlacing < bStats.worstPlacing : null,
    },
  ];

  const bothPresent = aStats && bStats;

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 01</div>
        <h2>Raw performance metrics</h2>
        <div className="cmp-sect-note">Across all certified finishes on file</div>
      </div>

      <div className="metrics-duel">
        <div className="md-names">
          <span className="a">{aShort}</span>
          <span className="sep" />
          <span className="b">{bShort}</span>
        </div>
        {rows.map(row => (
          <div key={row.label} className="md-row">
            <span className={`a-val${bothPresent && row.aLeads === true ? ' leads' : bothPresent && row.aLeads === false ? ' trails' : ''}`}>
              {row.aVal}
            </span>
            <span className="md-label">{row.label}</span>
            <span className={`b-val${bothPresent && row.aLeads === false ? ' leads' : bothPresent && row.aLeads === true ? ' trails' : ''}`}>
              {row.bVal}
            </span>
          </div>
        ))}
      </div>

      {bothPresent && (
        <div className="tbl-foot">
          <span>
            {aStats!.wins > bStats!.wins
              ? `${aShort} holds an edge in win count across the archive.`
              : bStats!.wins > aStats!.wins
              ? `${bShort} holds an edge in win count across the archive.`
              : aStats!.avgPlacing < bStats!.avgPlacing
              ? `${aShort} holds a narrower average placing across the archive.`
              : bStats!.avgPlacing < aStats!.avgPlacing
              ? `${bShort} holds a narrower average placing across the archive.`
              : 'Closely matched across the archive.'}
          </span>
        </div>
      )}
    </section>
  );
}

// ── § 02 — Field-normalized metrics ──────────────────────

function FieldNormalizedSection({ aName, bName, aStats, bStats }: {
  aName: string; bName: string;
  aStats: AthleteStats | null; bStats: AthleteStats | null;
}) {
  if (!aStats && !bStats) return null;

  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;
  const bothPresent = aStats && bStats;

  type DuelRow = { label: string; note: string; aVal: string; bVal: string; aLeads?: boolean | null };

  const rows: DuelRow[] = [
    {
      label: 'Average percentile',
      note: 'Mean finishing percentile',
      aVal: aStats ? pctFmt(aStats.avgPercentile) : '—',
      bVal: bStats ? pctFmt(bStats.avgPercentile) : '—',
      aLeads: aStats && bStats ? aStats.avgPercentile > bStats.avgPercentile : null,
    },
    {
      label: 'Median percentile',
      note: 'More stable measure of typical performance',
      aVal: aStats ? pctFmt(aStats.medianPercentile) : '—',
      bVal: bStats ? pctFmt(bStats.medianPercentile) : '—',
      aLeads: aStats && bStats ? aStats.medianPercentile > bStats.medianPercentile : null,
    },
    {
      label: 'Peak percentile',
      note: 'Strongest single-race field-relative performance',
      aVal: aStats ? pctFmt(aStats.bestPercentile) : '—',
      bVal: bStats ? pctFmt(bStats.bestPercentile) : '—',
      aLeads: aStats && bStats ? aStats.bestPercentile > bStats.bestPercentile : null,
    },
    {
      label: 'Large-field average',
      note: 'Performance in fields above 500 finishers',
      aVal: aStats ? (aStats.largeFieldPercentile != null ? pctFmt(aStats.largeFieldPercentile) : 'n/a') : '—',
      bVal: bStats ? (bStats.largeFieldPercentile != null ? pctFmt(bStats.largeFieldPercentile) : 'n/a') : '—',
      aLeads: aStats?.largeFieldPercentile != null && bStats?.largeFieldPercentile != null
        ? aStats.largeFieldPercentile > bStats.largeFieldPercentile : null,
    },
    {
      label: 'Percentile spread',
      note: 'Standard deviation across all races — lower = more consistent',
      aVal: aStats ? `±${aStats.pctVariance.toFixed(1)}pp` : '—',
      bVal: bStats ? `±${bStats.pctVariance.toFixed(1)}pp` : '—',
      aLeads: aStats && bStats ? aStats.pctVariance < bStats.pctVariance : null,
    },
  ];

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 02</div>
        <h2>Field-normalized metrics</h2>
        <div className="cmp-sect-note">Performance relative to field depth · not absolute time</div>
      </div>

      <div className="metrics-duel">
        <div className="md-names">
          <span className="a">{aShort}</span>
          <span className="sep" />
          <span className="b">{bShort}</span>
        </div>
        {rows.map(row => (
          <div key={row.label} className="md-row">
            <span className={`a-val${bothPresent && row.aLeads === true ? ' leads' : bothPresent && row.aLeads === false ? ' trails' : ''}`}>
              {row.aVal}
            </span>
            <div className="md-label-stack">
              <span className="md-label">{row.label}</span>
              <span className="md-note">{row.note}</span>
            </div>
            <span className={`b-val${bothPresent && row.aLeads === false ? ' leads' : bothPresent && row.aLeads === true ? ' trails' : ''}`}>
              {row.bVal}
            </span>
          </div>
        ))}
      </div>

      {bothPresent && (
        <div className="tbl-foot">
          <span>
            {aStats!.avgPercentile > bStats!.avgPercentile
              ? `${aShort} holds a higher average percentile across the archive — ${(aStats!.avgPercentile - bStats!.avgPercentile).toFixed(1)} percentile points.`
              : bStats!.avgPercentile > aStats!.avgPercentile
              ? `${bShort} holds a higher average percentile across the archive — ${(bStats!.avgPercentile - aStats!.avgPercentile).toFixed(1)} percentile points.`
              : 'Closely matched field-relative performance across the archive.'}
          </span>
        </div>
      )}
    </section>
  );
}

// ── § 03 — Shared race ledger ─────────────────────────────

function SharedRaceLedger({ aName, bName, races }: {
  aName: string; bName: string; races: SharedRace[];
}) {
  const aShort = (aName.split(' ').pop() || aName).slice(0, 12);
  const bShort = (bName.split(' ').pop() || bName).slice(0, 12);
  const aWins = races.filter(r => r.aWon).length;
  const bWins = races.filter(r => !r.aWon).length;

  const avgMargin = races.length > 0
    ? races.reduce((s, r) => s + Math.abs(r.aSec - r.bSec), 0) / races.length : 0;
  const closestRace = races.length > 0
    ? races.reduce((best, r) => Math.abs(r.aSec - r.bSec) < Math.abs(best.aSec - best.bSec) ? r : best, races[0]) : null;
  const largestMarginRace = races.length > 0
    ? races.reduce((best, r) => Math.abs(r.aSec - r.bSec) > Math.abs(best.aSec - best.bSec) ? r : best, races[0]) : null;

  const distCounts = new Map<string, { a: number; b: number }>();
  races.forEach(r => {
    if (!distCounts.has(r.dist)) distCounts.set(r.dist, { a: 0, b: 0 });
    const e = distCounts.get(r.dist)!;
    if (r.aWon) e.a++; else e.b++;
  });

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 03</div>
        <h2>Shared race ledger</h2>
        <div className="cmp-sect-note">{races.length} meeting{races.length !== 1 ? 's' : ''} on file · A — B gap convention</div>
      </div>

      <table className="h2h-tbl">
        <thead>
          <tr>
            <th>Race · edition</th>
            <th style={{ width: 120 }}>{aShort}</th>
            <th style={{ width: 120 }}>{bShort}</th>
            <th style={{ width: 70 }}>Gap</th>
            <th style={{ width: 90 }}>Pct edge</th>
          </tr>
        </thead>
        <tbody>
          {races.map((r, i) => {
            const pctDiff = r.aPct - r.bPct;
            const pctEdgeLabel = Math.abs(pctDiff) < 0.5
              ? '≈'
              : pctDiff > 0
              ? `A +${pctDiff.toFixed(1)}pp`
              : `B +${Math.abs(pctDiff).toFixed(1)}pp`;
            const pctEdgeClass = Math.abs(pctDiff) < 0.5
              ? '' : pctDiff > 0 ? 'pct-a' : 'pct-b';
            return (
              <tr key={i}>
                <td>
                  <span className="race-em">{r.label}</span>
                  <span className="race-lo">{r.dist}</span>
                </td>
                <td className={`ti ${r.aWon ? 'lead' : 'trail'}`}>
                  {fmtSec(r.aSec)}
                  <span className="pos-sub">{ordSuffix(r.aPos)}</span>
                </td>
                <td className={`ti ${r.aWon ? 'trail' : 'lead'}`}>
                  {fmtSec(r.bSec)}
                  <span className="pos-sub">{ordSuffix(r.bPos)}</span>
                </td>
                <td className={r.aWon ? 'gap-pos' : 'gap-neg'}>
                  {r.aWon ? '+' : '−'}{fmtSec(Math.abs(r.aSec - r.bSec))}
                </td>
                <td className={`pct-edge ${pctEdgeClass}`}>{pctEdgeLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="tbl-foot">
        <span>
          {aShort} leads {aWins} — {bWins} {bShort}
          {aWins === bWins ? ' · evenly matched' : ''}
        </span>
        <span>▸ marks the faster finisher</span>
      </div>

      {/* Derived insights */}
      {races.length >= 2 && (
        <div className="h2h-insights">
          <div className="h2h-insight-row">
            <div className="h2h-insight">
              <div className="k">Average margin</div>
              <div className="v">{fmtSec(avgMargin)}</div>
            </div>
            {closestRace && (
              <div className="h2h-insight">
                <div className="k">Closest meeting</div>
                <div className="v">{fmtSec(Math.abs(closestRace.aSec - closestRace.bSec))}</div>
                <div className="vm">{closestRace.label}</div>
              </div>
            )}
            {largestMarginRace && (
              <div className="h2h-insight">
                <div className="k">Largest margin</div>
                <div className="v">{fmtSec(Math.abs(largestMarginRace.aSec - largestMarginRace.bSec))}</div>
                <div className="vm">{largestMarginRace.label}</div>
              </div>
            )}
            <div className="h2h-insight">
              <div className="k">Distance split</div>
              <div className="v" style={{ fontSize: 13, lineHeight: 1.4 }}>
                {Array.from(distCounts.entries()).map(([dist, v]) =>
                  `${dist}: ${v.a}–${v.b}`
                ).join(' · ')}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── § 04 — Consistency & longevity ───────────────────────

function ConsistencyLongevitySection({ aName, bName, aStats, bStats }: {
  aName: string; bName: string;
  aStats: AthleteStats | null; bStats: AthleteStats | null;
}) {
  if (!aStats && !bStats) return null;

  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;
  const bothPresent = aStats && bStats;

  type DuelRow = { label: string; note: string; aVal: string; bVal: string; aLeads?: boolean | null };

  const rows: DuelRow[] = [
    {
      label: 'Active years',
      note: 'First to latest recorded finish',
      aVal: aStats
        ? (aStats.firstYear === aStats.latestYear ? `${aStats.firstYear}` : `${aStats.firstYear}–${aStats.latestYear}`)
        : '—',
      bVal: bStats
        ? (bStats.firstYear === bStats.latestYear ? `${bStats.firstYear}` : `${bStats.firstYear}–${bStats.latestYear}`)
        : '—',
      aLeads: aStats && bStats ? aStats.activeYears >= bStats.activeYears : null,
    },
    {
      label: 'Seasons raced',
      note: 'Distinct years with at least one finish',
      aVal: aStats ? aStats.seasons.length.toString() : '—',
      bVal: bStats ? bStats.seasons.length.toString() : '—',
      aLeads: aStats && bStats ? aStats.seasons.length >= bStats.seasons.length : null,
    },
    {
      label: 'Races per year',
      note: 'Average across seasons with finishes',
      aVal: aStats ? aStats.racesPerYear.toFixed(1) : '—',
      bVal: bStats ? bStats.racesPerYear.toFixed(1) : '—',
      aLeads: null,
    },
    {
      label: 'Percentile spread',
      note: 'Lower value indicates more consistent field-relative results',
      aVal: aStats ? `±${aStats.pctVariance.toFixed(1)}pp` : '—',
      bVal: bStats ? `±${bStats.pctVariance.toFixed(1)}pp` : '—',
      aLeads: aStats && bStats ? aStats.pctVariance < bStats.pctVariance : null,
    },
    {
      label: 'Peak season',
      note: 'Year with highest average percentile',
      aVal: aStats?.peakSeason != null ? `${aStats.peakSeason}` : '—',
      bVal: bStats?.peakSeason != null ? `${bStats.peakSeason}` : '—',
      aLeads: null,
    },
    {
      label: 'Peak season %ile',
      note: 'Average percentile across races in peak year',
      aVal: aStats?.peakSeasonPercentile != null ? pctFmt(aStats.peakSeasonPercentile) : '—',
      bVal: bStats?.peakSeasonPercentile != null ? pctFmt(bStats.peakSeasonPercentile) : '—',
      aLeads: aStats?.peakSeasonPercentile != null && bStats?.peakSeasonPercentile != null
        ? aStats.peakSeasonPercentile > bStats.peakSeasonPercentile : null,
    },
  ];

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 04</div>
        <h2>Consistency & longevity</h2>
        <div className="cmp-sect-note">Durability, reliability, and peak performance window</div>
      </div>

      <div className="metrics-duel">
        <div className="md-names">
          <span className="a">{aShort}</span>
          <span className="sep" />
          <span className="b">{bShort}</span>
        </div>
        {rows.map(row => (
          <div key={row.label} className="md-row">
            <span className={`a-val${bothPresent && row.aLeads === true ? ' leads' : bothPresent && row.aLeads === false ? ' trails' : ''}`}>
              {row.aVal}
            </span>
            <div className="md-label-stack">
              <span className="md-label">{row.label}</span>
              <span className="md-note">{row.note}</span>
            </div>
            <span className={`b-val${bothPresent && row.aLeads === false ? ' leads' : bothPresent && row.aLeads === true ? ' trails' : ''}`}>
              {row.bVal}
            </span>
          </div>
        ))}
      </div>

      {bothPresent && (
        <div className="tbl-foot">
          <span>
            {aStats!.activeYears > bStats!.activeYears
              ? `${aShort} has the longer archive footprint — ${aStats!.activeYears} years spanning the record.`
              : bStats!.activeYears > aStats!.activeYears
              ? `${bShort} has the longer archive footprint — ${bStats!.activeYears} years spanning the record.`
              : `Both athletes share a ${aStats!.activeYears}-year archive span.`}
          </span>
        </div>
      )}
    </section>
  );
}

// ── § 05 — Progression ───────────────────────────────────

function ProgressionSection({ aName, bName, aData, bData }: {
  aName: string; bName: string;
  aData: { year: number; sec: number; km: number }[];
  bData: { year: number; sec: number; km: number }[];
}) {
  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;

  const allKms = Array.from(new Set([...aData.map(d => d.km), ...bData.map(d => d.km)])).sort((a, b) => b - a);
  const kmsWithData = allKms.filter(km => {
    const a = aData.filter(d => d.km === km);
    const b = bData.filter(d => d.km === km);
    return a.length + b.length >= 2;
  });

  if (kmsWithData.length === 0) return null;

  const W = 220, H = 110, PAD = 22;
  const usableW = W - PAD;
  const usableH = H - 20;

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 05</div>
        <h2>Progression · all courses</h2>
        <div className="cmp-sect-note">Faster sits higher · each point is a recorded finish</div>
      </div>

      <div className="prog-shell">
        <div className="prog-legend">
          <span className="item"><span className="swatch" /><span className="name">{aShort}</span></span>
          <span className="item"><span className="swatch b" /><span className="name">{bShort}</span></span>
        </div>

        <div className="shape-grid">
          {kmsWithData.map(km => {
            const aKm = aData.filter(d => d.km === km).sort((a, b) => a.year - b.year);
            const bKm = bData.filter(d => d.km === km).sort((a, b) => a.year - b.year);
            const allYears = Array.from(new Set([...aKm.map(d => d.year), ...bKm.map(d => d.year)])).sort();
            const allSecs = [...aKm.map(d => d.sec), ...bKm.map(d => d.sec)];
            const minSec = Math.min(...allSecs);
            const maxSec = Math.max(...allSecs);
            const range = maxSec - minSec || 1;

            const toX = (year: number) => PAD + ((year - allYears[0]) / (allYears[allYears.length - 1] - allYears[0] || 1)) * usableW;
            const toY = (sec: number) => 10 + ((sec - minSec) / range) * usableH;
            const path = (pts: { year: number; sec: number }[]) => pts.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.year).toFixed(1)},${toY(d.sec).toFixed(1)}`).join(' ');

            const aBest = aKm.length ? aKm.reduce((a, b) => a.sec < b.sec ? a : b) : null;
            const bBest = bKm.length ? bKm.reduce((a, b) => a.sec < b.sec ? a : b) : null;
            const aLeads = aBest && bBest ? aBest.sec < bBest.sec : null;

            return (
              <div key={km} className="shape-cell">
                <div className="sh">
                  <span>{fmtKm(km)}</span>
                  {aBest && bBest && aLeads !== null && (
                    <span className={`edge-mark ${aLeads ? 'a' : 'b'}`}>
                      {aLeads ? 'A' : 'B'} · {fmtSec(Math.abs(aBest.sec - bBest.sec))} ahead
                    </span>
                  )}
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
                  <line x1={PAD} x2={W} y1={H / 3} y2={H / 3} stroke="currentColor" strokeOpacity="0.06" />
                  <line x1={PAD} x2={W} y1={H * 2 / 3} y2={H * 2 / 3} stroke="currentColor" strokeOpacity="0.06" />
                  {aKm.length > 0 && <path d={path(aKm)} fill="none" stroke="var(--aA)" strokeWidth="1.2" />}
                  {aKm.map(d => <circle key={d.year} cx={toX(d.year)} cy={toY(d.sec)} r="2" fill="var(--aA)" />)}
                  {bKm.length > 0 && <path d={path(bKm)} fill="none" stroke="var(--aB)" strokeWidth="1.2" />}
                  {bKm.map(d => <circle key={d.year} cx={toX(d.year)} cy={toY(d.sec)} r="2" fill="var(--aB)" />)}
                </svg>
                <div className="yrs">
                  {allYears.map(y => <span key={y}>'{String(y).slice(2)}</span>)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="prog-foot">
          <span>Best per year per distance across all courses on file</span>
          <span>Edge marks · A — B sign convention</span>
        </div>
      </div>
    </section>
  );
}

// ── § 06 — Historical context ─────────────────────────────

function HistoricalContextSection({ aName, bName, aStats, bStats }: {
  aName: string; bName: string;
  aStats: AthleteStats | null; bStats: AthleteStats | null;
}) {
  if (!aStats && !bStats) return null;

  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;

  const getTopRace = (stats: AthleteStats | null): string => {
    if (!stats) return '—';
    const raceCounts = new Map<string, number>();
    stats.finishes.forEach(f => raceCounts.set(f.race, (raceCounts.get(f.race) ?? 0) + 1));
    let top = ''; let topCount = 0;
    raceCounts.forEach((count, race) => { if (count > topCount) { top = race; topCount = count; } });
    return topCount > 1 ? `${top} (×${topCount})` : top;
  };

  const getSeriesCount = (stats: AthleteStats | null): string => {
    if (!stats) return '—';
    return String(new Set(stats.finishes.map(f => f.race)).size);
  };

  const bothPresent = aStats && bStats;

  type DuelRow = { label: string; note: string; aVal: string; bVal: string; aLeads?: boolean | null };

  const rows: DuelRow[] = [
    {
      label: 'First recorded',
      note: 'Earliest finish in the archive',
      aVal: aStats ? `${aStats.firstYear}` : '—',
      bVal: bStats ? `${bStats.firstYear}` : '—',
      aLeads: aStats && bStats ? aStats.firstYear <= bStats.firstYear : null,
    },
    {
      label: 'Latest recorded',
      note: 'Most recent finish in the archive',
      aVal: aStats ? `${aStats.latestYear}` : '—',
      bVal: bStats ? `${bStats.latestYear}` : '—',
      aLeads: null,
    },
    {
      label: 'Archive span',
      note: 'Years between first and latest finish',
      aVal: aStats ? `${aStats.activeYears} yr${aStats.activeYears !== 1 ? 's' : ''}` : '—',
      bVal: bStats ? `${bStats.activeYears} yr${bStats.activeYears !== 1 ? 's' : ''}` : '—',
      aLeads: aStats && bStats ? aStats.activeYears >= bStats.activeYears : null,
    },
    {
      label: 'Race series covered',
      note: 'Distinct race events with at least one finish',
      aVal: getSeriesCount(aStats),
      bVal: getSeriesCount(bStats),
      aLeads: aStats && bStats
        ? new Set(aStats.finishes.map(f => f.race)).size >= new Set(bStats.finishes.map(f => f.race)).size
        : null,
    },
    {
      label: 'Most appearances',
      note: 'Race series with highest repeat attendance',
      aVal: getTopRace(aStats),
      bVal: getTopRace(bStats),
      aLeads: null,
    },
    {
      label: 'Archive category',
      note: 'Registered competitive category (most recent)',
      aVal: aStats ? (aStats.finishes[aStats.finishes.length - 1]?.cat || '—') : '—',
      bVal: bStats ? (bStats.finishes[bStats.finishes.length - 1]?.cat || '—') : '—',
      aLeads: null,
    },
  ];

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 06</div>
        <h2>Historical context</h2>
        <div className="cmp-sect-note">Placement within the broader archive · era and footprint</div>
      </div>

      <div className="metrics-duel">
        <div className="md-names">
          <span className="a">{aShort}</span>
          <span className="sep" />
          <span className="b">{bShort}</span>
        </div>
        {rows.map(row => (
          <div key={row.label} className="md-row">
            <span className={`a-val${bothPresent && row.aLeads === true ? ' leads' : bothPresent && row.aLeads === false ? ' trails' : ''}`}>
              {row.aVal}
            </span>
            <div className="md-label-stack">
              <span className="md-label">{row.label}</span>
              <span className="md-note">{row.note}</span>
            </div>
            <span className={`b-val${bothPresent && row.aLeads === false ? ' leads' : bothPresent && row.aLeads === true ? ' trails' : ''}`}>
              {row.bVal}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Distribution of shared races ──────────────────────────

function DistributionSection({ aName, bName, races }: {
  aName: string; bName: string; races: SharedRace[];
}) {
  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;
  if (races.length === 0) return null;

  const aWins = races.filter(r => r.aWon).length;
  const bWins = races.filter(r => !r.aWon).length;

  const byDist: Record<string, { a: number; b: number }> = {};
  const byYear: Record<number, { a: number; b: number }> = {};
  races.forEach(r => {
    byDist[r.dist] ??= { a: 0, b: 0 };
    byYear[r.year] ??= { a: 0, b: 0 };
    if (r.aWon) { byDist[r.dist].a++; byYear[r.year].a++; }
    else { byDist[r.dist].b++; byYear[r.year].b++; }
  });

  const distEntries = Object.entries(byDist).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
  const yearEntries = Object.entries(byYear)
    .map(([y, v]) => ([parseInt(y), v] as [number, { a: number; b: number }]))
    .sort((a, b) => a[0] - b[0]);

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 07</div>
        <h2>Distribution of shared races</h2>
        <div className="cmp-sect-note">{races.length} meetings · faster finisher counted toward leading column</div>
      </div>

      <div className="dist-grid">
        <div className="dist-cell">
          <div className="dh"><span>By distance</span><span>{races.length} meetings</span></div>
          <div className="dist-head-row"><span /><span>Distance</span><span className="a-h">A</span><span className="b-h">B</span><span className="t-h">T</span></div>
          <ul className="dist-stack">
            {distEntries.map(([dist, v]) => {
              const tot = v.a + v.b;
              return (
                <li key={dist} style={{ '--a': `${v.a}fr`, '--b': `${v.b}fr`, '--t': '0fr' } as React.CSSProperties}>
                  <span className="nm">{dist}</span>
                  <span className="bar"><span className="ba" /><span className="bb" /><span className="bt" /></span>
                  <span className="a-v">{v.a}</span>
                  <span className="b-v">{v.b}</span>
                  <span className="t-v">{tot}</span>
                </li>
              );
            })}
          </ul>
          <div className="dist-totals">
            <span /><span>Total</span>
            <span className="a-tt">{aWins}</span>
            <span className="b-tt">{bWins}</span>
            <span className="t-tt">{races.length}</span>
          </div>
        </div>

        <div className="dist-cell">
          <div className="dh"><span>By year</span><span>{yearEntries.length} seasons</span></div>
          <div className="dist-head-row"><span /><span>Year</span><span className="a-h">A</span><span className="b-h">B</span><span className="t-h">T</span></div>
          <ul className="dist-stack">
            {yearEntries.map(([year, v]) => {
              const tot = v.a + v.b;
              return (
                <li key={year} style={{ '--a': `${v.a}fr`, '--b': `${v.b}fr`, '--t': '0fr' } as React.CSSProperties}>
                  <span className="nm">{year}</span>
                  <span className="bar"><span className="ba" /><span className="bb" /><span className="bt" /></span>
                  <span className="a-v">{v.a}</span>
                  <span className="b-v">{v.b}</span>
                  <span className="t-v">{tot}</span>
                </li>
              );
            })}
          </ul>
          <div className="dist-totals">
            <span /><span>Total</span>
            <span className="a-tt">{aWins}</span>
            <span className="b-tt">{bWins}</span>
            <span className="t-tt">{races.length}</span>
          </div>
        </div>

        <div className="dist-cell">
          <div className="dh"><span>Summary</span></div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 36, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)' }}>
              {aWins}
              <span style={{ color: 'var(--meta)', fontSize: 22, margin: '0 8px' }}>—</span>
              {bWins}
            </div>
            <div style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--meta)' }}>
              {aWins > bWins ? `${aShort} leads` : aWins < bWins ? `${bShort} leads` : 'Evenly matched'} · {races.length} races
            </div>
            <div style={{ marginTop: 24, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', fontSize: 13, lineHeight: 1.6, color: 'var(--meta)' }}>
              {aShort} holds a {((aWins / races.length) * 100).toFixed(0)}% win rate across {races.length} shared meeting{races.length !== 1 ? 's' : ''}.
            </div>
          </div>
        </div>
      </div>

      <div className="tbl-foot">
        <span>Sample may be uneven across years. Road finishes dominate.</span>
      </div>
    </section>
  );
}

function MethodologySection({ raceName }: { raceName: string }) {
  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 08</div>
        <h2>Methodology · assumptions in force</h2>
        <div className="cmp-sect-note">Reflects current settings</div>
      </div>

      <div className="methodology-grid">
        <div className="meth-col-l">
          <div className="k">On reading these results</div>
          <h3>What the figures do and do not claim.</h3>
          <p>LOGS is a reference, not a verdict. Edge values describe an observed lean across a defined sample; they should not be read as a forecast or definitive ranking.</p>
        </div>
        <div className="meth-col-r">
          <ol>
            <li><span className="k">Cohort</span><span className="v">Only certified, in-LOGS finishes are counted. Provisional results and unverified profiles are excluded.</span></li>
            <li><span className="k">Percentile</span><span className="v">Calculated as finishers beaten divided by field size. Handles ties by exact time matching. Higher percentile = faster relative to field.</span></li>
            <li><span className="k">Equivalency</span><span className="v">Cross-distance equivalency uses the Riegel formula t₂ = t₁ · (d₂/d₁)^1.06. Applied only in Race time mode.</span></li>
            <li><span className="k">Normalization</span><span className="v">Default mode is race time, actual — no age or gender adjustment. Field-normalized metrics compare within the full open field.</span></li>
            <li><span className="k">Course parity</span><span className="v">Re-measured or re-routed courses are flagged in the race page; figures treat each certified edition as a distinct cohort.</span></li>
            <li><span className="k">Identity</span><span className="v">Athlete profiles are matched by exact name. Where a name resolves to multiple records, the canonical match from search is used.</span></li>
            <li><span className="k">Confidence</span><span className="v">High when shared-race sample ≥ 5 meetings; otherwise reported as moderate or low.</span></li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function ExtendSection({ aName, bName, raceName, year }: {
  aName: string; bName: string; raceName: string; year: number;
}) {
  const aShort = aName.split(' ').pop() || aName;
  const bShort = bName.split(' ').pop() || bName;

  return (
    <section className="cmp-sect">
      <div className="cmp-sect-head">
        <div className="cmp-sect-num">No. 09</div>
        <h2>Extend this analysis</h2>
        <div className="cmp-sect-note">Each card opens a configured query</div>
      </div>

      <div className="related-grid">
        <div className="related-cell">
          <div className="k">No. 01 · Re-cast as cohort</div>
          <h4>Both athletes against the {year} field</h4>
          <ul>
            <li><span className="nm">{aShort}</span><span className="vv">{year} {raceName}</span></li>
            <li><span className="nm">{bShort}</span><span className="vv">{year} {raceName}</span></li>
            <li><span className="nm">Field</span><span className="vv">{raceName} {year}</span></li>
          </ul>
          <span className="more">Switch to Race time mode →</span>
        </div>
        <div className="related-cell">
          <div className="k">No. 02 · Adjacent pairings</div>
          <h4>Athletes with overlapping shared races</h4>
          <ul>
            <li><span className="nm">Similar matchup profiles</span><span className="vv">archive</span></li>
            <li><span className="nm">Athletes index A–Z</span><span className="vv">index</span></li>
          </ul>
          <span className="more">Open athletes index ↗</span>
        </div>
        <div className="related-cell">
          <div className="k">No. 03 · Saved queries</div>
          <h4>Analytical templates</h4>
          <ul>
            <li><span className="nm">Age-graded comparison</span><span className="vv">mode 03 · preview</span></li>
            <li><span className="nm">Course revision splits</span><span className="vv">historic</span></li>
            <li><span className="nm">Surface penalty audit</span><span className="vv">trail / road</span></li>
          </ul>
          <span className="more">Open query library ↗</span>
        </div>
      </div>
    </section>
  );
}

function AthletesCanvas({
  aRow, bRow, careerBests, sharedRaces, aProgression, bProgression,
  aStats, bStats,
  raceName, currentYear, distLabel, h2hA, h2hB, setH2hA, setH2hB,
  gender, setGender,
}: {
  aRow: H2HRow | null; bRow: H2HRow | null;
  careerBests: { km: number; aSecBest: number | null; bSecBest: number | null }[];
  sharedRaces: SharedRace[];
  aProgression: { year: number; sec: number; km: number }[];
  bProgression: { year: number; sec: number; km: number }[];
  aStats: AthleteStats | null; bStats: AthleteStats | null;
  raceName: string; currentYear: number; distLabel: string;
  h2hA: string; h2hB: string;
  setH2hA: (v: string) => void; setH2hB: (v: string) => void;
  gender: string; setGender: (v: string) => void;
}) {
  const [dropA, setDropA] = useState(false);
  const [dropB, setDropB] = useState(false);
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (refA.current && !refA.current.contains(e.target as Node)) setDropA(false);
      if (refB.current && !refB.current.contains(e.target as Node)) setDropB(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasAny = aRow || bRow;

  const edgePct = useMemo(() => {
    if (!sharedRaces.length) return 0;
    const diffs = sharedRaces.map(r => (r.bSec - r.aSec) / Math.max(r.aSec, r.bSec) * 100);
    return diffs.reduce((a, b) => a + b, 0) / diffs.length;
  }, [sharedRaces]);

  const avgGapSec = useMemo(() => {
    if (!sharedRaces.length) return 0;
    const gaps = sharedRaces.map(r => Math.abs(r.aSec - r.bSec));
    return gaps.reduce((a, b) => a + b, 0) / gaps.length;
  }, [sharedRaces]);

  const narrowestGapSec = useMemo(() => {
    if (!sharedRaces.length) return 0;
    return Math.min(...sharedRaces.map(r => Math.abs(r.aSec - r.bSec)));
  }, [sharedRaces]);

  const seriesRecord: [number, number] = useMemo(() => {
    const a = sharedRaces.filter(r => r.aWon).length;
    const b = sharedRaces.filter(r => !r.aWon).length;
    return [a, b];
  }, [sharedRaces]);

  const aName = aRow?.name || h2hA || 'Athlete A';
  const bName = bRow?.name || h2hB || 'Athlete B';

  const aPbs = careerBests.map(({ km, aSecBest, bSecBest }) => ({
    km, sec: aSecBest!, leadA: aSecBest != null && (bSecBest == null || aSecBest < bSecBest),
  })).filter(x => x.sec != null);
  const bPbs = careerBests.map(({ km, aSecBest, bSecBest }) => ({
    km, sec: bSecBest!, leadA: aSecBest != null && (bSecBest == null || aSecBest < bSecBest),
  })).filter(x => x.sec != null);

  return (
    <div>
      {/* Identity hero */}
      <div className="compare-hero">
        <AthleteCard
          side="a" row={aRow} careerBests={aPbs} raceName={raceName} year={currentYear}
          stats={aStats}
          searchValue={h2hA} setSearchValue={setH2hA}
          dropOpen={dropA} setDropOpen={setDropA} searchRef={refA}
        />
        <AthleteCard
          side="b" row={bRow} careerBests={bPbs} raceName={raceName} year={currentYear}
          stats={bStats}
          searchValue={h2hB} setSearchValue={setH2hB}
          dropOpen={dropB} setDropOpen={setDropB} searchRef={refB}
        />
      </div>

      {sharedRaces.length > 0 && (
        <EdgeBar
          aName={aName} bName={bName}
          edgePct={edgePct} avgGapSec={avgGapSec}
          seriesRecord={seriesRecord} narrowestGapSec={narrowestGapSec}
          totalRaces={sharedRaces.length}
        />
      )}

      {/* § 01 Raw metrics */}
      {(aStats || bStats) && (
        <RawMetricsSection aName={aName} bName={bName} aStats={aStats} bStats={bStats} />
      )}

      {/* § 02 Field-normalized */}
      {(aStats || bStats) && (
        <FieldNormalizedSection aName={aName} bName={bName} aStats={aStats} bStats={bStats} />
      )}

      {/* § 03 Shared race ledger */}
      {sharedRaces.length > 0 && (
        <SharedRaceLedger aName={aName} bName={bName} races={sharedRaces} />
      )}

      {/* § 04 Consistency & longevity */}
      {(aStats || bStats) && (
        <ConsistencyLongevitySection aName={aName} bName={bName} aStats={aStats} bStats={bStats} />
      )}

      {/* § 05 Progression */}
      {(aProgression.length > 0 || bProgression.length > 0) && (
        <ProgressionSection aName={aName} bName={bName} aData={aProgression} bData={bProgression} />
      )}

      {/* § 06 Historical context */}
      {(aStats || bStats) && (
        <HistoricalContextSection aName={aName} bName={bName} aStats={aStats} bStats={bStats} />
      )}

      {/* § 07 Distribution */}
      {sharedRaces.length > 1 && (
        <DistributionSection aName={aName} bName={bName} races={sharedRaces} />
      )}

      <MethodologySection raceName={raceName} />

      {hasAny && (
        <ExtendSection aName={aName} bName={bName} raceName={raceName} year={currentYear} />
      )}
    </div>
  );
}

// ── Popular athlete chips ────────────────────────────────
const POPULAR_ATHLETES = ['Jack Moody', 'Ben Twyman', 'Brent Godfrey', 'Josh Voss', 'Daniel Balchin'];

// ── Main component ────────────────────────────────────────

export default function Compare() {
  const [searchParams] = useSearchParams();
  const initialTime = searchParams.get('time') || '3:15:10';
  const initialDist = (searchParams.get('dist') as DistId) || '42';

  const [mode, setMode] = useState<Mode>('athletes');
  const [input, setInput] = useState(initialTime);
  const [committed, setCommitted] = useState(initialTime);
  const [venue] = useState<Venue>('akl');
  const [distId] = useState<DistId>(initialDist);
  const [gender, setGender] = useState('all');
  const [ag] = useState('all');
  const [h2hA, setH2hA] = useState('');
  const [h2hB, setH2hB] = useState('');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());

  const race = useMemo(() => getRaceConfig(venue, distId), [venue, distId]);
  const currentYear = race.years[race.years.length - 1];
  const currentKm = distId === '42' ? 42.195 : 21.0975;
  const distLabel = distId === '42' ? 'Marathon · 42.2 km' : 'Half marathon · 21.1 km';

  const markLoaded = useCallback((key: string) => {
    setLoadedKeys(prev => { const n = new Set(prev); n.add(key); return n; });
  }, []);

  useEffect(() => {
    YEARS.forEach(y => {
      loadResults(y, '42.2 km').then(() => markLoaded(`akl-42-${y}`));
      loadResults(y, '21.1 km').then(() => markLoaded(`akl-21-${y}`));
    });
    CHC_YEARS.forEach(y => {
      loadChc(y).then(() => markLoaded(`chc-42-${y}`));
      loadChcHalf(y).then(() => markLoaded(`chc-21-${y}`));
    });
    ROTORUA_YEARS.forEach(y => {
      loadRotorua(y).then(() => markLoaded(`rot-42-${y}`));
      loadRotoruaHalf(y).then(() => markLoaded(`rot-21-${y}`));
    });
    HB_YEARS.forEach(y => {
      loadHb(y).then(() => markLoaded(`hb-42-${y}`));
      loadHbHalf(y).then(() => markLoaded(`hb-21-${y}`));
    });
    QT_YEARS.forEach(y => {
      loadQt(y).then(() => markLoaded(`qt-42-${y}`));
      loadQtHalf(y).then(() => markLoaded(`qt-21-${y}`));
    });
  }, [markLoaded]);

  const currentRows = useMemo(
    () => race.getYear(currentYear),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [venue, distId, currentYear, loadedKeys]
  );

  // Race-time mode
  const interpretation = useMemo(() => {
    const t = committed.trim();
    if (!t) return { kind: 'empty' as const };
    if (/^\d{1,5}$/.test(t)) {
      const bib = parseInt(t, 10);
      const hit = currentRows.find(r => r.bib === bib);
      if (hit) return { kind: 'athlete' as const, row: hit, sec: hit.sec };
    }
    const s = parseTimeInput(t);
    if (s != null && s > 30 && s < 24 * 3600) return { kind: 'time' as const, sec: s };
    const lower = t.toLowerCase();
    const hit = currentRows.find(r => r.name.toLowerCase().includes(lower));
    if (hit) return { kind: 'athlete' as const, row: hit, sec: hit.sec };
    return { kind: 'unknown' as const, text: t };
  }, [committed, currentRows]);

  const sec = interpretation.kind === 'time' || interpretation.kind === 'athlete'
    ? interpretation.sec : null;

  const cohortRows = useMemo(() => {
    return currentRows.filter(r => {
      if (gender !== 'all' && !r.cat.startsWith(gender)) return false;
      if (ag !== 'all' && !r.cat.includes(ag)) return false;
      return true;
    });
  }, [currentRows, gender, ag]);

  const placement = useMemo((): Placement | null => {
    if (sec == null || cohortRows.length === 0) return null;
    let beat = 0, behind = 0, ties = 0;
    for (const r of cohortRows) {
      if (r.sec > sec) beat++;
      else if (r.sec < sec) behind++;
      else ties++;
    }
    return { beat, behind, ties, pos: behind + 1, pct: ((beat + ties / 2) / cohortRows.length) * 100, total: cohortRows.length };
  }, [sec, cohortRows]);

  const fieldStats = useMemo((): FieldStats | null => {
    if (currentRows.length === 0) return null;
    const sorted = [...currentRows].sort((a, b) => a.sec - b.sec);
    return { rows: currentRows, winner: sorted[0].sec, median: sorted[Math.floor(sorted.length / 2)].sec, last: sorted[sorted.length - 1].sec };
  }, [currentRows]);

  const yearStrip = useMemo((): YearStripItem[] => {
    const prefix = `${venue}-${distId}`;
    return race.years.map(y => {
      const key = `${prefix}-${y}`;
      const rows = race.getYear(y);
      if (!loadedKeys.has(key)) return { year: y, loading: true };
      if (rows.length === 0) return { year: y, cancelled: true };
      if (sec == null) return { year: y, loading: true };
      const sorted = [...rows].sort((a, b) => a.sec - b.sec);
      let behind = 0;
      for (const r of rows) if (r.sec < sec) behind++;
      return {
        year: y, percentile: (behind / rows.length) * 100,
        beat: rows.length - behind, behind, finishers: rows.length,
        medianSec: sorted[Math.floor(sorted.length / 2)].sec,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, venue, distId, race, loadedKeys]);

  const bestRace = useMemo((): BestRace | null => {
    if (sec == null) return null;
    let best: BestRace | null = null;
    for (const rc of ALL_RACES) {
      const equivSec = sec * Math.pow(rc.km / currentKm, 1.06);
      for (const y of rc.years) {
        const rows = rc.getYear(y);
        if (rows.length === 0) continue;
        let behind = 0;
        for (const r of rows) if (r.sec < equivSec) behind++;
        const pct = (behind / rows.length) * 100;
        const candidate: BestRace = { year: y, raceName: rc.name, equivSec, pos: behind + 1, total: rows.length, pct };
        if (!best || candidate.pct < best.pct) best = candidate;
      }
    }
    return best;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec, currentKm, loadedKeys]);

  // Athletes mode — search all loaded races, most recent year first per race
  const findAthlete = useCallback((name: string): H2HRow | null => {
    if (!name.trim()) return null;
    const lower = name.trim().toLowerCase();
    for (const rc of ALL_RACES) {
      const sortedYears = [...rc.years].sort((a, b) => b - a);
      for (const y of sortedYears) {
        const rows = rc.getYear(y);
        const r = rows.find(row => {
          if (!row.name.toLowerCase().includes(lower)) return false;
          if (gender === 'M' && !row.cat.startsWith('M')) return false;
          if (gender === 'W' && !row.cat.startsWith('W')) return false;
          return true;
        });
        if (r) return { name: r.name, time: r.time, pos: r.pos, cat: r.cat, sec: r.sec, foundRace: rc.name, foundYear: y };
      }
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedKeys, gender]);

  const aRow = useMemo(() => findAthlete(h2hA), [h2hA, findAthlete]);
  const bRow = useMemo(() => findAthlete(h2hB), [h2hB, findAthlete]);

  // Comprehensive finish history for each athlete
  const aFinishes = useMemo(
    () => collectAllFinishes(aRow?.name ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aRow, loadedKeys]
  );
  const bFinishes = useMemo(
    () => collectAllFinishes(bRow?.name ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bRow, loadedKeys]
  );

  const aStats = useMemo(() => computeAthleteStats(aFinishes), [aFinishes]);
  const bStats = useMemo(() => computeAthleteStats(bFinishes), [bFinishes]);

  // Career bests derived from finish history
  const careerBests = useMemo(() => {
    const aMap = new Map<number, number>();
    const bMap = new Map<number, number>();
    aFinishes.forEach(f => { const p = aMap.get(f.km) ?? Infinity; if (f.sec < p) aMap.set(f.km, f.sec); });
    bFinishes.forEach(f => { const p = bMap.get(f.km) ?? Infinity; if (f.sec < p) bMap.set(f.km, f.sec); });
    const kms = Array.from(new Set([...aMap.keys(), ...bMap.keys()])).sort((a, b) => b - a);
    return kms.map(km => ({ km, aSecBest: aMap.get(km) ?? null, bSecBest: bMap.get(km) ?? null }));
  }, [aFinishes, bFinishes]);

  // Progression data derived from finish history
  const aProgression = useMemo(() => {
    const best = new Map<string, { year: number; sec: number; km: number }>();
    aFinishes.forEach(f => {
      const k = `${f.year}-${f.km}`;
      if (!best.has(k) || f.sec < best.get(k)!.sec) best.set(k, { year: f.year, sec: f.sec, km: f.km });
    });
    return Array.from(best.values()).sort((a, b) => a.year - b.year || b.km - a.km);
  }, [aFinishes]);

  const bProgression = useMemo(() => {
    const best = new Map<string, { year: number; sec: number; km: number }>();
    bFinishes.forEach(f => {
      const k = `${f.year}-${f.km}`;
      if (!best.has(k) || f.sec < best.get(k)!.sec) best.set(k, { year: f.year, sec: f.sec, km: f.km });
    });
    return Array.from(best.values()).sort((a, b) => a.year - b.year || b.km - a.km);
  }, [bFinishes]);

  // Shared races with full position and percentile data
  const sharedRaces = useMemo((): SharedRace[] => {
    if (!aRow || !bRow) return [];
    const aLower = aRow.name.toLowerCase();
    const bLower = bRow.name.toLowerCase();
    const results: SharedRace[] = [];

    for (const rc of ALL_RACES) {
      for (const y of rc.years) {
        const rows = rc.getYear(y);
        if (rows.length === 0) continue;
        const aEntry = rows.find(r => r.name.toLowerCase() === aLower);
        const bEntry = rows.find(r => r.name.toLowerCase() === bLower);
        if (!aEntry || !bEntry) continue;
        const aBeat = rows.filter(r => r.sec > aEntry.sec).length;
        const bBeat = rows.filter(r => r.sec > bEntry.sec).length;
        results.push({
          year: y,
          label: `${rc.name} ${y}`,
          aSec: aEntry.sec, bSec: bEntry.sec,
          aWon: aEntry.sec < bEntry.sec,
          dist: rc.km === 42.195 ? '42.2 km' : rc.km === 21.0975 ? '21.1 km' : `${rc.km} km`,
          aPos: aEntry.pos, bPos: bEntry.pos,
          aTotal: rows.length,
          aPct: (aBeat / rows.length) * 100,
          bPct: (bBeat / rows.length) * 100,
        });
      }
    }

    return results.sort((a, b) => b.year - a.year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aRow, bRow, loadedKeys]);

  const commit = () => setCommitted(input);
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') commit(); };

  return (
    <main>
      {/* Tool head */}
      <section className="tool-head">
        <div className="page">
          <div className="th-row">
            <div>
              <div className="eyebrow">Compare · statistical analysis</div>
              <h1 className="th-title">Compare</h1>
              <p className="th-sub">
                Place any finish time, or any two athletes with finisher data, into the field of certified New Zealand results — percentile, field-normalized metrics, historical context.
              </p>
            </div>
            <div className="th-stamp">
              <div>Method · <span className="v">v2.0</span></div>
              <div>Surface · <span className="v">road · trail</span></div>
              <div>Mode · <span className="v">{mode === 'racetime' ? 'Race time' : 'Athletes'}</span></div>
            </div>
          </div>
        </div>
      </section>


      {mode === 'athletes' ? (
        <div className="cmp-athletes-shell page">
          <AthletesCanvas
            aRow={aRow} bRow={bRow}
            careerBests={careerBests}
            sharedRaces={sharedRaces}
            aProgression={aProgression}
            bProgression={bProgression}
            aStats={aStats} bStats={bStats}
            raceName={race.name}
            currentYear={currentYear}
            distLabel={distLabel}
            h2hA={h2hA} h2hB={h2hB}
            setH2hA={setH2hA} setH2hB={setH2hB}
            gender={gender} setGender={setGender}
          />
        </div>
      ) : (
        <div className="compare-shell-new">
          <aside className="rail-new">
            <div className="rail-head-label">Race-time inputs</div>
            <div className="rail-field">
              <div className="rail-label"><span>Finish time</span></div>
              <input
                className="rail-input"
                placeholder="h:mm:ss"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                onBlur={commit}
              />
            </div>
            <div className="rail-field" style={{ marginTop: 4 }}>
              <div className="rail-label"><span>Normalise</span></div>
              <select className="rail-sel">
                <option>Race time (actual)</option>
                <option>Age-graded</option>
              </select>
            </div>
            <hr className="rail-hr" />
            <button className="rail-reset" onClick={() => { setInput('3:15:10'); setCommitted('3:15:10'); }}>
              Reset ↻
            </button>
          </aside>
          <section className="canvas-new">
            <RaceTimeCanvas
              sec={sec}
              raceName={race.name}
              dist={race.km}
              year={currentYear}
              gender={gender}
              placement={placement}
              fieldStats={fieldStats}
              yearStrip={yearStrip}
              hoveredYear={hoveredYear}
              setHoveredYear={setHoveredYear}
              bestRace={bestRace}
              interpretation={interpretation}
            />
          </section>
        </div>
      )}
    </main>
  );
}
