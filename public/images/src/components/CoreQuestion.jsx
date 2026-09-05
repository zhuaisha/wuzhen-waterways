import ThreeScene from './ThreeScene.jsx';
import Reveal from './Reveal.jsx';

export default function CoreQuestion() {
  return (
    <section id="corequestion" className="core-question">
      <div className="core-question__bg">
        <div className="core-question__gradient" />
        <div className="core-question__pattern" />
      </div>

      <ThreeScene className="core-question__three" variant="core" scrollAffected opacity={0.5} />

      <div className="container">
        <Reveal className="core-question__box">
          <div className="core-question__label">
            <span className="core-question__num">02</span>
            <span>CORE QUESTION</span>
          </div>
          <div className="core-question__why">WHY?</div>
          <h2 className="core-question__en">
            Why is water the main line<br />of the ancient town?
          </h2>
          <h2 className="core-question__cn">为什么水是古镇的主线？</h2>
          <div className="core-question__divider" />
          <p className="core-question__note">
            Water is more than a view.<br />
            It connects places, people and everyday life.
          </p>
          <p className="core-question__note-cn">
            水不仅是一道风景，<br />
            它还连接着空间、人们和日常生活。
          </p>
        </Reveal>
      </div>
    </section>
  );
}
