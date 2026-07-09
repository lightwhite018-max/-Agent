import type { Harbor, RecommendationLogEntry, ReportTicket } from "../../types";

export interface DemoMetrics {
  openHarborCount: number;
  pendingWorkOrderCount: number;
  resolvedWorkOrderCount: number;
  abnormalFacilityCount: number;
  recommendationLogCount: number;
  fallbackLogCount: number;
}

export function getDemoMetrics(harbors: Harbor[], tickets: ReportTicket[], recommendationLogs: RecommendationLogEntry[]): DemoMetrics {
  return {
    openHarborCount: harbors.filter((harbor) => harbor.status === "open").length,
    pendingWorkOrderCount: tickets.filter((ticket) => ticket.status === "pending").length,
    resolvedWorkOrderCount: tickets.filter((ticket) => ticket.status === "resolved").length,
    abnormalFacilityCount: harbors.flatMap((harbor) => harbor.facilities).filter((facility) => facility.status !== "normal").length,
    recommendationLogCount: recommendationLogs.length,
    fallbackLogCount: recommendationLogs.filter((log) => log.fallbackUsed).length,
  };
}
