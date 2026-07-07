import { LaunchForecast } from "@/types/weather";
import { QualityBadge } from "./QualityBadge";
import { MiniMap } from "./MiniMap";
import { useAnimatedNumber } from "@/hooks/useAnimationOnMount";
import { getQualityColor, getDayName } from "@/utils/weatherCalculations";
import { ChevronRight, Wind, Cloud, Thermometer, Clock } from "lucide-react";

interface LaunchCardProps {
  forecast: LaunchForecast;
  onSelect: () => void;
  index?: number;
  visible?: boolean;
}

export function LaunchCard({ forecast, onSelect, index = 0, visible = true }: LaunchCardProps) {
  const animatedScore = useAnimatedNumber(forecast.overallScore, 600, visible);
  const color = getQualityColor(forecast.overallScore);

  return (
    <div
      className={`
        relative group cursor-pointer rounded-xl
        border border-white/[0.06] bg-[#121212]
        hover:bg-[#181818] hover:border-[#00FF8C]/20
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      style={{
        transitionDelay: `${index * 60}ms`,
      }}
      onClick={onSelect}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px ${color}08, 0 0 40px ${color}05`,
        }}
      />

      <div className="relative p-4 flex items-center gap-4">
        {/* Mini map */}
        <div className="hidden sm:block flex-shrink-0">
          <MiniMap lat={forecast.lat} lon={forecast.lon} size={64} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
            {forecast.siteName}
          </h3>

          {/* Day summaries */}
          <div className="flex gap-3 mt-2">
            {forecast.days.map((day) => (
              <div key={day.date} className="flex items-center gap-1.5 text-[10px] text-white/50">
                <Clock size={10} className="text-white/30" />
                <span>{getDayName(day.date)}</span>
                <span
                  className="font-mono font-bold"
                  style={{ color: getQualityColor(day.averageQuality) }}
                >
                  {day.averageQuality.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <Wind size={10} color="#4DA3FF" />
              {forecast.days[0]?.hours[0]?.windSpeed10m.toFixed(0) ?? "--"} km/h
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <Thermometer size={10} color="#FF9F1C" />
              {forecast.days[0]?.hours[0]?.temp.toFixed(0) ?? "--"}°
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <Cloud size={10} color="#4DA3FF" />
              {forecast.days[0]?.hours[0]?.cloudCover.toFixed(0) ?? "--"}%
            </div>
          </div>
        </div>

        {/* Quality Score */}
        <div className="flex-shrink-0">
          <QualityBadge score={forecast.overallScore} size="md" showLabel={false} />
        </div>

        {/* Arrow */}
        <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
      </div>
    </div>
  );
}
