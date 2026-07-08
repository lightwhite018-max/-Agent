import { MessageSquareText, Send } from "lucide-react";
import { manualLocations } from "../data/locations";
import type { ParsedNeed } from "../types";

const quickNeeds = ["我想喝水", "手机没电了", "下雨了还想充电", "太热了想休息", "想上厕所"];

interface RequestPanelProps {
  query: string;
  hasLocation: boolean;
  manualLocationId: string;
  parsedNeed: ParsedNeed;
  onQueryChange: (query: string) => void;
  onManualLocationChange: (locationId: string) => void;
}

export function RequestPanel({ query, hasLocation, manualLocationId, parsedNeed, onQueryChange, onManualLocationChange }: RequestPanelProps) {
  return (
    <div className="panel request-panel">
      <div className="panel-title">
        <MessageSquareText size={20} />
        <h2>需求识别</h2>
      </div>

      <div className="quick-actions">
        {quickNeeds.map((need) => (
          <button key={need} type="button" onClick={() => onQueryChange(need)}>
            {need}
          </button>
        ))}
      </div>

      <label className="input-label" htmlFor="query">
        输入劳动者需求
      </label>
      <div className="query-box">
        <input id="query" value={query} onChange={(event) => onQueryChange(event.target.value)} />
        <button type="button" aria-label="提交需求">
          <Send size={18} />
        </button>
      </div>

      <div className="agent-result">
        <div>
          <span>识别意图</span>
          <strong>{parsedNeed.intent}</strong>
        </div>
        <div>
          <span>设施条件</span>
          <strong>{parsedNeed.facilityTypes.length ? parsedNeed.facilityTypes.join(", ") : "待追问"}</strong>
        </div>
        <div>
          <span>位置状态</span>
          <strong>{parsedNeed.needsLocation ? "需要手动位置" : "可推荐附近港湾"}</strong>
        </div>
      </div>

      {parsedNeed.followUp && <p className="notice">{parsedNeed.followUp}</p>}
      {parsedNeed.safetyNotice && <p className="notice warning">{parsedNeed.safetyNotice}</p>}
      {!hasLocation && <p className="notice">定位被拒绝时，系统会提供区县、商圈或地址输入入口。当前原型使用下方选择的位置继续推荐。</p>}
      {!hasLocation && (
        <div className="manual-location">
          <label htmlFor="manual-location">选择手动位置</label>
          <select id="manual-location" value={manualLocationId} onChange={(event) => onManualLocationChange(event.target.value)}>
            {manualLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.district} - {location.businessArea}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
