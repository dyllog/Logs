/**
 * The canon name index — one implementation, shared by every search surface.
 *
 * There were four copies of `loadShard` (homepage dropdown, search overlay,
 * /athletes, /athletes/letter/:letter), which is how the shards and their
 * consumers drift apart. They now all come through here.
 *
 * SHAPE. Shards hold POINTER records, not results:
 *   { "john smith": [ { n: 12, a: 2011, b: 2025, m?: 1 } ] }
 * Entries are keyed under both full name and surname, so carrying result
 * arrays stored them two to three times over and made one keystroke cost
 * megabytes. Detail is fetched only when a row is expanded:
 *   • has a profile  -> public/data/athletes/{xx}.json  (already complete)
 *   • has none       -> public/data/search-detail/{letter}.json
 * The second covers single-result athletes and the peeled half of a
 * disambiguated name — the only people with results but no profile page.
 *
 * The display name is not stored where it can be recovered by title-casing the
 * key, which is how the key was produced. That recovery is exact for ASCII but
 * not for accented names, so the 160 that fail it carry their display along —
 * checked against the whole archive rather than assumed.
 */

import { getAthleteSlug, preloadAthleteIndex } from '@/data/athleteProfiles';

export interface SearchResult { r: string; y: number; t: string; p: number; tot: number }

/** One person under a name. `n` results, spanning years `a`–`b`. */
export interface Pointer {
  n: number;
  a: number;
  b: number;
  /**
   * Display name, present ONLY where it cannot be recovered from the key.
   * JavaScript's word-boundary and word-character classes are ASCII-only, so
   * accented names re-case in the wrong places on recovery; those 160 names
   * carry their display explicitly rather than rendering mangled.
   */
  d?: string;
  /** Present only when this is a known shared-name cluster. */
  m?: 1;
}

export type SearchShard = Record<string, Pointer[]>;

export interface NameHit {
  /** Normalised index key. */
  key: string;
  /** Display name, recovered from the key. */
  name: string;
  /** Which person under this name (index into the key's pointer array). */
  idx: number;
  pointer: Pointer;
  /** Profile slug, or null where the athlete has no profile page. */
  slug: string | null;
}

/** Recover the stored display name: the key is its lower-cased form. */
export function displayFromKey(key: string): string {
  return key.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Reduce a name for comparison. Both the query AND the key go through this, so
 * punctuation is never load-bearing — "Toomer-Reti" and "Toomer Reti" match,
 * as do "O'Brien" and "OBrien".
 */
export function reduceName(s: string): string {
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

// ── Shard loading ────────────────────────────────────────────────────────────

const shardCache = new Map<string, SearchShard>();
const reducedCache = new Map<string, { key: string; reduced: string }[]>();

const letterOf = (s: string) => (s[0]?.match(/[a-z]/) ? s[0] : '_');

export async function loadSearchShard(letter: string): Promise<SearchShard> {
  if (shardCache.has(letter)) return shardCache.get(letter)!;
  try {
    const res = await fetch(`/data/search/${letter}.json`);
    if (!res.ok) return {};
    const data: SearchShard = await res.json();
    shardCache.set(letter, data);
    return data;
  } catch { return {}; }
}

/** Reduced keys for a shard, computed once rather than on every keystroke. */
function reducedKeys(letter: string, shard: SearchShard) {
  let rows = reducedCache.get(letter);
  if (!rows) {
    rows = Object.keys(shard).map(key => ({ key, reduced: reduceName(key) }));
    reducedCache.set(letter, rows);
  }
  return rows;
}

/**
 * Every person matching `query`, across the shard its first letter selects.
 * Because entries are keyed by surname too, that shard reaches full-name and
 * surname queries alike.
 */
export async function searchNames(query: string): Promise<NameHit[]> {
  const q = reduceName(query);
  if (q.length < 2) return [];

  const letter = letterOf(q);
  const shard = await loadSearchShard(letter);
  const matched = reducedKeys(letter, shard).filter(r => r.reduced.includes(q));

  // Resolve profile links for the matches before the synchronous lookups below.
  await Promise.all(matched.slice(0, 200).map(r => preloadAthleteIndex(displayFromKey(r.key))));

  const hits: NameHit[] = [];
  for (const { key } of matched) {
    const pointers = shard[key] ?? [];
    pointers.forEach((pointer, idx) => {
      // Prefer the stored display where recovery from the key would be lossy.
      const name = pointer.d ?? displayFromKey(key);
      // A name split across two people gives the profile to the first pointer
      // only; the second is the other runner, who has no page of their own.
      const slug = idx === 0 ? getAthleteSlug(name) : null;
      hits.push({ key, name, idx, pointer, slug });
    });
  }
  return hits;
}

// ── Detail on expand ─────────────────────────────────────────────────────────

const detailCache = new Map<string, Record<string, SearchResult[][]>>();
const profileCache = new Map<string, Record<string, { results?: unknown[] }>>();

function shardKey(slug: string): string {
  const s = slug.replace(/[^a-z0-9]/g, '');
  return (s.slice(0, 2) || '_').padEnd(2, '_');
}

async function loadDetailShard(letter: string) {
  if (detailCache.has(letter)) return detailCache.get(letter)!;
  try {
    const res = await fetch(`/data/search-detail/${letter}.json`);
    const data = res.ok ? await res.json() : {};
    detailCache.set(letter, data);
    return data;
  } catch { return {}; }
}

async function loadProfileShard(sk: string) {
  if (profileCache.has(sk)) return profileCache.get(sk)!;
  try {
    const res = await fetch(`/data/athletes/${sk}.json`);
    const data = res.ok ? await res.json() : {};
    profileCache.set(sk, data);
    return data;
  } catch { return {}; }
}

/**
 * The results behind a hit, fetched only when a row is actually expanded.
 * Athletes with a profile read from their profile shard — already built,
 * already complete. Everyone else reads from search-detail.
 */
export async function loadHitResults(hit: NameHit): Promise<SearchResult[]> {
  if (hit.slug) {
    const shard = await loadProfileShard(shardKey(hit.slug));
    const p = shard[hit.slug] as { results?: Array<{ race: string; year: number; time: string; pos: number; total: number }> } | undefined;
    if (p?.results?.length) {
      return p.results
        .map(r => ({ r: r.race, y: r.year, t: r.time, p: r.pos, tot: r.total }))
        .sort((a, b) => b.y - a.y);
    }
  }
  // Detail is sharded by the name's OWN first letter, which is the index key's
  // first letter — not the letter of whatever query happened to find it.
  const bucket = await loadDetailShard(letterOf(hit.key));
  return bucket[hit.key]?.[hit.idx] ?? [];
}
