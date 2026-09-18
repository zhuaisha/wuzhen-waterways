import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const BASE = import.meta.env.BASE_URL;
const IMG = {
  // The original opening plate - bright, large, and unmistakably Wuzhen.
  hero: `${BASE}images/hero_wuzhen-1920.webp`,
  night: `${BASE}images/night-webp.webp`,
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
   the hero sitting blurred for seconds. */
function preloadFast(src, ms = 900) {
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
  const bgRef = useRef(null);      // layer 1 — deep blue background
  const plateRef = useRef(null);    // layer 2 — the photographic plate
  const frameRef = useRef(null);    // layer 3 — scrim / grain / edge
  const copyRef = useRef(null);     // layer 3 — the type
  const titleRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let live = true;
    let ctx = null;

    const finish = () => {
      // Curtain call: the plate emerges from darkness and blur. Kept short and
      // tightly staggered so the frame reads as sharp almost immediately.
      if (plateRef.current) {
        gsap.to(plateRef.current, {
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
        });
      }
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, scale: 1.05, filter: 'blur(5px)' },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.7,
          delay: 0.15,
          ease: 'power3.out',
        }
      );
      gsap.fromTo(
        copyRef.current,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: 'power3.out' }
      );
      gsap.fromTo(
        root.querySelectorAll('.hero__chrome-in'),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.55, stagger: 0.07, ease: 'power3.out' }
      );
      setReady(true);
    };

    if (prefersReduced()) {
      if (plateRef.current) gsap.set(plateRef.current, { opacity: 1, filter: 'blur(0px)', scale: 1 });
      gsap.set(titleRef.current, { opacity: 1, scale: 1, filter: 'blur(0px)' });
      gsap.set(copyRef.current, { opacity: 1, y: 0 });
      gsap.set(root.querySelectorAll('.hero__chrome-in'), { opacity: 1, y: 0 });
      setReady(true);
      return;
    }

    // Wait for the plate so the reveal reads as an intentional cut, not a lag —
    // but never longer than the timeout, so a slow network can't hold the screen
    // blurred indefinitely.
    Promise.all([preloadFast(IMG.night), preloadFast(IMG.hero)])
      .then(() => {
        if (!live) return;
        ctx = gsap.context(() => {
          // Three-layer parallax, moving in the SAME direction at different speeds
          // so the eye reads depth: background fastest, image mid, type slowest.
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
          gsap.to(copyRef.current, {
            yPercent: 9,
            opacity: 0.35,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: '55% top',
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
    <header className="hero" ref={rootRef} id="top">
      {/* layer 1 — the deep blue ground */}
      <div className="hero__bg" ref={bgRef} aria-hidden="true" />

      {/* layer 2 — the photographic plate */}
      <div className="hero__plate" ref={plateRef} aria-hidden="true">
        <img
          className="hero__img hero__img--original"
          src={IMG.hero}
          alt=""
          fetchPriority="high"
        />
        <img
          className="hero__img hero__img--front"
          src={IMG.night}
          alt=""
          fetchPriority="high"
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
        <div className="hero__eyebrow hero__chrome-in">
          <span className="hero__dot" />
          <span>WUZHEN · ZHEJIANG · 30°42′N 120°26′E</span>
        </div>

        <h1 className="hero__title" ref={titleRef}>
          WUZHEN
        </h1>
        <p className="hero__sub hero__chrome-in">WATERWAYS &amp; BRIDGES</p>
        <p className="hero__tag hero__chrome-in">A DIGITAL JOURNEY THROUGH WUZHEN</p>
      </div>

      <div className="hero__meta">
        <span className="hero__chrome-in">CHAPTERS 06</span>
        <span className="hero__chrome-in">2026</span>
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
            window.__lenis.scrollTo(t, { duration: 1.15, offset: -40 });
          } else {
            t.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <span className="hero__scroll-text">SCROLL TO EXPLORE</span>
        <span className="hero__scroll-line" />
      </a>
    </header>
  );
}
