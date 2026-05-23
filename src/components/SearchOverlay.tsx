import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAthleteSlug } from '@/data/athleteProfiles';

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
  results: ResultEntry[];
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
  const ref                     = useRef<HTMLInputElement>(null);
  const navigate                = useNavigate();

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

    const letter = norm[0].match(/[a-z]/) ? norm[0] : '_';
    const shard  = await loadShard(letter);

    const hits: FinisherMatch[] = [];
    for (const [key, entry] of Object.entries(shard)) {
      if (key.includes(norm)) {
        hits.push({
          kind:    'finisher',
          name:    entry.display,
          meta:    bestResult(entry.results),
          slug:    getAthleteSlug(entry.display),
          results: entry.results,
        });
      }
    }

    // Sort: exact match first, then most appearances, then alpha
    hits.sort((a, b) => {
      const aNorm = normalise(a.name);
      const bNorm = normalise(b.name);
      if (aNorm === norm && bNorm !== norm) return -1;
      if (bNorm === norm && aNorm !== norm) return 1;
      if (b.results.length !== a.results.length) return b.results.length - a.results.length;
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

  const raceHref = (result: ResultEntry): string | null => {
    const r = result.r.toLowerCase();
    if (r.includes('auckland marathon'))     return '/races/auckland-marathon';
    if (r.includes('auckland half'))         return '/races/auckland-marathon';
    if (r.includes('rotorua marathon'))      return '/races/rotorua-marathon';
    if (r.includes('rotorua half'))          return '/races/rotorua-marathon';
    if (r.includes('christchurch marathon')) return '/races/christchurch-marathon';
    if (r.includes('christchurch half'))     return '/races/christchurch-marathon';
    if (r.includes('queenstown marathon'))   return '/races/queenstown-marathon';
    if (r.includes('queenstown half'))       return '/races/queenstown-marathon';
    if (r.includes('hawke'))                 return '/races/hawkes-bay-marathon';
    if (r.includes('waterfront'))            return '/races/waterfront-half-marathon';
    if (r.includes('devonport'))             return '/races/devonport-half-marathon';
    if (r.includes('coatesville'))           return '/races/coatesville-half-marathon';
    if (r.includes('omaha'))                 return '/races/omaha-half-marathon';
    return null;
  };

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
                    else setExpanded(isExpanded ? null : m.name);
                  }}
                >
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--meta)', minWidth: 52, paddingTop: 2 }}>
                    {m.results.length > 1 ? `${m.results.length}×` : '1×'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 16, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      {m.name}
                      {profileHref && (
                        <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--meta)', border: '0.5px solid var(--meta)', padding: '1px 5px' }}>
                          profile
                        </span>
                      )}
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
                    {m.results.map((res, j) => {
                      const href = raceHref(res);
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
