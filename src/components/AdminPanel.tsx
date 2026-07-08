import { Wrench } from "lucide-react";
import type { FacilityStatus, Harbor, HarborStatus, ReportTicket } from "../types";

interface AdminPanelProps {
  harbors: Harbor[];
  tickets: ReportTicket[];
  onFacilityStatusChange: (harborId: string, facilityId: string, status: FacilityStatus) => void;
  onHarborStatusChange: (harborId: string, status: HarborStatus) => void;
  onResetDemoData: () => void;
}

export function AdminPanel({ harbors, tickets, onFacilityStatusChange, onHarborStatusChange, onResetDemoData }: AdminPanelProps) {
  return (
    <section className="panel admin-panel">
      <div className="panel-title">
        <Wrench size={20} />
        <h2>简易管理入口</h2>
      </div>
      <div className="admin-toolbar">
        <span>数据会保存到当前浏览器，刷新后仍保留。</span>
        <button type="button" onClick={onResetDemoData}>
          重置样例数据
        </button>
      </div>

      <div className="admin-summary">
        <span>港湾：{harbors.length}</span>
        <span>待处理工单：{tickets.length}</span>
        <span>异常设施：{harbors.flatMap((harbor) => harbor.facilities).filter((facility) => facility.status !== "normal").length}</span>
      </div>

      <div className="admin-list">
        {harbors.map((harbor) => (
          <article key={harbor.id} className="admin-item">
            <div className="admin-item-header">
              <strong>{harbor.name}</strong>
              <select value={harbor.status} onChange={(event) => onHarborStatusChange(harbor.id, event.target.value as HarborStatus)}>
                <option value="open">开放</option>
                <option value="temp_closed">临时关闭</option>
                <option value="closed">关闭</option>
              </select>
            </div>
            <p className="muted">
              {harbor.district} / {harbor.businessArea} / 更新：{harbor.updatedAt}
            </p>
            <div className="facility-admin-list">
              {harbor.facilities.map((facility) => (
                <label key={facility.id}>
                  <span>{facility.name}</span>
                  <select value={facility.status} onChange={(event) => onFacilityStatusChange(harbor.id, facility.id, event.target.value as FacilityStatus)}>
                    <option value="normal">正常</option>
                    <option value="fault">故障</option>
                    <option value="maintenance">维护中</option>
                    <option value="unknown">未知</option>
                  </select>
                </label>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="work-order-list">
        <strong>工单列表</strong>
        {tickets.length === 0 ? (
          <p className="muted">暂无工单。提交一次文字反馈后会自动生成。</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.workOrderId} className="work-order-item">
              <span>{ticket.workOrderId}</span>
              <span>{ticket.harborId}</span>
              <span>{ticket.description}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
