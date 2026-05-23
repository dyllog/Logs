import { useNavigate, Link } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Marathon',           short: 'AUC', dist: '42.2 km', distId: 'mar'  as const, time: '3:44:13', sec: 13453, pos: 398,  total: 1619, cat: 'M 18–34', isPB: true  },
  { dateNum: 2024 +  2/12, year: 2024, race: 'Orewa Half Marathon',         short: 'ORE', dist: '21.1 km', distId: 'half' as const, time: '1:34:33', sec: 5673,  pos: 31,   total: 360,  cat: 'M Open', isPB: true  },
  { dateNum: 2024 +  3/12, year: 2024, race: 'Onehunga Half Marathon',      short: 'ONE', dist: '21.1 km', distId: 'half' as const, time: '1:46:23', sec: 6383,  pos: 69,   total: 314,  cat: 'M Open', isPB: false },
  { dateNum: 2024 +  4/12, year: 2024, race: 'Tamaki River 10 km',          short: 'TAM', dist: '10 km',   distId: 'tenk' as const, time: '1:08:18', sec: 4098,  pos: 76,   total: 138,  cat: 'M Open', isPB: true  },
  { dateNum: 2025 +  2/12, year: 2025, race: 'Orewa Half Marathon',         short: 'ORE', dist: '21.1 km', distId: 'half' as const, time: '1:40:15', sec: 6015,  pos: 96,   total: 482,  cat: 'M Open', isPB: false },
  { dateNum: 2025 +  3/12, year: 2025, race: 'Waterfront Half Marathon',    short: 'WF',  dist: '21.1 km', distId: 'half' as const, time: '1:34:52', sec: 5692,  pos: 309,  total: 2200, cat: 'M 30–39', isPB: false },
  { dateNum: 2025 +  4/12, year: 2025, race: 'Tamaki River Half Marathon',  short: 'TAM', dist: '21.1 km', distId: 'half' as const, time: '1:37:18', sec: 5838,  pos: 66,   total: 421,  cat: 'M Open', isPB: false },
  { dateNum: 2026 +  3/12, year: 2026, race: 'Waterfront Half Marathon',    short: 'WF',  dist: '21.1 km', distId: 'half' as const, time: '2:29:05', sec: 8945,  pos: 2610, total: 3006, cat: 'M 30–39', isPB: false },
];

const PBs = {
  mar:  { time: '3:44:13', sec: 13453, race: 'Auckland Marathon',    year: 2020 },
  half: { time: '1:34:33', sec: 5673,  race: 'Orewa Half Marathon',  year: 2024 },
  tenk: { time: '1:08:18', sec: 4098,  race: 'Tamaki River 10 km',   year: 2024 },
};

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function pctStr(pos: number, total: number): string {
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}

function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

function ProgressionChart() {
  const pts = [...RESULTS].filter(r => r.distId === 'half').sort((a, b) => a.dateNum - b.dateNum);
  if (pts.length === 0) return null;

  const W = 640, H = 180;
  const padL = 60, padR = 24, padT = 28, padB = 36;
  const cW = W - padL - padR, cH = H - padT - padB;

  const xMin = pts[0].dateNum - 0.5;
  const xMax = pts[pts.length - 1].dateNum + 0.5;
  const sMin = Math.min(...pts.map(p => p.sec));
  const sMax = Math.max(...pts.map(p => p.sec));
  const sPad = (sMax - sMin) * 0.2 || 300;
  const yLo = sMin - sPad, yHi = sMax + sPad;

  const cx = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * cW;
  const cy = (v: number) => padT + ((v - yLo) / (yHi - yLo)) * cH;
  const color = 'var(--on-dark)';

  const yTicks: number[] = [];
  for (let s = Math.floor(yLo / 600) * 600; s <= Math.ceil(yHi / 600) * 600; s += 600) {
    if (s >= yLo && s <= yHi) yTicks.push(s);
  }
  const xYears: number[] = [];
  for (let y = Math.ceil(xMin); y <= Math.floor(xMax); y++) xYears.push(y);

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx(p.dateNum).toFixed(1)},${cy(p.sec).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      {yTicks.map(s => {
        const yy = cy(s);
        const label = fmtSec(s).slice(0, -3);
        return (
          <g key={s}>
            <line x1={padL} x2={W-padR} y1={yy} y2={yy} stroke={color} strokeOpacity="0.1" strokeWidth="0.5" />
            <text x={padL-8} y={yy+3.5} textAnchor="end" fontSize="9" fontFamily="DM Mono,monospace" fill={color} fillOpacity="0.5" letterSpacing="0.04em">{label}</text>
          </g>
        );
      })}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
      {pts.map((p, i) => {
        const x = cx(p.dateNum), y = cy(p.sec);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={p.isPB ? 5 : 3} fill={p.isPB ? color : 'var(--surface-dark)'} stroke={color} strokeWidth="1.5" />
            <text x={x} y={y + (i < pts.length - 1 ? -10 : 14)} textAnchor="middle" fontSize="8.5" fontFamily="DM Mono,monospace" fill={color} fillOpacity={p.isPB ? 1 : 0.55} letterSpacing="0.04em">
              {p.isPB ? `${p.time} PB` : p.short}
            </text>
          </g>
        );
      })}
      <line x1={padL} x2={W-padR} y1={H-padB} y2={H-padB} stroke={color} strokeOpacity="0.15" strokeWidth="0.5" />
      {xYears.map(y => (
        <text key={y} x={cx(y)} y={H-padB+14} textAnchor="middle" fontSize="9" fontFamily="DM Mono,monospace" fill={color} fillOpacity="0.45" letterSpacing="0.1em">{y}</text>
      ))}
    </svg>
  );
}

export default function AthleteKnowles() {
  const navigate = useNavigate();
  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>SK</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Scott Knowles</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Nationality',  v: 'NZL' },
                  { l: 'Gender',       v: 'M' },
                  { l: 'Category',     v: 'M 30–39' },
                  { l: 'Races logged', v: String(RESULTS.length) },
                ].map(x => (
                  <div key={x.l}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 4 }}>{x.l}</div>
                    <div style={{ fontSize: 13, color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace" }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, background: 'var(--on-dark-rule)', border: '0.5px solid var(--on-dark-rule)' }} className="pb-grid">
              {[
                { dist: '42.2 km', pb: PBs.mar.time,  race: PBs.mar.race,  year: PBs.mar.year,  highlight: false },
                { dist: '21.1 km', pb: PBs.half.time, race: PBs.half.race, year: PBs.half.year, highlight: true  },
                { dist: '10 km',   pb: PBs.tenk.time, race: PBs.tenk.race, year: PBs.tenk.year, highlight: false },
              ].map((d, i) => (
                <div key={i} style={{ background: 'var(--surface-dark)', padding: '20px 20px 18px' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 12 }}>{d.dist}</div>
                  <div className="serif" style={{ fontSize: d.pb === '—' ? 28 : 32, lineHeight: 1, letterSpacing: '-0.02em', color: d.highlight ? 'var(--accent-good)' : d.pb === '—' ? 'var(--on-dark-meta)' : 'var(--on-dark)' }}>{d.pb}</div>
                  <div style={{ marginTop: 10, fontSize: 10, color: 'var(--on-dark-meta)', lineHeight: 1.4 }}>
                    {d.race}<br />
                    {d.year && <span style={{ color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}>{d.year}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                    onClick={() => navigate(`/compare?time=${PBs.half.time}&dist=21`)}>
              Open in Compare →
            </button>
            <Link to="/athletes/scott-knowles/report"
                  style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                  className="btn">
              View Report →
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="eyebrow mb-8">Progression · 21.1 km</div>
                <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>Tracked half marathon times</h2>
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '24px 20px 16px' }}>
                <ProgressionChart />
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--on-dark-meta)', fontStyle: 'italic', textAlign: 'right', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Orewa, Onehunga, Tamaki River and Waterfront half marathons
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 11, color: 'var(--meta)' }}>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  PB: <span style={{ color: 'var(--ink)' }}>{PBs.half.time}</span>
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  6 half marathon finishes · 2024–2026
                </span>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-16">At a glance</div>
              {[
                { label: 'Races logged',     val: '8',       sub: '1 marathon · 6 halves · 1 10 km' },
                { label: 'Half marathon PB', val: '1:34:33', sub: 'Orewa 2024 · top 9%' },
                { label: 'Marathon PB',      val: '3:44:13', sub: 'Auckland 2020 · top 25%' },
                { label: 'Active years',     val: '7',       sub: '2020–2026 · AUC · WF · ORE · ONE · TAM' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px 0', borderBottom: '0.5px solid var(--rule-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div>
                    <div className="label mb-4">{s.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--meta)', marginTop: 2, lineHeight: 1.4 }}>{s.sub}</div>
                  </div>
                  <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em', flexShrink: 0 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Race history · all distances</div>
              <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>
                {RESULTS.length} finishes on record
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12 }}>2020–2026 · AUC · WF · ORE · ONE · TAM</div>
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
                        const d = r.dist === '42.2 km' ? '42' : r.dist === '21.1 km' ? '21' : '10';
                        if (r.race === 'Auckland Marathon') navigate(`/races/auckland-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Waterfront')) navigate(`/races/waterfront-half-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Orewa')) navigate(`/races/orewa-half-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Onehunga')) navigate(`/races/onehunga-half-marathon?year=${r.year}&dist=${d}`);
                        else if (r.race.includes('Tamaki')) navigate(`/races/tamaki-river-half-marathon?year=${r.year}&dist=${d}`);
                      }}>
                    <td className="dimmed">{r.year}</td>
                    <td><span className="serif" style={{ fontSize: 15 }}>{r.race}</span></td>
                    <td className="dimmed">{r.dist}</td>
                    <td className="num time" style={{ color: r.isPB ? 'var(--accent-good)' : 'inherit', fontWeight: r.isPB ? 500 : 400 }}>{r.time}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pos ${r.pos === 1 ? 'pos-1' : ''}`} style={{ color: r.pos <= 3 ? 'var(--ink)' : 'var(--meta)' }}>{ordSuffix(r.pos)}</span>
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
            Percentile computed across all finishers in that event and year. Results sourced from Auckland Marathon, Waterfront Half Marathon, and Run21 series certified timings.
          </div>
        </div>
      </section>
    </main>
  );
}
