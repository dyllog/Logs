import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAthleteSlug, preloadAthleteIndex, NAME_DISAMBIGUATION } from '@/data/athleteProfiles';
import { racesForYear, RACE_DIRECTORY } from '@/data/raceDirectory';

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

// Maps the exact race labels stored in the search index to a page URL
function raceBase(label: string): string | null {
  const r = label.toLowerCase();
  if (r.includes('auckland marathon') || r === 'auckland half')
                                           return '/races/auckland-marathon';
  if (r.includes('rotorua'))               return '/races/rotorua-marathon';
  if (r.includes('christchurch'))          return '/races/christchurch-marathon';
  if (r.includes('queenstown'))            return '/races/queenstown-marathon';
  if (r.includes('hawke'))                 return '/races/hawkes-bay-marathon';
  if (r.includes('waterfront'))            return '/races/waterfront-half-marathon';
  if (r.includes('devonport'))             return '/races/devonport-half-marathon';
  if (r.includes('coatesville'))           return '/races/coatesville-half-marathon';
  if (r.includes('omaha'))                 return '/races/omaha-half-marathon';
  if (r.includes('maraetai'))              return '/races/maraetai-half-marathon';
  if (r.includes('kerikeri'))              return '/races/kerikeri-half-marathon';
  if (r.includes('wellington'))            return '/races/wellington-marathon';
  if (r.includes('tamaki'))               return '/races/tamaki-river-half-marathon';
  return null;
}

// Maps the exact race label to the raceId used by RaceResultsBlock
// (must stay in sync with RACE_LABELS in scripts/build-search-index.mjs)
const LABEL_TO_RACE_KEY: Record<string, string> = {
  'Auckland Marathon':     'auckland-full',
  'Auckland Half':         'auckland-half',
  'Christchurch Marathon': 'chc',
  'Christchurch Half':     'chc-half',
  'Rotorua Marathon':      'rotorua',
  'Rotorua Half':          'rotorua-half',
  'Queenstown Marathon':   'qt',
  'Queenstown Half':       'qt-half',
  "Hawke's Bay Marathon":  'hb',
  "Hawke's Bay Half":      'hb-half',
  'Waterfront Half':       'wf-half',
  'Waterfront 10k':        'wf-10k',
  'Devonport Half':        'dev-half',
  'Devonport 10k':         'dev-10k',
  'Coatesville Half':      'coast-half',
  'Omaha Half':            'omaha-half',
  'Omaha 10k':             'omaha-10k',
  'Kerikeri Half':         'kerikeri-half',
  'Maraetai Half':         'maraetai-half',
  'Maraetai 10k':          'maraetai-10k',
  'Wellington Half':       'wellington-half',
  'Wellington Marathon':   'wellington-mar',
  'Tamaki River Half':     'tamaki-half',
  'Tamaki River 10k':      'tamaki-10k',
};

function raceHref(res: ResultEntry): string | null {
  const base = raceBase(res.r);
  if (!base) return null;
  const key = LABEL_TO_RACE_KEY[res.r];
  const params = new URLSearchParams({ year: String(res.y), pos: String(res.p) });
  if (key) params.set('race', key);
  return `${base}?${params}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FinisherMatch {
  kind:    'finisher';
  name:    string;
  meta:    string;
  slug:    string | null;
  results: ResultEntry[];
}

interface YearRaceMatch {
  kind:  'race';
  label: string;   // e.g. "Auckland Marathon"
  dist:  string;   // e.g. "42.2 km"
  year:  number;
  href:  string;   // e.g. "/races/auckland-marathon?year=2024"
}

type AnyMatch = FinisherMatch | YearRaceMatch;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInlineSearch(query: string) {
  const [matches, setMatches] = useState<AnyMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    const norm = normalise(q);
    if (norm.length < 2) { setMatches([]); setLoading(false); return; }

    setLoading(true);

    // ── Year query: show all race editions for that year ──────────────────
    if (/^\d{4}$/.test(norm)) {
      const yr = parseInt(norm, 10);
      const raceMatches: YearRaceMatch[] = racesForYear(yr).map(r => ({
        kind:  'race' as const,
        label: r.label,
        dist:  r.dist,
        year:  yr,
        href:  `${r.route}?year=${yr}`,
      }));
      setMatches(raceMatches);
      setLoading(false);
      return;
    }

    // ── Race name query (synchronous) ────────────────────────────────────
    const raceNameHits: YearRaceMatch[] = [];
    const seenLabels = new Set<string>();
    for (const race of RACE_DIRECTORY) {
      // Match the current label or any historic name, so a retired brand
      // ("Tarawera 100K") still resolves to the lineage that carries it.
      const alias = race.aliases?.find(a => normalise(a).includes(norm));
      const hit = normalise(race.label).includes(norm) || !!alias;
      if (hit && !seenLabels.has(race.label)) {
        seenLabels.add(race.label);
        const latestYear = Math.max(...(race.years as number[]));
        raceNameHits.push({
          kind:  'race',
          label: alias && !normalise(race.label).includes(norm)
            ? `${race.label} · formerly ${alias}`
            : race.label,
          dist:  race.dist,
          year:  latestYear,
          href:  race.route,
        });
      }
    }

    // ── Name query: search sharded index ─────────────────────────────────
    const letter = norm[0].match(/[a-z]/) ? norm[0] : '_';
    const shard  = await loadShard(letter);

    // Preload athlete-index shards for matched names so multi-race profiles resolve.
    const matched = Object.entries(shard).filter(([key]) => key.includes(norm));
    await Promise.all(matched.map(([, entry]) => preloadAthleteIndex(entry.display)));

    const hits: FinisherMatch[] = [];
    for (const [key, entry] of matched) {
      if (key.includes(norm)) {
        const slug      = getAthleteSlug(entry.display);
        const conflicts = NAME_DISAMBIGUATION[entry.display];

        if (slug && conflicts?.length) {
          const isConflict = (r: ResultEntry) =>
            conflicts.some(c => c.r === r.r && c.y === r.y);
          const profileResults = entry.results.filter(r => !isConflict(r));
          const otherResults   = entry.results.filter(r =>  isConflict(r));

          hits.push({ kind: 'finisher', name: entry.display, meta: bestResultMeta(profileResults), slug, results: profileResults });
          if (otherResults.length) {
            hits.push({ kind: 'finisher', name: entry.display, meta: bestResultMeta(otherResults), slug: null, results: otherResults });
          }
        } else {
          hits.push({ kind: 'finisher', name: entry.display, meta: bestResultMeta(entry.results), slug, results: entry.results });
        }
      }
    }

    hits.sort((a, b) => {
      const an = normalise(a.name), bn = normalise(b.name);
      if (an === norm && bn !== norm) return -1;
      if (bn === norm && an !== norm) return  1;
      if (a.name === b.name) return (b.slug ? 1 : 0) - (a.slug ? 1 : 0);
      if (b.results.length !== a.results.length) return b.results.length - a.results.length;
      return a.name.localeCompare(b.name);
    });

    const athleteSlots = Math.max(0, 40 - raceNameHits.length);
    setMatches([...raceNameHits, ...hits.slice(0, athleteSlots)]);
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
        // ── Race edition (year query) ──────────────────────────────────────
        if (m.kind === 'race') {
          return (
            <div key={i} className="lp-search-dropdown-group">
              <div className="lp-search-dropdown-row" onClick={() => pick(m.href)}>
                <span className="lp-search-dropdown-count" style={{ color: 'var(--meta)' }}>→</span>
                <span className="lp-search-dropdown-name">{m.label} {m.year}</span>
                <span className="lp-search-dropdown-meta">{m.dist}</span>
              </div>
            </div>
          );
        }

        // ── Athlete / finisher ────────────────────────────────────────────
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

// ─── Athlete-name-only dropdown (compare tool) ────────────────────────────────

interface AthleteNameDropdownProps {
  query:    string;
  onSelect: (name: string) => void;
  onClose:  () => void;
}

export function AthleteNameDropdown({ query, onSelect, onClose }: AthleteNameDropdownProps) {
  const { matches, loading } = useInlineSearch(query);

  const athletes = matches.filter((m): m is FinisherMatch => m.kind === 'finisher');

  if (query.length < 2) return null;

  const pick = (name: string) => { onSelect(name); onClose(); };

  return (
    <div className="lp-search-dropdown">
      {loading && <div className="lp-search-dropdown-status">Searching…</div>}
      {!loading && athletes.map((m, i) => (
        <div key={i} className="lp-search-dropdown-group">
          <div className="lp-search-dropdown-row lp-search-dropdown-row--name" onClick={() => pick(m.name)}>
            <span className="lp-search-dropdown-name">{m.name}</span>
          </div>
        </div>
      ))}
      {!loading && athletes.length === 0 && (
        <div className="lp-search-dropdown-status">No results for "{query}"</div>
      )}
    </div>
  );
}
