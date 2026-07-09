import type { ParsedNeed, RecommendationLogEntry, RecommendationResult } from "../../types";

export function createRecommendationLog(parsedNeed: ParsedNeed, recommendationResult: RecommendationResult, locationSource: string): RecommendationLogEntry {
  const timestamp = Date.now().toString().slice(-8);

  return {
    id: `RL${timestamp}`,
    userInput: parsedNeed.rawText,
    intent: parsedNeed.intent,
    facilityTypes: parsedNeed.facilityTypes,
    locationSource,
    resultCount: recommendationResult.items.length,
    resultHarborIds: recommendationResult.items.map((item) => item.harbor.id),
    fallbackUsed: recommendationResult.fallbackUsed,
    noResultReason: recommendationResult.noResultReason,
    createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
  };
}
