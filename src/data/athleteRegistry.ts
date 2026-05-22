// Central registry of all athletes with profiles.
// Add an entry here when creating a new athlete page — Athletes.tsx and
// athleteProfiles.ts both derive their data from this single source.

export interface AthleteEntry {
  name: string;
  slug: string;
  nationality: string;
  gender: 'M' | 'W';
  pbTime: string;
  pbRace: string;
  racesLogged: number;
  /** Alternative name spellings found in race data */
  aliases?: string[];
}

export const ATHLETE_REGISTRY: AthleteEntry[] = [
  { name: 'Michael Voss',        slug: 'michael-voss',        nationality: 'NZL', gender: 'M', pbTime: '2:21:01', pbRace: 'Auckland Marathon 2025',          racesLogged: 34 },
  { name: 'Daniel Balchin',      slug: 'daniel-balchin',      nationality: 'NZL', gender: 'M', pbTime: '2:19:55', pbRace: 'Auckland Marathon 2025',          racesLogged: 18 },
  { name: 'Cameron Graves',      slug: 'cameron-graves',      nationality: 'NZL', gender: 'M', pbTime: '2:21:04', pbRace: 'Auckland Marathon 2025',          racesLogged: 12, aliases: ['Cam Graves'] },
  { name: 'Oska Inkster-Baynes', slug: 'oska-inkster-baynes', nationality: 'NZL', gender: 'M', pbTime: '2:18:11', pbRace: 'Christchurch Marathon 2019',      racesLogged: 8,  aliases: ['Oska Baynes'] },
  { name: 'Christopher Dryden',  slug: 'christopher-dryden',  nationality: 'NZL', gender: 'M', pbTime: '1:04:11', pbRace: 'Christchurch Half 2025',          racesLogged: 14 },
  { name: 'Jonathan Jackson',    slug: 'jonathan-jackson',    nationality: 'NZL', gender: 'M', pbTime: '2:26:38', pbRace: 'Auckland Marathon 2016',          racesLogged: 22, aliases: ['Jono Jackson'] },
  { name: 'Blair McWhirter',     slug: 'blair-mcwhirter',     nationality: 'NZL', gender: 'M', pbTime: '2:25:24', pbRace: 'Christchurch Marathon 2012',      racesLogged: 14 },
  { name: 'Aaron Pulford',       slug: 'aaron-pulford',       nationality: 'NZL', gender: 'M', pbTime: '1:06:11', pbRace: 'Christchurch Half 2013',          racesLogged: 12 },
  { name: 'Daniel Jones',        slug: 'daniel-jones',        nationality: 'NZL', gender: 'M', pbTime: '2:20:00', pbRace: 'Auckland Marathon 2021',          racesLogged: 9  },
  { name: 'Ciaran Faherty',      slug: 'ciaran-faherty',      nationality: 'NZL', gender: 'M', pbTime: '2:24:11', pbRace: 'Christchurch Marathon 2017',      racesLogged: 15 },
  { name: 'Hiro Tanimoto',       slug: 'hiro-tanimoto',       nationality: 'NZL', gender: 'M', pbTime: '2:27:12', pbRace: 'Wellington Marathon 2019',           racesLogged: 6,  aliases: ['Hirotaka Tanimoto'] },
  { name: 'Fabe Downs',          slug: 'fabe-downs',          nationality: 'NZL', gender: 'M', pbTime: '2:26:34', pbRace: 'Auckland Marathon 2020',          racesLogged: 6,  aliases: ['Fabian Downs'] },
  // New profiles
  { name: 'Cullern Thorby',      slug: 'cullern-thorby',      nationality: 'NZL', gender: 'M', pbTime: '2:22:59', pbRace: 'Auckland Marathon 2024',          racesLogged: 9  },
  { name: 'Casey Thorby',        slug: 'casey-thorby',        nationality: 'NZL', gender: 'M', pbTime: '1:07:12', pbRace: 'Auckland Half Marathon 2024',     racesLogged: 9  },
  { name: 'Jack Moody',          slug: 'jack-moody',          nationality: 'NZL', gender: 'M', pbTime: '2:25:02', pbRace: 'Queenstown Marathon 2025',        racesLogged: 12 },
  { name: 'Brent Godfrey',       slug: 'brent-godfrey',       nationality: 'NZL', gender: 'M', pbTime: '2:38:22', pbRace: 'Auckland Marathon 2025',          racesLogged: 19 },
  { name: 'Ben Twyman',          slug: 'ben-twyman',          nationality: 'NZL', gender: 'M', pbTime: '2:37:59', pbRace: 'Christchurch Marathon 2018',      racesLogged: 14 },
  { name: 'Dougal Thorburn',     slug: 'dougal-thorburn',     nationality: 'NZL', gender: 'M', pbTime: '2:24:51', pbRace: 'Christchurch Marathon 2016',      racesLogged: 10 },
  { name: 'Orestas Rimkus',      slug: 'orestas-rimkus',      nationality: 'NZL', gender: 'M', pbTime: '2:36:27', pbRace: 'Queenstown Marathon 2024',        racesLogged: 8  },
  { name: 'Brett Tingay',        slug: 'brett-tingay',        nationality: 'NZL', gender: 'M', pbTime: '1:08:32', pbRace: 'Christchurch Half 2012',          racesLogged: 11 },
  { name: 'Mike Phillips',       slug: 'mike-phillips',       nationality: 'NZL', gender: 'M', pbTime: '1:09:46', pbRace: 'Christchurch Half 2026',          racesLogged: 10 },
  // Women
  { name: 'Amelia Lythe',        slug: 'amelia-lythe',        nationality: 'NZL', gender: 'W', pbTime: '1:20:36', pbRace: 'Waterfront Half Marathon 2026',   racesLogged: 7  },
  { name: 'Kylie Brown',         slug: 'kylie-brown',         nationality: 'NZL', gender: 'W', pbTime: '1:38:00', pbRace: 'Waterfront Half Marathon 2021',   racesLogged: 4  },
  // Community / recreational
  { name: 'Scott Knowles',       slug: 'scott-knowles',       nationality: 'NZL', gender: 'M', pbTime: '1:34:52', pbRace: 'Waterfront Half Marathon 2025',   racesLogged: 3  },
  { name: 'Dylan Logan',         slug: 'dylan-logan',         nationality: 'NZL', gender: 'M', pbTime: '2:37:41', pbRace: 'Christchurch Marathon 2025',      racesLogged: 16 },
];

/** Build slug map including aliases for use in athleteProfiles.ts */
export function buildSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const a of ATHLETE_REGISTRY) {
    map[a.name.toLowerCase()] = a.slug;
    for (const alias of a.aliases ?? []) {
      map[alias.toLowerCase()] = a.slug;
    }
  }
  return map;
}
