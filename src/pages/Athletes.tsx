import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ATHLETE_REGISTRY } from '@/data/athleteRegistry';

export default function Athletes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? ATHLETE_REGISTRY.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.nationality.toLowerCase().includes(search.toLowerCase()) ||
        (a.aliases ?? []).some(alias => alias.toLowerCase().includes(search.toLowerCase()))
      )
    : ATHLETE_REGISTRY;

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-16">Archive · NZ competitive running</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>Athletes</h1>
            <div className="dimmed" style={{ fontSize: 13, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {ATHLETE_REGISTRY.length} profiles with verified results on record
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

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th className="hide-mobile">Nat.</th>
                  <th className="hide-mobile" style={{ width: 40 }}>M/W</th>
                  <th className="hide-mobile" style={{ width: 80 }}>Races</th>
                  <th className="num">PB</th>
                  <th>PB race</th>
                  <th className="hide-mobile" style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={i} className="row"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/athletes/${a.slug}`)}>
                    <td>
                      <span className="serif" style={{ fontSize: 16 }}>{a.name}</span>
                    </td>
                    <td className="dimmed hide-mobile">{a.nationality}</td>
                    <td className="dimmed hide-mobile">{a.gender}</td>
                    <td className="dimmed hide-mobile">{a.racesLogged}</td>
                    <td className="num time serif" style={{ fontSize: 15 }}>{a.pbTime}</td>
                    <td className="dimmed" style={{ fontSize: 12 }}>{a.pbRace}</td>
                    <td className="hide-mobile" style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--meta)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
                        View →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
