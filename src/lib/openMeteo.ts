"use client";

export interface RawHourlyData {
  time: string[];
  temperature_2m: number[];
  relativehumidity_2m: number[];
  dewpoint_2m: number[];
  cloudcover: number[];
  precipitation: number[];
  visibility: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  wind_direction_10m: number[];
  wind_speed_80m: number[];
  wind_direction_80m: number[];
  wind_speed_120m: number[];
  wind_direction_120m: number[];
  uv_index: number[];
  is_day: number[];
  weathercode: number[];
  pressure_msl: number[];
}

export interface RawDailyData {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  precipitation_hours: number[];
  wind_speed_10m_max: number[];
  wind_direction_10m_dominant: number[];
}

export interface RawApiResponse {
  hourly: RawHourlyData;
  daily: RawDailyData;
}

export interface HourWeather {
  time: Date;
  temp: number;
  dew: number;
  hum: number;
  cloud: number;
  prec: number;
  vis: number;
  wind: number;
  gust: number;
  wdir: number;
  w80: number | null;
  wd80: number | null;
  w120: number | null;
  wd120: number | null;
  uv: number;
  isDay: number;
  wcode: number;
  pres: number;
}

export interface DayWeather {
  date: Date;
  hours: HourWeather[];
  tmax: number;
  tmin: number;
  wcode: number;
  precipitation_sum: number;
  precipitation_hours: number;
  wind_max: number;
  wind_dominant: number;
  sunrise: string;
  sunset: string;
  uv_max: number;
}

export interface SiteWeather {
  lat: number;
  lon: number;
  days: DayWeather[];
}

function parseHourlyToHours(raw: RawHourlyData): HourWeather[] {
  return raw.time.map((t, i) => ({
    time: new Date(t),
    temp: raw.temperature_2m[i],
    dew: raw.dewpoint_2m[i],
    hum: raw.relativehumidity_2m[i],
    cloud: raw.cloudcover[i],
    prec: raw.precipitation[i] ?? 0,
    vis: (raw.visibility?.[i] ?? 40000) / 1000,
    wind: raw.wind_speed_10m[i],
    gust: raw.wind_gusts_10m?.[i] ?? raw.wind_speed_10m[i] + 8,
    wdir: raw.wind_direction_10m[i],
    w80: raw.wind_speed_80m?.[i] ?? null,
    wd80: raw.wind_direction_80m?.[i] ?? null,
    w120: raw.wind_speed_120m?.[i] ?? null,
    wd120: raw.wind_direction_120m?.[i] ?? null,
    uv: raw.uv_index?.[i] ?? 0,
    isDay: raw.is_day?.[i] ?? 1,
    wcode: raw.weathercode?.[i] ?? 0,
    pres: raw.pressure_msl?.[i] ?? 1013,
  }));
}

function groupHoursByDay(hours: HourWeather[]): DayWeather[] {
  const map = new Map<string, HourWeather[]>();
  for (const h of hours) {
    const key = h.time.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(h);
  }
  return Array.from(map.entries()).map(([dateStr, hrs]) => ({
    date: new Date(dateStr),
    hours: hrs,
    tmax: Math.max(...hrs.map(h => h.temp)),
    tmin: Math.min(...hrs.map(h => h.temp)),
    wcode: 0, // placeholder
    precipitation_sum: hrs.reduce((s, h) => s + h.prec, 0),
    precipitation_hours: hrs.filter(h => h.prec > 0.3).length,
    wind_max: Math.max(...hrs.map(h => h.wind)),
    wind_dominant: 0, // placeholder
    sunrise: "",
    sunset: "",
    uv_max: Math.max(...hrs.map(h => h.uv)),
  }));
}

export async function fetchSiteWeather(
  lat: number,
  lon: number,
  forecastDays: number = 3
): Promise<SiteWeather> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      "temperature_2m",
      "dewpoint_2m",
      "relativehumidity_2m",
      "cloudcover",
      "precipitation",
      "visibility",
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
      "wind_speed_80m",
      "wind_direction_80m",
      "wind_speed_120m",
      "wind_direction_120m",
      "uv_index",
      "is_day",
      "weathercode",
      "pressure_msl",
    ].join(","),
    daily: [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_hours",
      "wind_speed_10m_max",
      "wind_direction_10m_dominant",
    ].join(","),
    timezone: "auto",
    forecast_days: forecastDays.toString(),
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Errore Open-Meteo: ${res.status}`);
  }

  const raw: RawApiResponse = await res.json();
  const hours = parseHourlyToHours(raw.hourly);
  const days = groupHoursByDay(hours);

  // Arricchisci con dati daily
  if (raw.daily) {
    raw.daily.time.forEach((d, i) => {
      const idx = days.findIndex(
        (day) => day.date.toISOString().slice(0, 10) === new Date(d).toISOString().slice(0, 10)
      );
      if (idx !== -1) {
        days[idx].wcode = raw.daily.weathercode[i];
        days[idx].wind_dominant = raw.daily.wind_direction_10m_dominant[i];
        days[idx].wind_max = raw.daily.wind_speed_10m_max[i];
        days[idx].sunrise = raw.daily.sunrise[i];
        days[idx].sunset = raw.daily.sunset[i];
        days[idx].uv_max = raw.daily.uv_index_max[i];
      }
    });
  }

  return { lat, lon, days };
}