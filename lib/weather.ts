export type WeatherSnapshot = {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  code: number;
  label: string;
  icon: WeatherIconName;
};

export type WeatherIconName =
  | "sun"
  | "cloud-sun"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

const DUBNO = { latitude: 50.4169, longitude: 25.7441 };

function describeWeather(code: number): Pick<WeatherSnapshot, "label" | "icon"> {
  if (code === 0) return { label: "Ясно", icon: "sun" };
  if (code <= 2) return { label: "Мінлива хмарність", icon: "cloud-sun" };
  if (code === 3) return { label: "Хмарно", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Туман", icon: "fog" };
  if (code >= 51 && code <= 57) return { label: "Мряка", icon: "drizzle" };
  if (code >= 61 && code <= 67) return { label: "Дощ", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Сніг", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Зливи", icon: "rain" };
  if (code >= 85 && code <= 86) return { label: "Снігопад", icon: "snow" };
  if (code >= 95) return { label: "Гроза", icon: "storm" };
  return { label: "Хмарно", icon: "cloud" };
}

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
};

export async function getDubnoWeather(): Promise<WeatherSnapshot | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(DUBNO.latitude));
    url.searchParams.set("longitude", String(DUBNO.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
    );
    url.searchParams.set("timezone", "Europe/Kyiv");
    url.searchParams.set("wind_speed_unit", "kmh");

    const res = await fetch(url, {
      next: { revalidate: 600 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as OpenMeteoResponse;
    const current = data.current;
    if (
      current?.temperature_2m == null ||
      current.weather_code == null ||
      current.apparent_temperature == null ||
      current.wind_speed_10m == null
    ) {
      return null;
    }

    const { label, icon } = describeWeather(current.weather_code);

    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      windSpeed: Math.round(current.wind_speed_10m),
      code: current.weather_code,
      label,
      icon,
    };
  } catch {
    return null;
  }
}
