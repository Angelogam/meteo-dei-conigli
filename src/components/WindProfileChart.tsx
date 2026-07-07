import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WindData {
  altitude: string;
  speed: number;
  direction: number;
}

interface WindProfileChartProps {
  surfaceWind: { speed: number; direction: number };
  wind1500m: { speed: number; direction: number };
  wind2500m: { speed: number; direction: number };
  wind3500m: { speed: number; direction: number };
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white/80 text-xs">{data.altitude}</p>
        <p className="text-[#4DA3FF] text-sm font-mono font-bold">{data.speed} km/h</p>
        <p className="text-white/40 text-[10px]">{data.direction}°</p>
      </div>
    );
  }
  return null;
}

export function WindProfileChart({
  surfaceWind,
  wind1500m,
  wind2500m,
  wind3500m,
}: WindProfileChartProps) {
  const data: WindData[] = [
    { altitude: "Suolo", speed: surfaceWind.speed, direction: surfaceWind.direction },
    { altitude: "1500m", speed: wind1500m.speed, direction: wind1500m.direction },
    { altitude: "2500m", speed: wind2500m.speed, direction: wind2500m.direction },
    { altitude: "3500m", speed: wind3500m.speed, direction: wind3500m.direction },
  ];

  return (
    <div className="w-full h-[140px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis
            dataKey="altitude"
            tick={{ fill: "#ffffff60", fontSize: 10 }}
            axisLine={{ stroke: "#ffffff15" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#ffffff40", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            domain={[0, "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#4DA3FF"
            strokeWidth={2}
            dot={{ fill: "#4DA3FF", r: 4 }}
            activeDot={{ r: 6, fill: "#4DA3FF" }}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
