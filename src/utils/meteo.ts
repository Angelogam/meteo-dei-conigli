export function getWeatherIcon(code: number, isDay: number): string {
  const icons: Record<number, string> = {
    0: isDay ? '☀️' : '🌙',
    1: isDay ? '🌤️' : '🌤️',
    2: isDay ? '⛅' : '☁️',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌧️',
    55: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '❄️',
    73: '❄️',
    75: '❄️',
    80: '🌧️',
    81: '🌧️',
    82: '⛈️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
  };
  return icons[code] || (isDay ? '☀️' : '🌙');
}

export function getWindDirection(degrees: number): string {
  if (!degrees && degrees !== 0) return '--';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

export function getWindArrow(degrees: number): string {
  if (!degrees && degrees !== 0) return '➡️';
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  return arrows[Math.round(degrees / 45) % 8];
}

export function getCloudCondition(cloudCover: number): { text: string; icon: string; color: string } {
  if (cloudCover < 20) return { text: 'Sereno', icon: '☀️', color: '#ffd93d' };
  if (cloudCover < 40) return { text: 'Poco nuvoloso', icon: '🌤️', color: '#f9a825' };
  if (cloudCover < 60) return { text: 'Nuvoloso', icon: '⛅', color: '#90a4ae' };
  if (cloudCover < 80) return { text: 'Molto nuvoloso', icon: '☁️', color: '#78909c' };
  return { text: 'Coperto', icon: '☁️', color: '#546e7a' };
}

export function getThermalIndex(temp: number, cloud: number, humidity: number, delta: number): { level: string; icon: string; color: string; desc: string } {
  let score = 0;
  if (temp > 22) score += 2;
  else if (temp > 18) score += 1;
  if (cloud < 30) score += 2;
  else if (cloud < 50) score += 1;
  if (humidity < 50) score += 1;
  if (delta > 10) score += 2;
  else if (delta > 6) score += 1;
  
  if (score >= 6) return { level: 'Forte', icon: '🔥', color: '#ff1744', desc: 'Ottima attività termica' };
  if (score >= 4) return { level: 'Media', icon: '💪', color: '#ff6d00', desc: 'Buona attività termica' };
  if (score >= 2) return { level: 'Debole', icon: '🫤', color: '#ffd600', desc: 'Termiche deboli' };
  return { level: 'Assente', icon: '❄️', color: '#4fc3f7', desc: 'Nessuna attività termica' };
}