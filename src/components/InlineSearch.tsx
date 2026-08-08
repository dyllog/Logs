import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchNames, loadHitResults, type NameHit, type SearchResult } from '@/lib/searchIndex';
import { racesForYear, RACE_DIRECTORY } from '@/data/raceDirectory';
import { useSharedNames } from '@/lib/sharedNames';

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

/**
 * Name matching reduces BOTH the query and the index key the same way, so
 * punctuation is never load-bearing: "Toomer-Reti" and "Toomer Reti" resolve to
 * each other, as do "O'Brien" and "OBrien". Matching a raw lower-cased query
 * against raw keys made the hyphen mandatory, which is a false negative aimed
 * at exactly the runner looking themselves up.
 */
function reduceName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’‘`]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function bestResultMeta(results: ResultEntry[]): string {
  if (!results.length) return '';
  const count = results.length;
  return count === 1 ? '1 result on record' : `${count} results on record`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FinisherMatch {
  kind:    'finisher';
  name:    string;
  meta:    string;
  slug:    string | null;
  count:   number;
  /** Identifies the person, so detail can be fetched when the row expands. */
  hit:     NameHit;
  /** Populated on expand — shards carry pointers, not result arrays. */
  results?: SearchResult[];
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

    // ── Name query: pointer records from the shared canon index ──────────
    const qName = reduceName(q);
    const found = await searchNames(q);

    const hits: FinisherMatch[] = found.map(h => ({
      kind: 'finisher' as const,
      name: h.name,
      meta: h.pointer.n === 1 ? '1 result on record' : `${h.pointer.n} results on record`,
      slug: h.slug,
      count: h.pointer.n,
      hit: h,
    }));

    hits.sort((a, b) => {
      const an = reduceName(a.name), bn = reduceName(b.name);
      if (an === qName && bn !== qName) return -1;
      if (bn === qName && an !== qName) return  1;
      if (a.name === b.name) return (b.slug ? 1 : 0) - (a.slug ? 1 : 0);
      if (b.count !== a.count) return b.count - a.count;
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
  // Shards carry pointers; a row's results are fetched the first time it opens.
  const [detail, setDetail] = useState<Record<string, SearchResult[]>>({});

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
              <span className="lp-search-dropdown-count">
                {m.count > 1 ? `${m.count}×` : '1×'}
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
                {(detail[`${m.hit.key}#${m.hit.idx}`] ?? []).map((res, j) => {
                  const href = raceHrefFor(res.r, res.y, res.p);
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

/**
 * Compare's athlete selector.
 *
 * Shared-name (knownMultiPerson) profiles are withheld from the pool. Compare
 * states career bests for whoever is selected, and on a cluster that may span
 * several runners that would assert an unattributed time as one person's PB —
 * the same reason the "Open in Compare" CTA was removed from flagged profiles.
 * The exclusion is announced rather than silent: dropping matches without
 * saying so is how a search comes to lie about what the archive holds.
 */
export function AthleteNameDropdown({ query, onSelect, onClose }: AthleteNameDropdownProps) {
  const { matches, loading } = useInlineSearch(query);
  const sharedNames = useSharedNames();

  const all = matches.filter((m): m is FinisherMatch => m.kind === 'finisher');
  const athletes = all.filter(m => !(m.slug && sharedNames.has(m.slug)));
  const withheld = all.length - athletes.length;

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
      {!loading && withheld > 0 && (
        <div className="lp-search-dropdown-status">
          {withheld} shared-name {withheld === 1 ? 'profile' : 'profiles'} not comparable — records under
          {withheld === 1 ? ' that name' : ' those names'} may span several runners.
        </div>
      )}
      {!loading && athletes.length === 0 && withheld === 0 && (
        <div className="lp-search-dropdown-status">No results for "{query}"</div>
      )}
    </div>
  );
}
