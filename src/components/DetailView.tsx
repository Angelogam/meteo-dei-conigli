import { LaunchForecast } from "@/types/weather";
import { MiniMap } from "./MiniMap";
import { DayTabs } from "./DayTabs";
import { QualityBadge } from "./QualityBadge";
import { ArrowLeft, Wind, MapPin, Mountain, Compass, Info } from "lucide-react";
import { getQualityLabel, getQualityColor } from "@/utils/weatherCalculations";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";
import { useState } from "react";

interface DetailViewProps {
  forecast: LaunchForecast;
  onBack: () => void;
}

export function DetailView({ forecast, onBack }: DetailViewProps) {
  const { ref, inView } = useInViewAnimation(0.1);
  const [showTips, setShowTips] = useState(false);

  const label = getQualityLabel(forecast.overallScore);
  const color = getQualityColor(forecast.overallScore);

  return (
    <div ref={ref} className={`transition-all duration-500 ${inView ? "opacity-100" : "opacity-0 translate-y-4"}`}>
      {/* Torna indietro */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/80 transition-colors mb-4 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Torna alla lista
      </button>

      {/* Hero del decollo */}
      <div className="card-premium overflow-hidden mb-6">
        <div
          className="p-5 sm:p-6"
          style={{
            background: `linear-gradient(135deg, ${color}06, transparent 70%)`,
          }}
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <MiniMap lat={forecast.lat} lon={forecast.lon} size={96} />

            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {forecast.siteName}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 text-[13px] text-white/60">
                  <Mountain size={14} className="text-[#00FF8C]" />
                  {forecast.elevation} m
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-white/60">
                  <Compass size={14} className="text-[#4DA3FF]" />
                  {forecast.exposure}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-white/60">
                  <MapPin size={13} className="text-white/30" />
                  {forecast.lat.toFixed(4)}, {forecast.lon.toFixed(4)}
                </div>
              </div>

              {forecast.days[0]?.hours[0] && (
                <div className="flex items-center gap-2 mt-2.5">
                  <Wind size={14} className="text-[#4DA3FF]" />
                  <span className="text-[13px] text-white/70 font-mono">
                    Vento al suolo: {forecast.days[0].hours[0].windSpeed10m.toFixed(0)} km/h
                  </span>
                </div>
              )}
            </div>

            {/* Punteggio grande a destra */}
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center animate-scale-badge"
                style={{
                  background: `radial-gradient(circle at center, ${color}15, ${color}08)`,
                  border: `2px solid ${color}40`,
                  boxShadow: `0 0 24px ${color}20`,
                }}
              >
                <span className="text-3xl font-bold font-mono" style={{ color }}>
                  {forecast.overallScore.toFixed(1)}
                </span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider mt-1.5" style={{ color: `${color}CC` }}>
                {label}
              </span>
            </div>
          </div>

          {/* Riepilogo giorni */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {forecast.days.map((day) => {
              const bestHour = day.hours.find((h) => h.hour === day.bestHour);
              return (
                <div
                  key={day.date}
                  className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-center"
                >
                  <div className="text-xs text-white/50 font-semibold">{day.dayName}</div>
                  <div className="punteggio-medio mt-1" style={{ color: getQualityColor(day.averageQuality) }}>
                    {day.averageQuality.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-white/45 mt-0.5">
                    {getQualityLabel(day.averageQuality)}
                  </div>
                  {bestHour && (
                    <div className="text-[10px] text-white/40 mt-1">
                      Migliore: {String(bestHour.hour).padStart(2, '0')}:00
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Consiglio rapido */}
      <button
        onClick={() => setShowTips(!showTips)}
        className="flex items-center gap-2 text-[11px] text-white/40 hover:text-white/70 transition-colors mb-3"
      >
        <Info size={12} />
        {showTips ? "Nascondi" : "Perché questo punteggio?"}
      </button>

      {showTips && (
        <div className="card-premium p-4 mb-5 animate-slide-fade">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-white/60 leading-relaxed">
            <div>
              <span className="font-semibold text-white/80">Punteggio {label.toLowerCase()}</span> — 
              {forecast.overallScore >= 4
                ? " Ottime condizioni per volare. Venti moderati, termiche presenti e bassa turbolenza."
                : forecast.overallScore >= 3
                ? " Condizioni discrete. Verifica il vento in quota prima di decollare."
                : " Condizioni non ideali. Vento o termiche possono rendere il volo scomodo."}
            </div>
            <div>
              <span className="font-semibold text-white/80">Consiglio:</span>{" "}
              {forecast.overallScore >= 4
                ? "Giornata consigliata per volare. Controlla solo l'orario migliore."
                : forecast.overallScore >= 3
                ? "Se sei esperto puoi volare, ma scegli l'orario con il punteggio più alto."
                : "Meglio aspettare una giornata migliore o scegliere un altro decollo."}
            </div>
          </div>
        </div>
      )}

      {/* Timeline oraria */}
      <DayTabs days={forecast.days} />
    </div>
  );
}