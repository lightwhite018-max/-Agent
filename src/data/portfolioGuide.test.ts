import { describe, expect, it } from "vitest";
import { demoScriptSteps, nextRoadmapItems, portfolioHighlights } from "./portfolioGuide";

describe("portfolioGuide", () => {
  it("提供 HR 演示所需的项目亮点、演示路径和后续计划", () => {
    expect(portfolioHighlights.length).toBeGreaterThanOrEqual(4);
    expect(demoScriptSteps.length).toBeGreaterThanOrEqual(5);
    expect(nextRoadmapItems).toContain("补充重庆主城九区真实劳动者港湾点位。");
  });
});
