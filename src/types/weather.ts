export interface HourlyWeatherData {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  cloud_cover: number[];
  pressure_msl: number[];
}

export interface HourlyWeatherData1500m {
  time: string[];
  wind_speed_1500m: number[];
  wind_direction_1500m: number[];
  temperature_1500m: number[];
}

export interface HourlyWeatherData2500m {
  time: string[];
  wind_speed_2500m: number[];
  wind_direction_2500m: number[];
  temperature_2500m: number[];
}

export interface HourlyWeatherData3500m {
  time: string[];
  wind_speed_3500m: number[];
  wind_direction_3500m: number[];
  temperature_3500m: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: HourlyWeatherData;
}

export interface OpenMeteoPressureResponse {
  hourly: {
    time: string[];
    geopotential_height_850hPa: number[];
    geopotential_height_700hPa: number[];
    geopotential_height_500hPa: number[];
    temperature_850hPa: number[];
    temperature_700hPa: number[];
    temperature_500hPa: number[];
    wind_speed_850hPa: number[];
    wind_direction_850hPa: number[];
    wind_speed_700hPa: number[];
    wind_direction_700hPa: number[];
    wind_speed_500hPa: number[];
    wind_direction_500hPa: number[];
  };
}

export interface ProcessedHourData {
  hour: number;
  temp: number;
  humidity: number;
  windSpeed10m: number;
  windDirection10m: number;
  cloudCover: number;
  pressure: number;
  // Wind aloft
  windSpeed1500m: number;
  windDirection1500m: number;
  temp1500m: number;
  windSpeed2500m: number;
  windDirection2500m: number;
  temp2500m: number;
  windSpeed3500m: number;
  windDirection3500m: number;
  temp3500m: number;
  // Derived values
  thermalStrength: number; // m/s
  thermalForce: number; // 1-5
  turbulence: number; // 1-5
  qualityScore: number; // 1-5
}

export interface DayForecast {
  date: string;
  dayName: string;
  hours: ProcessedHourData[];
  averageQuality: number;
  bestHour: number;
}

export interface LaunchForecast {
  siteId: string;
  siteName: string;
  lat: number;
  lon: number;
  days: DayForecast[];
  overallScore: number;
}
