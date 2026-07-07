interface MiniMapProps {
  lat: number;
  lon: number;
  size?: number;
}

/**
 * Stylized mountain silhouette + marker for launch site
 * Uses a local coordinate system with terrain contour approximation
 */
export function MiniMap({ lat, lon, size = 120 }: MiniMapProps) {
  // Generate a unique but consistent mountain silhouette based on lat/lon
  const seed = ((lat * 100 + lon * 100) % 100) / 100;

  const generatePath = (offset: number, height: number, width: number) => {
    const points: string[] = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const baseY = height * 0.6;
      const noise1 = Math.sin((i / steps) * Math.PI * 2 + offset * 5) * height * 0.15;
      const noise2 = Math.sin((i / steps) * Math.PI * 4 + offset * 8) * height * 0.08;
      const noise3 = Math.sin((i / steps) * Math.PI * 8 + offset * 3) * height * 0.05;
      const y = baseY + noise1 + noise2 + noise3;
      points.push(`${x},${y}`);
    }
    const peakIndex = points.length - 1;
    // Draw down to right edge then close
    return points.join(" ") + ` ${width},${height} 0,${height}`;
  };

  const path1 = generatePath(seed, size * 0.6, size);
  const path2 = generatePath(seed + 0.3, size * 0.4, size);
  const path3 = generatePath(seed + 0.6, size * 0.25, size);

  const markerX = size * 0.5;
  const markerY = size * 0.4;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-lg"
    >
      {/* Background */}
      <rect width={size} height={size} fill="#0a0a14" rx="8" />

      {/* Mountain silhouettes */}
      <polygon
        points={path1}
        fill="none"
        stroke="#1a2a3a"
        strokeWidth="1.5"
        opacity="0.8"
      />
      <polygon
        points={path2}
        fill="none"
        stroke="#152030"
        strokeWidth="1"
        opacity="0.6"
      />
      <polygon
        points={path3}
        fill="none"
        stroke="#101828"
        strokeWidth="0.8"
        opacity="0.4"
      />

      {/* Launch site marker */}
      <circle
        cx={markerX}
        cy={markerY}
        r="4"
        fill="#00FF8C"
        opacity="0.9"
      />
      <circle
        cx={markerX}
        cy={markerY}
        r="8"
        fill="none"
        stroke="#00FF8C"
        strokeWidth="1"
        opacity="0.3"
      />
      <circle
        cx={markerX}
        cy={markerY}
        r="12"
        fill="none"
        stroke="#00FF8C"
        strokeWidth="0.5"
        opacity="0.15"
      />

      {/* Decorative dots (stars) */}
      <circle cx="12" cy="15" r="0.8" fill="white" opacity="0.3" />
      <circle cx={size - 18} cy="20" r="0.6" fill="white" opacity="0.2" />
      <circle cx={size * 0.3} cy="12" r="0.5" fill="white" opacity="0.25" />
      <circle cx={size * 0.7} cy="18" r="0.7" fill="white" opacity="0.15" />
    </svg>
  );
}
