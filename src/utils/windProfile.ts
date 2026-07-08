import { HourlyData } from "./meteo";

export interface WindLevel {
  altitude: number;   // mslm
  speed: number;      // km/h
  direction: number;  // gradi
}

/* Quote standard Open-Meteo (geopotential ~ altezza mslm approssimata) più interpolazione */
const STANDARD_LEVELS = [
  { altitude: 10,     speedKey: "windSpeed" as const,  dirKey: "windDir" as const },
  { altitude: 80,     speedKey: "wind80m" as const,    dirKey: "windDir80m" as const },
  { altitude: 120,    speedKey: "wind120m" as const,   dirKey: "windDir120m" as const },
];

/* Stepping da suolo (es. 1500 m base decollo) a 4000 m ogni 250 m */
export function computeWindProfile(
  hourData: HourlyData,
  groundAltitude: number = 1500
): WindLevel[] {
  const levels: WindLevel[] = [];

  // Livelli misurati direttamente da Open-Meteo (convertiti da m a km/h già lo sono)
  const measured: { alt: number; speed: number; dir: number }[] = [];

  if (hourData.windSpeed != null) {
    measured.push({ alt: groundAltitude + 10, speed: hourData.windSpeed, dir: hourData.windDir });
  }
  if (hourData.wind80m != null) {
    measured.push({ alt: groundAltitude + 80, speed: hourData.wind80m, dir: hourData.windDir80m ?? hourData.windDir });
  }
  if (hourData.wind120m != null) {
    measured.push({ alt: groundAltitude + 120, speed: hourData.wind120m, dir: hourData.windDir120m ?? hourData.windDir });
  }

  if (measured.length === 0) return [];

  // Aggiungo un punto di riferimento: a 4000m assumiamo vento +30% direzione simile
  const topSpeed = Math.round(measured[measured.length - 1].speed * 1.35);
  measured.push({ alt: 4000, speed: topSpeed, dir: measured[measured.length - 1].dir });

  // Interpolazione lineare tra i punti misurati per ogni step da groundAltitude a 4000
  for (let alt = groundAltitude; alt <= 4000; alt += 250) {
    // Trovo i due punti misurati che circondano questa quota
    let lower = measured[0];
    let upper = measured[measured.length - 1];

    for (let i = 0; i < measured.length - 1; i++) {
      if (measured[i].alt <= alt && measured[i + 1].alt >= alt) {
        lower = measured[i];
        upper = measured[i + 1];
        break;
      }
    }

    const ratio = (alt - lower.alt) / (upper.alt - lower.alt || 1);
    const speed = Math.round(lower.speed + (upper.speed - lower.speed) * ratio);
    // Direzione interpolata con attenzione al wrapping 0/360
    let dirDiff = upper.dir - lower.dir;
    if (dirDiff > 180) dirDiff -= 360;
    if (dirDiff < -180) dirDiff += 360;
    let dir = lower.dir + dirDiff * ratio;
    if (dir < 0) dir += 360;
    if (dir >= 360) dir -= 360;
    dir = Math.round(dir);

    levels.push({ altitude: Math.round(alt), speed, direction: dir });
  }

  return levels;
}