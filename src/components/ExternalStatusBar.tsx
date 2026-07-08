import type { ExternalServiceStatus } from "../services/externalServices";

interface ExternalStatusBarProps {
  status: ExternalServiceStatus;
  weatherMessage: string;
}

export function ExternalStatusBar({ status, weatherMessage }: ExternalStatusBarProps) {
  return (
    <section className="external-status" aria-label="外部服务状态">
      <StatusPill label="地图" value={status.map === "configured" ? "已配置" : "Mock 降级"} tone={status.map} />
      <StatusPill label="天气" value={status.weather === "configured" ? "已配置" : "Mock 降级"} tone={status.weather} />
      <StatusPill label="后端" value={status.api === "configured" ? "已配置" : "本地原型"} tone={status.api === "configured" ? "configured" : "mock"} />
      <p>{weatherMessage}</p>
    </section>
  );
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: "mock" | "configured" }) {
  return (
    <span className={`service-pill ${tone}`}>
      <strong>{label}</strong>
      {value}
    </span>
  );
}
