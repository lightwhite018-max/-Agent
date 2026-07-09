import { BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { demoScriptSteps, nextRoadmapItems, portfolioHighlights } from "../data/portfolioGuide";

export function PortfolioPanel() {
  return (
    <section className="portfolio-view">
      <div className="panel portfolio-hero">
        <div>
          <p className="eyebrow">AI 产品经理作品集</p>
          <h2>劳动者港湾智能助手</h2>
          <p className="muted">这是一个面向 AI 产品经理实习求职的 Web/H5 原型，用来展示从调研理解、需求拆解、MVP 设计到可运行验证的完整产品思路。</p>
        </div>
        <span className="portfolio-badge">P0-M 100% 可演示</span>
      </div>

      <div className="portfolio-grid">
        {portfolioHighlights.map((item) => (
          <article key={item.title} className="panel portfolio-card">
            <BriefcaseBusiness size={20} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="panel portfolio-script">
        <div className="panel-title">
          <CheckCircle2 size={20} />
          <h2>推荐演示路径</h2>
        </div>
        <ol>
          {demoScriptSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="panel portfolio-script">
        <div className="panel-title">
          <CheckCircle2 size={20} />
          <h2>后续迭代计划</h2>
        </div>
        <ul>
          {nextRoadmapItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
