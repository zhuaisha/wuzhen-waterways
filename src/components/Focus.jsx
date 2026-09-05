import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const flowSteps = ['WATER', 'CONNECT', 'LIFE', 'CULTURE'];

export default function Focus() {
  return (
    <section id="focus" className="section">
      <div className="container">
        <SectionHeader number="01" en="OUR FOCUS" cn="项目切口" />
        <div className="focus-grid">
          <Reveal>
            <h2 className="focus-grid__big-en">
              Water is the<br />main line.
            </h2>
            <h2 className="focus-grid__big-cn">水，是古镇的主线。</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="focus-grid__en">
              We focus on a section of the waterways<br />
              and an ancient bridge in Xizha, Wuzhen.
            </p>
            <p className="focus-grid__cn">
              我们选择乌镇西栅的一段水道和沿线古桥作为研究对象，重点观察水道、桥梁、两岸建筑以及传统生活之间的关系。
            </p>
            <p className="focus-grid__en-sub">
              We explore the relationship between water, bridges, buildings and traditional life.
            </p>
            <div className="focus-flow">
              {flowSteps.map((step, i) => (
                <span key={step} style={{ display: 'contents' }}>
                  <span className="focus-flow__node">{step}</span>
                  {i < flowSteps.length - 1 && <span className="focus-flow__arrow">→</span>}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
