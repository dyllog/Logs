import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const athletes = [
  { name: 'Michael Voss',          nationality: 'NZL', gender: 'M', races: 28, pb: '2:21:01', pbRace: 'Auckland Marathon 2025',          href: '/athletes/michael-voss',          active: true  },
  { name: 'Ciaran Faherty',        nationality: 'NZL', gender: 'M', races: 12, pb: '2:24:11', pbRace: 'Christchurch Marathon 2017',      href: '/athletes/ciaran-faherty',        active: true  },
  { name: 'Daniel Balchin',        nationality: 'NZL', gender: 'M', races: 17, pb: '2:19:55', pbRace: 'Auckland Marathon 2025',          href: '/athletes/daniel-balchin',        active: true  },
  { name: 'Jonathan Jackson',      nationality: 'NZL', gender: 'M', races: 19, pb: '2:26:38', pbRace: 'Auckland Marathon 2016',          href: '/athletes/jonathan-jackson',      active: true  },
  { name: 'Blair McWhirter',       nationality: 'NZL', gender: 'M', races: 14, pb: '2:25:24', pbRace: 'Christchurch Marathon 2012',      href: '/athletes/blair-mcwhirter',       active: true  },
  { name: 'Cameron Graves',        nationality: 'NZL', gender: 'M', races: 12, pb: '1:04:17', pbRace: 'Christchurch Half 2025',          href: '/athletes/cameron-graves',        active: true  },
  { name: 'Christopher Dryden',    nationality: 'NZL', gender: 'M', races: 13, pb: '1:04:11', pbRace: 'Christchurch Half 2025',          href: '/athletes/christopher-dryden',    active: true  },
  { name: 'Daniel Jones',          nationality: 'NZL', gender: 'M', races: 8,  pb: '2:20:00', pbRace: 'Auckland Marathon 2021',          href: '/athletes/daniel-jones',          active: true  },
  { name: 'Aaron Pulford',         nationality: 'NZL', gender: 'M', races: 11, pb: '1:06:11', pbRace: 'Christchurch Half 2013',          href: '/athletes/aaron-pulford',         active: true  },
  { name: 'Oska Inkster-Baynes',   nationality: 'NZL', gender: 'M', races: 8,  pb: '2:18:11', pbRace: 'Christchurch Marathon 2019',      href: '/athletes/oska-inkster-baynes',   active: true  },
  { name: 'Fabe Downs',            nationality: 'NZL', gender: 'M', races: 4,  pb: '2:26:34', pbRace: 'Auckland Marathon 2020',          href: '/athletes/fabe-downs',            active: true  },
  { name: 'Hiro Tanimoto',         nationality: 'NZL', gender: 'M', races: 4,  pb: '2:29:17', pbRace: "Hawke's Bay Marathon 2022",       href: '/athletes/hiro-tanimoto',         active: true  },
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
