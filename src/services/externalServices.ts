import type { RuntimeConfig } from "../config/runtimeConfig";
import type { Harbor, ParsedNeed } from "../types";

export interface ExternalServiceStatus {
  map: "mock" | "configured";
  weather: "mock" | "configured";
  api: "local" | "configured";
}

export interface NavigationPreview {
  provider: string;
  status: "mock" | "configured";
  actionLabel: string;
  message: string;
  fallbackSteps: string[];
}

export interface WeatherPreview {
  provider: string;
  status: "mock" | "configured";
  advisoryTone: "neutral" | "rain" | "hot" | "cold";
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
    actionLabel: status === "mock" ? "查看地址与距离" : "打开地图路线",
    message:
      status === "mock"
        ? `当前使用地址和直线距离降级展示：${harbor.address}`
        : `已配置 ${config.mapProvider}，可接入真实路线规划。`,
    fallbackSteps:
      status === "mock"
        ? [`确认目的地：${harbor.name}`, `复制或查看地址：${harbor.address}`, `参考直线距离约 ${harbor.distanceMeters} 米，现场以实际道路为准`]
        : [`调用 ${config.mapProvider} 路线规划`, "返回步行路线、预计时间和外部导航入口"],
  };
}

export function getWeatherPreview(config: RuntimeConfig, weatherContext?: ParsedNeed["weatherContext"]): WeatherPreview {
  const status = config.weatherProvider === "mock" || !config.weatherApiKey ? "mock" : "configured";
  const advisoryTone = weatherContext ?? "neutral";
  const weatherText =
    status === "configured"
      ? "已配置天气服务"
      : weatherContext === "rain"
        ? "模拟天气：降雨"
        : weatherContext === "hot"
          ? "模拟天气：高温"
          : weatherContext === "cold"
            ? "模拟天气：低温"
            : "模拟天气：由用户文本触发";
  const advisoryMessage =
    weatherContext === "rain"
      ? "已优先考虑室内避雨、充电和雨具等设施。"
      : weatherContext === "hot"
        ? "已优先考虑室内休息、饮水和降温避暑场景。"
        : weatherContext === "cold"
          ? "已优先考虑室内休息、热水和短暂停留场景。"
          : "天气 API 未配置时，不阻断港湾推荐。";

  return {
    provider: config.weatherProvider,
    status,
    advisoryTone,
    weatherText,
    message: status === "mock" ? advisoryMessage : `已配置 ${config.weatherProvider}，可接入实时天气。${advisoryMessage}`,
  };
}
