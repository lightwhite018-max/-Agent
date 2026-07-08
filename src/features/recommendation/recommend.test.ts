import { describe, expect, it } from "vitest";
import { harbors } from "../../data/harbors";
import { parseNeed } from "../agent/parseNeed";
import { recommendHarbors } from "./recommend";
import { recommendHarborsWithFallback } from "./recommend";

describe("recommendHarbors", () => {
  it("喝水推荐包含 HB001，不包含无饮水设施或关闭港湾", () => {
    const result = recommendHarbors(parseNeed("我想喝水", true), harbors);
    const ids = result.map((item) => item.harbor.id);

    expect(ids).toContain("HB001");
    expect(ids).not.toContain("HB002");
    expect(ids).not.toContain("HB003");
  });

  it("充电避雨优先返回室内且可充电港湾", () => {
    const result = recommendHarbors(parseNeed("下雨了还想充电", true), harbors);

    expect(result[0].harbor.id).toBe("HB002");
    expect(result[0].reasons.join(" ")).toContain("充电");
  });

  it("无完全匹配时返回降级备选方案", () => {
    const result = recommendHarborsWithFallback(parseNeed("我想接热水再去卫生间", true), harbors);

    expect(result.fallbackUsed).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.message).toContain("不完全匹配");
  });
});
