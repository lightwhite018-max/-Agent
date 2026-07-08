import { Wrench } from "lucide-react";
import type { Harbor, ReportTicket } from "../types";

interface FeedbackPanelProps {
  activeHarbor: Harbor;
  reportText: string;
  latestTicket?: ReportTicket;
  onReportTextChange: (text: string) => void;
  onSubmitReport: () => void;
}

export function FeedbackPanel({ activeHarbor, reportText, latestTicket, onReportTextChange, onSubmitReport }: FeedbackPanelProps) {
  return (
    <section className="panel feedback-panel">
      <div className="panel-title">
        <Wrench size={20} />
        <h2>反馈与工单</h2>
      </div>
      <p className="muted">当前港湾：{activeHarbor.name}</p>
      <textarea value={reportText} onChange={(event) => onReportTextChange(event.target.value)} rows={4} />
      <button className="primary-action" type="button" onClick={onSubmitReport}>
        提交文字反馈
      </button>
      <p className="muted">图片上传是 P0-E，失败时不阻断文字反馈。</p>
      {latestTicket && (
        <div className="ticket">
          <strong>已生成工单</strong>
          <span>反馈编号：{latestTicket.reportId}</span>
          <span>工单编号：{latestTicket.workOrderId}</span>
          <span>状态：待处理</span>
        </div>
      )}
    </section>
  );
}
