import type { HourlyData } from "@/utils/api";
import { getWeatherIcon, getWindArrow, getWindDirection } from "@/utils/meteo";

interface WindCardProps {
  label: string;
  arrow: string | null;
  speed: number | null;
  dir: string | null;
  gust: number | null;
}

function WindCard({ label, arrow, speed, dir, gust }: WindCardProps) {
  return (
    <div style={{ textAlign: "center", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
      <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>
        {arrow && speed ? `${arrow} ${Math.round(speed)} km/h` : 'N/D'}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{dir || '--'}</div>
      <div style={{ fontSize: "0.65rem", color: "#ff6b6b", marginTop: 2 }}>
        ⚡ {gust ? `${Math.round(gust)} km/h` : '--'}
      </div>
    </div>
  );
}

interface WindAnalysisProps {
  data: HourlyData;
  dayData: HourlyData[] | null;
}

export function WindAnalysis({ data, dayData }: WindAnalysisProps) {
  const hoursRange = Array.from({ length: 11 }, (_, i) => i + 9);

  return (
    <>
      <div style={{
        marginBottom: 15, padding: 15, background: "rgba(0,0,0,0.3)",
        borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <h3 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 10 }}>💨 Vento a differenti quote</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <WindCard label="10 m (superficie)" arrow={getWindArrow(data.windDir)} speed={data.windSpeed} dir={getWindDirection(data.windDir)} gust={data.windGust} />
          <WindCard label="80 m (quota termica)" arrow={data.wind80m ? getWindArrow(data.windDir80m!) : null} speed={data.wind80m} dir={data.wind80m ? getWindDirection(data.windDir80m!) : null} gust={data.wind80m ? data.wind80m * 1.3 : null} />
          <WindCard label="120 m (alta quota)" arrow={data.wind120m ? getWindArrow(data.windDir120m!) : null} speed={data.wind120m} dir={data.wind120m ? getWindDirection(data.windDir120m!) : null} gust={data.wind120m ? data.wind120m * 1.35 : null} />
        </div>
      </div>

      <div style={{
        marginBottom: 15, padding: 15, background: "rgba(0,0,0,0.3)",
        borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <h3 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 10 }}>📊 Vento orario (9:00 - 19:00)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 4, overflowX: "auto" }}>
          {hoursRange.map(hour => {
            const hourData = dayData?.find(h => h.time.getHours() === hour);
            if (!hourData) return null;
            return (
              <div key={hour} style={{ textAlign: "center", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 6, minWidth: 50 }}>
                <div style={{ fontSize: "0.6rem", color: "#888", marginBottom: 2 }}>{String(hour).padStart(2, '0')}:00</div>
                <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#fff" }}>{getWindArrow(hourData.windDir)}</div>
                <div style={{ fontSize: "0.7rem", color: "#fff" }}>{Math.round(hourData.windSpeed)}</div>
                <div style={{ fontSize: "0.55rem", color: "#666" }}>{getWindDirection(hourData.windDir)}</div>
                <div style={{ fontSize: "0.7rem", marginTop: 2 }}>{getWeatherIcon(hourData.weatherCode || 0, hourData.isDay)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
