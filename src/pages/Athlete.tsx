import { useNavigate } from 'react-router-dom';
import { athleteProfile, toSec } from '@/data/logsData';

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const W = 560, H = 160, padX = 20, padTop = 16, padBot = 28;

function AthleteProgressionChart() {
  const pts = athleteProfile.progression;
  const xs = pts.map(p => p.y);
  const ss = pts.map(p => p.s);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const sMin = Math.min(...ss), sMax = Math.max(...ss);
  const x = (v: number) => padX + ((v - xMin) / (xMax - xMin)) * (W - padX * 2);
  const y = (v: number) => padTop + ((v - sMin) / ((sMax - sMin) || 1)) * (H - padTop - padBot);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.y).toFixed(1)},${y(p.s).toFixed(1)}`).join(' ');
  const bestSec = Math.min(...ss);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 0.5, 1].map((f, i) => {
        const yy = padTop + f * (H - padTop - padBot);
        return <line key={i} x1={padX} x2={W - padX} y1={yy} y2={yy} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />;
      })}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1"
            style={{ strokeDasharray: 1400, strokeDashoffset: 1400, animation: 'drawIn 1400ms ease-out forwards' }} />
      {pts.map((p, i) => {
        const cx = x(p.y), cy = y(p.s);
        const isBest = p.s === bestSec;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={isBest ? 4 : 2.5}
                    fill={isBest ? 'currentColor' : 'var(--bg)'}
                    stroke="currentColor" strokeWidth="1" />
            {isBest && (
              <text x={cx} y={cy - 10} textAnchor="middle" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" letterSpacing="0.06em">
                {formatTime(p.s)}
              </text>
            )}
          </g>
        );
      })}
      {[pts[0], pts[pts.length - 1]].map((p, i) => (
        <text key={i} x={i === 0 ? padX : W - padX} y={H - padBot + 16}
              textAnchor={i === 0 ? 'start' : 'end'}
              fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.6" letterSpacing="0.1em">
          {p.y}
        </text>
      ))}
    </svg>
  );
}

export default function Athlete() {
  const navigate = useNavigate();
  const a = athleteProfile;
  const pbEntries = Object.entries(a.pbs);

  return (
    <main>
      {/* Header */}
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-24">
            Athlete · {a.club} · {a.nationality} · b. {a.born}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48, alignItems: 'end' }} className="race-head-grid">
            <h1 className="serif" style={{ fontSize: 'clamp(36px,5vw,64px)', lineHeight: 0.98, margin: 0, letterSpacing: '-0.025em' }}>
              {a.name}
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 12 }}>
              {pbEntries.map(([dist, time]) => (
                <div key={dist}>
                  <div className="label mb-8">PB · {dist}</div>
                  <div className="serif" style={{ fontSize: 20, letterSpacing: '-0.01em' }}>{time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marathon progression */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Marathon progression</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                42.2 km · {a.progression[0].y}–{a.progression[a.progression.length - 1].y}
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12, maxWidth: 240, textAlign: 'right' }}>
              Best: {formatTime(Math.min(...a.progression.map(p => p.s)))} · Auckland Marathon 2023
            </div>
          </div>
          <AthleteProgressionChart />
        </div>
      </section>

      {/* Career results */}
      <section className="section">
        <div className="page">
          <div className="section-header">
            <div>
              <div className="eyebrow mb-8">Career results</div>
              <h2 className="serif" style={{ fontSize: 32, margin: 0, letterSpacing: '-0.01em' }}>
                All certified finishes
              </h2>
            </div>
            <div className="dimmed" style={{ fontSize: 12 }}>{a.results.length} results on record</div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Year</th>
                <th>Event</th>
                <th>Dist</th>
                <th className="num">Time</th>
                <th style={{ width: 50 }}>Pos</th>
                <th style={{ width: 60 }}>AG Pos</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {a.results.map((r, i) => (
                <tr key={i} className="row"
                    style={{ cursor: r.event === 'Auckland Marathon' ? 'pointer' : 'default' }}
                    onClick={() => r.event === 'Auckland Marathon' && navigate('/races/auckland-marathon')}>
                  <td className="dimmed">{r.year}</td>
                  <td>
                    <span className="serif" style={{ fontSize: 16 }}>{r.event}</span>
                  </td>
                  <td className="dimmed">{r.dist}</td>
                  <td className="num time">{r.time}</td>
                  <td className={`pos ${r.pos === 1 ? 'pos-1' : ''}`}>{r.pos}</td>
                  <td className="dimmed" style={{ textAlign: 'center' }}>{r.agPos}</td>
                  <td style={{ textAlign: 'right' }}>
                    {r.note && (
                      <span style={{ color: 'var(--accent)', border: '0.5px solid var(--accent)', padding: '2px 8px', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 999, fontFamily: '"DM Mono", monospace' }}>
                        {r.note}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Back */}
      <section style={{ padding: '0 0 48px' }}>
        <div className="page">
          <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </section>
    </main>
  );
}
