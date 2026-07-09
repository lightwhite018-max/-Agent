import { describe, expect, it } from "vitest";
import { harbors } from "../../data/harbors";
import { updateFacilityStatus, updateHarborStatus, updateWorkOrderStatus } from "./harborAdmin";

describe("harborAdmin", () => {
  it("管理员可以把设施标记为故障", () => {
    const updated = updateFacilityStatus(harbors, "HB001", "F001", "fault");
    const facility = updated.find((harbor) => harbor.id === "HB001")?.facilities.find((item) => item.id === "F001");

    expect(facility?.status).toBe("fault");
    expect(facility?.available).toBe(false);
  });

  it("管理员可以临时关闭港湾", () => {
    const updated = updateHarborStatus(harbors, "HB001", "temp_closed");
    const harbor = updated.find((item) => item.id === "HB001");

    expect(harbor?.status).toBe("temp_closed");
    expect(harbor?.statusReason).toBe("管理员手动更新");
  });

  it("管理员可以推进工单状态", () => {
    const updated = updateWorkOrderStatus(
      [
        {
          reportId: "RP001",
          workOrderId: "WO001",
          harborId: "HB001",
          category: "设施异常",
          description: "饮水机没水",
          imageUploadStatus: "not_provided",
          status: "pending",
          createdAt: "2026-07-09 21:20",
        },
      ],
      "WO001",
      "processing",
    );

    expect(updated[0].status).toBe("processing");
  });
});
