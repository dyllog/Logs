import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAthleteSlug } from '@/data/athleteProfiles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultEntry {
  r:   string;
  y:   number;
  t:   string;
  p:   number;
  tot: number;
}

interface IndexEntry {
  display: string;
  results: ResultEntry[];
}

type ShardData = Record<string, IndexEntry>;

// ─── Shard cache ──────────────────────────────────────────────────────────────

const shardCache = new Map<string, ShardData>();

async function loadShard(letter: string): Promise<ShardData> {
  if (shardCache.has(letter)) return shardCache.get(letter)!;
  try {
    const res = await fetch(`/data/search/${letter}.json`);
    if (!res.ok) return {};
    const data: ShardData = await res.json();
    shardCache.set(letter, data);
    return data;
  } catch {
    return {};
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s.toLowerCase().trim();
}

function bestResultMeta(results: ResultEntry[]): string {
  if (!results.length) return '';
  const count = results.length;
  return count === 1 ? '1 result on record' : `${count} results on record`;
}

function raceBase(raceLabel: string): string | null {
  const r = raceLabel.toLowerCase();
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
}

function raceHref(res: ResultEntry): string | null {
  const base = raceBase(res.r);
  if (!base) return null;
  const params = new URLSearchParams({ year: String(res.y), pos: String(res.p) });
  return `${base}?${params}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface FinisherMatch {
  name:    string;
  meta:    string;
  slug:    string | null;
  results: ResultEntry[];
}

export function useInlineSearch(query: string) {
  const [matches, setMatches] = useState<FinisherMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    const norm = normalise(q);
    if (norm.length < 2) { setMatches([]); setLoading(false); return; }

    setLoading(true);
    const letter = norm[0].match(/[a-z]/) ? norm[0] : '_';
    const shard  = await loadShard(letter);

    const hits: FinisherMatch[] = [];
    for (const [key, entry] of Object.entries(shard)) {
      if (key.includes(norm)) {
        hits.push({
          name:    entry.display,
          meta:    bestResultMeta(entry.results),
          slug:    getAthleteSlug(entry.display),
          results: entry.results,
        });
      }
    }

    hits.sort((a, b) => {
      const an = normalise(a.name), bn = normalise(b.name);
      if (an === norm && bn !== norm) return -1;
      if (bn === norm && an !== norm) return  1;
      if (b.results.length !== a.results.length) return b.results.length - a.results.length;
      return a.name.localeCompare(b.name);
    });

    setMatches(hits.slice(0, 40));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setMatches([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(() => search(query), 180);
    return () => clearTimeout(t);
  }, [query, search]);

  return { matches, loading };
}

// ─── Dropdown component ───────────────────────────────────────────────────────

interface InlineSearchDropdownProps {
  query:   string;
  onClose: () => void;
}

export default function InlineSearchDropdown({ query, onClose }: InlineSearchDropdownProps) {
  const { matches, loading } = useInlineSearch(query);
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

  const pick = (href: string) => { onClose(); navigate(href); };

  if (query.length < 2) return null;

  return (
    <div className="lp-search-dropdown">

      {loading && (
        <div className="lp-search-dropdown-status">Searching…</div>
      )}

      {!loading && matches.map((m, i) => {
        const profileHref = m.slug ? `/athletes/${m.slug}` : null;
        const isExpanded  = expanded === m.name;

        return (
          <div key={i} className="lp-search-dropdown-group">
            <div
              className="lp-search-dropdown-row"
              onClick={() => {
                if (profileHref) pick(profileHref);
                else setExpanded(isExpanded ? null : m.name);
              }}
            >
              <span className="lp-search-dropdown-count">
                {m.results.length > 1 ? `${m.results.length}×` : '1×'}
              </span>
              <span className="lp-search-dropdown-name">
                {m.name}
                {profileHref && (
                  <span className="lp-search-dropdown-pill">profile</span>
                )}
              </span>
              <span className="lp-search-dropdown-meta">{m.meta}</span>
              {!profileHref && (
                <span
                  className="lp-search-dropdown-chevron"
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                >▾</span>
              )}
            </div>

            {isExpanded && (
              <div className="lp-search-dropdown-results">
                {m.results.map((res, j) => {
                  const href = raceHref(res);
                  return (
                    <div
                      key={j}
                      className={`lp-search-dropdown-result-row${href ? ' clickable' : ''}`}
                      onClick={href ? () => pick(href) : undefined}
                    >
                      <span className="lp-search-dropdown-time">{res.t}</span>
                      <span className="lp-search-dropdown-race">
                        {res.r} <span className="lp-search-dropdown-year">{res.y}</span>
                      </span>
                      <span className="lp-search-dropdown-pos">{res.p}/{res.tot}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {!loading && matches.length === 0 && (
        <div className="lp-search-dropdown-status">No results for "{query}"</div>
      )}

      {!loading && matches.length > 0 && (
        <div className="lp-search-dropdown-footer">
          {matches.length === 40 ? '40+ matches' : `${matches.length} match${matches.length !== 1 ? 'es' : ''}`}
        </div>
      )}
    </div>
  );
}
