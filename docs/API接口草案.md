# 劳动者港湾智能助手 API 接口草案

更新时间：2026-07-09

## 1. 说明

本文档将当前 `prototypeApi` 能力整理成后续真实后端可实现的接口草案。当前原型仍使用本地 seed 数据和浏览器本地存储，真实接口接入后应优先替换 `src/services/prototypeApi.ts`，尽量不改页面组件。

## 2. 通用约定

- 返回格式统一为 JSON。
- 时间字段先使用 ISO 字符串或 `YYYY-MM-DD HH:mm` 字符串，后端落库时建议统一为 ISO 8601。
- P0-M 阶段允许匿名用户查询和提交反馈。
- 地图、天气、图片上传失败时必须返回可降级状态，不得阻断核心推荐。

## 3. 港湾查询

### GET /api/harbors

用途：查询港湾列表。

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| district | string | 否 | 区县 |
| businessArea | string | 否 | 商圈 |
| status | string | 否 | open/closed/temp_closed |
| facilityType | string | 否 | drinking_water/charging/rest 等 |

响应示例：

```json
{
  "items": [
    {
      "id": "HB001",
      "name": "解放碑环卫劳动者港湾",
      "district": "渝中区",
      "businessArea": "解放碑",
      "address": "重庆市渝中区民族路 188 号附近",
      "status": "open",
      "openingHours": "08:00-21:00",
      "facilities": []
    }
  ]
}
```

### GET /api/harbors/{harborId}

用途：查看港湾详情。

响应字段应包含：

- 港湾基础信息
- 开放状态
- 设施列表
- 更新时间
- 数据新鲜度
- 反馈入口所需 harborId

## 4. 推荐接口

### POST /api/recommendations

用途：根据自然语言、位置和设施条件返回推荐港湾。

请求体：

```json
{
  "text": "下雨了还想充电",
  "location": {
    "source": "manual",
    "district": "江北区",
    "businessArea": "观音桥"
  }
}
```

响应体：

```json
{
  "parsedNeed": {
    "intent": "query_facility",
    "facilityTypes": ["indoor", "charging"],
    "needsLocation": true
  },
  "recommendationResult": {
    "fallbackUsed": false,
    "items": [
      {
        "harborId": "HB002",
        "score": 73,
        "reasons": ["步行约 3 分钟", "充电插座可用", "室内避雨区可用"],
        "warnings": []
      }
    ]
  }
}
```

降级要求：

- 无定位时返回 manual_location_required 或提供热门区域候选。
- 无完全匹配结果时返回 fallbackUsed=true，并提供不完全匹配的开放港湾。
- 地图 API 失败时不编造步行时间。

### POST /api/recommendation-logs

用途：保存一次推荐复盘记录，便于后续验收、运营分析和推荐规则调优。

请求体：

```json
{
  "userInput": "我想喝水",
  "intent": "query_facility",
  "facilityTypes": ["drinking_water"],
  "locationSource": "定位位置",
  "resultCount": 2,
  "resultHarborIds": ["HB005", "HB001"],
  "fallbackUsed": false,
  "noResultReason": null
}
```

### GET /api/recommendation-logs

用途：查看最近推荐日志。

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| limit | number | 否 | 默认返回最近 10 条 |

## 5. 反馈与工单

### POST /api/reports

用途：提交文字或图片反馈。P0-M 必须支持无图片提交。

请求体：

```json
{
  "harborId": "HB001",
  "category": "设施异常",
  "description": "饮水机没水",
  "imageUrl": null,
  "imageUploadStatus": "not_provided",
  "imageUploadNote": null
}
```

响应体：

```json
{
  "reportId": "RP000001",
  "workOrderId": "WO000001",
  "imageUploadStatus": "not_provided",
  "status": "pending"
}
```

降级要求：

- 图片上传失败时允许仅文字提交。
- 图片上传失败时返回 imageUploadStatus=failed，并记录 imageUploadNote。
- 图片审核未完成时反馈可先进入 pending_review，P0-M 可先不展示图片。

### GET /api/work-orders

用途：管理端查看工单列表。

请求参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| status | string | 否 | pending/processing/resolved/closed |
| harborId | string | 否 | 港湾 ID |

### PATCH /api/work-orders/{workOrderId}

用途：更新工单状态和处理结果。

请求体：

```json
{
  "status": "resolved",
  "resultNote": "已补水并完成现场检查"
}
```

状态流转：

```text
pending -> processing -> resolved -> closed
```

## 6. 管理端接口

### PATCH /api/harbors/{harborId}

用途：更新港湾开放状态。

请求体：

```json
{
  "status": "temp_closed",
  "statusReason": "管理员手动更新"
}
```

### PATCH /api/facilities/{facilityId}

用途：更新设施状态。

请求体：

```json
{
  "status": "fault",
  "available": false
}
```

要求：

- 更新设施状态后应同步更新港湾 updated_at。
- 设施故障时不计入推荐满足条件。

## 7. 外部服务状态

### GET /api/runtime-status

用途：返回当前地图、天气、后端能力状态，便于前端展示降级说明。

响应体：

```json
{
  "map": "mock",
  "weather": "mock",
  "api": "local"
}
```

## 8. 后续待细化

- 登录态和用户身份。
- 管理员权限范围。
- 图片上传签名和对象存储策略。
- 内容安全审核。
- 地图服务商字段差异。
- 天气服务商字段差异。
- 工单通知机制。
