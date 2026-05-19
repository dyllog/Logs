import { buildSlugMap } from './athleteRegistry';

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
