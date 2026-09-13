import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CHAPTERS } from '../data/chapters.js';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isTouch = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none)').matches;

/* ------------------------------------------------------------------ */
/* Motifs — small, quiet 2D devices that each chapter borrows.        */
/* ------------------------------------------------------------------ */

function Ripple({ active }) {
  // Faint concentric rings, expanded on pointer move over the water plate.
  const ref = useRef(null);
  useEffect(() => {
    if (!active || prefersReduced() || isTouch()) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const ring = document.createElement('span');
      ring.className = 'ripple__ring';
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      el.appendChild(ring);
      setTimeout(() => ring.remove(), 1700);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, [active]);
  return <div className="ripple" ref={ref} aria-hidden="true" />;
}

function BridgeDraw() {
  // A hairline bridge arc traced by stroke-dashoffset as the chapter scrolls in.
  return (
    <svg className="bridge-draw" viewBox="0 0 1200 320" preserveAspectRatio="none" aria-hidden="true">
      <path className="bridge-draw__arc" d="M40 250 C 300 40, 900 40, 1160 250" />
      <path className="bridge-draw__deck" d="M20 268 L 1180 268" />
      <path className="bridge-draw__ref" d="M40 250 C 300 40, 900 40, 1160 250" />
    </svg>
  );
}

function Current() {
  // A single hairline travelling left to right — the water, and the boat with it.
  return (
    <div className="current" aria-hidden="true">
      <span className="current__line" />
    </div>
  );
}

function LanternGlow({ active }) {
  return (
    <div className={`lantern-glow ${active ? 'is-on' : ''}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter                                                             */
/* ------------------------------------------------------------------ */

function Chapter({ c, i }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReduced()) return;
    let ctx = null;

    ctx = gsap.context(() => {
      // Image: scale 1.08 -> 1, blur in, travelling slowly through the frame.
      const plate = root.querySelector('.chapter__plate');
      if (plate) {
        gsap.fromTo(
          plate,
          { scale: 1.08, filter: 'blur(14px)' },
          {
            scale: 1,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 72%',
              end: 'center center',
              scrub: true,
            },
          }
        );
        gsap.to(plate, {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });
      }

      // Copy: rises out of the page, line by line.
      gsap.fromTo(
        root.querySelectorAll('.chapter__lede-line'),
        { opacity: 0, y: 34, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          stagger: 0.16,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
      gsap.fromTo(
        root.querySelectorAll('.chapter__rise'),
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 55%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Chapter number, quiet.
      gsap.fromTo(
        root.querySelector('.chapter__ghost'),
        { opacity: 0, scale: 1.06 },
        {
          opacity: 0.14,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            end: 'top 30%',
            scrub: true,
          },
        }
      );

      // SVG bridge trace.
      const arc = root.querySelector('.bridge-draw__arc');
      if (arc) {
        const len = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(arc, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 65%',
            end: 'center 30%',
            scrub: true,
          },
        });
      }

      // Water current hairline.
      const line = root.querySelector('.current__line');
      if (line) {
        gsap.fromTo(
          line,
          { x: '-100%' },
          {
            x: '0%',
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 70%',
              end: 'bottom 50%',
              scrub: true,
            },
          }
        );
      }
    }, root);

    return () => { if (ctx) ctx.revert(); };
  }, []);

  const hasImage = Boolean(c.image);

  return (
    <section
      id={c.id}
      ref={rootRef}
      className={`chapter chapter--${c.bg} chapter--${c.mask}`}
      data-chapter={c.n}
      aria-label={`${c.n} — ${c.en}`}
    >
      {hasImage && (
        <div className="chapter__stage" aria-hidden="true">
          <div className="chapter__plate">
            <img
              src={c.image.webp}
              srcSet={`${c.image.avif} 1600w`}
              sizes="100vw"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <div className="chapter__plate-veil" />
          </div>
          {c.motif === 'ripple' && <Ripple active />}
          {c.motif === 'lantern' && <LanternGlow active />}
        </div>
      )}

      {c.motif === 'bridge-draw' && <BridgeDraw />}
      {c.motif === 'current' && <Current />}

      <div className="chapter__ghost" aria-hidden="true">{c.n}</div>

      <div className="container chapter__grid">
        <div className="chapter__copy">
          <div className="chapter__meta">
            <span className="chapter__n chapter__rise">{c.n}</span>
            <span className="chapter__cn chapter__rise">{c.cn}</span>
          </div>
          <h2 className="chapter__lede">
            {c.lines.filter(Boolean).map((l, j) => (
              <span className="chapter__lede-line" key={j}>{l}</span>
            ))}
          </h2>
          <p className="chapter__body chapter__rise">{c.body}</p>
          {hasImage && (
            <p className="chapter__caption chapter__rise">
              <span className="chapter__caption-dot" />
              {c.caption}
            </p>
          )}
        </div>

        {hasImage && (
          <div className="chapter__figure">
            <div className="chapter__figure-inner">
              <img
                src={c.image.webp}
                srcSet={`${c.image.avif} 1600w`}
                sizes="(max-width: 900px) 92vw, 46vw"
                alt={c.caption}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = c.image.jpg;
                }}
              />
              <figcaption className="chapter__figcap">
                <span>{c.caption}</span>
                {c.source && <span className="chapter__figcap-src">SRC {c.source}</span>}
              </figcaption>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Outro — chapter 06 MEMORY, deliberately empty of imagery.          */
/* ------------------------------------------------------------------ */

function Outro({ c }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll('.outro__rise'),
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.28,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: root,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id={c.id}
      ref={rootRef}
      className="chapter chapter--outro"
      data-chapter={c.n}
      aria-label={`${c.n} — ${c.en}`}
    >
      <div className="chapter__ghost" aria-hidden="true">{c.n}</div>
      <div className="outro">
        <div className="outro__eyebrow outro__rise">06 — MEMORY · 记忆</div>
        <h2 className="outro__title">
          <span className="outro__rise">WUZHEN</span>
        </h2>
        <p className="outro__sub outro__rise">Waterways &amp; Bridges</p>
        <p className="outro__closing outro__rise">
          A place shaped by water,
          <br />
          bridges, and time.
        </p>
        <div className="outro__thread" aria-hidden="true">
          <svg viewBox="0 0 200 6" preserveAspectRatio="none">
            <path d="M0 3 H 200" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function Story() {
  return (
    <div className="story">
      {CHAPTERS.map((c, i) =>
        c.outro ? <Outro key={c.id} c={c} /> : <Chapter key={c.id} c={c} i={i} />
      )}
    </div>
  );
}
