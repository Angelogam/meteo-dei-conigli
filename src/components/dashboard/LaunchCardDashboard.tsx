import { LaunchForecast } from "@/types/weather";
import { ScoreGauge } from "./ScoreGauge";
import { MiniMap } from "../MiniMap";
import { InfoTooltip } from "./InfoTooltip";
import { getQualityColor, getDayName } from "@/utils/weatherCalculations";
import { ChevronRight, Mountain, Compass, Clock, Thermometer, Wind, Sun } from "lucide-react";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";

interface LaunchCardDashboardProps {
  forecast: LaunchForecast;
  onSelect: () => void;
  index?: number;
}

export function LaunchCardDashboard({ forecast, onSelect, index = 0 }: LaunchCardDashboardProps) {
  const { ref, inView } = useInViewAnimation(0.05);
  const color = getQualityColor(forecast.overallScore);
  const delay = index * 80;

  return (
    <div
      ref={ref}
      className="launch-card"
      style={{
        transitionDelay: `${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
      }}
      onClick={onSelect}
    >
      {/* Glow hover */}
      <div
        className="launch-card-glow"
        style={{
          boxShadow: `inset 0 0 40px ${color}08, 0 0 60px ${color}05`,
        }}
      />

      <div className="launch-card-inner">
        {/* Mini mappa */}
        <div className="hidden sm:block flex-shrink-0">
          <MiniMap lat={forecast.lat} lon={forecast.lon} size={72} />
        </div>

        {/* Info principali */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="launch-card-name">{forecast.siteName}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="launch-card-meta">
                  <Mountain size={12} /> {forecast.elevation} m
                </span>
                <span className="launch-card-meta">
                  <Compass size={12} /> {forecast.exposure}
                </span>
                <span className="launch-card-meta">
                  <Wind size={12} />
                  {forecast.days[0]?.hours[0]?.windSpeed10m.toFixed(0) ?? "--"} km/h
                </span>
              </div>
            </div>
            {/* Score gauge */}
            <ScoreGauge score={forecast.overallScore} size="md" showLabel={false} />
          </div>

          {/* Riepilogo giorni */}
          <div className="flex flex-wrap gap-2 mt-3">
            {forecast.days.map((day) => {
              const bestHour = day.hours.find((h) => h.hour === day.bestHour);
              return (
                <div
                  key={day.date}
                  className="day-chip"
                  style={{
                    borderColor: `${getQualityColor(day.averageQuality)}20`,
                    backgroundColor: `${getQualityColor(day.averageQuality)}08`,
                  }}
                >
                  <span className="text-[10px] font-medium text-white/60">{day.dayName}</span>
                  <span className="text-[12px] font-bold font-mono" style={{ color: getQualityColor(day.averageQuality) }}>
                    {day.averageQuality.toFixed(1)}
                  </span>
                  {bestHour && (
                    <span className="text-[9px] text-white/40 flex items-center gap-0.5">
                      <Clock size={8} /> {String(bestHour.hour).padStart(2, '0')}:00
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info tooltip */}
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/30">
            <InfoTooltip
              text="Il punteggio (1-5) combina forza termica, vento al suolo, vento in quota e turbolenza. Più alto è, migliori sono le condizioni per volare."
              title="Come si calcola"
            />
            <span>Punteggio basato su termiche, vento e turbolenza</span>
          </div>
        </div>

        {/* Freccia */}
        <ChevronRight size={18} className="text-white/15 group-hover:text-white/40 transition-colors flex-shrink-0" />
      </div>
    </div>
  );
}