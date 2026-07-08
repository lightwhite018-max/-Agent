import { useMemo, useState } from "react";
import { AlertTriangle, Clock, MapPin, MessageSquareText, Navigation, Send, Wrench } from "lucide-react";
import { harbors } from "./data/harbors";
import { parseNeed } from "./features/agent/parseNeed";
import { createReport } from "./features/feedback/createReport";
import { recommendHarbors } from "./features/recommendation/recommend";
import type { Harbor, Recommendation, ReportTicket } from "./types";

const quickNeeds = ["我想喝水", "手机没电了", "下雨了还想充电", "太热了想休息", "想上厕所"];

export function App() {
  const [query, setQuery] = useState("我想喝水");
  const [hasLocation, setHasLocation] = useState(true);
  const [selectedHarbor, setSelectedHarbor] = useState<Harbor | null>(null);
  const [reportText, setReportText] = useState("饮水机没水");
  const [ticket, setTicket] = useState<ReportTicket | null>(null);

  const parsedNeed = useMemo(() => parseNeed(query, hasLocation), [query, hasLocation]);
  const recommendations = useMemo(() => recommendHarbors(parsedNeed, harbors), [parsedNeed]);
  const activeHarbor = selectedHarbor ?? recommendations[0]?.harbor ?? harbors[0];

  function submitReport() {
    if (!activeHarbor || reportText.trim().length === 0) return;
    setTicket(createReport(activeHarbor.id, "设施异常", reportText.trim()));
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">V0.1 可交互原型</p>
          <h1>劳动者港湾智能助手</h1>
          <p className="summary">用一句话或一个快捷入口，找到附近正在开放、设施可用的劳动者港湾。</p>
        </div>
        <div className="location-toggle">
          <span>{hasLocation ? "已授权定位" : "手动位置模式"}</span>
          <button type="button" onClick={() => setHasLocation((value) => !value)}>
            {hasLocation ? "模拟拒绝定位" : "恢复定位"}
          </button>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel request-panel">
          <div className="panel-title">
            <MessageSquareText size={20} />
            <h2>需求识别</h2>
          </div>

          <div className="quick-actions">
            {quickNeeds.map((need) => (
              <button key={need} type="button" onClick={() => setQuery(need)}>
                {need}
              </button>
            ))}
          </div>

          <label className="input-label" htmlFor="query">
            输入劳动者需求
          </label>
          <div className="query-box">
            <input id="query" value={query} onChange={(event) => setQuery(event.target.value)} />
            <button type="button" aria-label="提交需求">
              <Send size={18} />
            </button>
          </div>

          <div className="agent-result">
            <div>
              <span>识别意图</span>
              <strong>{parsedNeed.intent}</strong>
            </div>
            <div>
              <span>设施条件</span>
              <strong>{parsedNeed.facilityTypes.length ? parsedNeed.facilityTypes.join(", ") : "待追问"}</strong>
            </div>
            <div>
              <span>位置状态</span>
              <strong>{parsedNeed.needsLocation ? "需要手动位置" : "可推荐附近港湾"}</strong>
            </div>
          </div>

          {parsedNeed.followUp && <p className="notice">{parsedNeed.followUp}</p>}
          {parsedNeed.safetyNotice && <p className="notice warning">{parsedNeed.safetyNotice}</p>}
          {!hasLocation && <p className="notice">定位被拒绝时，系统会提供区县、商圈或地址输入入口。当前原型默认使用“解放碑”作为手动位置。</p>}
        </div>

        <div className="panel recommendation-panel">
          <div className="panel-title">
            <MapPin size={20} />
            <h2>推荐结果</h2>
          </div>

          {recommendations.length === 0 ? (
            <div className="empty-state">
              <AlertTriangle size={24} />
              <p>暂无完全满足条件的港湾。可放宽设施条件或扩大搜索范围。</p>
            </div>
          ) : (
            <div className="recommendation-list">
              {recommendations.map((item) => (
                <RecommendationCard
                  key={item.harbor.id}
                  item={item}
                  selected={activeHarbor.id === item.harbor.id}
                  onSelect={() => setSelectedHarbor(item.harbor)}
                />
              ))}
            </div>
          )}
        </div>

        <HarborDetail harbor={activeHarbor} />

        <section className="panel feedback-panel">
          <div className="panel-title">
            <Wrench size={20} />
            <h2>反馈与工单</h2>
          </div>
          <p className="muted">当前港湾：{activeHarbor.name}</p>
          <textarea value={reportText} onChange={(event) => setReportText(event.target.value)} rows={4} />
          <button className="primary-action" type="button" onClick={submitReport}>
            提交文字反馈
          </button>
          <p className="muted">图片上传是 P0-E，失败时不阻断文字反馈。</p>
          {ticket && (
            <div className="ticket">
              <strong>已生成工单</strong>
              <span>反馈编号：{ticket.reportId}</span>
              <span>工单编号：{ticket.workOrderId}</span>
              <span>状态：待处理</span>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function RecommendationCard({ item, selected, onSelect }: { item: Recommendation; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`harbor-card ${selected ? "selected" : ""}`} type="button" onClick={onSelect}>
      <div className="card-header">
        <strong>{item.harbor.name}</strong>
        <span>{Math.round(item.score)} 分</span>
      </div>
      <p>{item.harbor.address}</p>
      <div className="meta-row">
        <span>
          <Clock size={15} />
          {item.harbor.walkingTimeMinutes} 分钟
        </span>
        <span>{item.harbor.openingHours}</span>
      </div>
      <ul>
        {item.reasons.slice(0, 3).map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {item.warnings.length > 0 && <p className="card-warning">{item.warnings[0]}</p>}
    </button>
  );
}

function HarborDetail({ harbor }: { harbor: Harbor }) {
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
      <button className="primary-action" type="button">
        打开导航
      </button>
      <p className="muted">地图接口失败时，原型会降级展示地址和直线距离，不编造步行时间。</p>
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
