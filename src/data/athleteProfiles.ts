import { buildSlugMap } from './athleteRegistry';

/**
 * Results that appear in the search index under a profiled athlete's name but
 * belong to a *different* person who happens to share that name.
 *
 * When this map contains an entry for a display name, the search UI will show
 * two separate rows:
 *   1. The profiled athlete (with PROFILE pill) — all results EXCEPT these
 *   2. An expandable "other person" entry — just these results
 *
 * Add an entry here whenever you confirm a result doesn't belong to the
 * athlete whose profile owns that name.
 *
 * Keys must match the display name exactly as stored in the search index
 * (Title Case, as produced by build-search-index.mjs).
 * Values use the exact race label from RACE_LABELS in that same script.
 */
export const NAME_DISAMBIGUATION: Record<string, Array<{ r: string; y: number }>> = {
  'Kylie Brown': [
    { r: 'Queenstown Half',  y: 2016 },
    { r: 'Christchurch Half', y: 2017 },
    { r: 'Queenstown Half',  y: 2017 },
  ],
};

const EXTRA_ALIASES: Record<string, string> = {
  'oska inkster baynes': 'oska-inkster-baynes',
  'oska baynes':         'oska-inkster-baynes',
  'hirotaka tanimoto':   'hiro-tanimoto',
  'jono jackson':        'jonathan-jackson',
  'cam graves':          'cameron-graves',
};

const BASE_MAP = buildSlugMap();

const PROFILE_MAP: Record<string, string> = { ...BASE_MAP, ...EXTRA_ALIASES };

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
          if (!(k in PROFILE_MAP)) PROFILE_MAP[k] = slug;
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
