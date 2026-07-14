import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type FilterCat = 'all' | 'road' | 'trail' | 'ultra';
type SortOpt = 'est-asc' | 'est-desc' | 'alpha' | 'editions';

interface Race {
  name: string;
  slug: string;
  location: string;
  date: string;
  distances: string[];
  surface: string;
  since: number;
  editions: number;
  tagline: string;
  cat: FilterCat;
  mx: number;
  my: number;
}

// Map coordinate formula (viewBox 0 0 140 290):
// x = (lon - 166) / 13 * 135 + 2.5
// y = (|lat| - 34) / 13 * 275 + 2.5
const RACES: Race[] = [
  {
    name: 'Auckland Marathon', slug: 'auckland-marathon',
    location: 'Auckland', date: '1 Nov 2026',
    distances: ['42.2 km', '21.1 km', '11 km', '5 km'],
    surface: 'Road', since: 1992, editions: 33,
    tagline: "New Zealand's largest field marathon.",
    cat: 'road', mx: 90, my: 64,
  },
  {
    name: 'Christchurch Marathon', slug: 'christchurch-marathon',
    location: 'Christchurch', date: '12 Jul 2026',
    distances: ['42.2 km', '21.1 km'],
    surface: 'Road', since: 2007, editions: 19,
    tagline: "South Island's premier marathon.",
    cat: 'road', mx: 70, my: 203,
  },
  {
    name: 'Coatesville Half Marathon', slug: 'coatesville-half-marathon',
    location: 'Coatesville, Rodney', date: '2027',
    distances: ['21.1 km'],
    surface: 'Road & trail', since: 2011, editions: 14,
    tagline: 'Scenic countryside run through Rodney.',
    cat: 'trail', mx: 87, my: 59,
  },
  {
    name: 'Devonport Half Marathon', slug: 'devonport-half-marathon',
    location: 'Devonport', date: '27 Sep 2026',
    distances: ['21.1 km', '10 km', '5 km'],
    surface: 'Mixed', since: 2015, editions: 11,
    tagline: 'Harbour views and rolling climbs.',
    cat: 'trail', mx: 91, my: 64,
  },
  {
    name: "Hawke's Bay Marathon", slug: 'hawkes-bay-marathon',
    location: 'Napier', date: '7 Jun 2026',
    distances: ['42.2 km', '21.1 km'],
    surface: 'Road', since: 2016, editions: 10,
    tagline: 'Flat and fast along the coast.',
    cat: 'road', mx: 115, my: 123,
  },
  {
    name: 'Kerikeri Half Marathon', slug: 'kerikeri-half-marathon',
    location: 'Kerikeri, Northland', date: '2026',
    distances: ['21.1 km'],
    surface: 'Road', since: 2003, editions: 21,
    tagline: 'Bay of Islands running classic.',
    cat: 'road', mx: 83, my: 27,
  },
  {
    name: 'Maraetai Half Marathon', slug: 'maraetai-half-marathon',
    location: 'Maraetai Beach', date: '2027',
    distances: ['21.1 km', '10 km'],
    surface: 'Road', since: 2019, editions: 8,
    tagline: "Coastal run on Auckland's eastern shore.",
    cat: 'road', mx: 94, my: 65,
  },
  {
    name: 'Mount Maunganui Half Marathon', slug: 'mount-maunganui-half-marathon',
    location: 'Mount Maunganui, Bay of Plenty', date: '2026',
    distances: ['21.1 km', '10 km', '5 km'],
    surface: 'Road', since: 2016, editions: 9,
    tagline: 'Ocean and harbour course at the Mount.',
    cat: 'road', mx: 106, my: 83,
  },
  {
    name: 'Omaha Half Marathon', slug: 'omaha-half-marathon',
    location: 'Omaha Beach, Rodney', date: '2026',
    distances: ['21.1 km', '10 km'],
    surface: 'Road', since: 2015, editions: 11,
    tagline: 'Beach, estuary and farmland.',
    cat: 'road', mx: 91, my: 55,
  },
  {
    name: 'Onehunga Half Marathon', slug: 'onehunga-half-marathon',
    location: 'Onehunga, Auckland', date: '2026',
    distances: ['21.1 km', '10 km'],
    surface: 'Road', since: 2021, editions: 5,
    tagline: 'Auckland inner-city half marathon.',
    cat: 'road', mx: 90, my: 66,
  },
  {
    name: 'Orewa Half Marathon', slug: 'orewa-half-marathon',
    location: 'Orewa, Auckland', date: '2026',
    distances: ['21.1 km', '10 km'],
    surface: 'Road', since: 2021, editions: 5,
    tagline: 'North Shore coastal road race.',
    cat: 'road', mx: 89, my: 57,
  },
  {
    name: 'Queenstown Marathon', slug: 'queenstown-marathon',
    location: 'Queenstown', date: '21 Nov 2026',
    distances: ['42.2 km', '21.1 km', '10 km'],
    surface: 'Mixed', since: 2014, editions: 12,
    tagline: 'Scenic alpine marathon through Queenstown.',
    cat: 'trail', mx: 43, my: 232,
  },
  {
    name: 'Rotorua Marathon', slug: 'rotorua-marathon',
    location: 'Rotorua', date: '2 May 2027',
    distances: ['42.2 km', '21.1 km'],
    surface: 'Road', since: 1967, editions: 58,
    tagline: "New Zealand's oldest marathon.",
    cat: 'road', mx: 107, my: 95,
  },
  {
    name: 'Tamaki River Half Marathon', slug: 'tamaki-river-half-marathon',
    location: 'Panmure, Auckland', date: '2026',
    distances: ['21.1 km', '10 km'],
    surface: 'Road', since: 2021, editions: 5,
    tagline: 'East Auckland riverside course.',
    cat: 'road', mx: 91, my: 64,
  },
  {
    name: 'Waterfront Half Marathon', slug: 'waterfront-half-marathon',
    location: 'Auckland', date: '2027',
    distances: ['21.1 km', '10 km'],
    surface: 'Road', since: 2018, editions: 8,
    tagline: 'Auckland waterfront and Tāmaki Estuary.',
    cat: 'road', mx: 90, my: 63,
  },
  {
    name: 'Wellington Marathon', slug: 'wellington-marathon',
    location: 'Wellington', date: '7 Jun 2026',
    distances: ['42.2 km', '21.1 km', '10 km'],
    surface: 'Road', since: 1996, editions: 28,
    tagline: 'Capital city course with harbour views.',
    cat: 'road', mx: 91, my: 162,
  },
];

function NZMap() {
  return (
    <svg
      viewBox="0 0 140 290"
      width="140"
      height="290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/*
        Coordinate system — matches RACES mx/my values:
          x = (lon − 166) / 13 × 135 + 2.5
          y = (|lat| − 34) / 13 × 275 + 2.5
        Key points derived from actual NZ coastline coordinates.
      */}

      {/* North Island — clockwise from Cape Reinga */}
      <path
        d={[
          'M 70 12',   // Cape Reinga (NW tip)
          'L 74 10',   // NE cape
          'L 80 22',   // Bay of Islands
          'L 90 42',   // Whangarei
          'L 89 56',   // N of Auckland
          'L 90 64',   // Auckland / Waitemata
          'L 97 61',   // Coromandel tip
          'L 106 83',  // Tauranga / Bay of Plenty
          'L 115 99',  // East of Bay of Plenty
          'L 108 115', // Gisborne area
          'L 115 123', // Napier / Hawke Bay
          'L 96 168',  // Cape Palliser (SE)
          'L 91 162',  // Wellington
          'L 92 153',  // Kapiti Coast
          'L 93 134',  // Wanganui
          'L 80 120',  // Cape Egmont / Taranaki (W bulge)
          'L 83 113',  // New Plymouth
          'L 87 107',  // N Taranaki coast
          'L 92 91',   // Kawhia
          'L 93 84',   // Raglan
          'L 84 50',   // Kaipara entrance
          'L 81 42',   // Dargaville / W Northland
          'L 76 33',   // Hokianga
          'L 72 24',   // W Northland coast
          'Z',
        ].join(' ')}
        stroke="var(--rule)"
        strokeWidth="1"
        fill="var(--bg-alt)"
      />

      {/* South Island — clockwise from Cape Farewell */}
      <path
        d={[
          'M 70 147',  // Cape Farewell (NW)
          'L 76 160',  // Nelson
          'L 86 168',  // Marlborough / Blenheim
          'L 80 182',  // Kaikoura
          'L 74 210',  // Banks Peninsula (E)
          'L 59 222',  // Timaru
          'L 53 256',  // Dunedin
          'L 34 267',  // Invercargill
          'L 24 249',  // Fiordland (SW)
          'L 38 213',  // Haast
          'L 57 190',  // Hokitika / Westland
          'L 61 172',  // Westport
          'L 73 149',  // Golden Bay
          'Z',
        ].join(' ')}
        stroke="var(--rule)"
        strokeWidth="1"
        fill="var(--bg-alt)"
      />

      {/* Stewart Island */}
      <ellipse
        cx="22" cy="281" rx="8" ry="4.5"
        stroke="var(--rule)" strokeWidth="0.8" fill="var(--bg-alt)"
      />

      {/* Race location dots */}
      {RACES.map(r => (
        <circle
          key={r.slug}
          cx={r.mx}
          cy={r.my}
          r="3"
          fill="var(--accent)"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

const FILTERS: { key: FilterCat; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'road', label: 'Road' },
  { key: 'trail', label: 'Trail' },
  { key: 'ultra', label: 'Ultra' },
];

const TOTAL_RESULTS = 366_921;

export default function Races() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterCat>('all');
  const [sort, setSort] = useState<SortOpt>('est-asc');

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = RACES.filter(r => {
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      const matchFilter = filter === 'all' || r.cat === filter;
      return matchSearch && matchFilter;
    });
    out.sort((a, b) => {
      switch (sort) {
        case 'est-asc':  return a.since - b.since;
        case 'est-desc': return b.since - a.since;
        case 'alpha':    return a.name.localeCompare(b.name);
        case 'editions': return b.editions - a.editions;
        default:         return 0;
      }
    });
    return out;
  }, [search, filter, sort]);

  const toggleFilter = (cat: FilterCat) =>
    setFilter(prev => (prev === cat ? 'all' : cat));

  return (
    <main>
      {/* ── Hero ── */}
      <div className="page races-hero">
        {/* Left: heading */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>The Archive</div>
          <h1
            className="serif"
            style={{ fontSize: 'clamp(48px, 5.5vw, 76px)', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '0 0 28px' }}
          >
            Race Archive
          </h1>
          <p style={{ fontSize: 14, color: 'var(--meta)', lineHeight: 1.75, margin: 0, maxWidth: 420 }}>
            The races we track. Results, records and histories
            <br />
            from across New Zealand road, trail, and ultra running.
          </p>
        </div>

        {/* Right: map + stats */}
        <div className="races-hero-right">
          <div className="races-hero-map hide-tablet">
            <NZMap />
          </div>

          <div className="races-hero-stats">
            <div>
              <div className="serif" style={{ fontSize: 48, color: 'var(--accent)', lineHeight: 1, margin: 0 }}>
                {RACES.length}
              </div>
              <div className="label" style={{ marginTop: 5 }}>events on file</div>
            </div>

            <div style={{ marginTop: 28 }}>
              <div className="serif" style={{ fontSize: 34, color: 'var(--accent)', lineHeight: 1, margin: 0 }}>
                {TOTAL_RESULTS.toLocaleString()}
              </div>
              <div className="label" style={{ marginTop: 5 }}>results indexed</div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="label">Updated</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--ink)', letterSpacing: '0.04em', marginTop: 4 }}>
                25 May 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ borderTop: '0.5px solid var(--rule)', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page races-toolbar">
          {/* Breadcrumb / category links */}
          <div className="races-breadcrumb">
            <span className="label">Race Index</span>
            <span className="label races-sep">·</span>
            <span className="label">{RACES.length} Events on File</span>
            <span className="label races-sep">·</span>
            {(['road', 'trail', 'ultra'] as FilterCat[]).map((cat, i, arr) => (
              <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="label races-cat-link"
                  style={{ color: filter === cat ? 'var(--ink)' : undefined }}
                  onClick={() => toggleFilter(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
                {i < arr.length - 1 && <span className="label races-sep">·</span>}
              </span>
            ))}
          </div>

          {/* Search + pills + sort */}
          <div className="races-controls">
            {/* Search */}
            <div className="races-search-wrap">
              <svg
                width="13" height="13" viewBox="0 0 13 13" fill="none"
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--meta)', pointerEvents: 'none' }}
              >
                <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                className="races-search-input"
                type="text"
                placeholder="Search races..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`pill${filter === f.key ? ' active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="races-sort">
              <span className="label">Sort by</span>
              <div style={{ position: 'relative' }}>
                <select
                  className="races-sort-select"
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOpt)}
                >
                  <option value="est-asc">Established (oldest)</option>
                  <option value="est-desc">Established (newest)</option>
                  <option value="alpha">Alphabetical (A–Z)</option>
                  <option value="editions">Most editions</option>
                </select>
                <svg
                  width="8" height="5" viewBox="0 0 8 5"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--meta)' }}
                >
                  <path d="M0 0l4 5 4-5z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="page" style={{ paddingBottom: 80 }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Race</th>
                <th>Location</th>
                <th>Distances</th>
                <th className="hide-mobile">Surface</th>
                <th className="hide-mobile">Est.</th>
                <th className="hide-mobile num">Editions</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(race => (
                <tr
                  key={race.slug}
                  className="row"
                  onClick={() => navigate(`/races/${race.slug}`)}
                >
                  <td style={{ width: '28%' }}>
                    <div className="serif" style={{ fontSize: 14, lineHeight: 1.25 }}>
                      {race.name}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--meta)',
                      marginTop: 3,
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: '0.01em',
                    }}>
                      {race.tagline}
                    </div>
                  </td>
                  <td className="dimmed" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {race.location}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {race.distances.map(d => (
                        <span key={d} className="pill" style={{ fontSize: 10 }}>
                          {d.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="dimmed hide-mobile" style={{ fontSize: 12 }}>
                    {race.surface}
                  </td>
                  <td className="dimmed hide-mobile" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {race.since}
                  </td>
                  <td className="hide-mobile num" style={{ fontSize: 12 }}>
                    {race.editions}
                    <span className="dimmed" style={{ fontSize: 10, marginLeft: 4 }}>ed.</span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 8 }}>
                    <span style={{ color: 'var(--accent)', fontSize: 14, lineHeight: 1 }}>→</span>
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: '56px 12px', color: 'var(--meta)', fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 15 }}
                  >
                    No races match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Row count */}
        <div style={{
          paddingTop: 14,
          borderTop: '0.5px solid var(--rule-soft)',
          fontSize: 11,
          color: 'var(--meta)',
          letterSpacing: '0.06em',
          fontFamily: "'DM Mono', monospace",
        }}>
          Showing {displayed.length > 0 ? `1–${displayed.length}` : '0'} of {RACES.length} races
        </div>
      </div>
    </main>
  );
}
