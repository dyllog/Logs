import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer
      className="border-t"
      style={{ borderColor: "#c8c6be", backgroundColor: "#f5f4f0" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: "20px",
                color: "#1a1a18",
                marginBottom: "10px",
              }}
            >
              LOGS
            </div>
            <p
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "12px",
                lineHeight: 1.7,
                color: "#6b6b65",
                maxWidth: "200px",
              }}
            >
              The permanent archive for New Zealand competitive running.
            </p>
          </div>

          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "14px",
              }}
            >
              Archive
            </div>
            {["Races", "Results", "Records", "Athletes"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                style={{
                  display: "block",
                  fontFamily: '"DM Mono", monospace',
                  fontSize: "12px",
                  color: "#6b6b65",
                  textDecoration: "none",
                  marginBottom: "8px",
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#1a1a18")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#6b6b65")
                }
              >
                {item}
              </Link>
            ))}
          </div>

          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "14px",
              }}
            >
              Races
            </div>
            {[
              "Auckland Marathon",
              "Rotorua Marathon",
              "Queenstown Marathon",
              "Tarawera Ultra",
              "Wellington Marathon",
            ].map((race) => (
              <div
                key={race}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: "12px",
                  color: "#6b6b65",
                  marginBottom: "8px",
                }}
              >
                {race}
              </div>
            ))}
          </div>

          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "14px",
              }}
            >
              About
            </div>
            {["About LOGS", "Submit results", "Contact"].map((item) => (
              <div
                key={item}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: "12px",
                  color: "#6b6b65",
                  marginBottom: "8px",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "0.5px solid #c8c6be",
            paddingTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: "11px",
              color: "#6b6b65",
            }}
          >
            © {new Date().getFullYear()} LOGS. All rights reserved.
          </span>
          <span
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: "11px",
              color: "#6b6b65",
            }}
          >
            logs.co.nz
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
