import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, MapPin, MessageSquareText, Navigation, Send, Wrench } from "lucide-react";
import { harbors as initialHarbors } from "./data/harbors";
import { manualLocations } from "./data/locations";
import { updateFacilityStatus, updateHarborStatus } from "./features/admin/harborAdmin";
import { parseNeed } from "./features/agent/parseNeed";
import { createReport } from "./features/feedback/createReport";
import { clearAppState, getBrowserStorage, loadAppState, saveAppState } from "./features/persistence/appStorage";
import { recommendHarborsWithFallback } from "./features/recommendation/recommend";
import type { FacilityStatus, Harbor, HarborStatus, Recommendation, ReportTicket } from "./types";

const quickNeeds = ["我想喝水", "手机没电了", "下雨了还想充电", "太热了想休息", "想上厕所"];

export function App() {
  const initialState = useMemo(() => loadAppState(getBrowserStorage(), initialHarbors), []);
  const [query, setQuery] = useState("我想喝水");
  const [harborData, setHarborData] = useState(initialState.harbors);
  const [hasLocation, setHasLocation] = useState(true);
  const [manualLocationId, setManualLocationId] = useState(manualLocations[0].id);
  const [selectedHarborId, setSelectedHarborId] = useState<string | null>(null);
  const [reportText, setReportText] = useState("饮水机没水");
  const [tickets, setTickets] = useState<ReportTicket[]>(initialState.tickets);

  useEffect(() => {
    saveAppState(getBrowserStorage(), {
      schemaVersion: 1,
      harbors: harborData,
      tickets,
    });
  }, [harborData, tickets]);

  const manualLocation = manualLocations.find((location) => location.id === manualLocationId) ?? manualLocations[0];
  const parsedNeed = useMemo(() => parseNeed(query, hasLocation), [query, hasLocation]);
  const recommendationResult = useMemo(
    () =>
      recommendHarborsWithFallback(parsedNeed, harborData, {
        preferredDistrict: hasLocation ? undefined : manualLocation.district,
        preferredBusinessArea: hasLocation ? undefined : manualLocation.businessArea,
      }),
    [harborData, hasLocation, manualLocation.businessArea, manualLocation.district, parsedNeed],
  );
  const recommendations = recommendationResult.items;
  const activeHarbor =
    recommendations.find((item) => item.harbor.id === selectedHarborId)?.harbor ??
    harborData.find((item) => item.id === selectedHarborId) ??
    recommendations[0]?.harbor ??
    harborData[0];

  function submitReport() {
    if (!activeHarbor || reportText.trim().length === 0) return;
    const nextTicket = createReport(activeHarbor.id, "设施异常", reportText.trim());
    setTickets((current) => [nextTicket, ...current]);
  }

  function handleFacilityStatusChange(harborId: string, facilityId: string, status: FacilityStatus) {
    setHarborData((current) => updateFacilityStatus(current, harborId, facilityId, status));
  }

  function handleHarborStatusChange(harborId: string, status: HarborStatus) {
    setHarborData((current) => updateHarborStatus(current, harborId, status));
  }

  function resetDemoData() {
    clearAppState(getBrowserStorage());
    setHarborData(initialHarbors);
    setTickets([]);
    setSelectedHarborId(null);
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">V0.5 可交互原型</p>
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
          {!hasLocation && <p className="notice">定位被拒绝时，系统会提供区县、商圈或地址输入入口。当前原型使用下方选择的位置继续推荐。</p>}
          {!hasLocation && (
            <div className="manual-location">
              <label htmlFor="manual-location">选择手动位置</label>
              <select id="manual-location" value={manualLocationId} onChange={(event) => setManualLocationId(event.target.value)}>
                {manualLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.district} - {location.businessArea}
                  </option>
                ))}
              </select>
            </div>
          )}
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
              {recommendationResult.fallbackUsed && recommendationResult.message && <p className="notice warning">{recommendationResult.message}</p>}
              {recommendations.map((item) => (
                <RecommendationCard
                  key={item.harbor.id}
                  item={item}
                  selected={activeHarbor.id === item.harbor.id}
                  onSelect={() => setSelectedHarborId(item.harbor.id)}
                />
              ))}
            </div>
          )}
          <RecommendationLog resultCount={recommendations.length} fallbackUsed={recommendationResult.fallbackUsed} selectedLocation={hasLocation ? "定位位置" : manualLocation.label} />
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
          {tickets[0] && (
            <div className="ticket">
              <strong>已生成工单</strong>
              <span>反馈编号：{tickets[0].reportId}</span>
              <span>工单编号：{tickets[0].workOrderId}</span>
              <span>状态：待处理</span>
            </div>
          )}
        </section>

        <AdminPanel
          harbors={harborData}
          tickets={tickets}
          onFacilityStatusChange={handleFacilityStatusChange}
          onHarborStatusChange={handleHarborStatusChange}
          onResetDemoData={resetDemoData}
        />
      </section>
    </main>
  );
}

function RecommendationLog({ resultCount, fallbackUsed, selectedLocation }: { resultCount: number; fallbackUsed: boolean; selectedLocation: string }) {
  return (
    <div className="log-card">
      <strong>推荐日志预览</strong>
      <span>result_count: {resultCount}</span>
      <span>fallback_used: {String(fallbackUsed)}</span>
      <span>location_source: {selectedLocation}</span>
    </div>
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

function AdminPanel({
  harbors,
  tickets,
  onFacilityStatusChange,
  onHarborStatusChange,
  onResetDemoData,
}: {
  harbors: Harbor[];
  tickets: ReportTicket[];
  onFacilityStatusChange: (harborId: string, facilityId: string, status: FacilityStatus) => void;
  onHarborStatusChange: (harborId: string, status: HarborStatus) => void;
  onResetDemoData: () => void;
}) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <Wrench size={20} />
        <h2>简易管理入口</h2>
      </div>
      <div className="admin-toolbar">
        <span>数据会保存到当前浏览器，刷新后仍保留。</span>
        <button type="button" onClick={onResetDemoData}>
          重置样例数据
        </button>
      </div>

      <div className="admin-summary">
        <span>港湾：{harbors.length}</span>
        <span>待处理工单：{tickets.length}</span>
        <span>异常设施：{harbors.flatMap((harbor) => harbor.facilities).filter((facility) => facility.status !== "normal").length}</span>
      </div>

      <div className="admin-list">
        {harbors.map((harbor) => (
          <article key={harbor.id} className="admin-item">
            <div className="admin-item-header">
              <strong>{harbor.name}</strong>
              <select value={harbor.status} onChange={(event) => onHarborStatusChange(harbor.id, event.target.value as HarborStatus)}>
                <option value="open">开放</option>
                <option value="temp_closed">临时关闭</option>
                <option value="closed">关闭</option>
              </select>
            </div>
            <p className="muted">{harbor.district} / {harbor.businessArea} / 更新：{harbor.updatedAt}</p>
            <div className="facility-admin-list">
              {harbor.facilities.map((facility) => (
                <label key={facility.id}>
                  <span>{facility.name}</span>
                  <select value={facility.status} onChange={(event) => onFacilityStatusChange(harbor.id, facility.id, event.target.value as FacilityStatus)}>
                    <option value="normal">正常</option>
                    <option value="fault">故障</option>
                    <option value="maintenance">维护中</option>
                    <option value="unknown">未知</option>
                  </select>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="work-order-list">
        <strong>工单列表</strong>
        {tickets.length === 0 ? (
          <p className="muted">暂无工单。提交一次文字反馈后会自动生成。</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.workOrderId} className="work-order-item">
              <span>{ticket.workOrderId}</span>
              <span>{ticket.harborId}</span>
              <span>{ticket.description}</span>
            </div>
          ))
        )}
      </div>
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
