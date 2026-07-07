import { useState, useRef, useEffect } from "react";
import { DayForecast } from "@/types/weather";
import { getQualityColor, formatHour, windDegToDirection } from "@/utils/weatherCalculations";
import { HourSlot } from "./HourSlot";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";
import { ArrowRight, Clock, Thermometer, Wind, Cloud, ArrowUpRight, AlertTriangle } from "lucide-react";

interface DayTabsProps {
  days: DayForecast[];
}

export function DayTabs({ days }: DayTabsProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const { ref, inView } = useInViewAnimation(0.1);

  const currentDay = days[activeDay];
  const displayHour = selectedHour !== null
    ? currentDay?.hours.find(h => h.hour === selectedHour)
    : currentDay?.hours[Math.floor((currentDay?.hours.length ?? 0) / 2)];

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const check = () => setShowScrollHint(el.scrollWidth > el.clientWidth && el.scrollLeft < el.scrollWidth - el.clientWidth - 50);
      check();
      el.addEventListener("scroll", check);
      return () => el.removeEventListener("scroll", check);
    }
  }, [activeDay]);

  if (!days.length) return null;

  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100" : "opacity-0 translate-y-8"}`}>
      <div className="flex gap-2 mb-4">
        {days.map((day, idx) => (
          <button
            key={day.date}
            onClick={() => { setActiveDay(idx); setSelectedHour(null); }}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              idx === activeDay ? "bg-white/15 text-white shadow-lg" : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70"
            }`}
          >
            <div>{day.dayName}</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: getQualityColor(day.averageQuality) }}>
              {day.averageQuality.toFixed(1)}
            </div>
          </button>
        ))}
      </div>

      {/* Ora selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest">
            <Clock size={12} className="inline mr-1.5" /> Seleziona ora
          </h3>
          {selectedHour && <span className="text-[11px] text-white/30">Ora: <strong className="text-white/60">{formatHour(selectedHour)}</strong></span>}
        </div>
        <div className="flex gap-1.5">
          {currentDay?.hours.map((h) => {
            const isActive = h.hour === selectedHour;
            const color = getQualityColor(h.qualityScore);
            return (
              <button
                key={h.hour}
                onClick={() => setSelectedHour(h.hour)}
                className={`flex-1 py-2 px-1 rounded-lg text-center transition-all duration-300 border ${isActive ? "bg-white/10 border-white/20 scale-105" : "bg-white/[0.03] border-transparent hover:bg-white/[0.06]"}`}
                style={isActive ? { borderColor: `${color}50`, boxShadow: `0 0 15px ${color}10` } : {}}
              >
                <div className="text-[11px] font-bold font-mono text-white/80">{formatHour(h.hour)}</div>
                <div className="text-[9px] font-bold mt-0.5 font-mono" style={{ color }}>{h.qualityScore}</div>
                <div className="w-1 h-1 rounded-full mx-auto mt-0.5" style={{ backgroundColor: color }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Dettaglio ora */}
      {displayHour && (
        <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-white/30" />
            <span className="text-sm font-bold text-white">{formatHour(displayHour.hour)}</span>
            <div className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
              style={{ backgroundColor: `${getQualityColor(displayHour.qualityScore)}15`, color: getQualityColor(displayHour.qualityScore) }}>
              {displayHour.qualityScore}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-1.5 mb-1"><Thermometer size={11} className="text-white/30" /><span className="text-[10px] text-white/30 uppercase">Temp</span></div>
              <span className="text-sm font-semibold text-white/80">{displayHour.temp.toFixed(0)}°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-1.5 mb-1"><Wind size={11} className="text-[#4DA3FF]" /><span className="text-[10px] text-white/30 uppercase">Vento suolo</span></div>
              <span className="text-sm font-semibold text-[#4DA3FF]">{displayHour.windSpeed10m.toFixed(0)} km/h</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-1.5 mb-1"><ArrowUpRight size={11} className="text-[#FFC857]" /><span className="text-[10px] text-white/30 uppercase">Termiche</span></div>
              <span className="text-sm font-semibold text-[#FFC857]">{displayHour.thermalStrength.toFixed(1)} m/s</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-1.5 mb-1"><Cloud size={11} className="text-white/30" /><span className="text-[10px] text-white/30 uppercase">Nuvole</span></div>
              <span className="text-sm font-semibold text-white/80">{displayHour.cloudCover.toFixed(0)}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-1.5 mb-1"><AlertTriangle size={11} className="text-[#FF9F1C]" /><span className="text-[10px] text-white/30 uppercase">Turbolenza</span></div>
              <span className="text-sm font-semibold text-[#FF9F1C]">{displayHour.turbulence}/5</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03]">
              <div className="flex items-center gap-1.5 mb-1"><Wind size={11} className="text-white/30" /><span className="text-[10px] text-white/30 uppercase">Umidità</span></div>
              <span className="text-sm font-semibold text-white/80">{displayHour.humidity.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Hour slots */}
      <div className="relative">
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2">
          {currentDay?.hours.map((hour, idx) => (
            <HourSlot key={hour.hour} data={hour} index={idx} visible={inView} />
          ))}
        </div>
        {showScrollHint && currentDay?.hours && currentDay.hours.length > 3 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <ArrowRight size={16} className="text-white/30 animate-pulse" />
          </div>
        )}
      </div>

      {/* Wind aloft */}
      {displayHour && (
        <div className="mt-4 mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
            <Wind size={12} className="inline mr-1.5" /> Vento in quota
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 rounded-lg bg-white/[0.03]">
              <div className="text-white/40 mb-1">1.500 m</div>
              <div className="font-semibold text-white/70">{displayHour.windSpeed1500m.toFixed(0)} km/h</div>
              <div className="text-[10px] text-white/40">{windDegToDirection(displayHour.windDirection1500m)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/[0.03]">
              <div className="text-white/40 mb-1">2.500 m</div>
              <div className="font-semibold text-white/70">{displayHour.windSpeed2500m.toFixed(0)} km/h</div>
              <div className="text-[10px] text-white/40">{windDegToDirection(displayHour.windDirection2500m)}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/[0.03]">
              <div className="text-white/40 mb-1">3.500 m</div>
              <div className="font-semibold text-white/70">{displayHour.windSpeed3500m.toFixed(0)} km/h</div>
              <div className="text-[10px] text-white/40">{windDegToDirection(displayHour.windDirection3500m)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#121212] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Ora</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Temp</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Umid</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Vento 10m</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Vento 1500m</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Vento 2500m</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Vento 3500m</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Nuvole</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Termiche</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Turbolenza</th>
                <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Quality</th>
              </tr>
            </thead>
            <tbody>
              {currentDay.hours.map((h) => (
                <tr key={h.hour} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-white/90 text-sm">{formatHour(h.hour)}</td>
                  <td className="py-2.5 px-3 font-mono text-white/70">{h.temp.toFixed(0)}°</td>
                  <td className="py-2.5 px-3 font-mono text-white/70">{h.humidity.toFixed(0)}%</td>
                  <td className="py-2.5 px-3 font-mono text-[#4DA3FF] font-semibold">{h.windSpeed10m.toFixed(0)} km/h</td>
                  <td className="py-2.5 px-3 font-mono text-[#7db8ff]">{h.windSpeed1500m.toFixed(0)} km/h</td>
                  <td className="py-2.5 px-3 font-mono text-[#5890d0]">{h.windSpeed2500m.toFixed(0)} km/h</td>
                  <td className="py-2.5 px-3 font-mono text-[#3a6a9e]">{h.windSpeed3500m.toFixed(0)} km/h</td>
                  <td className="py-2.5 px-3 font-mono text-white/70">{h.cloudCover.toFixed(0)}%</td>
                  <td className="py-2.5 px-3 font-mono text-[#FF9F1C] font-semibold">{h.thermalStrength.toFixed(1)} m/s</td>
                  <td className="py-2.5 px-3 font-mono text-[#FFC857] font-semibold">{h.turbulence}/5</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-sm" style={{ color: getQualityColor(h.qualityScore) }}>{h.qualityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}