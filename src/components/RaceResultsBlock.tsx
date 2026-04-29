import { useState, useMemo, useEffect } from 'react';
import { loadResults, loadRotorua, yearStats, halfStats, rotoruaStats, YEARS, ROTORUA_YEARS, type ResultRow } from '@/data/logsDataExt';
import FullResultsOverlay from './FullResultsOverlay';

interface RaceResultsBlockProps {
  dist: string;
  raceId?: 'auckland' | 'rotorua';
  onOpenAthlete?: (name: string) => void;
}

export default function RaceResultsBlock({ dist, raceId = 'auckland', onOpenAthlete }: RaceResultsBlockProps) {
  const isRotorua = raceId === 'rotorua';
  const availableYears = isRotorua ? [...ROTORUA_YEARS].reverse() : [...YEARS].reverse();
  const years = availableYears as number[];
  const [year, setYear] = useState<number>(2025);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [fullOpen, setFullOpen] = useState(false);
  const [fullQ, setFullQ] = useState('');
  const [all, setAll] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  const hasData = isRotorua ? true : (dist === '42.2 km' || dist === '21.1 km');

  useEffect(() => {
    if (!hasData) return;
    setLoading(true);
    setAll([]);
    const loader = isRotorua
      ? loadRotorua(year)
      : loadResults(year, dist as '42.2 km' | '21.1 km');
    loader.then(rows => { setAll(rows); setLoading(false); });
  }, [year, dist, hasData, isRotorua]);

  const ql = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!ql) return all;
    if (/^\d+$/.test(ql)) {
      return all.filter(r => String(r.bib).includes(ql) || String(r.pos) === ql);
    }
    return all.filter(r =>
      r.name.toLowerCase().includes(ql) ||
      r.nat.toLowerCase().includes(ql)
    );
  }, [all, ql]);

  // Reset to latest year when distance changes
  useEffect(() => { setYear(2025); setPage(1); setQ(''); }, [dist]);
  useEffect(() => { setPage(1); }, [year, ql]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const activeStats = isRotorua ? rotoruaStats : (dist === '21.1 km' ? halfStats : yearStats);
  const stat = activeStats.find(s => s.year === year)!;

  return (
    <div>
      <div className="mb-24">
        <div className="eyebrow mb-8">Results</div>
        <div className="flex ai-baseline gap-16" style={{ flexWrap: 'wrap' }}>
          <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            {hasData
              ? <>{year} edition <span style={{ color: 'var(--meta)', fontStyle: 'italic' }}>— {stat.finishers.toLocaleString()} finishers</span></>
              : <>{dist} results</>
            }
          </h2>
          {hasData && (
            <select
              className="pill-select"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!hasData ? (
        <div style={{ padding: '64px 0', borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
          <div className="dimmed" style={{ fontSize: 13, textAlign: 'center' }}>
            {dist} results not yet archived.
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-16 mb-16 ai-end" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 360px', maxWidth: 520, position: 'relative' }}>
              <div className="label mb-8">Search · name, bib, nationality</div>
              <div style={{ position: 'relative' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1"
                     style={{ position: 'absolute', left: 0, top: 14, opacity: 0.5 }}>
                  <circle cx="5" cy="5" r="3.5"/><line x1="7.6" y1="7.6" x2="10.5" y2="10.5"/>
                </svg>
                <input className="input" style={{ paddingLeft: 20 }}
                       placeholder="e.g. Balchin · 11036 · IRL"
                       value={q} onChange={e => setQ(e.target.value)} />
              </div>
              {ql && !loading && (
                <div className="label mt-8">
                  {filtered.length.toLocaleString()} match{filtered.length === 1 ? '' : 'es'} in {year}
                </div>
              )}
            </div>
            <button className="btn-ghost" onClick={() => { setFullQ(q); setFullOpen(true); }}>
              View full results ({stat.finishers.toLocaleString()}) →
            </button>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 50 }}>Pos</th>
                <th style={{ width: 70 }}>Bib</th>
                <th>Name</th>
                <th>Category</th>
                <th className="num">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="dimmed" style={{ padding: 40, textAlign: 'center' }}>
                  Loading {year} results…
                </td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={5} className="dimmed" style={{ padding: 40, textAlign: 'center' }}>
                  {ql ? `No results match "${q}" in ${year}.` : `No results for ${year}.`}
                </td></tr>
              ) : pageRows.map(r => (
                <tr key={r.pos} className="row">
                  <td className={`pos ${r.pos === 1 ? 'pos-1' : ''}`}>{r.pos}</td>
                  <td className="dimmed time">{r.bib || '—'}</td>
                  <td>
                    <span className="serif" style={{ fontSize: 16 }}>{r.name}</span>
                    <span className="dimmed" style={{ marginLeft: 8, fontSize: 11 }}>{r.nat}</span>
                  </td>
                  <td className="dimmed">{r.cat}</td>
                  <td className="num time">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && (
            <div className="flex between ai-center mt-24" style={{ flexWrap: 'wrap', gap: 12 }}>
              <div className="label">
                {filtered.length === 0
                  ? 'No results'
                  : `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} of ${filtered.length.toLocaleString()}`}
              </div>
              <div className="flex gap-8 ai-center">
                <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
                <span className="label" style={{ padding: '0 8px' }}>Page {page} / {pages}</span>
                <button className="btn-ghost" disabled={page >= pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next →</button>
              </div>
            </div>
          )}
        </>
      )}

      <FullResultsOverlay
        open={fullOpen}
        year={year}
        dist={isRotorua ? '42.2 km' : dist as '42.2 km' | '21.1 km'}
        raceId={raceId}
        initialQ={fullQ}
        onClose={() => setFullOpen(false)}
        onOpenAthlete={name => { setFullOpen(false); onOpenAthlete?.(name); }}
      />
    </div>
  );
}
