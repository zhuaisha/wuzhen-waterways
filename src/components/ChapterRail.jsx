import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/LanguageContext.jsx';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* All clickable stops, in the original short order. */
const SECTIONS = [
  { id: 'team', n: '01', en: 'MEET OUR TEAM' },
  { id: 'facts', n: '02', en: 'FACTS' },
  { id: 'gallery', n: '03', en: 'VISUAL RESEARCH' },
  { id: 'keywords', n: '04', en: 'KEYWORDS' },
  { id: 'whywater', n: '05', en: 'WHY WATER?' },
  { id: 'timeline', n: '06', en: 'PAST → PRESENT' },
];

const TOTAL = SECTIONS.length;

/*
 * Apple.com.cn-style right-hand chapter rail:
 * - ultra-thin hairline track
 * - whisper-quiet index (near-invisible until hover)
 * - active chapter in Action Blue with a tiny blue dot indicator
 */
export default function ChapterRail() {
  const { t, lang } = useLang();
  const rail = t('rail');
  const fillRef = useRef(null);
  const lockUntil = useRef(0);
  const [active, setActive] = useState('01');
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      setProgress(p);
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${p})`;
      }

      if (Date.now() >= lockUntil.current) {
        let cur = SECTIONS[0].n;
        const mid = window.innerHeight * 0.5;
        for (const s of SECTIONS) {
          const el = document.querySelector(`#${s.id}`);
          if (el && el.getBoundingClientRect().top <= mid) cur = s.n;
        }
        setActive(cur);
      }

      setShow(y > window.innerHeight * 0.35);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const go = (id, n) => {
    if (n) {
      setActive(n);
      lockUntil.current = Date.now() + 1350;
    }
    const t = document.querySelector(`#${id}`);
    if (!t) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(t, { duration: 0.5, offset: -30 });
    } else if (!prefersReduced()) {
      t.scrollIntoView({ behavior: 'smooth' });
    } else {
      t.scrollIntoView();
    }
  };

  return (
    <aside
      className={`chapter-rail ${show ? 'is-visible' : ''}`}
      aria-label={rail.progress}
    >
      <div className="chapter-rail__track">
        <span className="chapter-rail__fill" ref={fillRef} />
      </div>
      <nav className="chapter-rail__list">
        {SECTIONS.map((s) => (
          <button
            key={s.n}
            type="button"
            className={`chapter-rail__item ${active === s.n ? 'is-active' : ''}`}
            onClick={() => go(s.id, s.n)}
            aria-label={`${rail.progress} ${s.n} ${rail.labels[s.n] || s.en}`}
            aria-current={active === s.n ? 'true' : undefined}
          >
            <span className="chapter-rail__dot" aria-hidden="true" />
            <span className="chapter-rail__n">{s.n}</span>
            <span className="chapter-rail__label">{rail.labels[s.n] || s.en}</span>
          </button>
        ))}
      </nav>
      <div className="chapter-rail__count" aria-hidden="true">
        <b>{active}</b>
        <span>/ {String(TOTAL).padStart(2, '0')}</span>
      </div>
    </aside>
  );
}
