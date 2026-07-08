import { useState } from "react";
import { Navigation } from "lucide-react";
import type { NavigationPreview } from "../services/externalServices";
import type { Harbor } from "../types";

export function HarborDetailPanel({ harbor, navigationPreview }: { harbor: Harbor; navigationPreview: NavigationPreview }) {
  const [hasOpenedNavigation, setHasOpenedNavigation] = useState(false);

  return (
    <section className="panel detail-panel">
      <div className="panel-title">
        <Navigation size={20} />
        <h2>港湾详情</h2>
      </div>
      <div className="detail-heading">
        <div>
          <h3>{harbor.name}</h3>
          <p>{harbor.address}</p>
        </div>
        <span className={harbor.status === "open" ? "status open" : "status closed"}>{harbor.status === "open" ? "开放中" : "不可用"}</span>
      </div>
      {harbor.statusReason && <p className="notice warning">{harbor.statusReason}</p>}
      <div className="detail-grid">
        <span>步行时间</span>
        <strong>{harbor.walkingTimeMinutes} 分钟</strong>
        <span>距离</span>
        <strong>{harbor.distanceMeters} 米</strong>
        <span>拥挤程度</span>
        <strong>{crowdText(harbor.crowdLevel)}</strong>
        <span>更新时间</span>
        <strong>{harbor.updatedAt}</strong>
      </div>
      {harbor.dataFreshnessStatus === "stale" && <p className="notice warning">信息更新时间较早，请谨慎参考。</p>}
      <div className="facility-list">
        {harbor.facilities.map((facility) => (
          <span key={facility.id} className={facility.status === "normal" && facility.available ? "facility good" : "facility bad"}>
            {facility.name}
          </span>
        ))}
      </div>
      <button className="primary-action" type="button" onClick={() => setHasOpenedNavigation(true)}>
        {navigationPreview.actionLabel}
      </button>
      <p className="muted">{navigationPreview.message}</p>
      {hasOpenedNavigation && (
        <div className="navigation-preview" aria-live="polite">
          <strong>{navigationPreview.status === "mock" ? "导航降级结果" : "路线规划预览"}</strong>
          <ol>
            {navigationPreview.fallbackSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function crowdText(level: Harbor["crowdLevel"]) {
  const labels = {
    quiet: "空闲",
    moderate: "适中",
    crowded: "较拥挤",
    unknown: "暂无数据",
  };

  return labels[level];
}
