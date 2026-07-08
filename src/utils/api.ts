export interface HourlyData {
  time: string;
  temperature2m: number;
  relativeHumidity2m: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
  temperature850hPa: number;
  windSpeed850hPa: number;
  windSpeed700hPa: number;
  cape: number;
  liftedIndex: number;
  isDay: boolean;
}

export interface DailyData {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

export interface ForecastResponse {
  hourly: HourlyData[];
  daily: DailyData[];
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const today = new Date().toISOString().slice(0, 10);
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const endDate = d.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'temperature_2m', 'relative_humidity_2m',
      'precipitation', 'weather_code',
      'cloud_cover',
      'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
      'temperature_850hPa', 'wind_speed_850hPa',
      'wind_speed_700hPa',
      'cape', 'lifted_index',
      'is_day',
    ].join(','),
    daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min'].join(','),
    timezone: 'auto',
    start_date: today,
    end_date: endDate,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const hourly: HourlyData[] = data.hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature2m: data.hourly.temperature_2m[i],
    relativeHumidity2m: data.hourly.relative_humidity_2m[i],
    precipitation: data.hourly.precipitation[i] || 0,
    weatherCode: data.hourly.weather_code[i],
    cloudCover: data.hourly.cloud_cover[i],
    windSpeed10m: data.hourly.wind_speed_10m[i],
    windDirection10m: data.hourly.wind_direction_10m[i],
    windGusts10m: data.hourly.wind_gusts_10m[i] || data.hourly.wind_speed_10m[i] * 1.4,
    temperature850hPa: data.hourly.temperature_850hPa[i],
    windSpeed850hPa: data.hourly.wind_speed_850hPa[i],
    windSpeed700hPa: data.hourly.wind_speed_700hPa[i],
    cape: data.hourly.cape[i] || 0,
    liftedIndex: data.hourly.lifted_index[i] || 5,
    isDay: data.hourly.is_day[i] === 1,
  }));

  const daily: DailyData[] = data.daily.time.map((d: string, i: number) => ({
    date: d,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
  }));

  return { hourly, daily };
}