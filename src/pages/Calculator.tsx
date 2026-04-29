import { useState, useMemo, useEffect, useRef } from 'react';
import { yearStats } from '@/data/logsDataExt';

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseTimeStr(str: string): number | null {
  if (!str) return null;
  const s = str.trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const parts = s.split(':').map(p => p.trim());
  if (parts.some(p => p === '' || isNaN(Number(p)))) return null;
  const nums = parts.map(Number);
  if (nums.length === 1) return nums[0];
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  return null;
}

function formatHMS(sec: number | null): string {
  if (sec == null || !isFinite(sec)) return '—';
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}
function formatMS(sec: number | null): string {
  if (sec == null || !isFinite(sec)) return '—';
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const RIEGEL = 1.06;
const equivTime = (t: number, fromKm: number, toKm: number) =>
  t * Math.pow(toKm / fromKm, RIEGEL);


const PRESET_DISTANCES = [
  { id: '5k',   label: '5 km',           km: 5 },
  { id: '10k',  label: '10 km',          km: 10 },
  { id: 'half', label: 'Half marathon',  km: 21.0975, short: '21.1 km' },
  { id: 'mar',  label: 'Marathon',       km: 42.195,  short: '42.2 km' },
  { id: '50k',  label: '50 km',          km: 50 },
];

const AKL_FIELD = 2775;
const AKL_MU = 15082, AKL_SIGMA = 1700;
function aklPlace(sec: number): number {
  const erf = (x: number) => {
    const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
    const sign = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return sign * y;
  };
  const z = (sec - AKL_MU) / (AKL_SIGMA * Math.SQRT2);
  const cdf = 0.5 * (1 + erf(z));
  return Math.max(1, Math.min(AKL_FIELD, Math.round(cdf * AKL_FIELD)));
}

// Auckland Marathon men/women CRs in seconds
const AKL_CR = { men: 8263, women: 9490 };

// ── Types ─────────────────────────────────────────────────────────────────────

interface Segment {
  id: number;
  km: string;
  mode: 'pace' | 'time';
  value: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Calculator() {
  const [distId, setDistId] = useState('mar');
  const [customKm, setCustomKm] = useState('25');
  const [goalTime, setGoalTime] = useState('3:30:00');
  const [pace, setPace] = useState('');
  const [unit, setUnit] = useState<'km' | 'mi'>('km');
  const [advanced, setAdvanced] = useState(false);
  const [lastEdited, setLastEdited] = useState<'time' | 'pace'>('time');
  const [segMode, setSegMode] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([
    { id: 1, km: '10', mode: 'pace', value: '4:15' },
    { id: 2, km: '11', mode: 'pace', value: '4:10' },
  ]);

  const dist = useMemo(() => {
    if (distId === 'custom') {
      const km = parseFloat(customKm);
      return { id: 'custom', label: `Custom (${isFinite(km) ? km : '—'} km)`, short: isFinite(km) ? `${km} km` : '— km', km: isFinite(km) && km > 0 ? km : 1 };
    }
    return PRESET_DISTANCES.find(d => d.id === distId)!;
  }, [distId, customKm]);

  const allDistances = useMemo(() => {
    const base = PRESET_DISTANCES.slice();
    if (distId === 'custom' && dist.km > 0) {
      base.push({ id: 'custom', label: dist.label, km: dist.km, short: dist.short! });
      base.sort((a, b) => a.km - b.km);
    }
    return base;
  }, [distId, dist]);

  // Scale time when distance changes (Riegel)
  const prevDistRef = useRef({ id: distId, km: dist.km });
  useEffect(() => {
    const prev = prevDistRef.current;
    if (prev.id === distId && prev.km === dist.km) return;
    const t = parseTimeStr(goalTime);
    if (t != null && prev.km > 0 && dist.km > 0) {
      setGoalTime(formatHMS(equivTime(t, prev.km, dist.km)));
      setLastEdited('time');
    }
    prevDistRef.current = { id: distId, km: dist.km };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distId, dist.km]);

  const solved = useMemo(() => {
    if (lastEdited === 'time') {
      const t = parseTimeStr(goalTime);
      if (t == null) return { time: null, pace: null };
      return { time: t, pace: t / dist.km };
    } else {
      const p = parseTimeStr(pace);
      if (p == null) return { time: null, pace: null };
      return { time: p * dist.km, pace: p };
    }
  }, [goalTime, pace, distId, dist.km, lastEdited]);

  useEffect(() => {
    if (lastEdited === 'time' && solved.pace != null) setPace(formatMS(solved.pace));
    else if (lastEdited === 'pace' && solved.time != null) setGoalTime(formatHMS(solved.time));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved.time, solved.pace, lastEdited]);

  const paceKm = solved.pace;
  const paceMi = paceKm != null ? paceKm * 1.609344 : null;

  const segmentPlan = useMemo(() => {
    let cumKm = 0, cumTime = 0;
    const rows = segments.map(s => {
      const km = parseFloat(s.km);
      let segPace: number | null = null, segTime: number | null = null;
      if (isFinite(km) && km > 0) {
        if (s.mode === 'pace') {
          const p = parseTimeStr(s.value);
          if (p != null) { segPace = p; segTime = p * km; }
        } else {
          const t = parseTimeStr(s.value);
          if (t != null) { segTime = t; segPace = t / km; }
        }
      }
      const valid = segPace != null && isFinite(km) && km > 0;
      if (valid) { cumKm += km; cumTime += segTime!; }
      return { ...s, kmNum: isFinite(km) ? km : null, segPace, segTime, cumKm: valid ? cumKm : null, cumTime: valid ? cumTime : null, valid };
    });
    return { rows, totalKm: cumKm, totalTime: cumTime };
  }, [segments]);

  const splits = useMemo(() => {
    if (paceKm == null || !isFinite(paceKm)) return [];
    const out: { at: string; time: number }[] = [];
    if (unit === 'km') {
      const step = dist.km > 30 ? 5 : dist.km > 10 ? 5 : 1;
      for (let k = step; k <= dist.km - 0.01; k += step) out.push({ at: `${k} km`, time: paceKm * k });
      out.push({ at: (dist as any).short || dist.label, time: solved.time! });
    } else {
      const totalMi = dist.km / 1.609344;
      for (let m = 1; m <= Math.floor(totalMi); m++) {
        if (m % 2 !== 0 && m !== 1 && m < totalMi - 1) continue;
        out.push({ at: `${m} mi`, time: paceMi! * m });
      }
      out.push({ at: `${totalMi.toFixed(2)} mi`, time: solved.time! });
    }
    return out;
  }, [paceKm, paceMi, unit, dist.km, solved.time]);

  const equiv = useMemo(() => {
    if (solved.time == null) return [];
    return allDistances.map(d => {
      const t = equivTime(solved.time!, dist.km, d.km);
      const isCurrent = d.id === distId || (d.id === 'custom' && distId === 'custom');
      const broken = d.id === 'mar' && t < AKL_CR.men;
      return { ...d, time: t, current: isCurrent, broken };
    });
  }, [solved.time, distId, dist.km, allDistances]);

  const place = solved.time != null && distId === 'mar' ? aklPlace(solved.time) : null;
  const segAvgPace = segmentPlan.totalKm > 0 ? segmentPlan.totalTime / segmentPlan.totalKm : null;

  const addSegment = () => setSegments(s => [...s, { id: Date.now(), km: '5', mode: 'pace', value: s[s.length - 1]?.value || '4:30' }]);
  const removeSegment = (id: number) => setSegments(s => s.filter(x => x.id !== id));
  const updateSegment = (id: number, patch: Partial<Segment>) => setSegments(s => s.map(x => x.id === id ? { ...x, ...patch } : x));

  const reset = () => {
    setDistId('mar'); setGoalTime('3:30:00'); setPace(''); setUnit('km');
    setAdvanced(false); setLastEdited('time'); setSegMode(false);
    setSegments([{ id: 1, km: '10', mode: 'pace', value: '4:15' }, { id: 2, km: '11', mode: 'pace', value: '4:10' }]);
  };

  return (
    <main>
      <section style={{ padding: '48px 0 32px', borderBottom: '0.5px solid var(--rule)' }}>
        <div className="page">
          <div className="eyebrow mb-8">— Tools · pace + projection</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap' }}>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1, margin: 0, letterSpacing: '-0.025em' }}>
              Pace Calculator
            </h1>
            <div className="dimmed" style={{ fontSize: 13, maxWidth: 460, lineHeight: 1.6, fontFamily: "'DM Serif Display', Georgia, serif", fontStyle: 'italic' }}>
              Enter any two of distance, time, or pace. Equivalencies use Riegel's formula (t₂ = t₁ × (d₂/d₁)¹·⁰⁶).
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="page">
          <div className="cmp-shell">

            {/* LEFT — sticky dark inputs rail */}
            <aside className="cmp-rail">
              <div className="cmp-rail-inner">
                <div className="label mb-16" style={{ color: 'var(--on-dark-meta)' }}>— Inputs</div>

                {/* Distance */}
                <div className="cmp-field">
                  <div className="cmp-field-label">Distance</div>
                  <div className="cmp-pill-row">
                    {PRESET_DISTANCES.map(d => (
                      <button key={d.id} className={`cmp-pill ${distId === d.id ? 'active' : ''}`}
                              onClick={() => setDistId(d.id)}>{(d as any).short || d.label}</button>
                    ))}
                    <button className={`cmp-pill ${distId === 'custom' ? 'active' : ''}`}
                            onClick={() => setDistId('custom')}>Custom</button>
                  </div>
                  {distId === 'custom' && (
                    <div className="fade-up" style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input className="cmp-input" style={{ width: 100 }} inputMode="decimal" placeholder="e.g. 25"
                             value={customKm} onChange={e => setCustomKm(e.target.value.replace(/[^0-9.]/g, ''))} />
                      <span style={{ fontSize: 11, color: 'var(--on-dark-meta)', letterSpacing: '0.06em' }}>km</span>
                    </div>
                  )}
                </div>

                {/* Goal time */}
                <div className="cmp-field" style={{ opacity: segMode ? 0.4 : 1, pointerEvents: segMode ? 'none' : 'auto' }}>
                  <div className="cmp-field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Goal time
                    <span style={{ opacity: lastEdited === 'time' ? 1 : 0.35 }}>
                      {lastEdited === 'time' ? '◉ driving' : '○'}
                    </span>
                  </div>
                  <input className="cmp-input" placeholder="h:mm:ss" value={goalTime}
                         onChange={e => { setGoalTime(e.target.value); setLastEdited('time'); }} />
                  <div style={{ fontSize: 10, color: 'var(--on-dark-meta)', marginTop: 6 }}>e.g. 3:30:00 · 1:42:30 · 22:00</div>
                </div>

                {/* Pace */}
                <div className="cmp-field" style={{ opacity: segMode ? 0.4 : 1, pointerEvents: segMode ? 'none' : 'auto' }}>
                  <div className="cmp-field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pace · /{unit === 'km' ? 'km' : 'mi'}</span>
                    <span style={{ opacity: lastEdited === 'pace' ? 1 : 0.35 }}>
                      {lastEdited === 'pace' ? '◉ driving' : '○'}
                    </span>
                  </div>
                  <input className="cmp-input" placeholder="mm:ss"
                         value={unit === 'km' ? (lastEdited === 'pace' ? pace : formatMS(paceKm)) : formatMS(paceMi)}
                         onChange={e => {
                           const v = e.target.value;
                           if (unit === 'km') { setPace(v); setLastEdited('pace'); }
                           else {
                             const sec = parseTimeStr(v);
                             if (sec != null) { setPace(formatMS(sec / 1.609344)); setLastEdited('pace'); }
                           }
                         }} />
                  <div style={{ marginTop: 8 }}>
                    <div className="cmp-pill-row">
                      <button className={`cmp-pill ${unit === 'km' ? 'active' : ''}`} onClick={() => setUnit('km')}>km</button>
                      <button className={`cmp-pill ${unit === 'mi' ? 'active' : ''}`} onClick={() => setUnit('mi')}>mi</button>
                    </div>
                  </div>
                </div>

                <div className="cmp-divider" />

                {/* Advanced — Race Strategy */}
                <div className="cmp-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: advanced ? 14 : 0 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--on-dark-meta)', fontFamily: "'DM Mono', monospace", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.18em', display: 'flex', alignItems: 'center', gap: 6 }}
                            onClick={() => setAdvanced(a => !a)}>
                      {advanced ? '▾' : '▸'} Race strategy
                    </button>
                    {advanced && (
                      <button className={`cmp-pill ${segMode ? 'active' : ''}`} onClick={() => setSegMode(s => !s)}>
                        {segMode ? '● ON' : '○ OFF'}
                      </button>
                    )}
                  </div>
                  {advanced && segMode && (
                    <div className="fade-up">
                      <div className="seg-list">
                        {segmentPlan.rows.map((s, i) => (
                          <div key={s.id} className="seg-row">
                            <div className="seg-idx serif">{String(i + 1).padStart(2, '0')}</div>
                            <div className="seg-fields">
                              <div>
                                <div className="cmp-sublabel">km</div>
                                <input className="cmp-input" inputMode="decimal" placeholder="km" value={s.km}
                                       onChange={e => updateSegment(s.id, { km: e.target.value.replace(/[^0-9.]/g, '') })} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                                  <div className="cmp-sublabel" style={{ marginBottom: 0 }}>{s.mode === 'pace' ? '/km' : 'time'}</div>
                                  <button className="seg-mode-toggle" style={{ color: 'var(--on-dark-meta)' }}
                                          onClick={() => updateSegment(s.id, { mode: s.mode === 'pace' ? 'time' : 'pace', value: '' })}>
                                    ⇄
                                  </button>
                                </div>
                                <input className="cmp-input" placeholder={s.mode === 'pace' ? 'mm:ss' : 'h:mm:ss'} value={s.value}
                                       onChange={e => updateSegment(s.id, { value: e.target.value })} />
                              </div>
                            </div>
                            <div className="seg-meta">
                              <div style={{ fontSize: 10, color: 'var(--on-dark-meta)' }}>
                                {s.valid ? `${formatHMS(s.segTime)}` : '—'}
                              </div>
                              <button className="seg-remove" disabled={segments.length <= 1}
                                      onClick={() => removeSegment(s.id)} title="Remove">×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-dark-meta)', fontFamily: "'DM Mono', monospace", fontSize: 11, marginTop: 8, padding: 0, letterSpacing: '0.06em' }}
                              onClick={addSegment}>+ Add segment</button>
                    </div>
                  )}
                </div>

                <div className="cmp-divider" />

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" onClick={reset} style={{ flex: 1 }}>Reset</button>
                  <button className="btn-ghost" onClick={() => {
                    const txt = segMode && segmentPlan.totalKm > 0
                      ? `Strategy · ${segmentPlan.totalKm.toFixed(1)} km · ${formatHMS(segmentPlan.totalTime)}`
                      : `${dist.label} · ${formatHMS(solved.time)} · ${formatMS(paceKm)}/km`;
                    navigator.clipboard?.writeText(txt);
                  }}>Copy</button>
                </div>
              </div>
            </aside>

            {/* RIGHT — stacked result cards */}
            <div className="cmp-results">

              {/* Projection / Strategy card */}
              {segMode && segmentPlan.totalKm > 0 ? (
                <div className="cmp-card cmp-card-dark">
                  <div className="eyebrow mb-16">Strategy · {segmentPlan.rows.filter(r => r.valid).length} legs</div>
                  <div className="serif" style={{ fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.025em' }}>
                    {formatHMS(segmentPlan.totalTime)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 28, paddingTop: 20, borderTop: '0.5px solid var(--on-dark-rule)' }}>
                    <div>
                      <div className="label">Total distance</div>
                      <div className="serif mt-8" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
                        {segmentPlan.totalKm.toFixed(2)}<span style={{ fontSize: 13, marginLeft: 6 }}>km</span>
                      </div>
                    </div>
                    <div>
                      <div className="label">Avg pace</div>
                      <div className="serif mt-8" style={{ fontSize: 28, letterSpacing: '-0.01em' }}>
                        {formatMS(segAvgPace)}<span style={{ fontSize: 13, marginLeft: 6 }}>/km</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cmp-card cmp-card-dark">
                  <div className="eyebrow mb-16">Projection · {(dist as any).short || dist.label} · Even-effort</div>
                  <div className="calc-proj-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 24, alignItems: 'baseline' }}>
                    <div>
                      <div className="label">Finish time</div>
                      <div className="serif mt-8" style={{ fontSize: 64, lineHeight: 0.95, letterSpacing: '-0.02em' }}>{formatHMS(solved.time)}</div>
                    </div>
                    <div>
                      <div className="label">Pace · /km</div>
                      <div className="serif mt-8" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.01em' }}>{formatMS(paceKm)}</div>
                    </div>
                    <div>
                      <div className="label">Pace · /mi</div>
                      <div className="serif mt-8" style={{ fontSize: 32, lineHeight: 1, letterSpacing: '-0.01em' }}>{formatMS(paceMi)}</div>
                    </div>
                  </div>
                  {place != null && (
                    <div style={{ marginTop: 20, fontSize: 12, lineHeight: 1.55 }}>
                      On the <span style={{ color: 'var(--on-dark)' }}>2025 Auckland Marathon</span> field this finish would have placed approximately
                      <span className="serif" style={{ fontSize: 18, color: 'var(--on-dark)', margin: '0 6px' }}>{place.toLocaleString()}</span>
                      of {AKL_FIELD.toLocaleString()}.
                    </div>
                  )}
                </div>
              )}

              {/* Segment breakdown */}
              {segMode && (
                <div className="cmp-card">
                  <div className="eyebrow mb-16">Leg breakdown · cumulative time at end of leg</div>
                  <table className="tbl">
                    <thead><tr><th>Leg</th><th>Distance</th><th className="num">Pace</th><th className="num">Leg time</th><th className="num">Cumulative</th></tr></thead>
                    <tbody>
                      {segmentPlan.rows.map((s, i) => (
                        <tr key={s.id}>
                          <td><span className="serif" style={{ fontSize: 16 }}>{String(i + 1).padStart(2, '0')}</span></td>
                          <td>{s.kmNum != null ? `${s.kmNum} km` : '—'}</td>
                          <td className="num time">{s.valid ? `${formatMS(s.segPace)}/km` : '—'}</td>
                          <td className="num time">{s.valid ? formatHMS(s.segTime) : '—'}</td>
                          <td className="num time">{s.valid ? `${formatHMS(s.cumTime)} · ${s.cumKm!.toFixed(1)} km` : '—'}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '1px solid var(--ink)' }}>
                        <td><span className="label-strong">Total</span></td>
                        <td><span className="serif" style={{ fontSize: 16 }}>{segmentPlan.totalKm.toFixed(2)} km</span></td>
                        <td className="num time">{formatMS(segAvgPace)}/km <span className="dimmed">avg</span></td>
                        <td className="num time">{formatHMS(segmentPlan.totalTime)}</td>
                        <td className="num time">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Splits */}
              {!segMode && (
                <div className="cmp-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                    <div className="eyebrow">Even-effort splits</div>
                    <div className="dimmed" style={{ fontSize: 11 }}>cumulative · {unit}</div>
                  </div>
                  <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th>Mark</th><th className="num">Cumulative</th><th className="num">Pace</th></tr></thead>
                    <tbody>
                      {splits.map((s, i) => (
                        <tr key={i}>
                          <td>{s.at}</td>
                          <td className="num time">{formatHMS(s.time)}</td>
                          <td className="num time dimmed">{formatMS(unit === 'km' ? paceKm : paceMi)}/{unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}

              {/* Equivalencies */}
              {!segMode && (
                <div className="cmp-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                    <div className="eyebrow">Race-distance equivalents</div>
                    <div className="dimmed" style={{ fontSize: 11 }}>Riegel · same fitness, different distance</div>
                  </div>
                  <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th>Distance</th><th className="num">Equivalent time</th><th className="num equiv-pace-col">Pace / km</th><th></th></tr></thead>
                    <tbody>
                      {equiv.map(e => (
                        <tr key={e.id} className="row" style={{ background: e.current ? 'var(--bg-alt)' : 'transparent' }}>
                          <td>
                            <span className="serif" style={{ fontSize: 16 }}>{e.label}</span>
                            {e.current && <span className="label" style={{ marginLeft: 8 }}>· given</span>}
                          </td>
                          <td className="num time">{formatHMS(e.time)}</td>
                          <td className="num time dimmed equiv-pace-col">{formatMS(e.time / e.km)}</td>
                          <td style={{ textAlign: 'right' }}>
                            {e.broken && (
                              <span style={{ color: 'var(--accent)', border: '0.5px solid var(--accent)', padding: '2px 8px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 999, fontFamily: "'DM Mono', monospace" }}>
                                ● Beats Auckland CR
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  <div className="dimmed mt-16" style={{ fontSize: 11, lineHeight: 1.6 }}>
                    Equivalencies assume comparable terrain, weather, and training. Treat as a target window, not a forecast.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
