import { describe, expect, it } from "vitest";
import { createReport } from "./createReport";

describe("createReport", () => {
  it("文字反馈会生成反馈和工单编号", () => {
    const ticket = createReport("HB001", "设施异常", "饮水机没水");

    expect(ticket.reportId).toMatch(/^RP/);
    expect(ticket.workOrderId).toMatch(/^WO/);
    expect(ticket.status).toBe("pending");
    expect(ticket.description).toBe("饮水机没水");
    expect(ticket.imageUploadStatus).toBe("not_provided");
  });

  it("图片上传失败时仍生成工单并记录降级说明", () => {
    const ticket = createReport("HB001", "设施异常", "饮水机没水", {
      imageUploadStatus: "failed",
      imageUploadNote: "图片上传失败，已按文字反馈继续生成工单。",
    });

    expect(ticket.reportId).toMatch(/^RP/);
    expect(ticket.workOrderId).toMatch(/^WO/);
    expect(ticket.imageUploadStatus).toBe("failed");
    expect(ticket.imageUploadNote).toContain("继续生成工单");
  });

  it("保留用户选择的反馈分类", () => {
    const ticket = createReport("HB001", "导航错误", "地图入口位置不准确");

    expect(ticket.category).toBe("导航错误");
  });
});
