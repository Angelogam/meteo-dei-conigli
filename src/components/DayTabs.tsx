import { DayForecast } from "@/types/weather";
import { getQualityColor, formatHour } from "@/utils/weatherCalculations";
import { HourSlot } from "./HourSlot";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";
import { WindProfileChart } from "./WindProfileChart";
import { ThermalChart } from "./ThermalChart";
import { ArrowRight, Clock, BarChart3 } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface DayTabsProps {
  days: DayForecast[];
}

export function DayTabs({ days }: DayTabsProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInViewAnimation(0.1);

  const currentDay = days[activeDay];

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const checkScroll = () => {
        setShowScrollHint(
          el.scrollWidth > el.clientWidth &&
          el.scrollLeft < el.scrollWidth - el.clientWidth - 50
        );
      };
      checkScroll();
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [activeDay]);

  if (!days.length) return null;

  const firstHour = currentDay?.hours[0];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        inView ? "opacity-100" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Selettore giorno con badge qualità */}
      <div className="flex gap-2 mb-5">
        {days.map((day, idx) => (
          <button
            key={day.date}
            onClick={() => setActiveDay(idx)}
            className={`
              flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
              ${
                idx === activeDay
                  ? "bg-white/[0.08] text-white shadow-lg"
                  : "bg-white/[0.03] text-white/40 hover:bg-white/[0.05] hover:text-white/60 border border-white/[0.04]"
              }
            `}
          >
            <div className="text-xs md:text-sm">{day.dayName}</div>
            <div
              className="font-mono text-xs mt-1 px-2 py-0.5 rounded-md inline-block"
              style={{
                backgroundColor: `${getQualityColor(day.averageQuality)}15`,
                color: getQualityColor(day.averageQuality),
              }}
            >
              {day.averageQuality.toFixed(1)}
            </div>
          </button>
        ))}
      </div>

      {/* Timeline ore scrollabile */}
      <div className="relative mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={12} className="text-white/30" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
            Timeline oraria
          </span>
        </div>
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            {currentDay?.hours.map((hour, idx) => (
              <HourSlot key={hour.hour} data={hour} index={idx} visible={inView} />
            ))}
          </div>

          {showScrollHint && currentDay?.hours && currentDay.hours.length > 4 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowRight size={16} className="text-white/20 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Grafici vento e termiche */}
      {firstHour && currentDay && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4 md:p-5">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart3 size={12} />
              Vento in Quota
            </h4>
            <WindProfileChart
              surfaceWind={{ speed: firstHour.windSpeed10m, direction: firstHour.windDirection10m }}
              wind1500m={{ speed: firstHour.windSpeed1500m, direction: firstHour.windDirection1500m }}
              wind2500m={{ speed: firstHour.windSpeed2500m, direction: firstHour.windDirection2500m }}
              wind3500m={{ speed: firstHour.windSpeed3500m, direction: firstHour.windDirection3500m }}
            />
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#121212] p-4 md:p-5">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart3 size={12} />
              Termiche
            </h4>
            <ThermalChart hours={currentDay.hours} />
          </div>
        </div>
      )}

      {/* Tabella dati completa */}
      {currentDay && (
        <div className="rounded-xl border border-white/[0.06] bg-[#121212] overflow-hidden">
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
                  <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Qualità</th>
                </tr>
              </thead>
              <tbody>
                {currentDay.hours.map((h) => (
                  <tr
                    key={h.hour}
                    className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-white/90 text-sm">
                      {formatHour(h.hour)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white/70">
                      {h.temp.toFixed(0)}°
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white/70">
                      {h.humidity.toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#4DA3FF] font-semibold">
                      {h.windSpeed10m.toFixed(0)} km/h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#7db8ff]">
                      {h.windSpeed1500m.toFixed(0)} km/h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#5890d0]">
                      {h.windSpeed2500m.toFixed(0)} km/h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#3a6a9e]">
                      {h.windSpeed3500m.toFixed(0)} km/h
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white/70">
                      {h.cloudCover.toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#FF9F1C] font-semibold">
                      {h.thermalStrength.toFixed(1)} m/s
                    </td>
                    <td
                      className="py-2.5 px-3 font-mono font-bold text-sm"
                      style={{ color: getQualityColor(h.qualityScore) }}
                    >
                      {h.qualityScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}