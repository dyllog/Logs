import { useState } from 'react';

interface ElevationChartProps {
  data: [number, number][];
  annotations: { km: number; label: string }[];
}

export default function ElevationChart({ data, annotations }: ElevationChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 680, H = 200;
  const padX = 40, padTop = 28, padBot = 40;
  const xs = data.map(d => d[0]);
  const ys = data.map(d => d[1]);
  const xMax = Math.max(...xs);
  const yMin = 0;
  const yMax = Math.max(...ys) + 20;
  const x = (v: number) => padX + (v / xMax) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - (v - yMin) / (yMax - yMin)) * (H - padTop - padBot);

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(d[0]).toFixed(1)},${y(d[1]).toFixed(1)}`).join(' ');
  const area = path + ` L${x(xMax).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 50, 100].map(v => (
        <g key={v}>
          <line x1={padX} x2={W - padX} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
          <text x={padX - 8} y={y(v) + 3} textAnchor="end" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.5" letterSpacing="0.08em">
            {v}m
          </text>
        </g>
      ))}
      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 42.2].map(k => (
        <text key={k} x={x(k)} y={H - padBot + 16} textAnchor="middle" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.55" letterSpacing="0.08em">
          {k}
        </text>
      ))}
      <text x={W / 2} y={H - padBot + 30} textAnchor="middle" fontSize="8" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.4" letterSpacing="0.14em">
        DISTANCE · KM
      </text>
      <path d={area} fill="currentColor" fillOpacity="0.04" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1"
            style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'drawIn 1800ms ease-out forwards' }} />
      {annotations.map((a, i) => {
        const ax = x(a.km);
        const ptY = data.reduce((acc, d) => Math.abs(d[0] - a.km) < Math.abs(acc[0] - a.km) ? d : acc, data[0])[1];
        const ay = y(ptY);
        return (
          <g key={i}>
            <line x1={ax} x2={ax} y1={ay} y2={padTop + 6} stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx={ax} cy={ay} r="2.5" fill="var(--bg)" stroke="currentColor" strokeWidth="1" />
            <text
              x={ax}
              y={padTop - (i % 2 === 0 ? 0 : 10)}
              textAnchor={i === 0 ? 'start' : i === annotations.length - 1 ? 'end' : 'middle'}
              fontSize="9"
              fontFamily="DM Mono, monospace"
              fill="currentColor"
              letterSpacing="0.08em"
            >
              {a.label}
            </text>
          </g>
        );
      })}
      <rect
        x={padX} y={padTop}
        width={W - padX * 2}
        height={H - padTop - padBot}
        fill="transparent"
        onMouseMove={e => {
          const rect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
          const rel = (e.clientX - rect.left) / rect.width;
          const km = rel * xMax;
          const idx = data.reduce((best, d, i) => Math.abs(d[0] - km) < Math.abs(data[best][0] - km) ? i : best, 0);
          setHover(idx);
        }}
        onMouseLeave={() => setHover(null)}
      />
      {hover !== null && (() => {
        const d = data[hover];
        const xx = x(d[0]), yy = y(d[1]);
        return (
          <g pointerEvents="none">
            <line x1={xx} x2={xx} y1={padTop} y2={H - padBot} stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" />
            <circle cx={xx} cy={yy} r="3" fill="var(--bg)" stroke="currentColor" strokeWidth="1" />
            <g transform={`translate(${Math.min(xx + 8, W - 120)},${yy - 40})`}>
              <rect width="108" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="0.5" />
              <text x="8" y="14" fontSize="10" fontFamily="DM Mono, monospace" fill="currentColor">km {d[0].toFixed(1)}</text>
              <text x="8" y="28" fontSize="9.5" fontFamily="DM Mono, monospace" fill="currentColor" fillOpacity="0.7">{d[1]} m</text>
            </g>
          </g>
        );
      })()}
    </svg>
  );
}
