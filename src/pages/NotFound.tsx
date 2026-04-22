import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Nav from "@/components/Nav";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div style={{ backgroundColor: "#f5f4f0", minHeight: "100vh" }}>
      <Nav />
      <div
        className="max-w-6xl mx-auto px-6"
        style={{ paddingTop: "120px" }}
      >
        <div
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#6b6b65",
            marginBottom: "16px",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: "36px",
            color: "#1a1a18",
            marginBottom: "16px",
          }}
        >
          Page not found.
        </h1>
        <p
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: "14px",
            color: "#6b6b65",
            marginBottom: "32px",
          }}
        >
          The record you're looking for doesn't exist in the archive.
        </p>
        <Link
          to="/"
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6b6b65",
            textDecoration: "none",
            borderBottom: "0.5px solid #c8c6be",
            paddingBottom: "1px",
          }}
        >
          Back to archive
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
