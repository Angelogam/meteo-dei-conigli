import type { HourlyData } from "@/utils/api";
import { getCloudCondition, getThermalIndex, getWindArrow, getWindDirection } from "@/utils/meteo";

interface MeteoGridProps {
  data: HourlyData;
  thermalDelta: number;
}

export function MeteoGrid({ data, thermalDelta }: MeteoGridProps) {
  const card = (label: string, value: string, sub: string) => (
    <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{value}</div>
      <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 15 }}>
      {card("🌡️ Temperatura", `${Math.round(data.temperature)}°C`, `Delta: ${thermalDelta}°C`)}
      {card("💧 Umidità", `${Math.round(data.humidity)}%`, `Rugiada: ${Math.round(data.dewPoint)}°C`)}
      {card("☁️ Nuvolosità", `${Math.round(data.cloudCover)}%`, getCloudCondition(data.cloudCover).text)}
      {card("🌧️ Precipitazioni", data.precipitation === 0 ? 'Assenti' : `${data.precipitation} mm`, data.precipitation === 0 ? '✅ Asciutto' : '⚠️ Pioggia')}
      {card("👁️ Visibilità", `${Math.round(data.visibility)} km`, data.visibility > 20 ? 'Ottima' : data.visibility > 10 ? 'Buona' : 'Limitata')}
      {card("☀️ UV", `${Math.round(data.uvIndex)}`, data.uvIndex < 3 ? 'Basso' : data.uvIndex < 6 ? 'Medio' : 'Alto ⚠️')}
      {card("🔥 Termiche", `${getThermalIndex(data.temperature, data.cloudCover, data.humidity, thermalDelta).icon} ${getThermalIndex(data.temperature, data.cloudCover, data.humidity, thermalDelta).level}`, `Δ${thermalDelta}°C`)}
      {card("💨 Vento", `${getWindArrow(data.windDir)} ${Math.round(data.windSpeed)} km/h`, `${getWindDirection(data.windDir)} • Raffiche: ${Math.round(data.windGust)} km/h`)}
    </div>
  );
}