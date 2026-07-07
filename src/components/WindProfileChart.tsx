import { useMemo } from "react";

interface WindLevel {
  altitude: string;
  speed: number;
  direction: number;
}

interface WindProfileChartProps {
  surfaceWind: { speed: number; direction: number };
  wind1500m: { speed: number; direction: number };
  wind2500m: { speed: number; direction: number };
  wind3500m: { speed: number; direction: number };
}

const ALTITUDE_LABELS = ["4.000 m", "3.000 m", "2.000 m", "1.000 m", "Suolo"];
const WIND_X_POSITIONS = [0, 20, 40, 60, 80, 100]; // percentuali

function windDegToArrow(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

// Da km/h a "forza Beaufort" semplificata per colore
function getWindColor(speed: number): string {
  if (speed < 5) return "#00FF8C";
  if (speed < 15) return "#4DA3FF";
  if (speed < 25) return "#FFC857";
  if (speed < 35) return "#FF9F1C";
  return "#FF4E4E";
}

function getWindIntensity(speed: number): number {
  // lunghezza della barra orizzontale (0–100% della cella)
  return Math.min(100, (speed / 50) * 100);
}

function WindArrowSVG({ direction, speed }: { direction: number; speed: number }) {
  const color = getWindColor(speed);
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
      <defs>
        <marker id={`arrowhead-${Math.round(direction)}-${Math.round(speed)}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={color} />
        </marker>
      </defs>
      <line
        x1="14" y1="14"
        x2={14 + 10 * Math.sin((direction * Math.PI) / 180)}
        y2={14 - 10 * Math.cos((direction * Math.PI) / 180)}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        markerEnd={`url(#arrowhead-${Math.round(direction)}-${Math.round(speed)})`}
      />
      <circle cx="14" cy="14" r="3" fill={color} opacity="0.3" />
    </svg>
  );
}

function WindLevelBar({ speed, direction }: { speed: number; direction: number }) {
  const pct = getWindIntensity(speed);
  const color = getWindColor(speed);
  const arrow = windDegToArrow(direction);

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Freccia direzionale */}
      <WindArrowSVG direction={direction} speed={speed} />
      {/* Barra intensità */}
      <div className="flex-1 h-6 rounded-full bg-white/[0.04] overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
        {/* Etichetta velocità + direzione */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-[11px] font-mono font-bold text-white/80 drop-shadow-md">
            {speed.toFixed(0)} km/h
          </span>
          <span className="text-[10px] font-mono font-semibold text-white/90 drop-shadow-md" style={{ color }}>
            {arrow}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WindProfileChart({
  surfaceWind,
  wind1500m,
  wind2500m,
  wind3500m,
}: WindProfileChartProps) {
  const levels: WindLevel[] = useMemo(() => [
    { altitude: "3.500 m", speed: wind3500m.speed, direction: wind3500m.direction },
    { altitude: "2.500 m", speed: wind2500m.speed, direction: wind2500m.direction },
    { altitude: "1.500 m", speed: wind1500m.speed, direction: wind1500m.direction },
    { altitude: "Suolo", speed: surfaceWind.speed, direction: surfaceWind.direction },
  ], [surfaceWind, wind1500m, wind2500m, wind3500m]);

  return (
    <div className="w-full space-y-3">
      {levels.map((level) => (
        <div key={level.altitude} className="flex items-center gap-4">
          {/* Etichetta altitudine a sinistra */}
          <div className="w-20 text-right shrink-0">
            <span className="text-xs font-semibold text-white/50 font-mono">
              {level.altitude}
            </span>
          </div>
          {/* Barra vento */}
          <div className="flex-1">
            <WindLevelBar speed={level.speed} direction={level.direction} />
          </div>
        </div>
      ))}
    </div>
  );
}