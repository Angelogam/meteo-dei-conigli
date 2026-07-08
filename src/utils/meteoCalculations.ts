export function windDegToCardinal(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
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