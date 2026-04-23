import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <main>
      <div className="page" style={{ paddingTop: 120 }}>
        <div className="eyebrow mb-16">404</div>
        <h1 className="serif" style={{ fontSize: 36, marginBottom: 16 }}>Page not found.</h1>
        <p className="dimmed" style={{ fontSize: 14, marginBottom: 32 }}>
          The record you're looking for doesn't exist in the archive.
        </p>
        <Link to="/" className="btn-ghost">Back to archive</Link>
      </div>
    </main>
  );
};

export default NotFound;
