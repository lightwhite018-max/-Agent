export type AcceptanceStatus = "covered" | "enhanced" | "pending";

export interface AcceptanceCase {
  id: string;
  title: string;
  status: AcceptanceStatus;
  scenario: string;
  evidence: string;
}

export const acceptanceCases: AcceptanceCase[] = [
  {
    id: "AC-001",
    title: "自然语言喝水推荐",
    status: "covered",
    scenario: "用户输入“我想喝水”",
    evidence: "规则 Agent 识别 drinking_water，推荐 HB001，过滤无饮水设施和关闭港湾。",
  },
  {
    id: "AC-002",
    title: "多需求推荐",
    status: "covered",
    scenario: "用户输入“下雨了，我还想找个地方给手机充电”",
    evidence: "识别 charging + indoor，优先推荐室内且可充电港湾。",
  },
  {
    id: "AC-003",
    title: "模糊需求追问",
    status: "covered",
    scenario: "用户输入“我想找个地方”",
    evidence: "进入 unclear，并展示喝水、充电、休息、避雨、如厕快捷选项。",
  },
  {
    id: "AC-004",
    title: "定位授权",
    status: "enhanced",
    scenario: "用户首次使用附近推荐",
    evidence: "原型用“已授权定位/模拟拒绝定位”展示定位状态，真实授权待地图 SDK 接入。",
  },
  {
    id: "AC-005",
    title: "定位拒绝降级",
    status: "covered",
    scenario: "用户拒绝定位后继续查询",
    evidence: "提供区县/商圈手动位置，推荐时按手动位置加权。",
  },
  {
    id: "AC-006",
    title: "设施筛选",
    status: "covered",
    scenario: "用户查询充电或饮水",
    evidence: "仅把 available=true 且 status=normal 的目标设施计入满足条件结果。",
  },
  {
    id: "AC-007",
    title: "开放状态判断",
    status: "covered",
    scenario: "港湾为 closed 或 temp_closed",
    evidence: "关闭港湾不进入首选推荐，详情和管理端展示状态。",
  },
  {
    id: "AC-008",
    title: "推荐排序",
    status: "covered",
    scenario: "多个港湾同时满足部分条件",
    evidence: "按步行时间、设施匹配、开放状态、拥挤程度生成可解释分数。",
  },
  {
    id: "AC-009",
    title: "地图路线",
    status: "pending",
    scenario: "用户点击导航",
    evidence: "当前仅保留导航入口与降级说明，真实路线待地图 API 接入。",
  },
  {
    id: "AC-010",
    title: "地图失败降级",
    status: "enhanced",
    scenario: "地图 API 超时",
    evidence: "原型明确提示不编造步行时间，可展示地址和直线距离。",
  },
  {
    id: "AC-011",
    title: "港湾详情",
    status: "covered",
    scenario: "用户点击推荐卡",
    evidence: "展示名称、地址、开放状态、设施、更新时间、数据新鲜度和反馈入口。",
  },
  {
    id: "AC-012",
    title: "文字反馈",
    status: "covered",
    scenario: "用户不上传图片，提交“饮水机没水”",
    evidence: "生成 report_id 和 work_order_id，并保存到本地工单列表。",
  },
  {
    id: "AC-013",
    title: "图片反馈降级",
    status: "enhanced",
    scenario: "图片上传失败",
    evidence: "当前原型将图片设为 P0-E，文字反馈不被阻断。",
  },
  {
    id: "AC-014",
    title: "工单生成",
    status: "covered",
    scenario: "有效反馈提交成功",
    evidence: "自动生成 pending 工单，管理端可查看。",
  },
  {
    id: "AC-015",
    title: "数据更新时间",
    status: "covered",
    scenario: "港湾 data_freshness_status=stale",
    evidence: "详情页展示“信息更新时间较早，请谨慎参考”。",
  },
];
