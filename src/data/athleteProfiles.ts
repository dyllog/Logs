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
