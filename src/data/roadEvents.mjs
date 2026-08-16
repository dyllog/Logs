/**
 * Road event registration — the one place a road race is declared.
 *
 * WHY THIS EXISTS. This map used to be copied into five pipeline scripts
 * (buildAthleteCanon, build-search-index, flagInconsistentClusters,
 * emitClusterWorksheets, spotCheckAthleteCanon). Registering one family meant
 * five hand edits, and missing one did not error — the consumer just fell back
 * to a default and produced wrong output. It had already happened: Onehunga
 * and Orewa were absent from build-search-index, so four sub-events rendered
 * in search as the raw file key ("onehunga-half") rather than their label
 * ("Onehunga Half"), for as long as those races have been in the archive.
 *
 * That is the archive's recurring failure shape, and the fixes that hold are
 * the ones that make the staleness impossible rather than merely warned about.
 * Every consumer now derives its own shape from this object.
 *
 * This is a .mjs so the generate pipeline and the Vite app can share it
 * without a build step, exactly as ./trailEvents.mjs does for trail.
 *
 * ADDING A FAMILY: add its entries here and nothing else in the pipeline.
 *   key      the results filename minus "results-" and "-YYYY.json"
 *   label    display name, shown in search results and worksheets
 *   raceSlug the race page slug; sub-events of one race share it
 *   dist     human distance string
 *   distId   PB bucket — 'mar' | 'half' | '10k' | '5k'. Results only compare
 *            against the same distId, so this must be the REAL distance.
 */

/** @typedef {{ label: string, raceSlug: string, dist: string, distId: string }} RoadEvent */

/** @type {Record<string, RoadEvent>} */
export const ROAD_EVENTS = {
  "":                 { label: "Auckland Marathon",      raceSlug: "auckland-marathon",                 dist: "42.2 km",  distId: "mar" },
  "half":             { label: "Auckland Half",          raceSlug: "auckland-marathon",                 dist: "21.1 km",  distId: "half" },

  "rot":              { label: "Rotorua Marathon",       raceSlug: "rotorua-marathon",                  dist: "42.2 km",  distId: "mar" },
  "rot-half":         { label: "Rotorua Half",           raceSlug: "rotorua-marathon",                  dist: "21.1 km",  distId: "half" },

  "chc":              { label: "Christchurch Marathon",  raceSlug: "christchurch-marathon",             dist: "42.2 km",  distId: "mar" },
  "chc-half":         { label: "Christchurch Half",      raceSlug: "christchurch-marathon",             dist: "21.1 km",  distId: "half" },

  "qt":               { label: "Queenstown Marathon",    raceSlug: "queenstown-marathon",               dist: "42.2 km",  distId: "mar" },
  "qt-half":          { label: "Queenstown Half",        raceSlug: "queenstown-marathon",               dist: "21.1 km",  distId: "half" },

  "hb":               { label: "Hawke's Bay Marathon",   raceSlug: "hawkes-bay-marathon",               dist: "42.2 km",  distId: "mar" },
  "hb-half":          { label: "Hawke's Bay Half",       raceSlug: "hawkes-bay-marathon",               dist: "21.1 km",  distId: "half" },

  "wf-half":          { label: "Waterfront Half",        raceSlug: "waterfront-half-marathon",          dist: "21.1 km",  distId: "half" },
  "wf-10k":           { label: "Waterfront 10k",         raceSlug: "waterfront-half-marathon",          dist: "10 km",    distId: "10k" },

  "dev-half":         { label: "Devonport Half",         raceSlug: "devonport-half-marathon",           dist: "21.1 km",  distId: "half" },
  "dev-10k":          { label: "Devonport 10k",          raceSlug: "devonport-half-marathon",           dist: "10 km",    distId: "10k" },

  "coast-half":       { label: "Coatesville Half",       raceSlug: "coatesville-half-marathon",         dist: "21.1 km",  distId: "half" },

  "omaha-half":       { label: "Omaha Half",             raceSlug: "omaha-half-marathon",               dist: "21.1 km",  distId: "half" },
  "omaha-10k":        { label: "Omaha 10k",              raceSlug: "omaha-half-marathon",               dist: "10 km",    distId: "10k" },

  "maraetai-half":    { label: "Maraetai Half",          raceSlug: "maraetai-half-marathon",            dist: "21.1 km",  distId: "half" },
  "maraetai-10k":     { label: "Maraetai 10k",           raceSlug: "maraetai-half-marathon",            dist: "10 km",    distId: "10k" },

  "kerikeri-half":    { label: "Kerikeri Half",          raceSlug: "kerikeri-half-marathon",            dist: "21.1 km",  distId: "half" },

  "wellington-mar":   { label: "Wellington Marathon",    raceSlug: "wellington-marathon",               dist: "42.2 km",  distId: "mar" },
  "wellington-half":  { label: "Wellington Half",        raceSlug: "wellington-marathon",               dist: "21.1 km",  distId: "half" },

  "onehunga-half":    { label: "Onehunga Half",          raceSlug: "onehunga-half-marathon",            dist: "21.1 km",  distId: "half" },
  "onehunga-10k":     { label: "Onehunga 10k",           raceSlug: "onehunga-half-marathon",            dist: "10 km",    distId: "10k" },

  "orewa-half":       { label: "Orewa Half",             raceSlug: "orewa-half-marathon",               dist: "21.1 km",  distId: "half" },
  "orewa-10k":        { label: "Orewa 10k",              raceSlug: "orewa-half-marathon",               dist: "10 km",    distId: "10k" },

  "tamaki-half":      { label: "Tamaki River Half",      raceSlug: "tamaki-river-half-marathon",        dist: "21.1 km",  distId: "half" },
  "tamaki-10k":       { label: "Tamaki River 10k",       raceSlug: "tamaki-river-half-marathon",        dist: "10 km",    distId: "10k" },

  "mtm-half":         { label: "Mt Maunganui Half",      raceSlug: "mount-maunganui-half-marathon",     dist: "21.1 km",  distId: "half" },
  "mtm-10k":          { label: "Mt Maunganui 10k",       raceSlug: "mount-maunganui-half-marathon",     dist: "10 km",    distId: "10k" },
  "mtm-5k":           { label: "Mt Maunganui 5k",        raceSlug: "mount-maunganui-half-marathon",     dist: "5 km",     distId: "5k" },

  "whanganui-mar":    { label: "Whanganui Marathon",     raceSlug: "whanganui-three-bridges-marathon",  dist: "42.2 km",  distId: "mar" },
  "whanganui-half":   { label: "Whanganui Half",         raceSlug: "whanganui-three-bridges-marathon",  dist: "21.1 km",  distId: "half" },
  // The quarter marathon: one lap of the four-lap marathon course, so 10.55 km
  // by construction. Published as "105K" in 2018/20/23-25 and loosely as "10K"
  // in 2017/19/22 — one event, two labels. distId is 'quarter' so it never
  // becomes a 10 km PB. Full reasoning in ROAD_FAMILIES, scripts/roadToJson.mjs.
  "whanganui-quarter":{ label: "Whanganui Quarter",      raceSlug: "whanganui-three-bridges-marathon",  dist: "10.5 km",  distId: "quarter" },
  "whanganui-5k":     { label: "Whanganui 5k",           raceSlug: "whanganui-three-bridges-marathon",  dist: "5 km",     distId: "5k" },

  // Saint Clair ranks on NET time, unlike the rest of the road archive, which
  // is on gun — the organiser's published positions follow the net column with
  // zero inversions. See ROAD_FAMILIES in scripts/roadToJson.mjs.
  "saintclair-half":  { label: "Saint Clair Half",       raceSlug: "saint-clair-vineyard-half-marathon", dist: "21.1 km", distId: "half" },
  "saintclair-12k":   { label: "Saint Clair 12k",        raceSlug: "saint-clair-vineyard-half-marathon", dist: "12 km",   distId: "12k" },

  // The 2023 and 2025 halves are absent, not omitted: the organiser shipped
  // those years' "Half Results" files byte-identical to the marathon ones.
  "taupo-mar":        { label: "Taupō Marathon",         raceSlug: "taupo-marathon",                    dist: "42.2 km", distId: "mar" },
  "taupo-half":       { label: "Taupō Half",             raceSlug: "taupo-marathon",                    dist: "21.1 km", distId: "half" },
  "taupo-10k":        { label: "Taupō 10k",              raceSlug: "taupo-marathon",                    dist: "10 km",   distId: "10k" },
  "taupo-5k":         { label: "Taupō 5k",               raceSlug: "taupo-marathon",                    dist: "5 km",    distId: "5k" },

  // Half only. Every "10K Results" file Huntly ships is byte-identical to that
  // year's half file and its own Course column says "Half marathon" — there is
  // no 10 km event to register.
  "huntly-half":      { label: "Huntly Half",            raceSlug: "huntly-half-marathon",              dist: "21.1 km", distId: "half" },
};

/**
 * The `?race=` URL parameter, where it differs from the file key.
 *
 * Auckland and Rotorua predate the file-key convention and their race pages
 * still select a distance by these older names. Everything else uses its key
 * unchanged, so only the exceptions are listed.
 */
const RACE_PARAM_OVERRIDE = {
  '':         'auckland-full',
  'half':     'auckland-half',
  'rot':      'rotorua',
  'rot-half': 'rotorua-half',
};

/** Canon shape: key → { label, raceSlug, dist, distId }. */
export function roadFileMeta() {
  return ROAD_EVENTS;
}

/**
 * Label → everything needed to link a search result at its race page.
 *
 * The three search surfaces (InlineSearch, SearchOverlay, /athletes) each had
 * their own copy of this map plus their own if-chain of race-name substrings
 * for the page path. The copies had already diverged: SearchOverlay was missing
 * Wellington and Tamaki, and mapped two raw file keys to themselves. Deriving
 * both from ROAD_EVENTS means a newly registered family is linkable everywhere
 * at once, or nowhere — never in one surface but not the others.
 */
export function roadLinkByLabel() {
  /** @type {Record<string, { slug: string, param: string }>} */
  const out = {};
  for (const [key, v] of Object.entries(ROAD_EVENTS)) {
    out[v.label] = { slug: v.raceSlug, param: RACE_PARAM_OVERRIDE[key] ?? key };
  }
  return out;
}

/** Search-index shape: key → label. */
export function roadRaceLabels() {
  return Object.fromEntries(Object.entries(ROAD_EVENTS).map(([k, v]) => [k, v.label]));
}

/** Cluster-flagging shape: key → "raceSlug:distId". */
export function roadSlugDist() {
  return Object.fromEntries(Object.entries(ROAD_EVENTS).map(([k, v]) => [k, `${v.raceSlug}:${v.distId}`]));
}

/** Worksheet / spot-check shape: key → { label, raceSlug, distId }. */
export function roadWorksheetMeta() {
  return Object.fromEntries(
    Object.entries(ROAD_EVENTS).map(([k, v]) => [k, { label: v.label, raceSlug: v.raceSlug, distId: v.distId }]),
  );
}
