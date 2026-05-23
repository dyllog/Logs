import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadResults, loadRotorua, loadRotoruaHalf, loadChc, loadChcHalf, loadHb, loadHbHalf, loadQt, loadQtHalf, loadWaterfrontHalf, loadWaterfront10k, loadDevHalf, loadDev10k, loadCoastHalf, loadOmahaHalf, loadOmaha10k, loadMaraetaiHalf, loadMaraetai10k, loadKerikeriHalf, loadWellingtonMar, loadWellingtonHalf, yearStats, halfStats, rotoruaStats, rotoruaHalfStats, YEARS, ROTORUA_YEARS, type ResultRow } from '@/data/logsDataExt';
import { chcStats, chcHalfStats, CHC_YEARS } from '@/data/chcData';
import { hbStats, hbHalfStats, HB_YEARS } from '@/data/hbData';
import { qtStats, qtHalfStats, QT_YEARS } from '@/data/qtData';
import { wfHalfStats, wf10kStats, WF_YEARS } from '@/data/waterfrontData';
import { devHalfStats, dev10kStats, DEV_HALF_YEARS, DEV_10K_YEARS } from '@/data/devonportData';
import { coastStats, COAST_YEARS } from '@/data/coatesvilleData';
import { omahaHalfStats, omaha10kStats, OMAHA_HALF_YEARS, OMAHA_10K_YEARS } from '@/data/omahaData';
import { maraetaiHalfStats, maraetai10kStats, MARAETAI_HALF_YEARS, MARAETAI_10K_YEARS } from '@/data/maraetaiData';
import { kerikeriStats, KERIKERI_YEARS } from '@/data/kerikeriData';
import { wellingtonMarStats, wellingtonHalfStats, WELLINGTON_MAR_YEARS, WELLINGTON_HALF_YEARS } from '@/data/wellingtonData';
import FullResultsOverlay from './FullResultsOverlay';
import { normalise, getAthleteSlug } from '@/data/athleteProfiles';

interface RaceResultsBlockProps {
  dist: string;
  raceId?: 'auckland' | 'rotorua' | 'rotorua-half' | 'chc' | 'chc-half' | 'hb' | 'hb-half' | 'qt' | 'qt-half' | 'wf-half' | 'wf-10k' | 'dev-half' | 'dev-10k' | 'coast-half' | 'omaha-half' | 'omaha-10k' | 'maraetai-half' | 'maraetai-10k' | 'kerikeri-half' | 'wellington-mar' | 'wellington-half';
  initialYear?: number;
  onOpenAthlete?: (name: string) => void;
}

export default function RaceResultsBlock({ dist, raceId = 'auckland', initialYear, onOpenAthlete }: RaceResultsBlockProps) {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const isKerikeriHalf = raceId === 'kerikeri-half';
  const isWellingtonMar = raceId === 'wellington-mar';
  const isWellingtonHalf = raceId === 'wellington-half';
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
    : isKerikeriHalf ? [...KERIKERI_YEARS].reverse()
    : isWellingtonMar ? [...WELLINGTON_MAR_YEARS].reverse()
    : isWellingtonHalf ? [...WELLINGTON_HALF_YEARS].reverse()
    : [...YEARS].reverse();
  const years = availableYears as number[];

  // Each block has a unique key so it only responds to deep-links aimed at it.
  // Auckland uses the same raceId for both distances, so we disambiguate via dist.
  const blockKey = (raceId === 'auckland')
    ? (dist === '42.2 km' ? 'auckland-full' : 'auckland-half')
    : raceId;

  const urlYear  = searchParams.get('year') ? Number(searchParams.get('year')) : null;
  const urlQ     = searchParams.get('q') ?? '';
  const urlRace  = searchParams.get('race');
  // Only honour the pos param when it targets this specific block (or no race key = legacy link)
  const urlPosRaw = searchParams.get('pos');
  const urlPos = urlPosRaw && (!urlRace || urlRace === blockKey)
    ? Number(urlPosRaw) : null;

  const resolvedInitial = (urlYear && (availableYears as number[]).includes(urlYear))
    ? urlYear
    : initialYear && (availableYears as number[]).includes(initialYear)
      ? initialYear
      : availableYears[0];
  const [year, setYear] = useState<number>(resolvedInitial);
  // If a position deep-link targets this block, start unfiltered so the full leaderboard shows
  const [q, setQ] = useState(urlPos ? '' : urlQ);
  // Jump straight to the page containing the highlighted position
  const [page, setPage] = useState(urlPos ? Math.ceil(urlPos / 10) : 1);
  const [fullOpen, setFullOpen] = useState(false);
  const [fullQ, setFullQ] = useState('');
  const [all, setAll] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  // Track whether dist has mounted yet so we don't clobber URL-based init on first render
  const distMounted = useRef(false);

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
      : isKerikeriHalf ? loadKerikeriHalf(year)
      : isWellingtonMar ? loadWellingtonMar(year)
      : isWellingtonHalf ? loadWellingtonHalf(year)
      : loadResults(year, dist as '42.2 km' | '21.1 km');
    loader.then(rows => { setAll(rows); setLoading(false); });
  }, [year, dist, hasData, isRotorua, isRotoruaHalf, isChc, isChcHalf, isHb, isHbHalf, isQt, isQtHalf, isWfHalf, isWf10k, isDevHalf, isDev10k, isCoastHalf, isOmahaHalf, isOmaha10k, isMaraetaiHalf, isMaraetai10k, isKerikeriHalf, isWellingtonMar, isWellingtonHalf]);

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

  // Reset to latest year when the *distance* prop changes (skip the initial mount so URL params survive)
  useEffect(() => {
    if (!distMounted.current) { distMounted.current = true; return; }
    setYear(availableYears[0] as number);
    setPage(1);
    setQ('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dist]);

  // Re-sync from URL params on same-page navigation (e.g. clicking a search result that
  // links to this race page with ?year=YYYY&pos=NNN&race=KEY while already on the page)
  useEffect(() => {
    const yr       = searchParams.get('year') ? Number(searchParams.get('year')) : null;
    const qq       = searchParams.get('q') ?? '';
    const raceParam = searchParams.get('race');
    const posRaw    = searchParams.get('pos');
    // Only apply pos navigation when this block is the intended target
    const posForUs  = posRaw && (!raceParam || raceParam === blockKey)
      ? Number(posRaw) : null;

    if (yr && (availableYears as number[]).includes(yr)) setYear(yr);

    if (posForUs) {
      setQ('');
      setPage(Math.ceil(posForUs / 10));
    } else {
      setQ(qq);
      setPage(1);
    }
    // availableYears and blockKey are stable derived values; searchParams is the real dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => { setPage(1); }, [ql]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);
  const activeStats = isChcHalf ? chcHalfStats : isChc ? chcStats : isRotoruaHalf ? rotoruaHalfStats : isRotorua ? rotoruaStats : isHbHalf ? hbHalfStats : isHb ? hbStats : isQtHalf ? qtHalfStats : isQt ? qtStats : isWf10k ? wf10kStats : isWfHalf ? wfHalfStats : isDevHalf ? devHalfStats : isDev10k ? dev10kStats : isCoastHalf ? coastStats : isOmahaHalf ? omahaHalfStats : isOmaha10k ? omaha10kStats : isMaraetaiHalf ? maraetaiHalfStats : isMaraetai10k ? maraetai10kStats : isKerikeriHalf ? kerikeriStats : isWellingtonMar ? wellingtonMarStats : isWellingtonHalf ? wellingtonHalfStats : (dist === '21.1 km' ? halfStats : yearStats);
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
              onChange={e => {
                const y = Number(e.target.value);
                setYear(y);
                setPage(1);
                setSearchParams(prev => {
                  const p = new URLSearchParams(prev);
                  p.set('year', String(y));
                  p.delete('q');   // clear deep-link filter
                  p.delete('pos'); // clear position highlight
                  return p;
                }, { replace: true });
              }}
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
                const isHighlighted = r.pos === urlPos && !ql;
                return (
                  <tr key={r.pos} className={`row${isHighlighted ? ' row-hl' : ''}`}>
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
        dist={(isRotoruaHalf || isHbHalf || isQtHalf || isWfHalf || isWf10k || isDevHalf || isDev10k || isCoastHalf || isOmahaHalf || isOmaha10k || isWellingtonHalf) ? '21.1 km' : (isRotorua || isHb || isQt || isWellingtonMar) ? '42.2 km' : dist as '42.2 km' | '21.1 km'}
        raceId={raceId}
        initialQ={fullQ}
        onClose={() => setFullOpen(false)}
        onOpenAthlete={name => { setFullOpen(false); onOpenAthlete?.(name); }}
      />
    </div>
  );
}
