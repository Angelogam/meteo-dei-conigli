import { useState, useEffect, useMemo } from "react";
import { launches } from "./data/launches";
import { fetchForecast, HourlyData, DailyData } from "./utils/api";
import {
  windDegToCardinal, windDegToArrow,
  getWeatherIcon, getCloudDescription,
  estimateThermals, estimateFlightScore, estimatePlafond,
  getDayLabel, formatHour, windColor,
} from "./utils/meteoCalculations";
import {
  Wind, Thermometer, Cloud, CloudRain, Eye, Sun, AlertTriangle,
  Search, Loader2, Info, MapPin,
  ArrowUpRight, Clock, Gauge, Droplets,
  Mountain,
} from "lucide-react";

interface ProcessedDay {
  date: string;
  daily: DailyData;
  hours: HourlyData[];
  flightScore: { score: number; rating: string; color: string; issues: string[] };
  thermals: { strength: number; category: string; quality: number };
}

export default function App() {
  const [selectedId, setSelectedId] = useState(launches[0].id);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(13);
  const [rawData, setRawData] = useState<Map<string, { hourly: HourlyData[]; daily: DailyData[] }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const site = launches.find(l => l.id === selectedId)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const results = new Map<string, { hourly: HourlyData[]; daily: DailyData[] }>();
      for (const l of launches) {
        if (cancelled) break;
        try {
          const data = await fetchForecast(l.lat, l.lon);
          results.set(l.id, data);
        } catch (e) {
          console.warn(`Failed to fetch ${l.name}:`, e);
        }
        if (!cancelled) await new Promise(r => setTimeout(r, 100));
      }
      if (!cancelled) {
        setRawData(results);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const processedDays: ProcessedDay[] = useMemo(() => {
    const d = rawData.get(selectedId);
    if (!d) return [];

    return d.daily.map((daily) => {
      const dayHours = d.hourly.filter(h => h.time.startsWith(daily.date));
      const central = dayHours.filter(h => {
        const hour = parseInt(h.time.slice(11, 13));
        return hour >= 9 && hour <= 18;
      });

      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const windSfc = avg(central.map(h => h.windSpeed10m));
      const wind2500 = avg(central.map(h => h.windSpeed700hPa ?? h.windSpeed10m * 2));
      const cloud = avg(central.map(h => h.cloudCover));
      const precip = central.reduce((s, h) => s + h.precipitation, 0) / central.length;
      const vis = avg(central.map(h => h.visibility));
      const li = avg(central.map(h => h.liftedIndex));
      const cape = avg(central.map(h => h.cape));
      const gust = avg(central.map(h => h.windGusts10m));

      const noon = central.find(h => parseInt(h.time.slice(11, 13)) === 13) || central[Math.floor(central.length / 2)];
      const thermals = noon ? estimateThermals(
        noon.temperature2m,
        noon.temperature850hPa,
        noon.relativeHumidity2m,
        noon.cloudCover,
        noon.windSpeed850hPa,
        noon.cape,
        noon.liftedIndex,
      ) : { strength: 0, category: "N/D", quality: 1 };

      const flightScore = estimateFlightScore({
        windSurface: windSfc,
        windGust: gust,
        wind2500,
        cloudCover: cloud,
        precipitation: precip,
        thermalQuality: thermals.quality,
        visibility: vis,
        liftedIndex: li,
        cape,
      });

      return { date: daily.date, daily, hours: dayHours, flightScore, thermals };
    });
  }, [rawData, selectedId]);

  const currentDay = processedDays[selectedDay];
  const currentHourData = currentDay?.hours.find(h => parseInt(h.time.slice(11, 13)) === selectedHour) || currentDay?.hours[Math.floor((currentDay?.hours.length || 0) / 2)];

  const sortedSites = useMemo(() => {
    return launches.map(l => {
      const d = rawData.get(l.id);
      if (!d) return { launch: l, score: 0, thermals: 0, rating: "N/D" };
      const todayHours = d.hourly.filter(h => h.time.startsWith(d.daily[0]?.date || ''));
      const central = todayHours.filter(h => {
        const hour = parseInt(h.time.slice(11, 13));
        return hour >= 10 && hour <= 16;
      });
      const windSfc = central.length > 0 ? central.reduce((s, h) => s + h.windSpeed10m, 0) / central.length : 10;
      const cloud = central.length > 0 ? central.reduce((s, h) => s + h.cloudCover, 0) / central.length : 50;
      const score = estimateFlightScore({
        windSurface: windSfc, windGust: windSfc * 1.4, wind2500: windSfc * 1.8,
        cloudCover: cloud, precipitation: 0, thermalQuality: 3,
        visibility: 30, liftedIndex: 0, cape: 200,
      });
      return { launch: l, score: score.score, rating: score.rating };
    })
    .filter(s => !search || s.launch.name.toLowerCase().includes(search.toLowerCase()) || s.launch.valley.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.score - a.score);
  }, [rawData, search]);

  const windProfile = useMemo(() => {
    if (!currentHourData) return [];
    const base = site.elevation;
    const levels = [
      { alt: base, speed: currentHourData.windSpeed10m, dir: currentHourData.windDirection10m },
      { alt: base + 80, speed: currentHourData.windSpeed10m * 1.2, dir: currentHourData.windDirection10m + 5 },
      { alt: 1500, speed: currentHourData.windSpeed850hPa || currentHourData.windSpeed10m * 1.6, dir: currentHourData.windDirection850hPa || currentHourData.windDirection10m + 10 },
      { alt: 2500, speed: currentHourData.windSpeed700hPa || currentHourData.windSpeed10m * 2.1, dir: currentHourData.windDirection700hPa || currentHourData.windDirection10m + 20 },
      { alt: 3500, speed: currentHourData.windSpeed500hPa || currentHourData.windSpeed10m * 2.6, dir: currentHourData.windDirection500hPa || currentHourData.windDirection10m + 30 },
    ];
    return levels;
  }, [currentHourData, site.elevation]);

  const maxWind = Math.max(...windProfile.map(w => w.speed), 30);

  return (
    <div style={{ minHeight: '100vh', maxWidth: 1400, margin: '0 auto', padding: '16px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #00FF8C20, #00FF8C08)', border: '1px solid #00FF8C25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🪁</div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Coniglio<span style={{ color: '#00FF8C' }}>Volo</span></h1>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Previsioni per volo libero · {launches.length} decolli</p>
          </div>
        </div>
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF8C', display: 'inline-block' }} />
            Ottimi: {sortedSites.filter(s => s.rating === 'Eccellente').length}
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            Dati reali Open-Meteo
          </div>
        )}
      </header>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <Loader2 size={36} color="#00FF8C" className="animate-spin" />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Caricamento dati meteo da Open-Meteo...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,78,78,0.1)', border: '1px solid rgba(255,78,78,0.25)', color: '#FF4E4E', fontSize: '0.85rem', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14, maxHeight: 'calc(100vh - 140px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
              <Search size={14} color="rgba(255,255,255,0.3)" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca decollo..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', width: '100%', fontFamily: 'inherit' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sortedSites.map(({ launch: l, score, rating }) => {
                const color = score >= 80 ? '#00FF8C' : score >= 60 ? '#4DA3FF' : score >= 40 ? '#FFC857' : score >= 20 ? '#FF9F1C' : '#FF4E4E';
                return (
                  <button key={l.id} onClick={() => { setSelectedId(l.id); setSelectedDay(0); setSelectedHour(13); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: `1px solid ${l.id === selectedId ? 'rgba(0,255,140,0.25)' : 'rgba(255,255,255,0.04)'}`, background: l.id === selectedId ? 'rgba(0,255,140,<dyad-write path="src/App.tsx">
import { useState, useEffect, useMemo } from "react";
import { launches } from "./data/launches";
import { fetchForecast, HourlyData, DailyData } from "./utils/api";
import {
  windDegToCardinal, windDegToArrow,
  getWeatherIcon, getCloudDescription,
  estimateThermals, estimateFlightScore, estimatePlafond,
  getDayLabel, formatHour, windColor,
} from "./utils/meteoCalculations";
import {
  Wind, Thermometer, Cloud, CloudRain, Eye, Sun, AlertTriangle,
  Search, Loader2, Info, MapPin,
  ArrowUpRight, Clock, Gauge, Droplets,
  Mountain,
} from "lucide-react";

interface ProcessedDay {
  date: string;
  daily: DailyData;
  hours: HourlyData[];
  flightScore: { score: number; rating: string; color: string; issues: string[] };
  thermals: { strength: number; category: string; quality: number };
}

export default function App() {
  const [selectedId, setSelectedId] = useState(launches[0].id);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(13);
  const [rawData, setRawData] = useState<Map<string, { hourly: HourlyData[]; daily: DailyData[] }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const site = launches.find(l => l.id === selectedId)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const results = new Map<string, { hourly: HourlyData[]; daily: DailyData[] }>();
      for (const l of launches) {
        if (cancelled) break;
        try {
          const data = await fetchForecast(l.lat, l.lon);
          results.set(l.id, data);
        } catch (e) {
          console.warn(`Failed to fetch ${l.name}:`, e);
        }
        if (!cancelled) await new Promise(r => setTimeout(r, 100));
      }
      if (!cancelled) {
        setRawData(results);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const processedDays: ProcessedDay[] = useMemo(() => {
    const d = rawData.get(selectedId);
    if (!d) return [];

    return d.daily.map((daily) => {
      const dayHours = d.hourly.filter(h => h.time.startsWith(daily.date));
      const central = dayHours.filter(h => {
        const hour = parseInt(h.time.slice(11, 13));
        return hour >= 9 && hour <= 18;
      });

      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const windSfc = avg(central.map(h => h.windSpeed10m));
      const wind2500 = avg(central.map(h => h.windSpeed700hPa ?? h.windSpeed10m * 2));
      const cloud = avg(central.map(h => h.cloudCover));
      const precip = central.reduce((s, h) => s + h.precipitation, 0) / central.length;
      const vis = avg(central.map(h => h.visibility));
      const li = avg(central.map(h => h.liftedIndex));
      const cape = avg(central.map(h => h.cape));
      const gust = avg(central.map(h => h.windGusts10m));

      const noon = central.find(h => parseInt(h.time.slice(11, 13)) === 13) || central[Math.floor(central.length / 2)];
      const thermals = noon ? estimateThermals(
        noon.temperature2m,
        noon.temperature850hPa,
        noon.relativeHumidity2m,
        noon.cloudCover,
        noon.windSpeed850hPa,
        noon.cape,
        noon.liftedIndex,
      ) : { strength: 0, category: "N/D", quality: 1 };

      const flightScore = estimateFlightScore({
        windSurface: windSfc,
        windGust: gust,
        wind2500,
        cloudCover: cloud,
        precipitation: precip,
        thermalQuality: thermals.quality,
        visibility: vis,
        liftedIndex: li,
        cape,
      });

      return { date: daily.date, daily, hours: dayHours, flightScore, thermals };
    });
  }, [rawData, selectedId]);

  const currentDay = processedDays[selectedDay];
  const currentHourData = currentDay?.hours.find(h => parseInt(h.time.slice(11, 13)) === selectedHour) || currentDay?.hours[Math.floor((currentDay?.hours.length || 0) / 2)];

  const sortedSites = useMemo(() => {
    return launches.map(l => {
      const d = rawData.get(l.id);
      if (!d) return { launch: l, score: 0, rating: "N/D" };
      const todayHours = d.hourly.filter(h => h.time.startsWith(d.daily[0]?.date || ''));
      const central = todayHours.filter(h => {
        const hour = parseInt(h.time.slice(11, 13));
        return hour >= 10 && hour <= 16;
      });
      const windSfc = central.length > 0 ? central.reduce((s, h) => s + h.windSpeed10m, 0) / central.length : 10;
      const cloud = central.length > 0 ? central.reduce((s, h) => s + h.cloudCover, 0) / central.length : 50;
      const score = estimateFlightScore({
        windSurface: windSfc, windGust: windSfc * 1.4, wind2500: windSfc * 1.8,
        cloudCover: cloud, precipitation: 0, thermalQuality: 3,
        visibility: 30, liftedIndex: 0, cape: 200,
      });
      return { launch: l, score: score.score, rating: score.rating };
    })
    .filter(s => !search || s.launch.name.toLowerCase().includes(search.toLowerCase()) || s.launch.valley.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.score - a.score);
  }, [rawData, search]);

  const windProfile = useMemo(() => {
    if (!currentHourData) return [];
    const base = site.elevation;
    const levels = [
      { alt: base, speed: currentHourData.windSpeed10m, dir: currentHourData.windDirection10m },
      { alt: base + 80, speed: currentHourData.windSpeed10m * 1.2, dir: currentHourData.windDirection10m + 5 },
      { alt: 1500, speed: currentHourData.windSpeed850hPa || currentHourData.windSpeed10m * 1.6, dir: currentHourData.windDirection850hPa || currentHourData.windDirection10m + 10 },
      { alt: 2500, speed: currentHourData.windSpeed700hPa || currentHourData.windSpeed10m * 2.1, dir: currentHourData.windDirection700hPa || currentHourData.windDirection10m + 20 },
      { alt: 3500, speed: currentHourData.windSpeed500hPa || currentHourData.windSpeed10m * 2.6, dir: currentHourData.windDirection500hPa || currentHourData.windDirection10m + 30 },
    ];
    return levels;
  }, [currentHourData, site.elevation]);

  const maxWind = Math.max(...windProfile.map(w => w.speed), 30);

  return (
    <div style={{ minHeight: '100vh', maxWidth: 1400, margin: '0 auto', padding: '16px', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #00FF8C20, #00FF8C08)', border: '1px solid #00FF8C25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🪁</div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>Coniglio<span style={{ color: '#00FF8C' }}>Volo</span></h1>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>Previsioni per volo libero · {launches.length} decolli</p>
          </div>
        </div>
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF8C', display: 'inline-block' }} />
            Ottimi: {sortedSites.filter(s => s.rating === 'Eccellente').length}
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
            Dati reali Open-Meteo
          </div>
        )}
      </header>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
          <Loader2 size={36} color="#00FF8C" className="animate-spin" />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Caricamento dati meteo da Open-Meteo...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(255,78,78,0.1)', border: '1px solid rgba(255,78,78,0.25)', color: '#FF4E4E', fontSize: '0.85rem', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14, maxHeight: 'calc(100vh - 140px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
              <Search size={14} color="rgba(255,255,255,0.3)" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca decollo..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', width: '100%', fontFamily: 'inherit' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sortedSites.map(({ launch: l, score, rating }) => {
                const color = score >= 80 ? '#00FF8C' : score >= 60 ? '#4DA3FF' : score >= 40 ? '#FFC857' : score >= 20 ? '#FF9F1C' : '#FF4E4E';
                return (
                  <button key={l.id} onClick={() => { setSelectedId(l.id); setSelectedDay(0); setSelectedHour(13); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: `1px solid ${l.id === selectedId ? 'rgba(0,255,140,0.25)' : 'rgba(255,255,255,0.04)'}`, background: l.id === selectedId ? 'rgba(0,255,140,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace', background: `${color}15`, color, border: `1px solid ${color}25`, flexShrink: 0 }}>{score}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{l.valley} · {l.elevation}m</div>
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color, whiteSpace: 'nowrap' }}>{rating}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', paddingRight: 4 }}>
            {currentDay && currentHourData && (
              <>
                <div style={{ background: `linear-gradient(135deg, ${currentDay.flightScore.color}08, transparent 60%)`, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: 0 }}>{site.name}</h2>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${currentDay.flightScore.color}20`, color: currentDay.flightScore.color }}>{currentDay.flightScore.rating}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}><MapPin size={10} style={{ display: 'inline', marginRight: 4 }} />{site.valley} · {site.elevation}m · {site.exposure}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${currentDay.flightScore.color}15`, border: `2px solid ${currentDay.flightScore.color}30` }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'monospace', color: currentDay.flightScore.color }}>{currentDay.flightScore.score}</span>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: currentDay.flightScore.color, fontWeight: 600, display: 'block', marginTop: 4 }}>{currentDay.flightScore.rating.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {processedDays.map((day, i) => (
                    <button key={day.date} onClick={() => { setSelectedDay(i); setSelectedHour(13); }} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: `1px solid ${i === selectedDay ? `${day.flightScore.color}50` : 'rgba(255,255,255,0.06)'}`, background: i === selectedDay ? `${day.flightScore.color}10` : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{getDayLabel(day.date)}</div>
                      <div style={{ fontSize: '1.2rem', margin: '2px 0' }}>{getWeatherIcon(day.daily.weatherCode, true)}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>{Math.round(day.daily.tempMax)}°/{Math.round(day.daily.tempMin)}°</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', color: day.flightScore.color, marginTop: 2 }}>{day.flightScore.score}</div>
                    </button>
                  ))}
                </div>

                {currentDay.flightScore.issues.length > 0 && (
                  <div style={{ padding: '10px 14px', borderRadius: 12, marginBottom: 14, background: 'rgba(255,200,87,0.06)', border: '1px solid rgba(255,200,87,0.2)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <AlertTriangle size={12} color="#FFC857" style={{ flexShrink: 0, marginTop: 2 }} />
                    {currentDay.flightScore.issues.map((issue, i) => (
                      <span key={i} style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(255,200,87,0.1)', color: '#FFC857', fontSize: '0.65rem', fontWeight: 500 }}>{issue}</span>
                    ))}
                  </div>
                )}

                <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Clock size={14} color="rgba(255,255,255,0.3)" />
                    <input type="range" min={7} max={20} value={selectedHour} onChange={e => setSelectedHour(parseInt(e.target.value))} style={{ flex: 1 }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', fontFamily: 'monospace', minWidth: 45 }}>{formatHour(selectedHour)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
                    {Array.from({ length: 14 }, (_, i) => i + 7).map(h => {
                      const hData = currentDay.hours.find(hh => parseInt(hh.time.slice(11, 13)) === h);
                      if (!hData) return null;
                      const isActive = h === selectedHour;
                      const thermal = estimateThermals(hData.temperature2m, hData.temperature850hPa, hData.relativeHumidity2m, hData.cloudCover, hData.windSpeed850hPa, hData.cape, hData.liftedIndex);
                      const c = thermal.quality >= 4 ? '#00FF8C' : thermal.quality >= 3 ? '#FFC857' : '#FF4E4E';
                      return (
                        <button key={h} onClick={() => setSelectedHour(h)} style={{ flex: 1, padding: '4px 0', borderRadius: 6, textAlign: 'center', border: `1px solid ${isActive ? `${c}50` : 'transparent'}`, background: isActive ? `${c}15` : 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)' }}>{h}:00</div>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, fontFamily: 'monospace', color: isActive ? '#fff' : 'rgba(255,255,255,0.5)' }}>{thermal.quality}</div>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', margin: '2px auto 0', background: c }} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginBottom: 14 }}>
                  {[
                    { icon: <Thermometer size={14} color="#FF6B6B" />, label: 'Temperatura', value: `${Math.round(currentHourData.temperature2m)}°C`, sub: `Percepita: ${Math.round(currentHourData.temperature2m - 2)}°C` },
                    { icon: <Droplets size={14} color="#4DA3FF" />, label: 'Umidità', value: `${Math.round(currentHourData.relativeHumidity2m)}%`, sub: `Rugiada: ${Math.round(currentHourData.dewPoint2m)}°C` },
                    { icon: <Wind size={14} color="#66BB6A" />, label: 'Vento suolo', value: `${Math.round(currentHourData.windSpeed10m)} km/h`, sub: `${windDegToCardinal(currentHourData.windDirection10m)} · Raffiche ${Math.round(currentHourData.windGusts10m)} km/h` },
                    { icon: <Cloud size={14} color="#90A4AE" />, label: 'Nuvolosità', value: getCloudDescription(currentHourData.cloudCover), sub: `${Math.round(currentHourData.cloudCover)}% copertura` },
                    { icon: <CloudRain size={14} color="#4FC3F7" />, label: 'Precipitazioni', value: currentHourData.precipitation === 0 ? 'Assenti' : `${currentHourData.precipitation.toFixed(1)} mm`, sub: `Prob: ${Math.round(currentDay.daily.precipitationProbabilityMax)}%` },
                    { icon: <Sun size={14} color="#FFD93D" />, label: 'UV Index', value: `${Math.round(currentDay.daily.uvIndexMax)}`, sub: currentDay.daily.uvIndexMax < 3 ? 'Basso' : currentDay.daily.uvIndexMax < 6 ? 'Medio' : 'Alto' },
                    { icon: <Eye size={14} color="#B0BEC5" />, label: 'Visibilità', value: `${Math.round(currentHourData.visibility)} km`, sub: currentHourData.visibility > 20 ? 'Ottima' : currentHourData.visibility > 10 ? 'Buona' : 'Limitata' },
                    { icon: <ArrowUpRight size={14} color="#FF9F1C" />, label: 'Termiche', value: `${currentDay.thermals.strength} m/s`, sub: currentDay.thermals.category },
                    { icon: <Gauge size={14} color="#CE93D8" />, label: 'CAPE', value: `${Math.round(currentHourData.cape)} J/kg`, sub: `L.I.: ${currentHourData.liftedIndex.toFixed(1)}` },
                    { icon: <Mountain size={14} color="#A1887F" />, label: 'Plafond', value: `${estimatePlafond(currentHourData.temperature2m, currentHourData.dewPoint2m, currentHourData.cloudCover, site.elevation)} m`, sub: `Base: ${site.elevation}m` },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>{m.icon}<span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span></div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{m.value}</div>
                      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 14, marginBottom: 14, background: 'rgba(79,195,247,0.03)', border: '1px solid rgba(79,195,247,0.1)' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4FC3F7', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}><Wind size={14} /> Profilo vento</h3>
                  {windProfile.map((level, i) => {
                    const pct = (level.speed / maxWind) * 100;
                    const color = windColor(level.speed);
                    return (
                      <div key={level.alt} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 60, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right', flexShrink: 0 }}>{level.alt >= 1000 ? `${(level.alt / 1000).toFixed(1)} km` : `${level.alt} m`}</div>
                        <div style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0 }}>{windDegToArrow(level.dir)}</div>
                        <div style={{ flex: 1, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ height: '100%', borderRadius: 11, width: `${pct}%`, background: `linear-gradient(90deg, ${color}CC, ${color}88)`, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', opacity: pct > 25 ? 1 : 0 }}>{windDegToCardinal(level.dir)}</span>
                          </div>
                        </div>
                        <div style={{ width: 50, textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace', color, flexShrink: 0 }}>{level.speed} km/h</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: '14px 16px', borderRadius: 14, marginBottom: 14, background: 'linear-gradient(135deg, rgba(0,255,140,0.04), rgba(77,163,255,0.04))', border: '1px solid rgba(0,255,140,0.1)' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#00FF8C', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}><Info size={14} /> Consigli di volo</h3>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                    <li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Orario migliore:</strong> {currentDay.thermals.quality >= 4 ? '11:00–15:00 (picco termico)' : currentDay.thermals.quality >= 3 ? '12:00–15:00' : '13:00–15:00'}</li>
                    <li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Vento:</strong> {currentHourData.windSpeed10m < 5 ? 'Molto debole, porta aiuto per decollare' : currentHourData.windSpeed10m < 12 ? 'Ideale per veleggiare' : currentHourData.windSpeed10m < 20 ? 'Gestibile con esperienza' : 'Forte, valuta attentamente'}</li>
                    <li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Termiche:</strong> {currentDay.thermals.category} ({currentDay.thermals.strength} m/s) — {currentDay.thermals.quality >= 4 ? 'ottime per cross country' : currentDay.thermals.quality >= 3 ? 'buone per volo locale' : 'deboli, meglio stare bassi'}</li>
                    <li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Vento in quota:</strong> {windProfile.find(w => w.alt >= 2500)?.speed > 30 ? 'veloce sopra 2500m, limita la quota' : 'gestibile, puoi salire tranquillo'}</li>
                    <li><strong style={{ color: 'rgba(255,255,255,0.8)' }}>Rischio:</strong> {currentDay.flightScore.rating === 'Eccellente' ? 'basso, giornata perfetta' : currentDay.flightScore.rating === 'Buono' ? 'medio-basso, vola con tranquillità' : currentDay.flightScore.rating === 'Discreto' ? 'medio, valuta bene le condizioni' : 'alto, meglio rimandare'}</li>
                  </ul>
                </div>

                <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>Dati: Open-Meteo · Aggiornamento ogni ora · Altitudini interpolate</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}