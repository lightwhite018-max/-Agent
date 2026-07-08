import type { FacilityStatus, Harbor, HarborStatus } from "../../types";

export function updateFacilityStatus(harbors: Harbor[], harborId: string, facilityId: string, status: FacilityStatus): Harbor[] {
  return harbors.map((harbor) => {
    if (harbor.id !== harborId) return harbor;

    return {
      ...harbor,
      updatedAt: currentTimeText(),
      dataFreshnessStatus: "fresh",
      facilities: harbor.facilities.map((facility) => {
        if (facility.id !== facilityId) return facility;

        return {
          ...facility,
          status,
          available: status === "normal",
        };
      }),
    };
  });
}

export function updateHarborStatus(harbors: Harbor[], harborId: string, status: HarborStatus): Harbor[] {
  return harbors.map((harbor) => {
    if (harbor.id !== harborId) return harbor;

    return {
      ...harbor,
      status,
      statusReason: status === "open" ? undefined : "管理员手动更新",
      updatedAt: currentTimeText(),
      dataFreshnessStatus: "fresh",
    };
  });
}

function currentTimeText() {
  return new Date().toLocaleString("zh-CN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
