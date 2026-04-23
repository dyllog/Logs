import { useState } from "react";

const allResults = [
  { event: "Rotorua Marathon", year: 2025, distance: "42.2 km", pos: 1, name: "James Mwangi", category: "M Open", club: "Auckland City Runners", time: "2:28:14" },
  { event: "Rotorua Marathon", year: 2025, distance: "42.2 km", pos: 2, name: "Tom Rangi", category: "M Open", club: "Wellington Harriers", time: "2:31:07" },
  { event: "Rotorua Marathon", year: 2025, distance: "42.2 km", pos: 3, name: "David Park", category: "M40", club: "North Shore AC", time: "2:33:52" },
  { event: "Rotorua Marathon", year: 2025, distance: "42.2 km", pos: 4, name: "Sarah Okonkwo", category: "F Open", club: "Christchurch Road Runners", time: "2:41:33" },
  { event: "Auckland Marathon", year: 2024, distance: "42.2 km", pos: 1, name: "Stephen Kogo", category: "M Open", club: "Unattached", time: "2:08:31" },
  { event: "Auckland Marathon", year: 2024, distance: "42.2 km", pos: 2, name: "Daniel Kipchoge", category: "M Open", club: "Unattached", time: "2:10:44" },
  { event: "Auckland Marathon", year: 2024, distance: "42.2 km", pos: 3, name: "Grace Whitfield", category: "F Open", club: "Wellington Harriers", time: "2:43:01" },
  { event: "Wellington Marathon", year: 2024, distance: "42.2 km", pos: 1, name: "Mike Sutherland", category: "M Open", club: "Unattached", time: "2:34:19" },
  { event: "Wellington Marathon", year: 2024, distance: "21.1 km", pos: 1, name: "Emma Tane", category: "F Open", club: "Auckland City Runners", time: "1:19:22" },
];

const Results = () => {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? allResults.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.event.toLowerCase().includes(search.toLowerCase())
      )
    : allResults;

  return (
    <main>
      <div className="page" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#6b6b65",
              marginBottom: "12px",
            }}
          >
            Archive
          </div>
          <h1
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "36px",
              color: "#1a1a18",
              marginBottom: "32px",
            }}
          >
            Results
          </h1>

          <input
            type="text"
            placeholder="Search by name or race..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: "13px",
              color: "#1a1a18",
              backgroundColor: "transparent",
              border: "0.5px solid #c8c6be",
              padding: "10px 14px",
              width: "100%",
              maxWidth: "400px",
              outline: "none",
              borderRadius: 0,
            }}
            onFocus={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "#1a1a18")
            }
            onBlur={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "#c8c6be")
            }
          />
        </div>

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
              {["Event", "Year", "Dist.", "Pos", "Name", "Age group", "Club", "Time"].map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left",
                    paddingBottom: "10px",
                    paddingRight: "20px",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#6b6b65",
                    fontWeight: 400,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={i}
                style={{ transition: "background-color 0.1s" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "#eeecea")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                }
              >
                {[
                  { val: row.event, serif: true },
                  { val: row.year, serif: false },
                  { val: row.distance, serif: false },
                  { val: row.pos, serif: false },
                  { val: row.name, serif: false },
                  { val: row.category, serif: false },
                  { val: row.club, serif: false },
                  { val: row.time, serif: false },
                ].map(({ val, serif }, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "12px 20px 12px 0",
                      borderBottom: "0.5px solid #c8c6be",
                      color: j === 0 || j === 4 ? "#1a1a18" : "#6b6b65",
                      fontFamily: serif
                        ? '"DM Serif Display", Georgia, serif'
                        : '"DM Mono", monospace',
                      fontSize: serif ? "14px" : "13px",
                      whiteSpace: j === 7 ? "nowrap" : undefined,
                    }}
                  >
                    {String(val)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: "13px",
              color: "#6b6b65",
              paddingTop: "40px",
            }}
          >
            No results found for "{search}".
          </div>
        )}
      </div>
    </main>
  );
};

export default Results;
