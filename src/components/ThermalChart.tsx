import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { ProcessedHourData } from "@/types/weather";
import { formatHour } from "@/utils/weatherCalculations";

interface ThermalChartProps {
  hours: ProcessedHourData[];
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white/80 text-xs">{data.hour}</p>
        <p className="text-[#FF9F1C] text-sm font-mono font-bold">{data.strength} m/s</p>
        <p className="text-white/40 text-[10px]">Forza: {data.force}/5</p>
      </div>
    );
  }
  return null;
}

function getBarColor(force: number): string {
  if (force >= 4) return "#00FF8C";
  if (force >= 3) return "#4DA3FF";
  if (force >= 2) return "#FFC857";
  return "#FF9F1C";
}

export function ThermalChart({ hours }: ThermalChartProps) {
  const data = hours.map((h) => ({
    hour: formatHour(h.hour),
    strength: h.thermalStrength,
    force: h.thermalForce,
  }));

  return (
    <div className="w-full h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis
            dataKey="hour"
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
          <Bar dataKey="strength" radius={[3, 3, 0, 0]} maxBarSize={30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.force)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
