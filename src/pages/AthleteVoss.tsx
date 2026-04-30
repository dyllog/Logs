import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RESULTS = [
  { dateNum: 2014 + 4/12,  year: 2014, race: 'Rotorua Half Marathon',       short: 'ROT Half', dist: '21.1 km', distId: 'half' as const, time: '1:15:31', sec: 4531, pos: 5,  total: 1817, cat: 'M 20–39', isPB: false },
  { dateNum: 2015 + 4/12,  year: 2015, race: 'Rotorua Half Marathon',       short: 'ROT Half', dist: '21.1 km', distId: 'half' as const, time: '1:08:36', sec: 4116, pos: 2,  total: 1042, cat: 'M 20–39', isPB: false },
  { dateNum: 2015 + 5/12,  year: 2015, race: 'Christchurch Half Marathon',  short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:08:26', sec: 4106, pos: 11, total: 2038, cat: 'M 20–39', isPB: false },
  { dateNum: 2016 + 4/12,  year: 2016, race: 'Rotorua Half Marathon',       short: 'ROT Half', dist: '21.1 km', distId: 'half' as const, time: '1:06:07', sec: 3967, pos: 1,  total:  873, cat: 'M 20–39', isPB: false },
  { dateNum: 2016 + 5/12,  year: 2016, race: 'Christchurch Half Marathon',  short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:06:50', sec: 4010, pos: 3,  total: 1786, cat: 'M 20–39', isPB: false },
  { dateNum: 2016 + 10/12, year: 2016, race: 'Auckland Half Marathon',      short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:14:43', sec: 4483, pos: 10, total: 5673, cat: 'M 20–39', isPB: false },
  { dateNum: 2018 + 4/12,  year: 2018, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:46:25', sec: 9985, pos: 7,  total:  940, cat: 'M 20–39', isPB: false },
  { dateNum: 2018 + 5/12,  year: 2018, race: 'Christchurch Half Marathon',  short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:08:20', sec: 4100, pos: 4,  total: 1574, cat: 'M 20–39', isPB: false },
  { dateNum: 2018 + 10/12, year: 2018, race: 'Auckland Half Marathon',      short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:07:42', sec: 4062, pos: 2,  total: 5572, cat: 'M 20–39', isPB: false },
  { dateNum: 2019 + 4/12,  year: 2019, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:27:35', sec: 8855, pos: 3,  total:  720, cat: 'M 20–39', isPB: false },
  { dateNum: 2019 + 10/12, year: 2019, race: 'Auckland Marathon',           short: 'AKL',      dist: '42.2 km', distId: 'mar'  as const, time: '2:22:34', sec: 8554, pos: 2,  total: 1650, cat: 'M 20–39', isPB: false },
  { dateNum: 2020 + 4/12,  year: 2020, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:31:13', sec: 9073, pos: 1,  total:  446, cat: 'M 20–39', isPB: false },
  { dateNum: 2020 + 10/12, year: 2020, race: 'Auckland Marathon',           short: 'AKL',      dist: '42.2 km', distId: 'mar'  as const, time: '2:32:29', sec: 9149, pos: 5,  total: 1619, cat: 'M 20–39', isPB: false },
  { dateNum: 2021 + 4/12,  year: 2021, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:29:29', sec: 8969, pos: 1,  total:  746, cat: 'M 20–39', isPB: false },
  { dateNum: 2021 + 5/12,  year: 2021, race: 'Christchurch Half Marathon',  short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:05:09', sec: 3909, pos: 2,  total: 1332, cat: 'M 20–39', isPB: false },
  { dateNum: 2021 + 10/12, year: 2021, race: 'Auckland Half Marathon',      short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:07:23', sec: 4043, pos: 1,  total: 2492, cat: 'M 20–39', isPB: false },
  { dateNum: 2022 + 4/12,  year: 2022, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:29:21', sec: 8961, pos: 1,  total:  476, cat: 'M 20–39', isPB: false },
  { dateNum: 2022 + 10/12, year: 2022, race: 'Auckland Half Marathon',      short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:06:35', sec: 3995, pos: 2,  total: 3988, cat: 'M 20–39', isPB: false },
  { dateNum: 2023 + 4/12,  year: 2023, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:24:03', sec: 8643, pos: 2,  total:  796, cat: 'M 20–39', isPB: false },
  { dateNum: 2023 + 10/12, year: 2023, race: 'Auckland Half Marathon',      short: 'AKL Half', dist: '21.1 km', distId: 'half' as const, time: '1:07:07', sec: 4027, pos: 3,  total: 4293, cat: 'M 20–39', isPB: false },
  { dateNum: 2024 + 4/12,  year: 2024, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:23:48', sec: 8628, pos: 1,  total: 1151, cat: 'M 20–39', isPB: false },
  { dateNum: 2024 + 5/12,  year: 2024, race: 'Christchurch Half Marathon',  short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:04:30', sec: 3870, pos: 1,  total: 2172, cat: 'M 20–39', isPB: true  },
  { dateNum: 2024 + 10/12, year: 2024, race: 'Auckland Marathon',           short: 'AKL',      dist: '42.2 km', distId: 'mar'  as const, time: '2:22:55', sec: 8575, pos: 3,  total: 2439, cat: 'M 20–39', isPB: false },
  { dateNum: 2025 + 4/12,  year: 2025, race: 'Rotorua Marathon',            short: 'ROT',      dist: '42.2 km', distId: 'mar'  as const, time: '2:26:52', sec: 8812, pos: 3,  total:  897, cat: 'M 20–39', isPB: false },
  { dateNum: 2025 + 5/12,  year: 2025, race: 'Christchurch Half Marathon',  short: 'CHC Half', dist: '21.1 km', distId: 'half' as const, time: '1:04:39', sec: 3879, pos: 6,  total: 2858, cat: 'M 20–39', isPB: false },
  { dateNum: 2025 + 10/12, year: 2025, race: 'Auckland Marathon',           short: 'AKL',      dist: '42.2 km', distId: 'mar'  as const, time: '2:21:01', sec: 8461, pos: 2,  total: 2775, cat: 'M Elite',  isPB: true  },
];

const PBs = {
  mar:  { time: '2:21:01', sec: 8461, race: 'Auckland Marathon',          year: 2025 },
  half: { time: '1:04:30', sec: 3870, race: 'Christchurch Half Marathon', year: 2024 },
};

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}` : `${m}:${String(ss).padStart(2,'0')}`;
}

function pctStr(pos: number, total: number): string {
  const p = ((total - pos) / total) * 100;
  return p > 99.9 ? '>99.9%' : p.toFixed(1) + '%';
}

function ordSuffix(n: number): string {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v-20)%10] || ['th','st','nd','rd'][v] || 'th');
}

type DistId = 'mar' | 'half';

function ProgressionChart({ distId }: { distId: DistId }) {
  const pts = RESULTS.filter(r => r.distId === distId).sort((a, b) => a.dateNum - b.dateNum);
  if (pts.length === 0) return null;

  const W = 640, H = 180;
  const padL = 60, padR = 24, padT = 28, padB = 36;
  const cW = W - padL - padR, cH = H - padT - padB;

  const xMin = pts[0].dateNum - 0.5;
  const xMax = pts[pts.length - 1].dateNum + 0.5;

  const sMin = Math.min(...pts.map(p => p.sec));
  const sMax = Math.max(...pts.map(p => p.sec));
  const sPad = (sMax - sMin) * 0.12 || 60;
  const yLo = sMin - sPad;
  const yHi = sMax + sPad;

  const cx = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * cW;
  const cy = (v: number) => padT + ((v - yLo) / (yHi - yLo)) * cH;

  const step = distId === 'mar' ? 180 : 120;
  const yTicks: number[] = [];
  for (let s = Math.floor(yLo / 60) * 60; s <= Math.ceil(yHi / 60) * 60; s += step) {
    if (s >= yLo && s <= yHi) yTicks.push(s);
  }
  const xYears: number[] = [];
  for (let y = Math.ceil(xMin); y <= Math.floor(xMax); y++) xYears.push(y);

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx(p.dateNum).toFixed(1)},${cy(p.sec).toFixed(1)}`).join(' ');
  const color = distId === 'mar' ? 'var(--on-dark)' : 'var(--accent-good)';

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

export default function AthleteVoss() {
  const navigate = useNavigate();
  const [chartDist, setChartDist] = useState<DistId>('mar');

  const sortedResults = [...RESULTS].sort((a, b) => b.dateNum - a.dateNum);
  const marResults = RESULTS.filter(r => r.distId === 'mar');
  const halfResults = RESULTS.filter(r => r.distId === 'half');

  return (
    <main>
      <section style={{ background: 'var(--surface-dark)', color: 'var(--on-dark)', padding: '48px 0 40px', borderBottom: '0.5px solid var(--on-dark-rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24" style={{ color: 'var(--on-dark-meta)' }}>Athlete · NZL</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }} className="athlete-head-grid">
            <div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, letterSpacing: '-0.01em', color: 'var(--on-dark)' }}>MV</div>
              <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,60px)', lineHeight: 0.96, margin: 0, letterSpacing: '-0.025em', color: 'var(--on-dark)' }}>Michael Voss</h1>
              <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Nationality',  v: 'NZL' },
                  { l: 'Gender',       v: 'M' },
                  { l: 'Category',     v: 'Open' },
                  { l: 'Races logged', v: '26' },
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
                { dist: '42.2 km', pb: PBs.mar.time,  race: 'Auckland Marathon',          year: PBs.mar.year,  highlight: true  },
                { dist: '21.1 km', pb: PBs.half.time, race: 'Christchurch Half Marathon',  year: PBs.half.year, highlight: false },
                { dist: '10 km',   pb: '—',           race: 'not on record',               year: null,          highlight: false },
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                <div>
                  <div className="eyebrow mb-8">Progression · {chartDist === 'mar' ? '42.2 km' : '21.1 km'}</div>
                  <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: '-0.01em' }}>
                    {chartDist === 'mar' ? 'Tracked marathon times' : 'Tracked half marathon times'}
                  </h2>
                </div>
                <div className="flex gap-8">
                  <button className={`pill ${chartDist === 'mar' ? 'active' : ''}`} onClick={() => setChartDist('mar')}>42.2 km</button>
                  <button className={`pill ${chartDist === 'half' ? 'active' : ''}`} onClick={() => setChartDist('half')}>21.1 km</button>
                </div>
              </div>
              <div style={{ background: 'var(--surface-dark)', padding: '24px 20px 16px', position: 'relative' }}>
                <ProgressionChart distId={chartDist} />
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--on-dark-meta)', fontStyle: 'italic', textAlign: 'right', fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  {chartDist === 'mar'
                    ? 'Rotorua (May) and Auckland (Oct) shown at separate dates'
                    : 'Rotorua (May), Christchurch (June) and Auckland (Oct) shown at separate dates'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 11, color: 'var(--meta)' }}>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  PB: <span style={{ color: 'var(--ink)' }}>{chartDist === 'mar' ? PBs.mar.time : PBs.half.time}</span>
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>
                  {chartDist === 'mar'
                    ? `${marResults.length} finishes · ${Math.min(...marResults.map(r=>r.year))}–${Math.max(...marResults.map(r=>r.year))}`
                    : `${halfResults.length} finishes · ${Math.min(...halfResults.map(r=>r.year))}–${Math.max(...halfResults.map(r=>r.year))}`}
                </span>
              </div>
            </div>

            <div>
              <div className="eyebrow mb-16">At a glance</div>
              {[
                { label: 'Races logged',     val: '26',      sub: '12 marathons · 14 halves' },
                { label: 'Marathon PB',      val: '2:21:01', sub: 'Auckland 2025 · 2nd overall' },
                { label: 'Half marathon PB', val: '1:04:30', sub: 'Christchurch 2024 · 1st overall' },
                { label: 'Best overall pos', val: '1st',     sub: '7 career wins · AKL · CHC · ROT' },
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
                <div className="label mb-12">Marathon improvement</div>
                {marResults.filter(r => r.sec < 9200).sort((a,b) => b.dateNum - a.dateNum).map((r, i, arr) => {
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
            <div className="dimmed" style={{ fontSize: 12 }}>2014–2025 · AKL · CHC · ROT</div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Race</th>
                  <th>Dist</th>
                  <th className="num">Time</th>
                  <th style={{ textAlign: 'center', width: 60 }}>Overall</th>
                  <th className="num" style={{ width: 70 }}>Percentile</th>
                  <th>Category</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((r, i) => (
                  <tr key={i} className="row"
                      onClick={() => {
                        if (r.race.includes('Auckland')) navigate('/races/auckland-marathon');
                        else if (r.race.includes('Rotorua')) navigate('/races/rotorua-marathon');
                        else if (r.race.includes('Christchurch')) navigate('/races/christchurch-marathon');
                      }}>
                    <td className="dimmed">{r.year}</td>
                    <td><span className="serif" style={{ fontSize: 15 }}>{r.race}</span></td>
                    <td className="dimmed">{r.dist}</td>
                    <td className="num time" style={{ color: r.isPB ? 'var(--accent-good)' : 'inherit', fontWeight: r.isPB ? 500 : 400 }}>{r.time}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pos ${r.pos === 1 ? 'pos-1' : ''}`} style={{ color: r.pos <= 3 ? 'var(--ink)' : 'var(--meta)' }}>
                        {ordSuffix(r.pos)}
                      </span>
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
            Percentile computed across all finishers in that event and year. Results sourced from Auckland, Rotorua, and Christchurch Marathon certified timings.
          </div>
        </div>
      </section>
    </main>
  );
}
