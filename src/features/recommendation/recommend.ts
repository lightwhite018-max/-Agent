import type { Harbor, ParsedNeed, Recommendation } from "../../types";

const crowdScore = {
  quiet: 10,
  moderate: 6,
  crowded: 2,
  unknown: 4,
};

export function recommendHarbors(need: ParsedNeed, harbors: Harbor[]): Recommendation[] {
  const recommendations = harbors
    .map((harbor) => scoreHarbor(need, harbor))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return recommendations;
}

function scoreHarbor(need: ParsedNeed, harbor: Harbor): Recommendation {
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
