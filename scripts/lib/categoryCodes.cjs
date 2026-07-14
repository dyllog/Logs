'use strict';
/**
 * Shared race-category decoder.
 * ─────────────────────────────────────────────────────────────────────────────
 * A single place for turning a timing-provider's raw category code into LOGS's
 * normalized "{M|W} {band}" string. Used by every race converter so no race can
 * silently corrupt its age bands the way Omaha (packed codes) and Onehunga 2025
 * (broad-range codes) did.
 *
 * CARDINAL RULE: never invent an age band for an input you don't understand.
 * Unrecognized codes fall back to "{g} Open" (honest absence) and are reported
 * via the `onUnknown` callback — they must NEVER map to a real band by default.
 * The old Omaha bug (unmatched → "M 70+") is exactly what this prevents.
 */

const EN = '–'; // en-dash, the band separator used throughout LOGS data

/**
 * Decode a packed timing-provider code: [M|F] + 2-digit low + 2-digit high.
 *   M3039 → "M 30–39"   F2029 → "W 20–29"   M0019 → "M 0–19"   M7099 → "M 70+"
 * Returns the normalized band string, or null if `raw` is not a packed code.
 */
function decodePackedCat(raw) {
  if (typeof raw !== 'string') return null;
  const m = raw.trim().match(/^([MF])(\d{2})(\d{2})$/);
  if (!m) return null;
  const g = m[1] === 'M' ? 'M' : 'W';
  const lo = parseInt(m[2], 10);
  const hi = parseInt(m[3], 10);
  if (m[3] === '99') return `${g} ${lo}+`;      // open-ended top band
  if (m[2] === '00') return `${g} 0${EN}${hi}`; // 0–19 style bottom band
  return `${g} ${lo}${EN}${hi}`;
}

/**
 * Full raw→normalized category mapper for race converters.
 *
 * @param {string} catRaw    the raw category code from the source file
 * @param {string} genderRaw the raw gender column value ("Male"/"Female"/"M"/"F"/…)
 * @param {(raw:string)=>void} [onUnknown] called with the raw code when it can't
 *        be decoded — importers should surface this rather than let data rot.
 * @returns {string} "{M|W} {band}" — never a fabricated band for unknown input.
 */
function mapRaceCategory(catRaw, genderRaw, onUnknown) {
  const rawTrim = (catRaw == null ? '' : String(catRaw)).trim();

  // Packed codes carry their own gender — trust the code and short-circuit.
  const packed = decodePackedCat(rawTrim);
  if (packed) return packed;

  // Resolve gender: explicit column first, then code prefix, else Male.
  const gr = (genderRaw == null ? '' : String(genderRaw)).trim().toUpperCase();
  let g = null;
  if (gr === 'F' || gr === 'FEMALE' || gr === 'W') g = 'W';
  else if (gr === 'M' || gr === 'MALE') g = 'M';
  if (!g && rawTrim) {
    const pfx = rawTrim[0].toUpperCase();
    g = (pfx === 'F' || pfx === 'W') ? 'W' : 'M';
  }
  if (!g) g = 'M';

  if (!rawTrim) return `${g} Open`; // honest absence, not a fabricated band

  // Strip a leading gender/other letter from the code portion.
  const code = rawTrim.toUpperCase().replace(/^[MFWX]/, '');

  if (/^(OPEN|SEN|SENIOR|VET|MAS|MASTER|MASTERS|VETERAN)$/.test(code)) return `${g} Open`;
  if (/^(JUN|JUNIOR|SUBJUN|SUB-JUN)$/.test(code)) return `${g} 18${EN}19`;

  // Explicit range: "10-39", "30–39", "20 - 24"
  let m = code.match(/^(\d{1,2})\s*[-–—]\s*(\d{1,2})$/);
  if (m) return `${g} ${parseInt(m[1], 10)}${EN}${parseInt(m[2], 10)}`;

  // Open-ended: "40+", "70 +"
  m = code.match(/^(\d{1,2})\s*\+$/);
  if (m) return `${g} ${parseInt(m[1], 10)}+`;

  // Bare low bound "35" → conventional 5/10-year band (legacy behaviour retained)
  m = code.match(/^(\d{2})$/);
  if (m) { const lo = parseInt(m[1], 10); return `${g} ${lo}${EN}${lo + 9}`; }

  // Unknown — DO NOT guess a band. Report it and fall back to Open.
  if (typeof onUnknown === 'function') onUnknown(rawTrim);
  return `${g} Open`;
}

module.exports = { decodePackedCat, mapRaceCategory, EN };
