import { useNavigate, Link } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2009 + 5/12,  year: 2009, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:09:59', sec: 4199, pos: 8,  total: 1020, cat: 'M 20–39', isPB: false },
  { dateNum: 2010 + 5/12,  year: 2010, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:06:16', sec: 3976, pos: 5,  total: 1200, cat: 'M 20–39', isPB: true  },
  { dateNum: 2011 + 5/12,  year: 2011, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:09:00', sec: 4140, pos: 2,  total: 1400, cat: 'M 20–39', isPB: false },
  { dateNum: 2012 + 5/12,  year: 2012, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:09:46', sec: 4186, pos: 7,  total: 1700, cat: 'M 20–39', isPB: false },
  { dateNum: 2013 + 5/12,  year: 2013, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:09:02', sec: 4142, pos: 11, total: 1948, cat: 'M 20–39', isPB: false },
  { dateNum: 2015 + 5/12,  year: 2015, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:07:27', sec: 4047, pos: 8,  total: 2300, cat: 'M 20–39', isPB: false },
  { dateNum: 2015 + 10/12, year: 2015, race: 'Auckland Marathon',          short: 'AKL',     dist: '42.2 km', distId: 'mar'  as const, time: '2:27:54', sec: 8874, pos: 3,  total: 1580, cat: 'M 18–34', isPB: false },
  { dateNum: 2016 + 5/12,  year: 2016, race: 'Christchurch Marathon',      short: 'CHC',     dist: '42.2 km', distId: 'mar'  as const, time: '2:24:51', sec: 8691, pos: 1,  total: 610,  cat: 'M 20–39', isPB: true  },
  { dateNum: 2018 + 5/12,  year: 2018, race: 'Christchurch Marathon',      short: 'CHC',     dist: '42.2 km', distId: 'mar'  as const, time: '2:30:43', sec: 9043, pos: 2,  total: 680,  cat: 'M 20–39', isPB: false },
  { dateNum: 2023 + 5/12,  year: 2023, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:10:43', sec: 4243, pos: 7,  total: 3000, cat: 'M 40–49', isPB: false },
];

const PBs = {
  mar:  { time: '2:24:51', sec: 8691, race: 'Christchurch Marathon',      year: 2016 },
  half: { time: '1:06:16', sec: 3976, race: 'Christchurch Half Marathon', year: 2010 },
};

function pctStr(pos: number, total: number): string {
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}
function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

export default function AthleteDougalThorburn() {
  const navigate = useNavigate();
  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>DT</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Dougal Thorburn</h1>
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
            <Link to="/athletes/dougal-thorburn/report" className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}>
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
            <div className="dimmed" style={{ fontSize: 12 }}>2009–2023 · CHC · AKL</div>
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
                        if (r.race.includes('Auckland')) navigate(`/races/auckland-marathon?year=${r.year}&dist=${d}`);
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
