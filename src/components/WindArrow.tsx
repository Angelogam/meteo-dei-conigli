import { ArrowUp } from "lucide-react";

interface WindArrowProps {
  direction: number; // degrees
  speed: number; // km/h
  size?: "sm" | "md" | "lg";
  showSpeed?: boolean;
  height?: number;
}

function getWindColor(speed: number): string {
  if (speed < 8) return "#4DA3FF";
  if (speed < 15) return "#4DA3FF";
  if (speed < 25) return "#FFC857";
  if (speed < 35) return "#FF9F1C";
  return "#FF4E4E";
}

function getWindIntensity(speed: number): number {
  if (speed < 5) return 1;
  if (speed < 15) return 1.5;
  if (speed < 25) return 2;
  if (speed < 35) return 2.5;
  return 3;
}

const sizeMap = { sm: 16, md: 24, lg: 32 };

export function WindArrow({ direction, speed, size = "md", showSpeed = true, height }: WindArrowProps) {
  const px = height || sizeMap[size];
  const color = getWindColor(speed);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="transition-transform duration-700 ease-out"
        style={{
          transform: `rotate(${direction}deg)`,
          width: px,
          height: px,
        }}
      >
        <svg width={px} height={px} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="22" x2="12" y2="8" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
          <path d="M12 2L6 10H18L12 2Z" fill={color} opacity={0.9} />
          {speed > 5 && (
            <line x1={12 - 3} y1={18} x2={12 + 3} y2={18} stroke={color} strokeWidth={1} opacity={0.4} />
          )}
          {speed > 15 && (
            <line x1={12 - 4} y1={15} x2={12 + 4} y2={15} stroke={color} strokeWidth={1} opacity={0.3} />
          )}
          {speed > 25 && (
            <line x1={12 - 5} y1={12} x2={12 + 5} y2={12} stroke={color} strokeWidth={1} opacity={0.2} />
          )}
        </svg>
      </div>
      {showSpeed && (
        <span className="text-[10px] font-mono text-white/50">{speed.toFixed(0)} km/h</span>
      )}
    </div>
  );
}