import { getWeatherIcon } from "@/utils/meteo";
import type { DailyData } from "@/utils/api";

interface DaySelectorProps {
  days: (DailyData & { thermalDelta: number; dayIndex: number })[];
  selectedDay: number;
  onSelect: (index: number) => void;
}

export function DaySelector({ days, selectedDay, onSelect }: DaySelectorProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 15 }}>
      {days.map((day, index) => (
        <button key={index} onClick={() => onSelect(index)} style={{
          background: selectedDay === index ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${selectedDay === index ? '#ff6b6b' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10, padding: 10, cursor: "pointer", textAlign: "center", color: "#fff",
          transition: "all 0.3s ease"
        }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
            {day.date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
          <div style={{ fontSize: "1.5rem", marginTop: 2 }}>{getWeatherIcon(day.weatherCode, 1)}</div>
          <div style={{ fontSize: "1rem", color: "#ff6b6b", marginTop: 4 }}>
            {Math.round(day.tempMax)}°/{Math.round(day.tempMin)}°
          </div>
          <div style={{ fontSize: "0.7rem", color: "#888" }}>Δ{day.thermalDelta}°C</div>
        </button>
      ))}
    </div>
  );
}