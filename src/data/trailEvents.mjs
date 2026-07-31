// @ts-check
/**
 * trailEvents.mjs — authored trail event-family configs.
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for the trail data model:
 *   Event Family → Sub-Event → Edition → Course Instance
 *
 * Consumed by BOTH sides of the build:
 *   • the app, via src/data/trailEventConfig.ts (types + helpers)
 *   • the pipeline, via direct import from scripts/*.mjs
 *     (trailToJson.mjs, buildAthleteCanon.mjs, build-search-index.mjs)
 *
 * Why this shape exists (see LOGS-trail-data-model-handoff.md): road's
 * race × fixed distance × year model breaks on trail. Sub-event identity is
 * EDITORIAL, not derivable from labels — WUU2K's 43K and 45K are the same
 * event; Tarawera's 85K and 100K (same year) are different events. Only this
 * curated mapping can say which.
 *
 * Rules the config encodes:
 *   • Sub-event `id` is the stable spine: era-independent, never changes.
 *     RecordIds use it in the distId slot, so records survive rebrands.
 *   • A course instance belongs to exactly ONE sub-event — a curated call.
 *   • `label` is what the course was called that year, VERBATIM from the
 *     results-file name — the converter derives the source CSV path from it:
 *       Race Files/{sourceDir}/{year}/{label} Results - {year}.csv
 *   • `distanceKm` is the REAL measured distance that year, never normalised.
 *   • Editions exist even when cancelled (status: 'cancelled') so the year
 *     strip renders an honest gap instead of silently skipping.
 *   • Contingency courses carry `contingency: true` + a courseNote and are
 *     excluded from course-era records; the UI must never present them as a
 *     normal year.
 *
 * CURATION MARKERS — anything Dylan still needs to confirm is tagged with a
 * `CURATION:` comment at the exact line it affects. Nothing tagged is final.
 */

/** @typedef {import('./trailEventConfig').TrailEventFamily} TrailEventFamily */

/** @type {TrailEventFamily[]} */
export const TRAIL_EVENT_FAMILIES = [
  {
    familySlug: 'tarawera-ultra',
    name: 'Tarawera Ultramarathon',
    shortName: 'Tarawera',          // prefixes sub-event labels in canon/search: "Tarawera T102"
    location: 'Rotorua',
    surface: 'Trail',
    seasonMonth: 2,                 // February race weekend (early editions ran March/April)
    // CURATION: established 2009 per public record; archive coverage starts 2012.
    established: 2009,
    nextEdition: 'February 2027',
    entryUrl: 'https://www.taraweraultra.co.nz/',
    entryText: 'taraweraultra.co.nz',
    blurb: 'New Zealand’s flagship trail ultra through the lakes and forests of Rotorua.',
    sourceDir: 'Tarawera Ultra',
    mapX: 108, mapY: 96,            // just east of Rotorua on the Races map

    // Authored order = display order for the sub-event switcher:
    // current sub-events by distance descending, then retired, then one-offs.
    subEvents: [
      {
        id: 'miler',
        displayName: 'Miler',
        aliases: ['TMiler', 'TUM Miler', 'Tarawera 160K', 'Tarawera 100M'],
        // CURATION: miler distance — filenames give 100M (2018) and 160K
        // (2019–20); Miler-branded years are drafted at 161 km (100 mi).
        // Confirm the current course's published distance.
      },
      {
        id: 't102',
        displayName: 'T102',
        aliases: ['TUM 102', 'Tarawera 102K', 'Tarawera 100K'],
        // CURATION: comparability band draft — 100K-era and 102K-era courses
        // chart together with course-change markers.
        comparabilityBand: '100k-class',
      },
      {
        id: 't50',
        displayName: 'T50',
        aliases: ['TUM 50', 'Tarawera 50K'],
        // CURATION: does the pre-2018 60K/62K lineage continue as T50, or did
        // it retire when the 2019 restructure introduced the 50K? Drafted here
        // as SEPARATE sub-events (t60 retired below) sharing a comparability
        // band so they can chart together with markers if confirmed related.
        comparabilityBand: '50-60k-class',
      },
      {
        id: 't21',
        displayName: 'T21',
        aliases: ['TUM 21', 'Tarawera 21K', 'Tarawera 20K'],
      },
      {
        id: 't16',
        displayName: 'T16',
        aliases: [],
      },
      {
        id: 't85',
        displayName: '85K',
        aliases: ['Tarawera 85K', 'Tarawera 87K'],
        // CURATION: retired lineage — 85K (2012–17) drifted to 87K (2018),
        // then vanished in the 2019 restructure. displayName uses the name it
        // held longest; confirm or switch to final-era '87K'.
        retired: true,
      },
      {
        id: 't60',
        displayName: '60K',
        aliases: ['Tarawera 60K', 'Tarawera 62K'],
        retired: true,              // see t50 CURATION note — lineage question
        comparabilityBand: '50-60k-class',
      },
      {
        id: 'cyclone-65k',
        displayName: '65K',
        aliases: ['Tarawera 65K'],
        // CURATION: 2014 cyclone-year contingency courses. Drafted as one-off
        // sub-events so no normal lineage silently claims them. Dylan decides:
        // keep as one-offs, or attach 65K→t85/t102 and 55K→t60 lineages.
        oneOff: true,
      },
      {
        id: 'cyclone-55k',
        displayName: '55K',
        aliases: ['Tarawera 55K'],
        oneOff: true,               // see cyclone-65k CURATION note
      },
    ],

    editions: [
      {
        year: 2012, status: 'held',
        courses: [
          { subEventId: 't102', distanceKm: 100, label: 'Tarawera 100K' },
          { subEventId: 't85',  distanceKm: 85,  label: 'Tarawera 85K'  },
          { subEventId: 't60',  distanceKm: 60,  label: 'Tarawera 60K'  },
        ],
      },
      {
        year: 2013, status: 'held',
        // CURATION: handoff lists "2013 fire course" as a contingency year —
        // drafted with all three courses flagged. Confirm which courses were
        // actually rerouted and the note wording.
        note: 'Fire-danger course revisions',
        courses: [
          { subEventId: 't102', distanceKm: 100, label: 'Tarawera 100K', contingency: true, courseNote: 'fire-danger contingency route' },
          { subEventId: 't85',  distanceKm: 85,  label: 'Tarawera 85K',  contingency: true, courseNote: 'fire-danger contingency route' },
          { subEventId: 't60',  distanceKm: 60,  label: 'Tarawera 60K',  contingency: true, courseNote: 'fire-danger contingency route' },
        ],
      },
      {
        year: 2014, status: 'held',
        note: 'Cyclone year — normal courses replaced by contingency 55K / 65K',
        courses: [
          { subEventId: 'cyclone-65k', distanceKm: 65, label: 'Tarawera 65K', contingency: true, courseNote: 'cyclone contingency course' },
          { subEventId: 'cyclone-55k', distanceKm: 55, label: 'Tarawera 55K', contingency: true, courseNote: 'cyclone contingency course' },
        ],
      },
      {
        year: 2015, status: 'held',
        courses: [
          { subEventId: 't102', distanceKm: 100, label: 'Tarawera 100K' },
          { subEventId: 't85',  distanceKm: 85,  label: 'Tarawera 85K'  },
          { subEventId: 't60',  distanceKm: 60,  label: 'Tarawera 60K'  },
        ],
      },
      {
        year: 2016, status: 'held',
        courses: [
          { subEventId: 't102', distanceKm: 100, label: 'Tarawera 100K' },
          { subEventId: 't85',  distanceKm: 85,  label: 'Tarawera 85K'  },
          { subEventId: 't60',  distanceKm: 60,  label: 'Tarawera 60K'  },
        ],
      },
      {
        year: 2017, status: 'held',
        courses: [
          { subEventId: 't102', distanceKm: 100, label: 'Tarawera 100K' },
          { subEventId: 't85',  distanceKm: 85,  label: 'Tarawera 85K'  },
          { subEventId: 't60',  distanceKm: 60,  label: 'Tarawera 60K'  },
        ],
      },
      {
        year: 2018, status: 'held',
        note: 'Miler inaugural; distances remeasured (102K / 87K / 62K)',
        courses: [
          { subEventId: 'miler', distanceKm: 161, label: 'Tarawera 100M', courseNote: 'inaugural miler' },
          { subEventId: 't102',  distanceKm: 102, label: 'Tarawera 102K' },
          { subEventId: 't85',   distanceKm: 87,  label: 'Tarawera 87K'  },
          { subEventId: 't60',   distanceKm: 62,  label: 'Tarawera 62K'  },
        ],
      },
      {
        year: 2019, status: 'held',
        note: 'Distance restructure — 50K and 20K introduced; 87K and 62K discontinued',
        courses: [
          { subEventId: 'miler', distanceKm: 160, label: 'Tarawera 160K' },
          { subEventId: 't102',  distanceKm: 102, label: 'Tarawera 102K' },
          { subEventId: 't50',   distanceKm: 50,  label: 'Tarawera 50K'  },
          { subEventId: 't21',   distanceKm: 20,  label: 'Tarawera 20K'  },
        ],
      },
      {
        year: 2020, status: 'held',
        courses: [
          { subEventId: 'miler', distanceKm: 160, label: 'Tarawera 160K' },
          { subEventId: 't102',  distanceKm: 102, label: 'Tarawera 102K' },
          { subEventId: 't50',   distanceKm: 50,  label: 'Tarawera 50K'  },
          { subEventId: 't21',   distanceKm: 21,  label: 'Tarawera 21K', courseNote: 'course extended from 20 km' },
        ],
      },
      {
        // CURATION: 2021 ran during the COVID border closure — drafted as
        // 'restricted' (NZ-based field). Confirm status + note wording.
        year: 2021, status: 'restricted',
        note: 'COVID border closure — NZ-based field',
        courses: [
          { subEventId: 'miler', distanceKm: 161, label: 'TUM Miler' },
          { subEventId: 't102',  distanceKm: 102, label: 'TUM 102'   },
          { subEventId: 't50',   distanceKm: 50,  label: 'TUM 50'    },
          { subEventId: 't21',   distanceKm: 21,  label: 'TUM 21'    },
        ],
      },
      {
        year: 2022, status: 'cancelled',
        // CURATION: confirm cancellation note wording.
        note: 'Cancelled — COVID restrictions',
        courses: [],
      },
      {
        year: 2023, status: 'held',
        courses: [
          { subEventId: 'miler', distanceKm: 161, label: 'TUM Miler' },
          // CURATION: 2023 landslip reroute (handoff's example chip) drafted on
          // the 102 only — confirm whether other courses were also rerouted.
          { subEventId: 't102',  distanceKm: 102, label: 'TUM 102', contingency: true, courseNote: 'landslip contingency course' },
          { subEventId: 't50',   distanceKm: 50,  label: 'TUM 50'    },
          { subEventId: 't21',   distanceKm: 21,  label: 'TUM 21'    },
        ],
      },
      {
        year: 2024, status: 'held',
        courses: [
          { subEventId: 'miler', distanceKm: 161, label: 'TMiler' },
          { subEventId: 't102',  distanceKm: 102, label: 'T102'   },
          { subEventId: 't50',   distanceKm: 50,  label: 'T50'    },
          { subEventId: 't21',   distanceKm: 21,  label: 'T21'    },
        ],
      },
      {
        year: 2025, status: 'held',
        courses: [
          { subEventId: 'miler', distanceKm: 161, label: 'TMiler' },
          { subEventId: 't102',  distanceKm: 102, label: 'T102'   },
          { subEventId: 't50',   distanceKm: 50,  label: 'T50'    },
          { subEventId: 't21',   distanceKm: 21,  label: 'T21'    },
        ],
      },
      {
        year: 2026, status: 'held',
        note: 'T16 inaugural',
        courses: [
          { subEventId: 'miler', distanceKm: 161, label: 'TMiler' },
          { subEventId: 't102',  distanceKm: 102, label: 'T102'   },
          { subEventId: 't50',   distanceKm: 50,  label: 'T50'    },
          { subEventId: 't21',   distanceKm: 21,  label: 'T21'    },
          { subEventId: 't16',   distanceKm: 16,  label: 'T16'    },
        ],
      },
    ],
  },
];

/**
 * Canonical results-file name for a course instance. Derived (never authored)
 * so the converter, the canon build, and the app can't disagree about naming:
 *   results-{familySlug}-{subEventId}-{year}.json
 * subEventId occupies the slot road file keys use for distId.
 * @param {string} familySlug
 * @param {string} subEventId
 * @param {number} year
 */
export function trailResultsFile(familySlug, subEventId, year) {
  return `results-${familySlug}-${subEventId}-${year}.json`;
}

/**
 * File-key → metadata for every (family, sub-event) pair, in the exact shape
 * buildAthleteCanon.mjs / build-search-index.mjs key their FILE_META /
 * RACE_LABELS maps (filename minus "results-" prefix and "-YYYY.json" suffix).
 * `distByYear` carries the real measured distance per year so athlete rows can
 * show honest per-year distances; `label` is era-stable for canon/search
 * (recordIds + rebrand continuity live on subEventId, not the label).
 */
export function trailFileMeta() {
  /** @type {Record<string, { label: string, raceSlug: string, distId: string, trail: true, seasonMonth?: number, distByYear: Record<number, number> }>} */
  const meta = {};
  for (const fam of TRAIL_EVENT_FAMILIES) {
    for (const sub of fam.subEvents) {
      const key = `${fam.familySlug}-${sub.id}`;
      /** @type {Record<number, number>} */
      const distByYear = {};
      for (const ed of fam.editions) {
        for (const ci of ed.courses) {
          if (ci.subEventId === sub.id) distByYear[ed.year] = ci.distanceKm;
        }
      }
      meta[key] = {
        label: `${fam.shortName} ${sub.displayName}`,
        raceSlug: fam.familySlug,
        distId: sub.id,
        trail: true,
        seasonMonth: fam.seasonMonth,
        distByYear,
      };
    }
  }
  return meta;
}
