import ThreeScene from './ThreeScene.jsx';
import Reveal from './Reveal.jsx';

export default function Summary() {
  return (
    <section id="summary" className="summary-section">
      <ThreeScene className="summary-section__three" variant="summary" opacity={0.6} />
      <div className="summary-section__overlay" />
      <div className="container">
        <Reveal className="summary-box">
          <h2 className="summary-title">Water connects everything.</h2>
          <p className="summary-cn">水，把一切连接起来。</p>
          <div className="summary-divider" />
          <p className="summary-en">
            Water connects the town,<br />
            supports traditional life,<br />
            and gives Wuzhen its unique character.
          </p>
          <p className="summary-cn-block">
            在乌镇，水并不只是风景的一部分。<br />
            它连接着古镇，也支撑着传统生活，<br />
            赋予古镇独特的魅力。
          </p>
          <div className="summary-brand">
            <span className="summary-brand__main">WUZHEN</span>
            <span className="summary-brand__sub">Waterways &amp; Bridges</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
