import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

export default function Timeline() {
  return (
    <section id="timeline" className="section timeline-section">
      <div className="container">
        <SectionHeader number="07" en="PAST → PRESENT" cn="From Everyday Life to Cultural Experience" />
        <p className="timeline-subtitle">从日常生活到文化体验</p>
        <div className="timeline-grid">
          <Reveal className="timeline-side timeline-side--past">
            <div className="timeline-side__label">PAST</div>
            <h3 className="timeline-side__title">过去</h3>
            <ul className="timeline-side__list">
              <li>Boats</li>
              <li>Transportation</li>
              <li>Trade</li>
              <li>Daily Life</li>
            </ul>
            <div className="timeline-side__cn">船 · 交通 · 贸易 · 日常生活</div>
          </Reveal>

          <div className="timeline-connector">
            <div className="timeline-connector__water">WATER</div>
            <svg className="timeline-connector__line" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,20 C40,8 60,32 100,20 C140,8 160,32 200,20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="timeline-connector__arrow">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M4 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <Reveal className="timeline-side timeline-side--present" delay={150}>
            <div className="timeline-side__label">PRESENT</div>
            <h3 className="timeline-side__title">现在</h3>
            <ul className="timeline-side__list">
              <li>Tourism</li>
              <li>Sightseeing</li>
              <li>Cultural Experience</li>
            </ul>
            <div className="timeline-side__cn">旅游 · 观光 · 文化体验</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
