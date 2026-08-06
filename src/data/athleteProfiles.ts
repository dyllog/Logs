
// Re-exported from the shared module so the generate pipeline and the app
// cannot disagree about who is disambiguated. The split itself is applied
// when the search index is built — see build-search-index.mjs.
export { NAME_DISAMBIGUATION } from './nameDisambiguation.mjs';

/**
 * Curated aliases: nicknames and variant spellings the canon cannot hold,
 * because it is keyed by the exact normalised name as each result recorded it.
 * These are a deliberate human mapping, so they are the one thing the canon
 * does NOT overwrite — see CURATED_KEYS below.
 */
const EXTRA_ALIASES: Record<string, string> = {
  'oska inkster baynes': 'oska-inkster-baynes',
  'oska baynes':         'oska-inkster-baynes',
  'hirotaka tanimoto':   'hiro-tanimoto',
  'jono jackson':        'jonathan-jackson',
  'cam graves':          'cameron-graves',
};

/**
 * THE CANON IS AUTHORITATIVE for real names.
 *
 * This map used to be seeded from ATHLETE_REGISTRY — 25 Phase 0 entries — and
 * `preloadAthleteIndex` then filled only keys that did not already exist, so
 * the fossil silently won every collision. That was harmless only because
 * buildAthleteCanon.mjs happens to pin the same slugs: incidental agreement
 * between two sources, not an enforced invariant, and a bug waiting for the day
 * they diverged. The registry seed is gone; every real name now resolves from
 * the canon index, and only the curated aliases above survive it.
 *
 * Safe because all seven `getAthleteSlug` call sites `preloadAthleteIndex`
 * first — the map is populated before any synchronous lookup depends on it.
 */
const CURATED_KEYS = new Set(Object.keys(EXTRA_ALIASES));

const PROFILE_MAP: Record<string, string> = { ...EXTRA_ALIASES };

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[̀-ͯ]/g, '')
    .replace(/['''`]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getAthleteSlug(name: string): string | null {
  return PROFILE_MAP[normalise(name)] ?? null;
}

/**
 * Canon-backed slug resolution for the ~70k multi-race athletes.
 *
 * `getAthleteSlug` stays synchronous (its 5 consumers depend on that) and only
 * knows the 25 hand-registered profiles. To make every multi-race athlete
 * linkable, surfaces first `await preloadAthleteIndex(letter)` for the letters
 * they're about to render; that fetches `/data/athlete-index/{letter}.json`
 * (a normalised-name → slug map) once and folds it into PROFILE_MAP, so the
 * subsequent synchronous `getAthleteSlug` calls resolve without changing their
 * signature.
 */
const loadedLetters = new Map<string, Promise<void>>();

function indexLetter(name: string): string {
  const n = normalise(name);
  const c = n[0];
  return c && c >= 'a' && c <= 'z' ? c : '_';
}

export function preloadAthleteIndex(name: string): Promise<void> {
  const letter = indexLetter(name);
  let p = loadedLetters.get(letter);
  if (!p) {
    p = fetch(`/data/athlete-index/${letter}.json`)
      .then(r => (r.ok ? r.json() : {}))
      .then((map: Record<string, string>) => {
        for (const [k, slug] of Object.entries(map)) {
          // Canon wins over anything already present, except a curated alias.
          if (!CURATED_KEYS.has(k)) PROFILE_MAP[k] = slug;
        }
      })
      .catch(() => { /* leave letter unresolved on failure */ });
    loadedLetters.set(letter, p);
  }
  return p;
}

/** Await the index shard for `name`, then resolve synchronously. */
export async function resolveAthleteSlug(name: string): Promise<string | null> {
  await preloadAthleteIndex(name);
  return getAthleteSlug(name);
}
