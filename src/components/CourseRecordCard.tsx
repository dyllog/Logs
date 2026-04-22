import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const recordProgression = [
  { year: 2009, time: "2:20:14", minutes: 140.23 },
  { year: 2011, time: "2:17:52", minutes: 137.87 },
  { year: 2014, time: "2:15:08", minutes: 135.13 },
  { year: 2016, time: "2:13:41", minutes: 133.68 },
  { year: 2018, time: "2:11:22", minutes: 131.37 },
  { year: 2019, time: "2:09:45", minutes: 129.75 },
  { year: 2023, time: "2:08:31", minutes: 128.52 },
];

const current = recordProgression[recordProgression.length - 1];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = recordProgression.find((r) => r.year === label);
    return (
      <div
        style={{
          backgroundColor: "#2a2a28",
          border: "0.5px solid #3a3a38",
          padding: "8px 12px",
          fontFamily: '"DM Mono", monospace',
          fontSize: "11px",
          color: "#f5f4f0",
        }}
      >
        <div style={{ color: "#9b9b95", marginBottom: 2 }}>{label}</div>
        <div>{entry?.time}</div>
      </div>
    );
  }
  return null;
};

const CourseRecordCard = () => {
  return (
    <div
      className="w-full h-full flex flex-col justify-between p-8"
      style={{
        backgroundColor: "#1a1a18",
        minHeight: "360px",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#6b6b65",
            marginBottom: "20px",
          }}
        >
          Course Record — Auckland Marathon
        </div>

        <div className="flex flex-col gap-1 mb-2">
          <div
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "42px",
              color: "#f5f4f0",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            {current.time}
          </div>
        </div>

        <div className="flex gap-6 mt-3">
          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "2px",
              }}
            >
              Holder
            </div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "13px",
                color: "#f5f4f0",
              }}
            >
              Stephen Kogo
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "2px",
              }}
            >
              Set
            </div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "13px",
                color: "#f5f4f0",
              }}
            >
              {current.year}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6b6b65",
                marginBottom: "2px",
              }}
            >
              Distance
            </div>
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: "13px",
                color: "#f5f4f0",
              }}
            >
              42.2 km
            </div>
          </div>
        </div>
      </div>

      {/* Progression Chart */}
      <div>
        <div
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6b6b65",
            marginBottom: "12px",
          }}
        >
          Record Progression
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart
            data={recordProgression}
            margin={{ top: 4, right: 4, left: -32, bottom: 0 }}
          >
            <defs>
              <linearGradient id="recordGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f5f4f0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f5f4f0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              tick={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 10,
                fill: "#6b6b65",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#f5f4f0"
              strokeWidth={1}
              fill="url(#recordGrad)"
              dot={{ r: 2, fill: "#f5f4f0", strokeWidth: 0 }}
              activeDot={{ r: 3, fill: "#f5f4f0", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CourseRecordCard;
