import { describe, expect, it } from "vitest";
import { harbors } from "../../data/harbors";
import type { AppPersistedState } from "../../types";
import { clearAppState, loadAppState, saveAppState, type StorageLike } from "./appStorage";

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

describe("appStorage", () => {
  it("没有本地数据时使用样例数据", () => {
    const state = loadAppState(new MemoryStorage(), harbors);

    expect(state.harbors).toHaveLength(harbors.length);
    expect(state.tickets).toEqual([]);
    expect(state.recommendationLogs).toEqual([]);
  });

  it("保存后可以重新读取", () => {
    const storage = new MemoryStorage();
    const state: AppPersistedState = {
      schemaVersion: 1,
      harbors,
      recommendationLogs: [
        {
          id: "RL001",
          userInput: "我想喝水",
          intent: "query_facility",
          facilityTypes: ["drinking_water"],
          locationSource: "定位位置",
          resultCount: 1,
          resultHarborIds: ["HB001"],
          fallbackUsed: false,
          createdAt: "2026-07-09 21:40",
        },
      ],
      tickets: [
        {
          reportId: "RP001",
          workOrderId: "WO001",
          harborId: "HB001",
          category: "设施异常",
          description: "饮水机没水",
          imageUploadStatus: "not_provided",
          status: "pending",
          createdAt: "2026-07-08 20:00",
        },
      ],
    };

    saveAppState(storage, state);

    expect(loadAppState(storage, [])).toEqual(state);
  });

  it("读取旧版本本地数据时自动补齐推荐日志", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      "labor-harbor-agent:v1",
      JSON.stringify({
        schemaVersion: 1,
        harbors,
        tickets: [],
      }),
    );

    expect(loadAppState(storage, []).recommendationLogs).toEqual([]);
  });

  it("可以清空本地数据并回到样例数据", () => {
    const storage = new MemoryStorage();
    saveAppState(storage, { schemaVersion: 1, harbors: [], tickets: [], recommendationLogs: [] });
    clearAppState(storage);

    expect(loadAppState(storage, harbors).harbors).toHaveLength(harbors.length);
  });
});
