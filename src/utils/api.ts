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
  pressure: number;
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
}

export interface MeteoResponse {
  hourly: HourlyData[];
  daily: DailyData[];
}

export async function fetchMeteoCompleta(lat: number, lon: number): Promise<MeteoResponse> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,` +
    `wind_speed_10m,wind_gusts_10m,wind_direction_10m,` +
    `wind_speed_80m,wind_direction_80m,wind_speed_120m,wind_direction_120m,` +
    `uv_index,is_day,weathercode,pressure_msl` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,` +
    `uv_index_max,precipitation_sum,precipitation_hours,` +
    `wind_speed_10m_max,wind_direction_10m_dominant` +
    `&timezone=auto&forecast_days=3`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  
  const hours = data.hourly.time;
  const hourlyData: HourlyData[] = hours.map((time: string, index: number) => ({
    time: new Date(time),
    temperature: data.hourly.temperature_2m[index],
    dewPoint: data.hourly.dewpoint_2m[index],
    humidity: data.hourly.relativehumidity_2m[index],
    cloudCover: data.hourly.cloudcover[index],
    precipitation: data.hourly.precipitation[index] || 0,
    visibility: data.hourly.visibility ? data.hourly.visibility[index] / 1000 : 40,
    windSpeed: data.hourly.wind_speed_10m[index],
    windGust: data.hourly.wind_gusts_10m ? data.hourly.wind_gusts_10m[index] : data.hourly.wind_speed_10m[index] + 8,
    windDir: data.hourly.wind_direction_10m[index],
    wind80m: data.hourly.wind_speed_80m ? data.hourly.wind_speed_80m[index] : null,
    windDir80m: data.hourly.wind_direction_80m ? data.hourly.wind_direction_80m[index] : null,
    wind120m: data.hourly.wind_speed_120m ? data.hourly.wind_speed_120m[index] : null,
    windDir120m: data.hourly.wind_direction_120m ? data.hourly.wind_direction_120m[index] : null,
    uvIndex: data.hourly.uv_index ? data.hourly.uv_index[index] : 0,
    isDay: data.hourly.is_day ? data.hourly.is_day[index] : 1,
    weatherCode: data.hourly.weathercode ? data.hourly.weathercode[index] : 0,
    pressure: data.hourly.pressure_msl ? data.hourly.pressure_msl[index] : 1013,
  }));

  const dailyData: DailyData[] = data.daily.time.map((date: string, index: number) => ({
    date: new Date(date),
    weatherCode: data.daily.weathercode[index],
    tempMax: data.daily.temperature_2m_max[index],
    tempMin: data.daily.temperature_2m_min[index],
    sunrise: new Date(data.daily.sunrise[index]),
    sunset: new Date(data.daily.sunset[index]),
    uvMax: data.daily.uv_index_max[index],
    precipitationSum: data.daily.precipitation_sum[index],
    precipitationHours: data.daily.precipitation_hours[index],
    windMax: data.daily.wind_speed_10m_max[index],
    windDirDominant: data.daily.wind_direction_10m_dominant[index],
  }));

  return { hourly: hourlyData, daily: dailyData };
}