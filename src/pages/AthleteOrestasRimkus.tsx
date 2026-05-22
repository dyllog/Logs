import { useNavigate, Link } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2018 + 5/12,  year: 2018, race: 'Christchurch Marathon',      short: 'CHC',     dist: '42.2 km', distId: 'mar' as const, time: '2:51:02', sec: 10262, pos: 19, total: 680,  cat: 'M 20–39', isPB: false },
  { dateNum: 2019 + 5/12,  year: 2019, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:16:33', sec: 4593,  pos: 16, total: 2600, cat: 'M 20–39', isPB: false },
  { dateNum: 2019 + 11/12, year: 2019, race: 'Queenstown Marathon',        short: 'QT',      dist: '42.2 km', distId: 'mar' as const, time: '2:45:11', sec: 9911,  pos: 7,  total: 2100, cat: 'M 20–29', isPB: false },
  { dateNum: 2020 + 11/12, year: 2020, race: 'Queenstown Marathon',        short: 'QT',      dist: '42.2 km', distId: 'mar' as const, time: '2:44:31', sec: 9871,  pos: 5,  total: 1200, cat: 'M 20–29', isPB: false },
  { dateNum: 2021 + 5/12,  year: 2021, race: 'Christchurch Marathon',      short: 'CHC',     dist: '42.2 km', distId: 'mar' as const, time: '2:37:34', sec: 9454,  pos: 11, total: 600,  cat: 'M 20–39', isPB: false },
  { dateNum: 2023 + 11/12, year: 2023, race: 'Queenstown Marathon',        short: 'QT',      dist: '42.2 km', distId: 'mar' as const, time: '2:38:06', sec: 9486,  pos: 3,  total: 2400, cat: 'M 30–39', isPB: false },
  { dateNum: 2024 + 11/12, year: 2024, race: 'Queenstown Marathon',        short: 'QT',      dist: '42.2 km', distId: 'mar' as const, time: '2:36:27', sec: 9387,  pos: 2,  total: 2522, cat: 'M 30–34', isPB: true  },
  { dateNum: 2025 + 5/12,  year: 2025, race: 'Christchurch Marathon',      short: 'CHC',     dist: '42.2 km', distId: 'mar' as const, time: '2:43:17', sec: 9797,  pos: 27, total: 800,  cat: 'M 20–39', isPB: false },
];

const PBs = {
  mar: { time: '2:36:27', sec: 9387, race: 'Queenstown Marathon', year: 2024 },
};

function pctStr(pos: number, total: number): string {
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}
function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

export default function AthleteOrestasRimkus() {
  const navigate = useNavigate();
  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>OR</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Orestas Rimkus</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Nationality',  v: 'NZL' },
                  { l: 'Gender',       v: 'M' },
                  { l: 'Category',     v: 'Open' },
                  { l: 'Races logged', v: String(RESULTS.length) },
                ].map(x => (
                  <div key={x.l}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 4 }}>{x.l}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, background: 'var(--on-dark-rule)', border: '0.5px solid var(--on-dark-rule)' }} className="pb-grid">
              <div style={{ background: 'var(--surface-dark)', padding: '20px 20px 18px' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 12 }}>42.2 km</div>
                <div className="serif" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--accent-good)' }}>{PBs.mar.time}</div>
                <div style={{ marginTop: 10, fontSize: 10, color: 'var(--on-dark-meta)', lineHeight: 1.4 }}>
                  {PBs.mar.race}<br />
                  <span style={{ color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}>{PBs.mar.year}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                    onClick={() => navigate(`/compare?time=${PBs.mar.time}&dist=42`)}>
              Open in Compare →
            </button>
            <Link to="/athletes/orestas-rimkus/report" className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}>
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
            <div className="dimmed" style={{ fontSize: 12 }}>2018–2025 · QT · CHC</div>
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
                        if (r.race.includes('Queenstown')) navigate(`/races/queenstown-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Christchurch')) navigate(`/races/christchurch-marathon?year=${r.year}&dist=${d}`);
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
