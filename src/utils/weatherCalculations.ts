import { ProcessedHourData } from "@/types/weather";

/**
 * Calculate thermal strength based on multiple meteorological factors.
 * Uses: vertical velocity proxy (lapse rate + temp diff), humidity, stability, cloud cover
 */
export function calculateThermalStrength(
  tempSurface: number,
  temp1500m: number,
  humidity: number,
  cloudCover: number,
  windSpeedAloft: number,
  pressure: number
): { strength: number; force: number; turbulence: number } {
  // Lapse rate (°C per 100m) — estimate from surface to 1500m
  const lapseRate = (tempSurface - temp1500m) / 15;

  // Dry adiabatic lapse rate is ~1°C/100m
  // Higher lapse rate = more instability = better thermals
  const stabilityFactor = Math.max(0, lapseRate - 0.6) / 0.6;

  // Humidity factor: lower humidity = drier air = better thermals
  const humidityFactor = Math.max(0, (100 - humidity) / 100);

  // Cloud cover: moderate cloud (30-60%) can help trigger thermals,
  // but too much reduces sun heating
  let cloudFactor: number;
  if (cloudCover < 30) {
    cloudFactor = 0.8 + (cloudCover / 30) * 0.2; // 0.8 to 1.0
  } else if (cloudCover < 60) {
    cloudFactor = 1.0; // Sweet spot
  } else if (cloudCover < 80) {
    cloudFactor = 1.0 - ((cloudCover - 60) / 20) * 0.3; // 1.0 to 0.7
  } else {
    cloudFactor = 0.7 - ((cloudCover - 80) / 20) * 0.5; // 0.7 to 0.2
  }

  // Wind aloft factor: too much wind shears thermals
  const windAloftFactor = Math.max(0, 1 - windSpeedAloft / 40);

  // Pressure: lower pressure (higher altitude) generally means stronger sun
  // Normalized around 1013 hPa
  const pressureFactor = Math.min(1.2, Math.max(0.6, pressure / 1013));

  // Thermal strength in m/s
  const rawStrength =
    stabilityFactor * 3.0 +
    humidityFactor * 1.5 +
    cloudFactor * 2.0 +
    windAloftFactor * 1.5 +
    pressureFactor * 1.0;

  // Clamp to realistic range 0-6 m/s
  const strength = Math.min(6, Math.max(0, rawStrength));

  // Force scale 1-5
  const force = Math.min(5, Math.max(1, Math.round(strength * 0.8 + 0.5)));

  // Turbulence scale 1-5
  // Higher wind aloft + higher thermal strength + instability = more turbulence
  const rawTurbulence =
    (windSpeedAloft / 30) * 2.5 +
    (strength / 6) * 1.5 +
    (1 - stabilityFactor) * 1.0;
  const turbulence = Math.min(5, Math.max(1, Math.round(rawTurbulence + 0.5)));

  return { strength: Math.round(strength * 10) / 10, force, turbulence };
}

/**
 * Calculate overall quality score (1-5) for a day/hour
 * - Thermals: 40% weight
 * - Wind speed at ground: 30% weight
 * - Wind aloft: 20% weight
 * - Turbulence: -10% weight
 */
export function calculateQualityScore(
  thermalForce: number,
  windSpeed10m: number,
  windSpeed1500m: number,
  windSpeed2500m: number,
  turbulence: number
): number {
  // Thermal score (1-5) already, weight 40%
  const thermalScore = thermalForce * 0.4;

  // Wind at ground: ideal 8-25 km/h for paragliding
  let groundWindScore: number;
  if (windSpeed10m < 3) {
    groundWindScore = 3; // Too light
  } else if (windSpeed10m < 8) {
    groundWindScore = 3 + ((windSpeed10m - 3) / 5) * 2; // 3 to 5
  } else if (windSpeed10m <= 25) {
    groundWindScore = 5; // Ideal
  } else if (windSpeed10m <= 35) {
    groundWindScore = 5 - ((windSpeed10m - 25) / 10) * 3; // 5 to 2
  } else {
    groundWindScore = 1; // Too strong
  }
  const groundWindWeighted = (groundWindScore / 5) * 3 * 0.3;

  // Wind aloft: moderate is fine, too much is dangerous
  const avgWindAloft = (windSpeed1500m + windSpeed2500m) / 2;
  let aloftWindScore: number;
  if (avgWindAloft < 5) aloftWindScore = 3;
  else if (avgWindAloft < 15) aloftWindScore = 5;
  else if (avgWindAloft < 25) aloftWindScore = 4;
  else if (avgWindAloft < 35) aloftWindScore = 2;
  else aloftWindScore = 1;
  const aloftWindWeighted = (aloftWindScore / 5) * 3 * 0.2;

  // Turbulence penalty: -10%
  const turbulencePenalty = ((turbulence - 1) / 4) * 0.1;

  // Raw score (0-1 range then scale to 1-5)
  const rawScore = thermalScore * 0.25 + groundWindWeighted + aloftWindWeighted;
  const finalScore = rawScore * 5 * (1 - turbulencePenalty);

  return Math.min(5, Math.max(1, Math.round(finalScore)));
}

/**
 * Get color for quality score
 */
export function getQualityColor(score: number): string {
  if (score >= 4.5) return "#00FF8C";
  if (score >= 3.5) return "#4DA3FF";
  if (score >= 2.5) return "#FFC857";
  if (score >= 1.5) return "#FF9F1C";
  return "#FF4E4E";
}

/**
 * Get label for quality score
 */
export function getQualityLabel(score: number): string {
  if (score >= 4.5) return "Ottima";
  if (score >= 3.5) return "Buona";
  if (score >= 2.5) return "Media";
  if (score >= 1.5) return "Scarsa";
  return "Pessima";
}

/**
 * Get wind direction as degrees to cardinal direction
 */
export function windDegToDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

/**
 * Format date string to day name (Italian)
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Oggi";
  if (date.toDateString() === tomorrow.toDateString()) return "Domani";

  return days[date.getDay()];
}

/**
 * Get a display-friendly time label
 */
export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}
