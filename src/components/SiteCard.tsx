"use client";

import { DayForecast, LaunchForecast } from "@/types/weather";
import { getQualityColor, getQualityLabel, windDegToDirection } from "@/utils/weatherCalculations";
import { MapPin, Wind, Thermometer, Cloud, ArrowUpRight, Navigation } from "lucide-react";
import { useRef, useEffect } from "react";

interface SiteCardProps {
  forecast: LaunchForecast;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

function ScoreCircle({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = size === "sm" ? "w-10 h-10 text-sm" : size === "lg" ? "w-20 h-20 text-2xl" : "w-14 h-14 text-lg";
  const color = getQualityColor(score);
  
  return (
    <div
      className={`${sizeClasses} rounded-xl flex items-center justify-center font-bold transition-all duration-500`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 20px ${color}10`,
      }}
    >
      {score.toFixed(1)}
    </div>
  );
}

function MiniMeter({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-white/40 w-10 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function SiteCard({ forecast, isActive, onClick, index }: SiteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isActive]);

  const today: DayForecast = forecast.days[0];
  const score = forecast.overallScore;
  const color = getQualityColor(score);
  const label = getQualityLabel(score);

  // Best hour info
  const bestHour = today.hours.find(h => h.hour === today.bestHour) || today.hours[0];
  const bestWind = bestHour?.windSpeed10m ?? 0;
  const bestWindDir = bestHour?.windDirection10m ?? 0;
  const bestThermal = bestHour?.thermalStrength ?? 0;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`
        group relative p-5 sm:p-6 rounded-2xl cursor-pointer
        transition-all duration-300 animate-fade-in-up
        ${isActive
          ? "bg-gradient-to-br from-[#181818] to-[#1a1a1a] border-[#00FF8C]/30 shadow-[0_0_30px_rgba(0,255,140,0.06)]"
          : "bg-[#181818] border-[#252525] hover:bg-[#1E1E1E] hover:border-[#333]"
        }
        border
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow effect */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00FF8C]/[0.03] to-transparent pointer-events-none" />
      )}

      <div className="relative flex items-start gap-4">
        {/* Score */}
        <ScoreCircle score={score} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-white/90 transition-colors flex items-center gap-2">
                <MapPin size={14} className="text-white/30 shrink-0" />
                {forecast.siteName}
              </h3>
              <p className="text-xs text-white/30 mt-0.5">
                {forecast.lat.toFixed(4)}°N · {forecast.lon.toFixed(4)}°E · {forecast.elevation}m
              </p>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
              style={{
                backgroundColor: `${color}15`,
                color: color,
              }}
            >
              {label}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03]">
              <Wind size={14} className="text-[#4DA3FF] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-white/30">Vento suolo</p>
                <p className="text-sm font-semibold text-white/80">
                  {bestWind.toFixed(0)} <span className="text-[10px] font-normal text-white/40">km/h</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03]">
              <Navigation size={14} className="text-[#00FF8C] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-white/30">Direzione</p>
                <p className="text-sm font-semibold text-white/80">
                  {windDegToDirection(bestWindDir)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03]">
              <ArrowUpRight size={14} className="text-[#FFC857] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-white/30">Termiche</p>
                <p className="text-sm font-semibold text-white/80">
                  {bestThermal.toFixed(1)} <span className="text-[10px] font-normal text-white/40">m/s</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mini meters for other stats */}
          <div className="mt-3 space-y-1.5">
            <MiniMeter value={bestThermal} max={5} label="Termiche" color="#FFC857" />
            <MiniMeter value={today.averageQuality} max={5} label="Qualità" color={color} />
          </div>

          {/* Days summary */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {forecast.days.map((day, i) => {
              const dayColor = getQualityColor(day.averageQuality);
              return (
                <div
                  key={day.date}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03]"
                >
                  <span className="text-[11px] text-white/50">{day.dayName}</span>
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: `${dayColor}20`, color: dayColor }}
                  >
                    {day.averageQuality.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}