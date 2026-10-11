import Reveal from './Reveal.jsx';
import { useLang } from '../i18n/LanguageContext.jsx';

export default function Summary() {
  const { t } = useLang();
  const s = t('summary');

  return (
    <section id="summary" className="summary-section">
      <div className="summary-section__overlay" />
      <div className="container">
        <Reveal className="summary-box">
          <h2 className="summary-title">{s.title}</h2>
          <p className="summary-cn">{s.cn}</p>
          <div className="summary-divider" />
          <p className="summary-en">
            {s.lines.map((l, i) => (
              <span key={i}>
                {l}
                {i < s.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <p className="summary-cn-block">
            {s.cnBlock.map((l, i) => (
              <span key={i}>
                {l}
                {i < s.cnBlock.length - 1 && <br />}
              </span>
            ))}
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
