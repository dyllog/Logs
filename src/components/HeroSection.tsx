import { Link } from "react-router-dom";
import CourseRecordCard from "./CourseRecordCard";

const distanceTags = ["Road", "Trail", "Ultra", "Half Marathon", "10 km"];

const HeroSection = () => {
  return (
    <section
      className="border-b"
      style={{ borderColor: "#c8c6be" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Editorial */}
          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "24px",
              }}
            >
              New Zealand Competitive Running
            </div>

            <h1
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1.05,
                color: "#1a1a18",
                marginBottom: "24px",
                letterSpacing: "-0.01em",
              }}
            >
              The permanent archive for NZ competitive running.
            </h1>

            <p
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#6b6b65",
                marginBottom: "32px",
                maxWidth: "440px",
              }}
            >
              Results, records, and race intelligence that currently exists
              nowhere — built for the runners who actually care about the
              numbers.
            </p>

            {/* Distance filter tags */}
            <div className="flex flex-wrap gap-2 mb-10">
              {distanceTags.map((tag) => (
                <button
                  key={tag}
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    color: "#6b6b65",
                    border: "0.5px solid #c8c6be",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#1a1a18";
                    (e.currentTarget as HTMLElement).style.color = "#1a1a18";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#c8c6be";
                    (e.currentTarget as HTMLElement).style.color = "#6b6b65";
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex gap-6 items-center">
              <Link
                to="/races"
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#f5f4f0",
                  backgroundColor: "#1a1a18",
                  padding: "10px 20px",
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                Browse races
              </Link>
              <Link
                to="/results"
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
                Search results
              </Link>
            </div>
          </div>

          {/* Right: Course Record Card */}
          <div>
            <CourseRecordCard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
