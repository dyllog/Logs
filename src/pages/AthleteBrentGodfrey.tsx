import { useNavigate, Link } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2016 + 10/12, year: 2016, race: 'Auckland Marathon',       short: 'AKL',     dist: '42.2 km', distId: 'mar'  as const, time: '2:47:16', sec: 10036, pos: 15, total: 1630, cat: 'M 18–34', isPB: false },
  { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Half Marathon',   short: 'AKL Half',dist: '21.1 km', distId: 'half' as const, time: '1:22:55', sec: 4975,  pos: 39, total: 5572, cat: 'M 18–34', isPB: false },
  { dateNum: 2019 + 6/12,  year: 2019, race: 'Kerikeri Half Marathon',   short: 'KER Half',dist: '21.1 km', distId: 'half' as const, time: '1:18:20', sec: 4700,  pos: 12, total:  838, cat: 'M 35–39', isPB: false },
  { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',   short: 'AKL Half',dist: '21.1 km', distId: 'half' as const, time: '1:20:12', sec: 4812,  pos: 24, total: 5204, cat: 'M 35–39', isPB: false },
  { dateNum: 2020 + 4/12,  year: 2020, race: 'Devonport Half Marathon',  short: 'DEV Half',dist: '21.1 km', distId: 'half' as const, time: '1:20:17', sec: 4817,  pos: 4,  total: 598,  cat: 'M 30–39', isPB: false },
  { dateNum: 2021 + 3/12,  year: 2021, race: 'Waterfront Half Marathon', short: 'WF Half', dist: '21.1 km', distId: 'half' as const, time: '1:16:16', sec: 4576,  pos: 7,  total: 1611, cat: 'M 30–39', isPB: false },
  { dateNum: 2021 + 4/12,  year: 2021, race: 'Rotorua Marathon',         short: 'ROT',     dist: '42.2 km', distId: 'mar'  as const, time: '2:47:45', sec: 10065, pos: 11, total: 746,  cat: 'M 35–39', isPB: false },
  { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Marathon',        short: 'AKL',     dist: '42.2 km', distId: 'mar'  as const, time: '2:44:25', sec: 9865,  pos: 6,  total: 870,  cat: 'M 35–39', isPB: false },
  { dateNum: 2022 + 3/12,  year: 2022, race: 'Waterfront Half Marathon', short: 'WF Half', dist: '21.1 km', distId: 'half' as const, time: '1:15:50', sec: 4550,  pos: 5,  total: 848,  cat: 'M 30–39', isPB: false },
  { dateNum: 2023 + 3/12,  year: 2023, race: 'Waterfront Half Marathon', short: 'WF Half', dist: '21.1 km', distId: 'half' as const, time: '1:16:02', sec: 4562,  pos: 14, total: 1414, cat: 'M 30–39', isPB: false },
  { dateNum: 2023 + 4/12,  year: 2023, race: 'Rotorua Marathon',         short: 'ROT',     dist: '42.2 km', distId: 'mar'  as const, time: '2:40:56', sec: 9656,  pos: 6,  total: 796,  cat: 'M 35–39', isPB: false },
  { dateNum: 2023 + 10/12, year: 2023, race: 'Auckland Marathon',        short: 'AKL',     dist: '42.2 km', distId: 'mar'  as const, time: '2:39:17', sec: 9557,  pos: 10, total: 1765, cat: 'M 35–39', isPB: false },
  { dateNum: 2024 + 3/12,  year: 2024, race: 'Waterfront Half Marathon', short: 'WF Half', dist: '21.1 km', distId: 'half' as const, time: '1:14:49', sec: 4489,  pos: 8,  total: 1822, cat: 'M 40–49', isPB: false },
  { dateNum: 2024 + 4/12,  year: 2024, race: 'Rotorua Marathon',         short: 'ROT',     dist: '42.2 km', distId: 'mar'  as const, time: '2:39:14', sec: 9554,  pos: 5,  total: 1151, cat: 'M 40–44', isPB: false },
  { dateNum: 2024 + 10/12, year: 2024, race: 'Auckland Marathon',        short: 'AKL',     dist: '42.2 km', distId: 'mar'  as const, time: '2:38:32', sec: 9512,  pos: 13, total: 2439, cat: 'M 40–44', isPB: false },
  { dateNum: 2025 + 3/12,  year: 2025, race: 'Waterfront Half Marathon', short: 'WF Half', dist: '21.1 km', distId: 'half' as const, time: '1:14:35', sec: 4475,  pos: 10, total: 2200, cat: 'M 40–49', isPB: true  },
  { dateNum: 2025 + 6/12,  year: 2025, race: 'Kerikeri Half Marathon',   short: 'KER Half',dist: '21.1 km', distId: 'half' as const, time: '1:15:11', sec: 4511,  pos: 5,  total:  807, cat: 'M 40–44', isPB: false },
  { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Marathon',        short: 'AKL',     dist: '42.2 km', distId: 'mar'  as const, time: '2:38:22', sec: 9502,  pos: 16, total: 2775, cat: 'M 40–44', isPB: true  },
  { dateNum: 2026 + 3/12,  year: 2026, race: 'Waterfront Half Marathon', short: 'WF Half', dist: '21.1 km', distId: 'half' as const, time: '1:17:35', sec: 4655,  pos: 24, total: 3006, cat: 'M 40–49', isPB: false },
];

const PBs = {
  mar:  { time: '2:38:22', sec: 9502, race: 'Auckland Marathon',       year: 2025 },
  half: { time: '1:14:35', sec: 4475, race: 'Waterfront Half Marathon', year: 2025 },
};

function pctStr(pos: number, total: number): string {
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}
function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

export default function AthleteBrentGodfrey() {
  const navigate = useNavigate();
  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>BG</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Brent Godfrey</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Nationality',  v: 'NZL' },
                  { l: 'Gender',       v: 'M' },
                  { l: 'Category',     v: 'M40' },
                  { l: 'Races logged', v: String(RESULTS.length) },
                ].map(x => (
                  <div key={x.l}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 4 }}>{x.l}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: 'var(--on-dark-rule)', border: '0.5px solid var(--on-dark-rule)' }} className="pb-grid">
              {[
                { dist: '42.2 km', pb: PBs.mar.time,  race: PBs.mar.race,  year: PBs.mar.year,  highlight: true  },
                { dist: '21.1 km', pb: PBs.half.time, race: PBs.half.race, year: PBs.half.year, highlight: false },
              ].map((d, i) => (
                <div key={i} style={{ background: 'var(--surface-dark)', padding: '20px 20px 18px' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 12 }}>{d.dist}</div>
                  <div className="serif" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em', color: d.highlight ? 'var(--accent-good)' : 'var(--on-dark)' }}>{d.pb}</div>
                  <div style={{ marginTop: 10, fontSize: 10, color: 'var(--on-dark-meta)', lineHeight: 1.4 }}>
                    {d.race}<br />
                    <span style={{ color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}>{d.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                    onClick={() => navigate(`/compare?time=${PBs.mar.time}&dist=42`)}>
              Open in Compare →
            </button>
            <Link to="/athletes/brent-godfrey/report" className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}>
              View Report →
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race history · all distances</div>
              <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>{RESULTS.length} finishes on record</h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12 }}>2016–2026 · AKL · WF · ROT · DEV</div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Year</th><th>Race</th><th>Dist</th>
                  <th className="num">Time</th>
                  <th style={{ textAlign: 'center', width: 60 }}>Overall</th>
                  <th className="num" style={{ width: 70 }}>Percentile</th>
                  <th>Category</th><th></th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r, i) => (
                  <tr key={i} className="row"
                      onClick={() => {
                        const d = r.dist === '42.2 km' ? '42' : '21';
                        if (r.race.includes('Auckland Marathon') || r.race === 'Auckland Marathon') navigate(`/races/auckland-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Auckland Half')) navigate(`/races/auckland-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Waterfront')) navigate(`/races/waterfront-half-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Rotorua')) navigate(`/races/rotorua-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Devonport')) navigate(`/races/devonport-half-marathon?year=${r.year}&dist=${d}`);
                      }}>
                    <td className="dimmed">{r.year}</td>
                    <td><span className="serif" style={{ fontSize: 15 }}>{r.race}</span></td>
                    <td className="dimmed">{r.dist}</td>
                    <td className="num time" style={{ color: r.isPB ? 'var(--accent-good)' : 'inherit', fontWeight: r.isPB ? 500 : 400 }}>{r.time}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="pos" style={{ color: r.pos <= 3 ? 'var(--ink)' : 'var(--meta)' }}>{ordSuffix(r.pos)}</span>
                    </td>
                    <td className="num dimmed">{pctStr(r.pos, r.total)}</td>
                    <td className="dimmed" style={{ fontSize: 12 }}>{r.cat}</td>
                    <td style={{ textAlign: 'right' }}>
                      {r.isPB && <span style={{ color: 'var(--accent-good)', border: '0.5px solid var(--accent-good)', padding: '2px 6px', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 999, fontFamily: "'DM Mono', monospace" }}>PB</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
            Percentile computed across all finishers in that event and year.
          </div>
        </div>
      </section>
    </main>
  );
}
