import { useNavigate } from 'react-router-dom';

const races = [
  { name: "Auckland Marathon",          slug: "auckland-marathon",          location: "Auckland",             date: "1 Nov 2026",  distances: ["42.2 km", "21.1 km", "11 km", "5 km"], surface: "Road",         since: "1992" },
  { name: "Christchurch Marathon",      slug: "christchurch-marathon",      location: "Christchurch",         date: "12 Jul 2026", distances: ["42.2 km", "21.1 km"],                   surface: "Road",         since: "2007" },
  { name: "Coatesville Half Marathon",  slug: "coatesville-half-marathon",  location: "Coatesville, Rodney",  date: "2027",        distances: ["21.1 km"],                              surface: "Road & trail", since: "2011" },
  { name: "Devonport Half Marathon",    slug: "devonport-half-marathon",    location: "Devonport",            date: "27 Sep 2026", distances: ["21.1 km", "10 km", "5 km"],             surface: "Mixed",        since: "2015" },
  { name: "Hawke's Bay Marathon",       slug: "hawkes-bay-marathon",        location: "Napier",               date: "7 Jun 2026",  distances: ["42.2 km", "21.1 km"],                   surface: "Road",         since: "2016" },
  { name: "Kerikeri Half Marathon",     slug: "kerikeri-half-marathon",     location: "Kerikeri, Northland",  date: "2026",        distances: ["21.1 km"],                              surface: "Road",         since: "2003" },
  { name: "Maraetai Half Marathon",     slug: "maraetai-half-marathon",     location: "Maraetai Beach",       date: "2027",        distances: ["21.1 km", "10 km"],                     surface: "Road",         since: "2019" },
  { name: "Mount Maunganui Half Marathon", slug: "mount-maunganui-half-marathon", location: "Mount Maunganui, Bay of Plenty", date: "2026", distances: ["21.1 km", "10 km", "5 km"],  surface: "Road",         since: "2016" },
  { name: "Omaha Half Marathon",        slug: "omaha-half-marathon",        location: "Omaha Beach, Rodney",  date: "2026",        distances: ["21.1 km", "10 km"],                     surface: "Road",         since: "2015" },
  { name: "Onehunga Half Marathon",     slug: "onehunga-half-marathon",     location: "Onehunga, Auckland",   date: "2026",        distances: ["21.1 km", "10 km"],                     surface: "Road",         since: "2021" },
  { name: "Orewa Half Marathon",        slug: "orewa-half-marathon",        location: "Orewa, Auckland",      date: "2026",        distances: ["21.1 km", "10 km"],                     surface: "Road",         since: "2021" },
  { name: "Queenstown Marathon",        slug: "queenstown-marathon",        location: "Queenstown",           date: "21 Nov 2026", distances: ["42.2 km", "21.1 km", "10 km"],          surface: "Mixed",        since: "2014" },
  { name: "Rotorua Marathon",           slug: "rotorua-marathon",           location: "Rotorua",              date: "2 May 2027",  distances: ["42.2 km", "21.1 km"],                   surface: "Road",         since: "1967" },
  { name: "Tamaki River Half Marathon", slug: "tamaki-river-half-marathon", location: "Panmure, Auckland",    date: "2026",        distances: ["21.1 km", "10 km"],                     surface: "Road",         since: "2021" },
  { name: "Waterfront Half Marathon",   slug: "waterfront-half-marathon",   location: "Auckland",             date: "2027",        distances: ["21.1 km", "10 km"],                     surface: "Road",         since: "2018" },
  { name: "Wellington Marathon",        slug: "wellington-marathon",        location: "Wellington",           date: "7 Jun 2026",  distances: ["42.2 km", "21.1 km", "10 km"],          surface: "Road",         since: "1996" },
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
