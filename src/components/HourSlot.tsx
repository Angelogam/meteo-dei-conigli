import { ProcessedHourData } from "@/types/weather";
import { getQualityColor, windDegToDirection } from "@/utils/weatherCalculations";
import { Wind, Thermometer, Cloud, TriangleAlert } from "lucide-react";

interface HourSlotProps {
  data: ProcessedHourData;
  index: number;
  visible: boolean;
}

export function HourSlot({ data, index, visible }: HourSlotProps) {
  const qualityColor = getQualityColor(data.qualityScore);

  // Scala difficoltà vento
  const getWindDifficulty = (speed: number): { label: string; color: string } => {
    if (speed < 5) return { label: "Debole", color: "#4DA3FF" };
    if (speed < 15) return { label: "Moderato", color: "#00FF8C" };
    if (speed < 25) return { label: "Forte", color: "#FFC857" };
    if (speed < 35) return { label: "Molto forte", color: "#FF9F1C" };
    return { label: "Estremo", color: "#FF4E4E" };
  };

  // Scala termiche
  const getThermalLabel = (strength: number): string => {
    if (strength < 0.5) return "Assenti";
    if (strength < 1.5) return "Deboli";
    if (strength < 2.5) return "Moderate";
    if (strength < 3.5) return "Buone";
    return "Forti";
  };

  const windLabel = getWindDifficulty(data.windSpeed10m);
  const dirLabel = windDegToDirection(data.windDirection10m);

  return (
    <div
      className={`
        shrink-0 w-[130px] md:w-[140px] rounded-xl border p-3
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        backgroundColor: `${qualityColor}08`,
        borderColor: `${qualityColor}20`,
        transitionDelay: `${index * 50}ms`,
      }}
    >
      {/* Ora */}
      <div className="text-center mb-2 pb-2 border-b border-white/[0.06]">
        <span className="text-xs font-mono font-bold" style={{ color: qualityColor }}>
          {String(data.hour).padStart(2, "0")}:00
        </span>
      </div>

      {/* Punteggio */}
      <div className="text-center mb-2">
        <span
          className="text-lg font-bold font-mono"
          style={{ color: qualityColor }}
        >
          {data.qualityScore}
        </span>
      </div>

      {/* Info meteo compatte */}
      <div className="space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-white/30 flex items-center gap-1">
            <Wind size={10} />
            Vento
          </span>
          <span className="text-white/70 font-medium font-mono" style={{ color: windLabel.color }}>
            {data.windSpeed10m.toFixed(0)} km/h
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/30 flex items-center gap-1">
            <Thermometer size={10} />
            Temp
          </span>
          <span className="text-white/70 font-medium font-mono">
            {data.temp.toFixed(0)}°
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/30 flex items-center gap-1">
            <Cloud size={10} />
            Nuvole
          </span>
          <span className="text-white/70 font-medium font-mono">
            {data.cloudCover.toFixed(0)}%
          </span>
        </div>

        {/* Termiche */}
        <div className="flex items-center justify-between">
          <span className="text-white/30 flex items-center gap-1">
            <TriangleAlert size={10} className="text-[#FF9F1C]" />
            Termiche
          </span>
          <span className="text-[10px] font-medium text-[#FF9F1C]">
            {getThermalLabel(data.thermalStrength)}
          </span>
        </div>
      </div>

      {/* Badge direzione vento */}
      <div className="mt-2 pt-2 border-t border-white/[0.06] text-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
          {dirLabel}
        </span>
      </div>
    </div>
  );
}