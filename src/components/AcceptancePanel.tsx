import { CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { acceptanceCases, getAcceptanceSummary, type AcceptanceCase, type AcceptanceStatus } from "../data/acceptanceCases";

const statusText: Record<AcceptanceStatus, string> = {
  covered: "已覆盖",
  enhanced: "演示增强",
  pending: "待接入",
};

export function AcceptancePanel() {
  const summary = getAcceptanceSummary();

  return (
    <section className="acceptance-view">
      <div className="acceptance-hero panel">
        <div>
          <p className="eyebrow">P0-M 验收进度</p>
          <h2>核心闭环已进入可演示状态</h2>
          <p className="muted">清单将 PRD 验收标准转成作品集可讲述的状态视图，区分已覆盖、演示增强和待接入能力。</p>
        </div>
        <div className="acceptance-rate">
          <span>可演示完成度</span>
          <strong>{summary.demoReadyRate}%</strong>
        </div>
      </div>

      <div className="acceptance-summary">
        <SummaryCard label="已覆盖" value={summary.covered} status="covered" />
        <SummaryCard label="演示增强" value={summary.enhanced} status="enhanced" />
        <SummaryCard label="待接入" value={summary.pending} status="pending" />
      </div>

      <div className="acceptance-list">
        {acceptanceCases.map((item) => (
          <AcceptanceItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, status }: { label: string; value: number; status: AcceptanceStatus }) {
  return (
    <div className={`acceptance-summary-card ${status}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AcceptanceItem({ item }: { item: AcceptanceCase }) {
  return (
    <article className="acceptance-item">
      <div className="acceptance-item-header">
        <div>
          <span className="acceptance-id">{item.id}</span>
          <h3>{item.title}</h3>
        </div>
        <span className={`acceptance-status ${item.status}`}>
          <StatusIcon status={item.status} />
          {statusText[item.status]}
        </span>
      </div>
      <p>{item.scenario}</p>
      <p className="muted">{item.evidence}</p>
    </article>
  );
}

function StatusIcon({ status }: { status: AcceptanceStatus }) {
  if (status === "covered") return <CheckCircle2 size={16} />;
  if (status === "enhanced") return <Clock3 size={16} />;
  return <CircleDashed size={16} />;
}
