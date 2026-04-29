import { useNavigate } from 'react-router-dom';

const records = [
  { race: 'Auckland Marathon',      href: '/races/auckland-marathon',  distance: '42.2 km', gender: 'M', holder: 'Stephen Kogo',       time: '2:08:31', year: 2023, nationality: 'KEN' },
  { race: 'Auckland Marathon',      href: '/races/auckland-marathon',  distance: '42.2 km', gender: 'F', holder: 'Contestina Mwangi',   time: '2:33:34', year: 2019, nationality: 'KEN' },
  { race: 'Rotorua Marathon',       href: '/races/rotorua-marathon',   distance: '42.2 km', gender: 'M', holder: 'Gideon Chirchir',     time: '2:14:08', year: 2018, nationality: 'KEN' },
  { race: 'Rotorua Marathon',       href: '/races/rotorua-marathon',   distance: '42.2 km', gender: 'F', holder: 'Naomi Muhia',         time: '2:38:44', year: 2017, nationality: 'KEN' },
  { race: 'Queenstown Marathon',    href: null,                        distance: '42.2 km', gender: 'M', holder: 'Hamish Carson',       time: '2:19:52', year: 2022, nationality: 'NZL' },
  { race: 'Queenstown Marathon',    href: null,                        distance: '42.2 km', gender: 'F', holder: 'Alana Sherburn',      time: '2:43:17', year: 2022, nationality: 'NZL' },
  { race: 'Wellington Marathon',    href: null,                        distance: '42.2 km', gender: 'M', holder: 'Tom Walsh',           time: '2:22:41', year: 2019, nationality: 'NZL' },
  { race: 'Wellington Marathon',    href: null,                        distance: '42.2 km', gender: 'F', holder: 'Kim Smith',           time: '2:31:05', year: 2016, nationality: 'NZL' },
  { race: 'Tarawera Ultramarathon', href: null,                        distance: '102 km',  gender: 'M', holder: 'Vajin Armstrong',     time: '7:44:21', year: 2020, nationality: 'NZL' },
  { race: 'Tarawera Ultramarathon', href: null,                        distance: '102 km',  gender: 'F', holder: 'Nikki Wynd',          time: '9:02:14', year: 2019, nationality: 'NZL' },
  { race: 'Round the Bays',         href: null,                        distance: '8.4 km',  gender: 'M', holder: 'Zane Robertson',      time: '24:01',   year: 2015, nationality: 'NZL' },
  { race: 'Round the Bays',         href: null,                        distance: '8.4 km',  gender: 'F', holder: 'Kim Smith',           time: '27:44',   year: 2010, nationality: 'NZL' },
];

export default function Records() {
  const navigate = useNavigate();

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-16">Archive · NZ competitive running</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>Course Records</h1>
            <div className="dimmed" style={{ fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Current marks · all certified events
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="page">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Race</th>
                  <th>Distance</th>
                  <th style={{ width: 40 }}>Cat.</th>
                  <th>Holder</th>
                  <th>Nationality</th>
                  <th className="num">Time</th>
                  <th style={{ width: 60 }}>Year</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={i} className="row"
                      style={{ cursor: rec.href ? 'pointer' : 'default' }}
                      onClick={() => rec.href && navigate(rec.href)}>
                    <td>
                      <span className="serif" style={{ fontSize: 15 }}>{rec.race}</span>
                    </td>
                    <td className="dimmed">{rec.distance}</td>
                    <td className="dimmed">{rec.gender}</td>
                    <td style={{ fontSize: 13 }}>{rec.holder}</td>
                    <td className="dimmed">{rec.nationality}</td>
                    <td className="num time serif" style={{ fontSize: 15 }}>{rec.time}</td>
                    <td className="dimmed">{rec.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
            Records reflect certified timings from official race results. Click any race with a live page to view full history.
          </div>
        </div>
      </section>
    </main>
  );
}
