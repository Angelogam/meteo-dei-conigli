import { LaunchForecast } from "@/types/weather";
import { QualityBadge } from "./QualityBadge";
import { MiniMap } from "./MiniMap";
import { getQualityColor, getDayName } from "@/utils/weatherCalculations";
import { ChevronRight, Mountain, Compass, Wind, Clock, TrendingUp } from "lucide-react";

interface LaunchCardProps {
  forecast: LaunchForecast;
  onSelect: () => void;
  index?: number;
  visible?: boolean;
}

export function LaunchCard({ forecast, onSelect, index = 0, visible = true }: LaunchCardProps) {
  const color = getQualityColor(forecast.overallScore);

  // Trova il miglior giorno
  const bestDay = forecast.days.reduce((best, day) =>
    day.averageQuality > best.averageQuality ? day : best
  );

  // Miglioramento rispetto a oggi/domani/dopodomani
  const miglioramento =
    forecast.days.length >= 2
      ? (forecast.days[1].averageQuality - forecast.days[0].averageQuality).toFixed(1)
      : "0.0";

  const trendUp = parseFloat(miglioramento) > 0.3;
  const trendDown = parseFloat(miglioramento) < -0.3;

  return (
    <div
      className={`
        group cursor-pointer rounded-2xl
        border border-white/[0.06] bg-[#121212]
        hover:bg-[#181818] hover:border-[#00FF8C]/18
        transition-all duration-400 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        transitionDelay: `${index * 70}ms`,
        animation: visible ? `none` : undefined,
      }}
      onClick={onSelect}
    >
      <div className="relative p-4 sm:p-5 flex items-center gap-4">
        {/* Mini mappa */}
        <div className="hidden sm:block flex-shrink-0">
          <MiniMap lat={forecast.lat} lon={forecast.lon} size={72} />
        </div>

        {/* Info principali */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[15px] font-semibold text-white/90 truncate group-hover:text-white transition-colors">
              {forecast.siteName}
            </h3>
            {/* Trend badge */}
            {trendUp && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#00FF8C] bg-[#00FF8C]/8 px-1.5 py-0.5 rounded-full">
                <TrendingUp size={10} />
                +{miglioramento}
              </span>
            )}
            {trendDown && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#FF4E4E] bg-[#FF4E4E]/8 px-1.5 py-0.5 rounded-full">
                <TrendingUp size={10} className="rotate-180" />
                {miglioramento}
              </span>
            )}
          </div>

          {/* Dettagli rapidi */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <div className="flex items-center gap-1.5 text-[12px] text-white/50">
              <Mountain size={12} className="text-[#00FF8C]/70" />
              {forecast.elevation} m
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-white/50">
              <Compass size={12} className="text-[#4DA3FF]/70" />
              {forecast.exposure}
            </div>
            {forecast.days[0]?.hours[0] && (
              <div className="flex items-center gap-1.5 text-[12px] text-white/50">
                <Wind size={12} className="text-white/30" />
                {forecast.days[0].hours[0].windSpeed10m.toFixed(0)} km/h
              </div>
            )}
          </div>

          {/* Giorni */}
          <div className="flex items-center gap-3 mt-2.5">
            {forecast.days.map((day, i) => {
              const isBest = day.averageQuality >= bestDay.averageQuality;
              return (
                <div
                  key={day.date}
                  className={`flex items-center gap-1.5 text-[11px] ${
                    isBest ? "text-white/80" : "text-white/45"
                  }`}
                >
                  <Clock size={10} className={isBest ? "text-[#00FF8C]" : "text-white/25"} />
                  <span className="font-medium">{getDayName(day.date)}</span>
                  <span
                    className="font-bold font-mono"
                    style={{ color: getQualityColor(day.averageQuality) }}
                  >
                    {day.averageQuality.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Punteggio e freccia */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <QualityBadge score={forecast.overallScore} size="md" showLabel={false} />
          <ChevronRight size={16} className="text-white/15 group-hover:text-white/40 transition-colors flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}