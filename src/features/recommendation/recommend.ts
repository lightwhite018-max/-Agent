import type { Harbor, ParsedNeed, Recommendation, RecommendationResult } from "../../types";

interface RecommendationOptions {
  preferredDistrict?: string;
  preferredBusinessArea?: string;
}

const crowdScore = {
  quiet: 10,
  moderate: 6,
  crowded: 2,
  unknown: 4,
};

export function recommendHarbors(need: ParsedNeed, harbors: Harbor[], options: RecommendationOptions = {}): Recommendation[] {
  const recommendations = harbors
    .map((harbor) => scoreHarbor(need, harbor, options))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return recommendations;
}

export function recommendHarborsWithFallback(need: ParsedNeed, harbors: Harbor[], options: RecommendationOptions = {}): RecommendationResult {
  const items = recommendHarbors(need, harbors, options);

  if (items.length > 0) {
    return { items, fallbackUsed: false };
  }

  const fallbackItems = harbors
    .map((harbor) => scoreFallbackHarbor(need, harbor, options))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (fallbackItems.length === 0) {
    return {
      items: [],
      fallbackUsed: true,
      noResultReason: "no_open_harbor",
      message: "当前样例数据中没有可开放展示的港湾，可尝试更换位置或稍后重试。",
    };
  }

  return {
    items: fallbackItems,
    fallbackUsed: true,
    noResultReason: "no_facility_match",
    message: "没有完全满足条件的港湾，已展示附近开放但不完全匹配的备选方案。",
  };
}

function scoreHarbor(need: ParsedNeed, harbor: Harbor, options: RecommendationOptions): Recommendation {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  if (harbor.status !== "open") {
    return {
      harbor,
      score: 0,
      reasons,
      warnings: [`当前${harbor.status === "temp_closed" ? "临时关闭" : "未开放"}，不进入首选推荐`],
    };
  }

  score += Math.max(0, 40 - harbor.walkingTimeMinutes * 3);
  reasons.push(`步行约 ${harbor.walkingTimeMinutes} 分钟`);
  score += locationScore(harbor, options, reasons);

  if (need.facilityTypes.length === 0) {
    score += 18;
    reasons.push("可作为附近港湾候选");
  }

  let matchedFacilities = 0;
  for (const type of need.facilityTypes) {
    const facility = harbor.facilities.find((item) => item.type === type);
    if (!facility) {
      warnings.push(`缺少${facilityLabel(type)}`);
      continue;
    }

    if (facility.available && facility.status === "normal") {
      matchedFacilities += 1;
      score += 18;
      reasons.push(`${facility.name}可用`);
    } else {
      score -= 14;
      warnings.push(`${facility.name}当前${facility.status === "fault" ? "故障" : "不可用"}`);
    }
  }

  if (need.facilityTypes.length > 0 && matchedFacilities < need.facilityTypes.length) {
    return {
      harbor,
      score: 0,
      reasons,
      warnings: warnings.length > 0 ? warnings : ["未完全满足目标设施条件"],
    };
  }

  score += 15;
  reasons.push("当前开放");

  score += crowdScore[harbor.crowdLevel];
  if (harbor.crowdLevel === "quiet") {
    reasons.push("当前较空闲");
  }

  if (harbor.dataFreshnessStatus === "stale") {
    warnings.push("信息更新时间较早，请谨慎参考");
    score -= 4;
  }

  return { harbor, score, reasons, warnings };
}

function scoreFallbackHarbor(need: ParsedNeed, harbor: Harbor, options: RecommendationOptions): Recommendation {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  if (harbor.status !== "open") {
    return {
      harbor,
      score: 0,
      reasons,
      warnings: [`当前${harbor.status === "temp_closed" ? "临时关闭" : "未开放"}`],
    };
  }

  score += Math.max(0, 32 - harbor.walkingTimeMinutes * 2);
  reasons.push(`步行约 ${harbor.walkingTimeMinutes} 分钟`);
  score += locationScore(harbor, options, reasons);
  score += crowdScore[harbor.crowdLevel];

  const matched = need.facilityTypes.filter((type) =>
    harbor.facilities.some((facility) => facility.type === type && facility.available && facility.status === "normal"),
  );

  if (need.facilityTypes.length > 0) {
    if (matched.length > 0) {
      score += matched.length * 8;
      reasons.push(`部分满足：${matched.map(facilityLabel).join("、")}`);
    }

    const missingCount = need.facilityTypes.length - matched.length;
    if (missingCount > 0) {
      warnings.push("不完全满足目标设施条件");
      score -= missingCount * 5;
    }
  } else {
    score += 8;
  }

  if (harbor.dataFreshnessStatus === "stale") {
    warnings.push("信息更新时间较早，请谨慎参考");
    score -= 4;
  }

  return { harbor, score, reasons, warnings };
}

function locationScore(harbor: Harbor, options: RecommendationOptions, reasons: string[]) {
  if (options.preferredBusinessArea && harbor.businessArea === options.preferredBusinessArea) {
    reasons.push(`位于${options.preferredBusinessArea}`);
    return 8;
  }

  if (options.preferredDistrict && harbor.district === options.preferredDistrict) {
    reasons.push(`位于${options.preferredDistrict}`);
    return 5;
  }

  return 0;
}

function facilityLabel(type: string): string {
  const labels: Record<string, string> = {
    drinking_water: "饮水设施",
    charging: "充电设施",
    rest: "休息区",
    indoor: "室内空间",
    toilet: "卫生间",
    microwave: "热饭设施",
    first_aid: "应急药箱",
    hot_water: "热水",
    umbrella: "雨具",
  };

  return labels[type] ?? type;
}
