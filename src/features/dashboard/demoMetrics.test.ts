import { describe, expect, it } from "vitest";
import { harbors } from "../../data/harbors";
import type { RecommendationLogEntry, ReportTicket } from "../../types";
import { getDemoMetrics } from "./demoMetrics";

describe("getDemoMetrics", () => {
  it("汇总演示看板关键指标", () => {
    const tickets: ReportTicket[] = [
      {
        reportId: "RP001",
        workOrderId: "WO001",
        harborId: "HB001",
        category: "设施异常",
        description: "饮水机没水",
        imageUploadStatus: "not_provided",
        status: "pending",
        createdAt: "2026-07-09 21:50",
      },
      {
        reportId: "RP002",
        workOrderId: "WO002",
        harborId: "HB002",
        category: "设施异常",
        description: "插座已修复",
        imageUploadStatus: "not_provided",
        status: "resolved",
        createdAt: "2026-07-09 21:55",
      },
    ];
    const logs: RecommendationLogEntry[] = [
      {
        id: "RL001",
        userInput: "我想喝水",
        intent: "query_facility",
        facilityTypes: ["drinking_water"],
        locationSource: "定位位置",
        resultCount: 2,
        resultHarborIds: ["HB005", "HB001"],
        fallbackUsed: false,
        createdAt: "2026-07-09 21:56",
      },
      {
        id: "RL002",
        userInput: "我想接热水再去卫生间",
        intent: "query_facility",
        facilityTypes: ["hot_water", "toilet"],
        locationSource: "定位位置",
        resultCount: 3,
        resultHarborIds: ["HB006", "HB005"],
        fallbackUsed: true,
        noResultReason: "no_facility_match",
        createdAt: "2026-07-09 21:57",
      },
    ];

    const metrics = getDemoMetrics(harbors, tickets, logs);

    expect(metrics.openHarborCount).toBeGreaterThan(0);
    expect(metrics.pendingWorkOrderCount).toBe(1);
    expect(metrics.resolvedWorkOrderCount).toBe(1);
    expect(metrics.recommendationLogCount).toBe(2);
    expect(metrics.fallbackLogCount).toBe(1);
    expect(metrics.abnormalFacilityCount).toBeGreaterThan(0);
  });
});
