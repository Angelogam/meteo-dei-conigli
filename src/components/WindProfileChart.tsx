import { useMemo } from "react";

interface WindProfileChartProps {
  surfaceWind: { speed: number; direction: number };
  wind1500m: { speed: number; direction: number };
  wind2500m: { speed: number; direction: number };
  wind3500m: { speed: number; direction: number };
}

function windDegToArrow(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function getWindColor(speed: number): string {
  if (speed < 8) return "#4DA3FF";
  if (speed < 15) return "#4DA3FF";
  if (speed < 25) return "#FFC857";
  if (speed < 35) return "#FF9F1C";
  return "#FF4E4E";
}

function WindArrowSVG({ direction, speed }: { direction: number; speed: number }) {
  const color = getWindColor(speed);
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0">
      <line
        x1="11" y1="18" x2="11" y2="7"
        stroke={color} strokeWidth="2"<dyad-write path="src/components/WindProfileChart.tsx" description="Grafico vento verticale pulito, con altitudini a sinistra e barre colorate">
import { useMemo } from "react";

interface WindProfileChartProps {
  surfaceWind: { speed: number; direction: number };
  wind1500m: { speed: number; direction: number };
  wind2500m: { speed: number; direction: number };
  wind3500m: { speed: number; direction: number };
}

function windDegToArrow(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function getWindColor(speed: number): string {
  if (speed < 8) return "#4DA3FF";
  if (speed < 15) return "#4DA3FF";
  if (speed < 25) return "#FFC857";
  if (speed < 35) return "#FF9F1C";
  return "#FF4E4E";
}

function WindArrowSVG({ direction, speed }: { direction: number; speed: number }) {
  const color = getWindColor(speed);
  const angleRad = (direction * Math.PI) / 180;
  const arrowLen = 9;
  const dx = arrowLen * Math.sin(angleRad);
  const dy = -arrowLen * Math.cos(angleRad);

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0">
      <circle cx="11" cy="11" r="2.5" fill={color} opacity="0.25" />
      <line x1="11" y1="11" x2={11 + dx} y2={11 + dy} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polygon
        points={`${11 + dx},${11 + dy} ${11 + dx * 0.6 - 2.5 * Math.cos(angleRad)},${11 + dy * 0.6 + 2.5 * Math.sin(angleRad)} ${11 + dx * 0.6 + 2.5 * Math.cos(angleRad)},${11 + dy * 0.6 - 2.5 * Math.sin(angleRad)}`}
        fill={color}
      />
    </svg>
  );
}

function WindLevelRow({ label, speed, direction }: { label: string; speed: number; direction: number }) {
  const color = getWindColor(speed);
  const pct = Math.min(100, (speed / 50) * 100);
  const arrow = windDegToArrow(direction);

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-right shrink-0">
        <span className="text-[11px] font-semibold text-white/50 font-mono">{label}</span>
      </div>
      <WindArrowSVG direction={direction} speed={speed} />
      <div className="flex-1 h-7 rounded-xl bg-white/[0.03] overflow-hidden relative">
        <div
          className="h-full rounded-xl transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}30`,
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-[11px] font-mono font-bold text-white/90 drop-shadow-md">
            {speed.toFixed(0)} km/h
          </span>
          <span className="text-[10px] font-mono font-semibold text-white/90 drop-shadow-md">
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
  const levels = useMemo(() => [
    { label: "3.500 m", speed: wind3500m.speed, direction: wind3500m.direction },
    { label: "2.500 m", speed: wind2500m.speed, direction: wind2500m.direction },
    { label: "1.500 m", speed: wind1500m.speed, direction: wind1500m.direction },
    { label: "Suolo", speed: surfaceWind.speed, direction: surfaceWind.direction },
  ], [surfaceWind, wind1500m, wind2500m, wind3500m]);

  return (
    <div className="w-full space-y-3">
      {levels.map((level) => (
        <WindLevelRow key={level.label} {...level} />
      ))}
    </div>
  );
}