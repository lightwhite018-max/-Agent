import { describe, expect, it } from "vitest";
import { harbors } from "../../data/harbors";
import { parseNeed } from "../agent/parseNeed";
import { recommendHarborsWithFallback } from "../recommendation/recommend";
import { createRecommendationLog } from "./createRecommendationLog";

describe("createRecommendationLog", () => {
  it("记录本次推荐的输入、结果和位置来源", () => {
    const parsedNeed = parseNeed("我想喝水", true);
    const recommendationResult = recommendHarborsWithFallback(parsedNeed, harbors);
    const log = createRecommendationLog(parsedNeed, recommendationResult, "定位位置");

    expect(log.id).toMatch(/^RL/);
    expect(log.userInput).toBe("我想喝水");
    expect(log.facilityTypes).toContain("drinking_water");
    expect(log.resultCount).toBe(recommendationResult.items.length);
    expect(log.resultHarborIds.length).toBeGreaterThan(0);
    expect(log.locationSource).toBe("定位位置");
  });

  it("记录降级推荐原因", () => {
    const parsedNeed = parseNeed("我想接热水再去卫生间", true);
    const recommendationResult = recommendHarborsWithFallback(parsedNeed, harbors);
    const log = createRecommendationLog(parsedNeed, recommendationResult, "定位位置");

    expect(log.fallbackUsed).toBe(true);
    expect(log.noResultReason).toBe("no_facility_match");
  });
});
