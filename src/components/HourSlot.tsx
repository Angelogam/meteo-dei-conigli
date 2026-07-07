import { ProcessedHourData } from "@/types/weather";
import { WindArrow } from "./WindArrow";
import { ThermalBar } from "./ThermalBar";
import { TurbulenceIcon } from "./TurbulenceIcon";
import { QualityBadge } from "./QualityBadge";
import { formatHour, getQualityColor } from "@/utils/weatherCalculations";
import { Cloud, Thermometer, Droplets } from "lucide-react";

interface HourSlotProps {
  data: ProcessedHourData;
  index?: number;
  visible?: boolean;
}

export function HourSlot({ data, index = 0, visible = true }: HourSlotProps) {
  return (
    <div
      className={`
        flex-shrink-0 w-[136px] rounded-2xl border border-white/[0.06] bg-[#121212]
        p-3.5 transition-all duration-500 ease-out
        hover:border-white/12 hover:bg-[#181818]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Ora */}
      <div className="text-center mb-2.5">
        <div className="text-sm font-bold text-white/70 font-mono tracking-tight">
          {formatHour(data.hour)}
        </div>
      </div>

      {/* Temp + Umidità */}
      <div className="flex items-center justify-center gap-3 mb-2.5 text-[11px] text-white/60">
        <div className="flex items-center gap-1">
          <Thermometer size={11} color="#FF9F1C" />
          <span className="font-semibold">{data.temp.toFixed(0)}°</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets size={11} color="#4DA3FF" />
          <span>{data.humidity.toFixed(0)}%</span>
        </div>
      </div>

      {/* Nuvolosità */}
      <div className="flex items-center justify-center gap-1 mb-2.5 text-[11px] text-white/50">
        <Cloud size={11} color="white" opacity={0.3} />
        <span>{data.cloudCover.toFixed(0)}% nuvole</span>
      </div>

      {/* Separatore */}
      <div className="border-t border-white/[0.04] my-2" />

      {/* Vento */}
      <div className="flex justify-center mb-2">
        <WindArrow direction={data.windDirection10m} speed={data.windSpeed10m} size="sm" showSpeed={true} />
      </div>

      {/* Termiche + Turbolenza in riga */}
      <div className="flex items-center justify-center gap-4 mb-2.5">
        <ThermalBar strength={data.thermalStrength} force={data.thermalForce} height={44} />
        <div className="w-px h-10 bg-white/[0.04]" />
        <TurbulenceIcon level={data.turbulence} size={14} />
      </div>

      {/* Punteggio */}
      <div className="flex justify-center mt-1">
        <QualityBadge score={data.qualityScore} size="sm" showLabel={false} />
      </div>
    </div>
  );
}