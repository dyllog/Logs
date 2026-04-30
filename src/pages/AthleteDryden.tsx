import { useNavigate } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2017 + 5/12,  year: 2017, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', time: '1:10:22', sec: 4222, pos: 7,  total: 1579, cat: 'M 20–39', isPB: false },
  { dateNum: 2019 + 5/12,  year: 2019, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', time: '1:07:27', sec: 4047, pos: 3,  total: 1504, cat: 'M 20–39', isPB: false },
  { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', time: '1:07:39', sec: 4059, pos: 4,  total: 5204, cat: 'M 20–39', isPB: false },
  { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', time: '1:07:30', sec: 4050, pos: 2,  total: 4628, cat: 'M 20–39', isPB: false },
  { dateNum: 2021 + 5/12,  year: 2021, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', time: '1:05:49', sec: 3949, pos: 4,  total: 1332, cat: 'M 20–39', isPB: false },
  { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', time: '1:09:24', sec: 4164, pos: 2,  total: 2492, cat: 'M 20–39', isPB: false },
  { dateNum: 2022 + 10/12, year: 2022, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', time: '1:08:28', sec: 4108, pos: 5,  total: 3988, cat: 'M 20–39', isPB: false },
  { dateNum: 2023 + 5/12,  year: 2023, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', time: '1:05:20', sec: 3920, pos: 3,  total: 1544, cat: 'M 20–39', isPB: false },
  { dateNum: 2024 + 5/12,  year: 2024, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', time: '1:05:10', sec: 3910, pos: 2,  total: 2172, cat: 'M 20–39', isPB: false },
  { dateNum: 2025 + 5/12,  year: 2025, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', time: '1:04:11', sec: 3851, pos: 4,  total: 2858, cat: 'M 20–39', isPB: true  },
  { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Half Marathon',     short: 'AKL Half', dist: '21.1 km', time: '1:05:24', sec: 3924, pos: 1,  total: 6614, cat: 'M 20–39', isPB: false },
  { dateNum: 2026 + 5/12,  year: 2026, race: 'Christchurch Half Marathon', short: 'CHC Half', dist: '21.1 km', time: '1:05:55', sec: 3955, pos: 2,  total: 3456, cat: 'M 20–39', isPB: false },
];

const halfPB = { time: '1:04:11', sec: 3851, race: 'Christchurch Half Marathon', year: 2025 };

function pctStr(pos: number, total: number): string {
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}

function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

function ProgressionChart() {
  const pts = [...RESULTS].sort((a, b) => a.dateNum - b.dateNum);

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
  const cy = (v: number) => padT + ((v - yLo) / (yHi - yLo)) * cH;

  const yTicks: number[] = [];
  for (let s = Math.floor(yLo / 60) * 60; s <= Math.ceil(yHi / 60) * 60; s += 120) {
    if (s >= yLo && s <= yHi) yTicks.push(s);
  }
  const xYears: number[] = [];
  for (let y = Math.ceil(xMin); y <= Math.floor(xMax); y++) xYears.push(y);

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx(p.dateNum).toFixed(1)},${cy(p.sec).toFixed(1)}`).join(' ');
  const color = 'var(--accent-good)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      {yTicks.map(s => {
        const yy = cy(s);
        const h = Math.floor(s/3600), m = Math.floor((s%3600)/60);
        const label = h ? `${h}:${String(m).padStart(2,'0')}` : `${m}:00`;
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
        const labelAbove = i < pts.length - 1 || p.isPB;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={p.isPB ? 5 : 3} fill={p.isPB ? color : 'var(--surface-dark)'} stroke={color} strokeWidth="1.5" />
            <text x={x} y={y+(labelAbove ? -10 : 14)} textAnchor="middle" fontSize="8.5" fontFamily="DM Mono,monospace" fill={color} fillOpacity={p.isPB ? 1 : 0.55} letterSpacing="0.04em">
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

export default function AthleteDryden() {
  const navigate = useNavigate();
  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>CD</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Christopher Dryden</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Nationality',  v: 'NZL' },
                  { l: 'Gender',       v: 'M' },
                  { l: 'Category',     v: 'Open' },
                  { l: 'Races logged', v: '12' },
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
                { dist: '42.2 km', pb: '—',               race: 'not on record',               year: null,               highlight: false },
                { dist: '21.1 km', pb: halfPB.time,        race: 'Christchurch Half Marathon',  year: halfPB.year,        highlight: true  },
                { dist: '10 km',   pb: '—',               race: 'not on record',               year: null,               highlight: false },
              ].map((d, i) => (
                <div key={i} style={{ background: 'var(--surface-dark)', padding: '20px 20px 18px' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-dark-meta)', marginBottom: 12 }}>{d.dist}</div>
                  <div className="serif" style={{ fontSize: d.pb === '—' ? 28 : 32, lineHeight: 1, letterSpacing: '-0.02em', color: d.highlight ? 'var(--accent-good)' : d.pb === '—' ? 'var(--on-dark-meta)' : 'var(--on-dark)' }}>{d.pb}</div>
                  <div style={{ marginTop: 10, fontSize: 10, color: 'var(--on-dark-meta)', lineHeight: 1.4 }}>
                    {d.year ? d.race : d.race}<br />
                    {d.year && <span style={{ color: 'var(--on-dark)', fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.06em' }}>{d.year}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn" style={{ color: 'var(--on-dark)', borderColor: 'var(--on-dark)', fontSize: 10.5 }}
                    onClick={() => navigate(`/compare?time=${halfPB.time}&dist=21`)}>
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
                <div className="eyebrow mb-8">Progression · 21.1 km</div>
                <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>Tracked half marathon times</h2>
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '24px 20px 16px' }}>
                <ProgressionChart />
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--on-dark-meta)', fontStyle: 'italic', textAlign: 'right', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Christchurch (June) and Auckland (Oct) shown at separate dates
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 11, color: 'var(--meta)' }}>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  PB: <span style={{ color: 'var(--ink)' }}>{halfPB.time}</span>
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  {RESULTS.length} finishes · {Math.min(...RESULTS.map(r=>r.year))}–{Math.max(...RESULTS.map(r=>r.year))}
                </span>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-16">At a glance</div>
              {[
                { label: 'Races logged',     val: '12',      sub: '12 half marathons' },
                { label: 'Half marathon PB', val: '1:04:11', sub: 'Christchurch 2025 · 4th overall' },
                { label: 'Best overall pos', val: '1st',     sub: 'Auckland Half 2025 · 1st of 6,614' },
                { label: 'Active years',     val: '9',       sub: '2017–2026 · AKL and CHC' },
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
                <div className="label mb-12">Half marathon improvement</div>
                {[...RESULTS].sort((a,b) => b.dateNum - a.dateNum).map((r, i, arr) => {
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
              <div className="eyebrow mb-8">Race history · 21.1 km</div>
              <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>{RESULTS.length} finishes on record</h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12 }}>2017–2026 · AKL · CHC</div>
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
                        if (r.race.includes('Auckland')) navigate('/races/auckland-marathon');
                        else navigate('/races/christchurch-marathon');
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
            Percentile computed across all finishers in that event and year. Results sourced from Auckland and Christchurch certified timings.
          </div>
        </div>
      </section>
    </main>
  );
}
