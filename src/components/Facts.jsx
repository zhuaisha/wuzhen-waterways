import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import CountUp from './CountUp.jsx';
import { useLang } from '../i18n/LanguageContext.jsx';

export default function Facts() {
  const { t } = useLang();
  const tag = t('facts.tag');
  const f1 = t('facts.f1');
  const f2 = t('facts.f2');
  const f3 = t('facts.f3');

  return (
    <section id="facts" className="section facts-section">
      <div className="container">
        <SectionHeader number="01" en="FACTS" cn={t('facts.headerCn')} week={t('facts.week')} />
        <div className="facts-grid">
          <Reveal className="fact-card">
            <div className="fact-card__tag">{tag} 01</div>
            <h3 className="fact-card__en">{f1.en}</h3>
            <p className="fact-card__cn">
              乌镇的内河水系呈十字形，把古镇划分为不同区域，水道是古镇空间布局的重要组成部分。
            </p>
            <p className="fact-card__summary">{f1.summary}</p>
          </Reveal>

          <Reveal className="fact-card fact-card--big" delay={40}>
            <div className="fact-card__tag">{tag} 02</div>
            <div className="fact-card__big-num">
              <CountUp to={72} className="fact-card__count" />
            </div>
            <div className="fact-card__big-label">{f2.bigLabel}</div>
            <p className="fact-card__en">
              {f2.en}
            </p>
            <div className="fact-card__stats">
              <div className="fact-card__stat">
                <span className="fact-card__stat-num">
                  <CountUp to={10000} duration={2} className="fact-card__count" />
                </span>
                <span className="fact-card__stat-unit">{f2.unit1}</span>
                <span className="fact-card__stat-label">{f2.label1}</span>
              </div>
              <div className="fact-card__stat">
                <span className="fact-card__stat-num">
                  <CountUp to={72} className="fact-card__count" />
                </span>
                <span className="fact-card__stat-unit">{f2.unit2}</span>
                <span className="fact-card__stat-label">{f2.label2}</span>
              </div>
            </div>
            <p className="fact-card__cn">
              西栅有近万米河道和72座古石桥，桥梁与水道共同构成典型的江南水乡景观。
            </p>
            <p className="fact-card__summary">{f2.summary}</p>
          </Reveal>

          <Reveal className="fact-card" delay={80}>
            <div className="fact-card__tag">{tag} 03</div>
            <h3 className="fact-card__en">{f3.en}</h3>
            <p className="fact-card__en">
              {f3.enBody}
            </p>
            <p className="fact-card__cn">
              过去当地居民常利用船只出行、运输和进行交易，水道直接参与人们的日常生活。
            </p>
            <p className="fact-card__summary">{f3.summary}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}