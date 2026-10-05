import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*
 * Counts from 0 up to `to` once the element scrolls into view.
 * Only animates — the numbers passed in must be real, verified figures.
 */
export default function CountUp({ to = 0, duration = 1.6, suffix = '', className = '' }) {
  const ref = useRef(null);
  const [val, setVal] = useState(prefersReduced() ? to : 0);

  useGSAP(
    () => {
      if (prefersReduced()) {
        setVal(to);
        return;
      }
      const el = ref.current;
      if (!el) return;

      const obj = { v: 0 };
      gsap.to(obj, {
        v: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => setVal(Math.round(obj.v)),
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    },
    { scope: ref, dependencies: [to, duration] }
  );

  return (
    <span
      ref={ref}
      className={className}
      style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}
    >
      {/* 占位符：用最终值撑起容器宽度，避免 9,999→10,000 时宽度跳变把整块推抖 */}
      <span aria-hidden="true" style={{ visibility: 'hidden' }}>
        {to.toLocaleString('en-US')}
        {suffix}
      </span>
      <span style={{ position: 'absolute', top: 0, left: 0 }}>
        {val.toLocaleString('en-US')}
        {suffix}
      </span>
    </span>
  );
}
