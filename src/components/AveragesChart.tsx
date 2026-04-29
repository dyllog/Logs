import { useState } from 'react';
import { type YearStat, formatTime } from '@/data/logsDataExt';

interface AveragesChartProps {
  stats: YearStat[];
}

export default function AveragesChart({ stats }: AveragesChartProps) {
  const [show, setShow] = useState({ avg: true, men: true, women: true, top10M: true, top10W: true });
  const [hover, setHover] = useState<number | null>(null);
  const W = 680, H = 240, padX = 50, padTop = 24, padBot = 44;

  const years = stats.map(s => s.year);
  const allS = stats.flatMap(s => [s.avg, s.winnerM, s.winnerW, s.top10M, s.top10W]);
  const sMin = Math.min(...allS) - 300;
  const sMax = Math.max(...allS) + 300;
  const x = (yr: number) => {
    const i = years.indexOf(yr);
    return padX + (i / (years.length - 1)) * (W - padX * 2);
  };
  const y = (v: number) => padTop + (1 - (v - sMin) / (sMax - sMin)) * (H - padTop - padBot);

  const buildPath = (key: keyof YearStat) =>
    stats.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.year).toFixed(1)},${y(s[key] as number).toFixed(1)}`).join(' ');

  const series: { key: keyof YearStat; showKey: keyof typeof show; label: string; dash: string; stroke: number; op: number }[] = [
    { key: 'avg',     showKey: 'avg',    label: 'Median finish (all)',  dash: '',    stroke: 1.25, op: 1    },
    { key: 'winnerM', showKey: 'men',    label: "Men's winner",        dash: '',    stroke: 0.75, op: 0.55 },
    { key: 'winnerW', showKey: 'women',  label: "Women's winner",      dash: '3 3', stroke: 0.75, op: 0.55 },
    { key: 'top10M',  showKey: 'top10M', label: 'Top 10 men avg',      dash: '1 4', stroke: 0.75, op: 0.45 },
    { key: 'top10W',  showKey: 'top10W', label: 'Top 10 women avg',    dash: '4 3', stroke: 0.75, op: 0.45 },
  ];

  const tog = (k: keyof typeof show) => setShow(s => ({ ...s, [k]: !s[k] }));

  return (
    <div>
      <div className="flex between ai-baseline mb-16" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="label-strong">Averages · by year</div>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          <button className={`pill ${show.avg    ? 'active' : ''}`} onClick={() => tog('avg')}>Median finish</button>
          <button className={`pill ${show.men    ? 'active' : ''}`} onClick={() => tog('men')}>Men winner</button>
          <button className={`pill ${show.women  ? 'active' : ''}`} onClick={() => tog('women')}>Women winner</button>
          <button className={`pill ${show.top10M ? 'active' : ''}`} onClick={() => tog('top10M')}>Top 10 men</button>
          <button className={`pill ${show.top10W ? 'active' : ''}`} onClick={() => tog('top10W')}>Top 10 women</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const yy = padTop + f * (H - padTop - padBot);
          const v = sMin + (1 - f) * (sMax - sMin);
          return (
            <g key={i}>
              <line x1={padX} x2={W - padX} y1={yy} y2={yy} stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.5" />
              <text x={padX - 10} y={yy + 3} textAnchor="end" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.5" letterSpacing="0.06em">
                {formatTime(Math.round(v))}
              </text>
            </g>
          );
        })}
        {years.map(yr => (
          <text key={yr} x={x(yr)} y={H - padBot + 16} textAnchor="middle" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.55" letterSpacing="0.08em">
            {yr}
          </text>
        ))}
        {years.includes(2019) && years.includes(2022) && (
          <text x={(x(2019) + x(2022)) / 2} y={H - padBot + 30} textAnchor="middle" fontSize="8" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.4" letterSpacing="0.12em">
            2020 · 2021 — no edition
          </text>
        )}
        {series.map(s => show[s.showKey] && (
          <path key={s.key} d={buildPath(s.key)} fill="none" stroke="currentColor"
                strokeOpacity={s.op} strokeWidth={s.stroke}
                strokeDasharray={s.dash || undefined} />
        ))}
        {stats.map((s, i) => (
          <g key={i}>
            {show.avg    && <circle cx={x(s.year)} cy={y(s.avg)}    r={hover === i ? 4   : 2.5} fill="var(--bg)" stroke="currentColor" strokeWidth="1" />}
            {show.men    && <circle cx={x(s.year)} cy={y(s.winnerM)} r={hover === i ? 3.5 : 2}   fill="var(--bg)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />}
            {show.women  && <circle cx={x(s.year)} cy={y(s.winnerW)} r={hover === i ? 3.5 : 2}   fill="var(--bg)" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />}
            {show.top10M && <circle cx={x(s.year)} cy={y(s.top10M)}  r={hover === i ? 3   : 1.5} fill="var(--bg)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />}
            {show.top10W && <circle cx={x(s.year)} cy={y(s.top10W)}  r={hover === i ? 3   : 1.5} fill="var(--bg)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />}
            <rect x={x(s.year) - 18} y={padTop} width="36" height={H - padTop - padBot} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          </g>
        ))}
        {hover !== null && (() => {
          const s = stats[hover]; const xx = x(s.year);
          const lines: [string, string][] = [
            ['Median',    formatTime(s.avg)],
            ['M winner',  formatTime(s.winnerM)],
            ['W winner',  formatTime(s.winnerW)],
            ['Top 10 M',  formatTime(s.top10M)],
            ['Top 10 W',  formatTime(s.top10W)],
            ['Finishers', s.finishers.toLocaleString()],
          ];
          return (
            <g pointerEvents="none">
              <line x1={xx} x2={xx} y1={padTop} y2={H - padBot} stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
              <g transform={`translate(${Math.min(xx + 10, W - 150)},${padTop + 4})`}>
                <rect width="138" height="102" fill="var(--bg)" stroke="currentColor" strokeWidth="0.5" />
                <text x="10" y="14" fontSize="10" fontFamily="DM Mono, monospace" fill="currentColor" letterSpacing="0.12em">{s.year}</text>
                {lines.map((l, li) => (
                  <g key={li}>
                    <text x="10" y={28 + li * 12} fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.55" letterSpacing="0.04em">{l[0]}</text>
                    <text x="128" y={28 + li * 12} textAnchor="end" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor">{l[1]}</text>
                  </g>
                ))}
              </g>
            </g>
          );
        })()}
      </svg>
      <div className="flex gap-24 mt-16" style={{ fontSize: 11, color: 'var(--meta)', flexWrap: 'wrap' }}>
        <div className="flex ai-center gap-8"><span style={{ width: 18, height: 1.25, background: 'currentColor', display: 'inline-block' }} />Median finish (all)</div>
        <div className="flex ai-center gap-8"><span style={{ width: 18, height: 0.75, background: 'currentColor', opacity: 0.6, display: 'inline-block' }} />Men winner</div>
        <div className="flex ai-center gap-8"><span style={{ width: 18, display: 'inline-block', height: 0, borderTop: '0.75px dashed currentColor', opacity: 0.6 }} />Women winner</div>
        <div className="flex ai-center gap-8"><span style={{ width: 18, display: 'inline-block', height: 0, borderTop: '0.75px dotted currentColor', opacity: 0.45 }} />Top 10 men avg</div>
        <div className="flex ai-center gap-8"><span style={{ width: 18, display: 'inline-block', height: 0, borderTop: '0.75px dashed currentColor', opacity: 0.45 }} />Top 10 women avg</div>
      </div>
    </div>
  );
}
