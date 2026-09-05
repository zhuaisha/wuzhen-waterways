import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

export default function WhyWater() {
  return (
    <section id="whywater" className="section whywater-section">
      <div className="container">
        <SectionHeader number="06" en="WHY WATER?" cn="Why is water the main line?" />
        <div className="whywater-diagram">
          <Reveal className="whywater-diagram__center">
            <div className="whywater-node whywater-node--top">WATER</div>
            <div className="whywater-arrow">
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                <path d="M10 0v30M4 22l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="whywater-node">CONNECTS</div>
            <div className="whywater-arrow">
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                <path d="M10 0v30M4 22l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="whywater-nodes-row">
              <span className="whywater-node whywater-node--small">HOUSES</span>
              <span className="whywater-node whywater-node--small">BRIDGES</span>
              <span className="whywater-node whywater-node--small">STREETS</span>
              <span className="whywater-node whywater-node--small">PEOPLE</span>
              <span className="whywater-node whywater-node--small">BOATS</span>
            </div>
            <div className="whywater-arrow">
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                <path d="M10 0v30M4 22l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="whywater-node whywater-node--bottom">TRADITIONAL LIFE</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
