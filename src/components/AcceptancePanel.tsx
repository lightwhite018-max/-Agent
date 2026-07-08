import { CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { acceptanceCases, type AcceptanceCase, type AcceptanceStatus } from "../data/acceptanceCases";

const statusText: Record<AcceptanceStatus, string> = {
  covered: "已覆盖",
  enhanced: "演示增强",
  pending: "待接入",
};

export function AcceptancePanel() {
  const counts = acceptanceCases.reduce(
    (total, item) => ({
      ...total,
      [item.status]: total[item.status] + 1,
    }),
    { covered: 0, enhanced: 0, pending: 0 },
  );

  return (
    <section className="acceptance-view">
      <div className="acceptance-summary">
        <SummaryCard label="已覆盖" value={counts.covered} status="covered" />
        <SummaryCard label="演示增强" value={counts.enhanced} status="enhanced" />
        <SummaryCard label="待接入" value={counts.pending} status="pending" />
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
