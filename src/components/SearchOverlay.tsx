import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchNames, loadHitResults, type NameHit, type SearchResult } from '@/lib/searchIndex';
import { racesForYear } from '@/data/raceDirectory';
import { SharedNameChip, useSharedNames } from '@/lib/sharedNames';
import { raceHrefFor } from '@/lib/raceLinks';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultEntry {
  r:   string;  // race label
  y:   number;  // year
  t:   string;  // finish time
  p:   number;  // position
  tot: number;  // field size
}

interface IndexEntry {
  display: string;
  results: ResultEntry[];
}

type ShardData = Record<string, IndexEntry>;

// ─── Static suggestions (shown before typing) ────────────────────────────────

const SUGGESTIONS = [
  { kind: 'athlete', name: 'Daniel Balchin',      meta: 'NZL · Auckland 2023–2025 winner',      href: '/athletes/daniel-balchin' },
  { kind: 'athlete', name: 'Michael Voss',         meta: 'NZL · Rotorua 5× winner',              href: '/athletes/michael-voss' },
  { kind: 'athlete', name: 'Cameron Graves',       meta: 'NZL · Auckland Half CR 2020',          href: '/athletes/cameron-graves' },
  { kind: 'athlete', name: 'Ciaran Faherty',       meta: 'NZL · CHC 2017 · ROT 2019 · QT 2024', href: '/athletes/ciaran-faherty' },
  { kind: 'athlete', name: 'Dylan Logan',          meta: 'NZL · CHC 2025 · WF 2024',            href: '/athletes/dylan-logan' },
  { kind: 'race',    name: 'Auckland Marathon',    meta: 'Road · est 1992',                       href: '/races/auckland-marathon' },
  { kind: 'race',    name: 'Rotorua Marathon',     meta: 'Road · est 1967',                       href: '/races/rotorua-marathon' },
  { kind: 'race',    name: 'Christchurch Marathon',meta: 'Road · est 2007',                       href: '/races/christchurch-marathon' },
  { kind: 'race',    name: 'Queenstown Marathon',  meta: 'Mixed · est 2014',                      href: '/races/queenstown-marathon' },
];

// ─── Shard cache (persists across opens) ─────────────────────────────────────

const shardCache = new Map<string, ShardData>();

async function loadShard(letter: string): Promise<ShardData> {
  if (shardCache.has(letter)) return shardCache.get(letter)!;
  const res = await fetch(`/data/search/${letter}.json`);
  if (!res.ok) return {};
  const data: ShardData = await res.json();
  shardCache.set(letter, data);
  return data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().trim();
}

/** Best single result to show as the subtitle under a name */
function bestResult(results: ResultEntry[]): string {
  if (results.length === 0) return '';
  const sorted = [...results].sort((a, b) => b.y - a.y);
  const best = sorted[0];
  const count = results.length;
  const suffix = count > 1 ? ` · ${count} results on record` : '';
  return `${best.r} ${best.y} · ${best.t}${suffix}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface FinisherMatch {
  kind: 'finisher';
  name: string;
  meta: string;
  slug: string | null;
  count: number;
  /** Identifies the person, so detail can be fetched when the row expands. */
  hit: NameHit;
}

interface StaticMatch {
  kind: 'athlete' | 'race';
  name: string;
  meta: string;
  href: string;
}

type Match = FinisherMatch | StaticMatch;

export default function SearchOverlay({ open, onClose, initialQuery = '' }: SearchOverlayProps) {
  const [q, setQ]               = useState('');
  const [matches, setMatches]   = useState<Match[]>([]);
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Shards carry pointers; a row's results are fetched the first time it opens.
  const [detail, setDetail] = useState<Record<string, SearchResult[]>>({});
  const ref                     = useRef<HTMLInputElement>(null);
  const navigate                = useNavigate();
  const sharedNames             = useSharedNames();

  // Focus / reset on open/close — pre-fill query if provided
  useEffect(() => {
    if (open) {
      if (initialQuery) setQ(initialQuery);
      ref.current?.focus();
    } else {
      setQ(''); setMatches([]); setExpanded(null);
    }
  }, [open, initialQuery]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Search logic
  const search = useCallback(async (query: string) => {
    const norm = normalise(query);

    if (norm.length < 2) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // ── Year query: return all race editions for that year ────────────────
    if (/^\d{4}$/.test(norm)) {
      const yr = parseInt(norm, 10);
      const raceMatches: StaticMatch[] = racesForYear(yr).map(r => ({
        kind: 'race' as const,
        name: `${r.label} ${yr}`,
        meta: r.dist,
        href: `${r.route}?year=${yr}`,
      }));
      setMatches(raceMatches);
      setLoading(false);
      return;
    }

    // ── Name query: search sharded index ─────────────────────────────────
    const found = await searchNames(query);
    const hits: FinisherMatch[] = found.map(h => ({
      kind: 'finisher' as const,
      name: h.name,
      meta: h.pointer.n === 1 ? '1 result on record' : `${h.pointer.n} results on record`,
      slug: h.slug,
      count: h.pointer.n,
      hit: h,
    }));

    // Sort: exact match first, profiled before unlinked when names equal, then most appearances, then alpha
    hits.sort((a, b) => {
      const aNorm = normalise(a.name);
      const bNorm = normalise(b.name);
      if (aNorm === norm && bNorm !== norm) return -1;
      if (bNorm === norm && aNorm !== norm) return 1;
      if (a.name === b.name) return (b.slug ? 1 : 0) - (a.slug ? 1 : 0);
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

    setMatches(hits.slice(0, 40));
    setLoading(false);
  }, []);

  // Debounce
  useEffect(() => {
    if (q.length < 2) { setMatches([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(() => search(q), 180);
    return () => clearTimeout(t);
  }, [q, search]);

  if (!open) return null;

  const showSuggestions = q.length < 2;

  const pick = (href: string) => { onClose(); navigate(href); };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-box" onClick={e => e.stopPropagation()}>

        {/* ── Input ── */}
        <div className="search-box-inner">
          <div className="label mb-8">Search athletes, races, results</div>
          <input
            ref={ref}
            className="input"
            placeholder="Name, race, year…"
            value={q}
            onChange={e => { setQ(e.target.value); setExpanded(null); }}
            style={{ fontSize: 16 }}
          />
          <div className="label" style={{ marginTop: 8, opacity: 0.5 }}>
            {loading ? 'Searching…' : 'ESC to close'}
          </div>
        </div>

        {/* ── Results ── */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>

          {/* Static suggestions (before typing) */}
          {showSuggestions && SUGGESTIONS.map((s, i) => (
            <div key={i} className="search-result-item" onClick={() => pick(s.href)}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--meta)', minWidth: 52 }}>
                {s.kind}
              </div>
              <div>
                <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 16 }}>{s.name}</div>
                <div className="dimmed" style={{ fontSize: 11, marginTop: 2 }}>{s.meta}</div>
              </div>
            </div>
          ))}

          {/* Finisher results */}
          {!showSuggestions && matches.map((m, i) => {
            if (m.kind === 'athlete' || m.kind === 'race') {
              return (
                <div key={i} className="search-result-item" onClick={() => pick(m.href)}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--meta)', minWidth: 52 }}>
                    {m.kind}
                  </div>
                  <div>
                    <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 16 }}>{m.name}</div>
                    <div className="dimmed" style={{ fontSize: 11, marginTop: 2 }}>{m.meta}</div>
                  </div>
                </div>
              );
            }

            // Finisher result
            const isExpanded = expanded === m.name;
            const profileHref = m.slug ? `/athletes/${m.slug}` : null;

            return (
              <div key={i} style={{ borderBottom: '0.5px solid var(--rule-soft)' }}>
                {/* Name row */}
                <div
                  className="search-result-item"
                  style={{ borderBottom: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    if (profileHref) pick(profileHref);
                    else {
                      if (isExpanded) { setExpanded(null); return; }
                      setExpanded(m.name);
                      const dk = `${m.hit.key}#${m.hit.idx}`;
                      if (!detail[dk]) {
                        loadHitResults(m.hit).then(res => setDetail(d => ({ ...d, [dk]: res })));
                      }
                    }
                  }}
                >
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--meta)', minWidth: 52, paddingTop: 2 }}>
                    {m.count > 1 ? `${m.count}×` : '1×'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 16, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      {m.name}
                      {profileHref && (
                        <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--meta)', border: '0.5px solid var(--meta)', padding: '1px 5px' }}>
                          profile
                        </span>
                      )}
                      {m.slug && sharedNames.has(m.slug) && <SharedNameChip />}
                    </div>
                    <div className="dimmed" style={{ fontSize: 11, marginTop: 2 }}>{m.meta}</div>
                  </div>
                  {/* Expand chevron (for non-profile finishers) */}
                  {!profileHref && (
                    <div style={{ fontSize: 11, color: 'var(--meta)', alignSelf: 'center', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}>
                      ▾
                    </div>
                  )}
                </div>

                {/* Expanded result rows */}
                {isExpanded && (
                  <div style={{ paddingBottom: 8 }}>
                    {(detail[`${m.hit.key}#${m.hit.idx}`] ?? []).map((res, j) => {
                      const href = raceHrefFor(res.r, res.y, res.p);
                      return (
                        <div
                          key={j}
                          style={{
                            padding: '5px 24px 5px 88px',
                            display: 'flex',
                            gap: 16,
                            fontSize: 12,
                            cursor: href ? 'pointer' : 'default',
                            color: 'var(--ink)',
                          }}
                          onClick={href ? () => pick(href) : undefined}
                          onMouseEnter={e => { if (href) (e.currentTarget as HTMLElement).style.background = 'var(--hover)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                        >
                          <span style={{ fontFamily: "'DM Mono', monospace", minWidth: 60 }}>{res.t}</span>
                          <span style={{ flex: 1 }}>{res.r} <span style={{ color: 'var(--meta)' }}>{res.y}</span></span>
                          <span style={{ color: 'var(--meta)' }}>{res.p}/{res.tot}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {!showSuggestions && !loading && matches.length === 0 && (
            <div className="dimmed" style={{ padding: '24px', fontSize: 13 }}>
              No results for "{q}"
            </div>
          )}

          {/* Result count */}
          {!showSuggestions && matches.length > 0 && (
            <div style={{ padding: '10px 24px', fontSize: 10.5, color: 'var(--meta)', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '0.5px solid var(--rule-soft)' }}>
              {matches.length === 40 ? '40+ matches' : `${matches.length} match${matches.length !== 1 ? 'es' : ''}`}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
