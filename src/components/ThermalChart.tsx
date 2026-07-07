import { ProcessedHourData } from "@/types/weather";
import { getQualityColor } from "@/utils/weatherCalculations";
import { useMemo } from "react";

interface ThermalChartProps {
  hours: ProcessedHourData[];
}

export function ThermalChart({ hours }: ThermalChartProps) {
  const maxStrength = useMemo(
    () => Math.max(...hours.map((h) => h.thermalStrength), 1),
    [hours]
  );

  return (
    <div className="w-full space-y-2">
      {hours.map((hour, idx) => {
        const pct = (hour.thermalStrength / maxStrength) * 100;
        const color = getQualityColor(hour.qualityScore);
        return (
          <div key={hour.hour} className="flex items-center gap-3">
            <span className="w-9 text-[10px] font-mono font-semibold text-white/40 shrink-0">
              {String(hour.hour).padStart(2, "0")}
            </span>
            <div className="flex-1 h-5 rounded-full bg-white/[0.04] overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}30`,
                }}
              />
            </div>
            <span className="w-14 text-right text-[11px] font-mono font-semibold" style={{ color }}>
              {hour.thermalStrength.toFixed(1)}
            </span>
          </div>
        );
      })}

      {/* Legenda */}
      <div className="flex items-center justify-between pt-2 text-[10px] text-white/20 font-mono">
        <span>0 m/s</span>
        <span>{maxStrength.toFixed(1)} m/s</span>
      </div>
    </div>
  );
}