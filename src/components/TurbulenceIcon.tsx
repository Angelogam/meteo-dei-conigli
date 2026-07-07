import { AlertTriangle } from "lucide-react";

interface TurbulenceIconProps {
  level: number; // 1-5
  size?: number;
}

function getTurbulenceColor(level: number): string {
  if (level <= 2) return "#00FF8C";
  if (level <= 3) return "#FFC857";
  if (level <= 4) return "#FF9F1C";
  return "#FF4E4E";
}

function getTurbulenceLabel(level: number): string {
  if (level <= 1) return "Nulla";
  if (level <= 2) return "Leggera";
  if (level <= 3) return "Moderata";
  if (level <= 4) return "Forte";
  return "Molto Forte";
}

export function TurbulenceIcon({ level, size = 18 }: TurbulenceIconProps) {
  const color = getTurbulenceColor(level);
  const label = getTurbulenceLabel(level);

  return (
    <div className="flex flex-col items-center gap-1">
      <AlertTriangle
        size={size}
        color={color}
        className={level >= 4 ? "animate-pulse" : ""}
        style={{ filter: level >= 4 ? `drop-shadow(0 0 6px ${color}50)` : "none" }}
      />
      <span className="text-[9px] text-white/40 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}