import { useNavigate } from 'react-router-dom';

const races = [
  { name: "Auckland Marathon", slug: "auckland-marathon", location: "Auckland", date: "26 Oct 2025", distances: ["42.2 km", "21.1 km", "11 km", "5 km"], surface: "Road", since: "1986" },
  { name: "Rotorua Marathon", slug: null, location: "Rotorua", date: "3 May 2025", distances: ["42.2 km", "21.1 km"], surface: "Road", since: "1967" },
  { name: "Queenstown International Marathon", slug: null, location: "Queenstown", date: "22 Nov 2025", distances: ["42.2 km", "21.1 km", "10 km"], surface: "Road", since: "2014" },
  { name: "Wellington Marathon", slug: null, location: "Wellington", date: "8 Jun 2025", distances: ["42.2 km", "21.1 km", "10 km"], surface: "Road", since: "2011" },
  { name: "Tarawera Ultramarathon", slug: null, location: "Rotorua", date: "8 Feb 2026", distances: ["102 km", "50 km", "21 km"], surface: "Trail", since: "2008" },
  { name: "Round the Bays", slug: null, location: "Auckland", date: "2 Aug 2025", distances: ["8.4 km", "5 km"], surface: "Road", since: "1972" },
  { name: "Christchurch Marathon", slug: null, location: "Christchurch", date: "13 Jul 2025", distances: ["42.2 km", "21.1 km"], surface: "Road", since: "2008" },
  { name: "Mountain to Surf", slug: null, location: "Egmont National Park", date: "21 Sep 2025", distances: ["37 km"], surface: "Trail", since: "1977" },
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
