import type { ReportTicket } from "../../types";

export interface CreateReportOptions {
  imageUrl?: string;
  imageUploadStatus?: ReportTicket["imageUploadStatus"];
  imageUploadNote?: string;
}

export function createReport(harborId: string, category: string, description: string, options: CreateReportOptions = {}): ReportTicket {
  const timestamp = Date.now().toString().slice(-8);

  return {
    reportId: `RP${timestamp}`,
    workOrderId: `WO${timestamp}`,
    harborId,
    category,
    description,
    imageUrl: options.imageUrl,
    imageUploadStatus: options.imageUploadStatus ?? "not_provided",
    imageUploadNote: options.imageUploadNote,
    status: "pending",
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };
}
