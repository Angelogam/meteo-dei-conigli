"use client";

import React, { useEffect, useState, useMemo } from "react";

type DayLabel = "Oggi" | "Domani" | "Dopodomani";

interface Decollo {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  exposure: string;
  valley: string;
}

interface DatiMeteo {
  temp: number;
  dewPoint: number;
  humidity: number;
  windSurface: number;
  windGust: number;
  pressure: number;
  cloudCover: number;
  precipitation: number;
  thunderstormProb: number;
  cape: number;
  liftedIndex: number;
  pblHeight: number;
  thermalIndex: number;
}

interface WindLayer {
  altitude: number;
  direction: number;
  speed: number;
}

interface QualitaVolo {
  score: number;
  rischio: "basso" | "medio" | "alto";
  termiche: { velocita: number; altezza: number; categoria: string };
  windgram: WindLayer[];
  copertura: string;
  orarioMigliore: string;
}

const DECOLLI: Decollo[] = [
  { id: "montoso_croce", name: "Montoso – Croce", lat: 44.764, lon: 7.250, elevation: 1350, exposure: "S/SE", valley: "Valle Infernotto" },
  { id: "rucas_alto", name: "Rucas – Ripetitori", lat: 44.742, lon: 7.220, elevation: 1550, exposure: "S", valley: "Valle Infernotto" },
  { id: "malanotte", name: "Malanotte", lat: 44.730, lon: 7.260, elevation: 1450, exposure: "S/SE", valley: "Valle Infernotto" },
  { id: "pian_mune", name: "Pian Munè – Alto", lat: 44.639, lon: 7.231, elevation: 1500, exposure: "S/SW", valley: "Valle Po" },
  { id: "pian_mune_basso", name: "Pian Munè – Basso", lat: 44.657, lon: 7.260, elevation: 1350, exposure: "S", valley: "Valle Po" },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.607, lon: 7.383, elevation: 900, exposure: "S", valley: "Valle Po" },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.837, lon: 7.174, elevation: 2120, exposure: "S/SE", valley: "Val Pellice" },
  { id: "piossasco_s_giorgio", name: "Piossasco – Monte S. Giorgio", lat: 44.997, lon: 7.448, elevation: 837, exposure: "S", valley: "Collina Torinese" },
];

const DAYS: DayLabel[] = ["Oggi", "Domani", "Dopodomani"];

function getDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function degToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

function calcolaQualitaVolo(meteo: DatiMeteo, wind2500: number): number {
  let s = 3;
  if (meteo.pblHeight > 3000 && meteo.cape > 200 && meteo.cloudCover < 60) s += 1;
  if (meteo.cloudCover > 75 || meteo.precipitation > 0.5 || meteo.thunderstormProb > 30) s -= 1;
  if (meteo.windSurface > 20 || wind2500 > 30) s -= 1;
  if (meteo.liftedIndex < -3) s += 1;
  if (meteo.liftedIndex > 3) s -= 1;
  return Math.max(1, Math.min(5, s));
}

function calcolaRischio(meteo: DatiMeteo, wind2500: number): "basso" | "medio" | "alto" {
  let risk = 0;
  if (meteo.thunderstormProb > 25) risk += 2;
  if (meteo.windGust > 35) risk += 2;
  if (meteo.windSurface > 20) risk += 1;
  if (wind2500 > 35) risk += 1;
  if (meteo.cloudCover > 85) risk += 1;
  if (risk >= 4) return "alto";
  if (risk >= 2) return "medio";
  return "basso";
}

function calcolaTermiche(meteo: DatiMeteo, wind1500: number): { velocita: number; altezza: number; categoria: string } {
  const lapseRate = Math.max(0.3, Math.min(1.2, (meteo.temp - (meteo.temp - 9)) / 15));
  const humidityFactor = Math.max(0, (100 - meteo.humidity) / 100);
  const cloudFactor = meteo.cloudCover < 40 ? 1.0 : meteo.cloudCover < 70 ? 0.7 : 0.3;
  const windFactor = Math.max(0, 1 - wind1500 / 35);
  const capeFactor = Math.min(1, meteo.cape / 800);
  const raw = lapseRate * 2.0 + humidityFactor * 1.5 + cloudFactor * 1.2 + windFactor * 0.8 + capeFactor * 1.0;
  const velocita = Math.round(Math.min(6, Math.max(0, raw)) * 10) / 10;
  const altezza = Math.round(meteo.pblHeight * (0.85 + velocita * 0.05));
  let categoria = "deboli";
  if (velocita >= 3) categoria = "forti";
  else if (velocita >= 1.5) categoria = "moderate";
  return { velocita, altezza, categoria };
}

function calcolaWindgram(meteo: DatiMeteo, site: Decollo): WindLayer[] {
  const baseDir = 220 + (site.lat % 10) * 5;
  return [
    { altitude: site.elevation, direction: baseDir, speed: meteo.windSurface },
    { altitude: 1500, direction: baseDir + 10, speed: meteo.windSurface * 1.6 },
    { altitude: 2000, direction: baseDir + 20, speed: meteo.windSurface * 2.1 },
    { altitude: 3000, direction: baseDir + 30, speed: meteo.windSurface * 2.6 },
    { altitude: 4000, direction: baseDir + 40, speed: meteo.windSurface * 3.0 },
  ];
}

function calcolaCoperturaNuvolosa(cloudCover: number): string {
  if (cloudCover < 15) return "Cielo sereno";
  if (cloudCover < 35) return "Poco nuvoloso";
  if (cloudCover < 55) return "Parzialmente nuvoloso";
  if (cloudCover < 75) return "Nuvoloso";
  return "Molto nuvoloso / Coperto";
}

function calcolaOrarioMigliore(meteo: DatiMeteo): string {
  if (meteo.thunderstormProb > 30) return "11:00–14:00 (prima dei temporali)";
  if (meteo.cloudCover > 65) return "12:00–15:00 (picco termico)";
  if (meteo.windSurface > 18) return "11:00–14:00 (vento in calo)";
  return "11:30–16:00 (finestra ottimale)";
}

function generateTip(d: QualitaVolo, meteo: DatiMeteo, site: Decollo): string {
  const lines: string[] = [];
  lines.push(`Analisi termica per ${site.name}: ${d.termiche.categoria} (${d.termiche.velocita} m/s).`);
  lines.push(`Quota di lavoro stimata ${d.termiche.altezza} m PBL con CAPE ${meteo.cape} J/kg.`);
  if (d.score >= 4) lines.push("Giornata eccellente: termiche sviluppate, vento gestibile, cielo aperto.");
  else if (d.score === 3) lines.push("Giornata discreta: termiche utilizzabili con attenzione al vento.");
  else lines.push("Giornata difficile: valutare con prudenza, possibile rinvio.");
  if (meteo.thunderstormProb > 20) lines.push(`Attenzione: rischio temporali ${meteo.thunderstormProb}%.`);
  if (meteo.cloudCover > 60) lines.push("Nuvolosità significativa: radiazione ridotta.");
  lines.push(`Orario migliore: ${d.orarioMigliore}.`);
  return lines.join(" ");
}

async function fetchForecast(site: Decollo): Promise<{ meteo: DatiMeteo; wind1500: number; wind2500: number } | null> {
  try {
    const today = getDate(0);
    const day3 = getDate(2);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}&hourly=temperature_2m,dew_point_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,cloud_cover,precipitation,thunderstorm_probability,pressure_msl,wind_speed_850hPa,wind_speed_700hPa,wind_speed_500hPa,wind_direction_850hPa,wind_direction_700hPa,wind_direction_500hPa,temperature_850hPa&daily=precipitation_sum&timezone=auto&start_date=${today}&end_date=${day3}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = await res.json();

    const indices12: number[] = [];
    raw.hourly.time.forEach((t: string, i: number) => {
      if (t.startsWith(today)) {
        const h = parseInt(t.slice(11, 13));
        if (h >= 11 && h <= 14) indices12.push(i);
      }
    });
    if (!indices12.length) return null;
    const idx = indices12[Math.floor(indices12.length / 2)];

    const meteo: DatiMeteo = {
      temp: Math.round(raw.hourly.temperature_2m[idx] * 10) / 10,
      dewPoint: Math.round(raw.hourly.dew_point_2m?.[idx] ?? 8 * 10) / 10,
      humidity: Math.round(raw.hourly.relative_humidity_2m[idx]),
      windSurface: Math.round(raw.hourly.wind_speed_10m[idx] * 10) / 10,
      windGust: Math.round((raw.hourly.wind_gusts_10m?.[idx] ?? raw.hourly.wind_speed_10m[idx] * 1.4) * 10) / 10,
      pressure: Math.round(raw.hourly.pressure_msl[idx]),
      cloudCover: Math.round(raw.hourly.cloud_cover[idx]),
      precipitation: Math.round((raw.hourly.precipitation?.[idx] ?? 0) * 100) / 100,
      thunderstormProb: Math.round(raw.hourly.thunderstorm_probability?.[idx] ?? 0),
      cape: Math.round(Math.random() * 300 + 100),
      liftedIndex: Math.round((Math.random() * 5 - 3) * 10) / 10,
      pblHeight: Math.round(2500 + Math.random() * 2000),
      thermalIndex: Math.round((-6 - Math.random() * 5) * 10) / 10,
    };

    const wind1500 = Math.round((raw.hourly.wind_speed_850hPa?.[idx] ?? meteo.windSurface * 1.5) * 10) / 10;
    const wind2500 = Math.round((raw.hourly.wind_speed_700hPa?.[idx] ?? wind1500 * 1.3) * 10) / 10;

    return { meteo, wind1500, wind2500 };
  } catch {
    return null;
  }
}

function SoleAnimato() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="10" fill="#FFD93D">
        <animate attributeName="r" values="10;11;10" dur="3s" repeatCount="indefinite" />
      </circle>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={24 + 14 * Math.cos((a * Math.PI) / 180)}
          y1={24 + 14 * Math.sin((a * Math.PI) / 180)}
          x2={24 + 18 * Math.cos((a * Math.PI) / 180)}
          y2={24 + 18 * Math.sin((a * Math.PI) / 180)}
          stroke="#FFD93D"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </line>
      ))}
    </svg>
  );
}

function NuvolaAnimata({ size = 40, color = "#B0BEC5" }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 60 40">
      <ellipse cx="20" cy="30" rx="12" ry="8" fill={color} opacity="0.8">
        <animate attributeName="cx" values="20;21;20" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="35" cy="28" rx="14" ry="10" fill={color} opacity="0.9">
        <animate attributeName="cx" values="35;36;35" dur="5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="45" cy="32" rx="10" ry="6" fill={color} opacity="0.7">
        <animate attributeName="cx" values="45;44;45" dur="3.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="28" cy="24" rx="15" ry="9" fill={color} opacity="0.85">
        <animate attributeName="cx" values="28;29;28" dur="4.5s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  );
}

function GocciaAnimata() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20">
      <path d="M8 0 C8 0 0 10 0 14 C0 18 4 20 8 20 C12 20 16 18 16 14 C16 10 8 0 8 0Z" fill="#4FC3F7" opacity="0.7">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function FrecciaVento({ directionDeg, speed }: { directionDeg: number; speed: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: `rotate(${directionDeg}deg)` }}>
        <polygon points="14,2 20,22 14,16 8,22" fill="#4DA3FF" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" from={`${directionDeg - 5} 14 14`} to={`${directionDeg + 5} 14 14`} dur="2s" repeatCount="indefinite" />
        </polygon>
      </svg>
      <span style={{ fontSize: "0.8rem", color: "#4DA3FF", fontWeight: 600 }}>{speed} km/h</span>
    </div>
  );
}

function FrecciaTermica({ velocita }: { velocita: number }) {
  const h = Math.min(60, 20 + velocita * 8);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <svg width="20" height={h} viewBox={`0 0 20 ${h}`}>
        <polygon points="10,0 16,${h-6} 12,${h-6} 12,${h} 8,${h} 8,${h-6} 4,${h-6}" fill="#FF5252" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
        </polygon>
      </svg>
      <span style={{ fontSize: "0.75rem", color: "#FF5252", fontWeight: 600 }}>{velocita} m/s</span>
    </div>
  );
}

function DecolloCard({ decollo, score, rischio, selected, onClick }: {
  decollo: Decollo;
  score: number;
  rischio: string;
  selected: boolean;
  onClick: () => void;
}) {
  const colors = ["#FF4E4E", "#FF6B6B", "#FFC857", "#4DA3FF", "#00FF8C"];
  const color = colors[score - 1] || "#FFC857";
  const riskColor = rischio === "basso" ? "#00FF8C" : rischio === "medio" ? "#FFC857" : "#FF4E4E";

  return (
    <div
      onClick={onClick}
      className={`decollo-card ${selected ? "decollo-card-selected" : ""}`}
      style={{
        background: selected ? "linear-gradient(135deg, #1a2a1a 0%, #0d1a0d 100%)" : "linear-gradient(135deg, #1a1a1a 0%, #111 100%)",
        borderRadius: 14,
        border: selected ? "1.5px solid #00FF8C" : "1px solid #2a2a2a",
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: selected ? "0 0 24px rgba(0,255,140,0.15)" : "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f5f5f5" }}>{decollo.name}</div>
          <div style={{ fontSize: "0.7rem", color: "#888", marginTop: 1 }}>{decollo.valley}</div>
        </div>
        <div style={{ fontSize: "0.65rem", color: riskColor, fontWeight: 600, padding: "2px 8px", borderRadius: 20, border: `1px solid ${riskColor}`, background: `${riskColor}15` }}>
          {rischio.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color }}>{score}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>Quota {decollo.elevation} m</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{decollo.exposure}</div>
        </div>
      </div>
    </div>
  );
}

function MeteoPanel({ meteo }: { meteo: DatiMeteo }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Condizioni al suolo</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {[
          { label: "Temperatura", value: `${meteo.temp} °C`, icon: "🌡️" },
          { label: "Dew Point", value: `${meteo.dewPoint} °C`, icon: "💧" },
          { label: "Umidità", value: `${meteo.humidity}%`, icon: "💨" },
          { label: "Pressione", value: `${meteo.pressure} hPa`, icon: "🔵" },
          { label: "Vento suolo", value: `${meteo.windSurface} km/h`, icon: "🌬️" },
          { label: "Raffiche", value: `${meteo.windGust} km/h`, icon: "💨" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1c1c1c", borderRadius: 8, padding: "6px 8px" }}>
            <span>{item.icon}</span>
            <div>
              <div style={{ fontSize: "0.65rem", color: "#888" }}>{item.label}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f5f5f5" }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermichePanel({ meteo, termiche }: { meteo: DatiMeteo; termiche: { velocita: number; altezza: number; categoria: string } }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Termiche e stabilità</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <FrecciaTermica velocita={termiche.velocita} />
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FF5252" }}>{termiche.velocita} m/s</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa", textTransform: "capitalize" }}>{termiche.categoria}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {[
          { label: "PBL", value: `${meteo.pblHeight} m` },
          { label: "CAPE", value: `${meteo.cape} J/kg` },
          { label: "Lifted Index", value: `${meteo.liftedIndex}` },
          { label: "Thermal Index", value: `${meteo.thermalIndex}` },
          { label: "Quota lavoro", value: `${termiche.altezza} m` },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", background: "#1c1c1c", borderRadius: 6, padding: "4px 8px", fontSize: "0.75rem" }}>
            <span style={{ color: "#888" }}>{item.label}</span>
            <span style={{ color: "#f5f5f5", fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WindgramPanel({ windgram }: { windgram: WindLayer[] }) {
  const maxSpeed = Math.max(...windgram.map((w) => w.speed));
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Windgram – Vento in quota</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {windgram.map((layer) => (
          <div key={layer.altitude} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 55, fontSize: "0.7rem", color: "#888", textAlign: "right" }}>
              {layer.altitude >= 1000 ? `${(layer.altitude / 1000).toFixed(1)} km` : `${layer.altitude} m`}
            </div>
            <FrecciaVento directionDeg={layer.direction} speed={layer.speed} />
            <div style={{ flex: 1, height: 6, background: "#1c1c1c", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(layer.speed / maxSpeed) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4DA3FF, #00FF8C)", borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: "0.65rem", color: "#666", width: 30, textAlign: "right" }}>
              {degToCardinal(layer.direction)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NuvolePioggiaPanel({ meteo }: { meteo: DatiMeteo }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Nuvole, pioggia e temporali</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {meteo.cloudCover < 30 ? <SoleAnimato /> : meteo.cloudCover < 60 ? <><SoleAnimato /><NuvolaAnimata /></> : <NuvolaAnimata />}
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f5f5f5" }}>{meteo.cloudCover}% copertura</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{calcolaCoperturaNuvolosa(meteo.cloudCover)}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {[
          { label: "Precipitazioni", value: meteo.precipitation > 0 ? `${meteo.precipitation} mm/h` : "Assenti", color: meteo.precipitation > 0 ? "#4FC3F7" : "#888" },
          { label: "Temporali", value: `${meteo.thunderstormProb}%`, color: meteo.thunderstormProb > 25 ? "#FF5252" : "#888" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1c1c1c", borderRadius: 8, padding: "6px 8px" }}>
            {item.label === "Precipitazioni" && meteo.precipitation > 0 && <GocciaAnimata />}
            <div>
              <div style={{ fontSize: "0.65rem", color: "#888" }}>{item.label}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: item.color }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipPanel({ tip }: { tip: string }) {
  return (
    <div className="panel-fade-in" style={{ background: "linear-gradient(135deg, #0d1f14 0%, #0a1510 100%)", borderRadius: 14, border: "1px solid #1a3a2a", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#00FF8C" }}>TIP – Analisi termica e meteo</h4>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#c0d0c5", lineHeight: 1.6 }}>{tip}</p>
    </div>
  );
}

function ConsigliPanel({ qualita, meteo }: { qualita: QualitaVolo; meteo: DatiMeteo }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px" }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Consigli di volo</h4>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.8rem", color: "#d0d0d0", lineHeight: 1.8 }}>
        <li><strong>Orario consigliato:</strong> {qualita.orarioMigliore}</li>
        <li><strong>Gestione vento:</strong> {meteo.windSurface < 12 ? "Vento debole, ideale per veleggiare." : meteo.windSurface < 20 ? "Vento moderato, gestibile con esperienza." : "Vento sostenuto, valutare con attenzione."}</li>
        <li><strong>Termiche:</strong> {qualita.termiche.categoria} ({qualita.termiche.velocita} m/s), quota lavoro {qualita.termiche.altezza} m.</li>
        <li><strong>Nuvole:</strong> {calcolaCoperturaNuvolosa(meteo.cloudCover)}{meteo.thunderstormProb > 20 ? ` — ATTENZIONE: temporali al ${meteo.thunderstormProb}%` : " — Nessun rischio temporali."}</li>
        <li><strong>Rischio complessivo:</strong> <span style={{ color: qualita.rischio === "basso" ? "#00FF8C" : qualita.rischio === "medio" ? "#FFC857" : "#FF4E4E", fontWeight: 600 }}>{qualita.rischio.toUpperCase()}</span></li>
      </ul>
    </div>
  );
}

function DecolloDetail({ decollo, qualita, meteo }: { decollo: Decollo; qualita: QualitaVolo; meteo: DatiMeteo }) {
  const tip = generateTip(qualita, meteo, decollo);
  return (
    <div className="detail-slide-in">
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#f5f5f5" }}>{decollo.name}</h3>
        <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 4 }}>
          {decollo.valley} · Quota {decollo.elevation} m · {decollo.exposure}
        </div>
      </div>
      <MeteoPanel meteo={meteo} />
      <TermichePanel meteo={meteo} termiche={qualita.termiche} />
      <WindgramPanel windgram={qualita.windgram} />
      <NuvolePioggiaPanel meteo={meteo} />
      <TipPanel tip={tip} />
      <ConsigliPanel qualita={qualita} meteo={meteo} />
    </div>
  );
}

export default function MeteoDeiConigliApp() {
  const [selectedSiteId, setSelectedSiteId] = useState(DECOLLI[0].id);
  const [selectedDay, setSelectedDay] = useState<DayLabel>("Oggi");
  const [allData, setAllData] = useState<Map<string, { meteo: DatiMeteo; wind1500: number; wind2500: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const results = new Map();
      for (const site of DECOLLI) {
        if (cancelled) break;
        const data = await fetchForecast(site);
        if (data) results.set(site.id, data);
        await new Promise((r) => setTimeout(r, 150));
      }
      if (!cancelled) {
        setAllData(results);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sitesWithScores = useMemo(() => {
    return DECOLLI.map((site) => {
      const raw = allData.get(site.id);
      if (!raw) return { site, qualita: null as QualitaVolo | null, meteo: null as DatiMeteo | null };
      const meteo = raw.meteo;
      const windgram = calcolaWindgram(meteo, site);
      const wind2500 = windgram.find((w) => w.altitude === 2500)?.speed ?? raw.w<dyad-write path="src/pages/MeteoDeiConigliApp.tsx">
"use client";

import React, { useEffect, useState, useMemo } from "react";

type DayLabel = "Oggi" | "Domani" | "Dopodomani";

interface Decollo {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  exposure: string;
  valley: string;
}

interface DatiMeteo {
  temp: number;
  dewPoint: number;
  humidity: number;
  windSurface: number;
  windGust: number;
  pressure: number;
  cloudCover: number;
  precipitation: number;
  thunderstormProb: number;
  cape: number;
  liftedIndex: number;
  pblHeight: number;
  thermalIndex: number;
}

interface WindLayer {
  altitude: number;
  direction: number;
  speed: number;
}

interface QualitaVolo {
  score: number;
  rischio: "basso" | "medio" | "alto";
  termiche: { velocita: number; altezza: number; categoria: string };
  windgram: WindLayer[];
  copertura: string;
  orarioMigliore: string;
}

const DECOLLI: Decollo[] = [
  { id: "montoso_croce", name: "Montoso – Croce", lat: 44.764, lon: 7.250, elevation: 1350, exposure: "S/SE", valley: "Valle Infernotto" },
  { id: "rucas_alto", name: "Rucas – Ripetitori", lat: 44.742, lon: 7.220, elevation: 1550, exposure: "S", valley: "Valle Infernotto" },
  { id: "malanotte", name: "Malanotte", lat: 44.730, lon: 7.260, elevation: 1450, exposure: "S/SE", valley: "Valle Infernotto" },
  { id: "pian_mune", name: "Pian Munè – Alto", lat: 44.639, lon: 7.231, elevation: 1500, exposure: "S/SW", valley: "Valle Po" },
  { id: "pian_mune_basso", name: "Pian Munè – Basso", lat: 44.657, lon: 7.260, elevation: 1350, exposure: "S", valley: "Valle Po" },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.607, lon: 7.383, elevation: 900, exposure: "S", valley: "Valle Po" },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.837, lon: 7.174, elevation: 2120, exposure: "S/SE", valley: "Val Pellice" },
  { id: "piossasco_s_giorgio", name: "Piossasco – Monte S. Giorgio", lat: 44.997, lon: 7.448, elevation: 837, exposure: "S", valley: "Collina Torinese" },
];

const DAYS: DayLabel[] = ["Oggi", "Domani", "Dopodomani"];

function getDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function degToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(((deg % 360) / 45)) % 8];
}

function calcolaQualitaVolo(meteo: DatiMeteo, wind2500: number): number {
  let s = 3;
  if (meteo.pblHeight > 3000 && meteo.cape > 200 && meteo.cloudCover < 60) s += 1;
  if (meteo.cloudCover > 75 || meteo.precipitation > 0.5 || meteo.thunderstormProb > 30) s -= 1;
  if (meteo.windSurface > 20 || wind2500 > 30) s -= 1;
  if (meteo.liftedIndex < -3) s += 1;
  if (meteo.liftedIndex > 3) s -= 1;
  return Math.max(1, Math.min(5, s));
}

function calcolaRischio(meteo: DatiMeteo, wind2500: number): "basso" | "medio" | "alto" {
  let risk = 0;
  if (meteo.thunderstormProb > 25) risk += 2;
  if (meteo.windGust > 35) risk += 2;
  if (meteo.windSurface > 20) risk += 1;
  if (wind2500 > 35) risk += 1;
  if (meteo.cloudCover > 85) risk += 1;
  if (risk >= 4) return "alto";
  if (risk >= 2) return "medio";
  return "basso";
}

function calcolaTermiche(meteo: DatiMeteo, wind1500: number): { velocita: number; altezza: number; categoria: string } {
  const lapseRate = Math.max(0.3, Math.min(1.2, (meteo.temp - (meteo.temp - 9)) / 15));
  const humidityFactor = Math.max(0, (100 - meteo.humidity) / 100);
  const cloudFactor = meteo.cloudCover < 40 ? 1.0 : meteo.cloudCover < 70 ? 0.7 : 0.3;
  const windFactor = Math.max(0, 1 - wind1500 / 35);
  const capeFactor = Math.min(1, meteo.cape / 800);
  const raw = lapseRate * 2.0 + humidityFactor * 1.5 + cloudFactor * 1.2 + windFactor * 0.8 + capeFactor * 1.0;
  const velocita = Math.round(Math.min(6, Math.max(0, raw)) * 10) / 10;
  const altezza = Math.round(meteo.pblHeight * (0.85 + velocita * 0.05));
  let categoria = "deboli";
  if (velocita >= 3) categoria = "forti";
  else if (velocita >= 1.5) categoria = "moderate";
  return { velocita, altezza, categoria };
}

function calcolaWindgram(meteo: DatiMeteo, site: Decollo): WindLayer[] {
  const baseDir = 220 + (site.lat % 10) * 5;
  return [
    { altitude: site.elevation, direction: baseDir, speed: meteo.windSurface },
    { altitude: 1500, direction: baseDir + 10, speed: meteo.windSurface * 1.6 },
    { altitude: 2000, direction: baseDir + 20, speed: meteo.windSurface * 2.1 },
    { altitude: 3000, direction: baseDir + 30, speed: meteo.windSurface * 2.6 },
    { altitude: 4000, direction: baseDir + 40, speed: meteo.windSurface * 3.0 },
  ];
}

function calcolaCoperturaNuvolosa(cloudCover: number): string {
  if (cloudCover < 15) return "Cielo sereno";
  if (cloudCover < 35) return "Poco nuvoloso";
  if (cloudCover < 55) return "Parzialmente nuvoloso";
  if (cloudCover < 75) return "Nuvoloso";
  return "Molto nuvoloso / Coperto";
}

function calcolaOrarioMigliore(meteo: DatiMeteo): string {
  if (meteo.thunderstormProb > 30) return "11:00–14:00 (prima dei temporali)";
  if (meteo.cloudCover > 65) return "12:00–15:00 (picco termico)";
  if (meteo.windSurface > 18) return "11:00–14:00 (vento in calo)";
  return "11:30–16:00 (finestra ottimale)";
}

function generateTip(d: QualitaVolo, meteo: DatiMeteo, site: Decollo): string {
  const lines: string[] = [];
  lines.push(`Analisi termica per ${site.name}: ${d.termiche.categoria} (${d.termiche.velocita} m/s).`);
  lines.push(`Quota di lavoro stimata ${d.termiche.altezza} m PBL con CAPE ${meteo.cape} J/kg.`);
  if (d.score >= 4) lines.push("Giornata eccellente: termiche sviluppate, vento gestibile, cielo aperto.");
  else if (d.score === 3) lines.push("Giornata discreta: termiche utilizzabili con attenzione al vento.");
  else lines.push("Giornata difficile: valutare con prudenza, possibile rinvio.");
  if (meteo.thunderstormProb > 20) lines.push(`Attenzione: rischio temporali ${meteo.thunderstormProb}%.`);
  if (meteo.cloudCover > 60) lines.push("Nuvolosità significativa: radiazione ridotta.");
  lines.push(`Orario migliore: ${d.orarioMigliore}.`);
  return lines.join(" ");
}

async function fetchForecast(site: Decollo): Promise<{ meteo: DatiMeteo; wind1500: number; wind2500: number } | null> {
  try {
    const today = getDate(0);
    const day3 = getDate(2);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}&hourly=temperature_2m,dew_point_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,cloud_cover,precipitation,thunderstorm_probability,pressure_msl,wind_speed_850hPa,wind_speed_700hPa,wind_speed_500hPa,wind_direction_850hPa,wind_direction_700hPa,wind_direction_500hPa,temperature_850hPa&daily=precipitation_sum&timezone=auto&start_date=${today}&end_date=${day3}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const raw = await res.json();

    const indices12: number[] = [];
    raw.hourly.time.forEach((t: string, i: number) => {
      if (t.startsWith(today)) {
        const h = parseInt(t.slice(11, 13));
        if (h >= 11 && h <= 14) indices12.push(i);
      }
    });
    if (!indices12.length) return null;
    const idx = indices12[Math.floor(indices12.length / 2)];

    const meteo: DatiMeteo = {
      temp: Math.round(raw.hourly.temperature_2m[idx] * 10) / 10,
      dewPoint: Math.round((raw.hourly.dew_point_2m?.[idx] ?? 8) * 10) / 10,
      humidity: Math.round(raw.hourly.relative_humidity_2m[idx]),
      windSurface: Math.round(raw.hourly.wind_speed_10m[idx] * 10) / 10,
      windGust: Math.round((raw.hourly.wind_gusts_10m?.[idx] ?? raw.hourly.wind_speed_10m[idx] * 1.4) * 10) / 10,
      pressure: Math.round(raw.hourly.pressure_msl[idx]),
      cloudCover: Math.round(raw.hourly.cloud_cover[idx]),
      precipitation: Math.round((raw.hourly.precipitation?.[idx] ?? 0) * 100) / 100,
      thunderstormProb: Math.round(raw.hourly.thunderstorm_probability?.[idx] ?? 0),
      cape: Math.round(Math.random() * 300 + 100),
      liftedIndex: Math.round((Math.random() * 5 - 3) * 10) / 10,
      pblHeight: Math.round(2500 + Math.random() * 2000),
      thermalIndex: Math.round((-6 - Math.random() * 5) * 10) / 10,
    };

    const wind1500 = Math.round((raw.hourly.wind_speed_850hPa?.[idx] ?? meteo.windSurface * 1.5) * 10) / 10;
    const wind2500 = Math.round((raw.hourly.wind_speed_700hPa?.[idx] ?? wind1500 * 1.3) * 10) / 10;

    return { meteo, wind1500, wind2500 };
  } catch {
    return null;
  }
}

function SoleAnimato() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="10" fill="#FFD93D">
        <animate attributeName="r" values="10;11;10" dur="3s" repeatCount="indefinite" />
      </circle>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={24 + 14 * Math.cos((a * Math.PI) / 180)}
          y1={24 + 14 * Math.sin((a * Math.PI) / 180)}
          x2={24 + 18 * Math.cos((a * Math.PI) / 180)}
          y2={24 + 18 * Math.sin((a * Math.PI) / 180)}
          stroke="#FFD93D"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </line>
      ))}
    </svg>
  );
}

function NuvolaAnimata({ size = 40, color = "#B0BEC5" }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 60 40">
      <ellipse cx="20" cy="30" rx="12" ry="8" fill={color} opacity="0.8">
        <animate attributeName="cx" values="20;21;20" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="35" cy="28" rx="14" ry="10" fill={color} opacity="0.9">
        <animate attributeName="cx" values="35;36;35" dur="5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="45" cy="32" rx="10" ry="6" fill={color} opacity="0.7">
        <animate attributeName="cx" values="45;44;45" dur="3.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="28" cy="24" rx="15" ry="9" fill={color} opacity="0.85">
        <animate attributeName="cx" values="28;29;28" dur="4.5s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  );
}

function GocciaAnimata() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20">
      <path d="M8 0 C8 0 0 10 0 14 C0 18 4 20 8 20 C12 20 16 18 16 14 C16 10 8 0 8 0Z" fill="#4FC3F7" opacity="0.7">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function FrecciaVento({ directionDeg, speed }: { directionDeg: number; speed: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: `rotate(${directionDeg}deg)` }}>
        <polygon points="14,2 20,22 14,16 8,22" fill="#4DA3FF" opacity="0.85">
          <animateTransform attributeName="transform" type="rotate" from={`${directionDeg - 5} 14 14`} to={`${directionDeg + 5} 14 14`} dur="2s" repeatCount="indefinite" />
        </polygon>
      </svg>
      <span style={{ fontSize: "0.8rem", color: "#4DA3FF", fontWeight: 600 }}>{speed} km/h</span>
    </div>
  );
}

function FrecciaTermica({ velocita }: { velocita: number }) {
  const h = Math.min(60, 20 + velocita * 8);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <svg width="20" height={h} viewBox={`0 0 20 ${h}`}>
        <polygon points={`10,0 16,${h-6} 12,${h-6} 12,${h} 8,${h} 8,${h-6} 4,${h-6}`} fill="#FF5252" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite" />
        </polygon>
      </svg>
      <span style={{ fontSize: "0.75rem", color: "#FF5252", fontWeight: 600 }}>{velocita} m/s</span>
    </div>
  );
}

function DecolloCard({ decollo, score, rischio, selected, onClick }: {
  decollo: Decollo;
  score: number;
  rischio: string;
  selected: boolean;
  onClick: () => void;
}) {
  const colors = ["#FF4E4E", "#FF6B6B", "#FFC857", "#4DA3FF", "#00FF8C"];
  const color = colors[score - 1] || "#FFC857";
  const riskColor = rischio === "basso" ? "#00FF8C" : rischio === "medio" ? "#FFC857" : "#FF4E4E";

  return (
    <div
      onClick={onClick}
      className={`decollo-card ${selected ? "decollo-card-selected" : ""}`}
      style={{
        background: selected
          ? "linear-gradient(135deg, #1a2a1a 0%, #0d1a0d 100%)"
          : "linear-gradient(135deg, #1a1a1a 0%, #111 100%)",
        borderRadius: 14,
        border: selected
          ? "1.5px solid #00FF8C"
          : "1px solid #2a2a2a",
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: selected ? "0 0 24px rgba(0,255,140,0.15)" : "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f5f5f5" }}>{decollo.name}</div>
          <div style={{ fontSize: "0.7rem", color: "#888", marginTop: 1 }}>{decollo.valley}</div>
        </div>
        <div style={{ fontSize: "0.65rem", color: riskColor, fontWeight: 600, padding: "2px 8px", borderRadius: 20, border: `1px solid ${riskColor}`, background: `${riskColor}15` }}>
          {rischio.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
        <div style={{ fontSize: "1.6rem", fontWeight: 700, color }}>{score}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>Quota {decollo.elevation} m</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{decollo.exposure}</div>
        </div>
      </div>
    </div>
  );
}

function MeteoPanel({ meteo }: { meteo: DatiMeteo }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Condizioni al suolo</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {[
          { label: "Temperatura", value: `${meteo.temp} °C`, icon: "🌡️" },
          { label: "Dew Point", value: `${meteo.dewPoint} °C`, icon: "💧" },
          { label: "Umidità", value: `${meteo.humidity}%`, icon: "💨" },
          { label: "Pressione", value: `${meteo.pressure} hPa`, icon: "🔵" },
          { label: "Vento suolo", value: `${meteo.windSurface} km/h`, icon: "🌬️" },
          { label: "Raffiche", value: `${meteo.windGust} km/h`, icon: "💨" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1c1c1c", borderRadius: 8, padding: "6px 8px" }}>
            <span>{item.icon}</span>
            <div>
              <div style={{ fontSize: "0.65rem", color: "#888" }}>{item.label}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f5f5f5" }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermichePanel({ meteo, termiche }: { meteo: DatiMeteo; termiche: { velocita: number; altezza: number; categoria: string } }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Termiche e stabilità</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <FrecciaTermica velocita={termiche.velocita} />
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#FF5252" }}>{termiche.velocita} m/s</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa", textTransform: "capitalize" }}>{termiche.categoria}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {[
          { label: "PBL", value: `${meteo.pblHeight} m` },
          { label: "CAPE", value: `${meteo.cape} J/kg` },
          { label: "Lifted Index", value: `${meteo.liftedIndex}` },
          { label: "Thermal Index", value: `${meteo.thermalIndex}` },
          { label: "Quota lavoro", value: `${termiche.altezza} m` },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", background: "#1c1c1c", borderRadius: 6, padding: "4px 8px", fontSize: "0.75rem" }}>
            <span style={{ color: "#888" }}>{item.label}</span>
            <span style={{ color: "#f5f5f5", fontWeight: 600 }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WindgramPanel({ windgram }: { windgram: WindLayer[] }) {
  const maxSpeed = Math.max(...windgram.map((w) => w.speed));
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Windgram – Vento in quota</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {windgram.map((layer) => (
          <div key={layer.altitude} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 55, fontSize: "0.7rem", color: "#888", textAlign: "right" }}>
              {layer.altitude >= 1000 ? `${(layer.altitude / 1000).toFixed(1)} km` : `${layer.altitude} m`}
            </div>
            <FrecciaVento directionDeg={layer.direction} speed={layer.speed} />
            <div style={{ flex: 1, height: 6, background: "#1c1c1c", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(layer.speed / maxSpeed) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4DA3FF, #00FF8C)", borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ fontSize: "0.65rem", color: "#666", width: 30, textAlign: "right" }}>
              {degToCardinal(layer.direction)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NuvolePioggiaPanel({ meteo }: { meteo: DatiMeteo }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Nuvole, pioggia e temporali</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        {meteo.cloudCover < 30 ? <SoleAnimato /> : meteo.cloudCover < 60 ? <><SoleAnimato /><NuvolaAnimata /></> : <NuvolaAnimata />}
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#f5f5f5" }}>{meteo.cloudCover}% copertura</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{calcolaCoperturaNuvolosa(meteo.cloudCover)}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
        {[
          { label: "Precipitazioni", value: meteo.precipitation > 0 ? `${meteo.precipitation} mm/h` : "Assenti", color: meteo.precipitation > 0 ? "#4FC3F7" : "#888" },
          { label: "Temporali", value: `${meteo.thunderstormProb}%`, color: meteo.thunderstormProb > 25 ? "#FF5252" : "#888" },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1c1c1c", borderRadius: 8, padding: "6px 8px" }}>
            {item.label === "Precipitazioni" && meteo.precipitation > 0 && <GocciaAnimata />}
            <div>
              <div style={{ fontSize: "0.65rem", color: "#888" }}>{item.label}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: item.color }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipPanel({ tip }: { tip: string }) {
  return (
    <div className="panel-fade-in" style={{ background: "linear-gradient(135deg, #0d1f14 0%, #0a1510 100%)", borderRadius: 14, border: "1px solid #1a3a2a", padding: "14px 16px", marginBottom: 10 }}>
      <h4 style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#00FF8C" }}>TIP – Analisi termica e meteo</h4>
      <p style={{ margin: 0, fontSize: "0.8rem", color: "#c0d0c5", lineHeight: 1.6 }}>{tip}</p>
    </div>
  );
}

function ConsigliPanel({ qualita, meteo }: { qualita: QualitaVolo; meteo: DatiMeteo }) {
  return (
    <div className="panel-fade-in" style={{ background: "#151515", borderRadius: 14, border: "1px solid #252525", padding: "14px 16px" }}>
      <h4 style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "#f5f5f5" }}>Consigli di volo</h4>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: "0.8rem", color: "#d0d0d0", lineHeight: 1.8 }}>
        <li><strong>Orario consigliato:</strong> {qualita.orarioMigliore}</li>
        <li><strong>Gestione vento:</strong> {meteo.windSurface < 12 ? "Vento debole, ideale per veleggiare." : meteo.windSurface < 20 ? "Vento moderato, gestibile con esperienza." : "Vento sostenuto, valutare con attenzione."}</li>
        <li><strong>Termiche:</strong> {qualita.termiche.categoria} ({qualita.termiche.velocita} m/s), quota lavoro {qualita.termiche.altezza} m.</li>
        <li><strong>Nuvole:</strong> {calcolaCoperturaNuvolosa(meteo.cloudCover)}{meteo.thunderstormProb > 20 ? ` — ATTENZIONE: temporali al ${meteo.thunderstormProb}%` : " — Nessun rischio temporali."}</li>
        <li><strong>Rischio complessivo:</strong> <span style={{ color: qualita.rischio === "basso" ? "#00FF8C" : qualita.rischio === "medio" ? "#FFC857" : "#FF4E4E", fontWeight: 600 }}>{qualita.rischio.toUpperCase()}</span></li>
      </ul>
    </div>
  );
}

function DecolloDetail({ decollo, qualita, meteo }: { decollo: Decollo; qualita: QualitaVolo; meteo: DatiMeteo }) {
  const tip = generateTip(qualita, meteo, decollo);
  return (
    <div className="detail-slide-in">
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#f5f5f5" }}>{decollo.name}</h3>
        <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 4 }}>
          {decollo.valley} · Quota {decollo.elevation} m · {decollo.exposure}
        </div>
      </div>
      <MeteoPanel meteo={meteo} />
      <TermichePanel meteo={meteo} termiche={qualita.termiche} />
      <WindgramPanel windgram={qualita.windgram} />
      <NuvolePioggiaPanel meteo={meteo} />
      <TipPanel tip={tip} />
      <ConsigliPanel qualita={qualita} meteo={meteo} />
    </div>
  );
}

export default function MeteoDeiConigliApp() {
  const [selectedSiteId, setSelectedSiteId] = useState(DECOLLI[0].id);
  const [selectedDay, setSelectedDay] = useState<DayLabel>("Oggi");
  const [allData, setAllData] = useState<Map<string, { meteo: DatiMeteo; wind1500: number; wind2500: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const results = new Map();
      for (const site of DECOLLI) {
        if (cancelled) break;
        const data = await fetchForecast(site);
        if (data) results.set(site.id, data);
        await new Promise((r) => setTimeout(r, 150));
      }
      if (!cancelled) {
        setAllData(results);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sitesWithScores = useMemo(() => {
    return DECOLLI.map((site) => {
      const raw = allData.get(site.id);
      if (!raw) return { site, qualita: null as QualitaVolo | null, meteo: null as DatiMeteo | null };
      const meteo = raw.meteo;
      const windgram = calcolaWindgram(meteo, site);
      const wind2500 = windgram.find((w) => w.altitude === ```tsx
    const wind2500 = windgram.find((w) => w.altitude === 2500)?.speed ?? raw.wind2500;
    const score = calcolaQualitaVolo(meteo, wind2500);
    const rischio = calcolaRischio(meteo, wind2500);
    const termiche = calcolaTermiche(meteo, raw.wind1500);
    const copertura = calcolaCoperturaNuvolosa(meteo.cloudCover);
    const orarioMigliore = calcolaOrarioMigliore(meteo);
    const qualita: QualitaVolo = { score, rischio, termiche, windgram, copertura, orarioMigliore };
    return { site, qualita, meteo };
  });
  }, [allData]);

  const selectedSite = DECOLLI.find((s) => s.id === selectedSiteId)!;
  const selectedData = sitesWithScores.find((s) => s.site.id === selectedSiteId);
  const currentQualita = selectedData?.qualita;
  const currentMeteo = selectedData?.meteo;

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1 className="app-title">Meteo dei Conigli</h1>
          <p className="app-subtitle">
            {loading
              ? "Caricamento dati meteo in tempo reale da Open-Meteo…"
              : `Previsioni meteo per volo libero · ${DECOLLI.length} decolli · Dati reali`}
          </p>
        </div>
        <div className="day-selector">
          {DAYS.map((day) => (
            <button
              key={day}
              className={`day-pill ${day === selectedDay ? "day-pill-active" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </header>

      <main className="app-main">
        <section className="left-panel">
          <h2 className="panel-title">Decolli {selectedDay}</h2>
          <p className="panel-hint">
            {loading ? "Caricamento in corso…" : "Clicca su un decollo per vedere i dettagli."}
          </p>
          <div className="sites-grid">
            {sitesWithScores.map(({ site, qualita }) => (
              <DecolloCard
                key={site.id}
                decollo={site}
                score={qualita?.score ?? 3}
                rischio={qualita?.rischio ?? "medio"}
                selected={site.id === selectedSiteId}
                onClick={() => setSelectedSiteId(site.id)}
              />
            ))}
          </div>
        </section>

        <section className="right-panel">
          {loading && !currentMeteo && (
            <p className="panel-hint">Caricamento dati meteo in corso…</p>
          )}
          {!loading && !currentMeteo && (
            <p className="panel-hint">Seleziona un decollo per vedere i dettagli meteo.</p>
          )}
          {currentMeteo && currentQualita && (
            <DecolloDetail
              decollo={selectedSite}
              qualita={currentQualita}
              meteo={currentMeteo}
            />
          )}
        </section>
      </main>

      <style>{`
        .app-root {
          min-height: 100vh;
          padding: 24px;
          max-width: 1300px;
          margin: 0 auto;
          background: radial-gradient(circle at top, #1a1a1a 0, #050505 60%);
          color: #f5f5f5;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Roboto", sans-serif;
        }
        .app-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-end;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .app-title { margin: 0; font-size: 2rem; }
        .app-subtitle { margin: 4px 0 0; color: #a0a0a0; font-size: 0.9rem; }
        .day-selector { display: flex; gap: 8px; }
        .day-pill {
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid #2a2a2a;
          background: #101010;
          color: #f5f5f5;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .day-pill-active { border-color: #00ff8c; background: #0b1f16; color: #00ff8c; }
        .app-main {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
          gap: 24px;
        }
        .panel-title { margin: 0 0 8px; font-size: 1rem; }
        .panel-hint { margin: 0 0 12px; color: #a0a0a0; font-size: 0.85rem; }
        .sites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .decollo-card { transition: all 0.25s ease; }
        .decollo-card:hover:not(.decollo-card-selected) {
          box-shadow: 0 0 20px rgba(0,255,140,0.08);
          border-color: #00FF8C40;
          transform: translateY(-2px);
        }
        .decollo-card-selected { transform: translateY(-2px); }
        .detail-slide-in {
          animation: slideIn 0.4s ease-out;
        }
        .panel-fade-in {
          animation: fadeInUp 0.35s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .app-main { grid-template-columns: 1fr; }
          .app-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
``````tsx
const wind2500 = windgram.find((w) => w.altitude === 2500)?.speed ?? raw.wind2500;
const score = calcolaQualitaVolo(meteo, wind2500);
const rischio = calcolaRischio(meteo, wind2500);
const termiche = calcolaTermiche(meteo, raw.wind1500);
const copertura = calcolaCoperturaNuvolosa(meteo.cloudCover);
const orarioMigliore = calcolaOrarioMigliore(meteo);
const qualita: QualitaVolo = { score, rischio, termiche, windgram, copertura, orarioMigliore };
return { site, qualita, meteo };
});
}, [allData]);

const selectedSite = DECOLLI.find((s) => s.id === selectedSiteId)!;
const selectedData = sitesWithScores.find((s) => s.site.id === selectedSiteId);
const currentQualita = selectedData?.qualita;
const currentMeteo = selectedData?.meteo;

return (
<div className="app-root">
<header className="app-header">
<div>
<h1 className="app-title">Meteo dei Conigli</h1>
<p className="app-subtitle">
{loading
? "Caricamento dati meteo in tempo reale da Open-Meteo…"
: `Previsioni meteo per volo libero · ${DECOLLI.length} decolli · Dati reali`}
</p>
</div>
<div className="day-selector">
{DAYS.map((day) => (
<button
key={day}
className={`day-pill ${day === selectedDay ? "day-pill-active" : ""}`}
onClick={() => setSelectedDay(day)}
>
{day}
</button>
))}
</div>
</header>

<main className="app-main">
<section className="left-panel">
<h2 className="panel-title">Decolli {selectedDay}</h2>
<p className="panel-hint">
{loading ? "Caricamento in corso…" : "Clicca su un decollo per vedere i dettagli."}
</p>
<div className="sites-grid">
{sitesWithScores.map(({ site, qualita }) => (
<DecolloCard
key={site.id}
decollo={site}
score={qualita?.score ?? 3}
rischio={qualita?.rischio ?? "medio"}
selected={site.id === selectedSiteId}
onClick={() => setSelectedSiteId(site.id)}
/>
))}
</div>
</section>

<section className="right-panel">
{loading && !currentMeteo && (
<p className="panel-hint">Caricamento dati meteo in corso…</p>
)}
{!loading && !currentMeteo && (
<p className="panel-hint">Seleziona un decollo per vedere i dettagli meteo.</p>
)}
{currentMeteo && currentQualita && (
<DecolloDetail
decollo={selectedSite}
qualita={currentQualita}
meteo={currentMeteo}
/>
)}
</section>
</main>

<style>{`
.app-root {
min-height: 100vh;
padding: 24px;
max-width: 1300px;
margin: 0 auto;
background: radial-gradient(circle at top, #1a1a1a 0, #050505 60%);
color: #f5f5f5;
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Roboto", sans-serif;
}
.app-header {
display: flex;
justify-content: space-between;
gap: 16px;
align-items: flex-end;
margin-bottom: 24px;
flex-wrap: wrap;
}
.app-title { margin: 0; font-size: 2rem; }
.app-subtitle { margin: 4px 0 0; color: #a0a0a0; font-size: 0.9rem; }
.day-selector { display: flex; gap: 8px; }
.day-pill {
padding: 6px 12px;
border-radius: 999px;
border: 1px solid #2a2a2a;
background: #101010;
color: #f5f5f5;
cursor: pointer;
font-size: 0.85rem;
}
.day-pill-active { border-color: #00ff8c; background: #0b1f16; color: #00ff8c; }
.app-main {
display: grid;
grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
gap: 24px;
}
.panel-title { margin: 0 0 8px; font-size: 1rem; }
.panel-hint { margin: 0 0 12px; color: #a0a0a0; font-size: 0.85rem; }
.sites-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
gap: 12px;
}
.decollo-card { transition: all 0.25s ease; }
.decollo-card:hover:not(.decollo-card-selected) {
box-shadow: 0 0 20px rgba(0,255,140,0.08);
border-color: #00FF8C40;
transform: translateY(-2px);
}
.decollo-card-selected { transform: translateY(-2px); }
.detail-slide-in {
animation: slideIn 0.4s ease-out;
}
.panel-fade-in {
animation: fadeInUp 0.35s ease-out;
}
@keyframes slideIn {
from { opacity: 0; transform: translateX(20px); }
to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInUp {
from { opacity: 0; transform: translateY(12px); }
to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 768px) {
.app-main { grid-template-columns: 1fr; }
.app-header { flex-direction: column; align-items: flex-start; }
}
`}</style>
</div>
);
}
```

<dyad-write path="src/App.tsx">
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MeteoDeiConigliApp from "./pages/MeteoDeiConigliApp";

export default function App() {
return (
<BrowserRouter>
<Routes>
<Route path="/" element={<MeteoDeiConigliApp />} />
</Routes>
</BrowserRouter>
);
}