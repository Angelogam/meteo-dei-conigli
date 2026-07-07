import { DayForecast, ProcessedHourData } from "@/types/weather";
import { WindArrow } from "../WindArrow";
import { ThermalBar } from "../ThermalBar";
import { TurbulenceIcon } from "../TurbulenceIcon";
import { getQualityColor, formatHour } from "@/utils/weatherCalculations";
import { Clock, Thermometer, Cloud, Wind, Flame, AlertTriangle, Sun } from "lucide-react";
import { useStaggerAnimation } from "@/hooks/useAnimationOnMount";

interface DashboardTimelineProps {
  day: DayForecast;
}

function HourSlotDashboard({ data, index, visible }: { data: ProcessedHourData; index: number; visible: boolean }) {
  const color = getQualityColor(data.qualityScore);

  return (
    <div
      className="timeline-slot"
      style={{
        transitionDelay: `${index * 60}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
      }}
    >
      {/* Ora */}
      <div className="text-center mb-2">
        <span className="timeline-slot-hour">{formatHour(data.hour)}</span>
      </div>

      {/* Temperatura + nuvole */}
      <div className="flex items-center justify-center gap-2.5 mb-2 text-[11px] text-white/50">
        <span className="flex items-center gap-1">
          <Thermometer size={10} style={{ color: "#FF9F1C" }} />
          {data.temp.toFixed(0)}°
        </span>
        <span className="flex items-center gap-1">
          <Cloud size={10} style={{ color: "#4DA3FF" }} />
          {data.cloudCover.toFixed(0)}%
        </span>
      </div>

      {/* Vento */}
      <div className="flex justify-center mb-1">
        <WindArrow direction={data.windDirection10m} speed={data.windSpeed10m} size="sm" showSpeed={false} />
      </div>
      <div className="text-center text-[11px] font-mono text-white/50 mb-2">
        {data.windSpeed10m.toFixed(0)} km/h
      </div>

      {/* Termiche */}
      <div className="flex justify-center mb-1">
        <ThermalBar strength={data.thermalStrength} force={data.thermalForce} height={40} />
      </div>

      {/* Turbolenza */}
      <div className="flex justify-center mb-2">
        <TurbulenceIcon level={data.turbulence} size={12} />
      </div>

      {/* Punteggio */}
      <div className="flex justify-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            backgroundColor: `${color}15`,
            border: `1.5px solid ${color}`,
            boxShadow: `0 0 10px ${color}30`,
          }}
        >
          <span className="text-[12px] font-bold font-mono" style={{ color }}>
            {data.qualityScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Legenda compatta */}
      <div className="mt-2 pt-1.5 border-t border-white/[0.03] space-y-1">
        <div className="flex items-center gap-1.5 text-[9px] text-white/30">
          <Wind size={8} className="text-[#4DA3FF]" />
          <span>{data.windSpeed1500m.toFixed(0)}/{data.windSpeed2500m.toFixed(0)} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-white/30">
          <Flame size={8} className="text-[#FF9F1C]" />
          <span>{data.thermalStrength.toFixed(1)} m/s</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardTimeline({ day }: DashboardTimelineProps) {
  const { visibleItems } = useStaggerAnimation(day.hours.length, 60, true);

  if (!day.hours.length) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        Nessun dato orario disponibile per questo giorno
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header del giorno */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun size={14} className="text-[#FFC857]" />
          <span className="text-sm font-semibold text-white/80">{day.dayName}</span>
          <span className="text-xs text-white/40">
            · {day.hours.length} fasce orarie
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40">Migliore:</span>
          {(() => {
            const best = day.hours.reduce((a, b) => a.qualityScore > b.qualityScore ? a : b);
            return (
              <span className="text-xs font-mono font-bold" style={{ color: getQualityColor(best.qualityScore) }}>
                {formatHour(best.hour)}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Timeline scrollabile */}
      <div className="relative">
        <div className="timeline-scroll">
          {day.hours.map((hour, idx) => (
            <HourSlotDashboard
              key={hour.hour}
              data={hour}
              index={idx}
              visible={visibleItems.has(idx)}
            />
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 text-[10px] text-white/30 pt-1">
        <span className="flex items-center gap-1">
          <Thermometer size={9} className="text-[#FF9F1C]" /> Temp. suolo
        </span>
        <span className="flex items-center gap-1">
          <Cloud size={9} className="text-[#4DA3FF]" /> Nuvole
        </span>
        <span className="flex items-center gap-1">
          <Wind size={9} className="text-[#4DA3FF]" /> Vento 10m
        </span>
        <span className="flex items-center gap-1">
          <Wind size={9} className="text-[#7db8ff]" /> Vento 1500m/2500m
        </span>
        <span className="flex items-center gap-1">
          <Flame size={9} className="text-[#FF9F1C]" /> Termiche
        </span>
        <span className="flex items-center gap-1">
          <AlertTriangle size={9} className="text-[#FFC857]" /> Turbolenza
        </span>
      </div>
    </div>
  );
}