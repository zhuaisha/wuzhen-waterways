import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import { useLang } from '../i18n/LanguageContext.jsx';

// size: xl | l | m | s — varied so the cloud reads as composition, not a list
const keywords = [
  { en: 'WATER', size: 'xl' },
  { en: 'BRIDGES', size: 'l' },
  { en: 'CANAL', size: 'm' },
  { en: 'LIFE', size: 'l' },
  { en: 'WATERWAY', size: 's' },
  { en: 'BOATS', size: 'm' },
  { en: 'TRAVEL BY BOAT', size: 's' },
  { en: 'NIGHT', size: 'xl' },
  { en: 'CONNECT', size: 's' },
  { en: 'TRADITIONAL LIFE', size: 's' },
  { en: 'MEMORY', size: 'm' },
  { en: 'WATER TOWN', size: 'l' },
  { en: 'BOAT TOUR', size: 's' },
  { en: 'REFLECTION', size: 'm' },
  { en: 'AT DUSK', size: 's' },
];

export default function Keywords() {
  const { t, lang } = useLang();
  const words = t('keywords.words');

  return (
    <section id="keywords" className="section keywords-section">
      <div className="container">
        <SectionHeader number="03" en="KEYWORDS" cn={t('keywords.headerCn')} week={t('keywords.week')} />
        <div className="keywords-cloud">
          {keywords.map((kw, i) => {
            const cn = words[kw.en] || kw.en;
            const main = lang === 'zh' ? cn : kw.en;
            const sub = lang === 'zh' ? kw.en : cn;
            return (
              <Reveal key={kw.en} className={`keyword-tag keyword-tag--${kw.size}`} delay={i * 45}>
                <span className="keyword-tag__en">{main}</span>
                <span className="keyword-tag__cn">{sub}</span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
