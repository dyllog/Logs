const races = [
  { name: "Auckland Marathon", location: "Auckland", date: "26 Oct 2025", distances: ["42.2 km", "21.1 km", "10 km"], surface: "Road", since: "1986" },
  { name: "Rotorua Marathon", location: "Rotorua", date: "3 May 2025", distances: ["42.2 km", "21.1 km"], surface: "Road", since: "1967" },
  { name: "Queenstown International Marathon", location: "Queenstown", date: "22 Nov 2025", distances: ["42.2 km", "21.1 km", "10 km"], surface: "Road", since: "2014" },
  { name: "Wellington Marathon", location: "Wellington", date: "8 Jun 2025", distances: ["42.2 km", "21.1 km", "10 km"], surface: "Road", since: "2011" },
  { name: "Tarawera Ultramarathon", location: "Rotorua", date: "8 Feb 2026", distances: ["102 km", "50 km", "21 km"], surface: "Trail", since: "2008" },
  { name: "Round the Bays", location: "Auckland", date: "2 Aug 2025", distances: ["8.4 km", "5 km"], surface: "Road", since: "1972" },
  { name: "Christchurch Marathon", location: "Christchurch", date: "13 Jul 2025", distances: ["42.2 km", "21.1 km"], surface: "Road", since: "2008" },
  { name: "Mountain to Surf", location: "Egmont National Park", date: "21 Sep 2025", distances: ["37 km"], surface: "Trail", since: "1977" },
];

const Races = () => {
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
            }}
          >
            Races
          </h1>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: '"DM Mono", monospace',
          }}
        >
          <thead>
            <tr style={{ borderBottom: "0.5px solid #c8c6be" }}>
              {["Race", "Location", "Next date", "Distances", "Surface", "Est."].map((col) => (
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
            {races.map((race, i) => (
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
                    padding: "14px 24px 14px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "14px",
                    color: "#1a1a18",
                    fontFamily: '"DM Serif Display", Georgia, serif',
                  }}
                >
                  {race.name}
                </td>
                <td
                  style={{
                    padding: "14px 24px 14px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "13px",
                    color: "#6b6b65",
                  }}
                >
                  {race.location}
                </td>
                <td
                  style={{
                    padding: "14px 24px 14px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "13px",
                    color: "#6b6b65",
                    whiteSpace: "nowrap",
                  }}
                >
                  {race.date}
                </td>
                <td
                  style={{
                    padding: "14px 24px 14px 0",
                    borderBottom: "0.5px solid #c8c6be",
                  }}
                >
                  <div className="flex flex-wrap gap-1">
                    {race.distances.map((d) => (
                      <span
                        key={d}
                        style={{
                          fontSize: "10px",
                          color: "#6b6b65",
                          border: "0.5px solid #c8c6be",
                          borderRadius: "4px",
                          padding: "2px 7px",
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 24px 14px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "13px",
                    color: "#6b6b65",
                  }}
                >
                  {race.surface}
                </td>
                <td
                  style={{
                    padding: "14px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "13px",
                    color: "#6b6b65",
                  }}
                >
                  {race.since}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Races;
