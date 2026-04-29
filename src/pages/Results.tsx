import { useState } from 'react';

const allResults = [
  { event: 'Auckland Marathon',     year: 2025, distance: '42.2 km', pos: 1,  name: 'Daniel Balchin',    category: 'M Elite',  club: '—',                       time: '2:19:55' },
  { event: 'Auckland Marathon',     year: 2025, distance: '42.2 km', pos: 2,  name: 'Michael Voss',      category: 'M Elite',  club: '—',                       time: '2:21:01' },
  { event: 'Auckland Marathon',     year: 2025, distance: '42.2 km', pos: 3,  name: 'Cam Graves',        category: 'M Elite',  club: '—',                       time: '2:21:04' },
  { event: 'Auckland Marathon',     year: 2025, distance: '42.2 km', pos: 13, name: 'Brigid Dennehy',    category: 'W Elite',  club: '—',                       time: '2:38:10' },
  { event: 'Christchurch Marathon', year: 2026, distance: '42.2 km', pos: 1,  name: 'Oska Inkster-Baynes', category: 'M 20–39', club: '—',                     time: '2:20:20' },
  { event: 'Christchurch Marathon', year: 2026, distance: '42.2 km', pos: 15, name: 'Becky Aitkenhead',  category: 'W 20–39', club: '—',                       time: '2:38:14' },
  { event: 'Christchurch Half',     year: 2026, distance: '21.1 km', pos: 1,  name: 'Toby Gualter',      category: 'M 20–39', club: '—',                       time: '1:03:15' },
  { event: 'Rotorua Marathon',      year: 2025, distance: '42.2 km', pos: 1,  name: 'Daniel Balchin',    category: 'M 20–39', club: '—',                       time: '2:24:41' },
  { event: 'Auckland Half',         year: 2025, distance: '21.1 km', pos: 1,  name: 'Toby Gualter',      category: 'M 20–39', club: '—',                       time: '1:03:30' },
];

export default function Results() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? allResults.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.event.toLowerCase().includes(search.toLowerCase())
      )
    : allResults;

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-16">Archive · NZ competitive running</div>
          <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>Results</h1>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="page">
          <div style={{ marginBottom: 28, maxWidth: 420 }}>
            <div className="label mb-8">Search · name or event</div>
            <input className="input" placeholder="e.g. Balchin · Auckland · Rotorua"
                   value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Event</th>
                  <th style={{ width: 60 }}>Year</th>
                  <th style={{ width: 80 }}>Dist.</th>
                  <th style={{ width: 50 }}>Pos</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Club</th>
                  <th className="num">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className="row">
                    <td><span className="serif" style={{ fontSize: 15 }}>{row.event}</span></td>
                    <td className="dimmed">{row.year}</td>
                    <td className="dimmed">{row.distance}</td>
                    <td className={`pos ${row.pos === 1 ? 'pos-1' : ''}`}>{row.pos}</td>
                    <td>{row.name}</td>
                    <td className="dimmed">{row.category}</td>
                    <td className="dimmed">{row.club}</td>
                    <td className="num time">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="dimmed" style={{ fontSize: 13, paddingTop: 40, fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              No results found for "{search}".
            </div>
          )}

          <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
            Showing recent top finishers. Use the individual race pages for full searchable results across all finishers.
          </div>
        </div>
      </section>
    </main>
  );
}
