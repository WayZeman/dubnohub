import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { WeatherIconName, WeatherSnapshot } from "@/lib/weather";

const ICONS: Record<WeatherIconName, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

type HomeWeatherProps = {
  weather: WeatherSnapshot;
};

export function HomeWeather({ weather }: HomeWeatherProps) {
  const Icon = ICONS[weather.icon];

  return (
    <p
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 py-1.5 text-sm text-white/85 backdrop-blur-sm sm:gap-2.5 sm:text-base"
      aria-label={`Погода: ${weather.temperature}°, ${weather.label}`}
    >
      <Icon
        className="size-4 shrink-0 opacity-90 sm:size-5"
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="tabular-nums font-semibold tracking-tight text-white">
        {weather.temperature}°
      </span>
      <span className="text-white/35" aria-hidden>
        ·
      </span>
      <span className="font-medium text-white/80">{weather.label}</span>
    </p>
  );
}
