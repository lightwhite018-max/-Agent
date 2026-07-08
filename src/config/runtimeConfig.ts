export type MapProvider = "mock" | "amap" | "tencent" | "baidu";
export type WeatherProvider = "mock" | "qweather" | "amap";

export interface RuntimeConfig {
  mapProvider: MapProvider;
  mapApiKey?: string;
  weatherProvider: WeatherProvider;
  weatherApiKey?: string;
  apiBaseUrl?: string;
}

const validMapProviders = new Set<MapProvider>(["mock", "amap", "tencent", "baidu"]);
const validWeatherProviders = new Set<WeatherProvider>(["mock", "qweather", "amap"]);

export function getRuntimeConfig(env: Record<string, string | undefined> = getViteEnv()): RuntimeConfig {
  const mapProvider = parseProvider(env.VITE_MAP_PROVIDER, validMapProviders, "mock");
  const weatherProvider = parseProvider(env.VITE_WEATHER_PROVIDER, validWeatherProviders, "mock");

  return {
    mapProvider,
    mapApiKey: normalizeEmpty(env.VITE_MAP_API_KEY),
    weatherProvider,
    weatherApiKey: normalizeEmpty(env.VITE_WEATHER_API_KEY),
    apiBaseUrl: normalizeEmpty(env.VITE_API_BASE_URL),
  };
}

function parseProvider<T extends string>(value: string | undefined, allowed: Set<T>, fallback: T): T {
  if (!value) return fallback;
  return allowed.has(value as T) ? (value as T) : fallback;
}

function normalizeEmpty(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getViteEnv(): Record<string, string | undefined> {
  return (import.meta.env ?? {}) as Record<string, string | undefined>;
}
