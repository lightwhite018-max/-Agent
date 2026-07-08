import { describe, expect, it } from "vitest";
import { parseNeed } from "./parseNeed";

describe("parseNeed", () => {
  it("识别喝水需求", () => {
    const result = parseNeed("我想喝水", true);

    expect(result.intent).toBe("query_facility");
    expect(result.facilityTypes).toContain("drinking_water");
    expect(result.needsLocation).toBe(false);
  });

  it("识别下雨和充电的多条件需求", () => {
    const result = parseNeed("下雨了还想充电", true);

    expect(result.weatherContext).toBe("rain");
    expect(result.facilityTypes).toContain("charging");
    expect(result.facilityTypes).toContain("indoor");
  });

  it("模糊需求只追问一次", () => {
    const result = parseNeed("我想找个地方", false);

    expect(result.intent).toBe("unclear");
    expect(result.needsLocation).toBe(true);
    expect(result.followUp).toContain("喝水");
  });
});
