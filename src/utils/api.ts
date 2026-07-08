export interface HourlyData {
  time: string;
  temperature2m: number;
  dewPoint2m: number;
  relativeHumidity2m: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  visibility: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
  surfacePressure: number;
  temperature850hPa: number;
  windSpeed850hPa: number;
  windDirection850hPa: number;
  temperature700hPa: number;
  windSpeed700hPa: number;
  windDirection700hPa: number;
  temperature500hPa: number;
  windSpeed500hPa: number;
  windDirection500hPa: number;
  cape: number;
  liftedIndex: number;
  isDay: boolean;
}

export interface DailyData {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
  uvIndexMax: number;
}

export interface ForecastResponse {
  hourly: HourlyData[];
  daily: DailyData[];
}

function getDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const today = getDate(0);
  const day3 = getDate(2);

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'temperature_2m', 'dew_point_2m', 'relative_humidity_2m',
      'precipitation', 'weather_code',
      'cloud_cover', 'visibility',
      'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
      'surface_pressure',
      'temperature_850hPa', 'wind_speed_850hPa', 'wind_direction_850hPa',
      'temperature_700hPa', 'wind_speed_700hPa', 'wind_direction_700hPa',
      'temperature_500hPa', 'wind_speed_500hPa', 'wind_direction_500hPa',
      'cape', 'lifted_index',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max', 'temperature_2m_min',
      'precipitation_sum', 'precipitation_probability_max',
      'wind_speed_10m_max', 'wind_gusts_10m_max', 'wind_direction_10m_dominant',
      'uv_index_max',
    ].join(','),
    timezone: 'auto',
    start_date: today,
    end_date: day3,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();

  const hourly: HourlyData[] = data.hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature2m: data.hourly.temperature_2m[i],
    dewPoint2m: data.hourly.dew_point_2m[i],
    relativeHumidity2m: data.hourly.relative_humidity_2m[i],
    precipitation: data.hourly.precipitation[i] || 0,
    weatherCode: data.hourly.weather_code[i],
    cloudCover: data.hourly.cloud_cover[i],
    visibility: data.hourly.visibility ? data.hourly.visibility[i] / 1000 : 40,
    windSpeed10m: data.hourly.wind_speed_10m[i],
    windDirection10m: data.hourly.wind_direction_10m[i],
    windGusts10m: data.hourly.wind_gusts_10m[i] || data.hourly.wind_speed_10m[i] * 1.4,
    surfacePressure: data.hourly.surface_pressure[i],
    temperature850hPa: data.hourly.temperature_850hPa[i],
    windSpeed850hPa: data.hourly.wind_speed_850hPa[i],
    windDirection850hPa: data.hourly.wind_direction_850hPa[i],
    temperature700hPa: data.hourly.temperature_700hPa[i],
    windSpeed700hPa: data.hourly.wind_speed_700hPa[i],
    windDirection700hPa: data.hourly.wind_direction_700hPa[i],
    temperature500hPa: data.hourly.temperature_500hPa[i],
    windSpeed500hPa: data.hourly.wind_speed_500hPa[i],
    windDirection500hPa: data.hourly.wind_direction_500hPa[i],
    cape: data.hourly.cape[i] || 0,
    liftedIndex: data.hourly.lifted_index[i] || 5,
    isDay: data.hourly.is_day[i] === 1,
  }));

  const daily: DailyData[] = data.daily.time.map((d: string, i: number) => ({
    date: d,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitationSum: data.daily.precipitation_sum[i] || 0,
    precipitationProbabilityMax: data.daily.precipitation_probability_max?.[i] || 0,
    windSpeedMax: data.daily.wind_speed_10m_max[i],
    windGustsMax: data.daily.wind_gusts_10m_max[i] || data.daily.wind_speed_10m_max[i] * 1.4,
    windDirectionDominant: data.daily.wind_direction_10m_dominant[i],
    uvIndexMax: data.daily.uv_index_max[i],
  }));

  return { hourly, daily };
}