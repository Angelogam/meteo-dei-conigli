import { OpenMeteoResponse, ProcessedHourData, DayForecast, LaunchForecast } from "@/types/weather";
import { LaunchSite } from "@/data/launchSites";
import { calculateThermalStrength, calculateQualityScore, getDayName } from "@/utils/weatherCalculations";

function getTodayDateString(): string {
  const today = new Date();
  // Use local date string to avoid timezone offset issues
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Fetch weather data from Open-Meteo for a launch site
 */
export async function fetchSiteWeather(site: LaunchSite): Promise<LaunchForecast> {
  const today = getTodayDateString();
  const day2 = getDateOffset(1);
  const day3 = getDateOffset(2);

  // Surface & lower-level data
  const surfaceUrl = `https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,pressure_msl,wind_speed_1000hPa,wind_direction_1000hPa,temperature_1000hPa,wind_speed_850hPa,wind_direction_850hPa,temperature_850hPa,wind_speed_700hPa,wind_direction_700hPa,temperature_700hPa,wind_speed_500hPa,wind_direction_500hPa,temperature_500hPa&timezone=auto&start_date=${today}&end_date=${day3}`;

  const response = await fetch(surfaceUrl);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  const data: OpenMeteoResponse & {
    hourly: OpenMeteoResponse["hourly"] & {
      wind_speed_1000hPa?: number[];
      wind_direction_1000hPa?: number[];
      temperature_1000hPa?: number[];
      wind_speed_850hPa: number[];
      wind_direction_850hPa: number[];
      temperature_850hPa: number[];
      wind_speed_700hPa: number[];
      wind_direction_700hPa: number[];
      temperature_700hPa: number[];
      wind_speed_500hPa: number[];
      wind_direction_500hPa: number[];
      temperature_500hPa: number[];
    };
  } = await response.json();

  // Map pressure levels to approximate altitudes:
  // 1000hPa ~ surface/150m, 850hPa ~ 1500m, 700hPa ~ 3000m, 500hPa ~ 5500m
  // We'll use 850hPa for 1500m, 700hPa for 2500-3000m, 500hPa for 3500-5500m

  const hourly = data.hourly;

  // Process all hours from the 3-day window (10:00-18:00 for each day)
  const days: DayForecast[] = [];
  const targetHours = [10, 12, 14, 16, 18];

  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const dateStr = dayOffset === 0 ? today : dayOffset === 1 ? day2 : day3;
    const hours: ProcessedHourData[] = [];

    for (const hour of targetHours) {
      // Find matching time index
      const timeStr = `${dateStr}T${String(hour).padStart(2, '0')}:00`;
      const idx = hourly.time.findIndex((t: string) => t.startsWith(timeStr));

      if (idx === -1) continue;

      const temp = hourly.temperature_2m[idx];
      const humidity = hourly.relative_humidity_2m[idx];
      const windSpeed10m = hourly.wind_speed_10m[idx];
      const windDirection10m = hourly.wind_direction_10m[idx];
      const cloudCover = hourly.cloud_cover[idx];
      const pressure = hourly.pressure_msl[idx];

      // Pressure-level data (approximate altitudes)
      const windSpeed1500m = hourly.wind_speed_850hPa?.[idx] ?? windSpeed10m;
      const windDirection1500m = hourly.wind_direction_850hPa?.[idx] ?? windDirection10m;
      const temp1500m = hourly.temperature_850hPa?.[idx] ?? temp - 9;

      const windSpeed2500m = hourly.wind_speed_700hPa?.[idx] ?? windSpeed1500m;
      const windDirection2500m = hourly.wind_direction_700hPa?.[idx] ?? windDirection1500m;
      const temp2500m = hourly.temperature_700hPa?.[idx] ?? temp - 18;

      const windSpeed3500m = hourly.wind_speed_500hPa?.[idx] ?? windSpeed2500m;
      const windDirection3500m = hourly.wind_direction_500hPa?.[idx] ?? windDirection2500m;
      const temp3500m = hourly.temperature_500hPa?.[idx] ?? temp - 30;

      // Calculate thermal characteristics
      const { strength, force, turbulence } = calculateThermalStrength(
        temp,
        temp1500m,
        humidity,
        cloudCover,
        windSpeed1500m,
        pressure
      );

      const qualityScore = calculateQualityScore(
        force,
        windSpeed10m,
        windSpeed1500m,
        windSpeed2500m,
        turbulence
      );

      hours.push({
        hour,
        temp,
        humidity,
        windSpeed10m,
        windDirection10m,
        cloudCover,
        pressure,
        windSpeed1500m,
        windDirection1500m,
        temp1500m,
        windSpeed2500m,
        windDirection2500m,
        temp2500m,
        windSpeed3500m,
        windDirection3500m,
        temp3500m,
        thermalStrength: strength,
        thermalForce: force,
        turbulence,
        qualityScore,
      });
    }

    const avgQuality = hours.length > 0
      ? Math.round(hours.reduce((sum, h) => sum + h.qualityScore, 0) / hours.length * 10) / 10
      : 0;

    const bestHour = hours.length > 0
      ? hours.reduce((best, h) => h.qualityScore > best.qualityScore ? h : best).hour
      : 10;

    days.push({
      date: dateStr,
      dayName: getDayName(dateStr),
      hours,
      averageQuality: avgQuality,
      bestHour,
    });
  }

  const overallScore = days.length > 0
    ? Math.round(days.reduce((sum, d) => sum + d.averageQuality, 0) / days.length * 10) / 10
    : 0;

  return {
    siteId: site.id,
    siteName: site.name,
    lat: site.lat,
    lon: site.lon,
    days,
    overallScore,
  };
}
