/**
 * Linking a search result to its race page — one implementation.
 *
 * There were three copies of this logic (InlineSearch, SearchOverlay, and the
 * /athletes A–Z page), each pairing a hand-written label→`?race=` map with a
 * hand-written if-chain of race-name substrings for the page path. They had
 * already diverged:
 *
 *   • SearchOverlay was missing Wellington and Tamaki River entirely, and
 *     mapped two raw file keys ('wellington-half', 'wellington-mar') to
 *     themselves rather than mapping their labels.
 *   • None of the three knew about Onehunga, Orewa or Mt Maunganui, so those
 *     results have never been clickable in any search surface despite having
 *     race pages.
 *
 * Both halves now derive from ROAD_EVENTS, so a newly registered family is
 * linkable in every surface at once, or in none — never in one but not another.
 */

import { roadLinkByLabel } from '@/data/roadEvents.mjs';
import { getRaceMeta } from '@/data/raceMeta';

const LINKS: Record<string, { slug: string; param: string }> = roadLinkByLabel();

/**
 * Path to the race page for a result, or null when it should not be a link.
 *
 * Null covers two cases that must not be confused with each other: a race this
 * build has no registration for, and a registered race that has no profile
 * page yet. The second is checked against RACE_META rather than a list kept
 * here, so a family becomes clickable the moment its page is authored and
 * cannot link to a 404 before then.
 */
export function raceHrefFor(raceLabel: string, year: number, pos: number): string | null {
  const link = LINKS[raceLabel];
  if (!link) return null;
  if (!getRaceMeta(link.slug)) return null;
  const params = new URLSearchParams({ year: String(year), pos: String(pos) });
  if (link.param) params.set('race', link.param);
  return `/races/${link.slug}?${params}`;
}
