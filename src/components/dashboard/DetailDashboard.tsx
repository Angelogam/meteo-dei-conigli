import { useState } from "react";
import { LaunchForecast } from "@/types/weather";
import { MiniMap } from "../MiniMap";
import { ScoreGauge } from "./ScoreGauge";
import { DashboardTimeline } from "./DashboardTimeline";
import { InfoTooltip } from "./InfoTooltip";
import { getQualityColor, getQualityLabel, getDayName } from "@/utils/weatherCalculations";
import { ArrowLeft, Wind, MapPin, Mountain, Compass, Sun, Clock, Thermometer } from "lucide-react";

interface DetailDashboardProps {
  forecast: LaunchForecast;
  onBack: () => void;
}

export function DetailDashboard({ forecast, onBack }: DetailDashboardProps) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const currentDay = forecast.days[activeDayIdx];
  const color = getQualityColor(forecast.overallScore);

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/80 transition-colors mb-4 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Torna alla lista
      </button>

      {/* Hero section */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-bg" style={{ background: `linear-gradient(135deg, ${color}08, transparent 70%)` }} />
        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <MiniMap lat={forecast.lat} lon={forecast.lon} size={88} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">{forecast.siteName}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <Mountain size={12} className="text-[#00FF8C]" /> {forecast.elevation} m
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/50">
                  <Compass size={12} className="text-[#4DA3FF]" /> {forecast.exposure}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40">
                  <MapPin size={10} /> {forecast.lat.toFixed(4)}, {forecast.lon.toFixed(4)}
                </span>
              </div>

              {/* Didascalia esplicativa */}
              <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[11px] text-white/50 leading-relaxed">
                  <strong className="text-white/70">Punteggio {getQualityLabel(forecast.overallScore)} ({forecast.overallScore}/5)</strong> — 
                  Questo decollo ha condizioni {forecast.overallScore >= 3.5 ? "favorevoli" : forecast.overallScore >= 2.5 ? "medie" : "difficili"} per il volo libero. 
                  I punteggi combinano vento al suolo, vento in quota, forza termica e turbolenza.
                </p>
              </div>
            </div>
            <ScoreGauge score={forecast.overallScore} size="lg" />
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mt-6">
        {forecast.days.map((day, idx) => (
          <button
            key={day.date}
            onClick={() => setActiveDayIdx(idx)}
            className={`day-selector-btn ${idx === activeDayIdx ? "day-selector-active" : ""}`}
            style={idx === activeDayIdx ? { borderColor: `${getQualityColor(day.averageQuality)}40`, backgroundColor: `${getQualityColor(day.averageQuality)}10` } : {}}
          >
            <Sun size={12} className="text-[#FFC857]" />
            <span>{day.dayName}</span>
            <span className="font-mono text-xs" style={{ color: getQualityColor(day.averageQuality) }}>
              {day.averageQuality.toFixed(1)}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-4">
        {currentDay && (
          <div className="dashboard-panel">
            <DashboardTimeline day={currentDay} />
          </div>
        )}
      </div>

      {/* Box didattico */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DidacticBox
          icon={<Thermometer size={14} />}
          title="Termiche"
          color="#FF9F1C"
          text="Correnti d'aria calda che salgono. Più sono forti, più puoi guadagnare quota. Ideali tra 1 e 4 m/s."
        />
        <DidacticBox
          icon={<Wind size={14} />}
          title="Vento"
          color="#4DA3FF"
          text="Vento al suolo (decollo) e in quota (volo). Troppo vento = pericoloso, troppo poco = difficile decollare."
        />
        <DidacticBox
          icon={<AlertTriangle size={14} />}
          title="Turbolenza"
          color="#FFC857"
          text="Aria mossa che rende il volo scomodo. A livelli alti (4-5) può essere pericolosa. Meglio livelli 1-2."
        />
      </div>

      {/* Tabella dati completa */}
      {currentDay && (
        <div className="mt-4 dashboard-panel overflow-hidden">
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
                  <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Nuvole</th>
                  <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Termiche</th>
                  <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Turbolenza</th>
                  <th className="text-left py-2.5 px-3 text-white/60 font-semibold text-[11px]">Quality</th>
                </tr>
              </thead>
              <tbody>
                {currentDay.hours.map((h) => (
                  <tr key={h.hour} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-white/90 text-sm">{String(h.hour).padStart(2, '0')}:00</td>
                    <td className="py-2.5 px-3 font-mono text-white/70">{h.temp.toFixed(0)}°</td>
                    <td className="py-2.5 px-3 font-mono text-white/70">{h.humidity.toFixed(0)}%</td>
                    <td className="py-2.5 px-3 font-mono text-[#4DA3FF] font-semibold">{h.windSpeed10m.toFixed(0)} km/h</td>
                    <td className="py-2.5 px-3 font-mono text-[#7db8ff]">{h.windSpeed1500m.toFixed(0)} km/h</td>
                    <td className="py-2.5 px-3 font-mono text-[#5890d0]">{h.windSpeed2500m.toFixed(0)} km/h</td>
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
      )}
    </div>
  );
}

function DidacticBox({ icon, title, color, text }: { icon: React.ReactNode; title: string; color: string; text: string }) {
  return (
    <div className="dashboard-panel p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-semibold text-white/70">{title}</span>
        <InfoTooltip text={text} title={`Cosa significa "${title}"`} />
      </div>
      <p className="text-[11px] text-white/45 leading-relaxed">{text}</p>
    </div>
  );
}