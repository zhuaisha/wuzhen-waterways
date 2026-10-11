import { useLang } from '../i18n/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLang();
  const f = t('footer');

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <span className="footer__brand-main">WUZHEN</span>
            <span className="footer__brand-sub">{f.sub}</span>
          </div>
          <div className="footer__info">
            <p>{f.line1}</p>
            <p>{f.line2}</p>
            <p>{f.line3}</p>
          </div>
        </div>
        <div className="footer__members">
          <p className="footer__members-title">{f.membersTitle}</p>
          <p className="footer__members-text">
            {f.membersText}
          </p>
        </div>
        <div className="footer__bottom">
          <p>{f.bottom}</p>
        </div>
      </div>
    </footer>
  );
}