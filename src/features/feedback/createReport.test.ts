import { describe, expect, it } from "vitest";
import { createReport } from "./createReport";

describe("createReport", () => {
  it("文字反馈会生成反馈和工单编号", () => {
    const ticket = createReport("HB001", "设施异常", "饮水机没水");

    expect(ticket.reportId).toMatch(/^RP/);
    expect(ticket.workOrderId).toMatch(/^WO/);
    expect(ticket.status).toBe("pending");
    expect(ticket.description).toBe("饮水机没水");
  });
});
