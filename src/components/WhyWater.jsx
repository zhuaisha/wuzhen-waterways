import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import { useLang } from '../i18n/LanguageContext.jsx';

export default function WhyWater() {
  const { t } = useLang();
  const w = t('whywater') || {};

  return (
    <section id="whywater" className="section whywater-section">
      <div className="container">
        <SectionHeader number="04" en="WHY WATER?" cn={w.headerCn} week={w.week} />
        <div className="whywater-diagram">
          <Reveal className="whywater-diagram__center">
            <div className="whywater-node whywater-node--top">{w.top ?? 'WATER'}</div>
            <div className="whywater-arrow">
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                <path d="M10 0v30M4 22l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="whywater-node">{w.mid ?? 'CONNECTS'}</div>
            <div className="whywater-arrow">
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                <path d="M10 0v30M4 22l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="whywater-nodes-row">
              {(w.small ?? []).map((s, i) => (
                <span key={i} className="whywater-node whywater-node--small">{s}</span>
              ))}
            </div>
            <div className="whywater-arrow">
              <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
                <path d="M10 0v30M4 22l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="whywater-node whywater-node--bottom">{w.bottom ?? 'TRADITIONAL LIFE'}</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
