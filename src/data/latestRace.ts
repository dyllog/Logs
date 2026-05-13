// Update this object when a new race edition is published.
export const LATEST_RACE = {
  name: 'Christchurch Marathon',
  year: 2026,
  raceId: 'chc' as const,
  dist: '42.2 km' as const,
  href: '/races/christchurch-marathon',
} satisfies {
  name: string;
  year: number;
  raceId: 'auckland' | 'chc' | 'chc-half' | 'hb' | 'hb-half' | 'rot' | 'rot-half' | 'qt' | 'qt-half';
  dist: '42.2 km' | '21.1 km';
  href: string;
};
