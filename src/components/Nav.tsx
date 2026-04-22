import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Races", href: "/races" },
  { label: "Results", href: "/results" },
  { label: "Records", href: "/records" },
  { label: "Athletes", href: "/athletes" },
];

const Nav = () => {
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ borderColor: "#c8c6be", backgroundColor: "#f5f4f0" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-display text-xl text-logs-ink leading-none select-none"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          LOGS
        </Link>

        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="text-2xs uppercase tracking-label font-mono transition-colors"
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: active ? "#1a1a18" : "#6b6b65",
                  textDecoration: "none",
                  borderBottom: active ? "1px solid #1a1a18" : "none",
                  paddingBottom: active ? "1px" : "2px",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Nav;
