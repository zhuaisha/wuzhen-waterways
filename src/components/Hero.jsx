import { useEffect, useRef, useState } from 'react';
import WaterSurface from './WaterSurface.jsx';

const CDN_ROOT = 'https://fastly.jsdelivr.net/gh/zhuaisha/wuzhen-waterways@main/public/';

export default function Hero() {
  const heroRef = useRef(null);
  const imgRef = useRef(null);
  const [showContent, setShowContent] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const base = import.meta.env.BASE_URL;
  const localHero = `${base}images/hero_wuzhen-1920.avif`;
  const localWebp = `${base}images/hero_wuzhen-1920.webp`;
  const localJpg = `${base}images/hero_wuzhen.jpg`;
  const cdnHero = `${CDN_ROOT}images/hero_wuzhen-1920.avif`;
  const cdnJpg = `${CDN_ROOT}images/hero_wuzhen.jpg`;

  const handleHeroError = (event) => {
    const img = event.currentTarget;
    const step = Number(img.dataset.fallbackStep || '0');

    const candidates = [localWebp, localJpg, cdnHero, cdnJpg];
    if (step < candidates.length) {
      img.dataset.fallbackStep = String(step + 1);
      img.src = candidates[step];
    } else {
      setImageLoaded(true);
      setShowContent(true);
    }
  };

  const handleHeroLoad = () => {
    setImageLoaded(true);
    window.setTimeout(() => setShowContent(true), 50);
  };

  useEffect(() => {
    let raf = 0;

    const handleScroll = () => {
      if (!imgRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.06, 36);
        imgRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.025)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className={`hero__bg ${imageLoaded ? 'hero__bg--loaded' : ''}`}>
        <img
          ref={imgRef}
          className="hero__img"
          src={localHero}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
          srcSet={`
            ${base}images/hero_wuzhen-768.avif 768w,
            ${base}images/hero_wuzhen-1200.avif 1200w,
            ${base}images/hero_wuzhen-1600.avif 1600w,
            ${base}images/hero_wuzhen-1920.avif 1920w
          `}
          onLoad={handleHeroLoad}
          onError={handleHeroError}
        />
        <div className="hero__overlay" />
      </div>

      <WaterSurface className="hero__water" opacity={0.3} scrollAffected />

      <div className={`hero__content ${showContent ? 'hero__content--visible' : ''}`}>
        <div className="hero__badge">
          Grade 9 · English Project · Week One
        </div>
        <h1 className="hero__title">WUZHEN</h1>
        <p className="hero__subtitle">Waterways &amp; Bridges</p>
        <p className="hero__question">
          Why is water the main line of the water town?
        </p>
        <div className="hero__actions">
          <a href="#focus" className="hero__btn">
            Explore the project
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h8M9 5l3 3-3 3" />
            </svg>
          </a>
          <a href="#summary" className="hero__btn-secondary">
            Key findings
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>

      <div className="hero__footer">
        <span className="hero__footer-text">Wuzhen · Tongxiang · Zhejiang · 2026</span>
        <a href="#focus" className="hero__scroll" aria-label="Scroll down to explore">
          <span className="hero__scroll-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 3v8M4 8l3 3 3-3" />
            </svg>
          </span>
          Scroll to explore
        </a>
      </div>
    </section>
  );
}
