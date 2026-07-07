import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";
import { ProcessedHourData } from "@/types/weather";
import { formatHour } from "@/utils/weatherCalculations";

interface ThermalChartProps {
  hours: ProcessedHourData[];
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 shadow-xl">
        <p className="text-white/80 text-xs font-semibold">{d.hour}</p>
        <p className="text-[#FF9F1C] text-sm font-mono font-bold">{d.strength} m/s</p>
        <p className="text-white/40 text-[10px]">Forza: {d.force}/5</p>
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
    <div className="w-full h-[130px]">
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
          <Bar dataKey="strength" radius={[4, 4, 0, 0]} maxBarSize={28}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={getBarColor(entry.force)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}