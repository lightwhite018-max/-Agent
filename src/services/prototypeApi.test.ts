import { describe, expect, it } from "vitest";
import { manualLocations } from "../data/locations";
import type { StorageLike } from "../features/persistence/appStorage";
import { prototypeApi } from "./prototypeApi";

class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }
}

describe("prototypeApi", () => {
  it("提供推荐接口响应", () => {
    const state = prototypeApi.loadState(new MemoryStorage());
    const response = prototypeApi.getRecommendations({
      text: "我想喝水",
      hasLocation: true,
      harbors: state.harbors,
    });

    expect(response.parsedNeed.facilityTypes).toContain("drinking_water");
    expect(response.recommendationResult.items[0].harbor.facilities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "drinking_water",
          available: true,
          status: "normal",
        }),
      ]),
    );
  });

  it("封装手动位置推荐", () => {
    const state = prototypeApi.loadState(new MemoryStorage());
    const response = prototypeApi.getRecommendations({
      text: "下雨了还想充电",
      hasLocation: false,
      manualLocation: manualLocations[1],
      harbors: state.harbors,
    });

    expect(response.parsedNeed.needsLocation).toBe(true);
    expect(response.recommendationResult.items[0].harbor.id).toBe("HB002");
  });

  it("可以创建反馈并持久化状态", () => {
    const storage = new MemoryStorage();
    const state = prototypeApi.loadState(storage);
    const ticket = prototypeApi.createReport({
      harborId: "HB001",
      category: "设施异常",
      description: "饮水机没水",
    });

    prototypeApi.saveState({ ...state, tickets: [ticket] }, storage);

    expect(prototypeApi.loadState(storage).tickets[0].workOrderId).toBe(ticket.workOrderId);
  });

  it("暴露外部服务运行状态", () => {
    expect(prototypeApi.getRuntimeStatus().api).toBe("local");
    expect(prototypeApi.getWeatherPreview().message).toContain("不阻断");
  });
});
