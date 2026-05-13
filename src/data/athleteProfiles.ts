const PROFILE_MAP: Record<string, string> = {
  'daniel balchin':      'daniel-balchin',
  'michael voss':        'michael-voss',
  'jonathan jackson':    'jonathan-jackson',
  'oska inkster baynes': 'oska-inkster-baynes',
  'christopher dryden':  'christopher-dryden',
  'aaron pulford':       'aaron-pulford',
  'daniel jones':        'daniel-jones',
  'hiro tanimoto':       'hiro-tanimoto',
  'hirotaka tanimoto':   'hiro-tanimoto',
  'ciaran faherty':      'ciaran-faherty',
  'cameron graves':      'cameron-graves',
  'cam graves':          'cameron-graves',
  'blair mcwhirter':     'blair-mcwhirter',
  'fabe downs':          'fabe-downs',
};

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’'`]/g, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getAthleteSlug(name: string): string | null {
  return PROFILE_MAP[normalise(name)] ?? null;
}
