import { describe, expect, it } from "vitest";
import { acceptanceCases } from "./acceptanceCases";

describe("acceptanceCases", () => {
  it("覆盖 PRD P0-M 核心验收清单", () => {
    expect(acceptanceCases).toHaveLength(15);
    expect(acceptanceCases.some((item) => item.status === "covered")).toBe(true);
    expect(acceptanceCases.some((item) => item.status === "pending")).toBe(true);
  });
});
