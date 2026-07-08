"use client";

import type { SiteForecast } from "@/hooks/useWeatherData";
import { MapPin, Mountain, Wind } from "lucide-react";

interface SiteCardProps {
  forecast: SiteForecast;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export function SiteCard({ forecast, isActive, onClick, index }: SiteCardProps) {
  const score = Math.round(forecast.overallScore * 25);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 animate-slide-up ${
        isActive
          ? "bg-[#181818] border-[#00FF8C]/30 shadow-[0_0_20px_rgba(0,255,140,0.06)]"
          : "card-premium-hover border-[#252525]"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-mono shrink-0"
          style={{ background: `${forecast.color}12`, color: forecast.color }}
        >
          {score}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{forecast.siteName}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Mountain size={11} />
              {forecast.elevation}m
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <MapPin size={11} />
              {forecast.valley}
            </span>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Wind size={11} />
              {forecast.rating}
            </span>
          </div>
        </div>

        {isActive && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF8C] animate-pulse shrink-0" />
        )}
      </div>
    </button>
  );
}