import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <div className="serif">LOGS</div>
        <div className="mt-8" style={{ maxWidth: 340, fontSize: 12, lineHeight: 1.6 }}>
          {/* Not "field-verified" — the archive records results as published by
              each event; it runs no verification process of its own. */}
          A reference for New Zealand competitive running. Published results, course records, and athlete progression across the country's major events.
        </div>
      </div>
      <div>
        <div className="label mb-8">Archive</div>
        {([['Races', '/races'], ['Results', '/results'], ['Records', '/records'], ['Athletes', '/athletes']] as [string, string][]).map(([l, to]) => (
          <div key={l} style={{ marginBottom: 6 }}>
            <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }}>{l}</Link>
          </div>
        ))}
      </div>
      <div>
        <div className="label mb-8">Tools</div>
        <div style={{ marginBottom: 6 }}>
          <Link to="/calculator" style={{ color: 'inherit', textDecoration: 'none' }}>Pace Calculator</Link>
        </div>
        <div style={{ marginBottom: 6 }}>
          <Link to="/compare" style={{ color: 'inherit', textDecoration: 'none' }}>Compare</Link>
        </div>
      </div>
      <div>
        <div className="label mb-8">About</div>
        <div style={{ marginBottom: 6 }}>
          <Link to="/methodology" style={{ color: 'inherit', textDecoration: 'none' }}>Methodology</Link>
        </div>
        <div style={{ marginBottom: 6 }}>
          <a href="mailto:dyl.logannz@gmail.com?subject=LOGS%20correction" style={{ color: 'inherit', textDecoration: 'none' }}>
            Submit a correction
          </a>
        </div>
        <div style={{ marginBottom: 6 }}>
          <a href="mailto:dyl.logannz@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
        </div>
        <div className="mt-16 dimmed" style={{ fontSize: 11 }}>© 2026 LOGS</div>
      </div>
    </footer>
  );
}
