import { Link } from "react-router-dom";

const races = [
  {
    id: 1,
    date: "3 May 2025",
    name: "Rotorua Marathon",
    location: "Rotorua",
    distances: ["42.2 km", "21.1 km"],
    surface: "Road",
  },
  {
    id: 2,
    date: "8 Jun 2025",
    name: "Wellington Marathon",
    location: "Wellington",
    distances: ["42.2 km", "21.1 km", "10 km"],
    surface: "Road",
  },
  {
    id: 2,
    date: "27 Jul 2025",
    name: "Tarawera Ultramarathon",
    location: "Rotorua",
    distances: ["102 km", "50 km", "21 km"],
    surface: "Trail",
  },
  {
    id: 3,
    date: "2 Aug 2025",
    name: "Round the Bays",
    location: "Auckland",
    distances: ["8.4 km", "5 km"],
    surface: "Road",
  },
  {
    id: 4,
    date: "26 Oct 2025",
    name: "Auckland Marathon",
    location: "Auckland",
    distances: ["42.2 km", "21.1 km", "10 km"],
    surface: "Road",
  },
  {
    id: 5,
    date: "22 Nov 2025",
    name: "Queenstown International Marathon",
    location: "Queenstown",
    distances: ["42.2 km", "21.1 km", "10 km"],
    surface: "Road",
  },
];

const surfaceColor: Record<string, string> = {
  Road: "#6b6b65",
  Trail: "#6b6b65",
  Ultra: "#6b6b65",
};

const UpcomingRaces = () => {
  return (
    <section className="border-b" style={{ borderColor: "#c8c6be" }}>
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Section header */}
        <div className="flex items-baseline justify-between mb-10">
          <h2
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "22px",
              color: "#1a1a18",
            }}
          >
            Upcoming races
          </h2>
          <Link
            to="/races"
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
            Full calendar
          </Link>
        </div>

        {/* Race grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {races.map((race, i) => (
            <div
              key={i}
              className="group"
              style={{
                borderTop: "0.5px solid #c8c6be",
                borderRight: (i + 1) % 3 === 0 || i === races.length - 1 ? "none" : "0.5px solid #c8c6be",
                padding: "20px 0 20px 0",
                paddingRight: "24px",
                cursor: "pointer",
                transition: "background-color 0.12s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "#eeecea")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
              }
            >
              <div style={{ padding: "0 20px" }}>
                <div
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: "11px",
                    color: "#6b6b65",
                    marginBottom: "8px",
                  }}
                >
                  {race.date}
                </div>
                <div
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontSize: "18px",
                    color: "#1a1a18",
                    marginBottom: "4px",
                    lineHeight: 1.2,
                  }}
                >
                  {race.name}
                </div>
                <div
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: "12px",
                    color: "#6b6b65",
                    marginBottom: "12px",
                  }}
                >
                  {race.location}
                </div>
                <div className="flex flex-wrap gap-1">
                  {race.distances.map((d) => (
                    <span
                      key={d}
                      style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: "10px",
                        letterSpacing: "0.06em",
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
              </div>
            </div>
          ))}
        </div>

        {/* Bottom border */}
        <div style={{ borderTop: "0.5px solid #c8c6be", marginTop: "0" }} />
      </div>
    </section>
  );
};

export default UpcomingRaces;
