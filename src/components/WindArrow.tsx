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
  // Returns stroke width modifier
  if (speed < 5) return 1;
  if (speed < 15) return 1.5;
  if (speed < 25) return 2;
  if (speed < 35) return 2.5;
  return 3;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function WindArrow({ direction, speed, size = "md", showSpeed = true, height }: WindArrowProps) {
  const px = height || sizeMap[size];
  const color = getWindColor(speed);
  const intensity = getWindIntensity(speed);

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
        <svg
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: `drop-shadow(0 0 3px ${color}40)` }}
        >
          {/* Arrow shaft */}
          <line
            x1="12"
            y1="22"
            x2="12"
            y2="6"
            stroke={color}
            strokeWidth={intensity}
            strokeLinecap="round"
            opacity={0.8}
          />
          {/* Arrow head */}
          <path
            d="M12 2L6 10H18L12 2Z"
            fill={color}
            opacity={0.9}
          />
          {/* Wind speed indicator lines */}
          {speed > 5 && (
            <>
              <line
                x1={12 - intensity * 2}
                y1={18}
                x2={12 + intensity * 2}
                y2={18}
                stroke={color}
                strokeWidth={1}
                opacity={0.5}
              />
              {speed > 15 && (
                <line
                  x1={12 - intensity * 2.5}
                  y1={15}
                  x2={12 + intensity * 2.5}
                  y2={15}
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.4}
                />
              )}
              {speed > 25 && (
                <line
                  x1={12 - intensity * 3}
                  y1={12}
                  x2={12 + intensity * 3}
                  y2={12}
                  stroke={color}
                  strokeWidth={1}
                  opacity={0.3}
                />
              )}
            </>
          )}
        </svg>
      </div>
      {showSpeed && (
        <span className="text-[10px] font-mono text-white/60">
          {speed.toFixed(0)} km/h
        </span>
      )}
    </div>
  );
}
