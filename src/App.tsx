import { useEffect, useState, useMemo, useCallback } from "react";
import { DECOLLI } from "@/data/launchSites";
import { fetchMeteoCompleta } from "@/utils/api";
import { getWeatherIcon } from "@/utils/meteo";
import { generateAIAnalysis } from "@/utils/ai";
import { SiteList } from "@/components/SiteList";
import { DaySelector } from "@/components/DaySelector";
import { HourSlider } from "@/components/HourSlider";
import { AIAnalysis } from "@/components/AIAnalysis";
import { MeteoGrid } from "@/components/MeteoGrid";
import { WindAnalysis } from "@/components/WindAnalysis";
import type { MeteoResponse, HourlyData } from "@/utils/api";
import type { LaunchSite } from "@/data/launchSites";

export default function App() {
  const [selected, setSelected] = useState(DECOLLI[0].id);
  const [meteoData, setMeteoData] = useState<MeteoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);
  
  const site = DECOLLI.find((x) => x.id === selected) as LaunchSite;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMeteoCompleta(site.lat, site.lon);
        setMeteoData(data);
      } catch (err) {
        setError("Errore nel caricamento dei dati meteo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected, site.lat, site.lon]);

  const getDayData = useCallback((): HourlyData[] | null => {
    if (!meteoData) return null;
    const today = new Date();
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() + selectedDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return meteoData.hourly.filter(h => h.time >= dayStart && h.time < dayEnd);
  }, [meteoData, selectedDay]);

  const thermalDelta = useMemo(() => {
    const dayData = getDayData();
    if (!dayData || dayData.length === 0) return 0;
    const temps = dayData.map(h => h.temperature).filter(t => t !== undefined && t !== null);
    if (temps.length === 0) return 0;
    return Math.round(Math.max(...temps) - Math.min(...temps));
  }, [getDayData]);

  const dayData = getDayData();
  const currentData = useMemo(() => {
    if (!dayData || dayData.length === 0) return null;
    const idx = dayData.findIndex(h => h.time.getHours() === selectedHour);
    return idx >= 0 ? dayData[idx] : dayData[Math.min(selectedHour - 9, dayData.length - 1)];
  }, [dayData, selectedHour]);

  const enrichedDailyData = useMemo(() => {
    if (!meteoData || !meteoData.daily) return [];
    return meteoData.daily.map((day, index) => {
      const dayHours = meteoData.hourly.filter(h => 
        h.time.getDate() === day.date.getDate() &&
        h.time.getMonth() === day.date.getMonth()
      );
      const temps = dayHours.map(h => h.temperature).filter(t => t !== undefined && t !== null);
      const delta = temps.length > 0 ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;
      return { ...day, thermalDelta: delta, dayIndex: index };
    });
  }, [meteoData]);

  const aiAnalysis = useMemo(() => {
    if (!dayData || !site) return null;
    return generateAIAnalysis(dayData, site, thermalDelta);
  }, [dayData, site, thermalDelta]);

  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0a0e27", color: "#eee", fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <div style={{ width: 50, height: 50, border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "#ff6b6b", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: 20, fontSize: "1.2rem", color: "#fff" }}>Caricamento previsioni meteo...</p>
        <p style={{ marginTop: 10, fontSize: "0.9rem", color: "#888" }}>Open-Meteo • Free Flight Forecast</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0a0e27", color: "#eee", fontFamily: "'Segoe UI', Arial, sans-serif"
      }}>
        <p style={{ color: "#ff6b6b", fontSize: "1.2rem", marginBottom: 20 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{
          background: "#ff6b6b", color: "#fff", border: "none", padding: "12px 30px", borderRadius: 8,
          cursor: "pointer", fontWeight: 600, fontSize: "1rem"
        }}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0a0e27", color: "#eee", minHeight: "100vh", padding: 20,
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes hop {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
      `}</style>

      <header style={{ textAlign: "center", marginBottom: 30, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 15, marginBottom: 10 }}>
          <span style={{ fontSize: "2.5rem", animation: "hop 1s ease-in-out infinite" }}>🐰</span>
          <span style={{ fontSize: "2rem", animation: "float 2s ease-in-out infinite" }}>🪂</span>
        </div>
        <h1 style={{
          fontSize: "2.2rem", marginBottom: 5,
          background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800
        }}>
          Meteo dei Conigli
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#888" }}>Previsioni per volo libero con Analisi AI • Dati da Open-Meteo</p>
      </header>

      <div style={{
        display: "grid", gridTemplateColumns: "320px 1fr", gap: 20,
        maxWidth: "1400px", margin: "0 auto"
      }}>
        <SiteList sites={DECOLLI} selected={selected} onSelect={(id) => { setSelected(id); setSelectedDay(0); setSelectedHour(12); }} />

        <div style={{
          background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 15,
          border: "1px solid rgba(255,255,255,0.1)", maxHeight: "calc(100vh - 200px)", overflowY: "auto"
        }}>
          {currentData && site && (
            <>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.1)"
              }}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", marginBottom: 5, color: "#fff" }}>{site.name}</h2>
                  <span style={{ fontSize: "0.85rem", color: "#888" }}>{site.exposure} • {site.valley}</span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(255,255,255,0.1)", padding: "8px 15px", borderRadius: 30
                }}>
                  <span style={{ fontSize: "2rem" }}>{getWeatherIcon(currentData.weatherCode || 0, currentData.isDay)}</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{Math.round(currentData.temperature)}°C</span>
                </div>
              </div>

              <DaySelector days={enrichedDailyData} selectedDay={selectedDay} onSelect={(i) => { setSelectedDay(i); setSelectedHour(12); }} />
              <HourSlider value={selectedHour} onChange={setSelectedHour} />
              <AIAnalysis analysis={aiAnalysis} />
              <MeteoGrid data={currentData} thermalDelta={thermalDelta} />
              <WindAnalysis data={currentData} dayData={dayData} />
            </>
          )}
        </div>
      </div>

      <footer style={{ textAlign: "center", marginTop: 30, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ fontSize: "0.75rem", color: "#666" }}>Dati meteo forniti da Open-Meteo.com • Analisi AI per volo libero</p>
        <p style={{ fontSize: "0.65rem", color: "#444", marginTop: 5 }}>🐰 Vola sicuro e divertiti! 🪂</p>
      </footer>
    </div>
  );
}
