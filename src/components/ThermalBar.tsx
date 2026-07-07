import { Flame } from "lucide-react";

interface ThermalBarProps {
  strength: number; // m/s
  force: number; // 1-5
  height?: number;
}

function getThermalColor(force: number): string {
  if (force >= 4.5) return "#00FF8C";
  if (force >= 3.5) return "#4DA3FF";
  if (force >= 2.5) return "#FFC857";
  if (force >= 1.5) return "#FF9F1C";
  return "#FF4E4E";
}

function getThermalLabel(force: number): string {
  if (force >= 4.5) return "Forti";
  if (force >= 3.5) return "Buone";
  if (force >= 2.5) return "Medie";
  if (force >= 1.5) return "Deboli";
  return "Assenti";
}

export function ThermalBar({ strength, force, height = 64 }: ThermalBarProps) {
  const color = getThermalColor(force);
  const percentage = (force / 5) * 100;
  const label = getThermalLabel(force);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Flame size={13} color={color} className="transition-colors duration-500" />
      <div
        className="w-1.5 rounded-full overflow-hidden"
        style={{ height, backgroundColor: "#1a1a2e" }}
      >
        <div
          className="w-full rounded-full transition-all duration-1000 ease-out"
          style={{
            height: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
            alignSelf: "flex-end",
            marginTop: "auto",
          }}
        />
      </div>
      <span className="text-[11px] font-mono font-bold" style={{ color }}>
        {strength.toFixed(1)}
      </span>
      <span className="text-[8px] text-white/35 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}