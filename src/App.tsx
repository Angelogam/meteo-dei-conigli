import "./App.css";
import { useEffect, useState } from "react";
import { LaunchForecast } from "./types/weather";
import { fetchSiteWeather } from "./services/openMeteo";
import { Header } from "./components/Header";
import { LaunchCard } from "./components/LaunchCard";
import { LoadingSkeleton } from "./components/LoadingSkeleton";

function App() {
  const [forecasts, setForecasts] = useState<LaunchForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Importa i siti dinamicamente
        const { launchSites } = await import("./data/launchSites");

        const results = await Promise.allSettled(
          launchSites.map((site) => fetchSiteWeather(site))
        );

        const successful: LaunchForecast[] = [];
        for (const result of results) {
          if (result.status === "fulfilled") {
            successful.push(result.value);
          } else {
            console.error("Failed to fetch:", result.reason);
          }
        }

        // Ordina per punteggio decrescente
        successful.sort((a, b) => b.overallScore - a.overallScore);

        setForecasts(successful);

        if (successful.length === 0) {
          setError("Nessun dato meteo disponibile. Riprova più tardi.");
        }
      } catch (err) {
        console.error("Error loading weather data:", err);
        setError("Errore nel caricamento dei dati meteo. Riprova.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Sfondo decorativo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00FF8C]/[0.02] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4DA3FF]/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-6 md:py-10">
        <Header />

        {/* Stato loading */}
        {loading && <LoadingSkeleton />}

        {/* Stato errore */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <p className="text-white/50 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Lista decolli */}
        {!loading && !error && (
          <div className="space-y-3 md:space-y-4">
            {forecasts.map((forecast, idx) => (
              <LaunchCard key={forecast.siteId} data={forecast} index={idx} />
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && !error && forecasts.length > 0 && (
          <footer className="mt-12 md:mt-16 pb-8 text-center">
            <p className="text-[10px] text-white/15 font-mono">
              Dati: Open-Meteo · Aggiornato in tempo reale
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;