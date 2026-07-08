import { useState, useEffect, useMemo } from "react";
import { Loader2, MapPin, Wind, Thermometer, Cloud, Eye, TrendingUp, Mountain, ChevronDown, AlertTriangle } from "lucide-react";
import { cn } from "./lib/utils";
import { launches, type Launch, type DailyForecast, fetchWeatherForecast } from "./utils/weatherForecast";

type Tab = "oggi" | "domani" | "dopodomani";

function WeatherBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function DayHeader({ tab, active, onSelect }: { tab: Tab; active: boolean; onSelect: () => void }) {
  const labels: Record<Tab, string> = {
    oggi: "Oggi",
    domani: "Domani",
    dopodomani: "Dopodomani",
  };
  return (
    <button
      onClick={onSelect}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
        active ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      )}
    >
      {labels[tab]}
    </button>
  );
}

function weatherEmoji(icon: string): string {
  const map: Record<string, string> = {
    sun: "☀️",
    "cloud-sun": "⛅",
    cloud: "☁️",
    rain: "🌧️",
    thunder: "⛈️",
    snow: "❄️",
    fog: "🌫️",
  };
  return map[icon] || "❓";
}

function DailyCard({ day, isFirst }: { day: DailyForecast; isFirst: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{weatherEmoji(day.icon)}</span>
          <span className="text-3xl font-bold text-white">{Math.round(day.tempMax)}°</span>
          <span className="text-sm text-zinc-500">/ {Math.round(day.tempMin)}°</span>
        </div>
        <span className="text-xs text-zinc-500">{day.description}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
          <WeatherBadge icon={<Wind size={14} />} label="Vento" />
          <span className="text-lg font-semibold text-white">
            {day.windSpeed} <span className="text-xs font-normal text-zinc-400">km/h</span>
          </span>
          <span className="text-xs text-zinc-500 block">da {day.windDir}</span>
          {day.gusts && <span className="text-xs text-amber-400">Raffiche: {day.gusts} km/h</span>}
        </div>

        <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
          <WeatherBadge icon={<Thermometer size={14} />} label="Termiche" />
          <span
            className={cn(
              "text-lg font-semibold",
              day.thermalQuality >= 3 ? "text-emerald-400" : day.thermalQuality >= 1 ? "text-amber-400" : "text-zinc-500"
            )}
          >
            {day.thermalLabel}
          </span>
          <span className="text-xs text-zinc-500 block">Delta: {day.deltaT}°C</span>
        </div>

        <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
          <WeatherBadge icon={<Cloud size={14} />} label="Nuvolosità" />
          <span className="text-lg font-semibold text-white">{day.cloudCover}%</span>
          {day.plafond && <span className="text-xs text-zinc-500 block">Plafond: {day.plafond}m</span>}
        </div>

        <div className="bg-zinc-800/60 rounded-xl p-3 space-y-2">
          <WeatherBadge icon={<Eye size={14} />} label="Visibilità" />
          <span className="text-lg font-semibold text-white">{day.visibility} km</span>
        </div>
      </div>

      <div className="bg-zinc-800/40 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="text-sm text-zinc-300">Cross Country</span>
        </div>
        <span
          className={cn(
            "text-sm font-semibold",
            day.xcScore >= 3 ? "text-emerald-400" : day.xcScore >= 1 ? "text-amber-400" : "text-zinc-500"
          )}
        >
          {day.xcLabel}
        </span>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Consigli di volo</span>
        {day.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
            <span className="text-zinc-300">{tip}</span>
          </div>
        ))}
        {day.tips.length === 0 && <p className="text-xs text-zinc-600 italic">Nessun consiglio particolare</p>}
      </div>

      {!isFirst && <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />}
    </div>
  );
}

export default function App() {
  const [selectedLaunch, setSelectedLaunch] = useState<string>("Malanotte");
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("oggi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLaunchMenu, setShowLaunchMenu] = useState(false);

  const selectedLaunchData: Launch | undefined = launches.find((l) => l.name === selectedLaunch);

  useEffect(() => {
    if (!selectedLaunchData) return;
    setLoading(true);
    setError(null);
    fetchWeatherForecast(selectedLaunchData)
      .then((res) => {
        setForecast(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedLaunch]);

  const tabIndex = useMemo(() => (activeTab === "oggi" ? 0 : activeTab === "domani" ? 1 : 2), [activeTab]);

  if (loading && !forecast) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto" />
          <p className="text-zinc-400 text-sm">Caricamento dati meteo…</p>
        </div>
      </div>
    );
  }

  if (error && !forecast) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-800/40 rounded-2xl p-6 max-w-md text-center space-y-3">
          <AlertTriangle size={32} className="text-red-400 mx-auto" />
          <h2 className="text-lg font-semibold text-red-300">Errore di caricamento</h2>
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-800/40 hover:bg-red-800/60 text-red-300 rounded-xl text-sm transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mountain size={20} className="text-emerald-400" />
              <h1 className="text-lg font-bold">Meteo dei Conigli</h1>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowLaunchMenu((p) => !p)}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-xl text-sm transition-colors"
              >
                <MapPin size={14} className="text-emerald-400" />
                <span className="text-zinc-200">{selectedLaunch}</span>
                <ChevronDown size={14} className={cn("text-zinc-500 transition-transform", showLaunchMenu && "rotate-180")} />
              </button>

              {showLaunchMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLaunchMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-800 border border-zinc-700 rounded-xl py-1 w-56 shadow-2xl">
                    {launches.map((l) => (
                      <button
                        key={l.name}
                        onClick={() => {
                          setSelectedLaunch(l.name);
                          setShowLaunchMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm transition-colors",
                          l.name === selectedLaunch ? "bg-emerald-600/20 text-emerald-400" : "text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        <div>{l.name}</div>
                        <div className="text-xs text-zinc-500">{l.valley} &bull; {l.exposure}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedLaunchData && (
            <div className="mt-1.5 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={10} />
                {selectedLaunchData.valley}
              </span>
              <span className="text-zinc-700">|</span>
              <span>{selectedLaunchData.exposure}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-2">
          {(["oggi", "domani", "dopodomani"] as Tab[]).map((tab) => (
            <DayHeader key={tab} tab={tab} active={activeTab === tab} onSelect={() => setActiveTab(tab)} />
          ))}
        </div>

        {forecast && forecast[tabIndex] ? (
          <DailyCard key={tabIndex} day={forecast[tabIndex]} isFirst={tabIndex === 0} />
        ) : (
          forecast && <p className="text-zinc-500 text-sm">Nessun dato disponibile per questo giorno.</p>
        )}

        {loading && forecast && (
          <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <Loader2 size={16} className="animate-spin" />
            <span>Aggiornamento…</span>
          </div>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 py-6 text-center text-xs text-zinc-700">
        <p>Dati: Open-Meteo &bull; Algoritmi termici stimati &bull; Vola sempre in sicurezza</p>
      </footer>
    </div>
  );
}