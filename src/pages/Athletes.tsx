import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const athletes = [
  { name: 'Daniel Balchin',  nationality: 'NZL', gender: 'M', races: 9,  pb: '2:19:55', pbRace: 'Auckland Marathon 2025',     href: '/athletes/daniel-balchin',   active: true },
  { name: 'Stephen Kogo',    nationality: 'KEN', gender: 'M', races: 4,  pb: '2:08:31', pbRace: 'Auckland Marathon',           href: null,                          active: false },
  { name: 'Hamish Carson',   nationality: 'NZL', gender: 'M', races: 12, pb: '2:19:52', pbRace: 'Queenstown Marathon',         href: null,                          active: false },
  { name: 'Kim Smith',       nationality: 'NZL', gender: 'W', races: 9,  pb: '2:31:05', pbRace: 'Wellington Marathon',         href: null,                          active: false },
  { name: 'Vajin Armstrong', nationality: 'NZL', gender: 'M', races: 7,  pb: '7:44:21', pbRace: 'Tarawera Ultra',             href: null,                          active: false },
  { name: 'Zane Robertson',  nationality: 'NZL', gender: 'M', races: 6,  pb: '24:01',   pbRace: 'Round the Bays',             href: null,                          active: false },
  { name: 'Nikki Wynd',      nationality: 'NZL', gender: 'W', races: 8,  pb: '9:02:14', pbRace: 'Tarawera Ultra',             href: null,                          active: false },
  { name: 'Tom Rangi',       nationality: 'NZL', gender: 'M', races: 5,  pb: '2:31:07', pbRace: 'Rotorua Marathon',           href: null,                          active: false },
  { name: 'Sarah Okonkwo',   nationality: 'NZL', gender: 'W', races: 6,  pb: '2:41:33', pbRace: 'Rotorua Marathon',           href: null,                          active: false },
];

export default function Athletes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? athletes.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.nationality.toLowerCase().includes(search.toLowerCase()))
    : athletes;

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-16">Archive · NZ competitive running</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>Athletes</h1>
            <div className="dimmed" style={{ fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Profiles with verified results on record
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="page">
          <div style={{ marginBottom: 24, maxWidth: 400 }}>
            <div className="label mb-8">Search</div>
            <input className="input" placeholder="Name or nationality…"
                   value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Athlete</th>
                <th>Nat.</th>
                <th style={{ width: 40 }}>M/W</th>
                <th style={{ width: 80 }}>Races</th>
                <th className="num">PB</th>
                <th>PB race</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={i} className="row"
                    style={{ cursor: a.href ? 'pointer' : 'default', opacity: a.active ? 1 : 0.65 }}
                    onClick={() => a.href && navigate(a.href)}>
                  <td>
                    <span className="serif" style={{ fontSize: 16 }}>{a.name}</span>
                  </td>
                  <td className="dimmed">{a.nationality}</td>
                  <td className="dimmed">{a.gender}</td>
                  <td className="dimmed">{a.races}</td>
                  <td className="num time serif" style={{ fontSize: 15 }}>{a.pb}</td>
                  <td className="dimmed" style={{ fontSize: 12 }}>{a.pbRace}</td>
                  <td style={{ textAlign: 'right' }}>
                    {a.href ? (
                      <span style={{ color: 'var(--meta)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
                        View →
                      </span>
                    ) : (
                      <span className="dimmed" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
                        Profile pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="dimmed" style={{ padding: '48px 0', fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              No athletes found for "{search}".
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
