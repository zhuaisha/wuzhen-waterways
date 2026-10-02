import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveal — the project's universal scroll-entrance wrapper.
 *
 * Upgraded with a cinematic blur→sharp focal pull so every element
 * emerges into focus like a lens rack-focusing: it starts soft and
 * translucent, then snaps to full clarity as it crosses the viewport
 * threshold.  The depth-of-field effect gives the whole site a
 * cohesive "camera operator" feel that a plain fade+slide cannot match.
 *
 * @param {number} delay    – stagger offset in ms
 * @param {number} y        – vertical travel distance in px (default 30)
 * @param {number} blur     – starting blur in px (default 10)
 * @param {number} duration – tween duration in seconds (default 0.9)
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 30,
  blur = 10,
  duration = 0.9,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReduced()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y, filter: `blur(${blur}px)` },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration,
          ease: 'power3.out',
          delay: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, blur, duration]);

  return (
    <div ref={ref} className={`reveal ${className}`} {...props}>
      {children}
    </div>
  );
}
