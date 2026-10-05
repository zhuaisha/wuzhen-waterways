import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveal — the project's universal scroll-entrance wrapper.
 *
 * 极简淡入：只用 opacity + y 位移，去掉 blur（GPU 密集，感觉拖）。
 * 触发点设在视口顶部 78%——元素一进入视口就立即播放，不等待。
 *
 * @param {number} delay    – stagger offset in ms
 * @param {number} y        – vertical travel distance in px (default 18)
 * @param {number} blur     – starting blur in px (default 0，默认关闭)
 * @param {number} duration – tween duration in seconds (default 0.35)
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  y = 18,
  blur = 0,
  duration = 0.35,
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
        { opacity: 0, y, filter: 'blur(0px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration,
          ease: 'power2.out',
          delay: delay / 1000,
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
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
