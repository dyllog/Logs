import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const items = [
  { id: 'races',      label: 'Races',      href: '/races' },
  { id: 'results',    label: 'Results',    href: '/results' },
  { id: 'records',    label: 'Records',    href: '/records' },
  { id: 'athletes',   label: 'Athletes',   href: '/athletes' },
  { id: 'calculator', label: 'Calculator', href: '/calculator' },
  { id: 'compare',    label: 'Compare',    href: '/compare' },
];

interface NavProps {
  onOpenSearch: () => void;
}

export default function Nav({ onOpenSearch }: NavProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);
  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="nav">
        <Link to="/" className="wordmark" onClick={close}>
          LOGS<sup>NZ · est 2024</sup>
        </Link>
        {/* Desktop nav */}
        <div className="nav-items">
          {items.map(i => (
            <Link key={i.id} to={i.href} className={`nav-item ${active(i.href) ? 'active' : ''}`}>
              {i.label}
            </Link>
          ))}
          <button className="search-btn" onClick={onOpenSearch} aria-label="Search">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="5" cy="5" r="3.5"/>
              <line x1="7.6" y1="7.6" x2="10.5" y2="10.5"/>
            </svg>
          </button>
        </div>
        {/* Mobile right controls */}
        <div className="nav-mobile-right">
          <button className="search-btn" onClick={onOpenSearch} aria-label="Search">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="5" cy="5" r="3.5"/>
              <line x1="7.6" y1="7.6" x2="10.5" y2="10.5"/>
            </svg>
          </button>
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen
              ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
              : <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="0" y1="1" x2="14" y2="1"/><line x1="0" y1="5" x2="14" y2="5"/><line x1="0" y1="9" x2="14" y2="9"/></svg>
            }
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="nav-mobile-menu">
          {items.map(i => (
            <Link key={i.id} to={i.href}
                  className={`nav-item nav-mobile-item ${active(i.href) ? 'active' : ''}`}
                  onClick={close}>
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
