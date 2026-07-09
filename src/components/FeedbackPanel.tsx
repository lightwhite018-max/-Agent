import { Wrench } from "lucide-react";
import type { Harbor, ReportTicket } from "../types";

interface FeedbackPanelProps {
  activeHarbor: Harbor;
  reportText: string;
  imageState: "none" | "attached" | "failed";
  latestTicket?: ReportTicket;
  onReportTextChange: (text: string) => void;
  onImageStateChange: (state: "none" | "attached" | "failed") => void;
  onSubmitReport: () => void;
}

export function FeedbackPanel({ activeHarbor, reportText, imageState, latestTicket, onReportTextChange, onImageStateChange, onSubmitReport }: FeedbackPanelProps) {
  return (
    <section className="panel feedback-panel">
      <div className="panel-title">
        <Wrench size={20} />
        <h2>反馈与工单</h2>
      </div>
      <p className="muted">当前港湾：{activeHarbor.name}</p>
      <textarea value={reportText} onChange={(event) => onReportTextChange(event.target.value)} rows={4} />
      <div className="feedback-image-tools" aria-label="图片反馈演示">
        <button className={imageState === "attached" ? "active" : ""} type="button" onClick={() => onImageStateChange("attached")}>
          模拟添加图片
        </button>
        <button className={imageState === "failed" ? "active warning-button" : "warning-button"} type="button" onClick={() => onImageStateChange("failed")}>
          模拟上传失败
        </button>
        <button type="button" onClick={() => onImageStateChange("none")}>
          不上传图片
        </button>
      </div>
      <p className={imageState === "failed" ? "notice warning" : "muted"}>{imageStatusText(imageState)}</p>
      <button className="primary-action" type="button" onClick={onSubmitReport}>
        提交反馈并生成工单
      </button>
      {latestTicket && (
        <div className="ticket">
          <strong>已生成工单</strong>
          <span>反馈编号：{latestTicket.reportId}</span>
          <span>工单编号：{latestTicket.workOrderId}</span>
          <span>图片状态：{ticketImageStatusText(latestTicket)}</span>
          <span>状态：{workOrderStatusText(latestTicket.status)}</span>
        </div>
      )}
    </section>
  );
}

function imageStatusText(imageState: FeedbackPanelProps["imageState"]) {
  if (imageState === "attached") return "已模拟添加图片，提交后会随文字反馈生成工单。";
  if (imageState === "failed") return "图片上传失败不会阻断流程，系统将继续提交文字反馈并生成工单。";
  return "图片可选；不上传图片也可以提交文字反馈。";
}

function ticketImageStatusText(ticket: ReportTicket) {
  if (ticket.imageUploadStatus === "uploaded") return "已附带图片";
  if (ticket.imageUploadStatus === "failed") return ticket.imageUploadNote ?? "上传失败，已降级为文字反馈";
  return "未上传图片";
}

function workOrderStatusText(status: ReportTicket["status"]) {
  const labels: Record<ReportTicket["status"], string> = {
    pending: "待处理",
    processing: "处理中",
    resolved: "已解决",
    closed: "已关闭",
  };

  return labels[status];
}
