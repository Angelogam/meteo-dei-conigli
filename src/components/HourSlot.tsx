import { ProcessedHourData } from "@/types/weather";
import { getQualityColor } from "@/utils/weatherCalculations";
import { useEffect, useState } from "react";

interface HourSlotProps {
  data: ProcessedHourData;
  index: number;
  visible: boolean;
}

export function HourSlot({ data, index, visible }: HourSlotProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => setMounted(true), index * 60);
      return () => clearTimeout(timeout);
    }
  }, [visible, index]);

  const color = getQualityColor(data.qualityScore);

  return (
    <div className={`shrink-0 w-[140px] p-3 rounded-xl border transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} bg-[#181818] border-[#252525] hover:border-[#333] hover:bg-[#1E1E1E]`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-white font-mono">{String(data.hour).padStart(2, '0')}:00</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${color}15`, color }}>{data.qualityScore}</div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-white/40">Vento</span>
          <span className="font-semibold text-[#4DA3FF]">{data.windSpeed10m.toFixed(0)} km/h</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-white/40">Termiche</span>
          <span className="font-semibold text-[#FFC857]">{data.thermalStrength.toFixed(1)} m/s</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-white/40">Temp</span>
          <span className="font-semibold text-white/70">{data.temp.toFixed(0)}°C</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-white/40">Nuvole</span>
          <span className="font-semibold text-white/70">{data.cloudCover.toFixed(0)}%</span>
        </div>
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/[0.04] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(data.qualityScore / 5) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}