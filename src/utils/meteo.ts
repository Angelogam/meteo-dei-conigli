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
  weatherCode: number;
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

/* ── FETCH ── */

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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
    windGust: data.hourly.wind_gusts_10m?.[i] ?? data.hourly.wind_speed_10m[i] + 8,
    windDir: data.hourly.wind_direction_10m[i],
    wind80m: data.hourly.wind_speed_80m?.[i] ?? null,
    windDir80m: data.hourly.wind_direction_80m?.[i] ?? null,
    wind120m: data.hourly.wind_speed_120m?.[i] ?? null,
    windDir120m: data.hourly.wind_direction_120m?.[i] ?? null,
    uvIndex: data.hourly.uv_index?.[i] ?? 0,
    isDay: data.hourly.is_day?.[i] ?? 1,
    weatherCode: data.hourly.weathercode?.[i] ?? 0,
  }));

  const daily: DailyData[] = data.daily.time.map((date: string, i: number) => {
    const dayHours = hourly.filter(
      (h) => h.time.getDate() === new Date(date).getDate() && h.time.getMonth() === new Date(date).getMonth()
    );
    const temps = dayHours.map((h) => h.temperature).filter((t): t is number => t != null);
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

/* ── UTILITY ── */

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
    45: 'Nebbia', 48: 'Nebbia ghiacciata', 51: 'Pioviggine leggera', 53: 'Pioviggine moderata', 55: 'Pioviggine densa',
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
  if (degrees == null) return '→';
  return ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'][Math.round(degrees / 45) % 8];
}

export function getCloudCondition(cloudCover: number): { text: string; icon: string; color: string } {
  if (cloudCover < 20) return { text: 'Sereno', icon: '☀️', color: '#ffd93d' };
  if (cloudCover < 40) return { text: 'Poco nuvoloso', icon: '🌤️', color: '#f9a825' };
  if (cloudCover < 60) return { text: 'Nuvoloso', icon: '⛅', color: '#90a4ae' };
  if (cloudCover < 80) return { text: 'Molto nuvoloso', icon: '☁️', color: '#78909c' };
  return { text: 'Coperto', icon: '☁️', color: '#546e7a' };
}

export function getWindCondition(speed: number): { text: string; color: string; icon: string } {
  if (speed < 5) return { text: 'Debole', color: '#4caf50', icon: '🌱' };
  if (speed < 12) return { text: 'Leggero', color: '#8bc34a', icon: '🍃' };
  if (speed < 20) return { text: 'Moderato', color: '#ff9800', icon: '💨' };
  if (speed < 30) return { text: 'Forte', color: '#ff5722', icon: '🌪️' };
  return { text: 'Molto forte', color: '#f44336', icon: '⚠️' };
}

export function getThermalIndex(temp: number, cloud: number, humidity: number, delta: number) {
  let score = 0;
  if (temp > 22) score += 2;
  else if (temp > 18) score += 1;
  if (cloud < 30) score += 2;
  else if (cloud < 50) score += 1;
  if (humidity < 50) score += 1;
  if (delta > 10) score += 2;
  else if (delta > 6) score += 1;

  if (score >= 6) return { level: 'Forte', icon: '🔥', color: '#ff1744' };
  if (score >= 4) return { level: 'Media', icon: '💪', color: '#ff6d00' };
  if (score >= 2) return { level: 'Debole', icon: '🫤', color: '#ffd600' };
  return { level: 'Assente', icon: '❄️', color: '#4fc3f7' };
}

export function getFlightRating(meteo: {
  windSpeed: number;
  cloudCover: number;
  precipitation: number;
  visibility: number;
  temperature: number;
  humidity: number;
  thermalDelta: number;
}) {
  let score = 0;
  const issues: string[] = [];

  if (meteo.windSpeed > 25) { score -= 2; issues.push('Vento forte'); }
  else if (meteo.windSpeed > 18) { score -= 1; issues.push('Vento sostenuto'); }
  else if (meteo.windSpeed < 5) { score -= 1; issues.push('Vento debole'); }
  else score += 1;

  if (meteo.cloudCover > 80) { score -= 2; issues.push('Cielo coperto'); }
  else if (meteo.cloudCover > 60) { score -= 1; issues.push('Nuvoloso'); }
  else if (meteo.cloudCover < 30) score += 1;

  if (meteo.precipitation > 0.5) { score -= 3; issues.push('Pioggia'); }

  if (meteo.visibility < 10) { score -= 1; issues.push('Visibilità ridotta'); }
  else if (meteo.visibility > 20) score += 1;

  const thermal = getThermalIndex(meteo.temperature, meteo.cloudCover, meteo.humidity, meteo.thermalDelta);
  if (thermal.level === 'Forte') score += 2;
  else if (thermal.level === 'Media') score += 1;

  if (score >= 4) return { rating: 'Eccellente ⭐', color: '#00c853', desc: 'Condizioni perfette per volare!' };
  if (score >= 2) return { rating: 'Buono 👍', color: '#4caf50', desc: 'Buone condizioni, vola!' };
  if (score >= 0) return { rating: 'Discreto 🫤', color: '#ff9800', desc: 'Valuta attentamente' };
  if (score >= -2) return { rating: 'Difficile ⚠️', color: '#ff5722', desc: 'Condizioni difficili' };
  return { rating: 'Sconsigliato ❌', color: '#f44336', desc: 'Non volare, condizioni pericolose' };
}