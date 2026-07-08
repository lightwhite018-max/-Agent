import type { FacilityType, ParsedNeed } from "../../types";

const facilityKeywords: Array<{ type: FacilityType; keywords: string[] }> = [
  { type: "drinking_water", keywords: ["喝水", "饮水", "水", "口渴"] },
  { type: "charging", keywords: ["充电", "没电", "插座", "电量"] },
  { type: "rest", keywords: ["休息", "歇", "坐", "停一会"] },
  { type: "indoor", keywords: ["室内", "屋里", "避雨", "躲雨", "空调"] },
  { type: "toilet", keywords: ["厕所", "卫生间", "如厕"] },
  { type: "microwave", keywords: ["热饭", "饭凉", "微波炉"] },
  { type: "first_aid", keywords: ["药", "药箱", "头晕", "中暑", "不舒服"] },
  { type: "hot_water", keywords: ["热水", "开水"] },
  { type: "umbrella", keywords: ["雨伞", "伞"] },
];

export function parseNeed(rawText: string, hasLocation: boolean): ParsedNeed {
  const text = rawText.trim();
  const facilityTypes = new Set<FacilityType>();

  for (const rule of facilityKeywords) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      facilityTypes.add(rule.type);
    }
  }

  const weatherContext = text.includes("下雨") || text.includes("雨") ? "rain" : text.includes("热") || text.includes("高温") ? "hot" : text.includes("冷") || text.includes("低温") ? "cold" : undefined;

  if (weatherContext === "rain") {
    facilityTypes.add("indoor");
  }

  if (weatherContext === "hot") {
    facilityTypes.add("indoor");
    facilityTypes.add("drinking_water");
    facilityTypes.add("rest");
  }

  if (weatherContext === "cold") {
    facilityTypes.add("indoor");
    facilityTypes.add("hot_water");
    facilityTypes.add("rest");
  }

  const isFeedback = ["坏了", "没水", "故障", "反馈", "投诉", "报修"].some((keyword) => text.includes(keyword));
  const isNavigation = ["导航", "怎么去", "路线", "带我去"].some((keyword) => text.includes(keyword));
  const hasSafetyWord = ["头晕", "中暑", "不舒服", "胸闷"].some((keyword) => text.includes(keyword));

  const vague = ["找个地方", "附近有吗", "哪里能去", "帮我找"].some((keyword) => text.includes(keyword)) && facilityTypes.size === 0;

  if (vague) {
    return {
      intent: "unclear",
      rawText,
      facilityTypes: [],
      openNow: true,
      needsIndoor: false,
      needsLocation: !hasLocation,
      followUp: "你想找喝水、充电、休息、避雨还是如厕？",
    };
  }

  return {
    intent: hasSafetyWord ? "safety" : isFeedback ? "feedback" : isNavigation ? "navigation" : facilityTypes.size > 0 ? "query_facility" : "query_harbor",
    rawText,
    facilityTypes: [...facilityTypes],
    weatherContext,
    openNow: true,
    needsIndoor: facilityTypes.has("indoor"),
    needsLocation: !hasLocation,
    safetyNotice: hasSafetyWord ? "我可以帮你找附近有应急药箱或可休息的港湾，但不提供医疗诊断。若症状明显，请及时拨打急救电话或就医。" : undefined,
  };
}
