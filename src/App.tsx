import { useState, useEffect } from "react";
import { launches } from "./data/launches";
import { fetchForecast, HourlyData, DailyData } from "./utils/api";
import { windDegToCardinal, getWeatherIcon, getDayLabel, formatHour } from "./utils/meteoCalculations";

interface SiteForecast {
  launch: typeof launches[0];
  daily: DailyData[];
  score: number;
}

export default function App() {
  const [selectedId, setSelectedId] = useState(launches[0].id);
  const [selectedDay, setSelectedDay] = useState(0);
  const [allData, setAllData] = useState<Map<string, { hourly: HourlyData[]; daily: DailyData[] }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const results = new Map();
      for (const l of launches) {
        if (cancelled) break;
        try {
          results.set(l.id, await fetchForecast(l.lat, l.lon));
        } catch (e) {
          console.warn(l.name, e);
        }
        if (!cancelled) await new Promise(r => setTimeout(r, 80));
      }
      if (!cancelled) { setAllData(results); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const site = launches.find(l => l.id === selectedId)!;
  const currentRaw = allData.get(selectedId);

  function calcScore(lat: number, lon: number): number {
    const d = allData.get(launches.find(l2 => l2.lat === lat && l2.lon === lon)?.id || "");
    if (!d) return 0;
    const central = d.hourly.filter(h => {
      const hour = parseInt(h.time.slice(11, 13));
      return hour >= 10 && hour <= 16 && h.time.startsWith(d.daily[0]?.date || "");
    });
    const windSfc = central.reduce((s, h) => s + h.windSpeed10m, 0) / (central.length || 1);
    const cloud = central.reduce((s, h) => s + h.cloudCover, 0) / (central.length || 1);
    let score = 50;
    if (windSfc >= 8 && windSfc <= 20) score += 20;
    else if (windSfc < 5) score -= 10;
    else if (windSfc > 25) score -= 20;
    if (cloud < 30) score += 10;
    else if (cloud > 70) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  const sortedSites = launches
    .map(l => ({ launch: l, score: calcScore(l.lat, l.lon) }))
    .filter(s => !search || s.launch.name.toLowerCase().includes(search.toLowerCase()) || s.launch.valley.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  function getScoreColor(score: number): string {
    if (score >= 80) return '#00FF8C';
    if (score >= 60) return '#4DA3FF';
    if (score >= 40) return '#FFC857';
    if (score >= 20) return '#FF9F1C';
    return '#FF4E4E';
  }

  function getScoreRating(score: number): string {
    if (score >= 80) return 'Eccellente';
    if (score >= 60) return 'Buono';
    if (score >= 40) return 'Discreto';
    if (score >= 20) return 'Difficile';
    return 'Sconsigliato';
  }

  const currentHourData = currentRaw?.hourly.filter(h => {
    const hour = parseInt(h.time.slice(11, 13));
    return h.time.startsWith(currentRaw.daily[selectedDay]?.date || "") && hour >= 7 && hour <= 20;
  }) || [];

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, sans-serif', background: '#0a0a12', color: '#eee' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>🪁</span>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: 0 }}>ConiglioVolo</h1>
              <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>{launches.length} decolli</p>
            </div>
          </div>
          {!loading && <span style={{ fontSize: '0.75rem', color: '#666' }}>{sortedSites.filter(s => s.score >= 80).length} ottimi</span>}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#00FF8C' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⟳</div>
            <p>Caricamento dati meteo...</p>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
            {/* Sidebar */}
            <div style={{ background: '#111', borderRadius: 12, padding: 12, maxHeight: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cerca..."
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #222',
                  background: '#0d0d0d', color: '#eee', fontSize: '0.8rem', marginBottom: 10, outline: 'none',
                }}
              />
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {sortedSites.map(({ launch: l, score }) => {
                  const color = getScoreColor(score);
                  return (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedId(l.id); setSelectedDay(0); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                        borderRadius: 8, border: `1px solid ${l.id === selectedId ? color + '40' : '#1a1a1a'}`,
                        background: l.id === selectedId ? '#1a1a1a' : 'transparent', cursor: 'pointer',
                        textAlign: 'left', marginBottom: 4, fontSize: '0.8rem',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color, minWidth: 24, fontSize: '0.9rem' }}>{score}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{l.name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#666' }}>{l.valley} · {l.elevation}m</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main */}
            <div>
              {/* Site header */}
              <div style={{ background: '#111', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{site.name}</h2>
                    <p style={{ fontSize: '0.75rem', color: '#666', margin: '2px 0 0' }}>{site.valley} · {site.elevation}m · {site.exposure}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'monospace', color: getScoreColor(calcScore(site.lat, site.lon)) }}>
                      {calcScore(site.lat, site.lon)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: getScoreColor(calcScore(site.lat, site.lon)), fontWeight: 600 }}>
                      {getScoreRating(calcScore(site.lat, site.lon))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Days */}
              {currentRaw && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {currentRaw.daily.map((day, i) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(i)}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: 10,
                        border: `1px solid ${i === selectedDay ? '#00FF8C40' : '#1a1a1a'}`,
                        background: i === selectedDay ? '#00FF8C10' : '#111',
                        cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>{getDayLabel(day.date)}</div>
                      <div style={{ fontSize: '1.2rem', margin: '4px 0' }}>{getWeatherIcon(day.weatherCode, true)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>{Math.round(day.tempMax)}°/{Math.round(day.tempMin)}°</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Hourly grid */}
              {currentHourData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                  {currentHourData.map((h, i) => {
                    const hour = parseInt(h.time.slice(11, 13));
                    const windOk = h.windSpeed10m >= 8 && h.windSpeed10m <= 20;
                    const cloudOk = h.cloudCover < 40;
                    const goodHour = windOk && cloudOk;
                    const borderColor = goodHour ? '#00FF8C' : h.cloudCover > 70 ? '#FF4E4E' : '#FFC857';

                    return (
                      <div key={i} style={{
                        padding: 10, borderRadius: 10,
                        border: `1px solid ${borderColor}30`,
                        background: goodHour ? 'rgba(0,255,140,0.04)' : '#111',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.7rem', color: '#888', marginBottom: 4 }}>{formatHour(hour)}</div>
                        <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{getWeatherIcon(h.weatherCode, h.isDay)}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{Math.round(h.temperature2m)}°C</div>
                        <div style={{ fontSize: '0.65rem', color: '#888', marginTop: 2 }}>
                          Vento: {Math.round(h.windSpeed10m)} km/h {windDegToCardinal(h.windDirection10m)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>
                          Nuvole: {h.cloudCover}%
                        </div>
                        {h.precipitation > 0 && (
                          <div style={{ fontSize: '0.65rem', color: '#4FC3F7', marginTop: 2 }}>🌧 {h.precipitation.toFixed(1)}mm</div>
                        )}
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>
                          CAPE: {Math.round(h.cape)} · LI: {h.liftedIndex.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>
                          Quota: {Math.round(h.windSpeed850hPa)}/{Math.round(h.windSpeed700hPa)} km/h
                        </div>
                        {goodHour && (
                          <div style={{ fontSize: '0.6rem', color: '#00FF8C', fontWeight: 600, marginTop: 4 }}>
                            ✓ Buono per volo
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}