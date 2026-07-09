import { describe, expect, it } from "vitest";
import { acceptanceCases, getAcceptanceSummary } from "./acceptanceCases";

describe("acceptanceCases", () => {
  it("覆盖 PRD P0-M 核心验收清单", () => {
    expect(acceptanceCases).toHaveLength(15);
    expect(acceptanceCases.some((item) => item.status === "covered")).toBe(true);
    expect(acceptanceCases.every((item) => item.status === "covered" || item.status === "enhanced")).toBe(true);
  });

  it("计算验收面板可演示完成度", () => {
    const summary = getAcceptanceSummary();

    expect(summary.total).toBe(15);
    expect(summary.demoReadyRate).toBe(100);
    expect(summary.pending).toBe(0);
  });
});
