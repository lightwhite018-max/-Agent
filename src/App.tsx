import { useEffect, useMemo, useState } from "react";
import { AdminPanel } from "./components/AdminPanel";
import { FeedbackPanel } from "./components/FeedbackPanel";
import { HarborDetailPanel } from "./components/HarborDetailPanel";
import { RecommendationPanel } from "./components/RecommendationPanel";
import { RequestPanel } from "./components/RequestPanel";
import { manualLocations } from "./data/locations";
import { prototypeApi } from "./services/prototypeApi";
import type { FacilityStatus, HarborStatus, ReportTicket } from "./types";

export function App() {
  const initialState = useMemo(() => prototypeApi.loadState(), []);
  const [query, setQuery] = useState("我想喝水");
  const [harborData, setHarborData] = useState(initialState.harbors);
  const [hasLocation, setHasLocation] = useState(true);
  const [manualLocationId, setManualLocationId] = useState(manualLocations[0].id);
  const [selectedHarborId, setSelectedHarborId] = useState<string | null>(null);
  const [reportText, setReportText] = useState("饮水机没水");
  const [tickets, setTickets] = useState<ReportTicket[]>(initialState.tickets);

  useEffect(() => {
    prototypeApi.saveState({
      schemaVersion: 1,
      harbors: harborData,
      tickets,
    });
  }, [harborData, tickets]);

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
  const activeHarbor =
    recommendations.find((item) => item.harbor.id === selectedHarborId)?.harbor ??
    harborData.find((item) => item.id === selectedHarborId) ??
    recommendations[0]?.harbor ??
    harborData[0];

  function submitReport() {
    if (!activeHarbor || reportText.trim().length === 0) return;
    const nextTicket = prototypeApi.createReport({
      harborId: activeHarbor.id,
      category: "设施异常",
      description: reportText.trim(),
    });
    setTickets((current) => [nextTicket, ...current]);
  }

  function handleFacilityStatusChange(harborId: string, facilityId: string, status: FacilityStatus) {
    setHarborData((current) => prototypeApi.updateFacilityStatus(current, harborId, facilityId, status));
  }

  function handleHarborStatusChange(harborId: string, status: HarborStatus) {
    setHarborData((current) => prototypeApi.updateHarborStatus(current, harborId, status));
  }

  function resetDemoData() {
    const nextState = prototypeApi.resetState();
    setHarborData(nextState.harbors);
    setTickets(nextState.tickets);
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
          onSelectHarbor={setSelectedHarborId}
        />

        <HarborDetailPanel harbor={activeHarbor} />

        <FeedbackPanel
          activeHarbor={activeHarbor}
          reportText={reportText}
          latestTicket={tickets[0]}
          onReportTextChange={setReportText}
          onSubmitReport={submitReport}
        />

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
