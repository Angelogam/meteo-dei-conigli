import React from "react";
import { WindLevel } from "../utils/windProfile";
import { getWindArrow, getWindDirection } from "../utils/meteo";

interface Props {
  data: WindLevel[];
  maxSpeed: number;
}

export default function WindProfileVectors({ data, maxSpeed }: Props) {
  if (!data || data.length === 0) {
    return (
      <div style={{ color: "#888", padding: 20, textAlign: "center" }}>
        Dati vento in quota non disponibili per questa fascia oraria.
      </div>
    );
  }

  const maxBar = maxSpeed || 80;
  const cellHeight = 42;
  const totalHeight = data.length * cellHeight;

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.4)",
        borderRadius: 12,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        maxHeight: 600,
        overflowY: "auto",
      }}
    >
      <h3 style={{ color: "#4fc3f7", marginBottom: 14, fontSize: "1rem" }}>
        🪁 Profilo vento in quota (base decollo → 4000 m)
      </h3>

      {/* Intestazione colonne */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "70px 1fr 90px",
          gap: 8,
          paddingBottom: 6,
          marginBottom: 4,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          fontSize: "0.7rem",
          color: "#888",
          fontWeight: 600,
        }}
      >
        <span>Quota</span>
        <span>Direzione / Velocità</span>
        <span style={{ textAlign: "right" }}>km/h</span>
      </div>

      {/* Righe dati */}
      {data.map((level, idx) => {
        const barWidth = Math.min((level.speed / maxBar) * 100, 100);
        const arrow = getWindArrow(level.direction);
        const dirLabel = getWindDirection(level.direction);

        return (
          <div
            key={level.altitude}
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr 90px",
              gap: 8,
              alignItems: "center",
              padding: "6px 0",
              borderBottom:
                idx < data.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
              fontSize: "0.9rem",
            }}
          >
            {/* Quota */}
            <span style={{ fontWeight: "bold", color: "#aaa", fontSize: "0.85rem" }}>
              {level.altitude >= 1000
                ? `${(level.altitude / 1000).toFixed(1)} km`
                : `${level.altitude} m`}
            </span>

            {/* Barra + freccia */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.4rem", minWidth: 28, textAlign: "center" }}>
                {arrow}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 20,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    borderRadius: 10,
                    background: `linear-gradient(90deg, 
                      ${level.speed < 10 ? "#4caf50" : level.speed < 20 ? "#8bc34a" : level.speed < 30 ? "#ff9800" : "#f44336"}, 
                      ${level.speed < 10 ? "#66bb6a" : level.speed < 20 ? "#aed581" : level.speed < 30 ? "#ffb74d" : "#ef5350"})`,
                    transition: "width 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      color: "#fff",
                      whiteSpace: "nowrap",
                      opacity: barWidth > 30 ? 1 : 0, // nascondi testo se barra troppo corta
                    }}
                  >
                    {dirLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* km/h */}
            <span
              style={{
                textAlign: "right",
                fontWeight: "bold",
                color: level.speed < 10 ? "#4caf50" : level.speed < 20 ? "#8bc34a" : level.speed < 30 ? "#ff9800" : "#f44336",
                fontSize: "1rem",
              }}
            >
              {level.speed} km/h
            </span>
          </div>
        );
      })}

      <p style={{ fontSize: "0.6rem", color: "#555", marginTop: 8, textAlign: "center" }}>
        Dati interpolati dai livelli 10m / 80m / 120m + proiezione a 4000m
      </p>
    </div>
  );
}