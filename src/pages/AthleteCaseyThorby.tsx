import { useNavigate, Link } from 'react-router-dom';

// Note: a Casey Thorby M 45-49 appears in AKL Half 2022 (1:10:26) — different person, excluded.
const RESULTS = [
  { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:23:44', sec: 5024, pos: 46, total: 5572, cat: 'M Open',  isPB: false },
  { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:15:24', sec: 4524, pos: 11, total: 5204, cat: 'M Open',  isPB: false },
  { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:11:47', sec: 4307, pos: 5,  total: 4628, cat: 'M 18–34', isPB: false },
  { dateNum: 2021 + 3/12,  year: 2021, race: 'Waterfront Half Marathon',   short: 'WF Half',  dist: '21.1 km', distId: 'half' as const, time: '1:10:07', sec: 4207, pos: 2,  total: 1611, cat: 'M 18–19', isPB: false },
  { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:09:59', sec: 4199, pos: 3,  total: 2492, cat: 'M 18–34', isPB: false },
  { dateNum: 2024 + 10/12, year: 2024, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:07:12', sec: 4032, pos: 4,  total: 6161, cat: 'M 20–24', isPB: true  },
  { dateNum: 2025 + 4/12,  year: 2025, race: 'Rotorua Half Marathon',      short: 'ROT Half', dist: '21.1 km', distId: 'half' as const, time: '1:11:38', sec: 4298, pos: 1,  total: 1100, cat: 'M 20–39', isPB: false },
  { dateNum: 2025 + 5/12,  year: 2025, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:07:16', sec: 4036, pos: 12, total: 2858, cat: 'M 20–39', isPB: false },
];

const PBs = {
  half: { time: '1:07:12', sec: 4032, race: 'Auckland Half Marathon', year: 2024 },
};

function pctStr(pos: number, total: number): string {
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}
function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

export default function AthleteCaseyThorby() {
  const navigate = useNavigate();
  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>CT</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Casey Thorby</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[{ l: 'Nationality', v: 'NZL' }, { l: 'Gender', v: 'M' }, { l: 'Category', v: 'Open' }, { l: 'Races logged', v: String(RESULTS.length) }].map(x => (
                  <div key={x.l}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 4 }}>{x.l}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, background: 'var(--on-dark-rule)', border: '0.5px solid var(--on-dark-rule)' }} className="pb-grid">
              <div style={{ background: 'var(--surface-dark)', padding: '20px 20px 18px' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 12 }}>21.1 km</div>
                <div className="serif" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--accent-good)' }}>{PBs.half.time}</div>
                <div style={{ marginTop: 10, fontSize: 10, color: 'var(--on-dark-meta)', lineHeight: 1.4 }}>
                  {PBs.half.race}<br />
                  <span style={{ color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}>{PBs.half.year}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                    onClick={() => navigate(`/compare?time=${PBs.half.time}&dist=21`)}>
              Open in Compare →
            </button>
            <Link to="/athletes/casey-thorby/report" className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}>
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
            <div className="dimmed" style={{ fontSize: 12 }}>2018–2025 · AKL · WF · ROT · CHC</div>
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
                        const d = '21';
                        if (r.race.includes('Auckland')) navigate(`/races/auckland-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Waterfront')) navigate(`/races/waterfront-half-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Rotorua')) navigate(`/races/rotorua-marathon?year=${r.year}&dist=${d}`);
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
                      {r.isPB && <span style={{ color: 'var(--accent-good)', border: '0.5px solid var(--accent-good)', padding: '2px 8px', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 999, fontFamily: "'DM Mono', monospace" }}>PB</span>}
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
