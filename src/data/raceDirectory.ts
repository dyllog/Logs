/**
 * Central list of all race editions known to the site.
 * Used by the search components to answer year queries like "2024".
 * Labels must match RACE_LABELS in scripts/build-search-index.mjs.
 */

import { YEARS, ROTORUA_YEARS }                from './logsDataExt';
import { CHC_YEARS }                            from './chcData';
import { HB_YEARS }                             from './hbData';
import { QT_YEARS }                             from './qtData';
import { WF_YEARS }                             from './waterfrontData';
import { DEV_HALF_YEARS, DEV_10K_YEARS }        from './devonportData';
import { COAST_YEARS }                          from './coatesvilleData';
import { OMAHA_HALF_YEARS, OMAHA_10K_YEARS }    from './omahaData';
import { MARAETAI_HALF_YEARS, MARAETAI_10K_YEARS } from './maraetaiData';
import { KERIKERI_YEARS }                       from './kerikeriData';
import { WELLINGTON_MAR_YEARS, WELLINGTON_HALF_YEARS } from './wellingtonData';
import { ONEHUNGA_HALF_YEARS, ONEHUNGA_10K_YEARS }    from './onehungaData';
import { OREWA_HALF_YEARS, OREWA_10K_YEARS }          from './orewaData';
import { TAMAKI_HALF_YEARS, TAMAKI_10K_YEARS }        from './tamakiData';
import { MTM_HALF_YEARS, MTM_10K_YEARS, MTM_5K_YEARS } from './mtmData';
import { WHANGANUI_MAR_YEARS, WHANGANUI_HALF_YEARS, WHANGANUI_QUARTER_YEARS, WHANGANUI_5K_YEARS } from './whanganuiData';
import { TRAIL_FAMILIES, latestCourse, subEventCourseYears } from './trailEventConfig';

export interface RaceEntry {
  label: string;   // Display name matching RACE_LABELS (e.g. "Christchurch Half")
  dist:  string;   // Distance label shown in search (e.g. "21.1 km")
  route: string;   // Route path (e.g. "/races/christchurch-marathon")
  years: readonly number[];
  /** Historic names this event ran under, so searching a retired brand
   *  ("Tarawera 100K") still finds the current lineage ("Tarawera T102"). */
  aliases?: readonly string[];
}

export const RACE_DIRECTORY: RaceEntry[] = [
  { label: 'Auckland Marathon',     dist: '42.2 km', route: '/races/auckland-marathon',         years: YEARS              },
  { label: 'Auckland Half',         dist: '21.1 km', route: '/races/auckland-marathon',         years: YEARS              },
  { label: 'Rotorua Marathon',      dist: '42.2 km', route: '/races/rotorua-marathon',          years: ROTORUA_YEARS      },
  { label: 'Rotorua Half',          dist: '21.1 km', route: '/races/rotorua-marathon',          years: ROTORUA_YEARS      },
  { label: 'Christchurch Marathon', dist: '42.2 km', route: '/races/christchurch-marathon',     years: CHC_YEARS          },
  { label: 'Christchurch Half',     dist: '21.1 km', route: '/races/christchurch-marathon',     years: CHC_YEARS          },
  { label: "Hawke's Bay Marathon",  dist: '42.2 km', route: '/races/hawkes-bay-marathon',       years: HB_YEARS           },
  { label: "Hawke's Bay Half",      dist: '21.1 km', route: '/races/hawkes-bay-marathon',       years: HB_YEARS           },
  { label: 'Queenstown Marathon',   dist: '42.2 km', route: '/races/queenstown-marathon',       years: QT_YEARS           },
  { label: 'Queenstown Half',       dist: '21.1 km', route: '/races/queenstown-marathon',       years: QT_YEARS           },
  { label: 'Waterfront Half',       dist: '21.1 km', route: '/races/waterfront-half-marathon',  years: WF_YEARS           },
  { label: 'Waterfront 10k',        dist: '10 km',   route: '/races/waterfront-half-marathon',  years: WF_YEARS           },
  { label: 'Devonport Half',        dist: '21.1 km', route: '/races/devonport-half-marathon',   years: DEV_HALF_YEARS     },
  { label: 'Devonport 10k',         dist: '10 km',   route: '/races/devonport-half-marathon',   years: DEV_10K_YEARS      },
  { label: 'Coatesville Half',      dist: '21.1 km', route: '/races/coatesville-half-marathon', years: COAST_YEARS        },
  { label: 'Omaha Half',            dist: '21.1 km', route: '/races/omaha-half-marathon',       years: OMAHA_HALF_YEARS   },
  { label: 'Omaha 10k',             dist: '10 km',   route: '/races/omaha-half-marathon',       years: OMAHA_10K_YEARS    },
  { label: 'Maraetai Half',         dist: '21.1 km', route: '/races/maraetai-half-marathon',    years: MARAETAI_HALF_YEARS},
  { label: 'Maraetai 10k',          dist: '10 km',   route: '/races/maraetai-half-marathon',    years: MARAETAI_10K_YEARS },
  { label: 'Kerikeri Half',         dist: '21.1 km', route: '/races/kerikeri-half-marathon',    years: KERIKERI_YEARS     },
  { label: 'Wellington Marathon',   dist: '42.2 km', route: '/races/wellington-marathon',            years: WELLINGTON_MAR_YEARS  },
  { label: 'Wellington Half',       dist: '21.1 km', route: '/races/wellington-marathon',            years: WELLINGTON_HALF_YEARS },
  { label: 'Onehunga Half',         dist: '21.1 km', route: '/races/onehunga-half-marathon',         years: ONEHUNGA_HALF_YEARS   },
  { label: 'Onehunga 10k',          dist: '10 km',   route: '/races/onehunga-half-marathon',         years: ONEHUNGA_10K_YEARS    },
  { label: 'Orewa Half',            dist: '21.1 km', route: '/races/orewa-half-marathon',            years: OREWA_HALF_YEARS      },
  { label: 'Orewa 10k',             dist: '10 km',   route: '/races/orewa-half-marathon',            years: OREWA_10K_YEARS       },
  { label: 'Tamaki Half',           dist: '21.1 km', route: '/races/tamaki-river-half-marathon',     years: TAMAKI_HALF_YEARS     },
  { label: 'Tamaki 10k',            dist: '10 km',   route: '/races/tamaki-river-half-marathon',     years: TAMAKI_10K_YEARS      },
  { label: 'Mt Maunganui Half',     dist: '21.1 km', route: '/races/mount-maunganui-half-marathon',  years: MTM_HALF_YEARS        },
  { label: 'Mt Maunganui 10k',      dist: '10 km',   route: '/races/mount-maunganui-half-marathon',  years: MTM_10K_YEARS         },
  { label: 'Mt Maunganui 5k',       dist: '5 km',    route: '/races/mount-maunganui-half-marathon',  years: MTM_5K_YEARS          },
  { label: 'Whanganui Marathon',    dist: '42.2 km', route: '/races/whanganui-three-bridges-marathon', years: WHANGANUI_MAR_YEARS     },
  { label: 'Whanganui Half',        dist: '21.1 km', route: '/races/whanganui-three-bridges-marathon', years: WHANGANUI_HALF_YEARS    },
  // One lap of the four-lap marathon course. Searching "Whanganui 10k" still
  // finds it — that is the label several years were published under.
  { label: 'Whanganui Quarter',     dist: '10.5 km', route: '/races/whanganui-three-bridges-marathon', years: WHANGANUI_QUARTER_YEARS,
    aliases: ['Whanganui 10k', 'Whanganui 10.5k', 'Three Bridges Quarter'] },
  { label: 'Whanganui 5k',          dist: '5 km',    route: '/races/whanganui-three-bridges-marathon', years: WHANGANUI_5K_YEARS      },
  // Trail families: one entry per sub-event, labels matching the search index
  // ({shortName} {displayName}); dist shown is the current-era course distance.
  ...TRAIL_FAMILIES.flatMap(fam =>
    fam.subEvents.map(sub => {
      const cur = latestCourse(fam, sub.id);
      return {
        label: `${fam.shortName} ${sub.displayName}`,
        dist:  cur ? `${cur.distanceKm} km` : '—',
        route: `/races/${fam.familySlug}?sub=${sub.id}`,
        years: subEventCourseYears(fam, sub.id),
        // Era names, plus the full family name so "Tarawera Ultramarathon"
        // matches every sub-event rather than none.
        aliases: [...(sub.aliases ?? []), fam.name],
      };
    })
  ),
];

/** Returns all race editions for a given year, sorted by label. */
export function racesForYear(year: number): RaceEntry[] {
  return RACE_DIRECTORY
    .filter(r => (r.years as number[]).includes(year))
    .sort((a, b) => a.label.localeCompare(b.label));
}
