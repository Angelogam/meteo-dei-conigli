import { useState, useEffect, useMemo } from "react";
import { launches } from "./data/launches";
import { fetchForecast, HourlyData, DailyData } from "./utils/api";
import { windDegToCardinal, getWeatherIcon, getDayLabel, formatHour } from "./utils/meteoCalculations";

export default function App() {
  const [siteData, setSiteData] = useState<Map<string, { hourly: HourlyData[]; daily: DailyData[] }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("malanotte");
  const [dayIdx, setDayIdx] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let dead = false;
    setLoading(true);
    (async () => {
      const m = new Map<string, { hourly: HourlyData[]; daily: DailyData[] }>();
      for (const l of launches) {
        if (dead) break;
        try {
          m.set(l.id, await fetchForecast(l.lat, l.lon));
        } catch (_) {}
        if (!dead) await new Promise(r => setTimeout(r, 50));
      }
      if (!dead) { setSiteData(m); setLoading(false); }
    })();
    return () => { dead = true; };
  }, []);

  const site = launches.find(l => l.id === selectedId)!;
  const raw = siteData.get(selectedId);

  const siteScore = useMemo(() => {
    const entry = siteData.get(selectedId);
    if (!entry || !entry.daily || entry.daily.length === 0) return 0;
    const todayDate = entry.daily[0].date;
    const h = entry.hourly.filter(x => {
      const hr = parseInt(x.time.slice(11, 13), 10);
      return hr >= 10 && hr <= 16 && x.time.slice(0, 10) === todayDate;
    });
    if (h.length === 0) return 0;
    const wind = h.reduce((s, x) => s + x.windSpeed10m, 0) / h.length;
    const cloud = h.reduce((s, x) => s + x.cloudCover, 0) / h.length;
    let s = 50;
    if (wind >= 8 && wind <= 20) s += 20;
    else if (wind < 5) s -= 10;
    else if (wind > 25) s -= 25;
    if (cloud < 30) s += 10;
    else if (cloud > 70) s -= 10;
    return Math.max(0, Math.min(100, s));
  }, [siteData, selectedId]);

  const sorted = useMemo(() => {
    const list = launches.map(l => {
      const entry = siteData.get(l.id);
      let score = 0;
      if (entry && entry.daily && entry.daily.length > 0) {
        const todayDate = entry.daily[0].date;
        const h = entry.hourly.filter(x => {
          const hr = parseInt(x.time.slice(11, 13), 10);
          return hr >= 10 && hr <= 16 && x.time.slice(0, 10) === todayDate;
        });
        if (h.length > 0) {
          const wind = h.reduce((s, x) => s + x.windSpeed10m, 0) / h.length;
          const cloud = h.reduce((s, x) => s + x.cloudCover, 0) / h.length;
          score = 50;
          if (wind >= 8 && wind <= 20) score += 20;
          else if (wind < 5) score -= 10;
          else if (wind > 25) score -= 25;
          if (cloud < 30) score += 10;
          else if (cloud > 70) score -= 10;
          score = Math.max(0, Math.min(100, score));
        }
      }
      return { l, score };
    });
    if (!search) return list.sort((a, b) => b.score - a.score);
    const q = search.toLowerCase();
    return list.filter(x => x.l.name.toLowerCase().includes(q) || x.l.valley.toLowerCase().includes(q)).sort((a, b) => b.score - a.score);
  }, [siteData, search]);

  const siteScoreValue = sorted.find(s => s.l.id === selectedId)?.score ?? 0;
  const siteColor = siteScoreValue >= 80 ? '#00FF8C' : siteScoreValue >= 60 ? '#4DA3FF' : siteScoreValue >= 40 ? '#FFC857' : siteScoreValue >= 20 ? '#FF9F1C' : '#FF4E4E';
  const siteRating = siteScoreValue >= 80 ? 'Eccellente' : siteScoreValue >= 60 ? 'Buono' : siteScoreValue >= 40 ? 'Discreto' : siteScoreValue >= 20 ? 'Difficile' : 'Sconsigliato';

  const currentDaily = raw?.daily?.length ? raw.daily[Math.min(dayIdx, raw.daily.length - 1)] : null;
  const currentDate = currentDaily ? currentDaily.date : "";
  const currentHours = (raw?.hourly || []).filter(x => {
    const hr = parseInt(x.time.slice(11, 13), 10);
    return x.time.slice(0, 10) === currentDate && hr >= 7 && hr <= 20;
  });

  return (
    <div style={{ background: '#0a0a12', minHeight: '100vh', color: '#eee', fontFamily: 'system-ui,sans-serif', padding: 16 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.5rem' }}>🪁</span>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: 0 }}>ConiglioVolo</h1>
          </div>
          {!loading && <span style={{ fontSize: '0.75rem', color: '#666' }}>{sorted.filter(s => s.score >= 80).length} ottimi</span>}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#00FF8C' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⟳</div>
            <p>Caricamento dati Open-Meteo...</p>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
            <div style={{ background: '#111', borderRadius: 12, padding: 12, maxHeight: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cerca decollo..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #222', background: '#0d0d0d', color: '#eee', fontSize: '0.8rem', marginBottom: 10, outline: 'none' }}
              />
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {sorted.map(({ l, score }) => {
                  const c = score >= 80 ? '#00FF8C' : score >= 60 ? '#4DA3FF' : score >= 40 ? '#FFC857' : score >= 20 ? '#FF9F1C' : '#FF4E4E';
                  return (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedId(l.id); setDayIdx(0); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                        padding: '8px 10px', borderRadius: 8,
                        border: `1px solid ${l.id === selectedId ? c + '40' : '#1a1a1a'}`,
                        background: l.id === selectedId ? '#1a1a1a' : 'transparent',
                        cursor: 'pointer', textAlign: 'left', marginBottom: 4, fontSize: '0.8rem',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: c, minWidth: 24, fontSize: '0.9rem' }}>{score}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{l.name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#666' }}>{l.valley} · {l.elevation}m</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ background: '#111', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{site.name}</h2>
                    <p style={{ fontSize: '0.75rem', color: '#666', margin: '2px 0 0' }}>{site.valley} · {site.elevation}m · {site.exposure}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'monospace', color: siteColor }}>{siteScoreValue}</div>
                    <div style={{ fontSize: '0.65rem', color: siteColor, fontWeight: 600 }}>{siteRating}</div>
                  </div>
                </div>
              </div>

              {raw && raw.daily && raw.daily.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {raw.daily.map((d, i) => (
                    <button
                      key={d.date}
                      onClick={() => setDayIdx(i)}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: 10,
                        border: `1px solid ${i === dayIdx ? '#00FF8C40' : '#1a1a1a'}`,
                        background: i === dayIdx ? '#00FF8C10' : '#111',
                        cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>{getDayLabel(d.date)}</div>
                      <div style={{ fontSize: '1.2rem', margin: '4px 0' }}>{getWeatherIcon(d.weatherCode, true)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>{Math.round(d.tempMax)}°/{Math.round(d.tempMin)}°</div>
                    </button>
                  ))}
                </div>
              )}

              {currentHours.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                  {currentHours.map((h, i) => {
                    const hr = parseInt(h.time.slice(11, 13), 10);
                    const good = h.windSpeed10m >= 8 && h.windSpeed10m <= 20 && h.cloudCover < 40;
                    const bad = h.windSpeed10m > 25 || h.cloudCover > 80;
                    const border = good ? '#00FF8C' : bad ? '#FF4E4E' : '#FFC857';
                    return (
                      <div key={i} style={{ padding: 10, borderRadius: 10, border: `1px solid ${border}30`, background: good ? 'rgba(0,255,140,0.04)' : '#111' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.7rem', color: '#888', marginBottom: 4 }}>{formatHour(hr)}</div>
                        <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{getWeatherIcon(h.weatherCode, h.isDay)}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{Math.round(h.temperature2m)}°C</div>
                        <div style={{ fontSize: '0.65rem', color: '#888', marginTop: 2 }}>Vento: {Math.round(h.windSpeed10m)} km/h {windDegToCardinal(h.windDirection10m)}</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>Raffiche: {Math.round(h.windGusts10m)} km/h</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>Nuvole: {h.cloudCover}%</div>
                        {h.precipitation > 0 && <div style={{ fontSize: '0.65rem', color: '#4FC3F7' }}>🌧 {h.precipitation.toFixed(1)}mm</div>}
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>CAPE: {Math.round(h.cape)}</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>LI: {h.liftedIndex.toFixed(1)}</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>850hPa: {Math.round(h.windSpeed850hPa)} km/h</div>
                        <div style={{ fontSize: '0.65rem', color: '#888' }}>700hPa: {Math.round(h.windSpeed700hPa)} km/h</div>
                        {good && <div style={{ fontSize: '0.6rem', color: '#00FF8C', fontWeight: 600, marginTop: 4 }}>✓ Buono</div>}
                        {bad && <div style={{ fontSize: '0.6rem', color: '#FF4E4E', fontWeight: 600, marginTop: 4 }}>✗ Sconsigliato</div>}
                      </div>
                    );
                  })}
                </div>
              )}

              {!loading && currentHours.length === 0 && (
                <div style={{ color: '#666', textAlign: 'center', padding: 40, fontSize: '0.85rem' }}>
                  Nessun dato orario disponibile per {currentDaily?.date || "oggi"}.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}