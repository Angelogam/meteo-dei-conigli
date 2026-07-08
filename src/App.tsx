"use client";

import React, { useEffect, useState } from "react";

const DECOLLI = [
  { id: "malanotte", name: "Malanotte", lat: 44.25874571728482, lon: 7.794304664370852, elevation: 1350, exposure: "S/SE", valley: "Valle Infernotto" },
  { id: "colle_di_tenda", name: "Colle di Tenda", lat: 44.15093973937469, lon: 7.569262924652476, elevation: 1870, exposure: "S", valley: "Valle Roya/Vermenagna" },
  { id: "boves", name: "Boves", lat: 44.32113720462757, lon: 7.544697617792515, elevation: 900, exposure: "S", valley: "Cuneese" },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.43163071064606, lon: 7.362886778152897, elevation: 1500, exposure: "S", valley: "Valle Maira" },
  { id: "iretta", name: "Iretta", lat: 44.49893744007536, lon: 7.382036612070795, elevation: 1300, exposure: "S", valley: "Valle Maira" },
  { id: "val_mala", name: "Pratoni di Val Mala", lat: 44.50780117336976, lon: 7.346618978966227, elevation: 1400, exposure: "S", valley: "Valle Maira" },
  { id: "birrone", name: "Monte Birrone", lat: 44.5398927839592, lon: 7.25293945830122, elevation: 2130, exposure: "S", valley: "Valle Maira" },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.68282592463814, lon: 6.978200601250462, elevation: 2684, exposure: "S", valley: "Valle Varaita" },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.63861029121272, lon: 7.230889474766025, elevation: 1500, exposure: "S/SW", valley: "Valle Po" },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.65736521807557, lon: 7.260017009542715, elevation: 1350, exposure: "S", valley: "Valle Po" },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.60695265332723, lon: 7.38322612877631, elevation: 900, exposure: "S", valley: "Valle Po" },
  { id: "rucas_alto", name: "Rucas alto", lat: 44.74213930591463, lon: 7.220118689737356, elevation: 1500, exposure: "S/SE", valley: "Valle Infernotto" },
  { id: "montoso_basso", name: "Montoso – decollo basso", lat: 44.7643723437882, lon: 7.249757926713178, elevation: 1250, exposure: "SE", valley: "Valle Infernotto" },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.83671231480542, lon: 7.173866924055591, elevation: 2120, exposure: "S/SE", valley: "Val Pellice" },
  { id: "pian_dell_alpe", name: "Pian dell'Alpe", lat: 45.06396153999711, lon: 7.028266530872771, elevation: 1700, exposure: "S", valley: "Val Chisone" },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.93249288285819, lon: 7.310959031722244, elevation: 820, exposure: "S", valley: "Pinerolese" },
  { id: "piossasco", name: "Piossasco – Monte S. Giorgio", lat: 44.99671840144012, lon: 7.44800217882953, elevation: 673, exposure: "S", valley: "Collina Torinese" },
  { id: "truccetti", name: "Truccetti", lat: 45.07973511679036, lon: 7.342018342463826, elevation: 900, exposure: "S", valley: "Canavese" },
  { id: "val_della_torre", name: "Val della Torre", lat: 45.16262748864921, lon: 7.463716167415302, elevation: 970, exposure: "S", valley: "Val della Torre" },
  { id: "rocca_canavese", name: "Rocca Canavese – M. della Neve", lat: 45.32757754837493, lon: 7.572793582322621, elevation: 1100, exposure: "S", valley: "Canavese" },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4182733880574, lon: 7.641945041749434, elevation: 900, exposure: "S", valley: "Canavese" },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.44019393073506, lon: 7.648025947229948, elevation: 1100, exposure: "S", valley: "Canavese" },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.51729363773779, lon: 7.798808327293107, elevation: 1300, exposure: "S", valley: "Canavese" },
  { id: "andrate", name: "Andrate", lat: 45.55063933418272, lon: 7.880775591143394, elevation: 1000, exposure: "S", valley: "Canavese" },
];

function getWindDirLabel(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function getWindColor(speed) {
  if (speed <= 12) return "#4ade80";
  if (speed <= 20) return "#facc15";
  if (speed <= 30) return "#fb923c";
  return "#ef4444";
}

function getRiskLevel(meteo) {
  if (!meteo) return { level: "", color: "#555", label: "—" };
  const { windSurface, windGust, cloudCover, precipitation } = meteo;
  if (windGust > 45 || windSurface > 35 || precipitation > 1) return { level: "alto", color: "#ef4444", label: "Alto" };
  if (windSurface > 25 || windGust > 35 || precipitation > 0.3) return { level: "medio", color: "#fb923c", label: "Medio" };
  if (cloudCover > 80 && windSurface < 5) return { level: "basso", color: "#facc15", label: "Basso" };
  return { level: "molto_basso", color: "#4ade80", label: "Molto Basso" };
}

function estimateThermal(surfaceTemp, dewPoint) {
  const delta = surfaceTemp - dewPoint;
  if (delta < 4) return { strength: "debole", color: "#60a5fa", label: "Debole", icon: "☁️" };
  if (delta < 8) return { strength: "moderato", color: "#facc15", label: "Moderato", icon: "⛅" };
  if (delta < 14) return { strength: "buono", color: "#fb923c", label: "Buono", icon: "🌤️" };
  return { strength: "forte", color: "#ef4444", label: "Forte", icon: "🔥" };
}

function getCloudCoverLabel(pct) {
  if (pct < 10) return { label: "Sereno", icon: "☀️" };
  if (pct < 30) return { label: "Poco nuvoloso", icon: "🌤️" };
  if (pct < 60) return { label: "Parzialmente nuvoloso", icon: "⛅" };
  if (pct < 80) return { label: "Molto nuvoloso", icon: "☁️" };
  return { label: "Coperto", icon: "☁️" };
}

function getVisLabel(km) {
  if (km > 30) return { label: "Ottima", color: "#4ade80" };
  if (km > 15) return { label: "Buona", color: "#facc15" };
  if (km > 5) return { label: "Discreta", color: "#fb923c" };
  return { label: "Scarsa", color: "#ef4444" };
}

async function fetchMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant` +
    `&timezone=auto`;

  const r = await fetch(url);
  const d = await r.json();
  const h = d.hourly;
  const i = 12;
  const daily = d.daily;

  return {
    temperature: h.temperature_2m[i],
    tempMax: daily.temperature_2m_max[0],
    tempMin: daily.temperature_2m_min[0],
    dewPoint: h.dewpoint_2m[i],
    humidity: h.relativehumidity_2m[i],
    cloudCover: h.cloudcover[i],
    precipitation: h.precipitation[i],
    precipSum: daily.precipitation_sum[0],
    visibilityKm: h.visibility ? h.visibility[i] / 1000 : 40,
    windSurface: h.wind_speed_10m[i],
    windGust: h.wind_gusts_10m ? h.wind_gusts_10m[i] : h.wind_speed_10m[i] + 8,
    windDir: h.wind_direction_10m[i],
    windMax: daily.wind_speed_10m_max[0],
    windDirDominant: daily.wind_direction_10m_dominant[0],
  };
}

function WindArrow({ dir, speed, size = 32 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ transform: `rotate(${dir}deg)` }}>
        <circle cx="16" cy="16" r="14" fill="none" stroke={getWindColor(speed)} strokeWidth="1.5" opacity="0.3" />
        <polygon points="16,2 22,14 18,14 18,30 14,30 14,14 10,14" fill={getWindColor(speed)} />
      </svg>
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: getWindColor(speed) }}>
        {getWindDirLabel(dir)} {speed} km/h
      </span>
    </div>
  );
}

function WindGauge({ speed, gust }) {
  const max = 60;
  const sPct = Math.min((speed / max) * 100, 100);
  const gPct = Math.min((gust / max) * 100, 100);
  return (
    <div style={{ margin: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#aaa", marginBottom: 4 }}>
        <span>Vento</span>
        <span>{speed} km/h</span>
      </div>
      <div style={{ height: 8, background: "#333", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${sPct}%`, background: getWindColor(speed), borderRadius: 4, transition: "width 0.3s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#aaa", marginTop: 4 }}>
        <span>Raffiche</span>
        <span style={{ color: getWindColor(gust) }}>{gust} km/h</span>
      </div>
      <div style={{ height: 8, background: "#333", borderRadius: 4, overflow: "hidden", marginTop: 2 }}>
        <div style={{ height: "100%", width: `${gPct}%`, background: getWindColor(gust), borderRadius: 4, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

function HourlyForecast({ hourly }) {
  if (!hourly) return null;
  const now = new Date();
  const currentHour = now.getHours();
  const hours = [];
  for (let i = 0; i < 8; i++) {
    const idx = currentHour + i;
    if (idx >= 24) break;
    hours.push({
      time: `${idx}:00`,
      temp: hourly.temperature_2m[idx],
      wind: hourly.wind_speed_10m[idx],
      cloud: hourly.cloudcover[idx],
    });
  }
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#ccc", marginBottom: 8 }}>Previsioni orarie</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {hours.map((h, i) => (
          <div key={i} style={{ background: "#1e1e2e", borderRadius: 8, padding: "8px 10px", minWidth: 60, textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>{h.time}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, marginTop: 2 }}>{Math.round(h.temp)}°</div>
            <div style={{ fontSize: "0.75rem", color: getWindColor(h.wind) }}>{Math.round(h.wind)}</div>
            <div style={{ fontSize: "0.7rem", color: "#888" }}>{h.cloud}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ height: 28, width: "60%", background: "#333", borderRadius: 6, marginBottom: 20, animation: "pulse 1.5s infinite" }} />
      <div style={{ height: 80, background: "#333", borderRadius: 12, marginBottom: 16, animation: "pulse 1.5s infinite" }} />
      <div style={{ height: 16, width: "90%", background: "#333", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
      <div style={{ height: 16, width: "70%", background: "#333", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
      <div style={{ height: 16, width: "80%", background: "#333", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(DECOLLI[0].id);
  const [meteo, setMeteo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const site = DECOLLI.find((x) => x.id === selected);

  useEffect(() => {
    setLoading(true);
    fetchMeteo(site.lat, site.lon).then((d) => {
      setMeteo(d);
      setLoading(false);
    });
  }, [selected]);

  const thermal = meteo ? estimateThermal(meteo.temperature, meteo.dewPoint) : null;
  const risk = meteo ? getRiskLevel(meteo) : null;
  const cloudInfo = meteo ? getCloudCoverLabel(meteo.cloudCover) : null;
  const visInfo = meteo ? getVisLabel(meteo.visibilityKm) : null;

  const filtered = DECOLLI.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.valley.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "#0f0f1a", color: "#e0e0e0", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {/* HEADER */}
      <header style={{ background: "#1a1a2e", borderBottom: "1px solid #2a2a4a", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.6rem" }}>🪁</span>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Meteo Decolli
            </h1>
          </div>
          <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
            <input
              type="text"
              placeholder="Cerca decollo o valle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px 10px 36px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "#16162a",
                color: "#e0e0e0",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: "0.9rem" }}>🔍</span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
          {/* SIDEBAR */}
          <aside style={{ background: "#1a1a2e", borderRadius: 16, border: "1px solid #2a2a4a", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #2a2a4a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#aaa" }}>Decolli ({filtered.length})</h2>
              <span style={{ fontSize: "0.75rem", color: "#555" }}>{site.valley}</span>
            </div>
            <div style={{ maxHeight: "calc(100vh - 180px)", overflowY: "auto", padding: 8 }}>
              {filtered.map((d) => {
                const isActive = d.id === selected;
                return (
                  <button
                    key={d.id}
                    onClick={() => { setSelected(d.id); setSearch(""); }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      marginBottom: 4,
                      borderRadius: 10,
                      border: isActive ? "1px solid #60a5fa" : "1px solid transparent",
                      background: isActive ? "#1e3a5f" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#222244"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: "0.9rem", fontWeight: isActive ? 600 : 400, color: isActive ? "#93c5fd" : "#ccc" }}>{d.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#777", marginTop: 2 }}>
                      {d.elevation}m · {d.exposure}
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "#666" }}>Nessun decollo trovato</div>
              )}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main>
            {loading && <LoadingSkeleton />}

            {!loading && meteo && (
              <>
                {/* Hero card */}
                <div style={{
                  background: "linear-gradient(135deg, #1a1a3e 0%, #16213e 50%, #0f3460 100%)",
                  borderRadius: 16,
                  padding: "24px 28px",
                  border: "1px solid #2a2a5a",
                  marginBottom: 16,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                    <div>
                      <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{site.name}</h2>
                      <p style={{ color: "#888", fontSize: "0.9rem", marginTop: 4 }}>
                        {site.valley} · {site.elevation} m · Esposizione {site.exposure}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "2.5rem", fontWeight: 700 }}>{Math.round(meteo.temperature)}°C</div>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>
                        Max {Math.round(meteo.tempMax)}° / Min {Math.round(meteo.tempMin)}°
                      </div>
                    </div>
                  </div>

                  {meteo.precipSum > 0 && (
                    <div style={{ marginTop: 12, padding: "8px 14px", background: "rgba(239,68,68,0.15)", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
                      <span>🌧️</span>
                      <span>Precipitazioni: <strong>{meteo.precipSum} mm</strong> oggi</span>
                    </div>
                  )}
                </div>

                {/* Griglia metriche */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
                  {/* Termica */}
                  <div style={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid #2a2a4a", padding: 16 }}>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>CONDIZIONI TERMICHE</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.5rem" }}>{thermal.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: thermal.color }}>{thermal.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>Delta: {(meteo.temperature - meteo.dewPoint).toFixed(1)}°C</div>
                      </div>
                    </div>
                  </div>

                  {/* Nuvolosità */}
                  <div style={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid #2a2a4a", padding: 16 }}>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>NUVOLOSITÀ</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.5rem" }}>{cloudInfo.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{cloudInfo.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>{meteo.cloudCover}% copertura</div>
                      </div>
                    </div>
                  </div>

                  {/* Visibilità */}
                  <div style={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid #2a2a4a", padding: 16 }}>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>VISIBILITÀ</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.5rem" }}>👁️</span>
                      <div>
                        <div style={{ fontWeight: 600, color: visInfo.color }}>{visInfo.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>{meteo.visibilityKm.toFixed(0)} km</div>
                      </div>
                    </div>
                  </div>

                  {/* Rischio */}
                  <div style={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid #2a2a4a", padding: 16 }}>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>RISCHIO VOLO</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: risk.color }} />
                      <div>
                        <div style={{ fontWeight: 600, color: risk.color }}>{risk.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>
                          Raffiche: {meteo.windGust} km/h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vento detail */}
                <div style={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid #2a2a4a", padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>VENTO</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <WindArrow dir={meteo.windDir} speed={meteo.windSurface} size={48} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <WindGauge speed={meteo.windSurface} gust={meteo.windGust} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: "0.85rem", color: "#aaa" }}>
                      <div>Dominante: {getWindDirLabel(meteo.windDirDominant)}</div>
                      <div>Max oggi: {Math.round(meteo.windMax)} km/h</div>
                    </div>
                  </div>
                </div>

                {/* Plafond */}
                <div style={{ background: "#1a1a2e", borderRadius: 12, border: "1px solid #2a2a4a", padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: 8 }}>PLAFOND STIMATO</div>
                  <div style={{ position: "relative", height: 160, background: "linear-gradient(to top, #0a0a1a, #1a1a3e)", borderRadius: 10, overflow: "hidden" }}>
                    {/* Montagna */}
                    <svg viewBox="0 0 400 160" style={{ position: "absolute", bottom: 0, width: "100%", height: "100%" }}>
                      <polygon points="0,160 50,120 100,140 150,80 200,100 250,60 300,90 350,50 400,70 400,160" fill="#2a2a4a" />
                      <polygon points="0,160 50,120 100,140 150,80 200,100 250,60 300,90 350,50 400,70 400,160" fill="url(#mountainGrad)" opacity="0.5" />
                      <defs>
                        <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4a4a6a" />
                          <stop offset="100%" stopColor="#1a1a2e" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Decollo */}
                    <div style={{ position: "absolute", bottom: 90, left: "30%", transform: "translateX(-50%)" }}>
                      <div style={{ width: 10, height: 10, background: "#60a5fa", borderRadius: "50%", boxShadow: "0 0 10px #60a5fa" }} />
                      <div style={{ fontSize: "0.65rem", color: "#60a5fa", marginTop: 2, textAlign: "center" }}>{site.elevation}m</div>
                    </div>
                    {/* Plafond */}
                    <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#fb923c" }}>☁️ Plafond</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fb923c" }}>~{site.elevation + 1500} m</div>
                      <div style={{ fontSize: "0.7rem", color: "#888" }}>quota base nuvole</div>
                    </div>
                    {/* Linea tratteggiata */}
                    <div style={{ position: "absolute", top: 40, left: "20%", right: "20%", height: 1, borderTop: "1px dashed rgba(251,146,60,0.4)" }} />
                  </div>
                </div>

                {/* Previsioni orarie */}
                {meteo && <HourlyForecast hourly={meteo} />}

                {/* Legenda */}
                <div style={{ marginTop: 24, padding: "12px 16px", background: "#1a1a2e", borderRadius: 10, border: "1px solid #2a2a4a", fontSize: "0.75rem", color: "#666", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span>🪁 Dati aggiornati alle {new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>Fonte: Open-Meteo.com</span>
                  <span>📍 Coordinate: {site.lat.toFixed(4)}, {site.lon.toFixed(4)}</span>
                </div>
              </>
            )}

            {!loading && !meteo && (
              <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>🌤️</div>
                <div>Errore nel caricamento dei dati meteo. Riprova più tardi.</div>
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        input:focus { border-color: #60a5fa !important; }
      `}</style>
    </div>
  );
}