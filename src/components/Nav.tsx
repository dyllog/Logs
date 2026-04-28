import { Link, useLocation } from 'react-router-dom';

const items = [
  { id: 'races',      label: 'Races',      href: '/races' },
  { id: 'results',    label: 'Results',    href: '/results' },
  { id: 'records',    label: 'Records',    href: '/records' },
  { id: 'athletes',   label: 'Athletes',   href: '/athletes' },
  { id: 'calculator', label: 'Calculator', href: '/calculator' },
];

interface NavProps {
  onOpenSearch: () => void;
}

export default function Nav({ onOpenSearch }: NavProps) {
  const location = useLocation();
  const active = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <nav className="nav">
      <Link to="/" className="wordmark">
        LOGS<sup>NZ · est 2024</sup>
      </Link>
      <div className="nav-items">
        {items.map(i => (
          <Link
            key={i.id}
            to={i.href}
            className={`nav-item ${active(i.href) ? 'active' : ''}`}
          >
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
    </nav>
  );
}
