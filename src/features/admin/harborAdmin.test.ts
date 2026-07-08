import { describe, expect, it } from "vitest";
import { harbors } from "../../data/harbors";
import { updateFacilityStatus, updateHarborStatus } from "./harborAdmin";

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
});
