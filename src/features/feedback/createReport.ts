import type { ReportTicket } from "../../types";

export function createReport(harborId: string, category: string, description: string): ReportTicket {
  const timestamp = Date.now().toString().slice(-8);

  return {
    reportId: `RP${timestamp}`,
    workOrderId: `WO${timestamp}`,
    harborId,
    category,
    description,
    status: "pending",
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };
}
