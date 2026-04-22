import { useState } from "react";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";

const athletes = [
  { name: "Stephen Kogo", club: "Unattached", nationality: "KEN", results: 4, pb: "2:08:31", pbRace: "Auckland Marathon" },
  { name: "Hamish Carson", club: "Athletics New Zealand", nationality: "NZL", results: 12, pb: "2:19:52", pbRace: "Queenstown Marathon" },
  { name: "Kim Smith", club: "Athletics New Zealand", nationality: "NZL", results: 9, pb: "2:31:05", pbRace: "Wellington Marathon" },
  { name: "Vajin Armstrong", club: "Tasman Athletics", nationality: "NZL", results: 7, pb: "7:44:21", pbRace: "Tarawera Ultra" },
  { name: "Zane Robertson", club: "Athletics New Zealand", nationality: "NZL", results: 6, pb: "24:01", pbRace: "Round the Bays" },
  { name: "Nikki Wynd", club: "Wellington Harriers", nationality: "NZL", results: 8, pb: "9:02:14", pbRace: "Tarawera Ultra" },
  { name: "Tom Rangi", club: "Wellington Harriers", nationality: "NZL", results: 5, pb: "2:31:07", pbRace: "Rotorua Marathon" },
  { name: "Sarah Okonkwo", club: "Christchurch Road Runners", nationality: "NZL", results: 6, pb: "2:41:33", pbRace: "Rotorua Marathon" },
];

const Athletes = () => {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? athletes.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.club.toLowerCase().includes(search.toLowerCase())
      )
    : athletes;

  return (
    <div style={{ backgroundColor: "#f5f4f0", minHeight: "100vh" }}>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-16">
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
            Athletes
          </h1>

          <input
            type="text"
            placeholder="Search by name or club..."
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
              {["Athlete", "Club", "Nat.", "Races logged", "PB", "PB race"].map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left",
                    paddingBottom: "10px",
                    paddingRight: "24px",
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
            {filtered.map((athlete, i) => (
              <tr
                key={i}
                style={{ cursor: "pointer", transition: "background-color 0.1s" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "#eeecea")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                }
              >
                <td
                  style={{
                    padding: "13px 24px 13px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "14px",
                    color: "#1a1a18",
                    fontFamily: '"DM Serif Display", Georgia, serif',
                  }}
                >
                  {athlete.name}
                </td>
                <td style={{ padding: "13px 24px 13px 0", borderBottom: "0.5px solid #c8c6be", color: "#6b6b65" }}>{athlete.club}</td>
                <td style={{ padding: "13px 24px 13px 0", borderBottom: "0.5px solid #c8c6be", color: "#6b6b65" }}>{athlete.nationality}</td>
                <td style={{ padding: "13px 24px 13px 0", borderBottom: "0.5px solid #c8c6be", color: "#6b6b65" }}>{athlete.results}</td>
                <td
                  style={{
                    padding: "13px 24px 13px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "14px",
                    color: "#1a1a18",
                    fontFamily: '"DM Serif Display", Georgia, serif',
                  }}
                >
                  {athlete.pb}
                </td>
                <td style={{ padding: "13px 0", borderBottom: "0.5px solid #c8c6be", color: "#6b6b65" }}>{athlete.pbRace}</td>
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
            No athletes found for "{search}".
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default Athletes;
