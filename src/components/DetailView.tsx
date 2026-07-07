import { LaunchForecast } from "@/types/weather";
import { MiniMap } from "./MiniMap";
import { DayTabs } from "./DayTabs";
import { QualityBadge } from "./QualityBadge";
import { ArrowLeft, Wind, MapPin, RefreshCw } from "lucide-react";
import { getQualityLabel, getQualityColor } from "@/utils/weatherCalculations";
import { useInViewAnimation } from "@/hooks/useAnimationOnMount";

interface DetailViewProps {
  forecast: LaunchForecast;
  onBack: () => void;
}

export function DetailView({ forecast, onBack }: DetailViewProps) {
  const { ref, inView } = useInViewAnimation(0.1);

  return (
    <div ref={ref} className={`transition-all duration-500 ${inView ? "opacity-100" : "opacity-0"}`}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/80 transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Torna alla lista
      </button>

      {/* Hero section */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${getQualityColor(forecast.overallScore)}08, transparent 70%)`,
          }}
        />

        <div className="relative p-6 border border-white/[0.06] rounded-2xl bg-[#121212]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <MiniMap lat={forecast.lat} lon={forecast.lon} size={80} />
              <div>
                <h2 className="text-xl font-bold text-white">{forecast.siteName}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-white/60">
                  <MapPin size={11} />
                  {forecast.lat.toFixed(4)}, {forecast.lon.toFixed(4)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Wind size={13} color="#4DA3FF" />
                  <span className="text-xs text-white/60 font-mono">
                    {forecast.days[0]?.hours[0]?.windSpeed10m.toFixed(0) ?? "--"} km/h suolo
                  </span>
                </div>
              </div>
            </div>

            {/* Overall quality */}
            <div className="text-right">
              <QualityBadge score={forecast.overallScore} size="lg" />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {forecast.days.map((day) => {
              const bestHour = day.hours.find((h) => h.hour === day.bestHour);
              return (
                <div
                  key={day.date}
                  className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-center"
                >
                  <div className="text-xs text-white/60 font-medium">{day.dayName}</div>
                  <div
                    className="text-base font-bold font-mono mt-1"
                    style={{ color: getQualityColor(day.averageQuality) }}
                  >
                    {day.averageQuality.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-white/45 mt-0.5">
                    {getQualityLabel(day.averageQuality)}
                  </div>
                  {bestHour && (
                    <div className="text-[10px] text-white/45 mt-1">
                      Migliore: {String(bestHour.hour).padStart(2, '0')}:00
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day tabs with hour slots, charts, table */}
      <DayTabs days={forecast.days} />
    </div>
  );
}
