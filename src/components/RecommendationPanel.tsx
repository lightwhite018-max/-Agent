import { AlertTriangle, Clock, MapPin, Navigation } from "lucide-react";
import type { Recommendation, RecommendationLogEntry, RecommendationResult } from "../types";

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  recommendationResult: RecommendationResult;
  activeHarborId: string;
  selectedLocation: string;
  recommendationLogs: RecommendationLogEntry[];
  onSelectHarbor: (harborId: string) => void;
  onSaveRecommendationLog: () => void;
}

export function RecommendationPanel({
  recommendations,
  recommendationResult,
  activeHarborId,
  selectedLocation,
  recommendationLogs,
  onSelectHarbor,
  onSaveRecommendationLog,
}: RecommendationPanelProps) {
  return (
    <div className="panel recommendation-panel">
      <div className="panel-title">
        <MapPin size={20} />
        <h2>推荐结果</h2>
      </div>

      {recommendations.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={24} />
          <p>暂无完全满足条件的港湾。可放宽设施条件或扩大搜索范围。</p>
        </div>
      ) : (
        <div className="recommendation-list">
          {recommendationResult.fallbackUsed && recommendationResult.message && <p className="notice warning">{recommendationResult.message}</p>}
          {recommendations.map((item) => (
            <RecommendationCard key={item.harbor.id} item={item} selected={activeHarborId === item.harbor.id} onSelect={() => onSelectHarbor(item.harbor.id)} />
          ))}
        </div>
      )}
      <RecommendationLog resultCount={recommendations.length} fallbackUsed={recommendationResult.fallbackUsed} selectedLocation={selectedLocation} onSaveRecommendationLog={onSaveRecommendationLog} />
      <RecommendationLogHistory logs={recommendationLogs} />
    </div>
  );
}

function RecommendationLog({
  resultCount,
  fallbackUsed,
  selectedLocation,
  onSaveRecommendationLog,
}: {
  resultCount: number;
  fallbackUsed: boolean;
  selectedLocation: string;
  onSaveRecommendationLog: () => void;
}) {
  return (
    <div className="log-card">
      <strong>推荐日志预览</strong>
      <span>result_count: {resultCount}</span>
      <span>fallback_used: {String(fallbackUsed)}</span>
      <span>location_source: {selectedLocation}</span>
      <button type="button" onClick={onSaveRecommendationLog}>
        保存本次推荐日志
      </button>
    </div>
  );
}

function RecommendationLogHistory({ logs }: { logs: RecommendationLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="muted">暂无已保存推荐日志。</p>;
  }

  return (
    <div className="log-history">
      <strong>最近推荐日志</strong>
      {logs.slice(0, 3).map((log) => (
        <div key={log.id} className="log-history-item">
          <span>{log.createdAt}</span>
          <span>{log.userInput}</span>
          <span>
            {log.resultCount} 个结果 / 降级：{String(log.fallbackUsed)}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecommendationCard({ item, selected, onSelect }: { item: Recommendation; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`harbor-card ${selected ? "selected" : ""}`} type="button" onClick={onSelect}>
      <div className="card-header">
        <strong>{item.harbor.name}</strong>
        <span>{Math.round(item.score)} 分</span>
      </div>
      <p>{item.harbor.address}</p>
      <div className="meta-row">
        <span>
          <Clock size={15} />
          {item.harbor.walkingTimeMinutes} 分钟
        </span>
        <span>{item.harbor.openingHours}</span>
      </div>
      <div className="card-action-row">
        <span>{item.harbor.status === "open" ? "开放中" : "不可用"}</span>
        <span>
          <Navigation size={15} />
          查看详情与导航
        </span>
      </div>
      <ul>
        {item.reasons.slice(0, 3).map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {item.warnings.length > 0 && <p className="card-warning">{item.warnings[0]}</p>}
    </button>
  );
}
