import { describe, expect, it } from "vitest";
import { facilitySeed, harborSeed } from "./seed";
import { composeHarbors, splitHarbors } from "./harborRepository";

describe("harborRepository", () => {
  it("可以从港湾表和设施表组装页面数据", () => {
    const harbors = composeHarbors(harborSeed, facilitySeed);

    expect(harbors).toHaveLength(harborSeed.length);
    expect(harbors.length).toBeGreaterThanOrEqual(8);
    expect(harbors.find((harbor) => harbor.id === "HB001")?.facilities).toHaveLength(5);
  });

  it("设施数据都能关联到有效港湾", () => {
    const harborIds = new Set(harborSeed.map((harbor) => harbor.id));

    for (const facility of facilitySeed) {
      expect(harborIds.has(facility.harborId)).toBe(true);
    }
  });

  it("可以把页面数据拆回接近数据库的两张表", () => {
    const harbors = composeHarbors(harborSeed, facilitySeed);
    const result = splitHarbors(harbors);

    expect(result.harborRecords[0]).not.toHaveProperty("facilities");
    expect(result.facilities).toHaveLength(facilitySeed.length);
  });
});
