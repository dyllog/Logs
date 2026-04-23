import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const suggestions = [
  { kind: 'athlete', name: 'Daniel Whareaitu',  meta: 'Wellington Scottish · Marathon CR 2023', href: '/athletes/daniel-whareaitu' },
  { kind: 'athlete', name: 'Camille Buchanan',  meta: 'Auckland Harriers · Marathon CR 2024',  href: '/athletes/daniel-whareaitu' },
  { kind: 'race',    name: 'Auckland Marathon',  meta: 'Road · est 1992 · 33 editions',          href: '/races/auckland-marathon' },
  { kind: 'race',    name: 'Rotorua Marathon',   meta: 'Road · est 1967',                        href: '/races' },
  { kind: 'race',    name: 'Tarawera Ultra',     meta: 'Trail · Rotorua',                        href: '/races' },
];

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && ref.current) ref.current.focus();
    if (!open) setQ('');
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const matches = q.length < 2
    ? suggestions
    : suggestions.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));

  const pick = (href: string) => {
    onClose();
    navigate(href);
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-box" onClick={e => e.stopPropagation()}>
        <div className="search-box-inner">
          <div className="label mb-8">Search athletes, races, results</div>
          <input
            ref={ref}
            className="input"
            placeholder="e.g. Whareaitu · Auckland Marathon · 2023"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ fontSize: 16 }}
          />
          <div className="label" style={{ marginTop: 8, opacity: 0.5 }}>ESC to close</div>
        </div>
        <div>
          {matches.map((m, i) => (
            <div key={i} className="search-result-item" onClick={() => pick(m.href)}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--meta)', minWidth: 52 }}>
                {m.kind}
              </div>
              <div>
                <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 16 }}>{m.name}</div>
                <div className="dimmed" style={{ fontSize: 11, marginTop: 2 }}>{m.meta}</div>
              </div>
            </div>
          ))}
          {q.length >= 2 && matches.length === 0 && (
            <div className="dimmed" style={{ padding: '24px', fontSize: 13 }}>
              No results for "{q}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
