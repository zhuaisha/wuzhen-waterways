import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import { useLang } from '../i18n/LanguageContext.jsx';

export default function Timeline() {
  const { t } = useLang();
  const tl = t('timeline');

  return (
    <section id="timeline" className="section timeline-section">
      <div className="container">
        <SectionHeader number="05" en="PAST → PRESENT" cn={tl.headerCn} week={tl.week} />
        <p className="timeline-subtitle">{tl.subtitle}</p>
        <div className="timeline-grid">
          <Reveal className="timeline-side timeline-side--past">
            <div className="timeline-side__label">{tl.pastLabel}</div>
            <h3 className="timeline-side__title">{tl.pastTitle}</h3>
            <ul className="timeline-side__list">
              {tl.pastList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="timeline-side__cn">{tl.pastCn}</div>
          </Reveal>

          <div className="timeline-connector">
            <div className="timeline-connector__water">{tl.water}</div>
            <svg className="timeline-connector__line" viewBox="0 0 200 40" preserveAspectRatio="none">
              <path d="M0,20 C40,8 60,32 100,20 C140,8 160,32 200,20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="timeline-connector__arrow">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M4 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <Reveal className="timeline-side timeline-side--present" delay={80}>
            <div className="timeline-side__label">{tl.presentLabel}</div>
            <h3 className="timeline-side__title">{tl.presentTitle}</h3>
            <ul className="timeline-side__list">
              {tl.presentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <div className="timeline-side__cn">{tl.presentCn}</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
