import { useEffect, useState } from "react";
import { getQualityColor, getQualityLabel } from "@/utils/weatherCalculations";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface QualityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
}

function getGlowColor(score: number, color: string): string {
  if (score >= 4) return `${color}80`;
  return `${color}40`;
}

function getQualityIcon(score: number) {
  if (score >= 4) return ArrowUp;
  if (score >= 2.5) return Minus;
  return ArrowDown;
}

export function QualityBadge({ score, size = "md", animated = true, showLabel = true }: QualityBadgeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [visible, setVisible] = useState(false);

  const color = getQualityColor(score);
  const Icon = getQualityIcon(score);
  const label = getQualityLabel(score);

  const sizePx = size === "sm" ? 36 : size === "md" ? 48 : 64;
  const fontSize = size === "sm" ? "text-xs" : size === "md" ? "text-base" : "text-xl";

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      setVisible(true);
      return;
    }

    setVisible(false);
    const showTimer = setTimeout(() => setVisible(true), 100);
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(score * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    return () => clearTimeout(showTimer);
  }, [score, animated]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-full flex items-center justify-center transition-all duration-500"
        style={{
          width: sizePx,
          height: sizePx,
          backgroundColor: `${color}15`,
          border: `2px solid ${color}`,
          boxShadow: visible ? `0 0 20px ${getGlowColor(score, color)}` : "none",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.5)",
        }}
      >
        <span
          className={`font-bold font-mono ${fontSize} transition-all duration-500`}
          style={{ color }}
        >
          {Math.round(displayScore)}
        </span>
      </div>
      {showLabel && (
        <div className="flex items-center gap-1">
          <Icon size={10} color={color} />
          <span className="text-[9px] font-medium uppercase tracking-wider" style={{ color }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
