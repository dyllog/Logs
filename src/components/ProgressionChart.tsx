import { useState, useEffect, useRef } from 'react';
import { toSec } from '@/data/logsData';

interface Point {
  y: number;
  t: string;
  name: string;
  current?: boolean;
  broken?: boolean;
}

interface ProgressionChartProps {
  data: Point[];
  height?: number;
  accent?: boolean;
}

export default function ProgressionChart({ data, height = 180, accent = false }: ProgressionChartProps) {
  const points = data.map(d => ({ ...d, s: toSec(d.t) }));
  const xs = points.map(p => p.y);
  const ss = points.map(p => p.s);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const sMin = Math.min(...ss), sMax = Math.max(...ss);
  const padX = 20, padTop = 16, padBot = 28;
  const W = 560, H = height;
  const x = (v: number) => padX + ((v - xMin) / (xMax - xMin)) * (W - padX * 2);
  const y = (v: number) => padTop + ((v - sMin) / ((sMax - sMin) || 1)) * (H - padTop - padBot);

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.y).toFixed(1)},${y(p.s).toFixed(1)}`).join(' ');
  const [hover, setHover] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(800);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 0.5, 1].map((f, i) => {
        const yy = padTop + f * (H - padTop - padBot);
        return <line key={i} x1={padX} x2={W - padX} y1={yy} y2={yy} stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.5" />;
      })}
      <line x1={padX} x2={W - padX} y1={H - padBot} y2={H - padBot} stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.5" />
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray={len}
        strokeDashoffset={len}
        style={{ animation: `drawIn 1400ms ease-out forwards` }}
      />
      {points.map((p, i) => {
        const cx = x(p.y), cy = y(p.s);
        const isCurrent = p.current;
        const isBroken = accent && p.broken;
        return (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
            <circle
              cx={cx} cy={cy}
              r={isCurrent ? 4 : 2.5}
              fill={isBroken ? 'var(--accent)' : (isCurrent ? 'currentColor' : 'var(--bg)')}
              stroke={isBroken ? 'var(--accent)' : 'currentColor'}
              strokeWidth="1"
            />
            <circle cx={cx} cy={cy} r="10" fill="transparent" />
            {isCurrent && (
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="9" fontFamily="DM Mono, monospace" fill="currentColor" letterSpacing="0.06em">
                {p.t}
              </text>
            )}
          </g>
        );
      })}
      {[points[0], points[points.length - 1]].map((p, i) => (
        <text
          key={i}
          x={i === 0 ? padX : W - padX}
          y={H - padBot + 16}
          textAnchor={i === 0 ? 'start' : 'end'}
          fontSize="9"
          fontFamily="DM Mono, monospace"
          fill="currentColor"
          fillOpacity="0.6"
          letterSpacing="0.1em"
        >
          {p.y}
        </text>
      ))}
      {hover !== null && (() => {
        const p = points[hover];
        const cx = x(p.y), cy = y(p.s);
        const label = `${p.y} · ${p.t} · ${p.name}`;
        const w = label.length * 5.5 + 12;
        const tx = Math.max(padX, Math.min(W - padX - w, cx - w / 2));
        return (
          <g pointerEvents="none">
            <line x1={cx} x2={cx} y1={padTop} y2={H - padBot} stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.5" strokeDasharray="2 2" />
            <rect x={tx} y={cy - 34} width={w} height="20" fill="var(--bg)" stroke="currentColor" strokeWidth="0.5" />
            <text x={tx + 6} y={cy - 20} fontSize="9.5" fontFamily="DM Mono, monospace" fill="currentColor" letterSpacing="0.04em">
              {label}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}
