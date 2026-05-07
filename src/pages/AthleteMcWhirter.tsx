import { useNavigate } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2007 + 6/12,  year: 2007, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar' as const, time: '2:48:07', sec: 10087, pos: 9,  total: 350,  cat: 'M 20–39', isPB: false },
  { dateNum: 2011 + 6/12,  year: 2011, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar' as const, time: '2:34:30', sec: 9270,  pos: 3,  total: 317,  cat: 'M 20–39', isPB: false },
  { dateNum: 2012 + 6/12,  year: 2012, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar' as const, time: '2:25:24', sec: 8724,  pos: 3,  total: 367,  cat: 'M 20–39', isPB: true  },
  { dateNum: 2017 + 10/12, year: 2017, race: 'Auckland Marathon',     short: 'AUC', dist: '42.2 km', distId: 'mar' as const, time: '2:25:59', sec: 8759,  pos: 3,  total: 1565, cat: 'M 35–39', isPB: false },
  { dateNum: 2017 + 11/12, year: 2017, race: 'Queenstown Marathon',   short: 'QT',  dist: '42.2 km', distId: 'mar' as const, time: '2:32:45', sec: 9165,  pos: 2,  total: 1556, cat: 'M 30–39', isPB: false },
  { dateNum: 2018 + 4/12,  year: 2018, race: 'Rotorua Marathon',      short: 'ROT', dist: '42.2 km', distId: 'mar' as const, time: '2:28:59', sec: 8939,  pos: 1,  total: 940,  cat: 'M 35–39', isPB: false },
  { dateNum: 2018 + 6/12,  year: 2018, race: 'Christchurch Half',     short: 'CHC½',dist: '21.1 km', distId: 'half' as const, time: '1:08:50', sec: 4130,  pos: 7,  total: 0,    cat: 'M 20–39', isPB: false },
  { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Marathon',     short: 'AUC', dist: '42.2 km', distId: 'mar' as const, time: '2:27:48', sec: 8868,  pos: 5,  total: 1653, cat: 'M 35–39', isPB: false },
  { dateNum: 2019 + 4/12,  year: 2019, race: 'Rotorua Marathon',      short: 'ROT', dist: '42.2 km', distId: 'mar' as const, time: '2:26:40', sec: 8800,  pos: 2,  total: 720,  cat: 'M 35–39', isPB: false },
  { dateNum: 2019 + 6/12,  year: 2019, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar' as const, time: '2:36:34', sec: 9394,  pos: 8,  total: 476,  cat: 'M 20–39', isPB: false },
  { dateNum: 2020 + 4/12,  year: 2020, race: 'Rotorua Marathon',      short: 'ROT', dist: '42.2 km', distId: 'mar' as const, time: '2:33:48', sec: 9228,  pos: 2,  total: 446,  cat: 'M 35–39', isPB: false },
  { dateNum: 2021 + 6/12,  year: 2021, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar' as const, time: '2:29:30', sec: 8970,  pos: 4,  total: 478,  cat: 'M 20–39', isPB: false },
  { dateNum: 2025 + 6/12,  year: 2025, race: 'Christchurch Marathon', short: 'CHC', dist: '42.2 km', distId: 'mar' as const, time: '2:29:08', sec: 8948,  pos: 4,  total: 957,  cat: 'M 40–49', isPB: false },
  { dateNum: 2025 + 11/12, year: 2025, race: 'Queenstown Marathon',   short: 'QT',  dist: '42.2 km', distId: 'mar' as const, time: '2:32:10', sec: 9130,  pos: 3,  total: 2929, cat: 'M 40–44', isPB: false },
];

const PBs = {
  mar:  { time: '2:25:24', sec: 8724, race: 'Christchurch Marathon', year: 2012 },
  half: { time: '1:08:50', sec: 4130, race: 'Christchurch Half',     year: 2018 },
};

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

function pctStr(pos: number, total: number): string {
  if (!total) return '—';
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}

function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

function ProgressionChart() {
  const pts = [...RESULTS].filter(r => r.distId === 'mar').sort((a, b) => a.dateNum - b.dateNum);
  if (pts.length === 0) return null;

  const W = 640, H = 180;
  const padL = 60, padR = 24, padT = 28, padB = 36;
  const cW = W - padL - padR, cH = H - padT - padB;

  const xMin = pts[0].dateNum - 0.5;
  const xMax = pts[pts.length - 1].dateNum + 0.5;
  const sMin = Math.min(...pts.map(p => p.sec));
  const sMax = Math.max(...pts.map(p => p.sec));
  const sPad = (sMax - sMin) * 0.12 || 60;
  const yLo = sMin - sPad, yHi = sMax + sPad;

  const cx = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * cW;
  const cy = (v: number) => padT + ((yHi - v) / (yHi - yLo)) * cH;
  const color = 'var(--on-dark)';

  const yTicks: number[] = [];
  for (let s = Math.floor(yLo / 60) * 60; s <= Math.ceil(yHi / 60) * 60; s += 300) {
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

export default function AthleteMcWhirter() {
  const navigate = useNavigate();
  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);
  const marResults = RESULTS.filter(r => r.distId === 'mar');

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>BM</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Blair McWhirter</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Nationality',  v: 'NZL' },
                  { l: 'Gender',       v: 'M' },
                  { l: 'Category',     v: 'Masters (M40)' },
                  { l: 'Races logged', v: '14' },
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
                { dist: '42.2 km', pb: PBs.mar.time,  race: 'Christchurch Marathon', year: PBs.mar.year,  highlight: true  },
                { dist: '21.1 km', pb: PBs.half.time, race: 'Christchurch Half',      year: PBs.half.year, highlight: false },
                { dist: '10 km',   pb: '—',            race: 'not on record',          year: null,          highlight: false },
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

          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                    onClick={() => navigate(`/compare?time=${PBs.mar.time}&dist=42`)}>
              Open in Compare →
            </button>
            <span style={{ fontSize: 11, color: 'var(--on-dark-meta)', fontStyle: 'italic', fontFamily: "'DM Serif Display', Georgia, serif" }}>
              pre-fills your PB to stack against any year
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }} className="overview-grid">
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="eyebrow mb-8">Progression · 42.2 km</div>
                <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>Tracked marathon times</h2>
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '24px 20px 16px' }}>
                <ProgressionChart />
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--on-dark-meta)', fontStyle: 'italic', textAlign: 'right', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  CHC (Jul), ROT (May), AUC (Oct), QT (Nov) shown at separate dates
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 11, color: 'var(--meta)' }}>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  PB: <span style={{ color: 'var(--ink)' }}>{PBs.mar.time}</span>
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  {marResults.length} marathon finishes · 2007–2025
                </span>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-16">At a glance</div>
              {[
                { label: 'Races logged',     val: '14',      sub: '13 marathons · 1 half' },
                { label: 'Marathon PB',      val: '2:25:24', sub: 'Christchurch 2012 · 3rd overall' },
                { label: 'Best overall pos', val: '1st',     sub: '1 career win · Rotorua 2018' },
                { label: 'Active years',     val: '19',      sub: '2007–2025 · CHC · AUC · ROT · QT' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px 0', borderBottom: '0.5px solid var(--rule-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div>
                    <div className="label mb-4">{s.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--meta)', marginTop: 2, lineHeight: 1.4 }}>{s.sub}</div>
                  </div>
                  <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em', flexShrink: 0 }}>{s.val}</div>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <div className="label mb-12">Marathon times</div>
                {[...marResults].sort((a,b) => b.dateNum - a.dateNum).map((r, i, arr) => {
                  const pbSec = Math.min(...arr.map(x => x.sec));
                  const width = 100 - ((r.sec - pbSec) / (Math.max(...arr.map(x=>x.sec)) - pbSec + 1)) * 80;
                  return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10, color: 'var(--meta)', fontFamily: "'DM Mono', monospace" }}>
                        <span>{r.short} {r.year}</span>
                        <span style={{ color: r.isPB ? 'var(--accent-good)' : 'var(--ink)' }}>{r.time}</span>
                      </div>
                      <div style={{ height: 2, background: 'var(--rule-soft)', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${width}%`, background: r.isPB ? 'var(--accent-good)' : 'var(--rule)', transition: 'width 400ms ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
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
            <div className="dimmed" style={{ fontSize: 12 }}>2007–2025 · CHC · AUC · ROT · QT</div>
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
                        if (r.race === 'Auckland Marathon') navigate('/races/auckland-marathon');
                        else if (r.race === 'Christchurch Marathon' || r.race === 'Christchurch Half') navigate('/races/christchurch-marathon');
                        else if (r.race === 'Rotorua Marathon') navigate('/races/rotorua-marathon');
                        else if (r.race.includes('Queenstown')) navigate('/races/queenstown-marathon');
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
                      {r.pos === 1 && !r.isPB && <span style={{ color: 'var(--ink)', border: '0.5px solid var(--rule)', padding: '2px 8px', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 999, fontFamily: "'DM Mono', monospace" }}>Win</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
            Percentile computed across all finishers in that event and year. Results sourced from Auckland, Christchurch, Rotorua and Queenstown Marathon certified timings.
          </div>
        </div>
      </section>
    </main>
  );
}
