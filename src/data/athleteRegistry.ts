// Legacy slug pin list — NOT an athlete database.
//
// This file exists for one purpose: keeping the 25 slugs minted before the
// canon existed pointing at the same people. It holds names, slugs and alias
// spellings, and nothing else.
//
// It used to carry pbTime, pbRace, racesLogged, nationality and gender, and
// those fields went stale — 21 of 25 race counts were wrong (daniel-jones 9 vs
// 28, kylie-brown 4 vs 15). While they existed, things read them as if this
// were a live athlete source: /athletes rendered its whole table and search
// from these 25 entries, telling real archived runners they were not in the
// archive. Stripping the fields is the structural fix. A file that contains
// only slugs cannot be mistaken for an athlete database.
//
// Athlete data comes from the canon: public/data/athletes/*.json, built by
// scripts/buildAthleteCanon.mjs (199,294 athletes, 74,116 with profile pages).
//
// Read by exactly two things, both of which need only these fields:
//   scripts/buildAthleteCanon.mjs   pins these slugs + aliases across rebuilds
//   scripts/verifySlugContinuity.mjs verifies each still resolves to the same person

export interface AthleteEntry {
  name: string;
  slug: string;
  /** Alternative name spellings found in race data. */
  aliases?: string[];
  /**
   * A performance this athlete is known to have run, in seconds — their fastest
   * road result at the time of writing.
   *
   * This is a VERIFICATION ANCHOR, not profile data, and nothing renders it.
   * verifySlugContinuity checks the anchor still appears somewhere in the
   * athlete's canon history: a name match alone cannot tell two people who
   * share a name apart, and with 1,624 shared-name clusters in the archive that
   * is the most likely way a legacy slug silently drifts to a different runner.
   */
  pbAnchor?: number;
}

export const ATHLETE_REGISTRY: AthleteEntry[] = [
  { name: 'Michael Voss',        slug: 'michael-voss', pbAnchor: 3870 },
  { name: 'Daniel Balchin',      slug: 'daniel-balchin', pbAnchor: 3916 },
  { name: 'Cameron Graves',      slug: 'cameron-graves'     , aliases: ['Cam Graves'], pbAnchor: 3857 },
  { name: 'Oska Inkster-Baynes', slug: 'oska-inkster-baynes', aliases: ['Oska Baynes'], pbAnchor: 3899 },
  { name: 'Christopher Dryden',  slug: 'christopher-dryden', pbAnchor: 3851 },
  { name: 'Jonathan Jackson',    slug: 'jonathan-jackson'   , aliases: ['Jono Jackson'], pbAnchor: 4042 },
  { name: 'Blair McWhirter',     slug: 'blair-mcwhirter', pbAnchor: 4130 },
  { name: 'Aaron Pulford',       slug: 'aaron-pulford', pbAnchor: 3971 },
  { name: 'Daniel Jones',        slug: 'daniel-jones', pbAnchor: 4031 },
  { name: 'Ciaran Faherty',      slug: 'ciaran-faherty', pbAnchor: 4187 },
  { name: 'Hiro Tanimoto',       slug: 'hiro-tanimoto'      , aliases: ['Hirotaka Tanimoto'], pbAnchor: 4099 },
  { name: 'Fabe Downs',          slug: 'fabe-downs'         , aliases: ['Fabian Downs'], pbAnchor: 4147 },
  { name: 'Cullern Thorby',      slug: 'cullern-thorby', pbAnchor: 3982 },
  { name: 'Casey Thorby',        slug: 'casey-thorby', pbAnchor: 4032 },
  { name: 'Jack Moody',          slug: 'jack-moody', pbAnchor: 3986 },
  { name: 'Brent Godfrey',       slug: 'brent-godfrey', pbAnchor: 4475 },
  { name: 'Ben Twyman',          slug: 'ben-twyman', pbAnchor: 4296 },
  { name: 'Dougal Thorburn',     slug: 'dougal-thorburn', pbAnchor: 3976 },
  { name: 'Orestas Rimkus',      slug: 'orestas-rimkus', pbAnchor: 4593 },
  { name: 'Brett Tingay',        slug: 'brett-tingay', pbAnchor: 4112 },
  { name: 'Mike Phillips',       slug: 'mike-phillips', pbAnchor: 4186 },
  { name: 'Amelia Lythe',        slug: 'amelia-lythe', pbAnchor: 4800 },
  { name: 'Kylie Brown',         slug: 'kylie-brown', pbAnchor: 2459 },
  { name: 'Scott Knowles',       slug: 'scott-knowles', pbAnchor: 4098 },
  { name: 'Dylan Logan',         slug: 'dylan-logan', pbAnchor: 2085 },
];

/** Slug map including aliases. Callers must treat the canon as authoritative
 *  for real names — see the precedence note in athleteProfiles.ts. */
export function buildSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const a of ATHLETE_REGISTRY) {
    map[a.name.toLowerCase()] = a.slug;
    for (const alias of a.aliases ?? []) map[alias.toLowerCase()] = a.slug;
  }
  return map;
}
