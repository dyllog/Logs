/**
 * Athlete name normalisation helpers, shared by the conversion scripts and
 * scripts/buildAthleteCanon.mjs.
 *
 *  - normalizeName : display form (trimmed, single-spaced, Title Case)
 *  - nameKey       : collapse-for-matching key (lowercase, no punctuation/diacritics)
 *
 * Raw race data mixes Title Case (Auckland) and ALL CAPS (Christchurch), so a
 * stable display form and a stable match key must both be derived, not assumed.
 */

export function normalizeName(raw) {
  return (raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function nameKey(raw) {
  return (raw ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
