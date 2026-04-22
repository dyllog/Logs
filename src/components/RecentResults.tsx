import { Link } from "react-router-dom";

const results = [
  { pos: 1, name: "James Mwangi", category: "M Open", club: "Auckland City Runners", time: "2:28:14" },
  { pos: 2, name: "Tom Rangi", category: "M Open", club: "Wellington Harriers", time: "2:31:07" },
  { pos: 3, name: "David Park", category: "M40", club: "North Shore AC", time: "2:33:52" },
  { pos: 4, name: "Mike Sutherland", category: "M Open", club: "Unattached", time: "2:34:19" },
  { pos: 5, name: "Sarah Okonkwo", category: "F Open", club: "Christchurch Road Runners", time: "2:41:33" },
  { pos: 6, name: "Emma Tane", category: "F Open", club: "Auckland City Runners", time: "2:43:01" },
  { pos: 7, name: "Paul Drummond", category: "M45", club: "Rotorua Road Runners", time: "2:44:56" },
  { pos: 8, name: "Grace Whitfield", category: "F Open", club: "Wellington Harriers", time: "2:46:22" },
];

const cols = [
  { key: "pos", label: "Pos", width: "52px", align: "right" as const },
  { key: "name", label: "Name", width: "auto", align: "left" as const },
  { key: "category", label: "Age group", width: "100px", align: "left" as const },
  { key: "club", label: "Club", width: "auto", align: "left" as const },
  { key: "time", label: "Time", width: "80px", align: "right" as const },
];

const RecentResults = () => {
  return (
    <section className="border-b" style={{ borderColor: "#c8c6be" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Section header */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "6px",
              }}
            >
              Most recent — 15 Mar 2025
            </div>
            <h2
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: "22px",
                color: "#1a1a18",
              }}
            >
              Rotorua Marathon 2025
            </h2>
          </div>
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
              whiteSpace: "nowrap",
            }}
          >
            Full results
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ marginTop: "24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: '"DM Mono", monospace',
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "0.5px solid #c8c6be" }}>
                {cols.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      textAlign: col.align,
                      paddingBottom: "10px",
                      paddingRight: col.key === "pos" ? "20px" : "16px",
                      fontFamily: '"DM Mono", monospace',
                      fontSize: "10px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#6b6b65",
                      fontWeight: 400,
                      width: col.width !== "auto" ? col.width : undefined,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr
                  key={i}
                  style={{ cursor: "default", transition: "background-color 0.1s" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "#eeecea")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                  }
                >
                  <td
                    style={{
                      textAlign: "right",
                      padding: "11px 20px 11px 0",
                      borderBottom: "0.5px solid #c8c6be",
                      color: "#6b6b65",
                      fontSize: "12px",
                    }}
                  >
                    {row.pos}
                  </td>
                  <td
                    style={{
                      padding: "11px 16px 11px 0",
                      borderBottom: "0.5px solid #c8c6be",
                      color: "#1a1a18",
                    }}
                  >
                    {row.name}
                  </td>
                  <td
                    style={{
                      padding: "11px 16px 11px 0",
                      borderBottom: "0.5px solid #c8c6be",
                      color: "#6b6b65",
                      fontSize: "12px",
                    }}
                  >
                    {row.category}
                  </td>
                  <td
                    style={{
                      padding: "11px 16px 11px 0",
                      borderBottom: "0.5px solid #c8c6be",
                      color: "#6b6b65",
                      fontSize: "12px",
                    }}
                  >
                    {row.club}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      padding: "11px 0",
                      borderBottom: "0.5px solid #c8c6be",
                      color: "#1a1a18",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RecentResults;
