export function windDegToCardinal(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

export function windDegToArrow(deg: number): string {
  const arrows = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
  return arrows[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

export function getWeatherIcon(code: number, isDay: boolean): string {
  const map: Record<number, string> = {
    0: isDay ? '☀️' : '🌙', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌧️', 55: '🌧️',
    56: '🌦️', 57: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
    66: '🌧️', 67: '🌧️', 71: '❄️', 73: '❄️', 75: '❄️',
    77: '❄️', 80: '🌧️', 81: '🌧️', 82: '⛈️', 85: '❄️', 86: '❄️',
    95: '⛈️', 96: '⛈️', 99: '⛈️',
  };
  return map[code] || (isDay ? '☀️' : '🌙');
}

export function getCloudDescription(cloud: number): string {
  if (cloud < 10) return 'Sereno';
  if (cloud < 30) return 'Poco nuvoloso';
  if (cloud < 50) return 'Parzialmente nuvoloso';
  if (cloud < 70) return 'Nuvoloso';
  if (cloud < 90) return 'Molto nuvoloso';
  return 'Coperto';
}

export function estimateThermals(
  tempSurface: number,
  temp1500m: number | null,
  humidity: number,
  cloudCover: number,
  wind1500m: number,
  cape: number,
  liftedIndex: number
): { strength: number; category: string; quality: 1 | 2 | 3 | 4 | 5 } {
  if (temp1500m == null) {
    temp1500m = tempSurface - 8;
  }
  const lapseRate = (tempSurface - temp1500m) / 15;
  const stability = Math.max(0, (lapseRate - 0.5) / 0.7);
  const humidityFactor = Math.max(0, (100 - humidity) / 100);
  let cloudFactor = 0.6;
  if (cloudCover < 30) cloudFactor = 1.0;
  else if (cloudCover < 50) cloudFactor = 0.85;
  else if (cloudCover < 70) cloudFactor = 0.6;
  else cloudFactor = 0.3;
  const windFactor = Math.max(0, 1 - wind1500m / 35);
  const capeFactor = Math.min(1, Math.max(0, cape / 600));
  const liFactor = Math.max(0, Math.min(1, (-liftedIndex) / 6));

  const raw = stability * 2.5 + humidityFactor * 1.2 + cloudFactor * 1.5 + windFactor * 0.8 + capeFactor * 1.0 + liFactor * 0.5;
  const strength = Math.min(6, Math.max(0, Math.round(raw * 10) / 10));

  let category: string;
  let quality: 1 | 2 | 3 | 4 | 5;
  if (strength >= 4) { category = "Forti"; quality = 5; }
  else if (strength >= 3) { category = "Buone"; quality = 4; }
  else if (strength >= 2) { category = "Moderate"; quality = 3; }
  else if (strength >= 1) { category = "Deboli"; quality = 2; }
  else { category = "Assenti"; quality = 1; }

  return { strength, category, quality };
}

export function estimateFlightScore(opts: {
  windSurface: number;
  windGust: number;
  wind2500: number;
  cloudCover: number;
  precipitation: number;
  thermalQuality: number;
  visibility: number;
  liftedIndex: number;
  cape: number;
}): { score: number; rating: string; color: string; issues: string[] } {
  let score = 50;
  const issues: string[] = [];

  if (opts.windSurface < 5) { score -= 10; issues.push('Vento troppo debole'); }
  else if (opts.windSurface < 8) { score -= 5; issues.push('Vento leggero'); }
  else if (opts.windSurface > 25) { score -= 25; issues.push('Vento troppo forte'); }
  else if (opts.windSurface > 20) { score -= 10; issues.push('Vento sostenuto'); }
  else { score += 15; }

  if (opts.wind2500 > 35) { score -= 15; issues.push('Vento forte in quota'); }
  else if (opts.wind2500 > 25) { score -= 5; }
  else { score += 5; }

  if (opts.windGust > 35) { score -= 15; issues.push('Raffiche forti'); }
  else if (opts.windGust > 25) { score -= 5; }

  if (opts.cloudCover > 80) { score -= 15; issues.push('Cielo coperto'); }
  else if (opts.cloudCover < 30) { score += 10; }

  if (opts.liftedIndex > 3) { score -= 10; issues.push('Atmosfera stabile'); }
  else if (opts.liftedIndex < -4) { score += 10; }
  else if (opts.liftedIndex < -2) { score += 5; }

  if (opts.cape > 800) { score += 10; }
  else if (opts.cape > 400) { score += 5; }

  if (opts.thermalQuality >= 4) { score += 10; }
  else if (opts.thermalQuality <= 2) { score -= 5; }

  if (opts.precipitation > 0.5) { score -= 25; issues.push('Pioggia'); }

  if (opts.visibility < 5) { score -= 10; issues.push('Visibilità limitata'); }
  else if (opts.visibility > 20) { score += 5; }

  score = Math.max(0, Math.min(100, score));

  if (score >= 80) return { score, rating: 'Eccellente', color: '#00FF8C', issues };
  if (score >= 65) return { score, rating: 'Buono', color: '#4DA3FF', issues };
  if (score >= 45) return { score, rating: 'Discreto', color: '#FFC857', issues };
  if (score >= 25) return { score, rating: 'Difficile', color: '#FF9F1C', issues };
  return { score, rating: 'Sconsigliato', color: '#FF4E4E', issues };
}

export function estimatePlafond(tempSurface: number, dewPoint: number, cloudCover: number, elevation: number): number {
  const spread = tempSurface - dewPoint;
  let base = 120 * spread + elevation;
  if (cloudCover > 70) base *= 0.7;
  else if (cloudCover < 30) base *= 1.1;
  return Math.round(base);
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Oggi';
  if (d.toDateString() === tomorrow.toDateString()) return 'Domani';
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  return days[d.getDay()];
}

export function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

export function windColor(speed: number): string {
  if (speed < 8) return '#4DA3FF';
  if (speed < 15) return '#66BB6A';
  if (speed < 25) return '#FFC857';
  if (speed < 35) return '#FF9F1C';
  return '#FF4E4E';
}