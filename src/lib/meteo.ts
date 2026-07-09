"use client";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windGusts: number;
  weatherCode: number;
  precipitation: number;
  humidity: number;
  pressure: number;
}

const weatherDescriptions: Record<number, { description: string; icon: string }> = {
  0: { description: "Cielo sereno", icon: "☀️" },
  1: { description: "Prevalentemente sereno", icon: "🌤️" },
  2: { description: "Parzialmente nuvoloso", icon: "⛅" },
  3: { description: "Coperto", icon: "☁️" },
  45: { description: "Nebbia", icon: "🌫️" },
  48: { description: "Nebbia con depositi di brina", icon: "🌫️" },
  51: { description: "Pioggia leggera", icon: "🌦️" },
  53: { description: "Pioggia moderata", icon: "🌦️" },
  55: { description: "Pioggia intensa", icon: "🌧️" },
  61: { description: "Pioggia leggera", icon: "🌦️" },
  63: { description: "Pioggia moderata", icon: "🌧️" },
  65: { description: "Pioggia intensa", icon: "🌧️" },
  71: { description: "Neve leggera", icon: "🌨️" },
  73: { description: "Neve moderata", icon: "🌨️" },
  75: { description: "Neve intensa", icon: "❄️" },
  80: { description: "Rovesci leggeri", icon: "🌦️" },
  81: { description: "Rovesci moderati", icon: "🌧️" },
  82: { description: "Rovesci violenti", icon: "🌧️" },
  95: { description: "Temporale", icon: "⛈️" },
  96: { description: "Temporale con grandine leggera", icon: "⛈️" },
  99: { description: "Temporale con grandine forte", icon: "⛈️" },
};

export function getWeatherDescription(code: number): string {
  return weatherDescriptions[code]?.description ?? "Condizioni sconosciute";
}

export function getWeatherIcon(code: number): string {
  return weatherDescriptions[code]?.icon ?? "❓";
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_gusts_10m&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Errore meteo: ${res.status}`);

  const json = await res.json();
  const c = json.current;

  return {
    temperature: c.temperature_2m,
    windSpeed: c.wind_speed_10m,
    windGusts: c.wind_gusts_10m,
    weatherCode: c.weather_code,
    precipitation: c.precipitation,
    humidity: c.relative_humidity_2m,
    pressure: c.pressure_msl,
  };
}