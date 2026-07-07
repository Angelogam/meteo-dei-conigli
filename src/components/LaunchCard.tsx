import { LaunchForecast } from "@/types/weather";
import { getQualityColor, getQualityLabel, windDegToDirection } from "@/utils/weatherCalculations";
import { MapPin, Compass, Mountain, ChevronDown, ChevronUp, TrendingUp, Wind } from "lucide-react";
import { useState } from "react";
import { DayTabs } from "./DayTabs";

interface LaunchCardProps {
  data: LaunchForecast;
  index: number;
}

export function LaunchCard({ data, index }: LaunchCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const score = data.overallScore;
  const color = getQualityColor(score);
  const label = getQualityLabel(score);

  const bestDay = data.days.reduce((best, d) => d.averageQuality > best.averageQuality ? d : best);
  const bestHour = bestDay.hours.find(h => h.hour === bestDay.bestHour) || bestDay.hours[0];

  // Esposizione semplice
  const exposureMap: Record<string, string> = {
    N: "Nord", NNE: "Nord-Nordest", NE: "Nord-Est", ENE: "Est-Nordest",
    E: "Est", ESE: "Est-Sudest", SE: "Sud-Est", SSE: "Sud-Sudest",
    S: "Sud", SSW: "Sud-Sudovest", SW: "Sud-Ovest", WSW: "Ovest-Sudovest",
    W: "Ovest", WNW: "Ovest-Nordovest", NW: "Nord-Ovest", NNW: "Nord-Nordovest",
  };

  return (
    <div
      className="group rounded-2xl border border-white/[0.08] bg-[#141414] overflow-hidden transition-all duration-500 hover:border-white/15 hover:shadow-[0_0_30px_rgba(0,255,140,0.04)]"
    >
      {/* Header card */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Punteggio grande */}
          <div
            className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-500"
            style={{ backgroundColor: `${color}18`, border: `2px solid ${color}40` }}
          >
            <span className="text-2xl md:text-3xl leading-none" style={{ color }}>
              {score.toFixed(1)}
            </span>
            <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: `${color}CC` }}>
              {label}
            </span>
          </div>

          {/* Info decollo */}
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-white truncate">
              {data.siteName}
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Mountain size={12} />
                {data.elevation} m
              </span>
              <span className="flex items-center gap-1">
                <Compass size={12} />
                {exposureMap[data.exposure] || data.exposure}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {data.lat.toFixed(2)}, {data.lon.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Miglior momento + freccia */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Miglior ora</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={14} className="text-[#00FF8C]" />
              <span className="text-sm font-semibold text-white" style={{ color: getQualityColor(bestHour?.qualityScore || 0) }}>
                {bestDay.dayName} alle {String(bestHour?.hour || 0).padStart(2, "0")}:00
              </span>
            </div>
          </div>
          {expanded ? (
            <ChevronUp size={18} className="text-white/30 transition-transform" />
          ) : (
            <ChevronDown size={18} className="text-white/30 transition-transform" />
          )}
        </div>

        {/* Versione mobile freccia */}
        <div className="sm:hidden shrink-0">
          {expanded ? (
            <ChevronUp size={18} className="text-white/30" />
          ) : (
            <ChevronDown size={18} className="text-white/30" />
          )}
        </div>
      </button>

      {/* Separatore animato */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: expanded ? "3000px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="border-t border-white/[0.06] mx-5 md:mx-6" />

        {/* Corpo espanso */}
        <div className="p-5 md:p-6 pt-4 space-y-5">
          {/* Riepilogo compatto - versione desktop card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Vento suolo", value: bestHour ? `${bestHour.windSpeed10m.toFixed(0)} km/h` : "-", sub: bestHour ? windDegToDirection(bestHour.windDirection10m) : "-", color: "#4DA3FF", icon: Wind },
              { label: "Vento 1500m", value: bestHour ? `${bestHour.windSpeed1500m.toFixed(0)} km/h` : "-", sub: bestHour ? windDegToDirection(bestHour.windDirection1500m) : "-", color: "#7db8ff", icon: Wind },
              { label: "Termiche", value: bestHour ? `${bestHour.thermalStrength.toFixed(1)} m/s` : "-", sub: bestHour ? `Forza ${bestHour.thermalForce}/5` : "-", color: "#FF9F1C", icon: TrendingUp },
              { label: "Qualità", value: bestHour ? `${bestHour.qualityScore.toFixed(0)}/5` : "-", sub: label, color },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3"
              >
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider mb-1.5">
                  <stat.icon size={12} style={{ color: stat.color }} />
                  {stat.label}
                </div>
                <div className="text-sm font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Tab giorni + dettaglio orario */}
          <DayTabs days={data.days} />
        </div>
      </div>
    </div>
  );
}