import { useNavigate } from 'react-router-dom';

const races = [
  { name: "Auckland Marathon",       slug: "auckland-marathon",    location: "Auckland",             date: "1 Nov 2026",  distances: ["42.2 km", "21.1 km", "11 km", "5 km"], surface: "Road",  since: "1992" },
  { name: "Rotorua Marathon",        slug: "rotorua-marathon",     location: "Rotorua",              date: "2 May 2027",  distances: ["42.2 km", "21.1 km"],                   surface: "Road",  since: "1967" },
  { name: "Queenstown Marathon",     slug: "queenstown-marathon",  location: "Queenstown",           date: "21 Nov 2026", distances: ["42.2 km", "21.1 km", "10 km"],           surface: "Mixed", since: "2014" },
  { name: "Hawke's Bay Marathon",    slug: "hawkes-bay-marathon",  location: "Napier",               date: "7 Jun 2026",  distances: ["42.2 km", "21.1 km"],                    surface: "Road",  since: "2016" },
  { name: "Christchurch Marathon",   slug: "christchurch-marathon",location: "Christchurch",         date: "12 Jul 2026", distances: ["42.2 km", "21.1 km"],                    surface: "Road",  since: "2007" },
  { name: "Wellington Marathon",     slug: null,                   location: "Wellington",           date: "7 Jun 2026",  distances: ["42.2 km", "21.1 km", "10 km"],           surface: "Road",  since: "2011" },
  { name: "Tarawera Ultramarathon",  slug: null,                   location: "Rotorua",              date: "8 Feb 2027",  distances: ["102 km", "50 km", "21 km"],               surface: "Trail", since: "2008" },
  { name: "Round the Bays",          slug: null,                   location: "Auckland",             date: "2 Aug 2026",  distances: ["8.4 km", "5 km"],                         surface: "Road",  since: "1972" },
  { name: "Mountain to Surf",        slug: null,                   location: "Egmont National Park", date: "20 Sep 2026", distances: ["37 km"],                                  surface: "Trail", since: "1977" },
];

const Races = () => {
  const navigate = useNavigate();

  return (
    <main>
      <div className="page" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow mb-12">Archive</div>
          <h1 className="serif" style={{ fontSize: 36 }}>Races</h1>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--rule)' }}>
              {['Race', 'Location', 'Next date', 'Distances', 'Surface', 'Est.'].map(col => (
                <th key={col} className="label" style={{ textAlign: 'left', paddingBottom: 10, paddingRight: 24, fontWeight: 400 }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {races.map((race, i) => (
              <tr
                key={i}
                style={{ cursor: race.slug ? 'pointer' : 'default' }}
                onClick={() => race.slug && navigate(`/races/${race.slug}`)}
                onMouseEnter={e => { if (race.slug) (e.currentTarget as HTMLElement).style.background = 'var(--hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <td style={{ padding: '14px 24px 14px 0', borderBottom: '0.5px solid var(--rule)', fontSize: 14 }}
                    className={race.slug ? 'serif' : 'serif dimmed'}>
                  {race.name}
                  {race.slug && <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.4 }}>→</span>}
                </td>
                <td className="dimmed" style={{ padding: '14px 24px 14px 0', borderBottom: '0.5px solid var(--rule)', fontSize: 13 }}>
                  {race.location}
                </td>
                <td className="dimmed" style={{ padding: '14px 24px 14px 0', borderBottom: '0.5px solid var(--rule)', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {race.date}
                </td>
                <td style={{ padding: '14px 24px 14px 0', borderBottom: '0.5px solid var(--rule)' }}>
                  <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                    {race.distances.map(d => (
                      <span key={d} className="pill" style={{ fontSize: 10 }}>{d}</span>
                    ))}
                  </div>
                </td>
                <td className="dimmed" style={{ padding: '14px 24px 14px 0', borderBottom: '0.5px solid var(--rule)', fontSize: 13 }}>
                  {race.surface}
                </td>
                <td className="dimmed" style={{ padding: '14px 0', borderBottom: '0.5px solid var(--rule)', fontSize: 13 }}>
                  {race.since}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Races;
