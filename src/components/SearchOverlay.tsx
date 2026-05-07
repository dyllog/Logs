import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const suggestions = [
  { kind: 'athlete', name: 'Daniel Jones',       meta: 'NZL · Auckland 2020 2021 2022 winner',   href: '/athletes/daniel-jones' },
  { kind: 'athlete', name: 'Daniel Balchin',     meta: 'NZL · Auckland 2023 2024 2025 winner',   href: '/athletes/daniel-balchin' },
  { kind: 'athlete', name: 'Michael Voss',       meta: 'NZL · Rotorua 5× winner',                href: '/athletes/michael-voss' },
  { kind: 'athlete', name: 'Ciaran Faherty',     meta: 'NZL · CHC 2017 · ROT 2019 · QT 2024',   href: '/athletes/ciaran-faherty' },
  { kind: 'athlete', name: 'Cameron Graves',     meta: 'NZL · Auckland Half CR 2020',            href: '/athletes/cameron-graves' },
  { kind: 'athlete', name: 'Blair McWhirter',    meta: 'NZL · Rotorua 2018 winner',              href: '/athletes/blair-mcwhirter' },
  { kind: 'athlete', name: 'Jonathan Jackson',   meta: 'NZL · Auckland 2016 2nd',                href: '/athletes/jonathan-jackson' },
  { kind: 'athlete', name: 'Oska Inkster-Baynes',meta: 'NZL · Auckland 2016 winner',             href: '/athletes/oska-inkster-baynes' },
  { kind: 'race',    name: 'Auckland Marathon',  meta: 'Road · est 1992',                         href: '/races/auckland-marathon' },
  { kind: 'race',    name: 'Rotorua Marathon',   meta: 'Road · est 1967',                         href: '/races/rotorua-marathon' },
  { kind: 'race',    name: 'Christchurch Marathon', meta: 'Road · est 2007',                      href: '/races/christchurch-marathon' },
  { kind: 'race',    name: 'Queenstown Marathon', meta: 'Mixed · est 2014',                       href: '/races/queenstown-marathon' },
  { kind: 'race',    name: "Hawke's Bay Marathon", meta: 'Road · est 2016',                       href: '/races/hawkes-bay-marathon' },
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
