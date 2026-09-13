import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import CountUp from './CountUp.jsx';

export default function Facts() {
  return (
    <section id="facts" className="section facts-section">
      <div className="container">
        <SectionHeader number="03" en="FACTS" cn="3 Facts about Wuzhen" week="Week 1" />
        <div className="facts-grid">
          <Reveal className="fact-card">
            <div className="fact-card__tag">Fact 01</div>
            <h3 className="fact-card__en">Cross-shaped Water System</h3>
            <p className="fact-card__cn">
              乌镇的内河水系呈十字形，把古镇划分为不同区域，水道是古镇空间布局的重要组成部分。
            </p>
            <p className="fact-card__summary">Water divides the town into zones, and the town is also connected by water.</p>
          </Reveal>

          <Reveal className="fact-card fact-card--big" delay={100}>
            <div className="fact-card__tag">Fact 02</div>
            <div className="fact-card__big-num">
              <CountUp to={72} className="fact-card__count" />
            </div>
            <div className="fact-card__big-label">Ancient Stone Bridges</div>
            <p className="fact-card__en">
              Xizha has nearly 10,000 meters of waterways and 72 ancient stone bridges.
            </p>
            <div className="fact-card__stats">
              <div className="fact-card__stat">
                <span className="fact-card__stat-num">
                  <CountUp to={10000} duration={2} className="fact-card__count" />
                </span>
                <span className="fact-card__stat-unit">METERS</span>
                <span className="fact-card__stat-label">of waterways in Xizha</span>
              </div>
              <div className="fact-card__stat">
                <span className="fact-card__stat-num">
                  <CountUp to={72} className="fact-card__count" />
                </span>
                <span className="fact-card__stat-unit">BRIDGES</span>
                <span className="fact-card__stat-label">ancient stone arches</span>
              </div>
            </div>
            <p className="fact-card__cn">
              西栅有近万米河道和72座古石桥，桥梁与水道共同构成典型的江南水乡景观。
            </p>
            <p className="fact-card__summary">Bridges connect the banks, making water accessible to everyone.</p>
          </Reveal>

          <Reveal className="fact-card" delay={200}>
            <div className="fact-card__tag">Fact 03</div>
            <h3 className="fact-card__en">Water &amp; Everyday Life</h3>
            <p className="fact-card__en">
              In the past, local people used boats for travel, transportation and trade.
            </p>
            <p className="fact-card__cn">
              过去当地居民常利用船只出行、运输和进行交易，水道直接参与人们的日常生活。
            </p>
            <p className="fact-card__summary">Water was not just scenery — it was the road of daily life.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}