"use client";

import { useState } from "react";
import type { DayForecast } from "@/hooks/useWeatherData";
import { getDayLabel, getWeatherIcon, formatHour, windDegToCardinal } from "@/utils/meteoCalculations";

interface DayTabsProps {
  days: DayForecast[];
}

export function DayTabs({ days }: DayTabsProps) {
  const [activeDay, setActiveDay] = useState(0);

  if (days.length === 0) return null;

  const currentDay = days[activeDay];
  const hours = currentDay?.hours?.filter((h) => {
    const hr = parseInt(h.time.slice(11, 13), 10);
    return hr >= 7 && hr <= 20;
  }) || [];

  const peakHours = hours.filter((h) => {
    const hr = parseInt(h.time.slice(11, 13), 10);
    return hr >= 10 && hr <= 16;
  });

  const avgWind = peakHours.length > 0
    ? Math.round(peakHours.reduce((s, h) => s + h.windSpeed10m, 0) / peakHours.length)
    : 0;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {days.map((day, i) => (
          <button
            key={day.date}
            onClick={() => setActiveDay(i)}
            className={`flex-1 py-3 px-2 rounded-xl text-center transition-all duration-200 ${
              i === activeDay
                ? "bg-[#00FF8C]/10 border border-[#00FF8C]/30"
                : "bg-[#121212] border border-[#252525] hover:border-white/10"
            }`}
          >
            <div className="text-xs font-semibold text-white/80">{getDayLabel(day.date)}</div>
            <div className="text-lg my-1">{getWeatherIcon(day.daily.weatherCode, true)}</div>
            <div className="text-xs text-white/50">
              {Math.round(day.daily.tempMax)}° / {Math.round(day.daily.tempMin)}°
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="text-xs text-white/40 font-medium">Vento medio (10-16):</div>
        <div className="text-sm font-bold text-white">{avgWind} km/h</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {hours.map((h, i) => {
          const hr = parseInt(h.time.slice(11, 13), 10);
          const good = h.windSpeed10m >= 8 && h.windSpeed10m <= 20 && h.cloudCover < 40;
          const bad = h.windSpeed10m > 25 || h.cloudCover > 80;

          return (
            <div
              key={i}
              className={`rounded-xl p-3 border transition-all ${
                good
                  ? "bg-[#00FF8C]/05 border-[#00FF8C]/20"
                  : bad
                  ? "bg-[#FF4E4E]/05 border-[#FF4E4E]/20"
                  : "bg-[#121212] border-[#252525]"
              }`}
            >
              <div className="text-[10px] font-semibold text-white/40 mb-1">{formatHour(hr)}</div>
              <div className="text-lg">{getWeatherIcon(h.weatherCode, h.isDay)}</div>
              <div className="text-sm font-semibold text-white mt-1">{Math.round(h.temperature2m)}°</div>
              
              <div className="mt-1.5 space-y-0.5">
                <div className="text-[10px] text-white/50">
                  Vento: {Math.round(h.windSpeed10m)} <span className="text-[9px]">{windDegToCardinal(h.windDirection10m)}</span>
                </div>
                <div className="text-[10px] text-white/40">Raffiche: {Math.round(h.windGusts10m)} km/h</div>
                <div className="text-[10px] text-white/40">Nuvole: {h.cloudCover}%</div>
                {h.precipitation > 0 && (
                  <div className="text-[10px] text-[#4FC3F7]">🌧 {h.precipitation.toFixed(1)}mm</div>
                )}
                <div className="text-[10px] text-white/40">CAPE: {Math.round(h.cape)}</div>
                <div className="text-[10px] text-white/40">LI: {h.liftedIndex.toFixed(1)}</div>
              </div>

              {good && (
                <div className="mt-2 text-[10px] font-semibold text-[#00FF8C]">✓ Buono</div>
              )}
              {bad && (
                <div className="mt-2 text-[10px] font-semibold text-[#FF4E4E]">✗ Sconsigliato</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}