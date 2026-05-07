import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2017 + 10/12, year: 2017, race: 'Auckland Half',        short: 'AUC½', dist: '21.1 km', distId: 'half' as const, time: '1:13:29', sec: 4409, pos: 9,  total: 5706, cat: 'M 18–34', isPB: false },
  { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Half',        short: 'AUC½', dist: '21.1 km', distId: 'half' as const, time: '1:08:27', sec: 4107, pos: 3,  total: 5572, cat: 'M 18–34', isPB: false },
  { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Half',        short: 'AUC½', dist: '21.1 km', distId: 'half' as const, time: '1:05:51', sec: 3951, pos: 2,  total: 5204, cat: 'M 18–34', isPB: false },
  { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Half',        short: 'AUC½', dist: '21.1 km', distId: 'half' as const, time: '1:05:23', sec: 3923, pos: 1,  total: 4628, cat: 'M 18–34', isPB: false },
  { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Marathon',    short: 'AUC',  dist: '42.2 km', distId: 'mar'  as const, time: '2:27:44', sec: 8864, pos: 2,  total: 870,  cat: 'M 18–34', isPB: false },
  { dateNum: 2022 + 11/12, year: 2022, race: 'Queenstown Half',      short: 'QT½',  dist: '21.1 km', distId: 'half' as const, time: '1:14:08', sec: 4448, pos: 5,  total: 4142, cat: 'M 30–39', isPB: false },
  { dateNum: 2023 + 5/12,  year: 2023, race: "Hawke's Bay Half",     short: 'HB½',  dist: '21.1 km', distId: 'half' as const, time: '1:07:25', sec: 4045, pos: 2,  total: 1554, cat: 'M 30–39', isPB: false },
  { dateNum: 2024 + 5/12,  year: 2024, race: "Hawke's Bay Half",     short: 'HB½',  dist: '21.1 km', distId: 'half' as const, time: '1:06:23', sec: 3983, pos: 1,  total: 2751, cat: 'M 30–34', isPB: false },
  { dateNum: 2024 + 10/12, year: 2024, race: 'Auckland Marathon',    short: 'AUC',  dist: '42.2 km', distId: 'mar'  as const, time: '2:35:33', sec: 9333, pos: 10, total: 2439, cat: 'M 30–34', isPB: false },
  { dateNum: 2025 + 5/12,  year: 2025, race: "Hawke's Bay Half",     short: 'HB½',  dist: '21.1 km', distId: 'half' as const, time: '1:05:34', sec: 3934, pos: 1,  total: 3818, cat: 'M 30–34', isPB: false },
  { dateNum: 2025 + 6/12,  year: 2025, race: 'Christchurch Half',    short: 'CHC½', dist: '21.1 km', distId: 'half' as const, time: '1:04:17', sec: 3857, pos: 5,  total: 2858, cat: 'M 20–39', isPB: true  },
  { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Marathon',    short: 'AUC',  dist: '42.2 km', distId: 'mar'  as const, time: '2:21:04', sec: 8464, pos: 3,  total: 2775, cat: 'M Elite',  isPB: false },
];

const PBs = {
  mar:  { time: '2:21:04', sec: 8464, race: 'Auckland Marathon',    year: 2025 },
  half: { time: '1:04:17', sec: 3857, race: 'Christchurch Half',    year: 2025 },
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

function ProgressionChart({ distId }: { distId: 'mar' | 'half' }) {
  const pts = [...RESULTS].filter(r => r.distId === distId).sort((a, b) => a.dateNum - b.dateNum);
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
  for (let s = Math.floor(yLo / 60) * 60; s <= Math.ceil(yHi / 60) * 60; s += (distId === 'half' ? 120 : 300); ) {
    if (s >= yLo && s <= yHi) yTicks.push(s);
    s += distId === 'half' ? 120 : 300;
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

export default function AthleteGraves() {
  const navigate = useNavigate();
  const [distFilter, setDistFilter] = useState<'all' | 'mar' | 'half'>('all');
  const sortedResults = [...RESULTS]
    .filter(r => distFilter === 'all' || r.distId === distFilter)
    .sort((a, b) => b.dateNum - a.dateNum);

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>CG</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Cameron Graves</h1>
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
                { dist: '42.2 km', pb: PBs.mar.time,  race: 'Auckland Marathon',    year: PBs.mar.year,  highlight: true  },
                { dist: '21.1 km', pb: PBs.half.time, race: 'Christchurch Half',    year: PBs.half.year, highlight: true  },
                { dist: '10 km',   pb: '—',            race: 'not on record',        year: null,          highlight: false },
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
                <div className="eyebrow mb-8">Progression · Half marathon</div>
                <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>Tracked half marathon times</h2>
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '24px 20px 16px' }}>
                <ProgressionChart distId="half" />
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--on-dark-meta)', fontStyle: 'italic', textAlign: 'right', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  Auckland Half CR holder 2020–2023 (1:05:23)
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 11, color: 'var(--meta)' }}>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  Half PB: <span style={{ color: 'var(--ink)' }}>{PBs.half.time}</span>
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  Mar PB: <span style={{ color: 'var(--ink)' }}>{PBs.mar.time}</span>
                </span>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-16">At a glance</div>
              {[
                { label: 'Races logged',     val: '12',      sub: '3 marathons · 9 half marathons' },
                { label: 'Marathon PB',      val: '2:21:04', sub: 'Auckland 2025 · 3rd overall' },
                { label: 'Half marathon PB', val: '1:04:17', sub: 'Christchurch 2025 · 5th overall' },
                { label: 'Career wins',      val: '4',       sub: 'AUC½ 2020 · HB½ 2024 · HB½ 2025' },
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
            <div style={{ display: 'flex', gap: 8 }}>
              {(['all', 'mar', 'half'] as const).map(d => (
                <button key={d} className={`pill ${distFilter === d ? 'active' : ''}`} onClick={() => setDistFilter(d)}>
                  {d === 'all' ? 'All' : d === 'mar' ? '42.2 km' : '21.1 km'}
                </button>
              ))}
            </div>
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
                        if (r.race === 'Auckland Marathon' || r.race === 'Auckland Half') navigate('/races/auckland-marathon');
                        else if (r.race === 'Christchurch Half') navigate('/races/christchurch-marathon');
                        else if (r.race.includes("Hawke")) navigate('/races/hawkes-bay-marathon');
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
            Percentile computed across all finishers in that event and year. Results sourced from Auckland, Christchurch, Hawke's Bay and Queenstown Marathon certified timings.
          </div>
        </div>
      </section>
    </main>
  );
}
