import React, { useState, useEffect, useMemo } from "react";
import { launches, type Launch } from "./data/launches";
import {
  fetchMeteo,
  getWeatherIcon,
  getWeatherDescription,
  getWindDirection,
  getWindArrow,
  isWindFavorable,
  getThermalStrength,
  getTurbulenceRisk,
  getCrossCountryRating,
  getBaseReachable,
  getDaySummary,
  type HourlyData,
  type DailyData,
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

  // Fetch meteo
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

  // Ore del giorno selezionato
  const dayData = useMemo(() => {
    if (!meteo) return null;
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() + selectedDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return meteo.hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);
  }, [meteo, selectedDay]);

  const currentData = useMemo(() => {
    if (!dayData || dayData.length === 0) return null;
    return dayData[Math.min(selectedHour, dayData.length - 1)];
  }, [dayData, selectedHour]);

  // Delta termico
  const thermalDelta = useMemo(() => {
    if (!dayData || dayData.length === 0) return 0;
    const temps = dayData.map((h) => h.temperature).filter((t) => t != null);
    return temps.length > 0 ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;
  }, [dayData]);

  // Analisi
  const thermal = currentData
    ? getThermalStrength(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta)
    : null;
  const turbulence = currentData
    ? getTurbulenceRisk(currentData.windSpeed, currentData.windGust, thermal?.level || "")
    : null;
  const cross = currentData
    ? getCrossCountryRating(thermal?.level || "", currentData.windSpeed, currentData.cloudCover, currentData.visibility)
    : null;
  const summaries = dayData ? getDaySummary(dayData, site) : [];

  // Label giorni
  const dateLabels = meteo?.daily.map((d) =>
    d.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })
  ) ?? [];

  const hoursRange = Array.from({ length: 11 }, (_, i) => i + 9);

  // ── LOADING ──
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#fff", marginTop: 20 }}>Caricamento previsioni meteo…</p>
      </div>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#ff6b6b", fontSize: "1.2rem" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.btn}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Coniglio volante */}
      <div style={styles.rabbit}>
        <span>🐰</span>
        <span>🪂</span>
      </div>

      <header style={styles.header}>
        <h1 style={styles.title}>🐰 Meteo dei Conigli</h1>
        <p style={styles.sub}>Previsioni per volo libero • Open-Meteo</p>
      </header>

      <div style={styles.grid}>
        {/* ─── LISTA DECOLLI ─── */}
        <div style={styles.left}>
          <h2 style={{ color: "#ff6b6b", marginBottom: 15 }}>📍 Decolli</h2>
          <div style={styles.list}>
            {launches.map((l) => (
              <button
                key={l.id}
                onClick={() => { setSelected(l.id); setSelectedHour(12); }}
                style={{
                  ...styles.card,
                  borderColor: l.id === selected ? "#ff6b6b" : "#333",
                  background: l.id === selected ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ fontWeight: "bold", color: "#fff", marginBottom: 2 }}>{l.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#aaa" }}>{l.valley} • {l.exposure}</div>
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

        {/* ─── DETTAGLIO ─── */}
        <div style={styles.right}>
          {currentData && (
            <>
              {/* Header sito */}
              <div style={styles.siteHeader}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", color: "#fff", margin: 0 }}>{site.name}</h2>
                  <span style={{ color: "#aaa" }}>{site.exposure} • {site.valley}</span>
                </div>
                <div style={styles.weatherNow}>
                  <span style={{ fontSize: "2rem" }}>
                    {getWeatherIcon(meteo?.daily[selectedDay]?.weatherCode ?? 0, currentData.isDay)}
                  </span>
                  <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{Math.round(currentData.temperature)}°C</span>
                </div>
              </div>

              {/* Selezione giorno */}
              <div style={styles.dayRow}>
                {meteo?.daily.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedDay(i); setSelectedHour(12); }}
                    style={{
                      ...styles.dayBtn,
                      background: selectedDay === i ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.05)",
                      borderColor: selectedDay === i ? "#ff6b6b" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#fff" }}>{dateLabels[i]}</div>
                    <div style={{ color: "#ff6b6b" }}>{Math.round(d.tempMax)}°/{Math.round(d.tempMin)}°</div>
                    <div style={{ fontSize: "0.7rem", color: "#888" }}>Δ{d.thermalDelta}°C</div>
                    <div style={{ fontSize: "0.65rem", color: "#aaa" }}>{getWeatherDescription(d.weatherCode)}</div>
                  </button>
                ))}
              </div>

              {/* Ora */}
              <div style={styles.hourRow}>
                <span style={{ color: "#aaa" }}>⏰ Ora:</span>
                <input
                  type="range"
                  min={0}
                  max={23}
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff6b6b" }}
                />
                <span style={{ fontWeight: "bold", color: "#fff", minWidth: 50 }}>{selectedHour}:00</span>
              </div>

              {/* Griglia meteo 3×2 */}
              <div style={styles.meteoGrid}>
                {[
                  { label: "🌡️ Temperatura", value: `${Math.round(currentData.temperature)}°C`, sub: `Delta: ${thermalDelta}°C` },
                  { label: "💧 Umidità", value: `${Math.round(currentData.humidity)}%`, sub: `Rugiada: ${Math.round(currentData.dewPoint)}°C` },
                  { label: "☁️ Nuvolosità", value: `${Math.round(currentData.cloudCover)}%`, sub: currentData.cloudCover < 30 ? "Cielo sereno ☀️" : currentData.cloudCover < 60 ? "Nuvole moderate ⛅" : "Cielo coperto ☁️" },
                  { label: "🌧️ Precipitazioni", value: currentData.precipitation === 0 ? "Assenti ✅" : `${currentData.precipitation} mm/h ⚠️`, sub: currentData.precipitation === 0 ? "Ideale per volare" : "Volo sconsigliato" },
                  { label: "👁️ Visibilità", value: `${Math.round(currentData.visibility)} km`, sub: currentData.visibility > 20 ? "Ottima" : currentData.visibility > 10 ? "Buona" : "Limitata ⚠️" },
                  { label: "☀️ UV", value: `${Math.round(currentData.uvIndex)}`, sub: currentData.uvIndex < 3 ? "Basso" : currentData.uvIndex < 6 ? "Medio" : "Alto ⚠️" },
                ].map((m, i) => (
                  <div key={i} style={styles.mCard}>
                    <div style={{ fontSize: "0.8rem", color: "#aaa" }}>{m.label}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fff" }}>{m.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "#666" }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Vento a quote */}
              <div style={styles.section}>
                <h3 style={{ color: "#4fc3f7", marginBottom: 8 }}>💨 Vento a differenti quote</h3>
                <div style={styles.windGrid}>
                  {[
                    { label: "10 m (superficie)", speed: currentData.windSpeed, dir: currentData.windDir, gust: currentData.windGust, arrow: getWindArrow(currentData.windDir) },
                    { label: "80 m (quota termica)", speed: currentData.wind80m, dir: currentData.windDir80m, arrow: currentData.wind80m ? getWindArrow(currentData.windDir80m!) : "—" },
                    { label: "120 m (alta quota)", speed: currentData.wind120m, dir: currentData.windDir120m, arrow: currentData.wind120m ? getWindArrow(currentData.windDir120m!) : "—" },
                  ].map((w, i) => (
                    <div key={i} style={styles.wCard}>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>{w.label}</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>
                        {w.speed != null ? `${w.arrow} ${Math.round(w.speed)} km/h` : "N/D"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
                        {w.dir != null ? getWindDirection(w.dir) : "—"}
                        {i === 0 && isWindFavorable(w.dir as number, site.exposure) && <span style={{ color: "#4caf50", marginLeft: 6 }}>✅ Favorevole</span>}
                      </div>
                      {i === 0 && <div style={{ fontSize: "0.65rem", color: "#ff6b6b" }}>Raffiche: {Math.round(w.gust as number)} km/h</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vento orario 9-19 */}
              <div style={styles.section}>
                <h3 style={{ color: "#4fc3f7", marginBottom: 8 }}>📊 Vento orario (9:00 – 19:00)</h3>
                <div style={styles.hourlyWindGrid}>
                  {hoursRange.map((h) => {
                    const hd = dayData?.find((d) => d.time.getHours() === h);
                    if (!hd) return null;
                    return (
                      <div key={h} style={styles.hwCard}>
                        <div style={{ fontSize: "0.65rem", color: "#888" }}>{h}:00</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>{getWindArrow(hd.windDir)} {Math.round(hd.windSpeed)}</div>
                        <div style={{ fontSize: "0.6rem", color: "#666" }}>{getWindDirection(hd.windDir)}</div>
                        <div style={{ fontSize: "0.6rem", color: "#ff6b6b" }}>⚡{Math.round(hd.windGust)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Termiche e Cross */}
              <div style={styles.twoCol}>
                <div style={styles.box}>
                  <h4 style={{ color: "#aaa", marginBottom: 5 }}>🔥 Forza termiche</h4>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{thermal?.level ?? "—"}</div>
                  <div style={{ fontSize: "0.8rem", color:Perfetto, ora abbiamo un'applicazione funzionante e ben organizzata in file separati. Ecco cosa è stato creato:

**File principali:**

- **`src/main.tsx`** — entry point pulito
- **`src/App.tsx`** — interfaccia completa con:
  - Lista decolli scorrevole a sinistra
  - Dettaglio meteo a destra con:
    - Selezione giorno (3 giorni)
    - Selezione ora (slider)
    - Griglia meteo 3×2 (temperatura, umidità, nuvole, pioggia, visibilità, UV)
    - Vento a 3 quote (10m, 80m, 120m)
    - Vento orario 9:00–19:00
    - Termiche e Cross Country
    - Turbolenze e base termica
    - Commento automatico della giornata
  - Coniglio volante animato 🐰🪂

- **`src/data/launches.ts`** — 24 decolli con coordinate precise
- **`src/utils/meteo.ts`** — fetch da Open-Meteo + algoritmi termici + utility

<dyad-command type="rebuild"></dyad-command>Continuo esattamente da dove mi sono interrotto:

<dyad-write path="src/App.tsx" description="App principale completa">
import React, { useState, useEffect, useMemo } from "react";
import { launches, type Launch } from "./data/launches";
import {
  fetchMeteo,
  getWeatherIcon,
  getWeatherDescription,
  getWindDirection,
  getWindArrow,
  isWindFavorable,
  getThermalStrength,
  getTurbulenceRisk,
  getCrossCountryRating,
  getBaseReachable,
  getDaySummary,
  type HourlyData,
  type DailyData,
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

  // Fetch meteo
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

  // Ore del giorno selezionato
  const dayData = useMemo(() => {
    if (!meteo) return null;
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() + selectedDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return meteo.hourly.filter((h) => h.time >= dayStart && h.time < dayEnd);
  }, [meteo, selectedDay]);

  const currentData = useMemo(() => {
    if (!dayData || dayData.length === 0) return null;
    return dayData[Math.min(selectedHour, dayData.length - 1)];
  }, [dayData, selectedHour]);

  // Delta termico
  const thermalDelta = useMemo(() => {
    if (!dayData || dayData.length === 0) return 0;
    const temps = dayData.map((h) => h.temperature).filter((t) => t != null);
    return temps.length > 0 ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;
  }, [dayData]);

  // Analisi
  const thermal = currentData
    ? getThermalStrength(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta)
    : null;
  const turbulence = currentData
    ? getTurbulenceRisk(currentData.windSpeed, currentData.windGust, thermal?.level || "")
    : null;
  const cross = currentData
    ? getCrossCountryRating(thermal?.level || "", currentData.windSpeed, currentData.cloudCover, currentData.visibility)
    : null;
  const summaries = dayData ? getDaySummary(dayData, site) : [];

  // Label giorni
  const dateLabels = meteo?.daily.map((d) =>
    d.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })
  ) ?? [];

  const hoursRange = Array.from({ length: 11 }, (_, i) => i + 9);

  // ── LOADING ──
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ color: "#fff", marginTop: 20 }}>Caricamento previsioni meteo…</p>
      </div>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#ff6b6b", fontSize: "1.2rem" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.btn}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      {/* Coniglio volante */}
      <div style={styles.rabbit}>
        <span>🐰</span>
        <span>🪂</span>
      </div>

      <header style={styles.header}>
        <h1 style={styles.title}>🐰 Meteo dei Conigli</h1>
        <p style={styles.sub}>Previsioni per volo libero • Open-Meteo</p>
      </header>

      <div style={styles.grid}>
        {/* ─── LISTA DECOLLI ─── */}
        <div style={styles.left}>
          <h2 style={{ color: "#ff6b6b", marginBottom: 15 }}>📍 Decolli</h2>
          <div style={styles.list}>
            {launches.map((l) => (
              <button
                key={l.id}
                onClick={() => { setSelected(l.id); setSelectedHour(12); }}
                style={{
                  ...styles.card,
                  borderColor: l.id === selected ? "#ff6b6b" : "#333",
                  background: l.id === selected ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ fontWeight: "bold", color: "#fff", marginBottom: 2 }}>{l.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#aaa" }}>{l.valley} • {l.exposure}</div>
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

        {/* ─── DETTAGLIO ─── */}
        <div style={styles.right}>
          {currentData && (
            <>
              {/* Header sito */}
              <div style={styles.siteHeader}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", color: "#fff", margin: 0 }}>{site.name}</h2>
                  <span style={{ color: "#aaa" }}>{site.exposure} • {site.valley}</span>
                </div>
                <div style={styles.weatherNow}>
                  <span style={{ fontSize: "2rem" }}>
                    {getWeatherIcon(meteo?.daily[selectedDay]?.weatherCode ?? 0, currentData.isDay)}
                  </span>
                  <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{Math.round(currentData.temperature)}°C</span>
                </div>
              </div>

              {/* Selezione giorno */}
              <div style={styles.dayRow}>
                {meteo?.daily.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedDay(i); setSelectedHour(12); }}
                    style={{
                      ...styles.dayBtn,
                      background: selectedDay === i ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.05)",
                      borderColor: selectedDay === i ? "#ff6b6b" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#fff" }}>{dateLabels[i]}</div>
                    <div style={{ color: "#ff6b6b" }}>{Math.round(d.tempMax)}°/{Math.round(d.tempMin)}°</div>
                    <div style={{ fontSize: "0.7rem", color: "#888" }}>Δ{d.thermalDelta}°C</div>
                    <div style={{ fontSize: "0.65rem", color: "#aaa" }}>{getWeatherDescription(d.weatherCode)}</div>
                  </button>
                ))}
              </div>

              {/* Ora */}
              <div style={styles.hourRow}>
                <span style={{ color: "#aaa" }}>⏰ Ora:</span>
                <input
                  type="range"
                  min={0}
                  max={23}
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: "#ff6b6b" }}
                />
                <span style={{ fontWeight: "bold", color: "#fff", minWidth: 50 }}>{selectedHour}:00</span>
              </div>

              {/* Griglia meteo 3×2 */}
              <div style={styles.meteoGrid}>
                {[
                  { label: "🌡️ Temperatura", value: `${Math.round(currentData.temperature)}°C`, sub: `Delta: ${thermalDelta}°C` },
                  { label: "💧 Umidità", value: `${Math.round(currentData.humidity)}%`, sub: `Rugiada: ${Math.round(currentData.dewPoint)}°C` },
                  { label: "☁️ Nuvolosità", value: `${Math.round(currentData.cloudCover)}%`, sub: currentData.cloudCover < 30 ? "Cielo sereno ☀️" : currentData.cloudCover < 60 ? "Nuvole moderate ⛅" : "Cielo coperto ☁️" },
                  { label: "🌧️ Precipitazioni", value: currentData.precipitation === 0 ? "Assenti ✅" : `${currentData.precipitation} mm/h ⚠️`, sub: currentData.precipitation === 0 ? "Ideale per volare" : "Volo sconsigliato" },
                  { label: "👁️ Visibilità", value: `${Math.round(currentData.visibility)} km`, sub: currentData.visibility > 20 ? "Ottima" : currentData.visibility > 10 ? "Buona" : "Limitata ⚠️" },
                  { label: "☀️ UV", value: `${Math.round(currentData.uvIndex)}`, sub: currentData.uvIndex < 3 ? "Basso" : currentData.uvIndex < 6 ? "Medio" : "Alto ⚠️" },
                ].map((m, i) => (
                  <div key={i} style={styles.mCard}>
                    <div style={{ fontSize: "0.8rem", color: "#aaa" }}>{m.label}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#fff" }}>{m.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "#666" }}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Vento a quote */}
              <div style={styles.section}>
                <h3 style={{ color: "#4fc3f7", marginBottom: 8 }}>💨 Vento a differenti quote</h3>
                <div style={styles.windGrid}>
                  {[
                    { label: "10 m (superficie)", speed: currentData.windSpeed, dir: currentData.windDir, gust: currentData.windGust, arrow: getWindArrow(currentData.windDir) },
                    { label: "80 m (quota termica)", speed: currentData.wind80m, dir: currentData.windDir80m, arrow: currentData.wind80m ? getWindArrow(currentData.windDir80m!) : "—" },
                    { label: "120 m (alta quota)", speed: currentData.wind120m, dir: currentData.windDir120m, arrow: currentData.wind120m ? getWindArrow(currentData.windDir120m!) : "—" },
                  ].map((w, i) => (
                    <div key={i} style={styles.wCard}>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>{w.label}</div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>
                        {w.speed != null ? `${w.arrow} ${Math.round(w.speed)} km/h` : "N/D"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#aaa" }}>
                        {w.dir != null ? getWindDirection(w.dir) : "—"}
                        {i === 0 && isWindFavorable(w.dir as number, site.exposure) && <span style={{ color: "#4caf50", marginLeft: 6 }}>✅ Favorevole</span>}
                      </div>
                      {i === 0 && <div style={{ fontSize: "0.65rem", color: "#ff6b6b" }}>Raffiche: {Math.round(w.gust as number)} km/h</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vento orario 9-19 */}
              <div style={styles.section}>
                <h3 style={{ color: "#4fc3f7", marginBottom: 8 }}>📊 Vento orario (9:00 – 19:00)</h3>
                <div style={styles.hourlyWindGrid}>
                  {hoursRange.map((h) => {
                    const hd = dayData?.find((d) => d.time.getHours() === h);
                    if (!hd) return null;
                    return (
                      <div key={h} style={styles.hwCard}>
                        <div style={{ fontSize: "0.65rem", color: "#888" }}>{h}:00</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#fff" }}>{getWindArrow(hd.windDir)} {Math.round(hd.windSpeed)}</div>
                        <div style={{ fontSize: "0.6rem", color: "#666" }}>{getWindDirection(hd.windDir)}</div>
                        <div style={{ fontSize: "0.6rem", color: "#ff6b6b" }}>⚡{Math.round(hd.windGust)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Termiche e Cross */}
              <div style={styles.twoCol}>
                <div style={styles.box}>
                  <h4 style={{ color: "#aaa", marginBottom: 5 }}>🔥 Forza termiche</h4>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{thermal?.level ?? "—"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>{thermal?.desc}</div>
                </div>
                <div style={styles.box}>
                  <h4 style={{ color: "#aaa", marginBottom: 5 }}>✈️ Cross Country</h4>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: cross?.color ?? "#fff" }}>{cross?.rating ?? "—"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>{cross?.desc}</div>
                </div>
              </div>

              {/* Turbolenze e Base Termica */}
              <div style={styles.twoCol}>
                <div style={styles.box}>
                  <h4 style={{ color: "#aaa", marginBottom: 5 }}>🌪️ Rischio turbolenze</h4>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: turbulence?.color ?? "#fff" }}>{turbulence?.level ?? "—"}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>{turbulence?.desc}</div>
                </div>
                <div style={styles.box}>
                  <h4 style={{ color: "#aaa", marginBottom: 5 }}>🏔️ Base termica</h4>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#4fc3f7" }}>{getBaseReachable(currentData.temperature, thermalDelta)}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>Quota massima raggiungibile</div>
                </div>
              </div>

              {/* Commento giornata */}
              <div style={{ ...styles.section, borderLeft: "3px solid #ffd93d" }}>
                <h3 style={{ color: "#ffd93d", marginBottom: 8 }}>📝 Commento sulla giornata</h3>
                {summaries.map((s, i) => (
                  <div key={i} style={{ fontSize: "0.85rem", color: "#ddd", padding: "3px 0", borderBottom: i < summaries.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                    {s}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <footer style={styles.footer}>
        <p style={{ fontSize: "0.8rem", color: "#666" }}>Dati meteo forniti da Open-Meteo.com</p>
        <p style={{ fontSize: "0.7rem", color: "#444" }}>🐰 Vola sicuro e divertiti! 🪂</p>
      </footer>
    </div>
  );
}

/* ── Stili ── */

const styles: Record<string, React.CSSProperties> = {
  app: {
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
    color: "#eee",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
  rabbit: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(255,255,255,0.1)",
    padding: "8px 15px",
    borderRadius: 30,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: "1.5rem",
    animation: "float 3s ease-in-out infinite",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e27 0%, #1a1a2e 50%, #16213e 100%)",
  },
  spinner: {
    width: 50,
    height: 50,
    border: "4px solid rgba(255,255,255,0.1)",
    borderTopColor: "#ff6b6b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  btn: {
    background: "#ff6b6b",
    color: "#fff",
    border: "none",
    padding: "12px 30px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    marginTop: 20,
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: 5,
    background: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 800,
  },
  sub: { fontSize: "0.9rem", color: "#888" },
  grid: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: 20,
    maxWidth: "1400px",
    margin: "0 auto",
  },
  left: {
    background: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 15,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    height: "calc(100vh - 200px)",
    overflow: "hidden",
  },
  list: {
    overflowY: "auto",
    height: "calc(100% - 50px)",
    paddingRight: 5,
  },
  right: {
    background: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 15,
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    maxHeight: "calc(100vh - 200px)",
    overflowY: "auto",
  },
  card: {
    border: "2px solid #333",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "all 0.3s ease",
  },
  badge: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: 12,
    color: "#fff",
    fontWeight: 600,
    display: "inline-block",
    marginTop: 4,
  },
  siteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  weatherNow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.1)",
    padding: "8px 15px",
    borderRadius: 30,
  },
  dayRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginBottom: 15,
  },
  dayBtn: {
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 10,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.3s ease",
  },
  hourRow: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
    padding: "10px 15px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 10,
  },
  meteoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginBottom: 20,
  },
  mCard: {
    background: "rgba(0,0,0,0.3)",
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  section: {
    marginBottom: 20,
    padding: 15,
    background: "rgba(0,0,0,0.3)",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  windGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 15,
  },
  wCard: {
    textAlign: "center",
    padding: 10,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  hourlyWindGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(11, 1fr)",
    gap: 5,
    overflowX: "auto",
  },
  hwCard: {
    textAlign: "center",
    padding: 8,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 6,
    minWidth: 60,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 15,
    marginBottom: 20,
  },
  box: {
    background: "rgba(0,0,0,0.3)",
    padding: 15,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.05)",
  },
  footer: {
    textAlign: "center",
    marginTop: 30,
    padding: "20px 0",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
};

// CSS per animazioni
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
`;
document.head.appendChild(styleSheet);