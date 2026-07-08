export interface Launch {
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  valley: string;
  exposure: string;
  windSectors: string[];
}

export interface DailyForecast {
  tempMax: number;
  tempMin: number;
  windSpeed: number;
  windDir: string;
  gusts: number | null;
  cloudCover: number;
  humidity: number;
  precipitation: number;
  visibility: number;
  description: string;
  icon: string;
  thermalLabel: string;
  thermalQuality: number;
  deltaT: number;
  xcLabel: string;
  xcScore: number;
  plafond: number | null;
  tips: string[];
}

export const launches: Launch[] = [
  { name: "Malanotte", lat: 44.4157, lng: 7.1333, elevation: 1740, valley: "Valle Infernotto", exposure: "S/SE", windSectors: ["S", "SE", "E"] },
  { name: "Pian del Re", lat: 44.4319, lng: 7.1278, elevation: 1850, valley: "Valle Infernotto", exposure: "S", windSectors: ["S", "SW", "SE"] },
  { name: "Colle della Vaccera", lat: 44.9317, lng: 7.2169, elevation: 1530, valley: "Val Chisone", exposure: "S", windSectors: ["S", "SW"] },
  { name: "Bric di Rubiana", lat: 45.1347, lng: 7.2689, elevation: 1380, valley: "Val di Susa", exposure: "S", windSectors: ["S", "SW", "SE"] },
  { name: "Monte Ciabergia", lat: 44.3997, lng: 7.1361, elevation: 1680, valley: "Valle Infernotto", exposure: "S", windSectors: ["S", "SE"] },
  { name: "Pian del Frais", lat: 44.4261, lng: 7.1339, elevation: 1620, valley: "Valle Infernotto", exposure: "S", windSectors: ["S", "SW"] },
  { name: "Lagnacco", lat: 46.2125, lng: 13.3317, elevation: 280, valley: "Friuli", exposure: "S", windSectors: ["S", "SW"] },
  { name: "Monte Sant'Anna", lat: 46.2058, lng: 13.32, elevation: 340, valley: "Friuli", exposure: "S/SE", windSectors: ["S", "SE"] },
  { name: "Monte Cuarnan", lat: 46.1917, lng: 13.31, elevation: 480, valley: "Friuli", exposure: "S/SE", windSectors: ["S", "SE", "E"] },
  { name: "Gorizzo", lat: 45.8711, lng: 12.8894, elevation: 15, valley: "Pianura Friulana", exposure: "S", windSectors: ["S", "SW", "E"] },
  { name: "Fontanafredda", lat: 45.97, lng: 12.59, elevation: 30, valley: "Pianura PN", exposure: "S", windSectors: ["S", "SW"] },
  { name: "Cimpello", lat: 45.9131, lng: 12.6239, elevation: 20, valley: "Pianura PN", exposure: "S", windSectors: ["S", "SW"] },
  { name: "San Remigio", lat: 45.9333, lng: 12.6167, elevation: 50, valley: "Pianura PN", exposure: "S", windSectors: ["S", "SW", "E"] },
];

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

function getIcon(cloudCover: number, precipitation: number): string {
  if (precipitation > 5) return "rain";
  if (precipitation > 0.2) return "cloud-sun";
  if (cloudCover < 20) return "sun";
  if (cloudCover < 60) return "cloud-sun";
  return "cloud";
}

function getDescription(icon: string): string {
  const map: Record<string, string> = {
    sun: "Sereno",
    "cloud-sun": "Poco nuvoloso",
    cloud: "Nuvoloso",
    rain: "Pioggia",
    thunder: "Temporale",
    snow: "Neve",
    fog: "Nebbia",
  };
  return map[icon] || "—";
}

function estimateThermal(deltaT: number, windSpeed: number, cloudCover: number): { label: string; quality: number } {
  let score = 0;
  if (deltaT >= 6) score += 3;
  else if (deltaT >= 4) score += 2;
  else if (deltaT >= 2) score += 1;
  if (windSpeed < 8) score += 2;
  else if (windSpeed < 15) score += 1;
  if (cloudCover < 30) score += 2;
  else if (cloudCover < 60) score += 1;
  if (score >= 6) return { label: "Ottime", quality: 4 };
  if (score >= 4) return { label: "Buone", quality: 3 };
  if (score >= 2) return { label: "Deboli", quality: 2 };
  return { label: "Assenti", quality: 1 };
}

function estimateXc(deltaT: number, windSpeed: number, cloudCover: number): { label: string; score: number } {
  let s = 0;
  if (deltaT >= 5) s += 2;
  else if (deltaT >= 3) s += 1;
  if (windSpeed >= 8 && windSpeed <= 20) s += 2;
  if (cloudCover >= 20 && cloudCover <= 60) s += 1;
  if (s >= 4) return { label: "Ottimo", score: 4 };
  if (s >= 3) return { label: "Buono", score: 3 };
  if (s >= 1) return { label: "Mediocre", score: 2 };
  return { label: "Sconsigliato", score: 1 };
}

function estimatePlafond(deltaT: number, cloudCover: number, elevation: number): number | null {
  if (cloudCover >= 80) return Math.round(elevation + deltaT * 100 + 200);
  return Math.round(elevation + deltaT * 150 + 500);
}

function buildTips(opts: {
  windSpeed: number;
  gusts: number | null;
  cloudCover: number;
  thermalQuality: number;
  precipitation: number;
  visibility: number;
  deltaT: number;
  windDir: string;
  launchName: string;
  windSectors: string[];
}): string[] {
  const tips: string[] = [];
  if (opts.windSpeed > 25) tips.push("💨 Vento forte — valuta se decollare");
  if (opts.windSpeed < 3) tips.push("🍃 Vento debole — potresti aver bisogno di aiuto");
  if (opts.gusts && opts.gusts > 30) tips.push("⚡ Raffiche sostenute — massima attenzione");
  if (opts.cloudCover > 70) tips.push("☁️ Cielo molto nuvoloso — portati via cavo");
  if (opts.cloudCover < 20 && opts.thermalQuality >= 2) tips.push("🔆 Bel sole — termiche attese");
  if (opts.precipitation > 0.2) tips.push("🌧️ Precipitazioni in arrivo — monitora");
  if (opts.visibility < 5) tips.push("🌫️ Visibilità ridotta — stai vicino");
  if (opts.deltaT < 2) tips.push("❄️ Delta termico basso — termiche difficili");
  if (opts.deltaT > 6) tips.push("🔥 Delta termico alto — termiche forti, atterra prima");
  if (opts.windSectors.length > 0 && !opts.windSectors.some((s) => opts.windDir.includes(s))) {
    tips.push(`🧭 Vento da ${opts.windDir} non ideale per ${opts.launchName}`);
  }
  return tips;
}

export async function fetchWeatherForecast(launch: Launch): Promise<DailyForecast[]> {
  const lat = launch.lat.toFixed(4);
  const lng = launch.lng.toFixed(4);
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const end = new Date(now);
  end.setDate(end.getDate() + 2);
  const threeDays = end.toISOString().split("T")[0];

  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lng}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode` +
    `&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover,visibility` +
    `&timezone=auto&start_date=${today}&end_date=${threeDays}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ha risposto con codice ${res.status}`);

  const data = await res.json();
  const daily = data.daily;
  const hourly = data.hourly;

  if (!daily || !daily.time || daily.time.length === 0) {
    throw new Error("Nessun dato ricevuto da Open-Meteo");
  }

  const days: DailyForecast[] = [];

  for (let d = 0; d < Math.min(daily.time.length, 3); d++) {
    const dayStart = d * 24;
    const dayEnd = dayStart + 24;

    const avg = (arr: (number | undefined | null)[]): number => {
      const vals = arr.filter((v): v is number => v != null && !isNaN(v));
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    const indices: number[] = [];
    for (let h = dayStart; h < dayEnd; h++) {
      if (hourly.time && hourly.time[h]) indices.push(h);
    }

    const winds = indices.map((i) => hourly.wind_speed_10m[i]);
    const windDirs = indices.map((i) => hourly.wind_direction_10m[i]);
    const clouds = indices.map((i) => hourly.cloud_cover[i]);
    const humidities = indices.map((i) => hourly.relative_humidity_2m[i]);
    const visibilities = indices.map((i) => hourly.visibility[i]);

    const windAvg = avg(winds);
    const windDirAvg = avg(windDirs);
    const cloudAvg = avg(clouds);
    const humidityAvg = avg(humidities);
    const visibilityAvg = avg(visibilities);
    const visibilityKm = Math.round(visibilityAvg / 1000);
    const gustsAvg = avg(winds.map((w) => (w ?? 0) * 1.35));

    const centralIndices = [11, 12, 13, 14, 15, 16]
      .filter((h) => h + dayStart < dayEnd)
      .map((h) => dayStart + h);
    const centralTemps = centralIndices.map((h) => hourly.temperature_2m[h]);
    const avgTemp = avg(centralTemps);

    const deltaT = Math.round((avgTemp - (launch.elevation / 100) * 0.65) * 10) / 10;

    const dailyPrecip = daily.precipitation_sum[d] ?? 0;
    const dailyTempMax = daily.temperature_2m_max[d] ?? 0;
    const dailyTempMin = daily.temperature_2m_min[d] ?? 0;

    const icon = getIcon(cloudAvg, dailyPrecip);
    const desc = getDescription(icon);
    const thermal = estimateThermal(deltaT, windAvg, cloudAvg);
    const xc = estimateXc(deltaT, windAvg, cloudAvg);
    const plafond = estimatePlafond(deltaT, cloudAvg, launch.elevation);
    const windDirStr = windDirAvg != null ? degreesToCompass(windDirAvg) : "—";

    const day: DailyForecast = {
      tempMax: Math.round(dailyTempMax),
      tempMin: Math.round(dailyTempMin),
      windSpeed: Math.round(windAvg * 10) / 10,
      windDir: windDirStr,
      gusts: Math.round(gustsAvg * 10) / 10,
      cloudCover: Math.round(cloudAvg),
      humidity: Math.round(humidityAvg),
      precipitation: Math.round(dailyPrecip * 10) / 10,
      visibility: visibilityKm,
      description: desc,
      icon,
      thermalLabel: thermal.label,
      thermalQuality: thermal.quality,
      deltaT,
      xcLabel: xc.label,
      xcScore: xc.score,
      plafond,
      tips: buildTips({
        windSpeed: windAvg,
        gusts: Math.round(gustsAvg * 10) / 10,
        cloudCover: cloudAvg,
        thermalQuality: thermal.quality,
        precipitation: dailyPrecip,
        visibility: visibilityKm,
        deltaT,
        windDir: windDirStr,
        launchName: launch.name,
        windSectors: launch.windSectors,
      }),
    };

    days.push(day);
  }

  return days;
}