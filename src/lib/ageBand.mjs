// @ts-check
/**
 * ageBand.mjs — resolve a printed age band to a single year of age.
 *
 * Plain ESM so that both the app (athleteMetrics.ts) and the build-time
 * verification script consume exactly the same rules. Duplicating this logic
 * in a checker would let the checker drift away from the thing it checks.
 *
 * The WMA tables are keyed to single years; the archive mostly holds the band
 * printed in the source results. A band resolves to its MIDPOINT, which
 * distributes the error symmetrically (±2 on a five-year band). An earlier
 * implementation took the band's lower bound, which biased every estimate the
 * same way by up to four years — worst at older ages, where the curve is
 * steepest and the bias matters most.
 */

/** Matches "M 40–44", "W 18-34", "M 70+" — en dash, em dash or hyphen. */
const AGE_BAND = /^[MW]\s*(\d{1,2})\s*(?:[–—-]\s*(\d{1,2})|(\+))\s*$/;

/**
 * Open-ended bands ("M 70+") have no midpoint. The convention is lower bound
 * + 3, stated on the Methodology page so a reader can see what was assumed.
 */
export const OPEN_BAND_OFFSET = 3;

/**
 * An upper bound at or above this is a catch-all, not a real cohort.
 *
 * Several sources encode the open-ended top band as a closed range — "M 70–99",
 * "M 60–99". Read literally, the midpoint of M 70–99 is 85, which grades a
 * 70-year-old against an 85-year-old's standard and inflates the result by
 * tens of points. These are the same thing as "70+" and are treated that way.
 */
const CATCH_ALL_UPPER = 95;

/**
 * Widest closed band still resolved by midpoint.
 *
 * Wide legacy bands below 40 ("M 20–34", "M 18–39") are kept: the curve is
 * near-flat there, so the midpoint error is small. Anything wider than this is
 * source noise rather than a cohort.
 */
const MAX_BAND_WIDTH = 30;

/**
 * Age implied by a recorded band, or null when the band cannot support one.
 *
 * Returns null for inverted ("18–17"), zero-width ("29–29"), over-wide, and
 * non-numeric ("M Elite", "M 7099") bands. These are source defects, already
 * excluded from identity inference elsewhere; here they produce no grade at
 * all rather than a fabricated one.
 *
 * @param {string} cat
 * @returns {number | null}
 */
export function ageFromBand(cat) {
  const m = AGE_BAND.exec((cat ?? '').trim());
  if (!m) return null;

  const lo = Number(m[1]);
  if (!Number.isFinite(lo) || lo < 10 || lo > 99) return null;

  if (m[3]) return lo + OPEN_BAND_OFFSET;              // "M 70+"

  const hi = Number(m[2]);
  if (!Number.isFinite(hi) || hi <= lo) return null;
  if (hi >= CATCH_ALL_UPPER) return lo + OPEN_BAND_OFFSET;   // "M 70–99"
  if (hi - lo > MAX_BAND_WIDTH) return null;

  return Math.round((lo + hi) / 2);
}
