import { useEffect, useMemo, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { AcceptancePanel } from "./components/AcceptancePanel";
import { ExternalStatusBar } from "./components/ExternalStatusBar";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { HarborDetailPanel } from "./components/HarborDetailPanel";
import { PortfolioPanel } from "./components/PortfolioPanel";
import { RecommendationPanel } from "./components/RecommendationPanel";
import { RequestPanel } from "./components/RequestPanel";
import { feedbackCategories, type FeedbackCategory } from "./data/feedbackCategories";
import { manualLocations } from "./data/locations";
import { getDemoMetrics } from "./features/dashboard/demoMetrics";
import { prototypeApi } from "./services/prototypeApi";
import type { FacilityStatus, HarborStatus, RecommendationLogEntry, ReportTicket, WorkOrderStatus } from "./types";

type AppView = "portfolio" | "worker" | "admin" | "acceptance";
type FeedbackImageState = "none" | "attached" | "failed";

export function App() {
  const initialState = useMemo(() => prototypeApi.loadState(), []);
  const [activeView, setActiveView] = useState<AppView>("portfolio");
  const [query, setQuery] = useState("我想喝水");
  const [harborData, setHarborData] = useState(initialState.harbors);
  const [hasLocation, setHasLocation] = useState(true);
  const [manualLocationId, setManualLocationId] = useState(manualLocations[0].id);
  const [selectedHarborId, setSelectedHarborId] = useState<string | null>(null);
  const [reportCategory, setReportCategory] = useState<FeedbackCategory>(feedbackCategories[0].value);
  const [reportText, setReportText] = useState("饮水机没水");
  const [feedbackImageState, setFeedbackImageState] = useState<FeedbackImageState>("none");
  const [tickets, setTickets] = useState<ReportTicket[]>(initialState.tickets);
  const [recommendationLogs, setRecommendationLogs] = useState<RecommendationLogEntry[]>(initialState.recommendationLogs);

  useEffect(() => {
    prototypeApi.saveState({
      schemaVersion: 1,
      harbors: harborData,
      tickets,
      recommendationLogs,
    });
  }, [harborData, tickets, recommendationLogs]);

  const manualLocation = manualLocations.find((location) => location.id === manualLocationId) ?? manualLocations[0];
  const recommendationResponse = useMemo(
    () =>
      prototypeApi.getRecommendations({
        text: query,
        hasLocation,
        manualLocation,
        harbors: harborData,
      }),
    [query, harborData, hasLocation, manualLocation],
  );
  const { parsedNeed, recommendationResult } = recommendationResponse;
  const recommendations = recommendationResult.items;
  const demoMetrics = useMemo(() => getDemoMetrics(harborData, tickets, recommendationLogs), [harborData, tickets, recommendationLogs]);
  const runtimeStatus = useMemo(() => prototypeApi.getRuntimeStatus(), []);
  const weatherPreview = useMemo(() => prototypeApi.getWeatherPreview(parsedNeed.weatherContext), [parsedNeed.weatherContext]);
  const activeHarbor =
    recommendations.find((item) => item.harbor.id === selectedHarborId)?.harbor ??
    harborData.find((item) => item.id === selectedHarborId) ??
    recommendations[0]?.harbor ??
    harborData[0];
  const navigationPreview = useMemo(() => prototypeApi.getNavigationPreview(activeHarbor), [activeHarbor]);

  function submitReport() {
    if (!activeHarbor || reportText.trim().length === 0) return;
    const nextTicket = prototypeApi.createReport({
      harborId: activeHarbor.id,
      category: reportCategory,
      description: reportText.trim(),
      imageUrl: feedbackImageState === "attached" ? `mock://feedback/${activeHarbor.id}.jpg` : undefined,
      imageUploadStatus: feedbackImageState === "attached" ? "uploaded" : feedbackImageState === "failed" ? "failed" : "not_provided",
      imageUploadNote: feedbackImageState === "failed" ? "图片上传失败，已按文字反馈继续生成工单。" : undefined,
    });
    setTickets((current) => [nextTicket, ...current]);
  }

  function handleFacilityStatusChange(harborId: string, facilityId: string, status: FacilityStatus) {
    setHarborData((current) => prototypeApi.updateFacilityStatus(current, harborId, facilityId, status));
  }

  function handleHarborStatusChange(harborId: string, status: HarborStatus) {
    setHarborData((current) => prototypeApi.updateHarborStatus(current, harborId, status));
  }

  function handleWorkOrderStatusChange(workOrderId: string, status: WorkOrderStatus) {
    setTickets((current) => prototypeApi.updateWorkOrderStatus(current, workOrderId, status));
  }

  function saveRecommendationLog() {
    const nextLog = prototypeApi.createRecommendationLog(parsedNeed, recommendationResult, hasLocation ? "定位位置" : manualLocation.label);
    setRecommendationLogs((current) => [nextLog, ...current].slice(0, 10));
  }

  function resetDemoData() {
    const nextState = prototypeApi.resetState();
    setHarborData(nextState.harbors);
    setTickets(nextState.tickets);
    setRecommendationLogs(nextState.recommendationLogs);
    setSelectedHarborId(null);
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">V0.7 接入准备原型</p>
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

      <section className="kpi-strip" aria-label="原型关键状态">
        <div>
          <span>开放港湾</span>
          <strong>{demoMetrics.openHarborCount}</strong>
        </div>
        <div>
          <span>当前港湾</span>
          <strong>{activeHarbor.name}</strong>
        </div>
        <div>
          <span>待处理工单</span>
          <strong>{demoMetrics.pendingWorkOrderCount}</strong>
        </div>
        <div>
          <span>推荐日志</span>
          <strong>{demoMetrics.recommendationLogCount}</strong>
        </div>
      </section>

      <ExternalStatusBar status={runtimeStatus} weatherText={weatherPreview.weatherText} weatherMessage={weatherPreview.message} />

      <nav className="view-tabs" aria-label="原型视图">
        <button className={activeView === "portfolio" ? "active" : ""} type="button" onClick={() => setActiveView("portfolio")}>
          作品集说明
        </button>
        <button className={activeView === "worker" ? "active" : ""} type="button" onClick={() => setActiveView("worker")}>
          用户端体验
        </button>
        <button className={activeView === "admin" ? "active" : ""} type="button" onClick={() => setActiveView("admin")}>
          管理端入口
        </button>
        <button className={activeView === "acceptance" ? "active" : ""} type="button" onClick={() => setActiveView("acceptance")}>
          验收面板
        </button>
      </nav>

      {activeView === "portfolio" ? (
        <PortfolioPanel />
      ) : activeView === "worker" ? (
        <section className="workspace-grid">
          <RequestPanel
            query={query}
            hasLocation={hasLocation}
            manualLocationId={manualLocationId}
            parsedNeed={parsedNeed}
            onQueryChange={setQuery}
            onManualLocationChange={setManualLocationId}
          />

          <RecommendationPanel
            recommendations={recommendations}
            recommendationResult={recommendationResult}
            activeHarborId={activeHarbor.id}
            selectedLocation={hasLocation ? "定位位置" : manualLocation.label}
            recommendationLogs={recommendationLogs}
            onSelectHarbor={setSelectedHarborId}
            onSaveRecommendationLog={saveRecommendationLog}
          />

          <HarborDetailPanel harbor={activeHarbor} navigationPreview={navigationPreview} />

          <FeedbackPanel
            activeHarbor={activeHarbor}
            reportCategory={reportCategory}
            reportText={reportText}
            imageState={feedbackImageState}
            latestTicket={tickets[0]}
            onReportCategoryChange={setReportCategory}
            onReportTextChange={setReportText}
            onImageStateChange={setFeedbackImageState}
            onSubmitReport={submitReport}
          />
        </section>
      ) : activeView === "admin" ? (
        <section className="admin-view">
          <AdminPanel
            harbors={harborData}
            tickets={tickets}
            onFacilityStatusChange={handleFacilityStatusChange}
            onHarborStatusChange={handleHarborStatusChange}
            onWorkOrderStatusChange={handleWorkOrderStatusChange}
            onResetDemoData={resetDemoData}
          />
        </section>
      ) : (
        <AcceptancePanel />
      )}
    </main>
  );
}
