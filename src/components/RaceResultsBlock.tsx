import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadResults, loadRotorua, loadRotoruaHalf, loadChc, loadChcHalf, loadHb, loadHbHalf, loadQt, loadQtHalf, loadWaterfrontHalf, loadWaterfront10k, loadDevHalf, loadDev10k, loadCoastHalf, loadOmahaHalf, loadOmaha10k, loadMaraetaiHalf, loadMaraetai10k, yearStats, halfStats, rotoruaStats, rotoruaHalfStats, YEARS, ROTORUA_YEARS, type ResultRow } from '@/data/logsDataExt';
import { chcStats, chcHalfStats, CHC_YEARS } from '@/data/chcData';
import { hbStats, hbHalfStats, HB_YEARS } from '@/data/hbData';
import { qtStats, qtHalfStats, QT_YEARS } from '@/data/qtData';
import { wfHalfStats, wf10kStats, WF_YEARS } from '@/data/waterfrontData';
import { devHalfStats, dev10kStats, DEV_HALF_YEARS, DEV_10K_YEARS } from '@/data/devonportData';
import { coastStats, COAST_YEARS } from '@/data/coatesvilleData';
import { omahaHalfStats, omaha10kStats, OMAHA_HALF_YEARS, OMAHA_10K_YEARS } from '@/data/omahaData';
import { maraetaiHalfStats, maraetai10kStats, MARAETAI_HALF_YEARS, MARAETAI_10K_YEARS } from '@/data/maraetaiData';
import FullResultsOverlay from './FullResultsOverlay';
import { normalise, getAthleteSlug } from '@/data/athleteProfiles';

interface RaceResultsBlockProps {
  dist: string;
  raceId?: 'auckland' | 'rotorua' | 'rotorua-half' | 'chc' | 'chc-half' | 'hb' | 'hb-half' | 'qt' | 'qt-half' | 'wf-half' | 'wf-10k' | 'dev-half' | 'dev-10k' | 'coast-half' | 'omaha-half' | 'omaha-10k' | 'maraetai-half' | 'maraetai-10k';
  initialYear?: number;
  onOpenAthlete?: (name: string) => void;
}

export default function RaceResultsBlock({ dist, raceId = 'auckland', initialYear, onOpenAthlete }: RaceResultsBlockProps) {
  const isRotorua = raceId === 'rotorua';
  const isRotoruaHalf = raceId === 'rotorua-half';
  const isChc = raceId === 'chc';
  const isChcHalf = raceId === 'chc-half';
  const isHb = raceId === 'hb';
  const isHbHalf = raceId === 'hb-half';
  const isQt = raceId === 'qt';
  const isQtHalf = raceId === 'qt-half';
  const isWfHalf = raceId === 'wf-half';
  const isWf10k = raceId === 'wf-10k';
  const isDevHalf = raceId === 'dev-half';
  const isDev10k = raceId === 'dev-10k';
  const isCoastHalf = raceId === 'coast-half';
  const isOmahaHalf = raceId === 'omaha-half';
  const isOmaha10k = raceId === 'omaha-10k';
  const isMaraetaiHalf = raceId === 'maraetai-half';
  const isMaraetai10k = raceId === 'maraetai-10k';
  const availableYears = (isChc || isChcHalf)
    ? [...CHC_YEARS].reverse()
    : (isRotorua || isRotoruaHalf) ? [...ROTORUA_YEARS].reverse()
    : (isHb || isHbHalf) ? [...HB_YEARS].reverse()
    : (isQt || isQtHalf) ? [...QT_YEARS].reverse()
    : (isWfHalf || isWf10k) ? [...WF_YEARS].reverse()
    : isDevHalf ? [...DEV_HALF_YEARS].reverse()
    : isDev10k ? [...DEV_10K_YEARS].reverse()
    : isCoastHalf ? [...COAST_YEARS].reverse()
    : isOmahaHalf ? [...OMAHA_HALF_YEARS].reverse()
    : isOmaha10k ? [...OMAHA_10K_YEARS].reverse()
    : isMaraetaiHalf ? [...MARAETAI_HALF_YEARS].reverse()
    : isMaraetai10k ? [...MARAETAI_10K_YEARS].reverse()
    : [...YEARS].reverse();
  const years = availableYears as number[];
  const resolvedInitial = initialYear && (availableYears as number[]).includes(initialYear) ? initialYear : availableYears[0];
  const [year, setYear] = useState<number>(resolvedInitial);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [fullOpen, setFullOpen] = useState(false);
  const [fullQ, setFullQ] = useState('');
  const [all, setAll] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  const hasData = true;

  useEffect(() => {
    if (!hasData) return;
    setLoading(true);
    setAll([]);
    const loader = isChcHalf ? loadChcHalf(year)
      : isChc ? loadChc(year)
      : isRotoruaHalf ? loadRotoruaHalf(year)
      : isRotorua ? loadRotorua(year)
      : isHbHalf ? loadHbHalf(year)
      : isHb ? loadHb(year)
      : isQtHalf ? loadQtHalf(year)
      : isQt ? loadQt(year)
      : isWf10k ? loadWaterfront10k(year)
      : isWfHalf ? loadWaterfrontHalf(year)
      : isDevHalf ? loadDevHalf(year)
      : isDev10k ? loadDev10k(year)
      : isCoastHalf ? loadCoastHalf(year)
      : isOmahaHalf ? loadOmahaHalf(year)
      : isOmaha10k ? loadOmaha10k(year)
      : isMaraetaiHalf ? loadMaraetaiHalf(year)
      : isMaraetai10k ? loadMaraetai10k(year)
      : loadResults(year, dist as '42.2 km' | '21.1 km');
    loader.then(rows => { setAll(rows); setLoading(false); });
  }, [year, dist, hasData, isRotorua, isRotoruaHalf, isChc, isChcHalf, isHb, isHbHalf, isQt, isQtHalf, isWfHalf, isWf10k, isDevHalf, isDev10k, isCoastHalf, isOmahaHalf, isOmaha10k, isMaraetaiHalf, isMaraetai10k]);

  const ql = normalise(q.trim());
  const filtered = useMemo(() => {
    if (!ql) return all;
    if (/^\d+$/.test(ql)) {
      return all.filter(r => String(r.bib).includes(ql) || String(r.pos) === ql);
    }
    return all.filter(r =>
      normalise(r.name).includes(ql) ||
      r.nat.toLowerCase().includes(ql)
    );
  }, [all, ql]);

  // Reset to latest year when distance changes
  useEffect(() => { setYear(2025); setPage(1); setQ(''); }, [dist]);
  useEffect(() => { setPage(1); }, [year, ql]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const activeStats = isChcHalf ? chcHalfStats : isChc ? chcStats : isRotoruaHalf ? rotoruaHalfStats : isRotorua ? rotoruaStats : isHbHalf ? hbHalfStats : isHb ? hbStats : isQtHalf ? qtHalfStats : isQt ? qtStats : isWf10k ? wf10kStats : isWfHalf ? wfHalfStats : isDevHalf ? devHalfStats : isDev10k ? dev10kStats : isCoastHalf ? coastStats : isOmahaHalf ? omahaHalfStats : isOmaha10k ? omaha10kStats : isMaraetaiHalf ? maraetaiHalfStats : isMaraetai10k ? maraetai10kStats : (dist === '21.1 km' ? halfStats : yearStats);
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
              ) : pageRows.map(r => {
                const slug = getAthleteSlug(r.name);
                return (
                  <tr key={r.pos} className="row">
                    <td className={`pos ${r.pos === 1 ? 'pos-1' : ''}`}>{r.pos}</td>
                    <td className="dimmed time">{r.bib || '—'}</td>
                    <td>
                      {slug
                        ? <Link to={`/athletes/${slug}`} className="serif" style={{ fontSize: 16, color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--rule)' }}>{r.name}</Link>
                        : <span className="serif" style={{ fontSize: 16 }}>{r.name}</span>
                      }
                      <span className="dimmed" style={{ marginLeft: 8, fontSize: 11 }}>{r.nat}</span>
                    </td>
                    <td className="dimmed">{r.cat}</td>
                    <td className="num time">{r.time}</td>
                  </tr>
                );
              })}
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
        dist={(isRotoruaHalf || isHbHalf || isQtHalf || isWfHalf || isWf10k || isDevHalf || isDev10k || isCoastHalf || isOmahaHalf || isOmaha10k) ? '21.1 km' : (isRotorua || isHb || isQt) ? '42.2 km' : dist as '42.2 km' | '21.1 km'}
        raceId={raceId}
        initialQ={fullQ}
        onClose={() => setFullOpen(false)}
        onOpenAthlete={name => { setFullOpen(false); onOpenAthlete?.(name); }}
      />
    </div>
  );
}
