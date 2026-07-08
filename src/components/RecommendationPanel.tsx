import { AlertTriangle, Clock, MapPin } from "lucide-react";
import type { Recommendation, RecommendationResult } from "../types";

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  recommendationResult: RecommendationResult;
  activeHarborId: string;
  selectedLocation: string;
  onSelectHarbor: (harborId: string) => void;
}

export function RecommendationPanel({ recommendations, recommendationResult, activeHarborId, selectedLocation, onSelectHarbor }: RecommendationPanelProps) {
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
      <RecommendationLog resultCount={recommendations.length} fallbackUsed={recommendationResult.fallbackUsed} selectedLocation={selectedLocation} />
    </div>
  );
}

function RecommendationLog({ resultCount, fallbackUsed, selectedLocation }: { resultCount: number; fallbackUsed: boolean; selectedLocation: string }) {
  return (
    <div className="log-card">
      <strong>推荐日志预览</strong>
      <span>result_count: {resultCount}</span>
      <span>fallback_used: {String(fallbackUsed)}</span>
      <span>location_source: {selectedLocation}</span>
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
      <ul>
        {item.reasons.slice(0, 3).map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {item.warnings.length > 0 && <p className="card-warning">{item.warnings[0]}</p>}
    </button>
  );
}
