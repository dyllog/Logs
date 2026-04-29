import { useState, useMemo, useEffect, useRef } from 'react';
import { loadResults, loadRotorua, YEARS, ROTORUA_YEARS, yearStats, halfStats, rotoruaStats, type ResultRow } from '@/data/logsDataExt';

interface FullResultsOverlayProps {
  open: boolean;
  year: number;
  dist?: '42.2 km' | '21.1 km';
  raceId?: 'auckland' | 'rotorua';
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
  const years = isRotorua ? [...ROTORUA_YEARS].reverse() : [...YEARS].reverse();
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
    const loader = isRotorua ? loadRotorua(year) : loadResults(year, dist);
    loader.then(rows => { setAll(rows); setLoading(false); });
  }, [year, dist, open, isRotorua]);

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

  const ql = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    let rs = all;
    if (gender !== 'all') rs = rs.filter(r => r.cat.startsWith(gender));
    if (ag !== 'all') rs = rs.filter(r => r.cat.includes(ag));
    if (ql) {
      if (/^\d+$/.test(ql)) {
        rs = rs.filter(r => String(r.bib).includes(ql) || String(r.pos) === ql);
      } else {
        rs = rs.filter(r =>
          r.name.toLowerCase().includes(ql) ||
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

  const colHeader = (k: SortKey, label: string, align?: string) => {
    const active = sortK === k;
    return (
      <div onClick={() => { if (active) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortK(k); setSortDir('asc'); } }}
           style={{ cursor: 'pointer', textAlign: (align as any) || 'left', userSelect: 'none' }} className="label">
        {label}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
      </div>
    );
  };

  const activeStats = isRotorua ? rotoruaStats : (dist === '21.1 km' ? halfStats : yearStats);
  const stat = activeStats.find(s => s.year === year)!;
  const grid = '60px 70px 1.6fr 1fr 100px';

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,20,16,0.45)', zIndex: 150, display: 'flex', alignItems: 'stretch', justifyContent: 'center', touchAction: 'none' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(1100px, 96vw)', margin: '32px 0', background: 'var(--bg)', border: '0.5px solid var(--ink)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '0.5px solid var(--rule)' }}>
          <div className="flex between ai-baseline">
            <div>
              <div className="eyebrow mb-8">{isRotorua ? 'Rotorua Marathon' : 'Auckland Marathon'} · full results</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: grid, padding: '10px 28px', borderBottom: '0.5px solid var(--rule)', background: 'var(--bg-alt)', fontVariantNumeric: 'tabular-nums' }}>
          {colHeader('pos', 'Pos')}
          {colHeader('bib', 'Bib')}
          {colHeader('name', 'Name')}
          {colHeader('cat', 'Category')}
          {colHeader('time', 'Time', 'right')}
        </div>

        {/* Rows */}
        <div ref={scrollRef} style={{ overflow: 'auto', flex: '1 1 auto', minHeight: 300, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
          {loading ? (
            <div className="dimmed" style={{ padding: 60, textAlign: 'center' }}>Loading {year} results…</div>
          ) : (
            <>
              <div style={{ height: topPad }} />
              {slice.map((r, i) => (
                <div key={startIdx + i}
                     style={{ display: 'grid', gridTemplateColumns: grid, padding: '0 28px', alignItems: 'center', height: rowH, borderBottom: '0.5px solid var(--rule-soft)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}
                     onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover)'}
                     onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <div className={`pos ${r.pos === 1 ? 'pos-1' : ''}`}>{r.pos}</div>
                  <div className="dimmed">{r.bib || '—'}</div>
                  <div>
                    <span className="serif" style={{ fontSize: 15 }}>{r.name}</span>
                    <span className="dimmed" style={{ marginLeft: 8, fontSize: 10.5 }}>{r.nat}</span>
                  </div>
                  <div className="dimmed">{r.cat}</div>
                  <div className="num time">{r.time}</div>
                </div>
              ))}
              <div style={{ height: botPad }} />
              {filtered.length === 0 && (
                <div className="dimmed" style={{ padding: 60, textAlign: 'center' }}>No finishers match these filters.</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '0.5px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-alt)' }}>
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
