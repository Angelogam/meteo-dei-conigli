import { useState, useEffect } from "react";
import { getQualityColor, getQualityLabel } from "@/utils/weatherCalculations";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface QualityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showLabel?: boolean;
}

function getQualityIcon(score: number) {
  if (score >= 4) return ArrowUp;
  if (score >= 2.5) return Minus;
  return ArrowDown;
}

function getIconColor(score: number) {
  if (score >= 4) return "#00FF8C";
  if (score >= 2.5) return "#FFC857";
  return "#FF4E4E";
}

export function QualityBadge({ score, size = "md", animated = true, showLabel = true }: QualityBadgeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [visible, setVisible] = useState(false);

  const color = getQualityColor(score);
  const Icon = getQualityIcon(score);
  const iconColor = getIconColor(score);
  const label = getQualityLabel(score);

  const sizePx = size === "sm" ? 40 : size === "md" ? 52 : 72;
  const fontSize = size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-3xl";
  const iconSize = size === "sm" ? 10 : size === "md" ? 12 : 14;

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      setVisible(true);
      return;
    }
    setVisible(false);
    const showTimer = setTimeout(() => setVisible(true), 100);
    const startTime = Date.now();
    const duration = 700;

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
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="rounded-full flex items-center justify-center transition-all duration-500"
        style={{
          width: sizePx,
          height: sizePx,
          background: `radial-gradient(circle at center, ${color}12, ${color}06)`,
          border: `1.5px solid ${color}40`,
          boxShadow: visible
            ? `0 0 ${size === "lg" ? "24px" : "14px"} ${color}25, inset 0 0 ${size === "lg" ? "12px" : "6px"} ${color}08`
            : "none",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.5)",
        }}
      >
        <span
          className={`font-bold font-mono tracking-tight ${fontSize} transition-all duration-500`}
          style={{ color }}
        >
          {Math.round(displayScore)}
        </span>
      </div>
      {showLabel && (
        <div className="flex items-center gap-1">
          <Icon size={iconSize} color={iconColor} />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: `${color}CC` }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}