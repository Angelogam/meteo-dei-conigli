export interface HourlyPoint {
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
  uvIndex: number;
  isDay: number;
}

export interface DailySummary {
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
  thermalDelta: number;
  dayIndex: number;
}

export interface FullMeteoData {
  hourly: HourlyPoint[];
  daily: DailySummary[];
}

export interface LaunchSite {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number | null;
  exposure: string;
  valley: string;
  difficulty: number;
}

export const DECOLLI: LaunchSite[] = [
  { id: "malanotte", name: "Malanotte", lat: 44.2587, lon: 7.7943, elevation: 1740, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 3 },
  { id: "colle_di_tenda", name: "Colle di Tenda", lat: 44.1509, lon: 7.5693, elevation: 1870, exposure: "S", valley: "Valle Roya/Vermenagna", difficulty: 2 },
  { id: "boves", name: "Boves", lat: 44.3211, lon: 7.5447, elevation: 900, exposure: "S", valley: "Cuneese", difficulty: 1 },
  { id: "monte_male", name: "Monte Male – Dronero", lat: 44.4316, lon: 7.3629, elevation: 1500, exposure: "S", valley: "Valle Maira", difficulty: 3 },
  { id: "iretta", name: "Iretta", lat: 44.4989, lon: 7.3820, elevation: 1300, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "val_mala", name: "Pratoni di Val Mala", lat: 44.5078, lon: 7.3466, elevation: 1400, exposure: "S", valley: "Valle Maira", difficulty: 2 },
  { id: "birrone", name: "Monte Birrone", lat: 44.5399, lon: 7.2529, elevation: 2131, exposure: "S", valley: "Valle Maira", difficulty: 4 },
  { id: "agnello", name: "Colle dell'Agnello", lat: 44.6828, lon: 6.9782, elevation: 2748, exposure: "S", valley: "Valle Varaita", difficulty: 5 },
  { id: "pian_mune_alto", name: "Pian Munè – Seggiovia", lat: 44.6386, lon: 7.2309, elevation: 1870, exposure: "S/SW", valley: "Valle Po", difficulty: 2 },
  { id: "pian_mune_basso", name: "Pian Munè – Bric Lombatera", lat: 44.6574, lon: 7.2600, elevation: 1350, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "martiniana_po", name: "Martiniana Po", lat: 44.6069, lon: 7.3832, elevation: 900, exposure: "S", valley: "Valle Po", difficulty: 1 },
  { id: "rucas_alto", name: "Rucas alto", lat: 44.7421, lon: 7.2201, elevation: 1550, exposure: "S/SE", valley: "Valle Infernotto", difficulty: 2 },
  { id: "montoso_basso", name: "Montoso – decollo basso", lat: 44.7644, lon: 7.2498, elevation: 1250, exposure: "SE", valley: "Valle Infernotto", difficulty: 1 },
  { id: "vandalino", name: "Monte Vandalino", lat: 44.8367, lon: 7.1739, elevation: 2120, exposure: "S/SE", valley: "Val Pellice", difficulty: 4 },
  { id: "pian_dell_alpe", name: "Pian dell'Alpe", lat: 45.0639, lon: 7.0283, elevation: 1700, exposure: "S", valley: "Val Chisone", difficulty: 3 },
  { id: "roletto", name: "Roletto – Piggi", lat: 44.9325, lon: 7.3109, elevation: 820, exposure: "S", valley: "Pinerolese", difficulty: 1 },
  { id: "piossasco", name: "Piossasco – Monte S. Giorgio", lat: 44.9967, lon: 7.4480, elevation: 673, exposure: "S", valley: "Collina Torinese", difficulty: 1 },
  { id: "truccetti", name: "Truccetti", lat: 45.0797, lon: 7.3420, elevation: 900, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "val_della_torre", name: "Val della Torre", lat: 45.1626, lon: 7.4637, elevation: 970, exposure: "S", valley: "Val della Torre", difficulty: 1 },
  { id: "rocca_canavese", name: "Rocca Canavese – M. della Neve", lat: 45.3276, lon: 7.5728, elevation: 1100, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "s_elisabetta", name: "Santa Elisabetta", lat: 45.4183, lon: 7.6419, elevation: 900, exposure: "S", valley: "Canavese", difficulty: 1 },
  { id: "s_elisabetta_alto", name: "Santa Elisabetta alto", lat: 45.4402, lon: 7.6480, elevation: 1100, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "cavallaria", name: "Monte Cavallaria", lat: 45.5173, lon: 7.7988, elevation: 1300, exposure: "S", valley: "Canavese", difficulty: 2 },
  { id: "andrate", name: "Andrate", lat: 45.5506, lon: 7.8808, elevation: 1000, exposure: "S", valley: "Canavese", difficulty: 1 },
];

export const WEATHER_CODES: Record<number, string> = {
  0: "Sereno", 1: "Poco nuvoloso", 2: "Parzialmente nuvoloso", 3: "Nuvoloso",
  45: "Nebbia", 48: "Nebbia ghiacciata",
  51: "Pioviggine leggera", 53: "Pioviggine moderata", 55: "Pioviggine densa",
  61: "Pioggia leggera", 63: "Pioggia moderata", 65: "Pioggia forte",
  71: "Neve leggera", 73: "Neve moderata", 75: "Neve forte",
  80: "Rovescio di pioggia", 81: "Rovescio moderato", 82: "Rovescio forte",
  95: "Temporale", 96: "Temporale con grandine", 99: "Temporale forte con grandine",
};

export async function fetchMeteoCompleta(lat: number, lon: number): Promise<FullMeteoData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,dewpoint_2m,relativehumidity_2m,cloudcover,precipitation,visibility,` +
    `wind_speed_10m,wind_gusts_10m,wind_direction_10m,` +
    `uv_index,is_day,weathercode` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,` +
    `uv_index_max,precipitation_sum,precipitation_hours,` +
    `wind_speed_10m_max,wind_direction_10m_dominant` +
    `&timezone=auto&forecast_days=3`;

  const response = await fetch(url);
  const data = await response.json();

  const hours: HourlyPoint[] = data.hourly.time.map((time: string, index: number) => ({
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
    uvIndex: data.hourly.uv_index ? data.hourly.uv_index[index] : 0,
    isDay: data.hourly.is_day ? data.hourly.is_day[index] : 1,
  }));

  const daily: DailySummary[] = data.daily.time.map((date: string, index: number) => {
    const dayHours = hours.filter(h =>
      h.time.getDate() === new Date(date).getDate() &&
      h.time.getMonth() === new Date(date).getMonth()
    );
    const temps = dayHours.map(h => h.temperature).filter(t => t !== undefined && t !== null);
    const delta = temps.length > 0 ? Math.round(Math.max(...temps) - Math.min(...temps)) : 0;

    return {
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
      thermalDelta: delta,
      dayIndex: index,
    };
  });

  return { hourly: hours, daily };
}

export function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code] || "Variabile";
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

export function isWindFavorable(windDir: number, exposure: string): boolean {
  if (!exposure) return false;
  const windStr = getWindDirection(windDir);
  const expDirs = exposure.split('/').map(d => d.trim());
  return expDirs.some(exp => windStr === exp || windStr === exp + 'E' || windStr === exp + 'W');
}

export function getThermalStrength(temp: number, cloudCover: number, humidity: number, thermalDelta: number): { label: string; value: number } {
  let score = 0;
  if (temp > 25) score += 3;
  else if (temp > 20) score += 2;
  else if (temp > 15) score += 1;
  if (cloudCover < 20) score += 3;
  else if (cloudCover < 40) score += 2;
  else if (cloudCover < 60) score += 1;
  if (humidity < 40) score += 2;
  else if (humidity < 60) score += 1;
  if (thermalDelta > 12) score += 2;
  else if (thermalDelta > 8) score += 1;

  let label: string;
  if (score >= 7) label = "Forti – ottime per cross";
  else if (score >= 5) label = "Medie – buona attività";
  else if (score >= 3) label = "Deboli – poca attività";
  else label = "Assenti – nessuna termica";

  return { label, value: Math.min(score, 10) };
}

export function getCrossCountryRating(thermalScore: number, windSpeed: number, cloudCover: number, visibility: number): { label: string; value: number } {
  let score = 0;
  if (thermalScore >= 7) score += 3;
  else if (thermalScore >= 5) score += 2;
  else if (thermalScore >= 3) score += 1;
  if (windSpeed >= 10 && windSpeed <= 25) score += 2;
  else if (windSpeed < 10) score += 1;
  if (cloudCover < 30) score += 2;
  else if (cloudCover < 60) score += 1;
  if (visibility > 20) score += 2;
  else if (visibility > 10) score += 1;

  let label: string;
  if (score >= 7) label = "Eccellente";
  else if (score >= 5) label = "Buono";
  else if (score >= 3) label = "Discreto";
  else label = "Sconsigliato";

  return { label, value: Math.min(score, 10) };
}

export interface FlightAdvice {
  wind: string;
  thermal: string;
  clouds: string;
  precipitation: string;
  visibility: string;
  windDir: string;
  crossCountry: string;
  siteDifficulty: string;
}

export function getFlightAdvice(
  currentData: { windSpeed: number; temperature: number; cloudCover: number; humidity: number; precipitation: number; visibility: number; windDir: number },
  thermalDelta: number,
  site: LaunchSite
): FlightAdvice {
  const thermal = getThermalStrength(currentData.temperature, currentData.cloudCover, currentData.humidity, thermalDelta);
  const cross = getCrossCountryRating(thermal.value, currentData.windSpeed, currentData.cloudCover, currentData.visibility);

  let wind: string;
  if (currentData.windSpeed > 30) wind = "Vento forte – Pericoloso";
  else if (currentData.windSpeed > 25) wind = "Vento sostenuto – Serve esperienza";
  else if (currentData.windSpeed < 5) wind = "Vento debole – Possibili difficoltà";
  else if (currentData.windSpeed >= 10 && currentData.windSpeed <= 20) wind = "Vento ideale per volare";
  else wind = "Vento moderato – Gestibile";

  let clouds: string;
  if (currentData.cloudCover < 20) clouds = "Cielo sereno – Visibilità ottima";
  else if (currentData.cloudCover < 50) clouds = "Nuvole moderate – Buone condizioni";
  else if (currentData.cloudCover < 80) clouds = "Cielo nuvoloso – Termiche ridotte";
  else clouds = "Cielo coperto – Condizioni difficili";

  let precipitation: string;
  if (currentData.precipitation > 0) precipitation = `Precipitazioni: ${currentData.precipitation.toFixed(1)} mm/h – Volo sconsigliato`;
  else precipitation = "Nessuna precipitazione – ✅";

  let visibility: string;
  if (currentData.visibility < 5) visibility = "Visibilità ridotta – Attenzione";
  else if (currentData.visibility > 20) visibility = "Visibilità eccellente";
  else visibility = "Visibilità discreta";

  let windDir: string;
  if (site.exposure && isWindFavorable(currentData.windDir, site.exposure)) windDir = "Vento favorevole al sito";
  else if (site.exposure) windDir = "Vento non favorevole – Possibile turbolenza";
  else windDir = "Esposizione non definita";

  let siteDifficulty: string;
  if (site.difficulty >= 4) siteDifficulty = "Sito difficile – Serve esperienza avanzata";
  else if (site.difficulty >= 3) siteDifficulty = "Sito moderato";
  else siteDifficulty = "Sito facile – Adatto a principianti";

  return {
    wind,
    thermal: thermal.label,
    clouds,
    precipitation,
    visibility,
    windDir,
    crossCountry: cross.label,
    siteDifficulty,
  };
}