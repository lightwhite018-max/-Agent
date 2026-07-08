import { describe, expect, it } from "vitest";
import { harbors } from "../data/harbors";
import { getExternalServiceStatus, getNavigationPreview, getWeatherPreview } from "./externalServices";

describe("externalServices", () => {
  it("未配置 key 时使用 mock 降级", () => {
    const status = getExternalServiceStatus({
      mapProvider: "amap",
      weatherProvider: "qweather",
    });

    expect(status.map).toBe("mock");
    expect(status.weather).toBe("mock");
    expect(status.api).toBe("local");
  });

  it("已配置 key 时标记为 configured", () => {
    const status = getExternalServiceStatus({
      mapProvider: "amap",
      mapApiKey: "map-key",
      weatherProvider: "qweather",
      weatherApiKey: "weather-key",
      apiBaseUrl: "https://api.example.test",
    });

    expect(status.map).toBe("configured");
    expect(status.weather).toBe("configured");
    expect(status.api).toBe("configured");
  });

  it("导航和天气预览提供降级文案", () => {
    const config = { mapProvider: "mock", weatherProvider: "mock" } as const;

    expect(getNavigationPreview(config, harbors[0]).message).toContain("降级");
    expect(getWeatherPreview(config).message).toContain("不阻断");
  });
});
