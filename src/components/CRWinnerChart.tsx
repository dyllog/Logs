import { useState } from 'react';
import { type YearStat, formatTime } from '@/data/logsDataExt';

interface CRWinnerChartProps {
  stats: YearStat[];
  gender: 'men' | 'women';
  // CR set before the archive window (in seconds). CR line starts here and drops if beaten.
  seedCR: number;
}

export default function CRWinnerChart({ stats, gender, seedCR }: CRWinnerChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 680, H = 200, padX = 50, padTop = 20, padBot = 36;

  const winKey: keyof YearStat = gender === 'men' ? 'winnerM' : 'winnerW';

  // Build CR line: running minimum starting from seedCR
  let runningCR = seedCR;
  const points = stats.map(s => {
    const winner = s[winKey] as number;
    if (winner < runningCR) runningCR = winner;
    return { year: s.year, winner, cr: runningCR };
  });

  const years = points.map(p => p.year);
  const allVals = points.flatMap(p => [p.winner, p.cr]);
  const vMin = Math.min(...allVals) - 180;
  const vMax = Math.max(...allVals) + 180;

  const x = (yr: number) => {
    const i = years.indexOf(yr);
    return padX + (i / (years.length - 1)) * (W - padX * 2);
  };
  const y = (v: number) => padTop + (1 - (v - vMin) / (vMax - vMin)) * (H - padTop - padBot);

  const winPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.year).toFixed(1)},${y(p.winner).toFixed(1)}`).join(' ');
  const crPath  = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.year).toFixed(1)},${y(p.cr).toFixed(1)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
        {/* Gridlines */}
        {[0, 0.33, 0.67, 1].map((f, i) => {
          const yy = padTop + f * (H - padTop - padBot);
          const v = vMin + (1 - f) * (vMax - vMin);
          return (
            <g key={i}>
              <line x1={padX} x2={W - padX} y1={yy} y2={yy} stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.5" />
              <text x={padX - 8} y={yy + 3} textAnchor="end" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.5" letterSpacing="0.04em">
                {formatTime(Math.round(v))}
              </text>
            </g>
          );
        })}
        {/* Year labels */}
        {years.map(yr => (
          <text key={yr} x={x(yr)} y={H - padBot + 14} textAnchor="middle" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.55" letterSpacing="0.06em">
            {yr}
          </text>
        ))}

        {/* CR line (dashed, subtle) */}
        <path d={crPath} fill="none" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" strokeDasharray="3 3" />
        {/* Winner line */}
        <path d={winPath} fill="none" stroke="currentColor" strokeWidth="1.25"
              style={{ strokeDasharray: 1800, strokeDashoffset: 1800, animation: 'drawIn 1400ms ease-out forwards' }} />

        {/* Dots */}
        {points.map((p, i) => {
          const isCRBroken = p.winner <= p.cr + 1; // winner matched or beat CR this year
          return (
            <g key={i}>
              <circle cx={x(p.year)} cy={y(p.cr)} r="2" fill="var(--bg)" stroke="currentColor" strokeOpacity="0.4" strokeWidth="0.75" />
              <circle cx={x(p.year)} cy={y(p.winner)} r={isCRBroken ? 4 : 2.5}
                      fill={isCRBroken ? 'currentColor' : 'var(--bg)'}
                      stroke="currentColor" strokeWidth="1" />
              <rect x={x(p.year) - 20} y={padTop} width="40" height={H - padTop - padBot}
                    fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hover !== null && (() => {
          const p = points[hover];
          const xx = x(p.year);
          const crBroken = p.winner <= p.cr + 1;
          const lines: [string, string][] = [
            ['Winner', formatTime(p.winner)],
            ['CR', formatTime(p.cr)],
          ];
          if (crBroken) lines.push(['★ CR set', String(p.year)]);
          return (
            <g pointerEvents="none">
              <line x1={xx} x2={xx} y1={padTop} y2={H - padBot} stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" />
              <g transform={`translate(${Math.min(xx + 10, W - 148)},${padTop + 4})`}>
                <rect width="138" height={crBroken ? 66 : 54} fill="var(--bg)" stroke="currentColor" strokeWidth="0.5" />
                <text x="10" y="14" fontSize="10" fontFamily="DM Mono, monospace" fill="currentColor" letterSpacing="0.1em">{p.year}</text>
                {lines.map((l, li) => (
                  <g key={li}>
                    <text x="10" y={28 + li * 12} fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.55">{l[0]}</text>
                    <text x="128" y={28 + li * 12} textAnchor="end" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor">{l[1]}</text>
                  </g>
                ))}
              </g>
            </g>
          );
        })()}
      </svg>
      <div className="flex gap-24 mt-12" style={{ fontSize: 11, color: 'var(--meta)', flexWrap: 'wrap' }}>
        <div className="flex ai-center gap-8">
          <span style={{ width: 18, height: 1.25, background: 'currentColor', display: 'inline-block' }} />
          Winner each year
        </div>
        <div className="flex ai-center gap-8">
          <span style={{ width: 18, display: 'inline-block', height: 0, borderTop: '0.75px dashed currentColor', opacity: 0.5 }} />
          Course record
        </div>
        <div className="flex ai-center gap-8">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          CR broken
        </div>
      </div>
    </div>
  );
}
