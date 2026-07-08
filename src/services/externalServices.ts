import type { RuntimeConfig } from "../config/runtimeConfig";
import type { Harbor } from "../types";

export interface ExternalServiceStatus {
  map: "mock" | "configured";
  weather: "mock" | "configured";
  api: "local" | "configured";
}

export interface NavigationPreview {
  provider: string;
  status: "mock" | "configured";
  message: string;
}

export interface WeatherPreview {
  provider: string;
  status: "mock" | "configured";
  weatherText: string;
  message: string;
}

export function getExternalServiceStatus(config: RuntimeConfig): ExternalServiceStatus {
  return {
    map: config.mapProvider === "mock" || !config.mapApiKey ? "mock" : "configured",
    weather: config.weatherProvider === "mock" || !config.weatherApiKey ? "mock" : "configured",
    api: config.apiBaseUrl ? "configured" : "local",
  };
}

export function getNavigationPreview(config: RuntimeConfig, harbor: Harbor): NavigationPreview {
  const status = config.mapProvider === "mock" || !config.mapApiKey ? "mock" : "configured";

  return {
    provider: config.mapProvider,
    status,
    message:
      status === "mock"
        ? `当前使用地址和直线距离降级展示：${harbor.address}`
        : `已配置 ${config.mapProvider}，可接入真实路线规划。`,
  };
}

export function getWeatherPreview(config: RuntimeConfig): WeatherPreview {
  const status = config.weatherProvider === "mock" || !config.weatherApiKey ? "mock" : "configured";

  return {
    provider: config.weatherProvider,
    status,
    weatherText: status === "mock" ? "模拟天气：高温/降雨场景由用户文本触发" : "已配置天气服务",
    message: status === "mock" ? "天气 API 未配置时，不阻断港湾推荐。" : `已配置 ${config.weatherProvider}，可接入实时天气。`,
  };
}
