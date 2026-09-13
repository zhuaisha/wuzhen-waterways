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
    <span ref={ref} className={className}>
      {val.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
