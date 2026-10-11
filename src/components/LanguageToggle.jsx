import { useLang } from '../i18n/LanguageContext.jsx';

/* ------------------------------------------------------------------ */
/* Minimal EN | 中文 toggle — a quiet, Apple-nav-style language picker. */
/* ------------------------------------------------------------------ */
/*
 * Two text options side by side. The active language is brighter; the
 * inactive one is muted. A hairline pill background only on hover.
 *
 * No flags, no gradients, no glow — just text.
 *
 * Placement: far right of the Navbar (desktop + mobile menu).
 */

export default function LanguageToggle({ compact = false }) {
  const { lang, setLang } = useLang();

  const cls = (l) => `lang-toggle__opt lang-toggle__opt--${l} ${
    lang === l ? 'is-active' : ''
  }`;

  return (
    <div
      className={`lang-toggle ${compact ? 'lang-toggle--compact' : ''}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={cls('en')}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        tabIndex={lang === 'zh' ? 0 : -1}
      >
        EN
      </button>
      <span className="lang-toggle__divider" aria-hidden="true" />
      <button
        type="button"
        className={cls('zh')}
        onClick={() => setLang('zh')}
        aria-pressed={lang === 'zh'}
        tabIndex={lang === 'en' ? 0 : -1}
      >
        中文
      </button>
    </div>
  );
}
