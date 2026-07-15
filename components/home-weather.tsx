"use client";

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
      className="inline-flex items-center gap-2.5 text-base text-white/80 sm:gap-3 sm:text-lg"
      aria-label={`Погода: ${weather.temperature}°, ${weather.label}`}
    >
      <Icon
        className="size-5 shrink-0 opacity-90 sm:size-6"
        strokeWidth={1.5}
        aria-hidden
      />
      <span className="tabular-nums text-lg font-semibold tracking-tight text-white sm:text-xl">
        {weather.temperature}°
      </span>
      <span className="text-white/40" aria-hidden>
        ·
      </span>
      <span className="font-medium text-white/85">{weather.label}</span>
    </p>
  );
}
