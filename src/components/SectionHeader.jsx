import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * SectionHeader — editorial section opener with a staggered
 * cinematic entrance: the number pulls in from the left with
 * a blur-focus, the slash fades in as a pivot, and the title
 * line slides up into clarity.  The Chinese subtitle follows
 * with a softer, delayed reveal.
 */
export default function SectionHeader({ number, en, cn, dark = false, week }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    const ctx = gsap.context(() => {
      // Number — blur-focus from the left
      gsap.fromTo(
        el.querySelector('.section-header__num'),
        { opacity: 0, x: -24, filter: 'blur(0px)' },
        {
          opacity: 1, x: 0, filter: 'blur(0px)',
          duration: 0.5, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Slash — subtle fade as the pivot point
      gsap.fromTo(
        el.querySelector('.section-header__slash'),
        { opacity: 0 },
        {
          opacity: 1, duration: 0.35, delay: 0.12, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // English title — slide up with blur-focus
      gsap.fromTo(
        el.querySelector('.section-header__label > span:nth-child(3)'),
        { opacity: 0, y: 14, filter: 'blur(0px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.5, delay: 0.08, ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Week tag — late fade
      const weekEl = el.querySelector('.section-header__week');
      if (weekEl) {
        gsap.fromTo(
          weekEl,
          { opacity: 0 },
          {
            opacity: 1, duration: 0.35, delay: 0.2, ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Chinese subtitle — softer, delayed reveal
      const cnEl = el.querySelector('.section-header__cn');
      if (cnEl) {
        gsap.fromTo(
          cnEl,
          { opacity: 0, y: 18, filter: 'blur(0px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.55, delay: 0.15, ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`section-header ${dark ? 'section-header--dark' : ''}`}>
      <div className="section-header__label">
        <span className="section-header__num">{number}</span>
        <span className="section-header__slash">/</span>
        <span>{en}</span>
        {week && <span className="section-header__week">{week}</span>}
      </div>
      {cn && <h2 className="section-header__cn">{cn}</h2>}
    </div>
  );
}
