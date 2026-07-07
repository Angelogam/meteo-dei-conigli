"use client";

import React, { useEffect, useState, useMemo } from "react";
import { launchSites, LaunchSite } from "@/data/launchSites";

// ─────────────────────────────────────────────────── TIPI
type DayLabel = "Oggi" | "Domani" | "Dopodomani";

interface Forecast {
  siteId: string;
  dayLabel: DayLabel;
  temp: number;
  humidity: number;
  windSurface: number;
  windGust: number;
  cloudCover: number;
  pressure: number;
  wind1500: number;
  windDir1500: number;
  wind2500: number;
  windDir2500: number;
  wind3500: number;
  windDir3500: number;
  thermalStrength: number;
  thermalForce: number;
  turbulence: number;
  qualityScore: number;
}

// ─────────────────────────────────────────────────── UTILITIES
function getDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function windDegToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

function scoreLabel(s: number): string {
  if (s <= 1) return "Pessima";
  if (s <= 2) return "Difficile";
  if (s <= 3) return "Discreta";
  if (s <= 4) return "Buona";
  return "Perfetta";
}

function scoreColor(s: number): string {
  if (s <= 2) return "#FF4E4E";
  if (s === 3) return "#FFC857";
  if (s === 4) return "#4DA3FF";
  return "#00FF8C";
}

function calcQuality(temp: number, windSfc: number, wind1500: number, wind2500: number, cloud: number, thermal: number): number {
  let s = 3;
  if (thermal >= 2.5 && wind1500 < 25 && cloud < 50) s += 1;
  if (cloud > 70) s -= 1;
  if (windSfc > 20) s -= 1;
  if (wind2500 > 30) s -= 1;
  return Math.max(1, Math.min(5, s));
}

function calcThermalStrength(temp: number, temp1500: number, humidity: number, cloud: number, wind1500: number): number {
  const lapseRate = (temp - temp1500) / 15 || 0;
  const stability = Math.max(0, lapseRate - 0.6) / 0.6;
  const humidityFactor = Math.max(0, (100 - humidity) / 100);
  let cloudFactor = 0.8;
  if (cloud < 30) cloudFactor = 0.85;
  else if (cloud < 60) cloudFactor = 1.0;
  else if (cloud < 80) cloudFactor = 0.7;
  else cloudFactor = 0.3;
  const windFactor = Math.max(0, 1 - wind1500 / 40);
  const raw = stability * 2.5 + humidityFactor * 1.5 + cloudFactor * 1.5 + windFactor * 1.0;
  return Math.min(6, Math.max(0, raw));
}

function calcTurbulence(wind1500: number, thermal: number): number {
  const raw = (wind1500 / 30) * 2.5 + (thermal / 6) * 1.5;
  return Math.min(5, Math.max(1, Math.round(raw)));
}

const DAYS_OFFSET: Record<DayLabel, number> = { Oggi: 0, Domani: 1, Dopodomani: 2 };
const DAYS: DayLabel[] = ["Oggi", "Domani", "Dopodomani"];

// ─────────────────────────────────────────────────── COMPONENTE PRINCIPALE
export default function MeteoDeiConigliPage() {
  const [selectedSiteId, setSelectedSiteId] = useState(launchSites[0].id);
  const [selectedDay, setSelectedDay] = useState<DayLabel>("Oggi");
  const [allForecasts, setAllForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  const dayOffset = DAYS_OFFSET[selectedDay];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchAll() {
      const today = getDate(0);
      const day2 = getDate(1);
      const day3 = getDate(2);

      const results: Forecast[] = [];

      for (const site of launchSites) {
        if (cancelled) break;
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,cloud_cover,pressure_msl,wind_speed_850hPa,wind_direction_850hPa,temperature_850hPa,wind_speed_700hPa,wind_direction_700hPa,wind_speed_500hPa,wind_direction_500hPa&timezone=auto&start_date=${today}&end_date=${day3}`;
          const res = await fetch(url);
          if (!res.ok) continue;
          const raw = await res.json();

          for (let d = 0; d < 3; d++) {
            const dateStr = d === 0 ? today : d === 1 ? day2 : day3;
            const dayLabel = DAYS[d];
            // Prendi la fascia 12:00–14:00 (picco termico)
            const indices: number[] = [];
            raw.hourly.time.forEach((t: string, i: number) => {
              if (t.startsWith(dateStr)) {
                const h = parseInt(t.slice(11, 13));
                if (h >= 12 && h <= 14) indices.push(i);
              }
            });
            if (!indices.length) continue;

            const idx = indices[Math.floor(indices.length / 2)];

            const temp = raw.hourly.temperature_2m[idx];
            const humidity = raw.hourly.relative_humidity_2m[idx];
            const windSfc = raw.hourly.wind_speed_10m[idx];
            const windGust = raw.hourly.wind_gusts_10m?.[idx] ?? windSfc * 1.4;
            const cloud = raw.hourly.cloud_cover[idx];
            const pressure = raw.hourly.pressure_msl[idx];

            const temp1500 = raw.hourly.temperature_850hPa?.[idx] ?? temp - 8;
            const wind1500 = raw.hourly.wind_speed_850hPa?.[idx] ?? windSfc;
            const windDir1500 = raw.hourly.wind_direction_850hPa?.[idx] ?? 0;
            const wind2500 = raw.hourly.wind_speed_700hPa?.[idx] ?? wind1500;
            const windDir2500 = raw.hourly.wind_direction_700hPa?.[idx] ?? 0;
            const wind3500 = raw.hourly.wind_speed_500hPa?.[idx] ?? wind2500;
            const windDir3500 = raw.hourly.wind_direction_500hPa?.[idx] ?? 0;

            const thermalStrength = calcThermalStrength(temp, temp1500, humidity, cloud, wind1500);
            const thermalForce = Math.round(thermalStrength * 0.8 + 0.5);
            const turbulence = calcTurbulence(wind1500, thermalStrength);
            const qualityScore = calcQuality(temp, windSfc, wind1500, wind2500, cloud, thermalStrength);

            results.push({
              siteId: site.id,
              dayLabel: dayLabel as DayLabel,
              temp: Math.round(temp * 10) / 10,
              humidity: Math.round(humidity),
              windSurface: Math.round(windSfc * 10) / 10,
              windGust: Math.round(windGust * 10) / 10,
              cloudCover: Math.round(cloud),
              pressure: Math.round(pressure),
              wind1500: Math.round(wind1500 * 10) / 10,
              windDir1500: Math.round(windDir1500),
              wind2500: Math.round(wind2500 * 10) / 10,
              windDir2500: Math.round(windDir2500),
              wind3500: Math.round(wind3500 * 10) / 10,
              windDir3500: Math.round(windDir3500),
              thermalStrength: Math.round(thermalStrength * 10) / 10,
              thermalForce,
              turbulence,
              qualityScore,
            });
          }
        } catch {
          continue;
        }
      }

      if (!cancelled) {
        setAllForecasts(results);
        setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const sitesWithScore = useMemo(() => {
    return launchSites.map((site) => {
      const f = allForecasts.find((ff) => ff.siteId === site.id && ff.dayLabel === selectedDay);
      return { site, forecast: f };
    }).sort((a, b) => {
      const sa = a.forecast?.qualityScore ?? 0;
      const sb = b.forecast?.qualityScore ?? 0;
      return sb - sa;
    });
  }, [allForecasts, selectedDay]);

  const selectedSite = launchSites.find((s) => s.id === selectedSiteId)!;
  const selectedForecast = allForecasts.find((f) => f.siteId === selectedSiteId && f.dayLabel === selectedDay);

  return (
    <div style={styles.appRoot}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Meteo dei Conigli</h1>
          <p style={styles.subtitle}>
            {loading
              ? "Caricamento dati meteo in tempo reale da Open-Meteo…"
              : `Previsioni meteo per volo libero · ${launchSites.length} decolli · Dati reali`}
          </p>
        </div>
        <div style={styles.daySelector}>
          {DAYS.map((day) => (
            <button
              key={day}
              style={{
                ...styles.dayPill,
                ...(day === selectedDay ? styles.dayPillActive : {}),
              }}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </header>

      <main style={styles.main}>
        {/* LISTA DECOLLI */}
        <section style={styles.leftPanel}>
          <h2 style={styles.panelTitle}>Decolli {selectedDay}</h2>
          <p style={styles.panelHint}>
            {loading
              ? "Sto caricando i dati da Open-Meteo…"
              : "Clicca su un decollo per vedere tutti i dettagli."}
          </p>
          <div style={styles.sitesGrid}>
            {sitesWithScore.map(({ site, forecast }) => {
              const score = forecast?.qualityScore ?? 3;
              const color = scoreColor(score);
              return (
                <button
                  key={site.id}
                  style={{
                    ...styles.siteCard,
                    ...(site.id === selectedSiteId ? styles.siteCardSelected : {}),
                  }}
                  onClick={() => setSelectedSiteId(site.id)}
                >
                  <div style={styles.siteHeader}>
                    <span style={styles.siteName}>{site.name}</span>
                    {site.valley && <span style={styles.siteValley}>{site.valley}</span>}
                  </div>
                  <div style={{ ...styles.siteScore, borderColor: color }}>
                    <span style={styles.scoreNumber}>{score}</span>
                    <span style={styles.scoreLabel}>{scoreLabel(score)}</span>
                  </div>
                  <div style={styles.siteMeta}>
                    Quota {site.elevation} m · {site.exposure}
                    {forecast && (
                      <>
                        <br />
                        Vento {forecast.windSurface.toFixed(0)} km/h · Termiche {forecast.thermalStrength.toFixed(1)} m/s
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* DETTAGLIO DECOLLO */}
        <section style={styles.rightPanel}>
          <h2 style={styles.panelTitle}>Dettaglio decollo</h2>
          {loading && !selectedForecast && (
            <p style={styles.panelHint}>Caricamento dati meteo in corso…</p>
          )}
          {!loading && !selectedForecast && (
            <p style={styles.panelHint}>Seleziona un decollo per vedere i dettagli meteo.</p>
          )}
          {selectedForecast && (
            <div style={styles.detailCard}>
              {/* HEADER */}
              <div style={styles.detailHeader}>
                <div>
                  <h3 style={styles.detailTitle}>{selectedSite.name}</h3>
                  {selectedSite.valley && <p style={styles.detailValley}>{selectedSite.valley}</p>}
                  <p style={styles.detailText}>
                    Quota <strong>{selectedSite.elevation} m</strong> · Versante{" "}
                    <strong>{selectedSite.exposure}</strong> · Coordinate{" "}
                    <strong>{selectedSite.lat.toFixed(3)}N {selectedSite.lon.toFixed(3)}E</strong>
                  </p>
                </div>
                <div style={{ ...styles.detailScore, borderColor: scoreColor(selectedForecast.qualityScore) }}>
                  <span style={styles.scoreNumberBig}>{selectedForecast.qualityScore}</span>
                  <span style={styles.scoreLabel}>{scoreLabel(selectedForecast.qualityScore)}</span>
                </div>
              </div>

              {/* METEO BASE */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionTitle}>Condizioni al suolo</h4>
                <p style={styles.sectionText}>
                  Temperatura <strong>{selectedForecast.temp} °C</strong>, umidità{" "}
                  <strong>{selectedForecast.humidity}%</strong>, pressione{" "}
                  <strong>{selectedForecast.pressure} hPa</strong>.
                </p>
                <p style={styles.sectionText}>
                  Vento al suolo <strong>{selectedForecast.windSurface} km/h</strong> con raffiche fino a{" "}
                  <strong>{selectedForecast.windGust} km/h</strong>. Copertura nuvolosa{" "}
                  <strong>{selectedForecast.cloudCover}%</strong>.
                </p>
              </div>

              {/* TERMICHE */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionTitle}>Termiche e turbolenza</h4>
                <p style={styles.sectionText}>
                  Velocità ascensionale termica stimata: <strong>{selectedForecast.thermalStrength} m/s</strong>{" "}
                  (forza {selectedForecast.thermalForce}/5). Turbolenza prevista:{" "}
                  <strong>{selectedForecast.turbulence}/5</strong>.
                </p>
              </div>

              {/* WINDGRAM */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionTitle}>Profilo vento in quota</h4>
                <div style={styles.windGrid}>
                  <div style={styles.windRow}>
                    <span style={styles.windAlt}>1.500 m</span>
                    <span style={styles.windDir}>{windDegToCardinal(selectedForecast.windDir1500)}</span>
                    <span style={styles.windSpeed}>{selectedForecast.wind1500} km/h</span>
                  </div>
                  <div style={styles.windRow}>
                    <span style={styles.windAlt}>2.500 m</span>
                    <span style={styles.windDir}>{windDegToCardinal(selectedForecast.windDir2500)}</span>
                    <span style={styles.windSpeed}>{selectedForecast.wind2500} km/h</span>
                  </div>
                  <div style={styles.windRow}>
                    <span style={styles.windAlt}>3.500 m</span>
                    <span style={styles.windDir}>{windDegToCardinal(selectedForecast.windDir3500)}</span>
                    <span style={styles.windSpeed}>{selectedForecast.wind3500} km/h</span>
                  </div>
                </div>
              </div>

              {/* TIP DIDATTICO */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionTitle}>Valutazione della giornata</h4>
                <p style={styles.sectionText}>
                  {selectedForecast.qualityScore >= 4
                    ? "Condizioni molto favorevoli per il volo. Termiche attive, vento gestibile e buona visibilità."
                    : selectedForecast.qualityScore === 3
                    ? "Giornata discreta. Le termiche ci sono ma il vento richiede attenzione."
                    : "Giornata difficile. Vento sostenuto o copertura nuvolosa importante. Valuta con prudenza."}
                </p>
              </div>

              {/* CONSIGLI */}
              <div style={styles.sectionBlock}>
                <h4 style={styles.sectionTitle}>Consigli pratici</h4>
                <ul style={styles.list}>
                  <li>
                    <strong>Orario migliore:</strong> 12:00–15:00 (picco termico)
                  </li>
                  <li>
                    <strong>Vento:</strong>{" "}
                    {selectedForecast.windSurface < 12
                      ? "debole, ideale per veleggiare"
                      : selectedForecast.windSurface < 20
                      ? "moderato, gestibile con esperienza"
                      : "sostenuto, valuta bene prima di decollare"}
                  </li>
                  <li>
                    <strong>Termiche:</strong>{" "}
                    {selectedForecast.thermalStrength >= 3
                      ? "forti, ottime per cross country"
                      : "moderate, adatte per volo locale"}
                  </li>
                  <li>
                    <strong>Vento in quota:</strong>{" "}
                    {selectedForecast.wind2500 > 30
                      ? "veloce sopra i 2500m, limita la quota"
                      : "gestibile, puoi salire tranquillo"}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────── STILI
const styles: Record<string, React.CSSProperties> = {
  appRoot: {
    minHeight: "100vh",
    padding: "24px",
    maxWidth: "1300px",
    margin: "0 auto",
    background: "radial-gradient(circle at top, #1a1a1a 0, #050505 60%)",
    color: "#f5f5f5",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Roboto", sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-end",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  title: { margin: 0, fontSize: "2rem" },
  subtitle: { margin: "4px 0 0", color: "#a0a0a0", fontSize: "0.9rem" },
  daySelector: { display: "flex", gap: "8px" },
  dayPill: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #2a2a2a",
    background: "#101010",
    color: "#f5f5f5",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  dayPillActive: { borderColor: "#00ff8c", background: "#0b1f16", color: "#00ff8c" },
  main: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.4fr)",
    gap: "24px",
  },
  leftPanel: {},
  rightPanel: {},
  panelTitle: { margin: "0 0 8px", fontSize: "1rem" },
  panelHint: { margin: "0 0 12px", color: "#a0a0a0", fontSize: "0.85rem" },
  sitesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "12px",
  },
  siteCard: {
    background: "#181818",
    borderRadius: 12,
    border: "1px solid #2a2a2a",
    padding: "10px 12px",
    textAlign: "left",
    cursor: "pointer",
    transition: "transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease",
  },
  siteCardSelected: {
    borderColor: "#00ff8c",
    boxShadow: "0 0 16px rgba(0, 255, 140, 0.25)",
    transform: "translateY(-2px)",
  },
  siteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "8px",
  },
  siteName: { fontSize: "0.95rem", fontWeight: 600 },
  siteValley: { fontSize: "0.75rem", color: "#a0a0a0" },
  siteScore: {
    marginTop: 8,
    borderRadius: 10,
    border: "1px solid #2a2a2a",
    padding: "6px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  scoreNumber: { fontSize: "1.1rem", fontWeight: 700 },
  scoreLabel: { fontSize: "0.8rem", color: "#a0a0a0" },
  siteMeta: { marginTop: 6, fontSize: "0.75rem", color: "#a0a0a0", lineHeight: 1.5 },
  detailCard: {
    background: "#121212",
    borderRadius: 16,
    border: "1px solid #2a2a2a",
    padding: "14px 16px",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  detailTitle: { margin: 0 },
  detailValley: { margin: "2px 0 6px", fontSize: "0.85rem", color: "#a0a0a0" },
  detailText: { margin: 0, fontSize: "0.85rem", color: "#a0a0a0" },
  detailScore: {
    borderRadius: 12,
    border: "1px solid #2a2a2a",
    padding: "8px 10px",
    textAlign: "right",
    minWidth: 120,
  },
  scoreNumberBig: { fontSize: "1.8rem", fontWeight: 700 },
  sectionBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px solid #2a2a2a",
  },
  sectionTitle: { margin: "0 0 6px", fontSize: "0.95rem" },
  sectionText: { margin: "0 0 6px", fontSize: "0.8rem", color: "#d0d0d0" },
  windGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "6px",
    marginBottom: 6,
  },
  windRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    background: "#151515",
    borderRadius: 8,
    border: "1px solid #252525",
    padding: "4px 6px",
  },
  windAlt: { color: "#f5f5f5" },
  windDir: { color: "#a0a0a0" },
  windSpeed: { color: "#4DA3FF", fontWeight: 600 },
  list: { margin: 0, paddingLeft: 16, fontSize: "0.8rem", color: "#d0d0d0" },
};