import { useNavigate } from 'react-router-dom';

const races = [
  { name: "Auckland Marathon",       slug: "auckland-marathon",    location: "Auckland",             date: "1 Nov 2026",  distances: ["42.2 km", "21.1 km", "11 km", "5 km"], surface: "Road",  since: "1992" },
  { name: "Rotorua Marathon",        slug: "rotorua-marathon",     location: "Rotorua",              date: "2 May 2027",  distances: ["42.2 km", "21.1 km"],                   surface: "Road",  since: "1967" },
  { name: "Queenstown Marathon",     slug: "queenstown-marathon",  location: "Queenstown",           date: "21 Nov 2026", distances: ["42.2 km", "21.1 km", "10 km"],           surface: "Mixed", since: "2014" },
  { name: "Hawke's Bay Marathon",    slug: "hawkes-bay-marathon",  location: "Napier",               date: "7 Jun 2026",  distances: ["42.2 km", "21.1 km"],                    surface: "Road",  since: "2016" },
  { name: "Christchurch Marathon",   slug: "christchurch-marathon",location: "Christchurch",         date: "12 Jul 2026", distances: ["42.2 km", "21.1 km"],                    surface: "Road",  since: "2007" },
  { name: "Waterfront Half Marathon", slug: "waterfront-half-marathon", location: "Auckland",            date: "2027",        distances: ["21.1 km", "10 km"],                      surface: "Road",  since: "2018" },
  { name: "Devonport Half Marathon",  slug: "devonport-half-marathon",  location: "Devonport",           date: "27 Sep 2026", distances: ["21.1 km", "10 km", "5 km"],              surface: "Mixed", since: "2015" },
  { name: "Coatesville Half Marathon", slug: "coatesville-half-marathon", location: "Coatesville, Rodney", date: "2027",        distances: ["21.1 km"],                               surface: "Road",  since: "2011" },
  { name: "Omaha Half Marathon",       slug: "omaha-half-marathon",       location: "Omaha Beach, Rodney", date: "2027",        distances: ["21.1 km", "10 km"],                      surface: "Road",  since: "2016" },
  { name: "Maraetai Half Marathon",    slug: "maraetai-half-marathon",    location: "Maraetai Beach",      date: "2027",        distances: ["21.1 km", "10 km"],                      surface: "Road",  since: "2019" },
  { name: "Kerikeri Half Marathon",    slug: "kerikeri-half-marathon",    location: "Kerikeri, Northland", date: "2025",        distances: ["21.1 km"],                               surface: "Road",  since: "2008" },
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

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Race</th>
                <th>Location</th>
                <th>Next date</th>
                <th>Distances</th>
                <th className="hide-mobile">Surface</th>
                <th className="hide-mobile">Est.</th>
              </tr>
            </thead>
            <tbody>
              {races.map((race, i) => (
                <tr
                  key={i}
                  className="row"
                  style={{ cursor: race.slug ? 'pointer' : 'default' }}
                  onClick={() => race.slug && navigate(`/races/${race.slug}`)}
                >
                  <td className={race.slug ? 'serif' : 'serif dimmed'} style={{ fontSize: 14 }}>
                    {race.name}
                    {race.slug && <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.4 }}>→</span>}
                  </td>
                  <td className="dimmed" style={{ fontSize: 13 }}>{race.location}</td>
                  <td className="dimmed" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{race.date}</td>
                  <td>
                    <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                      {race.distances.map(d => (
                        <span key={d} className="pill" style={{ fontSize: 10 }}>{d}</span>
                      ))}
                    </div>
                  </td>
                  <td className="dimmed hide-mobile" style={{ fontSize: 13 }}>{race.surface}</td>
                  <td className="dimmed hide-mobile" style={{ fontSize: 13 }}>{race.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Races;
