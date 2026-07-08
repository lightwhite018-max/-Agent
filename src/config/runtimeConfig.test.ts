import { describe, expect, it } from "vitest";
import { getRuntimeConfig } from "./runtimeConfig";

describe("getRuntimeConfig", () => {
  it("默认使用 mock 服务", () => {
    const config = getRuntimeConfig({});

    expect(config.mapProvider).toBe("mock");
    expect(config.weatherProvider).toBe("mock");
  });

  it("忽略不支持的服务商配置", () => {
    const config = getRuntimeConfig({
      VITE_MAP_PROVIDER: "unknown",
      VITE_WEATHER_PROVIDER: "bad",
    });

    expect(config.mapProvider).toBe("mock");
    expect(config.weatherProvider).toBe("mock");
  });

  it("读取 API Key 和后端地址", () => {
    const config = getRuntimeConfig({
      VITE_MAP_PROVIDER: "amap",
      VITE_MAP_API_KEY: "map-key",
      VITE_WEATHER_PROVIDER: "qweather",
      VITE_WEATHER_API_KEY: "weather-key",
      VITE_API_BASE_URL: "https://example.test",
    });

    expect(config.mapProvider).toBe("amap");
    expect(config.mapApiKey).toBe("map-key");
    expect(config.weatherProvider).toBe("qweather");
    expect(config.weatherApiKey).toBe("weather-key");
    expect(config.apiBaseUrl).toBe("https://example.test");
  });
});
