import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";

const records = [
  { race: "Auckland Marathon", distance: "42.2 km", gender: "M", holder: "Stephen Kogo", time: "2:08:31", year: 2023, nationality: "KEN" },
  { race: "Auckland Marathon", distance: "42.2 km", gender: "F", holder: "Contestina Mwangi", time: "2:33:34", year: 2019, nationality: "KEN" },
  { race: "Rotorua Marathon", distance: "42.2 km", gender: "M", holder: "Gideon Chirchir", time: "2:14:08", year: 2018, nationality: "KEN" },
  { race: "Rotorua Marathon", distance: "42.2 km", gender: "F", holder: "Naomi Muhia", time: "2:38:44", year: 2017, nationality: "KEN" },
  { race: "Queenstown Marathon", distance: "42.2 km", gender: "M", holder: "Hamish Carson", time: "2:19:52", year: 2022, nationality: "NZL" },
  { race: "Queenstown Marathon", distance: "42.2 km", gender: "F", holder: "Alana Sherburn", time: "2:43:17", year: 2022, nationality: "NZL" },
  { race: "Wellington Marathon", distance: "42.2 km", gender: "M", holder: "Tom Walsh", time: "2:22:41", year: 2019, nationality: "NZL" },
  { race: "Wellington Marathon", distance: "42.2 km", gender: "F", holder: "Kim Smith", time: "2:31:05", year: 2016, nationality: "NZL" },
  { race: "Tarawera Ultramarathon", distance: "102 km", gender: "M", holder: "Vajin Armstrong", time: "7:44:21", year: 2020, nationality: "NZL" },
  { race: "Tarawera Ultramarathon", distance: "102 km", gender: "F", holder: "Nikki Wynd", time: "9:02:14", year: 2019, nationality: "NZL" },
  { race: "Round the Bays", distance: "8.4 km", gender: "M", holder: "Zane Robertson", time: "24:01", year: 2015, nationality: "NZL" },
  { race: "Round the Bays", distance: "8.4 km", gender: "F", holder: "Kim Smith", time: "27:44", year: 2010, nationality: "NZL" },
];

const Records = () => {
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
            }}
          >
            Course Records
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
              {["Race", "Distance", "Cat.", "Holder", "Nationality", "Time", "Year"].map((col) => (
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
            {records.map((rec, i) => (
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
                <td
                  style={{
                    padding: "13px 24px 13px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "14px",
                    color: "#1a1a18",
                    fontFamily: '"DM Serif Display", Georgia, serif',
                  }}
                >
                  {rec.race}
                </td>
                <td style={{ padding: "13px 24px 13px 0", borderBottom: "0.5px solid #c8c6be", fontSize: "13px", color: "#6b6b65" }}>
                  {rec.distance}
                </td>
                <td style={{ padding: "13px 24px 13px 0", borderBottom: "0.5px solid #c8c6be", fontSize: "13px", color: "#6b6b65" }}>
                  {rec.gender}
                </td>
                <td style={{ padding: "13px 24px 13px 0", borderBottom: "0.5px solid #c8c6be", fontSize: "13px", color: "#1a1a18" }}>
                  {rec.holder}
                </td>
                <td style={{ padding: "13px 24px 13px 0", borderBottom: "0.5px solid #c8c6be", fontSize: "13px", color: "#6b6b65" }}>
                  {rec.nationality}
                </td>
                <td
                  style={{
                    padding: "13px 24px 13px 0",
                    borderBottom: "0.5px solid #c8c6be",
                    fontSize: "15px",
                    color: "#1a1a18",
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {rec.time}
                </td>
                <td style={{ padding: "13px 0", borderBottom: "0.5px solid #c8c6be", fontSize: "13px", color: "#6b6b65" }}>
                  {rec.year}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SiteFooter />
    </div>
  );
};

export default Records;
