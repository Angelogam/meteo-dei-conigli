import React, { useState, useEffect, useMemo } from "react";
import { launches } from "./data/launches";
import {
  fetchMeteo,
  getWeatherIcon,
  getWeatherDescription,
  getWindDirection,
  getWindArrow,
  getCloudCondition,
  getThermalIndex,
  getFlightRating,
  type MeteoResponse,
} from "./utils/meteo";

export default function App() {
  const [selected, setSelected] = useState(launches[0].id);
  const [meteo, setMeteo] = useState<MeteoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);

  const site = launches.find((l) => l.id === selected)!;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMeteo(site.lat, site.lng)
      .then(setMeteo)
      .catch((e) => {
        console.error(e);
        setError("Errore nel caricamento dei dati meteo");
      })
      .finally(() => setLoading(false));
  }, [selected]);

  const dayData = useMemo(() => {
    if (!meteo) return null;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + selectedDay);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return meteo.hourly.filter((h) => h.time >= start && h.time < end);
  }, [meteo, selectedDay]);

  const currentData = useMemo(() => {
    if (!dayData || dayData.length === 0) return null;
    return dayData[Math.min(selectedHour, dayData.length - 1)];
  }, [dayData, selectedHour]);

  const thermalDelta = useMemo(() => {
    if (!dayData || dayData.length === 0) return 0;
    const temps = dayData.map((h) => h.temperature).filter((t) => t != null);
    return temps.length > 0 ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;
  }, [dayData]);

  const enrichedDaily = useMemo(() => {
    if (!meteo) return [];
    return meteo.daily.map((d, i) => {
      const h = meteo.hourly.filter(
        (hh) => hh.time.getDate() === d.date.getDate() && hh.time.getMonth() === d.date.getMonth()
      );
      const t = h.map((x) => x.temperature).filter((x) => x != null);
      return { ...d, thermalDelta: t.length > 0 ? Math.round(Math.max(...t) - Math.min(...t)) : 0, index: i };
    });
  }, [meteo]);

  const dateLabels = enrichedDaily.map((d) =>
    d.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })
  );

  const flightRating = currentData ? getFlightRating({ ...currentData, thermalDelta }) : null;
  const thermalIndex = currentData
    ? getThermalIndex(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta)
    : null;

  const hoursRange = Array.from({ length: 11 }, (_, i) => i + 9);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#fff", marginTop: 20, fontSize: "1.2rem" }}>Caricamento previsioni meteo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#ff6b6b", fontSize: "1.2rem" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.btn}>Riprova</button>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <span style={{ fontSize: "2.5rem" }}>🐰</span>
          <span style={{ fontSize: "2rem" }}>🪂</span>
        </div>
        <h1 style={styles.title}>Meteo dei Conigli</h1>
        <p style={styles.sub}>Previsioni per volo libero &bull; Open-Meteo</p>
      </header>

      <div style={styles.grid}>
        <div style={styles.left}>
          <h2 style={{ color: "#ff6b6b", marginBottom: 15, fontSize: "1.1rem" }}>📍 Decolli</h2>
          <div style={styles.list}>
            {launches.map((l) => (
              <button
                key={l.id}
                onClick={() => { setSelected(l.id); setSelectedHour(12); }}
                style={{
                  ...styles.card,
                  borderColor: l.id === selected ? "#ff6b6b" : "rgba(255,255,255,0.1)",
                  background: l.id === selected ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.03)",
                }}
              >
                <div style={styles.cardTop}>
                  <span style={{ fontWeight: "bold", color: "#fff", fontSize: "0.95rem" }}>{l.name}</span>
                  <span style={{ fontSize: "1.1rem" }}>
                    {currentData && l.id === selected
                      ? getWeatherIcon(currentData.weatherCode, currentData.isDay)
                      : "☁️"}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: 4 }}>
                  {l.valley} &bull; {l.exposure}
                </div>
                <span
                  style={{
                    ...styles.badge,
                    background: l.difficulty <= 2 ? "#4caf50" : l.difficulty <= 3 ? "#ff9800" : "#f44336",
                  }}
                >
                  {l.difficulty <= 2 ? "Facile" : l.difficulty <= 3 ? "Medio" : "Difficile"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.right}>
          {currentData && (
            <>
              <div style={styles.siteHeader}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", color: "#fff", margin: 0 }}>{site.name}</h2>
                  <span style={{ color: "#888", fontSize: "0.85rem" }}>{site.exposure} &bull; {site.valley}</span>
                </div>
                <div style={styles.weatherNow}>
                  <span style={{ fontSize: "2rem" }}>{getWeatherIcon(currentData.weatherCode, currentData.isDay)}</span>
                  <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{Math.round(currentData.temperature)}°C</span>
                </div>
              </div>

              <div style={styles.dayRow}>
                {enrichedDaily.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedDay(i); setSelectedHour(12); }}
                    style={{
                      ...styles.dayBtn,
                      background: selectedDay === i ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.05)",
                      borderColor: selectedDay === i ? "#ff6b6b" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#fff", fontSize: "0.85rem" }}>{dateLabels[i]}</div>
                    <div style={{ fontSize: "1.5rem" }}>{getWeatherIcon(d.weatherCode, 1)}</div>
                    <div style={{ color: "#ff6b6b", fontSize: "1rem" }}>{Math.round(d.tempMax)}°/{Math.round(d.tempMin)}°</div>
                    <div style={{ fontSize: "0.7rem", color: "#888" }}>Δ{d.thermalDelta}°C</div>
                  </button>
                ))}
              </div>

              <div style={styles.hourRow}>
                <span style={{ color: "#888", fontSize: "0.85rem" }}>⏰ Ora:</span>
                <input
                  type="range"
                  min={0}
                  max={23}
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff6b6b" }}
                />
                <span style={{ fontWeight: "bold", color: "#fff", minWidth: 50 }}>
                  {String(selectedHour).padStart(2, "0")}:00
                </span>
              </div>

              {flightRating && (
                <div style={{ ...styles.ratingBox, borderColor: flightRating.color }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#aaa", fontSize: "0.9rem" }}>🎯 Condizioni di volo:</span>
                    <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: flightRating.color }}>
                      {flightRating.rating}
                    </span>
                  </div>
                  <div style={{ color: "#888", fontSize: "0.85rem", marginTop: 4 }}>{flightRating.desc}</div>
                </div>
              )}

              <div style={styles.meteoGrid}>
                {[
                  { label: "🌡️ Temperatura", value: `${Math.round(currentData.temperature)}°C`, sub: `Delta: ${thermalDelta}°C` },
                  { label: "💧 Umidità", value: `${Math.round(currentData.humidity)}%`, sub: `Rugiada: ${Math.round(currentData.dewPoint)}°C` },
                  { label: "☁️ Nuvolosità", value: `${Math.round(currentData.cloudCover)}%`, sub: `${getCloudCondition(currentData.cloudCover).icon} ${getCloudCondition(currentData.cloudCover).text}` },
                  { label: "🌧️ Precipitazioni", value: currentData.precipitation === 0 ? "Assenti" : `${currentData.precipitation} mm`, sub: currentData.precipitation === 0 ? "✅ Asciutto" : "⚠️ Pioggia" },
                  { label: "👁️ Visibilità", value: `${Math.round(currentData.visibility)} km`, sub: currentData.visibility > 20 ? "Ottima" : currentData.visibility > 10 ? "Buona" : "Limitata" },
                  { label: "☀️ UV", value: `${Math.round(currentData.uvIndex)}`, sub: currentData.uvIndex < 3 ? "Basso" : currentData.uvIndex < 6 ? "Medio" : "Alto ⚠️" },
                  { label: "🔥 Termiche", value: thermalIndex ? `${thermalIndex.icon} ${thermalIndex.level}` : "--", sub: thermalIndex ? `Δ${thermalDelta}°C` : "" },
                  { label: "💨 Vento", value: `${getWindArrow(currentData.windDir)} ${Math.round(currentData.windSpeed)} km/h`, sub: `${getWindDirection(currentData.windDir)} • Raffiche: ${Math.round(currentData.windGust)} km/h` },
                ].map((m, i) => (
                  <div key={i} style={styles.mCard}>
                    <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{m.value}</div>
                    <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              <div style={styles.section}>
                <h3 style={{ color: "#4fc3f7", marginBottom: 10, fontSize: "0.95rem" }}>💨 Vento a differenti quote</h3>
                <div style={styles.windGrid}>
                  {[
                    { label: "10 m (superficie)", speed: currentData.windSpeed, dir: currentData.windDir, gust: currentData.windGust },
                    { label: "80 m (quota termica)", speed: currentData.wind80m, dir: currentData.windDir80m },
                    { label: "120 m (alta quota)", speed: currentData.wind120m, dir: currentData.windDir120m },
                  ].map((w, i) => (
                    <div key={i} style={styles.wCard}>
                      <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 4 }}>{w.label}</div>
                      <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>
                        {w.speed != null ? `${getWindArrow(w.dir as number)} ${Math.round(w.speed)} km/h` : "N/D"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
                        {w.dir != null ? getWindDirection(w.dir) : "--"}
                      </div>
                      {i === 0 && (
                        <div style={{ fontSize: "0.65rem", color: "#ff6b6b", marginTop: 2 }}>
                          Raffiche: {Math.round(w.gust)} km/h
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={{ color: "#4fc3f7", marginBottom: 10, fontSize: "0.95rem" }}>📊 Vento orario (9:00 - 19:00)</h3>
                <div style={styles.hourlyWindGrid}>
                  {hoursRange.map((h) => {
                    const hd = dayData?.find((d) => d.time.getHours() === h);
                    if (!hd) return null;
                    return (
                      <div key={h} style={styles.hwCard}>
                        <div style={{ fontSize: "0.6rem", color: "#888" }}>{String(h).padStart(2, "0")}:00</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#fff" }}>
                          {getWindArrow(hd.windDir)} {Math.round(hd.windSpeed)}
                        </div>
                        <div style={{ fontSize: "0.55rem", color: "#666" }}>{getWindDirection(hd.windDir)}</div>
                        <div style={{ fontSize: "0.6rem", color: "#ff6b6b" }}>⚡{Math.round(hd.windGust)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.analysisGrid}>
                <div style={styles.analysisBox}>
                  <h3 style={{ fontSize: "0.8rem", color: "#888", marginBottom: 6 }}>🏔️ Plafond stimato</h3>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>
                    {Math.round((currentData.temperature - currentData.dewPoint) * 120 + 1500)} m
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666", marginTop: 2 }}>Base decollo: ~1500m</div>
                </div>
                <div style={styles.analysisBox}>
                  <h3 style={{ fontSize: "0.8rem", color: "#888", marginBottom: 6 }}>🌪️ Turbolenze</h3>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: currentData.windGust > 30 ? "#ff1744" : currentData.windGust > 20 ? "#ff9800" : "#4caf50" }}>
                    {currentData.windGust > 30 ? "ALTE ⚠️" : currentData.windGust > 20 ? "MEDIE ⚡" : "BASSE ✅"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666", marginTop: 2 }}>Raffiche: {Math.round(currentData.windGust)} km/h</div>
                </div>
                <div style={styles.analysisBox}>
                  <h3 style={{ fontSize: "0.8rem", color: "#888", marginBottom: 6 }}>✈️ Cross Country</h3>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: thermalIndex?.level === "Forte" && currentData.windSpeed > 10 && currentData.windSpeed < 25 ? "#4caf50" : thermalIndex?.level === "Media" ? "#ff9800" : "#ff1744" }}>
                    {thermalIndex?.level === "Forte" && currentData.windSpeed > 10 && currentData.windSpeed < 25
                      ? "Ottimo ⭐"
                      : thermalIndex?.level === "Media"
                        ? "Buono 👍"
                        : "Sconsigliato ❌"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666", marginTop: 2 }}>
                    {thermalIndex?.level === "Forte" && currentData.windSpeed > 10 && currentData.windSpeed < 25
                      ? "Condizioni ideali per cross"
                      : thermalIndex?.level === "Media"
                        ? "Cross possibile"
                        : "Poche termiche"}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <footer style={styles.footer}>
        <p style={{ fontSize: "0.75rem", color: "#666" }}>Dati meteo forniti da Open-Meteo.com</p>
        <p style={{ fontSize: "0.65rem", color: "#444", marginTop: 5 }}>🐰 Vola sicuro e divertiti! 🪂</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: { background: "#0a0e27", color: "#eee", minHeight: "100vh", padding: 20, fontFamily: "'Segoe UI', Arial, sans-serif" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0e27" },
  spinner: { width: 50, height: 50, border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "#ff6b6b", borderRadius: "50%", animation: "spin 1s linear infinite" },
  btn: { background: "#ff6b6b", color: "#fff", border: "none", padding: "12px 30px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "1rem", marginTop: 20 },
  header: { textAlign: "center", marginBottom: 30, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoRow: { display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 },
  title: { fontSize: "2.2rem", marginBottom: 5, background: "linear-gradient(135deg, #ff6b6b, #ffd93d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 },
  sub: { fontSize: "0.9rem", color: "#888" },
  grid: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, maxWidth: "1400px", margin: "0 auto" },
  left: { background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)", height: "calc(100vh - 200px)", overflow: "hidden" },
  list: { overflowY: "auto", height: "calc(100% - 50px)", paddingRight: 5 },
  right: { background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)", maxHeight: "calc(100vh - 200px)", overflowY: "auto" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, marginBottom: 8, cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.3s ease" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  badge: { fontSize: "0.65rem", padding: "2px 8px", borderRadius: 12, color: "#fff", fontWeight: 600 },
  siteHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.1)" },
  weatherNow: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", padding: "8px 15px", borderRadius: 30 },
  dayRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 15 },
  dayBtn: { border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 10, cursor: "pointer", textAlign: "center", transition: "all 0.3s ease" },
  hourRow: { display: "flex", alignItems: "center", gap: 15, marginBottom: 15, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 10 },
  ratingBox: { border: "2px solid", padding: 12, borderRadius: 10, marginBottom: 15, background: "rgba(0,0,0,0.3)" },
  meteoGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 15 },
  mCard: { background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" },
  section: { marginBottom: 15, padding: 15, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" },
  windGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  wCard: { textAlign: "center", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8 },
  hourlyWindGrid: { display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 4, overflowX: "auto" },
  hwCard: { textAlign: "center", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 6, minWidth: 50 },
  analysisGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 15 },
  analysisBox: { background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" },
  footer: { textAlign: "center", marginTop: 30, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);