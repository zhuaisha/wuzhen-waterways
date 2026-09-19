import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '../data/chapters.js';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
 * Fixed right-hand rail: a hairline that grows with scroll, chapter numbers
 * 01–06, and the current chapter highlighted. Clicking a number travels to
 * that chapter through Lenis.
 */
export default function ChapterRail() {
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

      // While a click is animating through Lenis, the rail is locked to the
      // clicked chapter — otherwise the mid-scroll position would make the
      // counter "count up/down" past intermediate chapters. After the lock
      // expires, scroll ownership resumes and the rule below is correct.
      if (Date.now() >= lockUntil.current) {
        // Current chapter = the last chapter whose top has passed viewport middle.
        let cur = CHAPTERS[0].n;
        const mid = window.innerHeight * 0.5;
        for (const c of CHAPTERS) {
          const el = document.querySelector(`#${c.id}`);
          if (el && el.getBoundingClientRect().top <= mid) cur = c.n;
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
    // Snap the counter + highlight to the target immediately so the bottom
    // "NN / 06" reads the chapter you clicked on, without waiting for the
    // Lenis scroll (and its scroll events) to catch up. Then lock the rail
    // for the duration of the animation so mid-scroll positions can't make
    // the counter wobble through intermediate chapters. Manual scrolling
    // still owns `active` once the lock expires.
    if (n) {
      setActive(n);
      lockUntil.current = Date.now() + 1350;
    }
    const t = document.querySelector(`#${id}`);
    if (!t) return;
    if (window.__lenis) {
      window.__lenis.scrollTo(t, { duration: 1.25, offset: -30 });
    } else if (!prefersReduced()) {
      t.scrollIntoView({ behavior: 'smooth' });
    } else {
      t.scrollIntoView();
    }
  };

  const roman = { '01': 'I', '02': 'II', '03': 'III', '04': 'IV', '05': 'V', '06': 'VI' };

  return (
    <aside
      className={`chapter-rail ${show ? 'is-visible' : ''}`}
      aria-label="Chapter progress"
    >
      <div className="chapter-rail__track">
        <span className="chapter-rail__fill" ref={fillRef} />
      </div>
      <nav className="chapter-rail__list">
        {CHAPTERS.map((c) => (
          <button
            key={c.n}
            type="button"
            className={`chapter-rail__item ${active === c.n ? 'is-active' : ''}`}
            onClick={() => go(c.id, c.n)}
            aria-label={`Chapter ${c.n} ${c.en}`}
            aria-current={active === c.n ? 'true' : undefined}
          >
            <span className="chapter-rail__n">{c.n}</span>
            <span className="chapter-rail__roman">{roman[c.n]}</span>
          </button>
        ))}
      </nav>
      <div className="chapter-rail__count" aria-hidden="true">
        <b>{active}</b>
        <span>/ 06</span>
      </div>
    </aside>
  );
}
