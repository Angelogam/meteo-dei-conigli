const SunIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="5" fill={color} opacity="0.9" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const x1 = 12 + 7 * Math.cos(rad);
      const y1 = 12 + 7 * Math.sin(rad);
      const x2 = 12 + 9.5 * Math.cos(rad);
      const y2 = 12 + 9.5 * Math.sin(rad);
      return (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          <animate attributeName="opacity" values="0.7;1;0.7" dur={`${1 + i * 0.2}s`} repeatCount="indefinite" />
        </line>
      );
    })}
  </svg>
);

const CloudIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="9" cy="14" rx="5.5" ry="4" fill={color} opacity="0.7" />
    <ellipse cx="14" cy="13" rx="6.5" ry="4.5" fill={color} opacity="0.85" />
    <ellipse cx="18.5" cy="15" rx="4.5" ry="3" fill={color} opacity="0.6" />
    <ellipse cx="11.5" cy="11" rx="6.5" ry="4" fill={color} opacity="0.75" />
  </svg>
);

const CloudSunIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="8" r="4" fill="#FFD93D" opacity="0.9" />
    <line x1="8" y1="2" x2="8" y2="3" stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="8" y1="13" x2="8" y2="14" stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="2" y1="8" x2="3" y2="8" stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="13" y1="8" x2="14" y2="8" stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="4.5" y1="4.5" x2="5.5" y2="5.5" stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="10.5" y1="10.5" x2="11.5" y2="11.5" stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <ellipse cx="11" cy="16" rx="5.5" ry="4" fill={color} opacity="0.7" />
    <ellipse cx="16" cy="15" rx="6.5" ry="4.5" fill={color} opacity="0.85" />
    <ellipse cx="20.5" cy="17" rx="4.5" ry="3" fill={color} opacity="0.6" />
    <ellipse cx="13.5" cy="13" rx="6.5" ry="4" fill={color} opacity="0.75" />
  </svg>
);

const RainIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="9" cy="8" rx="5.5" ry="4" fill={color} opacity="0.5" />
    <ellipse cx="14" cy="7" rx="6.5" ry="4.5" fill={color} opacity="0.6" />
    <ellipse cx="11.5" cy="5" rx="6.5" ry="4" fill={color} opacity="0.5" />
    <line x1="6" y1="13" x2="5" y2="17" stroke="#4DA3FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
      <animate attributeName="y1" values="13;14;13" dur="1.2s" repeatCount="indefinite" />
    </line>
    <line x1="10" y1="14" x2="9" y2="18" stroke="#4DA3FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
      <animate attributeName="y1" values="14;15;14" dur="1.5s" repeatCount="indefinite" />
    </line>
    <line x1="14" y1="13" x2="13" y2="17" stroke="#4DA3FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
      <animate attributeName="y1" values="13;14;13" dur="1.8s" repeatCount="indefinite" />
    </line>
    <line x1="18" y1="14" x2="17" y2="18" stroke="#4DA3FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
      <animate attributeName="y1" values="14;15;14" dur="1.3s" repeatCount="indefinite" />
    </line>
  </svg>
);

const ThunderIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="9" cy="8" rx="5.5" ry="4" fill="#555" opacity="0.6" />
    <ellipse cx="14" cy="7" rx="6.5" ry="4.5" fill="#555" opacity="0.7" />
    <ellipse cx="11.5" cy="5" rx="6.5" ry="4" fill="#555" opacity="0.6" />
    <polygon points="12,11 9,17 11,17 10,22 16,15 13,15 15,11" fill={color} opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
    </polygon>
  </svg>
);

const SnowIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="9" cy="8" rx="5.5" ry="4" fill={color} opacity="0.4" />
    <ellipse cx="14" cy="7" rx="6.5" ry="4.5" fill={color} opacity="0.5" />
    <ellipse cx="11.5" cy="5" rx="6.5" ry="4" fill={color} opacity="0.4" />
    <circle cx="8" cy="15" r="1.5" fill="white" opacity="0.8">
      <animate attributeName="cy" values="15;16;15" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="12" cy="17" r="1.5" fill="white" opacity="0.7">
      <animate attributeName="cy" values="17;18;17" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="15" r="1.5" fill="white" opacity="0.6">
      <animate attributeName="cy" values="15;16;15" dur="1.8s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const WindIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="3" y1="8" x2="18" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5">
      <animate attributeName="x2" values="18;20;18" dur="2s" repeatCount="indefinite" />
    </line>
    <line x1="5" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7">
      <animate attributeName="x2" values="21;23;21" dur="2.5s" repeatCount="indefinite" />
    </line>
    <line x1="7" y1="16" x2="16" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4">
      <animate attributeName="x2" values="16;18;16" dur="1.8s" repeatCount="indefinite" />
    </line>
  </svg>
);

const DropletIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 20" fill="none">
    <path d="M8 2 C8 2 2 10 2 13 C2 16.5 4.5 19 8 19 C11.5 19 14 16.5 14 13 C14 10 8 2 8 2Z" fill={color} opacity="0.7">
      <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
    </path>
  </svg>
);

const FlameIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 20 24" fill="none">
    <path d="M10 2 C10 2 4 10 4 15 C4 19 6.5 22 10 22 C13.5 22 16 19 16 15 C16 10 10 2 10 2Z" fill={color} opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
    </path>
    <ellipse cx="10" cy="16" rx="3" ry="3" fill={color} opacity="0.5" />
  </svg>
);

const PlaneIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polygon points="12,2 15,10 22,11 22,13 15,14 12,22 9,14 2,13 2,11 9,10" fill={color} opacity="0.8">
      <animateTransform attributeName="transform" type="translate" values="0,0;2,-2;0,0" dur="3s" repeatCount="indefinite" />
    </polygon>
  </svg>
);

const ThermometerIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 12 20" fill="none">
    <rect x="4" y="2" width="4" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    <circle cx="6" cy="16" r="3" fill={color} opacity="0.8" />
    <circle cx="6" cy="16" r="1.5" fill="white" opacity="0.3" />
    <rect x="5.5" y="6" width="1" height="6" rx="0.5" fill={color} opacity="0.7" />
  </svg>
);

const EyeIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="12" rx="9" ry="6" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    <circle cx="12" cy="12" r="3" fill={color} opacity="0.7" />
    <circle cx="12" cy="12" r="1" fill="white" opacity="0.3" />
  </svg>
);

const MountainIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polygon points="2,22 12,4 22,22" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    <polygon points="7,22 12,10 17,22" fill={color} opacity="0.3" />
    <polygon points="4,22 12,8 20,22" fill={color} opacity="0.15" />
  </svg>
);

const StarIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={color} opacity="0.8">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="8s" repeatCount="indefinite" />
    </polygon>
  </svg>
);

const MoonIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C14 21 16 20.3 17.7 19C13.5 19 10 15.5 10 11.5C10 8 12.5 4.5 15.5 3.5C14.5 3.2 13.3 3 12 3Z" fill={color} opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite" />
    </path>
  </svg>
);

const FogIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="4" y1="9" x2="20" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <line x1="3" y1="13" x2="21" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <line x1="5" y1="17" x2="19" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const ClockIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    <line x1="12" y1="7" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <line x1="12" y1="12" x2="16" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const ICONS: Record<string, React.FC<{ size: number; color: string }>> = {
  sun: SunIcon,
  "cloud-sun": CloudSunIcon,
  cloud: CloudIcon,
  rain: RainIcon,
  snow: SnowIcon,
  thunder: ThunderIcon,
  fog: FogIcon,
  wind: WindIcon,
  droplet: DropletIcon,
  thermometer: ThermometerIcon,
  eye: EyeIcon,
  flame: FlameIcon,
  plane: PlaneIcon,
  mountain: MountainIcon,
  star: StarIcon,
  moon: MoonIcon,
  clock: ClockIcon,
};

export interface WeatherIconProps {
  type: keyof typeof ICONS;
  size?: number;
  color?: string;
}

export function WeatherIcon({ type, size = 24, color = "#aaa" }: WeatherIconProps) {
  const Icon = ICONS[type];
  if (!Icon) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon size={size} color={color} /></span>;
}

export function getWeatherIconType(
  cloudCover: number,
  precipitation: number,
  isDay: number
): "sun" | "cloud-sun" | "cloud" | "rain" | "thunder" {
  if (precipitation > 2) return "thunder";
  if (precipitation > 0) return "rain";
  if (cloudCover < 20) return isDay ? "sun" : "cloud-sun";
  if (cloudCover < 50) return "cloud-sun";
  return "cloud";
}