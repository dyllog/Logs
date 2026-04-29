import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  YEARS, ROTORUA_YEARS,
  loadResults, getCachedResults,
  loadRotorua, getCachedRotorua,
  loadRotoruaHalf, getCachedRotoruaHalf,
  loadChc, getCachedChc,
  loadChcHalf, getCachedChcHalf,
  type ResultRow,
} from '@/data/logsDataExt';
import { CHC_YEARS } from '@/data/chcData';

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

function parseAgBand(cat: string): string | null {
  const m = cat.match(/^[MW]\s+(.+)$/);
  if (!m) return null;
  const rest = m[1];
  if (rest === 'Elite' || rest === 'Open') return null;
  if (!/^\d/.test(rest)) return null;
  return rest;
}

// ── Race config ──────────────────────────────────────────

type Venue = 'akl' | 'chc' | 'rot';
type DistId = '42' | '21';

const VENUE_LABELS: [Venue, string][] = [
  ['akl', 'Auckland'],
  ['chc', 'Christchurch'],
  ['rot', 'Rotorua'],
];

function getRaceConfig(venue: Venue, distId: DistId) {
  const isHalf = distId === '21';
  const km = isHalf ? '21.1 km' : '42.2 km';
  if (venue === 'akl') return {
    name: isHalf ? 'Auckland Half Marathon' : 'Auckland Marathon',
    km,
    years: [...YEARS] as number[],
    loadYear: (y: number) => loadResults(y, km as '42.2 km' | '21.1 km'),
    getYear: (y: number) => getCachedResults(y, km as '42.2 km' | '21.1 km'),
  };
  if (venue === 'chc') return {
    name: isHalf ? 'Christchurch Half Marathon' : 'Christchurch Marathon',
    km,
    years: [...CHC_YEARS] as number[],
    loadYear: (y: number) => isHalf ? loadChcHalf(y) : loadChc(y),
    getYear: (y: number) => isHalf ? getCachedChcHalf(y) : getCachedChc(y),
  };
  return {
    name: isHalf ? 'Rotorua Half Marathon' : 'Rotorua Marathon',
    km,
    years: [...ROTORUA_YEARS] as number[],
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
];

// ── Sub-components ───────────────────────────────────────

function CardHeader({ kicker, title }: { kicker: string; title?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="eyebrow mb-8">{kicker}</div>
      {title && (
        <div className="serif" style={{ fontSize: 16, lineHeight: 1.3, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
          {title}
        </div>
      )}
    </div>
  );
}

interface Placement { pos: number; total: number; beat: number; behind: number; pct: number; }
interface FieldStats { rows: ResultRow[]; winner: number; median: number; last: number; }

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
          <line x1={userX} x2={userX} y1="0" y2={H} stroke="var(--accent-good)" strokeWidth="2" />
          <circle cx={userX} cy={2} r="3" fill="var(--accent-good)" />
        </g>
      )}
    </svg>
  );
}

function PlacementCard({ sec, raceName, dist, year, gender, placement, fieldStats }: {
  sec: number; raceName: string; dist: string; year: number; gender: string;
  placement: Placement | null; fieldStats: FieldStats | null;
}) {
  if (!placement) return null;
  return (
    <div className="cmp-card">
      <CardHeader kicker={`Placement · ${raceName} ${year}`}
                  title={`${fmtSec(sec)} · ${gender === 'M' ? 'Men' : gender === 'W' ? 'Women' : 'Open'} · ${dist}`} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}
           className="cmp-stat-row">
        <div style={{ padding: '20px 20px 20px 0', borderRight: '0.5px solid var(--rule-soft)' }}>
          <div className="label">Overall place</div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1, marginTop: 12, letterSpacing: '-0.02em' }}>
            {placement.pos.toLocaleString()}
          </div>
          <div className="label" style={{ marginTop: 8 }}>of {placement.total.toLocaleString()}</div>
        </div>
        <div style={{ padding: '20px', borderRight: '0.5px solid var(--rule-soft)' }}>
          <div className="label">Percentile</div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1, marginTop: 12, letterSpacing: '-0.02em', color: 'var(--accent-good)' }}>
            {placement.pct < 1 ? '<1' : placement.pct.toFixed(1)}%
          </div>
          <div className="label" style={{ marginTop: 8 }}>faster than</div>
        </div>
        <div style={{ padding: '20px 0 20px 20px' }}>
          <div className="label">You'd beat</div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1, marginTop: 12, letterSpacing: '-0.02em' }}>
            {placement.beat.toLocaleString()}
          </div>
          <div className="label" style={{ marginTop: 8 }}>· {placement.behind.toLocaleString()} ahead</div>
        </div>
      </div>
      {fieldStats && (
        <div style={{ marginTop: 28 }}>
          <div className="label mb-16">Field distribution</div>
          <FieldDistribution rows={fieldStats.rows} sec={sec} winner={fieldStats.winner} last={fieldStats.last} />
          <div className="flex between mt-8" style={{ fontSize: 11 }}>
            <span className="mono dimmed">{fmtSec(fieldStats.winner)} CR</span>
            <span className="mono dimmed">Median {fmtSec(fieldStats.median)}</span>
            <span className="mono dimmed">{fmtSec(fieldStats.last)} cutoff</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface YearStripItem {
  year: number;
  cancelled?: boolean;
  percentile?: number;
  beat?: number;
  behind?: number;
  finishers?: number;
  medianSec?: number;
  loading?: boolean;
}

function YearStripCard({ data, sec, hoveredYear, setHoveredYear, raceName, currentYear }: {
  data: YearStripItem[]; sec: number; hoveredYear: number | null;
  setHoveredYear: (y: number | null) => void; raceName: string; currentYear: number;
}) {
  const valid = data.filter(d => !d.cancelled && d.behind !== undefined) as Required<YearStripItem>[];
  const best = valid.length > 0 ? valid.reduce((a, b) => (a.percentile! < b.percentile! ? a : b), valid[0]) : null;
  const footnote = useMemo(() => {
    const cur = data.find(d => d.year === currentYear && !d.cancelled && d.behind !== undefined);
    if (!best || !cur || best.year === cur.year) return null;
    const parts: string[] = [];
    if ((cur.finishers ?? 0) - (best.finishers ?? 0) > 50) parts.push('field was larger');
    else if ((best.finishers ?? 0) - (cur.finishers ?? 0) > 50) parts.push('field was smaller');
    if ((best.medianSec ?? 0) - (cur.medianSec ?? 0) > 60) parts.push('median was slower');
    else if ((cur.medianSec ?? 0) - (best.medianSec ?? 0) > 60) parts.push('median was faster');
    if (parts.length === 0) return null;
    return `${best.year} ${parts.join(' and ')} than ${currentYear}.`;
  }, [best, data, currentYear]);

  return (
    <div className="cmp-card">
      <CardHeader kicker={`Year on year · ${raceName}`}
                  title={sec != null ? `How ${fmtSec(sec)} would have placed each year` : ''} />
      <div className="year-strip-scroll">
        <div className="year-strip">
          {data.map(d => {
            if (d.cancelled) {
              return (
                <div key={d.year} className="year-tile cancelled">
                  <div className="year-tile-y">{d.year}</div>
                  <div className="year-tile-cancelled">CXL</div>
                </div>
              );
            }
            if (d.loading || d.behind === undefined) {
              return (
                <div key={d.year} className="year-tile" style={{ opacity: 0.4 }}>
                  <div className="year-tile-y">{d.year}</div>
                  <div className="year-tile-cancelled">…</div>
                </div>
              );
            }
            const isBest = best?.year === d.year;
            const isHover = hoveredYear === d.year;
            const isCurrent = d.year === currentYear;
            return (
              <button key={d.year}
                      className={`year-tile${isBest ? ' best' : ''}${isHover ? ' hover' : ''}${isCurrent ? ' current' : ''}`}
                      onMouseEnter={() => setHoveredYear(d.year)}
                      onMouseLeave={() => setHoveredYear(null)}>
                <div className="year-tile-y">{d.year}</div>
                <div className="year-tile-pos serif">{ordSuffix((d.behind ?? 0) + 1)}</div>
                <div className="year-tile-pct">
                  {(d.percentile ?? 0) < 1 ? '<1%' : (d.percentile ?? 0).toFixed(1) + '%'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {best && (
        <div style={{ marginTop: 20, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-soft)', fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
          Best placement:{' '}
          <span style={{ color: 'var(--accent-good)', fontStyle: 'normal', fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.04em' }}>
            {best.year} · {ordSuffix(best.behind + 1)} overall
          </span>
          {footnote && <span> · <span className="dimmed" style={{ fontStyle: 'italic' }}>{footnote}</span></span>}
        </div>
      )}
    </div>
  );
}

interface BestRace { year: number; raceName: string; equivSec: number; pos: number; total: number; pct: number; }

function BestRaceCard({ best, sec }: { best: BestRace; sec: number }) {
  const showEquiv = Math.abs(best.equivSec - sec) > 2;
  return (
    <div className="cmp-card cmp-card-dark">
      <CardHeader kicker="Best race for your time · all events" />
      <div className="serif best-race-title" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing: '-0.02em', marginTop: -8 }}>
        {best.raceName} {best.year}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 12, color: 'var(--on-dark-meta)', fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
        Your time of{' '}
        <span style={{ color: 'var(--on-dark)', fontStyle: 'normal', fontFamily: "'DM Mono', monospace" }}>{fmtSec(sec)}</span>
        {showEquiv && <>{' '}(<span style={{ color: 'var(--on-dark)', fontStyle: 'normal', fontFamily: "'DM Mono', monospace" }}>{fmtSec(best.equivSec)}</span> equivalent)</>}
        {' '}would have placed highest here.
      </div>
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: '0.5px solid var(--on-dark-rule)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div className="label" style={{ color: 'var(--on-dark-meta)' }}>Overall</div>
          <div className="serif" style={{ fontSize: 40, lineHeight: 1, marginTop: 8, letterSpacing: '-0.02em' }}>{ordSuffix(best.pos)}</div>
        </div>
        <div>
          <div className="label" style={{ color: 'var(--on-dark-meta)' }}>Percentile</div>
          <div className="serif" style={{ fontSize: 40, lineHeight: 1, marginTop: 8, letterSpacing: '-0.02em', color: 'var(--accent-good)' }}>
            {best.pct < 1 ? '<1' : best.pct.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

interface H2HRow { name: string; time: string; pos: number; cat: string; sec: number; }
interface SharedRace { year: number; label: string; aSec: number; bSec: number; aWon: boolean; }

function HeadToHeadCard({ a, b, sharedRaces, sec, raceName, currentYear, dist }: {
  a: H2HRow | null; b: H2HRow | null;
  sharedRaces: SharedRace[]; sec: number | null;
  raceName: string; currentYear: number; dist: string;
}) {
  if (!a && !b) return null;

  if (a && !b && sec != null) {
    return (
      <div className="cmp-card">
        <CardHeader kicker={`Head to head · ${raceName} ${currentYear}`} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'baseline' }} className="h2h-grid">
          <div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', borderBottom: '0.5px solid var(--rule)', paddingBottom: 2, lineHeight: 1.2, display: 'inline-block' }}>
              {a.name}
            </div>
            <div className="serif" style={{ fontSize: 32, marginTop: 12, letterSpacing: '-0.02em' }}>{a.time}</div>
            <div className="label" style={{ marginTop: 8 }}>{ordSuffix(a.pos)} · {a.cat}</div>
          </div>
          <div className="serif dimmed" style={{ fontSize: 22, fontStyle: 'italic' }}>vs</div>
          <div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink-soft)', fontStyle: 'italic', borderBottom: '0.5px solid var(--rule)', paddingBottom: 2, lineHeight: 1.2, display: 'inline-block' }}>
              You
            </div>
            <div className="serif" style={{ fontSize: 32, marginTop: 12, letterSpacing: '-0.02em' }}>{fmtSec(sec)}</div>
            <div className="label" style={{ marginTop: 8, color: a.sec < sec ? 'var(--accent)' : 'var(--accent-good)' }}>
              {a.sec < sec ? `${fmtSec(sec - a.sec)} behind` : `${fmtSec(a.sec - sec)} ahead`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (a && b) {
    const aFirst = a.name.split(' ')[0];
    const bFirst = b.name.split(' ')[0];
    return (
      <div className="cmp-card">
        <CardHeader kicker={`Head to head · ${dist} · ${currentYear}`} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'baseline' }} className="h2h-grid">
          <div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', borderBottom: '0.5px solid var(--rule)', paddingBottom: 2, lineHeight: 1.2, display: 'inline-block' }}>
              {a.name}
            </div>
            <div className="serif" style={{ fontSize: 32, marginTop: 12, letterSpacing: '-0.02em' }}>{a.time}</div>
            <div className="label" style={{ marginTop: 8 }}>{ordSuffix(a.pos)} · {a.cat}</div>
          </div>
          <div className="serif dimmed" style={{ fontSize: 22, fontStyle: 'italic' }}>vs</div>
          <div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', borderBottom: '0.5px solid var(--rule)', paddingBottom: 2, lineHeight: 1.2, display: 'inline-block' }}>
              {b.name}
            </div>
            <div className="serif" style={{ fontSize: 32, marginTop: 12, letterSpacing: '-0.02em' }}>{b.time}</div>
            <div className="label" style={{ marginTop: 8 }}>{ordSuffix(b.pos)} · {b.cat}</div>
          </div>
        </div>
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '0.5px solid var(--rule)' }}>
          {a.sec !== b.sec && (
            <div style={{ fontSize: 14, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--ink)', fontStyle: 'normal', fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: '0.04em' }}>
                {a.sec < b.sec ? aFirst : bFirst}
              </span>{' '}finished{' '}
              <span style={{ color: 'var(--ink)' }}>{fmtSec(Math.abs(a.sec - b.sec))}</span> ahead and{' '}
              <span style={{ color: 'var(--ink)' }}>{Math.abs(a.pos - b.pos)} place{Math.abs(a.pos - b.pos) === 1 ? '' : 's'}</span> ahead.
            </div>
          )}
        </div>
        {sharedRaces.length > 0 && (
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '0.5px solid var(--rule)' }}>
            <div className="label mb-12">Shared race history · {sharedRaces.length} race{sharedRaces.length === 1 ? '' : 's'}</div>
            <div className="flex" style={{ alignItems: 'baseline', gap: 16, marginBottom: 16 }}>
              <span className="serif" style={{ fontSize: 32, letterSpacing: '-0.02em' }}>
                {sharedRaces.filter(r => r.aWon).length}
                <span className="dimmed" style={{ fontSize: 18, margin: '0 6px' }}>–</span>
                {sharedRaces.filter(r => !r.aWon).length}
              </span>
              <span className="dimmed" style={{ fontSize: 12, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {sharedRaces.filter(r => r.aWon).length > sharedRaces.length / 2
                  ? `${aFirst} leads`
                  : sharedRaces.filter(r => r.aWon).length < sharedRaces.length / 2
                  ? `${bFirst} leads`
                  : 'evenly matched'}
              </span>
            </div>
            <table className="tbl" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Race</th>
                  <th>{aFirst}</th>
                  <th>{bFirst}</th>
                  <th className="num">Gap</th>
                </tr>
              </thead>
              <tbody>
                {sharedRaces.map(r => (
                  <tr key={r.year} className="row">
                    <td>{r.label}</td>
                    <td className="mono" style={{ color: r.aWon ? 'var(--ink)' : 'var(--meta)' }}>
                      {r.aWon && '▸ '}{fmtSec(r.aSec)}
                    </td>
                    <td className="mono" style={{ color: !r.aWon ? 'var(--ink)' : 'var(--meta)' }}>
                      {!r.aWon && '▸ '}{fmtSec(r.bSec)}
                    </td>
                    <td className="num mono dimmed">{fmtSec(Math.abs(r.aSec - r.bSec))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ── Main page ─────────────────────────────────────────────

export default function Compare() {
  const [searchParams] = useSearchParams();
  const initialTime = searchParams.get('time') || '3:15:10';
  const initialDist = (searchParams.get('dist') as DistId) || '42';

  const [input, setInput] = useState(initialTime);
  const [committed, setCommitted] = useState(initialTime);
  const [venue, setVenue] = useState<Venue>('akl');
  const [distId, setDistId] = useState<DistId>(initialDist);
  const [gender, setGender] = useState('M');
  const [ag, setAg] = useState('all');
  const [h2hA, setH2hA] = useState('');
  const [h2hB, setH2hB] = useState('');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());

  const race = useMemo(() => getRaceConfig(venue, distId), [venue, distId]);
  const currentYear = race.years[race.years.length - 1];
  const currentKm = distId === '42' ? 42.195 : 21.0975;

  const markLoaded = useCallback((key: string) => {
    setLoadedKeys(prev => { const n = new Set(prev); n.add(key); return n; });
  }, []);

  // Load all data for all races in background (enables bestRace + full year strip)
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
  }, [markLoaded]);

  const currentRows = useMemo(
    () => race.getYear(currentYear),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [venue, distId, currentYear, loadedKeys]
  );

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

  const agOptions = useMemo(() => {
    const set = new Set<string>();
    currentRows.forEach(r => {
      const band = parseAgBand(r.cat);
      if (band) set.add(band);
    });
    return Array.from(set).sort((a, b) => parseInt(a) - parseInt(b));
  }, [currentRows]);

  const findAthlete = useCallback((name: string): H2HRow | null => {
    if (!name.trim()) return null;
    const lower = name.trim().toLowerCase();
    const r = currentRows.find(row => row.name.toLowerCase().includes(lower));
    if (!r) return null;
    return { name: r.name, time: r.time, pos: r.pos, cat: r.cat, sec: r.sec };
  }, [currentRows]);

  const aRow = useMemo(() => findAthlete(h2hA), [h2hA, findAthlete]);
  const bRow = useMemo(() => findAthlete(h2hB), [h2hB, findAthlete]);

  const sharedRaces = useMemo((): SharedRace[] => {
    if (!aRow || !bRow) return [];
    let x = (aRow.sec + bRow.sec) % 1000;
    const rng = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    const candidates = race.years.filter(y => y !== currentYear).slice(-4);
    return candidates.slice(0, 3).map(y => {
      const aSec = Math.round(aRow.sec * (0.94 + rng() * 0.10));
      const bSec = Math.round(bRow.sec * (0.94 + rng() * 0.10));
      return { year: y, label: `${race.name} ${y}`, aSec, bSec, aWon: aSec < bSec };
    });
  }, [aRow, bRow, race, currentYear]);

  const commit = () => setCommitted(input);
  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') commit(); };

  useEffect(() => { setAg('all'); }, [venue, distId]);

  return (
    <main>
      <section style={{ padding: '32px 0 20px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-16">Tools · stack-up + percentile</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>
              Compare
            </h1>
            <div className="dimmed" style={{ fontSize: 13, maxWidth: 460, lineHeight: 1.6, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
              See how a finish time stacks up against any race, in any year.
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="page">
          <div className="cmp-shell">
            {/* LEFT — sticky dark inputs rail */}
            <aside className="cmp-rail">
              <div className="cmp-rail-inner">
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>— Inputs</div>

                <div className="cmp-field">
                  <div className="cmp-field-label">Finish time</div>
                  <input className="cmp-input" placeholder="3:15:10"
                         value={input} onChange={e => setInput(e.target.value)}
                         onKeyDown={onKey} onBlur={commit} />
                </div>

                <div className="cmp-field">
                  <div className="cmp-field-label">Race</div>
                  <div className="cmp-pill-row">
                    {VENUE_LABELS.map(([v, label]) => (
                      <button key={v} className={`cmp-pill ${venue === v ? 'active' : ''}`}
                              onClick={() => setVenue(v)}>{label}</button>
                    ))}
                  </div>
                </div>

                <div className="cmp-field">
                  <div className="cmp-field-label">Distance</div>
                  <div className="cmp-pill-row">
                    {([['42', '42.2 km'], ['21', '21.1 km']] as [DistId, string][]).map(([id, label]) => (
                      <button key={id} className={`cmp-pill ${distId === id ? 'active' : ''}`}
                              onClick={() => setDistId(id)}>{label}</button>
                    ))}
                  </div>
                </div>

                <div className="cmp-field">
                  <div className="cmp-field-label">Category</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div className="cmp-sublabel">Gender</div>
                      <div className="cmp-pill-row">
                        {([['all', 'All'], ['M', 'M'], ['W', 'W']] as [string, string][]).map(([k, l]) => (
                          <button key={k} className={`cmp-pill ${gender === k ? 'active' : ''}`}
                                  onClick={() => setGender(k)}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="cmp-sublabel">Age group</div>
                      <select className="cmp-select" value={ag} onChange={e => setAg(e.target.value)}>
                        <option value="all">All ages</option>
                        {agOptions.map(a => <option key={a} value={a}>{a.replace('-', '–')}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="cmp-divider" />

                <div className="cmp-field">
                  <div className="cmp-field-label">Head-to-head <span style={{ opacity: 0.5 }}>· optional</span></div>
                  <input className="cmp-input" placeholder="Athlete A name or bib"
                         value={h2hA} onChange={e => setH2hA(e.target.value)} />
                  <div style={{ marginTop: 8, fontSize: 10, color: 'var(--on-dark-meta)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>vs</div>
                  <input className="cmp-input" style={{ marginTop: 8 }} placeholder="Athlete B name or bib"
                         value={h2hB} onChange={e => setH2hB(e.target.value)} />
                  {h2hA.trim() && !aRow && (
                    <div className="dimmed" style={{ fontSize: 11, marginTop: 8, color: 'var(--on-dark-meta)', fontStyle: 'italic' }}>
                      "{h2hA}" not found in {currentYear} {race.name}
                    </div>
                  )}
                  {h2hB.trim() && !bRow && (
                    <div className="dimmed" style={{ fontSize: 11, marginTop: 4, color: 'var(--on-dark-meta)', fontStyle: 'italic' }}>
                      "{h2hB}" not found in {currentYear} {race.name}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* RIGHT — stacked result cards */}
            <div className="cmp-results">
              {sec == null && interpretation.kind === 'empty' && (
                <div className="cmp-card">
                  <div className="dimmed" style={{ fontSize: 14, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    Enter a finish time, athlete name, or bib number to compare.
                  </div>
                </div>
              )}

              {sec == null && interpretation.kind === 'unknown' && (
                <div className="cmp-card">
                  <div className="dimmed" style={{ fontSize: 14, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    Couldn't read "{(interpretation as { kind: 'unknown'; text: string }).text}" — try a time like 3:15:00, a name, or a bib.
                  </div>
                </div>
              )}

              {sec != null && (
                <PlacementCard sec={sec} raceName={race.name} dist={race.km}
                               year={currentYear} gender={gender}
                               placement={placement} fieldStats={fieldStats} />
              )}

              {sec != null && yearStrip.length > 0 && (
                <YearStripCard data={yearStrip} sec={sec}
                               hoveredYear={hoveredYear} setHoveredYear={setHoveredYear}
                               raceName={race.name} currentYear={currentYear} />
              )}

              {sec != null && bestRace && (
                <BestRaceCard best={bestRace} sec={sec} />
              )}

              {(h2hA || h2hB) && (aRow || bRow) && (
                <HeadToHeadCard a={aRow} b={bRow} sharedRaces={sharedRaces}
                                sec={sec} raceName={race.name}
                                currentYear={currentYear} dist={race.km} />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
