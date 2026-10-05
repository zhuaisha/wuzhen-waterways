import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const BASE = import.meta.env.BASE_URL;
const IMG = {
  // The original opening plate — bright, large, unmistakably Wuzhen.
  hero: `${BASE}images/hero_wuzhen-1920.webp`,
  heroFallback: `${BASE}images/hero_wuzhen-1920-jpg.jpg`,
  // Original cinematic overlay — the night layer that gives the plate depth.
  night: `${BASE}images/night-webp.webp`,
  nightFallback: `${BASE}images/night-jpg.jpg`,
};

/* Preload the hero frame before the curtain rises so nothing pops in. */
function preload(src) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = src;
  });
}

/* Same, but never blocks the reveal past `ms` — a slow network must not leave
   the hero sitting dark for seconds. */
function preloadFast(src, ms = 150) {
  return Promise.race([
    preload(src),
    new Promise((res) => setTimeout(() => res(false), ms)),
  ]);
}

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const rootRef = useRef(null);
  const bgRef = useRef(null);      // layer 1 — deep blue ground
  const plateRef = useRef(null);   // layer 2 — the photographic plate
  const frameRef = useRef(null);   // layer 3a — scrim / grain / edge
  const copyRef = useRef(null);    // layer 3b — the type
  const titleRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let live = true;
    let ctx = null;

    const finish = () => {
      // Curtain call: the plate emerges from darkness and blur — short, one cut.
      if (plateRef.current) {
        gsap.to(plateRef.current, {
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
        });
      }
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.12,
          ease: 'power3.out',
        }
      );
      gsap.fromTo(
        copyRef.current.querySelectorAll('.hero__chrome-in'),
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          delay: 0.22,
          stagger: 0.06,
          ease: 'power3.out',
        }
      );
      setReady(true);
    };

    if (prefersReduced()) {
      if (plateRef.current) gsap.set(plateRef.current, { opacity: 1, filter: 'blur(0px)', scale: 1 });
      gsap.set(titleRef.current, { opacity: 1, y: 0 });
      gsap.set(copyRef.current.querySelectorAll('.hero__chrome-in'), { opacity: 1, y: 0 });
      setReady(true);
      return;
    }

    Promise.all([preloadFast(IMG.night), preloadFast(IMG.hero)])
      .then(() => {
        if (!live) return;
        ctx = gsap.context(() => {
          /* ---- Original three-layer parallax + Apple scroll spec ----
             Layers move in the SAME direction at different speeds so the eye
             reads depth: background fastest, photo mid, type slowest.
             Apple type spec on top:
               image scale 1.06 → 1.00, brightness 0.94 → 1
               title opacity 1 → 0, y 0 → -60px
               sub/cn fade slightly later
             The photo feels "opened slowly", not "the page is flying".   */
          gsap.to(bgRef.current, {
            yPercent: -22,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
          gsap.to(plateRef.current, {
            yPercent: -13,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
          gsap.to(frameRef.current, {
            yPercent: -7,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
          // The photo gently settles from 1.06 → 1.00 and brightens 0.94 → 1.
          const photo = plateRef.current && plateRef.current.querySelector('.hero__img--original');
          if (photo) {
            gsap.fromTo(
              photo,
              { scale: 1.06, filter: 'saturate(0.92) contrast(1.02) brightness(0.94)' },
              {
                scale: 1,
                filter: 'saturate(0.96) contrast(1.02) brightness(1)',
                ease: 'none',
                scrollTrigger: {
                  trigger: root,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true,
                },
              }
            );
          }
          gsap.to(titleRef.current, {
            y: -60,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: '30% top',
              scrub: true,
            },
          });
          gsap.to(copyRef.current, {
            y: -34,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: '42% top',
              scrub: true,
            },
          });
        }, root);
        finish();
      })
      .catch(() => live && finish());

    return () => {
      live = false;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <header className="hero" ref={rootRef} id="hero">
      {/* layer 1 — the deep blue ground */}
      <div className="hero__bg" ref={bgRef} aria-hidden="true" />

      {/* layer 2 — the photographic plate (hero photo + cinematic night overlay) */}
      <div className="hero__plate" ref={plateRef} aria-hidden="true">
        <img
          className="hero__img hero__img--original"
          src={IMG.hero}
          alt="Wuzhen water town at dusk — stone bridges spanning a broad canal, stilted houses with white walls and dark tile roofs, boats moored along the waterway"
          fetchPriority="high"
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1';
              e.currentTarget.src = IMG.heroFallback;
            }
          }}
        />
        <img
          className="hero__img hero__img--front"
          src={IMG.night}
          alt=""
          fetchPriority="high"
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1';
              e.currentTarget.src = IMG.nightFallback;
            }
          }}
        />
      </div>

      {/* layer 3a — scrim, grain and the reflected edge */}
      <div className="hero__frame" ref={frameRef} aria-hidden="true">
        <div className="hero__scrim" />
        <div className="hero__grain" />
        <div className="hero__edge" />
      </div>

      {/* static bottom fade — never parallaxed, holds the seam dark */}
      <div className="hero__bottomfade" aria-hidden="true" />

      {/* the slow hairline that gives the frame a sense of life */}
      <svg className="hero__thread" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 C 22 41, 38 59, 56 50 S 86 41, 100 50" />
      </svg>

      {/* layer 3b — the type */}
      <div className="hero__copy" ref={copyRef}>
        <h1 className="hero__title" ref={titleRef}>
          WUZHEN
        </h1>
        <p className="hero__sub hero__chrome-in">Waterways &amp; Bridges</p>
        <p className="hero__tag hero__chrome-in">水乡乌镇 · 水，是这座古镇的主线</p>
      </div>

      <a
        href="#chapter-water"
        className={`hero__scroll ${ready ? 'is-ready' : ''}`}
        aria-label="Scroll to explore"
        onClick={(e) => {
          e.preventDefault();
          const t = document.querySelector('#chapter-water');
          if (!t) return;
          if (window.__lenis) {
            window.__lenis.scrollTo(t, { duration: 0.45, offset: -40 });
          } else {
            t.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <span className="hero__scroll-text">Scroll to explore</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </header>
  );
}
