import type { Launch } from "../data/launches";

/* ── Interfacce ── */

export interface HourlyData {
  time: Date;
  temperature: number;
  dewPoint: number;
  humidity: number;
  cloudCover: number;
  precipitation: number;
  visibility: number;
  windSpeed: number;
  windGust: number;
  windDir: number;
  wind80m: number | null;
  windDir80m: number | null;
  wind120m: number | null;
  windDir120m: number | null;
  uvIndex: number;
  isDay: number;
}

export interface DailyData {
  date: Date;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  sunrise: Date;
  sunset: Date;
  uvMax: number;
  precipitationSum: number;
  precipitationHours: number;
  windMax: number;
  windDirDominant: number;
  thermalDelta: number;
}

export interface MeteoResponse {
  hourly: HourlyData[];
  daily: DailyData[];
}

/* ── Fetch ── */

export async function fetchMeteo(lat: number, lng: number): Promise<MeteoResponse> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,` +
    `wind_speed_10m,wind_gusts_10m,wind_direction_10m,` +
    `wind_speed_80m,wind_direction_80m,wind_speed_120m,wind_direction_120m,` +
    `uv_index,is_day,weathercode` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,` +
    `uv_index_max,precipitation_sum,precipitation_hours,` +
    `wind_speed_10m_max,wind_direction_10m_dominant` +
    `&timezone=auto&forecast_days=3`;

  const res = await fetch(url);
  const data = await res.json();

  const hourly: HourlyData[] = data.hourly.time.map((time: string, i: number) => ({
    time: new Date(time),
    temperature: data.hourly.temperature_2m[i],
    dewPoint: data.hourly.dewpoint_2m[i],
    humidity: data.hourly.relativehumidity_2m[i],
    cloudCover: data.hourly.cloudcover[i],
    precipitation: data.hourly.precipitation[i] || 0,
    visibility: data.hourly.visibility ? data.hourly.visibility[i] / 1000 : 40,
    windSpeed: data.hourly.wind_speed_10m[i],
    windGust: data.hourly.wind_gusts_10m ? data.hourly.wind_gusts_10m[i] : data.hourly.wind_speed_10m[i] + 8,
    windDir: data.hourly.wind_direction_10m[i],
    wind80m: data.hourly.wind_speed_80m ? data.hourly.wind_speed_80m[i] : null,
    windDir80m: data.hourly.wind_direction_80m ? data.hourly.wind_direction_80m[i] : null,
    wind120m: data.hourly.wind_speed_120m ? data.hourly.wind_speed_120m[i] : null,
    windDir120m: data.hourly.wind_direction_120m ? data.hourly.wind_direction_120m[i] : null,
    uvIndex: data.hourly.uv_index ? data.hourly.uv_index[i] : 0,
    isDay: data.hourly.is_day ? data.hourly.is_day[i] : 1,
  }));

  const daily: DailyData[] = data.daily.time.map((date: string, i: number) => {
    const dayHours = hourly.filter(h =>
      h.time.getDate() === new Date(date).getDate() &&
      h.time.getMonth() === new Date(date).getMonth()
    );
    const temps = dayHours.map(h => h.temperature).filter((t): t is number => t != null);
    const delta = temps.length > 0 ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;

    return {
      date: new Date(date),
      weatherCode: data.daily.weathercode[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      sunrise: new Date(data.daily.sunrise[i]),
      sunset: new Date(data.daily.sunset[i]),
      uvMax: data.daily.uv_index_max[i],
      precipitationSum: data.daily.precipitation_sum[i],
      precipitationHours: data.daily.precipitation_hours[i],
      windMax: data.daily.wind_speed_10m_max[i],
      windDirDominant: data.daily.wind_direction_10m_dominant[i],
      thermalDelta: delta,
    };
  });

  return { hourly, daily };
}

/* ── Utility meteo ── */

export function getWeatherIcon(code: number, isDay: number): string {
  const icons: Record<number, string> = {
    0: isDay ? '☀️' : '🌙', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌧️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '❄️', 73: '❄️', 75: '❄️',
    80: '🌧️', 81: '🌧️', 82: '⛈️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
  };
  return icons[code] || (isDay ? '☀️' : '🌙');
}

export function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Sereno', 1: 'Poco nuvoloso', 2: 'Parzialmente nuvoloso', 3: 'Nuvoloso',
    45: 'Nebbia', 48: 'Nebbia ghiacciata',
    51: 'Pioviggine leggera', 53: 'Pioviggine moderata', 55: 'Pioviggine densa',
    61: 'Pioggia leggera', 63: 'Pioggia moderata', 65: 'Pioggia forte',
    71: 'Neve leggera', 73: 'Neve moderata', 75: 'Neve forte',
    80: 'Rovescio di pioggia', 81: 'Rovescio moderato', 82: 'Rovescio forte',
    95: 'Temporale', 96: 'Temporale con grandine', 99: 'Temporale forte con grandine',
  };
  return map[code] || 'Variabile';
}

export function getWindDirection(degrees: number): string {
  if (degrees == null) return '--';
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8];
}

export function getWindArrow(degrees: number): string {
  if (degrees == null) return '➡️';
  return ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'][Math.round(degrees / 45) % 8];
}

export function isWindFavorable(windDir: number, exposure: string): boolean {
  if (windDir == null) return false;
  const windStr = getWindDirection(windDir);
  return exposure.split('/').map(d => d.trim()).some(exp => windStr === exp);
}

/* ── Analisi termiche ── */

export function getThermalStrength(temp: number, cloud: number, humidity: number, deltaT: number) {
  let score = 0;
  if (temp > 25) score += 3;
  else if (temp > 20) score += 2;
  else if (temp > 15) score += 1;
  if (cloud < 20) score += 3;
  else if (cloud < 40) score += 2;
  else if (cloud < 60) score += 1;
  if (humidity < 40) score += 2;
  else if (humidity < 60) score += 1;
  if (deltaT > 12) score += 2;
  else if (deltaT > 8) score += 1;

  if (score >= 7) return { level: "Forti 💪", desc: "ottime per cross country" };
  if (score >= 5) return { level: "Medie 👍", desc: "buona attività termica" };
  if (score >= 3) return { level: "Deboli 🫤", desc: "poca attività termica" };
  return { level: "Assenti ❌", desc: "nessuna termica" };
}

export function getTurbulenceRisk(wind: number, gust: number, thermalLevel: string) {
  let risk = 0;
  if (gust > 30) risk += 2;
  else if (gust > 20) risk += 1;
  if (wind > 25) risk += 2;
  else if (wind > 18) risk += 1;
  if (thermalLevel.includes("Forti")) risk += 1;

  if (risk >= 4) return { level: "ALTO ⚠️", color: "#ff1744", desc: "Turbolenze significative, volo sconsigliato" };
  if (risk >= 2) return { level: "MEDIO ⚡", color: "#ff9800", desc: "Possibili turbolenze, attenzione" };
  return { level: "BASSO ✅", color: "#4caf50", desc: "Condizioni stabili, volo sicuro" };
}

export function getCrossCountryRating(thermalLevel: string, wind: number, cloud: number, vis: number) {
  let score = 0;
  if (thermalLevel.includes("Forti")) score += 3;
  else if (thermalLevel.includes("Medie")) score += 2;
  else if (thermalLevel.includes("Deboli")) score += 1;
  if (wind >= 10 && wind <= 25) score += 2;
  else if (wind < 10) score += 1;
  if (cloud < 30) score += 2;
  else if (cloud < 60) score += 1;
  if (vis > 20) score += 2;
  else if (vis > 10) score += 1;

  if (score >= 7) return { rating: "Eccellente ⭐", color: "#00c853", desc: "Condizioni ideali per voli lunghi" };
  if (score >= 5) return { rating: "Buono 👍", color: "#4caf50", desc: "Buone condizioni per cross" };
  if (score >= 3) return { rating: "Discreto 🫤", color: "#ff9800", desc: "Cross possibile ma difficile" };
  return { rating: "Sconsigliato ❌", color: "#ff1744", desc: "Non adatto per cross country" };
}

export function getBaseReachable(temp: number, deltaT: number): string {
  return `${Math.round(deltaT * 80 + 1500)}m`;
}

export function getDaySummary(dayHours: HourlyData[], site: Launch): string[] {
  const summaries: string[] = [];
  const avgTemp = dayHours.reduce((s, h) => s + h.temperature, 0) / dayHours.length;
  const avgCloud = dayHours.reduce((s, h) => s + h.cloudCover, 0) / dayHours.length;
  const maxWind = Math.max(...dayHours.map(h => h.windSpeed));
  const hasRain = dayHours.some(h => h.precipitation > 0);

  if (avgCloud < 30) summaries.push("☀️ Giornata prevalentemente soleggiata");
  else if (avgCloud < 60) summaries.push("⛅ Giornata con nuvole moderate");
  else summaries.push("☁️ Giornata nuvolosa");

  if (avgTemp > 25) summaries.push(`🌡️ Caldo (${Math.round(avgTemp)}°C) – buona attività termica`);
  else if (avgTemp > 18) summaries.push(`🌡️ Temperatura mite (${Math.round(avgTemp)}°C)`);
  else summaries.push(`🌡️ Fresco (${Math.round(avgTemp)}°C)`);

  if (maxWind > 30) summaries.push(`💨 VENTO FORTE (${Math.round(maxWind)} km/h) – attenzione!`);
  else if (maxWind > 20) summaries.push(`💨 Vento sostenuto (${Math.round(maxWind)} km/h)`);
  else if (maxWind < 8) summaries.push(`💨 Vento debole (${Math.round(maxWind)} km/h)`);
  else summaries.push(`💨 Vento moderato (${Math.round(maxWind)} km/h)`);

  if (hasRain) summaries.push("🌧️ Possibili precipitazioni – VOLO SCONSIGLIATO");

  if (site.difficulty >= 4) summaries.push("🏔️ Sito DIFFICILE – esperienza avanzata richiesta");
  else if (site.difficulty >= 3) summaries.push("🏔️ Sito moderatamente difficile");
  else summaries.push("🏔️ Sito adatto a tutti i livelli");

  const good = avgCloud < 60 && maxWind < 25 && !hasRain;
  summaries.push(good ? "✅ Condizioni favorevoli per il volo" : "⚠️ Verificare attentamente le condizioni prima di volare");

  return summaries;
}