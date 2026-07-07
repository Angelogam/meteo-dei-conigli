"use client";

import { useState } from "react";
import { LaunchForecast, ProcessedHourData, DayForecast } from "@/types/weather";
import { getQualityColor, getQualityLabel, windDegToDirection, formatHour } from "@/utils/weatherCalculations";
import { WindProfileChart } from "./WindProfileChart";
import { ThermalChart } from "./ThermalChart";
import { X, Wind, Thermometer, Cloud, ArrowUpRight, Navigation, Clock, AlertTriangle, Info, ChevronRight } from "lucide-react";

interface SiteDetailProps {
  forecast: LaunchForecast;
  onClose: () => void;
}

function QualityGauge({ score }: { score: number }) {
  const color = getQualityColor(score);
  const pct = (score / 5) * 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="text-4xl sm:text-5xl font-bold transition-colors duration-500"
        style={{ color }}
      >
        {score.toFixed(1)}
      </div>
      <span
        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {getQualityLabel(score)}
      </span>
      <div className="w-full max-w-[200px] h-1.5 rounded-full bg-white/[0.04] mt-1">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function HourDetailCard({ hour }: { hour: ProcessedHourData }) {
  const qualityColor = getQualityColor(hour.qualityScore);
  const windDir = windDegToDirection(hour.windDirection10m);
  
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all">
      {/* Ora */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-white/30" />
          <span className="text-base font-bold text-white">{formatHour(hour.hour)}</span>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: `${qualityColor}15`, color: qualityColor }}
        >
          {hour.qualityScore}
        </div>
      </div>

      {/* Griglia metriche */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center gap-1.5 mb-1">
            <Thermometer size={12} className="text-white/30" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Temperatura</span>
          </div>
          <span className="text-sm font-semibold text-white/80">{hour.temp.toFixed(0)}°C</span>
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center gap-1.5 mb-1">
            <Wind size={12} className="text-[#4DA3FF]" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Vento suolo</span>
          </div>
          <span className="text-sm font-semibold text-[#4DA3FF]">
            {hour.windSpeed10m.toFixed(0)} km/h
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center gap-1.5 mb-1">
            <Navigation size={12} className="text-[#00FF8C]" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Direzione</span>
          </div>
          <span className="text-sm font-semibold text-[#00FF8C]">{windDir}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center gap-1.5 mb-1">
            <Cloud size={12} className="text-white/30" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Nuvole</span>
          </div>
          <span className="text-sm font-semibold text-white/80">{hour.cloudCover.toFixed(0)}%</span>
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight size={12} className="text-[#FFC857]" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Termiche</span>
          </div>
          <span className="text-sm font-semibold text-[#FFC857]">
            {hour.thermalStrength.toFixed(1)} m/s
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.03]">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={12} className="text-[#FF9F1C]" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Turbolenza</span>
          </div>
          <span className="text-sm font-semibold text-[#FF9F1C]">{hour.turbulence}/5</span>
        </div>
      </div>

      {/* Vento in quota mini */}
      <div className="mt-3 p-3 rounded-lg bg-white/[0.02]">
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Vento in quota</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-white/40">1.500 m</div>
            <div className="font-semibold text-white/70 mt-0.5">{hour.windSpeed1500m.toFixed(0)} km/h</div>
          </div>
          <div className="text-center">
            <div className="text-white/40">2.500 m</div>
            <div className="font-semibold text-white/70 mt-0.5">{hour.windSpeed2500m.toFixed(0)} km/h</div>
          </div>
          <div className="text-center">
            <div className="text-white/40">3.500 m</div>
            <div className="font-semibold text-white/70 mt-0.5">{hour.windSpeed3500m.toFixed(0)} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationalBox() {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-[#00FF8C]/[0.04] to-[#4DA3FF]/[0.04] border border-[#00FF8C]/10">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#00FF8C]/10 flex items-center justify-center shrink-0">
          <Info size={16} className="text-[#00FF8C]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/80 mb-1">Come leggere i punteggi</p>
          <ul className="space-y-1 text-xs text-white/40">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF8C]" />
              <span><strong className="text-white/60">5.0 – 4.0</strong> — Condizioni perfette per volare</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4DA3FF]" />
              <span><strong className="text-white/60">3.9 – 3.0</strong> — Buone, vento e termiche moderate</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFC857]" />
              <span><strong className="text-white/60">2.9 – 2.0</strong> — Mediocri, volo possibile ma non ideale</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF9F1C]" />
              <span><strong className="text-white/60">1.9 – 1.0</strong> — Scarse, sconsigliato ai meno esperti</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF4E4E]" />
              <span><strong className="text-white/60">< 1.0</strong> — Pericoloso, meglio rimandare</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function SiteDetail({ forecast, onClose }: SiteDetailProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const currentDay: DayForecast = forecast.days[selectedDay];
  const currentHour = selectedHour !== null
    ? currentDay.hours.find(h => h.hour === selectedHour)
    : currentDay.hours[Math.floor(currentDay.hours.length / 2)];

  // Se la fascia oraria selezionata non ha dati, prendiamo quella centrale
  const displayHour = currentHour || currentDay.hours[Math.floor(currentDay.hours.length / 2)];

  return (
    <div className="animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00FF8C]/20 to-[#00FF8C]/5 border border-[#00FF8C]/20 flex items-center justify-center">
            <Wind size={20} className="text-[#00FF8C]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{forecast.siteName}</h2>
            <p className="text-xs text-white/40">{forecast.elevation}m · {forecast.exposure}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-all"
        >
          <X size={16} className="text-white/40" />
        </button>
      </div>

      {/* Day selector + Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-1.5">
          {forecast.days.map((day, i) => (
            <button
              key={day.date}
              onClick={() => { setSelectedDay(i); setSelectedHour(null); }}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                ${i === selectedDay
                  ? "bg-white/15 text-white shadow-lg"
                  : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/70"
                }
              `}
            >
              {day.dayName}
              <div
                className="text-[10px] mt-0.5 font-mono"
                style={{ color: getQualityColor(day.averageQuality) }}
              >
                {day.averageQuality.toFixed(1)}
              </div>
            </button>
          ))}
        </div>
        {displayHour && (
          <QualityGauge score={displayHour.qualityScore} />
        )}
      </div>

      {/* Timeline oraria */}
      {currentDay && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
                <Clock size={14} className="inline mr-1.5" />
                Fascia oraria
              </h3>
              {selectedHour && (
                <span className="text-xs text-white/30">
                  Selezionata: <strong className="text-white/60">{formatHour(selectedHour)}</strong>
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {currentDay.hours.map((h) => {
                const isActive = h.hour === selectedHour;
                const isMiddle = !selectedHour && h.hour === displayHour?.hour;
                const color = getQualityColor(h.qualityScore);
                return (
                  <button
                    key={h.hour}
                    onClick={() => setSelectedHour(h.hour)}
                    className={`
                      flex-1 py-2.5 px-1 rounded-lg text-center transition-all duration-300
                      ${isActive || isMiddle
                        ? "bg-white/10 border-white/20 scale-105"
                        : "bg-white/[0.03] border-transparent hover:bg-white/[0.06]"
                      }
                      border
                    `}
                    style={(isActive || isMiddle) ? { borderColor: `${color}50`, boxShadow: `0 0 15px ${color}10` } : {}}
                  >
                    <div className="text-xs font-bold font-mono text-white/80">
                      {formatHour(h.hour)}
                    </div>
                    <div
                      className="text-[10px] font-bold mt-1 font-mono"
                      style={{ color }}
                    >
                      {h.qualityScore}
                    </div>
                    {/* Mini dot indicator */}
                    <div
                      className="w-1.5 h-1.5 rounded-full mx-auto mt-1"
                      style={{ backgroundColor: color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dettaglio ora selezionata */}
          {displayHour && (
            <div className="mb-6">
              <HourDetailCard hour={displayHour} />
            </div>
          )}
        </>
      )}

      {/* Grafici vento in quota e termiche per l'ora centrale del giorno */}
      {displayHour && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#181818] border border-[#252525]">
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
              Vento in Quota
            </h4>
            <WindProfileChart
              surfaceWind={{ speed: displayHour.windSpeed10m, direction: displayHour.windDirection10m }}
              wind1500m={{ speed: displayHour.windSpeed1500m, direction: displayHour.windDirection1500m }}
              wind2500m={{ speed: displayHour.windSpeed2500m, direction: displayHour.windDirection2500m }}
              wind3500m={{ speed: displayHour.windSpeed3500m, direction: displayHour.windDirection3500m }}
            />
          </div>
          <div className="p-4 rounded-xl bg-[#181818] border border-[#252525]">
            <h4 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-Perfetto! Ora ricostruisco anche la pagina principale (`Index.tsx`) e il `WindProfileChart` per completare la dashboard.

<dyad-write path="src/components/WindProfileChart.tsx" description="Grafico vento verticale professionale con barre, frecce e altitudini">
import { useMemo } from "react";

interface WindProfileChartProps {
  surfaceWind: { speed: number; direction: number };
  wind1500m: { speed: number; direction: number };
  wind2500m: { speed: number; direction: number };
  wind3500m: { speed: number; direction: number };
}

function windDegToArrow(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function getWindColor(speed: number): string {
  if (speed < 8) return "#4DA3FF";
  if (speed < 15) return "#4DA3FF";
  if (speed < 25) return "#FFC857";
  if (speed < 35) return "#FF9F1C";
  return "#FF4E4E";
}

function WindArrow({ direction, speed, size = 22 }: { direction: number; speed: number; size?: number }) {
  const color = getWindColor(speed);
  const rad = (direction * Math.PI) / 180;
  const len = size * 0.38;
  const dx = len * Math.sin(rad);
  const dy = -len * Math.cos(rad);

  return (
    <svg width={size} height={size} viewBox="0 0 22 22" className="shrink-0">
      <circle cx="11" cy="11" r="2.5" fill={color} opacity="0.3" />
      <line x1="11" y1="11" x2={11 + dx} y2={11 + dy} stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Punta freccia */}
      <polygon
        points={`
          ${11 + dx * 1.2},${11 + dy * 1.2}
          ${11 + dx * 0.7 - 3 * Math.cos(rad)},${11 + dy * 0.7 + 3 * Math.sin(rad)}
          ${11 + dx * 0.7 + 3 * Math.cos(rad)},${11 + dy * 0.7 - 3 * Math.sin(rad)}
        `}
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
}

function WindLevel({ label, speed, direction, isFirst, isLast }: { label: string; speed: number; direction: number; isFirst: boolean; isLast: boolean }) {
  const color = getWindColor(speed);
  const arrow = windDegToArrow(direction);
  const pct = Math.min(100, (speed / 50) * 100);

  return (
    <div className="flex items-center gap-3">
      {/* Altitudine */}
      <div className="w-16 sm:w-20 text-right shrink-0">
        <span className="text-[11px] sm:text-xs font-semibold text-white/50 font-mono">{label}</span>
      </div>

      {/* Freccia */}
      <WindArrow direction={direction} speed={speed} size={20} />

      {/* Barra */}
      <div className="flex-1 relative">
        <div className="h-7 rounded-xl bg-white/[0.04] overflow-hidden">
          <div
            className="h-full rounded-xl transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: color,
              opacity: 0.85,
              boxShadow: `0 0 12px ${color}20`,
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-xs font-mono font-bold text-white/90 drop-shadow-md">
            {speed.toFixed(0)} km/h
          </span>
          <span className="text-[10px] font-mono font-semibold text-white/90 drop-shadow-md" style={{ color }}>
            {arrow}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WindProfileChart({
  surfaceWind,
  wind1500m,
  wind2500m,
  wind3500m,
}: WindProfileChartProps) {
  const levels = useMemo(() => [
    { label: "3.500 m", speed: wind3500m.speed, direction: wind3500m.direction },
    { label: "2.500 m", speed: wind2500m.speed, direction: wind2500m.direction },
    { label: "1.500 m", speed: wind1500m.speed, direction: wind1500m.direction },
    { label: "Suolo", speed: surfaceWind.speed, direction: surfaceWind.direction },
  ], [surfaceWind, wind1500m, wind2500m, wind3500m]);

  return (
    <div className="w-full space-y-3">
      {levels.map((level, i) => (
        <WindLevel
          key={level.label}
          {...level}
          isFirst={i === 0}
          isLast={i === levels.length - 1}
        />
      ))}
    </div>
  );
}