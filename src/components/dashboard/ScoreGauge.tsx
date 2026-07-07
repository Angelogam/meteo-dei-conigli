import { getQualityColor, getQualityLabel } from "@/utils/weatherCalculations";
import { useAnimatedNumber } from "@/hooks/useAnimationOnMount";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

export function ScoreGauge({ score, size = "md", showLabel = true, animated = true }: ScoreGaugeProps) {
  const displayScore = useAnimatedNumber(score, 800, animated);
  const color = getQualityColor(score);
  const label = getQualityLabel(score);

  const dimensions = size === "sm" ? 48 : size === "md" ? 64 : 88;
  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(displayScore, 5) / 5);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: dimensions, height: dimensions }}>
        {/* Sfondo cerchio */}
        <svg width={dimensions} height={dimensions} className="transform -rotate-90">
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color}60)`,
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
        {/* Numero centrale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold font-mono transition-all duration-500"
            style={{
              color,
              fontSize: size === "sm" ? "14px" : size === "md" ? "18px" : "24px",
            }}
          >
            {Math.round(displayScore)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}