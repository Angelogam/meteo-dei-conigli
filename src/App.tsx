"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  DECOLLI,
  fetchMeteoCompleta,
  getWeatherDescription,
  getWindDirection,
  getThermalStrength,
  getCrossCountryRating,
  getFlightAdvice,
  FullMeteoData,
  DailySummary,
  LaunchSite,
} from "@/utils/weatherForecast";
import { WeatherIcon, getWeatherIconType } from "@/components/WeatherIcon";

export default function App() {
  const [selected, setSelected] = useState(DECOLLI[0].id);
  const [meteoData, setMeteoData] = useState<FullMeteoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(12);

  const site = DECOLLI.find((x) => x.id === selected) as LaunchSite;

  useEffect(() => {
    if (!site) return;
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
  }, [selected]);

  const enrichedDailyData: DailySummary[] = useMemo(() => {
    if (!meteoData) return [];
    return meteoData.daily;
  }, [meteoData]);

  const dateLabels = enrichedDailyData.map((d) =>
    d.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })
  );

  const dayData = useMemo(() => {
    if (!meteoData) return null;
    const today = new Date();
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() + selectedDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return meteoData.hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);
  }, [meteoData, selectedDay]);

  const currentData = useMemo(() => {
    if (!dayData || dayData.length === 0) return null;
    return dayData[Math.min(selectedHour, dayData.length - 1)];
  }, [dayData, selectedHour]);

  const thermalDelta = useMemo(() => {
    if (!dayData || dayData.length === 0) return 0;
    const temps = dayData.map((h) => h.temperature).filter((t) => t !== undefined && t !== null);
    if (temps.length === 0) return 0;
    return Math.round(Math.max(...temps) - Math.min(...temps));
  }, [dayData]);

  if (loading) {
    return (
      <div style={styles.loadingFull}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Caricamento previsioni meteo…</p>
        <p style={styles.loadingSub}>Open-Meteo &bull; Free Flight Forecast</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorFull}>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryButton} onClick={() => window.location.reload()}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <WeatherIcon type="wind" size={32} color="#ff6b6b" />
          {" "}Meteo dei Conigli
        </h1>
        <p style={styles.subtitle}>Previsioni per volo libero &bull; Dati da Open-Meteo</p>
      </header>

      <div style={styles.grid}>
        {/* LISTA DECOLLI */}
        <div style={styles.left}>
          <h2 style={styles.sectionTitle}>
            <WeatherIcon type="mountain" size={18} color="#4fc3f7" />
            {" "}Decolli
          </h2>
          <div style={styles.cardList}>
            {DECOLLI.map((d) => (
              <button
                key={d.id}
                onClick={() => { setSelected(d.id); setSelectedDay(0); setSelectedHour(12); }}
                style={{
                  ...styles.card,
                  borderColor: d.id === selected ? "#ff6b6b" : "#333",
                  background: d.id === selected ? "rgba(255,107,107,0.08)" : "#222",
                }}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardTitle}>{d.name}</span>
                  <span style={{
                    ...styles.difficultyBadge,
                    backgroundColor: d.difficulty <= 2 ? "#1b5e20" : d.difficulty <= 3 ? "#e65100" : "#b71c1c",
                    color: d.difficulty <= 2 ? "#81c784" : d.difficulty <= 3 ? "#ffcc80" : "#ef9a9a",
                  }}>
                    {d.difficulty <= 2 ? "Facile" : d.difficulty <= 3 ? "Medio" : "Diff."}
                  </span>
                </div>
                <div style={styles.cardDetails}>
                  <span>{d.valley}</span>
                  <span>{d.elevation ? `${d.elevation}m` : "—"} &bull; {d.exposure}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* DETTAGLIO */}
        <div style={styles.right}>
          {currentData && site && (
            <>
              {/* HEADER SITO */}
              <div style={styles.siteHeader}>
                <div>
                  <h2 style={styles.siteName}>
                    <WeatherIcon type="mountain" size={22} color="#81d4fa" />
                    {" "}{site.name}
                  </h2>
                  <span style={styles.siteInfo}>
                    {site.elevation ? `${site.elevation}m` : "Alt. da verificare"} &bull; {site.exposure} &bull; {site.valley}
                  </span>
                </div>
                <div style={styles.weatherNow}>
                  <WeatherIcon
                    type={getWeatherIconType(currentData.cloudCover, currentData.precipitation, currentData.isDay)}
                    size={40}
                    color="#ffd93d"
                  />
                  <span style={styles.tempNow}>{Math.round(currentData.temperature)}&deg;C</span>
                </div>
              </div>

              {/* SELEZIONE GIORNO */}
              <div style={styles.daySelector}>
                {enrichedDailyData.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedDay(index); setSelectedHour(12); }}
                    style={{
                      ...styles.dayButton,
                      background: selectedDay === index ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.04)",
                      borderColor: selectedDay === index ? "#ff6b6b" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={styles.dayName}>{dateLabels[index]}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", margin: "4px 0" }}>
                      <WeatherIcon type={getWeatherIconType(50, 0, 1)} size={18} color="#aaa" />
                    </div>
                    <div style={styles.dayTemp}>
                      {Math.round(day.tempMax)}&deg;/{Math.round(day.tempMin)}&deg;
                    </div>
                    <div style={styles.dayDelta}>&Delta;{day.thermalDelta}&deg;C</div>
                    <div style={styles.dayWeather}>{getWeatherDescription(day.weatherCode)}</div>
                  </button>
                ))}
              </div>

              {/* SELEZIONE ORA */}
              <div style={styles.hourSelector}>
                <label style={styles.hourLabel}>
                  <WeatherIcon type="clock" size={14} color="#888" />
                  {" "}Ora:
                </label>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  style={styles.hourSlider}
                />
                <span style={styles.hourValue}>{String(selectedHour).padStart(2, "0")}:00</span>
              </div>

              {/* METEO CARDS */}
              <div style={styles.meteoGrid}>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>
                    <WeatherIcon type="thermometer" size={16} color="#ff6b6b" /> Temperatura
                  </div>
                  <div style={styles.meteoValue}>{Math.round(currentData.temperature)}&deg;C</div>
                  <div style={styles.meteoSub}>Delta termico: {thermalDelta}&deg;C</div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>
                    <WeatherIcon type="wind" size={16} color="#81d4fa" /> Vento
                  </div>
                  <div style={styles.meteoValue}>{Math.round(currentData.windSpeed)} km/h</div>
                  <div style={styles.meteoSub}>
                    {getWindDirection(currentData.windDir)} &bull; Raffiche: {Math.round(currentData.windGust)} km/h
                  </div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>
                    <WeatherIcon type="cloud" size={16} color="#b0bec5" /> Nuvolosità
                  </div>
                  <div style={styles.meteoValue}>{Math.round(currentData.cloudCover)}%</div>
                  <div style={styles.meteoSub}>
                    {currentData.cloudCover < 30 ? "Cielo sereno" : currentData.cloudCover < 60 ? "Nuvole moderate" : "Cielo coperto"}
                  </div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>
                    <WeatherIcon type="droplet" size={16} color="#4fc3f7" /> Umidità
                  </div>
                  <div style={styles.meteoValue}>{Math.round(currentData.humidity)}%</div>
                  <div style={styles.meteoSub}>Punto di rugiada: {Math.round(currentData.dewPoint)}&deg;C</div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>
                    <WeatherIcon type="rain" size={16} color="#4da3ff" /> Precipitazioni
                  </div>
                  <div style={styles.meteoValue}>
                    {currentData.precipitation === 0 ? "Assenti" : `${currentData.precipitation.toFixed(1)} mm/h`}
                  </div>
                  <div style={styles.meteoSub}>
                    {currentData.precipitation === 0 ? "Ideale per volare" : "Possibili piogge"}
                  </div>
                </div>
                <div style={styles.meteoCard}>
                  <div style={styles.meteoLabel}>
                    <WeatherIcon type="eye" size={16} color="#aed581" /> Visibilità
                  </div>
                  <div style={styles.meteoValue}>{Math.round(currentData.visibility)} km</div>
                  <div style={styles.meteoSub}>
                    {currentData.visibility > 20 ? "Ottima" : currentData.visibility > 10 ? "Buona" : "Limitata"}
                  </div>
                </div>
              </div>

              {/* TERMICHE E CROSS */}
              <div style={styles.thermalBox}>
                <div style={styles.thermalLeft}>
                  <h3 style={styles.thermalTitle}>
                    <WeatherIcon type="flame" size={18} color="#ff6b6b" /> Forza delle termiche
                  </h3>
                  <div style={styles.thermalValue}>
                    {getThermalStrength(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta).label}
                  </div>
                  <div style={styles.thermalDetail}>Delta termico: {thermalDelta}&deg;C</div>
                </div>
                <div style={styles.thermalRight}>
                  <h3 style={styles.thermalTitle}>
                    <WeatherIcon type="plane" size={18} color="#81d4fa" /> Cross Country
                  </h3>
                  <div style={styles.crossValue}>
                    {getCrossCountryRating(
                      getThermalStrength(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta).value,
                      currentData.windSpeed,
                      currentData.cloudCover,
                      currentData.visibility
                    ).label}
                  </div>
                </div>
              </div>

              {/* CONSIGLI */}
              <div style={styles.adviceBox}>
                <h3 style={styles.adviceTitle}>
                  <WeatherIcon type="star" size={18} color="#ffd93d" /> Consigli per il volo
                </h3>
                {(() => {
                  const advice = getFlightAdvice(
                    { windSpeed: currentData.windSpeed, temperature: currentData.temperature, cloudCover: currentData.cloudCover, humidity: currentData.humidity, precipitation: currentData.precipitation, visibility: currentData.visibility, windDir: currentData.windDir },
                    thermalDelta,
                    site
                  );
                  const entries: { icon: WeatherIconProps["type"]; label: string; value: string; color: string }[] = [
                    { icon: "wind", label: "Vento", value: advice.wind, color: "#81d4fa" },
                    { icon: "flame", label: "Termiche", value: advice.thermal, color: "#ff6b6b" },
                    { icon: "cloud", label: "Nuvole", value: advice.clouds, color: "#b0bec5" },
                    { icon: "rain", label: "Pioggia", value: advice.precipitation, color: "#4da3ff" },
                    { icon: "eye", label: "Visibilità", value: advice.visibility, color: "#aed581" },
                    { icon: "wind", label: "Direzione vento", value: advice.windDir, color: "#4fc3f7" },
                    { icon: "plane", label: "Cross Country", value: advice.crossCountry, color: "#81d4fa" },
                    { icon: "mountain", label: "Sito", value: advice.siteDifficulty, color: "#ce93d8" },
                  ];
                  return (
                    <div style={styles.adviceList}>
                      {entries.map((e, i) => (
                        <div key={i} style={styles.adviceItem}>
                          <WeatherIcon type={e.icon} size={14} color={e.color} />
                          <span style={styles.adviceLabel}>{e.label}:</span>
                          <span style={styles.adviceValue}>{e.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* PLAFOND */}
              <div style={styles.plafondBox}>
                <h3 style={styles.plafondTitle}>
                  <WeatherIcon type="thermometer" size={18} color="#ffd93d" /> Plafond stimato
                </h3>
                <div style={styles.plafondContent}>
                  <div style={styles.plafondValue}>
                    {site.elevation ? `${Math.round(site.elevation + thermalDelta * 100)} m` : "—"}
                  </div>
                  <div style={styles.plafondLabel}>Quota massima raggiungibile</div>
                  <div style={styles.plafondSub}>
                    {site.elevation
                      ? `Base decollo: ${site.elevation}m &bull; Delta: ${thermalDelta}&deg;C`
                      : "Altitudine non disponibile"}
                  </div>
                  {site.elevation && (
                    <div style={styles.plafondBar}>
                      <div
                        style={{
                          ...styles.plafondFill,
                          width: `${Math.min(100, ((site.elevation + thermalDelta * 100) / 4000) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Dati meteo forniti da Open-Meteo.com &bull; Previsioni per volo libero
        </p>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #ff6b6b; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); }
        input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #ff6b6b; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

/* ============================
   STILI COMPLETI – Dark Premium
   ============================ */

const styles: Record<string, React.CSSProperties> = {
  app: {
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
    color: "#eee",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
  loadingFull: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
    color: "#eee",
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid rgba(255,255,255,0.1)",
    borderTopColor: "#ff6b6b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: { marginTop: 20, fontSize: "1.2rem", color: "#fff" },
  loadingSub: { marginTop: 10, fontSize: "0.9rem", color: "#888" },
  errorFull: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
    color: "#eee",
  },
  errorText: { color: "#ff6b6b", fontSize: "1.2rem", marginBottom: 20 },
  retryButton: {
    background: "#ff6b6b",
    color: "#fff",
    border: "none",
    padding: "12px 30px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: "2.2rem",
    marginBottom: 5,
    background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  subtitle: { fontSize: "0.9rem", color: "#888", marginTop: 4 },
  grid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 20,
    maxWidth: "1400px",
    margin: "0 auto",
  },
  left: {
    background: "rgba(255,255,255,0.04)",
    padding: 15,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.08)",
    height: "calc(100vh - 220px)",
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: "1rem",
    marginBottom: 15,
    color: "#4fc3f7",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardList: {
    overflowY: "auto",
    height: "calc(100% - 50px)",
    paddingRight: 5,
  },
  card: {
    display: "block",
    width: "100%",
    borderRadius: 12,
    border: "1px solid #333",
    padding: "10px 12px",
    marginBottom: 8,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: "0.9rem", fontWeight: 600, color: "#fff" },
  difficultyBadge: {
    fontSize: "0.65rem",
    fontWeight: 600,
    padding: "1px 8px",
    borderRadius: 10,
  },
  cardDetails: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.7rem",
    color: "#888",
  },
  right: {
    background: "rgba(255,255,255,0.04)",
    padding: 20,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.08)",
    overflowY: "auto",
    maxHeight: "calc(100vh - 220px)",
  },
  siteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  siteName: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  siteInfo: { fontSize: "0.8rem", color: "#888", marginTop: 4, display: "block" },
  weatherNow: { display: "flex", alignItems: "center", gap: 10 },
  tempNow: { fontSize: "2rem", fontWeight: 700, color: "#fff" },
  daySelector: { display: "flex", gap: 8, marginBottom: 20 },
  dayButton: {
    flex: 1,
    padding: "10px 6px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  dayName: { fontSize: "0.75rem", fontWeight: 600, color: "#ccc", textTransform: "capitalize" },
  dayTemp: { fontSize: "0.8rem", color: "#aaa", marginTop: 2 },
  dayDelta: { fontSize: "0.7rem", color: "#ffd93d", fontWeight: 600 },
  dayWeather: { fontSize: "0.65rem", color: "#888", marginTop: 2 },
  hourSelector: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    padding: "8px 14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  hourLabel: { fontSize: "0.8rem", color: "#888", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
  hourSlider: { flex: 1, cursor: "pointer" },
  hourValue: { fontSize: "0.9rem", fontWeight: 600, color: "#fff", minWidth: 40, textAlign: "right", fontFamily: "monospace" },
  meteoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: 10,
    marginBottom: 20,
  },
  meteoCard: {
    background: "rgba(0,0,0,0.25)",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  meteoLabel: {
    fontSize: "0.75rem",
    color: "#aaa",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  meteoValue: { fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: 2 },
  meteoSub: { fontSize: "0.7rem", color: "#888" },
  thermalBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    marginBottom: 20,
  },
  thermalLeft: {
    background: "rgba(255,107,107,0.06)",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(255,107,107,0.15)",
  },
  thermalRight: {
    background: "rgba(129,212,250,0.06)",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(129,212,250,0.15)",
  },
  thermalTitle: {
    fontSize: "0.85rem",
    color: "#ccc",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  thermalValue: { fontSize: "0.95rem", fontWeight: 600, color: "#ff8a80" },
  crossValue: { fontSize: "0.95rem", fontWeight: 600, color: "#81d4fa" },
  thermalDetail: { fontSize: "0.7rem", color: "#888", marginTop: 4 },
  adviceBox: {
    background: "rgba(255,217,61,0.04)",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(255,217,61,0.12)",
    marginBottom: 20,
  },
  adviceTitle: {
    fontSize: "0.9rem",
    color: "#ffd93d",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  adviceList: { display: "flex", flexDirection: "column", gap: 6 },
  adviceItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.8rem",
    padding: "4px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  adviceLabel: { fontWeight: 600, color: "#ccc", whiteSpace: "nowrap" },
  adviceValue: { color: "#ddd", flex: 1 },
  plafondBox: {
    background: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 20,
  },
  plafondTitle: {
    fontSize: "0.9rem",
    color: "#ffd93d",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  plafondContent: { textAlign: "center" },
  plafondValue: { fontSize: "1.8rem", fontWeight: 700, color: "#fff", marginBottom: 4 },
  plafondLabel: { fontSize: "0.8rem", color: "#aaa", marginBottom: 4 },
  plafondSub: { fontSize: "0.7rem", color: "#666", marginBottom: 12 },
  plafondBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  plafondFill: {
    height: "100%",
    borderRadius: 3,
    background: "linear-gradient(90deg, #ff6b6b, #ffd93d)",
    transition: "width 1s ease",
  },
  footer: {
    textAlign: "center",
    padding: "20px 0",
    marginTop: 30,
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerText: { fontSize: "0.75rem", color: "#555" },
};