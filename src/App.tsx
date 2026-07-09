import React, { useEffect, useState, useMemo } from "react";

const DECOLLI = [
  { id: "malanotte", name: "Malanotte", lat: 44.2587, lon: 7.7943, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 3 },
  { id: "colle_di_tenda", name: "Colle di Tenda", lat: 44.1509, lon: 7.5693, exposure: "S", valley: "Valle Roya/Vermenagna", difficulty: 2 },
  { id: "boves", name: "Boves", lat: 44.3211, lon: 7.5447, exposure: "S", valley: "Cuneese", difficulty: 1 },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.4316, lon: 7.3629, exposure: "S", valley: "Valle Maira", difficulty: 3 },
  { id: "iretta", name: "Iretta", lat: 44.4989, lon: 7.3820, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "val_mala", name: "Pratoni di Val Mala", lat: 44.5078, lon: 7.3466, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "birrone", name: "Monte Birrone", lat: 44.5399, lon: 7.2529, exposure: "S", valley: "Valle Maira", difficulty: 4 },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.6828, lon: 6.9782, exposure: "S", valley: "Valle Varaita", difficulty: 5 },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.6386, lon: 7.2309, exposure: "S/SW", valley: "Valle Po", difficulty: 2 },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.6574, lon: 7.2600, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.6069, lon: 7.3832, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "rucas_alto", name: "Rucas alto", lat: 44.7421, lon: 7.2201, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 2 },
  { id: "montoso_basso", name: "Montoso – decollo basso", lat: 44.7644, lon: 7.2498, exposure: "SE", valley: "Valle Infernotto", difficulty: 1 },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.8367, lon: 7.1739, exposure: "S/SE", valley: "Val Pellice", difficulty: 4 },
  { id: "pian_dell_alpe", name: "Pian dell'Alpe", lat: 45.0639, lon: 7.0283, exposure: "S", valley: "Val Chisone", difficulty: 3 },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.9325, lon: 7.3110, exposure: "S", valley: "Pinerolese", difficulty: 1 },
  { id: "piossasco", name: "Piossasco – Monte S. Giorgio", lat: 44.9967, lon: 7.4480, exposure: "S", valley: "Collina Torinese", difficulty: 1 },
  { id: "truccetti", name: "Truccetti", lat: 45.0797, lon: 7.3420, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "val_della_torre", name: "Val della Torre", lat: 45.1626, lon: 7.4637, exposure: "S", valley: "Val della Torre", difficulty: 1 },
  { id: "rocca_canavese", name: "Rocca Canavese – M. della Neve", lat: 45.3276, lon: 7.5728, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4183, lon: 7.6419, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.4402, lon: 7.6480, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.5173, lon: 7.7988, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "andrate", name: "Andrate", lat: 45.5506, lon: 7.8808, exposure: "S", valley: "Canavese", difficulty: 1 },
];

function wi(code: number, day: number) {
  const m: Record<number, string> = { 0: day ? "☀️" : "🌙", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌧️", 55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️", 80: "🌧️", 81: "🌧️", 82: "⛈️", 95: "⛈️", 96: "⛈️", 99: "⛈️" };
  return m[code] || (day ? "☀️" : "🌙");
}

function wd(d: number) { return d != null ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(d / 45) % 8] : "--"; }
function wa(d: number) { return d != null ? ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"][Math.round(d / 45) % 8] : "➡️"; }

function thIdx(temp: number, cloud: number, hum: number, delta: number) {
  let s = 0; if (temp > 22) s += 2; else if (temp > 18) s += 1;
  if (cloud < 30) s += 2; else if (cloud < 50) s += 1;
  if (hum < 50) s += 1; if (delta > 10) s += 2; else if (delta > 6) s += 1;
  if (s >= 6) return { l: "Forte", i: "🔥" }; if (s >= 4) return { l: "Media", i: "💪" }; if (s >= 2) return { l: "Debole", i: "🫤" };
  return { l: "Assente", i: "❄️" };
}

export default function App() {
  const [sel, setSel] = useState(DECOLLI[0].id);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [hour, setHour] = useState(12);

  const site = DECOLLI.find(x => x.id === sel)!;

  useEffect(() => {
    setLoading(true); setErr(null);
    const lat = site.lat, lon = site.lon;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m,wind_speed_80m,wind_direction_80m,wind_speed_120m,wind_direction_120m,uv_index,is_day,weathercode,pressure_msl&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=3`)
      .then(r => r.ok ? r.json() : Promise.reject("HTTP " + r.status))
      .then(d => setData(d))
      .catch(e => { setErr("Errore caricamento meteo"); console.error(e); })
      .finally(() => setLoading(false));
  }, [sel]);

  const parseDay = (offset: number) => {
    if (!data) return null;
    const s = new Date(); s.setDate(s.getDate() + offset); s.setHours(0, 0, 0, 0);
    const e = new Date(s); e.setDate(e.getDate() + 1);
    return data.hourly.time.map((_: string, i: number) => ({
      time: new Date(data.hourly.time[i]), temp: data.hourly.temperature_2m[i],
      dew: data.hourly.dewpoint_2m[i], hum: data.hourly.relativehumidity_2m[i],
      cloud: data.hourly.cloudcover[i], prec: data.hourly.precipitation[i] || 0,
      vis: data.hourly.visibility ? data.hourly.visibility[i] / 1000 : 40,
      wind: data.hourly.wind_speed_10m[i], gust: data.hourly.wind_gusts_10m ? data.hourly.wind_gusts_10m[i] : data.hourly.wind_speed_10m[i] + 8,
      wdir: data.hourly.wind_direction_10m[i], w80: data.hourly.wind_speed_80m?.[i] ?? null,
      wd80: data.hourly.wind_direction_80m?.[i] ?? null, w120: data.hourly.wind_speed_120m?.[i] ?? null,
      wd120: data.hourly.wind_direction_120m?.[i] ?? null, uv: data.hourly.uv_index?.[i] ?? 0,
      isDay: data.hourly.is_day?.[i] ?? 1, wcode: data.hourly.weathercode?.[i] ?? 0, pres: data.hourly.pressure_msl?.[i] ?? 1013,
    })).filter((h: any) => h.time >= s && h.time < e);
  };

  const dayData = parseDay(dayIdx);
  const curr = dayData?.find((h: any) => h.time.getHours() === hour) || dayData?.[0] || null;
  const temps = dayData?.map((h: any) => h.temp).filter((t: any) => t != null) || [];
  const delta = temps.length ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;
  const enriched = data?.daily.time.map((d: string, i: number) => {
    const hh = data.hourly.time.map((_: string, j: number) => ({
      time: new Date(data.hourly.time[j]), temp: data.hourly.temperature_2m[j],
    })).filter((h: any) => h.time.getDate() === new Date(d).getDate() && h.time.getMonth() === new Date(d).getMonth());
    const tt = hh.map((h: any) => h.temp).filter((t: any) => t != null);
    return { date: new Date(d), wcode: data.daily.weathercode[i], tmax: data.daily.temperature_2m_max[i], tmin: data.daily.temperature_2m_min[i], dd: tt.length ? Math.round(Math.max(...tt) - Math.min(...tt)) : 0, i };
  }) || [];

  let ai: any = null;
  if (dayData?.length && site) {
    const at = temps.reduce((a: number, b: number) => a + b, 0) / temps.length;
    const ac = dayData.reduce((s: number, h: any) => s + h.cloud, 0) / dayData.length;
    const ah = dayData.reduce((s: number, h: any) => s + h.hum, 0) / dayData.length;
    const mw = Math.max(...dayData.map((h: any) => h.wind));
    const mg = Math.max(...dayData.map((h: any) => h.gust));
    const hr = dayData.some((h: any) => h.prec > 0.5);
    const tr = dayData.reduce((s: number, h: any) => s + h.prec, 0);
    const ad = dayData.filter((h: any) => h.time.getHours() >= 9 && h.time.getHours() <= 19).reduce((s: number, h: any) => s + h.wind, 0) / Math.max(1, dayData.filter((h: any) => h.time.getHours() >= 9 && h.time.getHours() <= 19).length);
    const dw = dayData.reduce((s: number, h: any) => s + h.dew, 0) / dayData.length;
    const mwd = dayData.reduce((s: number, h: any) => s + h.wdir, 0) / dayData.length;
    const th = thIdx(at, ac, ah, delta);
    ai = {
      general: `🌅 ${site.name}: ${ac < 30 ? "cielo sereno" : ac < 60 ? "cielo variabile" : "cielo nuvoloso"} (${Math.round(at)}°C media). ${mw > 25 ? `⚠️ Raffiche ${Math.round(mw)} km/h` : mw > 15 ? `💨 Vento ${Math.round(mw)} km/h` : `💨 Vento debole ${Math.round(mw)} km/h`}.${hr ? ` 🌧️ ${Math.round(tr)}mm` : " ✅ Nessuna pioggia"}.`,
      thermal: `🔥 ${th.i} ${th.l}\n📊 T media ${Math.round(at)}°C, Δ${delta}°C, nuvole ${Math.round(ac)}%, umidità ${Math.round(ah)}%\n📈 Plafond ~${Math.round(1500 + delta * 80)}m / base nuvole ${Math.round((at - dw) * 120 + 1500)}m`,
      wind: `💨 10m: media ${Math.round(ad)} km/h, max ${Math.round(mw)} km/h, raffiche ${Math.round(mg)} km/h\n📍 ${wd(mwd)} — Esposizione: ${site.exposure}`,
      advice: `${mw > 25 ? "⚠️ VOLO SCONSIGLIATO (vento forte)" : mw > 18 ? "⚠️ Decollo impegnativo" : mw < 5 ? "💨 Attendere brezza" : "✅ Condizioni ideali"}${hr ? "\n🌧️ Pioggia: sconsigliato" : "\n✅ Nessuna pioggia"}${ac > 80 ? "\n☁️ Visibilità ridotta" : ac < 30 ? "\n☀️ Ottima visibilità" : ""}`,
    };
  }

  if (loading) return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0e27", color: "#eee" }}><div style={{ width: 50, height: 50, border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "#ff6b6b", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div><p style={{ marginTop: 20, fontSize: "1.2rem" }}>Caricamento previsioni...</p></div>;
  if (err) return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0a0e27", color: "#eee" }}><p style={{ color: "#ff6b6b", fontSize: "1.2rem", marginBottom: 20 }}>{err}</p><button onClick={() => window.location.reload()} style={{ background: "#ff6b6b", color: "#fff", border: "none", padding: "12px 30px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Riprova</button></div>;

  return (
    <div style={{ background: "#0a0e27", color: "#eee", minHeight: "100vh", padding: 20, fontFamily: "'Segoe UI',Arial,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes float{0%,100%{transform:translateY(0)rotate(-2deg)}50%{transform:translateY(-10px)rotate(2deg)}}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:rgba(255,255,255,.05)}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}`}</style>
      <header style={{ textAlign: "center", marginBottom: 30, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 15, marginBottom: 10 }}>
          <span style={{ fontSize: "2.5rem", animation: "hop 1s ease-in-out infinite" }}>🐰</span>
          <span style={{ fontSize: "2rem", animation: "float 2s ease-in-out infinite" }}>🪂</span>
        </div>
        <h1 style={{ fontSize: "2.2rem", marginBottom: 5, background: "linear-gradient(135deg, #ff6b6b, #ffd93d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 }}>Meteo dei Conigli</h1>
        <p style={{ fontSize: "0.9rem", color: "#888" }}>Previsioni volo libero • Open-Meteo</p>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: 15, borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)", height: "calc(100vh - 200px)", overflow: "hidden" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: 15, color: "#ff6b6b", fontWeight: 600 }}>📍 Decolli</h2>
          <div style={{ overflowY: "auto", height: "calc(100% - 50px)", paddingRight: 5 }}>
            {DECOLLI.map(d => (
              <button key={d.id} onClick={() => { setSel(d.id); setDayIdx(0); setHour(12); }} style={{ width: "100%", textAlign: "left", cursor: "pointer", transition: "all 0.3s ease", background: d.id === sel ? "rgba(255,107,107,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${d.id === sel ? "#ff6b6b" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: 12, marginBottom: 8, color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: "0.95rem", fontWeight: "bold" }}>{d.name}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: "0.75rem", color: "#888" }}>{d.valley}</span><span style={{ fontSize: "0.75rem", color: "#888" }}>{d.exposure}</span></div>
                <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 12, color: "#fff", fontWeight: 600, background: d.difficulty <= 2 ? "#4caf50" : d.difficulty <= 3 ? "#ff9800" : "#f44336" }}>{d.difficulty <= 2 ? "Facile" : d.difficulty <= 3 ? "Medio" : "Difficile"}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 15, border: "1px solid rgba(255,255,255,0.1)", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          {curr && site && <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div><h2 style={{ fontSize: "1.6rem", marginBottom: 5, color: "#fff" }}>{site.name}</h2><span style={{ fontSize: "0.85rem", color: "#888" }}>{site.exposure} • {site.valley}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", padding: "8px 15px", borderRadius: 30 }}><span style={{ fontSize: "2rem" }}>{wi(curr.wcode, curr.isDay)}</span><span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>{Math.round(curr.temp)}°C</span></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 15 }}>
              {enriched.map((day: any, i: number) => (
                <button key={i} onClick={() => { setDayIdx(i); setHour(12); }} style={{ background: dayIdx === i ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${dayIdx === i ? "#ff6b6b" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: 10, cursor: "pointer", textAlign: "center", color: "#fff", transition: "all 0.3s ease" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>{day.date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}</div>
                  <div style={{ fontSize: "1.5rem", marginTop: 2 }}>{wi(day.wcode, 1)}</div>
                  <div style={{ fontSize: "1rem", color: "#ff6b6b", marginTop: 4 }}>{Math.round(day.tmax)}°/{Math.round(day.tmin)}°</div>
                  <div style={{ fontSize: "0.7rem", color: "#888" }}>Δ{day.dd}°C</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 10 }}>
              <label style={{ fontSize: "0.85rem", color: "#888" }}>⏰ Ora:</label>
              <input type="range" min={9} max={19} value={hour} onChange={e => setHour(parseInt(e.target.value))} style={{ flex: 1, accentColor: "#ff6b6b" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#fff", minWidth: 50 }}>{String(hour).padStart(2, "0")}:00</span>
            </div>
            {ai && <div style={{ marginBottom: 20, background: "rgba(0,0,0,0.3)", borderRadius: 12, border: "1px solid rgba(255,107,107,0.2)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", background: "rgba(255,107,107,0.1)", borderBottom: "1px solid rgba(255,107,107,0.2)" }}><span style={{ fontSize: "1.5rem" }}>🤖</span><h3 style={{ fontSize: "1rem", color: "#ff6b6b", margin: 0, fontWeight: 600 }}>Analisi AI della Giornata</h3></div>
              <div style={{ padding: "15px" }}>
                {[{ t: "📋 Panoramica", c: "#4fc3f7", v: ai.general }, { t: "🔥 Termiche", c: "#4fc3f7", v: ai.thermal }, { t: "💨 Vento", c: "#4fc3f7", v: ai.wind }, { t: "💡 Consigli", c: "#ffd93d", v: ai.advice }].map(s => (
                  <div key={s.t} style={{ marginBottom: 12, padding: "10px 15px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                    <h4 style={{ fontSize: "0.95rem", color: s.c, marginBottom: 8, fontWeight: 600 }}>{s.t}</h4>
                    <p style={{ fontSize: "0.85rem", color: "#ddd", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 15 }}>
              {[
                ["🌡️ Temp", `${Math.round(curr.temp)}°C`, `Δ${delta}°C`],
                ["💧 Umidità", `${Math.round(curr.hum)}%`, `Rugiada: ${Math.round(curr.dew)}°C`],
                ["☁️ Nuvole", `${Math.round(curr.cloud)}%`, curr.cloud < 20 ? "Sereno" : curr.cloud < 40 ? "Poco nuv" : curr.cloud < 60 ? "Nuvole" : "Coperto"],
                ["🌧️ Pioggia", curr.prec === 0 ? "Assente" : `${curr.prec}mm`, curr.prec === 0 ? "✅" : "⚠️"],
                ["👁️ Visibilità", `${Math.round(curr.vis)} km`, curr.vis > 20 ? "Ottima" : curr.vis > 10 ? "Buona" : "Limitata"],
                ["☀️ UV", `${Math.round(curr.uv)}`, curr.uv < 3 ? "Basso" : curr.uv < 6 ? "Medio" : "Alto"],
                ["🔥 Termiche", `${thIdx(curr.temp, curr.cloud, curr.hum, delta).i} ${thIdx(curr.temp, curr.cloud, curr.hum, delta).l}`, `Δ${delta}°C`],
                ["💨 Vento", `${wa(curr.wdir)} ${Math.round(curr.wind)} km/h`, `${wd(curr.wdir)} • ${Math.round(curr.gust)} km/h`],
              ].map(([l, v, s]) => (
                <div key={l as string} style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>{v}</div>
                  <div style={{ fontSize: "0.65rem", color: "#666", marginTop: 2 }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 15, padding: 15, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 10 }}>💨 Vento a diverse quote</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { l: "10m (sup)", w: curr.wind, d: curr.wdir, g: curr.gust },
                  { l: "80m (term)", w: curr.w80, d: curr.wd80, g: curr.w80 ? curr.w80 * 1.3 : null },
                  { l: "120m (alta)", w: curr.w120, d: curr.wd120, g: curr.w120 ? curr.w120 * 1.35 : null },
                ].map(c => (
                  <div key={c.l} style={{ textAlign: "center", padding: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
                    <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: 4 }}>{c.l}</div>
                    <div style={{ fontSize: "1rem", fontWeight: "bold", color: "#fff" }}>{c.w != null ? `${wa(c.d!)} ${Math.round(c.w)} km/h` : "N/D"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{c.d != null ? wd(c.d) : "--"}</div>
                    <div style={{ fontSize: "0.65rem", color: "#ff6b6b", marginTop: 2 }}>⚡ {c.g ? `${Math.round(c.g)} km/h` : "--"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: 15, background: "rgba(0,0,0,0.3)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: "0.95rem", color: "#4fc3f7", marginBottom: 10 }}>📊 Vento orario (9-19)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 4, overflowX: "auto" }}>
                {Array.from({ length: 11 }, (_, i) => i + 9).map(h => {
                  const hd = dayData?.find((x: any) => x.time.getHours() === h);
                  if (!hd) return null;
                  return (
                    <div key={h} style={{ textAlign: "center", padding: 6, background: "rgba(255,255,255,0.03)", borderRadius: 6, minWidth: 50 }}>
                      <div style={{ fontSize: "0.6rem", color: "#888", marginBottom: 2 }}>{String(h).padStart(2, "0")}:00</div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#fff" }}>{wa(hd.wdir)}</div>
                      <div style={{ fontSize: "0.7rem", color: "#fff" }}>{Math.round(hd.wind)}</div>
                      <div style={{ fontSize: "0.55rem", color: "#666" }}>{wd(hd.wdir)}</div>
                      <div style={{ fontSize: "0.7rem", marginTop: 2 }}>{wi(hd.wcode, hd.isDay)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>}
        </div>
      </div>
      <footer style={{ textAlign: "center", marginTop: 30, padding: "20px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ fontSize: "0.75rem", color: "#666" }}>Dati Open-Meteo.com • Analisi AI per volo libero</p>
        <p style={{ fontSize: "0.65rem", color: "#444", marginTop: 5 }}>🐰 Vola sicuro! 🪂</p>
      </footer>
    </div>
  );
}
