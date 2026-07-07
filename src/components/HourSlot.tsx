import { ProcessedHourData } from "@/types/weather";
import { WindArrow } from "./WindArrow";
import { ThermalBar } from "./ThermalBar";
import { TurbulenceIcon } from "./TurbulenceIcon";
import { QualityBadge } from "./QualityBadge";
import { formatHour } from "@/utils/weatherCalculations";
import { Cloud, Thermometer } from "lucide-react";

interface HourSlotProps {
  data: ProcessedHourData;
  index?: number;
  visible?: boolean;
}

export function HourSlot({ data, index = 0, visible = true }: HourSlotProps) {
  return (
    <div
      className={`
        flex-shrink-0 w-[130px] rounded-xl border border-white/[0.06] bg-[#121212]
        p-3 transition-all duration-500 ease-out
        hover:border-white/15 hover:bg-[#181818]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Hour */}
      <div className="text-center mb-2">
        <span className="text-xs font-semibold text-white/70 font-mono">
          {formatHour(data.hour)}
        </span>
      </div>

      {/* Temperature + Cloud cover */}
      <div className="flex items-center justify-center gap-2 mb-2 text-[10px] text-white/50">
        <div className="flex items-center gap-1">
          <Thermometer size={10} color="#FF9F1C" />
          {data.temp.toFixed(0)}°
        </div>
        <div className="flex items-center gap-1">
          <Cloud size={10} color="#4DA3FF" />
          {data.cloudCover.toFixed(0)}%
        </div>
      </div>

      {/* Wind Arrow */}
      <div className="flex justify-center mb-2">
        <WindArrow
          direction={data.windDirection10m}
          speed={data.windSpeed10m}
          size="sm"
          showSpeed={false}
        />
      </div>
      <div className="text-center text-[9px] text-white/40 font-mono mb-3">
        {data.windSpeed10m.toFixed(0)} km/h
      </div>

      {/* Thermal bar */}
      <div className="flex justify-center mb-2">
        <ThermalBar strength={data.thermalStrength} force={data.thermalForce} height={50} />
      </div>

      {/* Turbulence */}
      <div className="flex justify-center mb-3">
        <TurbulenceIcon level={data.turbulence} size={14} />
      </div>

      {/* Quality Score */}
      <div className="flex justify-center">
        <QualityBadge score={data.qualityScore} size="sm" showLabel={false} />
      </div>
    </div>
  );
}
