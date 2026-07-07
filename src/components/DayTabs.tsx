import { DayForecast } from "@/types/weather";
import { getQualityColor, formatHour } from "@/utils/weatherCalculations";
import { HourSlot } from "./HourSlot";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";
import { WindProfileChart } from "./WindProfileChart";
import { ThermalChart } from "./ThermalChart";
import { ArrowRight, Info } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface DayTabsProps {
  days: DayForecast[];
}

const didascalie = {
  vento: "Il vento a quote diverse ti dice se puoi salire senza problemi. Troppo vento in quota = raffiche pericolose.",
  termiche: "Le termiche sono correnti d'aria calda che ti permettono di salire. Più sono forti, più guadagni quota.",
  turbolenza: "La turbolenza indica quanto l'aria è 'mossa'. Poca = volo tranquillo. Tanta = attenzione ai sobbalzi.",
  punteggio: "Il punteggio generale combina vento, termiche e turbolenza. 5 = giornata perfetta per volare.",
};

export function DayTabs({ days }: DayTabsProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showDidascalia, setShowDidascalia] = useState(false);
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
      {/* Selettore giorni */}
      <div className="flex gap-2 mb-4">
        {days.map((day, idx) => (
          <button
            key={day.date}
            onClick={() => setActiveDay(idx)}
            className={`
              flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-300
              ${
                idx === activeDay
                  ? "bg-white/12 text-white shadow-lg border border-white/10"
                  : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70 border border-transparent"
              }
            `}
          >
            <div>{day.dayName}</div>
            <div
              className="font-mono text-xs mt-0.5"
              style={{ color: getQualityColor(day.averageQuality) }}
            >
              {day.averageQuality.toFixed(1)}
            </div>
          </button>
        ))}
      </div>

      {/* Timeline ore */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {currentDay?.hours.map((hour, idx) => (
            <HourSlot key={hour.hour} data={hour} index={idx} visible={inView} />
          ))}
        </div>
        {showScrollHint && currentDay?.hours && currentDay.hours.length > 3 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <ArrowRight size={16} className="text-white/25 animate-pulse" />
          </div>
        )}
      </div>

      {/* Box didattico */}
      <button
        onClick={() => setShowDidascalia(!showDidascalia)}
        className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white/70 transition-colors mt-2 mb-4"
      >
        <Info size={12} />
        {showDidascalia ? "Nascondi spiegazioni" : "Cosa significano questi dati?"}
      </button>

      {showDidascalia && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          {Object.entries(didascalie).map(([key, testo]) => (
            <div key={key} className="text-[12px] text-white/60 leading-relaxed">
              <span className="font-semibold text-white/80 capitalize">{key}: </span>
              {testo}
            </div>
          ))}
        </div>
      )}

      {/* Grafici */}
      {firstHour && currentDay && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="card-premium p-4">
            <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em] mb-3">
              Vento in Quota
            </h4>
            <WindProfileChart
              surfaceWind={{ speed: firstHour.windSpeed10m, direction: firstHour.windDirection10m }}
              wind1500m={{ speed: firstHour.windSpeed1500m, direction: firstHour.windDirection1500m }}
              wind2500m={{ speed: firstHour.windSpeed2500m, direction: firstHour.windDirection2500m }}
              wind3500m={{ speed: firstHour.windSpeed3500m, direction: firstHour.windDirection3500m }}
            />
          </div>
          <div className="card-premium p-4">
            <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em] mb-3">
              Termiche del Giorno
            </h4>
            <ThermalChart hours={currentDay.hours} />
          </div>
        </div>
      )}

      {/* Tabella dati completa */}
      {currentDay && (
        <div className="card-premium overflow-hidden">
          <div className="p-3 border-b border-white/[0.04]">
            <h4 className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.12em]">
              Dettaglio Orario Completo
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Ora</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Temp</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Umid</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Vento 10m</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Vento 1500m</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Vento 2500m</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Vento 3500m</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Nuvole</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Termiche</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Turbol.</th>
                  <th className="text-left py-2.5 px-3 text-white/40 font-semibold">Qualità</th>
                </tr>
              </thead>
              <tbody>
                {currentDay.hours.map((h) => (
                  <tr
                    key={h.hour}
                    className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-white/80 text-sm font-semibold">
                      {formatHour(h.hour)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white/60">{h.temp.toFixed(0)}°</td>
                    <td className="py-2.5 px-3 font-mono text-white/60">{h.humidity.toFixed(0)}%</td>
                    <td className="py-2.5 px-3 font-mono text-[#4DA3FF] font-semibold">{h.windSpeed10m.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono text-[#7db8ff]">{h.windSpeed1500m.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono text-[#5890d0]">{h.windSpeed2500m.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono text-[#3a6a9e]">{h.windSpeed3500m.toFixed(0)}</td>
                    <td className="py-2.5 px-3 font-mono text-white/60">{h.cloudCover.toFixed(0)}%</td>
                    <td className="py-2.5 px-3 font-mono text-[#FF9F1C] font-semibold">{h.thermalStrength.toFixed(1)}</td>
                    <td className="py-2.5 px-3 font-mono text-[#FFC857] font-semibold">{h.turbulence}/5</td>
                    <td className="py-2.5 px-3 font-mono font-bold" style={{ color: getQualityColor(h.qualityScore) }}>
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