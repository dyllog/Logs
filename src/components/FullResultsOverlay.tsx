import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { loadResults, loadRotorua, loadRotoruaHalf, loadChc, loadChcHalf, loadHb, loadHbHalf, loadQt, loadQtHalf, loadWaterfrontHalf, loadWaterfront10k, loadDevHalf, loadDev10k, loadCoastHalf, loadOmahaHalf, loadOmaha10k, loadMaraetaiHalf, loadMaraetai10k, loadKerikeriHalf, loadWellingtonMar, loadWellingtonHalf, loadOnehungaHalf, loadOnehunga10k, loadOrewaHalf, loadOrewa10k, loadTamakiHalf, loadTamaki10k, loadMtmHalf, loadMtm10k, loadMtm5k, YEARS, ROTORUA_YEARS, yearStats, halfStats, rotoruaStats, rotoruaHalfStats, type ResultRow } from '@/data/logsDataExt';
import { chcStats, chcHalfStats, CHC_YEARS } from '@/data/chcData';
import { hbStats, hbHalfStats, HB_YEARS } from '@/data/hbData';
import { qtStats, qtHalfStats, QT_YEARS } from '@/data/qtData';
import { wfHalfStats, wf10kStats, WF_YEARS } from '@/data/waterfrontData';
import { devHalfStats, dev10kStats, DEV_HALF_YEARS, DEV_10K_YEARS } from '@/data/devonportData';
import { coastStats, COAST_YEARS } from '@/data/coatesvilleData';
import { omahaHalfStats, omaha10kStats, OMAHA_HALF_YEARS, OMAHA_10K_YEARS } from '@/data/omahaData';
import { wellingtonMarStats, wellingtonHalfStats, WELLINGTON_MAR_YEARS, WELLINGTON_HALF_YEARS } from '@/data/wellingtonData';
import { maraetaiHalfStats, maraetai10kStats, MARAETAI_HALF_YEARS, MARAETAI_10K_YEARS } from '@/data/maraetaiData';
import { kerikeriStats, KERIKERI_YEARS } from '@/data/kerikeriData';
import { onehungaHalfStats, onehunga10kStats, ONEHUNGA_HALF_YEARS, ONEHUNGA_10K_YEARS } from '@/data/onehungaData';
import { orewaHalfStats, orewa10kStats, OREWA_HALF_YEARS, OREWA_10K_YEARS } from '@/data/orewaData';
import { tamakiHalfStats, tamaki10kStats, TAMAKI_HALF_YEARS, TAMAKI_10K_YEARS } from '@/data/tamakiData';
import { mtmHalfStats, mtm10kStats, mtm5kStats, MTM_HALF_YEARS, MTM_10K_YEARS, MTM_5K_YEARS } from '@/data/mtmData';
import { normalise, getAthleteSlug, preloadAthleteIndex } from '@/data/athleteProfiles';
import type { RaceResultsId } from '@/data/raceMeta';

interface FullResultsOverlayProps {
  open: boolean;
  year: number;
  dist?: '42.2 km' | '21.1 km';
  raceId?: RaceResultsId;
  initialQ?: string;
  onClose: () => void;
  onOpenAthlete?: (name: string) => void;
}

const AGS: [string, string][] = [
  ['all','All'],['Elite','Elite'],
  ['18–19','18–19'],['20–24','20–24'],['25–29','25–29'],['30–34','30–34'],['35–39','35–39'],
  ['40–44','40–44'],['45–49','45–49'],['50–54','50–54'],['55–59','55–59'],
  ['60–64','60–64'],['65–69','65–69'],['70–74','70–74'],['75+','75+'],
];
type SortKey = 'pos' | 'bib' | 'time' | 'name' | 'cat';

export default function FullResultsOverlay({ open, year: yearProp, dist = '42.2 km', raceId = 'auckland', initialQ, onClose, onOpenAthlete }: FullResultsOverlayProps) {
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
  const isWellingtonMar = raceId === 'wellington-mar';
  const isWellingtonHalf = raceId === 'wellington-half';
  const isMaraetaiHalf = raceId === 'maraetai-half';
  const isMaraetai10k = raceId === 'maraetai-10k';
  const isKerikeriHalf = raceId === 'kerikeri-half';
  const isOnehungaHalf = raceId === 'onehunga-half';
  const isOnehunga10k = raceId === 'onehunga-10k';
  const isOrewaHalf = raceId === 'orewa-half';
  const isOrewa10k = raceId === 'orewa-10k';
  const isTamakiHalf = raceId === 'tamaki-half';
  const isTamaki10k = raceId === 'tamaki-10k';
  const isMtmHalf = raceId === 'mtm-half';
  const isMtm10k = raceId === 'mtm-10k';
  const isMtm5k = raceId === 'mtm-5k';
  const years = (isChc || isChcHalf)
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
    : isWellingtonMar ? [...WELLINGTON_MAR_YEARS].reverse()
    : isWellingtonHalf ? [...WELLINGTON_HALF_YEARS].reverse()
    : isMaraetaiHalf ? [...MARAETAI_HALF_YEARS].reverse()
    : isMaraetai10k ? [...MARAETAI_10K_YEARS].reverse()
    : isKerikeriHalf ? [...KERIKERI_YEARS].reverse()
    : isOnehungaHalf ? [...ONEHUNGA_HALF_YEARS].reverse()
    : isOnehunga10k ? [...ONEHUNGA_10K_YEARS].reverse()
    : isOrewaHalf ? [...OREWA_HALF_YEARS].reverse()
    : isOrewa10k ? [...OREWA_10K_YEARS].reverse()
    : isTamakiHalf ? [...TAMAKI_HALF_YEARS].reverse()
    : isTamaki10k ? [...TAMAKI_10K_YEARS].reverse()
    : isMtmHalf ? [...MTM_HALF_YEARS].reverse()
    : isMtm10k ? [...MTM_10K_YEARS].reverse()
    : isMtm5k ? [...MTM_5K_YEARS].reverse()
    : [...YEARS].reverse();
  const [year, setYear] = useState(yearProp);
  const [q, setQ] = useState(initialQ ?? '');
  const [gender, setGender] = useState('all');
  const [ag, setAg] = useState('all');
  const [sortK, setSortK] = useState<SortKey>('pos');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [all, setAll] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setYear(yearProp); setQ(initialQ ?? ''); }, [yearProp, initialQ, open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setAll([]);
    const loader = isChcHalf ? loadChcHalf(year) : isChc ? loadChc(year) : isRotoruaHalf ? loadRotoruaHalf(year) : isRotorua ? loadRotorua(year) : isHbHalf ? loadHbHalf(year) : isHb ? loadHb(year) : isQtHalf ? loadQtHalf(year) : isQt ? loadQt(year) : isWf10k ? loadWaterfront10k(year) : isWfHalf ? loadWaterfrontHalf(year) : isDevHalf ? loadDevHalf(year) : isDev10k ? loadDev10k(year) : isCoastHalf ? loadCoastHalf(year) : isOmahaHalf ? loadOmahaHalf(year) : isOmaha10k ? loadOmaha10k(year) : isMaraetaiHalf ? loadMaraetaiHalf(year) : isMaraetai10k ? loadMaraetai10k(year) : isKerikeriHalf ? loadKerikeriHalf(year) : isWellingtonMar ? loadWellingtonMar(year) : isWellingtonHalf ? loadWellingtonHalf(year) : isOnehungaHalf ? loadOnehungaHalf(year) : isOnehunga10k ? loadOnehunga10k(year) : isOrewaHalf ? loadOrewaHalf(year) : isOrewa10k ? loadOrewa10k(year) : isTamakiHalf ? loadTamakiHalf(year) : isTamaki10k ? loadTamaki10k(year) : isMtmHalf ? loadMtmHalf(year) : isMtm10k ? loadMtm10k(year) : isMtm5k ? loadMtm5k(year) : loadResults(year, dist);
    loader.then(rows => { setAll(rows); setLoading(false); });
  }, [year, dist, open, isRotorua, isRotoruaHalf, isChc, isChcHalf, isHb, isHbHalf, isQt, isQtHalf, isWfHalf, isWf10k, isDevHalf, isDev10k, isCoastHalf, isOmahaHalf, isOmaha10k, isMaraetaiHalf, isMaraetai10k, isKerikeriHalf, isWellingtonMar, isWellingtonHalf, isOnehungaHalf, isOnehunga10k, isOrewaHalf, isOrewa10k, isTamakiHalf, isTamaki10k, isMtmHalf, isMtm10k, isMtm5k]);

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ql = normalise(q.trim());
  const filtered = useMemo(() => {
    let rs = all;
    if (gender !== 'all') rs = rs.filter(r => r.cat.startsWith(gender));
    if (ag !== 'all') rs = rs.filter(r => r.cat.includes(ag));
    if (ql) {
      if (/^\d+$/.test(ql)) {
        rs = rs.filter(r => String(r.bib).includes(ql) || String(r.pos) === ql);
      } else {
        rs = rs.filter(r =>
          normalise(r.name).includes(ql) ||
          r.nat.toLowerCase().includes(ql)
        );
      }
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    return rs.slice().sort((a, b) => {
      if (sortK === 'pos')  return (a.pos - b.pos) * dir;
      if (sortK === 'bib')  return (a.bib - b.bib) * dir;
      if (sortK === 'time') return (a.sec - b.sec) * dir;
      if (sortK === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortK === 'cat')  return a.cat.localeCompare(b.cat) * dir;
      return 0;
    });
  }, [all, ql, gender, ag, sortK, sortDir]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewH, setViewH] = useState(600);
  const rowH = 36;

  useEffect(() => {
    if (!scrollRef.current || !open) return;
    const el = scrollRef.current;
    const onScroll = () => setScrollTop(el.scrollTop);
    const onResize = () => setViewH(el.clientHeight);
    el.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    onResize();
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
  }, [open]);

  const startIdx = Math.max(0, Math.floor(scrollTop / rowH) - 6);
  const endIdx = Math.min(filtered.length, Math.ceil((scrollTop + viewH) / rowH) + 6);
  const topPad = startIdx * rowH;
  const botPad = (filtered.length - endIdx) * rowH;
  const slice = filtered.slice(startIdx, endIdx);

  // Preload athlete-index shards for visible rows so multi-race names link out.
  const [, bumpIndex] = useState(0);
  const idxLoaded = useRef(new Set<string>());
  useEffect(() => {
    const letters = new Set(slice.map(r => {
      const c = normalise(r.name)[0];
      return c >= 'a' && c <= 'z' ? c : '_';
    }));
    const missing = [...letters].filter(l => !idxLoaded.current.has(l));
    if (!missing.length) return;
    missing.forEach(l => idxLoaded.current.add(l));
    let cancelled = false;
    Promise.all(slice.map(r => preloadAthleteIndex(r.name)))
      .then(() => { if (!cancelled) bumpIndex(v => v + 1); });
    return () => { cancelled = true; };
  }, [slice]);

  const colHeader = (k: SortKey, label: string, align?: string) => {
    const active = sortK === k;
    return (
      <div onClick={() => { if (active) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortK(k); setSortDir('asc'); } }}
           style={{ cursor: 'pointer', textAlign: (align as any) || 'left', userSelect: 'none' }} className="label">
        {label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
      </div>
    );
  };

  const activeStats = isChcHalf ? chcHalfStats : isChc ? chcStats : isRotoruaHalf ? rotoruaHalfStats : isRotorua ? rotoruaStats : isHbHalf ? hbHalfStats : isHb ? hbStats : isQtHalf ? qtHalfStats : isQt ? qtStats : isWf10k ? wf10kStats : isWfHalf ? wfHalfStats : isDevHalf ? devHalfStats : isDev10k ? dev10kStats : isCoastHalf ? coastStats : isOmahaHalf ? omahaHalfStats : isOmaha10k ? omaha10kStats : isMaraetaiHalf ? maraetaiHalfStats : isMaraetai10k ? maraetai10kStats : isKerikeriHalf ? kerikeriStats : isWellingtonMar ? wellingtonMarStats : isWellingtonHalf ? wellingtonHalfStats : isOnehungaHalf ? onehungaHalfStats : isOnehunga10k ? onehunga10kStats : isOrewaHalf ? orewaHalfStats : isOrewa10k ? orewa10kStats : isTamakiHalf ? tamakiHalfStats : isTamaki10k ? tamaki10kStats : isMtmHalf ? mtmHalfStats : isMtm10k ? mtm10kStats : isMtm5k ? mtm5kStats : (dist === '21.1 km' ? halfStats : yearStats);
  const stat = activeStats.find(s => s.year === year)!;
  const grid = '60px 70px 1.6fr 1fr 100px';

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,20,16,0.45)', zIndex: 150, display: 'flex', alignItems: 'stretch', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="fro-modal" style={{ width: 'min(1100px, 96vw)', margin: '32px 0', background: 'var(--bg)', border: '0.5px solid var(--ink)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="fro-section" style={{ padding: '20px 28px', borderBottom: '0.5px solid var(--rule)' }}>
          <div className="flex between ai-baseline">
            <div>
              <div className="eyebrow mb-8">
                {isChcHalf ? 'Christchurch Half Marathon'
                  : isChc ? 'Christchurch Marathon'
                  : isRotoruaHalf ? 'Rotorua Half Marathon'
                  : isRotorua ? 'Rotorua Marathon'
                  : isHbHalf ? "Hawke's Bay Half Marathon"
                  : isHb ? "Hawke's Bay Marathon"
                  : isQtHalf ? 'Queenstown Half Marathon'
                  : isQt ? 'Queenstown Marathon'
                  : isWf10k ? 'Waterfront 10 km'
                  : isWfHalf ? 'Waterfront Half Marathon'
                  : isDevHalf ? 'Devonport Half Marathon'
                  : isDev10k ? 'Devonport 10 km'
                  : isCoastHalf ? 'Coatesville Half Marathon'
                  : isOmahaHalf ? 'Omaha Half Marathon'
                  : isOmaha10k ? 'Omaha 10 km'
                  : isMaraetaiHalf ? 'Maraetai Half Marathon'
                  : isMaraetai10k ? 'Maraetai 10 km'
                  : isKerikeriHalf ? 'Kerikeri Half Marathon'
                  : isWellingtonMar ? 'Wellington Marathon'
                  : isWellingtonHalf ? 'Wellington Half Marathon'
                  : isOnehungaHalf ? 'Onehunga Half Marathon'
                  : isOnehunga10k ? 'Onehunga 10 km'
                  : isOrewaHalf ? 'Orewa Half Marathon'
                  : isOrewa10k ? 'Orewa 10 km'
                  : isTamakiHalf ? 'Tamaki River Half Marathon'
                  : isTamaki10k ? 'Tamaki River 10 km'
                  : isMtmHalf ? 'Mt Maunganui Half Marathon'
                  : isMtm10k ? 'Mt Maunganui 10 km'
                  : isMtm5k ? 'Mt Maunganui 5 km'
                  : dist === '21.1 km' ? 'Auckland Half Marathon'
                  : 'Auckland Marathon'
                } · full results
              </div>
              <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
                {year}
                {loading
                  ? <span style={{ color: 'var(--meta)', fontStyle: 'italic', fontSize: 18 }}> · loading…</span>
                  : <span style={{ color: 'var(--meta)', fontStyle: 'italic', fontSize: 18 }}> · {filtered.length.toLocaleString()} of {all.length.toLocaleString()} finishers</span>
                }
              </div>
            </div>
            <button className="btn-ghost" onClick={onClose}>Close ESC ✕</button>
          </div>
          <div className="flex gap-24 mt-24" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', maxWidth: 480, minWidth: 220 }}>
              <div className="label mb-8">Search</div>
              <div style={{ position: 'relative' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" style={{ position: 'absolute', left: 0, top: 14, opacity: 0.5 }}>
                  <circle cx="5" cy="5" r="3.5"/><line x1="7.6" y1="7.6" x2="10.5" y2="10.5"/>
                </svg>
                <input className="input" style={{ paddingLeft: 20 }} autoFocus
                       placeholder="Name · bib · nationality"
                       value={q} onChange={e => setQ(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="label mb-8">Year</div>
              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                {years.map(y => <button key={y} className={`pill ${year === y ? 'active' : ''}`} onClick={() => setYear(y)}>{y}</button>)}
              </div>
            </div>
            <div>
              <div className="label mb-8">Gender</div>
              <div className="flex gap-8">
                {([['all','All'],['M','Men'],['W','Women']] as [string,string][]).map(([k,l]) => (
                  <button key={k} className={`pill ${gender === k ? 'active' : ''}`} onClick={() => setGender(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="label mb-8">Age group</div>
              <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                {AGS.map(([k,l]) => <button key={k} className={`pill ${ag === k ? 'active' : ''}`} onClick={() => setAg(k)}>{l}</button>)}
              </div>
            </div>
          </div>
        </div>

        {/* Column headers */}
        <div className="fro-col-hd" style={{ display: 'grid', gridTemplateColumns: grid, padding: '10px 28px', borderBottom: '0.5px solid var(--rule)', background: 'var(--bg-alt)', fontVariantNumeric: 'tabular-nums' }}>
          {colHeader('pos', 'Pos')}
          {colHeader('bib', 'Bib')}
          {colHeader('name', 'Name')}
          {colHeader('cat', 'Category')}
          {colHeader('time', 'Time', 'right')}
        </div>

        {/* Rows */}
        <div ref={scrollRef} style={{ overflow: 'auto', flex: '1 1 auto', minHeight: 300, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          {loading ? (
            <div className="dimmed" style={{ padding: 60, textAlign: 'center' }}>Loading {year} results…</div>
          ) : (
            <>
              <div style={{ height: topPad }} />
              {slice.map((r, i) => {
                const slug = getAthleteSlug(r.name);
                return (
                  <div key={startIdx + i}
                       style={{ display: 'grid', gridTemplateColumns: grid, padding: '0 28px', alignItems: 'center', height: rowH, borderBottom: '0.5px solid var(--rule-soft)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}
                       onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover)'}
                       onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div className={`pos ${r.pos === 1 ? 'pos-1' : ''}`}>{r.pos}</div>
                    <div className="dimmed">{r.bib || '—'}</div>
                    <div>
                      {slug
                        ? <Link to={`/athletes/${slug}`} onClick={onClose} className="serif" style={{ fontSize: 15, color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'var(--rule)' }}>{r.name}</Link>
                        : <span className="serif" style={{ fontSize: 15 }}>{r.name}</span>
                      }
                      <span className="dimmed" style={{ marginLeft: 8, fontSize: 10.5 }}>{r.nat}</span>
                    </div>
                    <div className="dimmed">{r.cat}</div>
                    <div className="num time">{r.time}</div>
                  </div>
                );
              })}
              <div style={{ height: botPad }} />
              {filtered.length === 0 && (
                <div className="dimmed" style={{ padding: 60, textAlign: 'center' }}>No finishers match these filters.</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="fro-section" style={{ padding: '14px 28px', borderTop: '0.5px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-alt)' }}>
          <div className="label">
            {loading ? `Loading…` : `${stat.finishers.toLocaleString()} finishers · ${filtered.length.toLocaleString()} shown · click headers to sort`}
          </div>
          <div className="flex gap-8">
            <div className="label">Click column headers to sort · ESC to close</div>
          </div>
        </div>
      </div>
    </div>
  );
}
