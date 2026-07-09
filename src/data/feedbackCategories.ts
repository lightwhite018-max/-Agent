export const feedbackCategories = [
  { value: "设施异常", label: "设施异常", description: "饮水、充电、座椅、药箱等设施不可用" },
  { value: "环境卫生", label: "环境卫生", description: "卫生、垃圾、异味、占用等现场问题" },
  { value: "开放异常", label: "开放异常", description: "显示开放但现场关闭或无法进入" },
  { value: "导航错误", label: "导航错误", description: "地址、定位、路线或入口指引不准确" },
  { value: "建议补充", label: "建议补充", description: "希望新增设施、服务或信息说明" },
] as const;

export type FeedbackCategory = (typeof feedbackCategories)[number]["value"];
