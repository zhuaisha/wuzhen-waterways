import { useEffect, useRef, useState } from 'react';
import WaterSurface from './WaterSurface.jsx';

export default function Hero() {
  const heroRef = useRef(null);
  const imgRef = useRef(null);
  const [showContent, setShowContent] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const heroImageSrc = `${import.meta.env.BASE_URL}images/hero_wuzhen.jpg`;
  const fallbackImageSrc = `${import.meta.env.BASE_URL}images/photo1_day.jpg`;

  // Preload image before showing content
  useEffect(() => {
    const img = new Image();
    img.src = heroImageSrc;
    img.onload = () => {
      console.log('Hero image preloaded successfully');
      setImageLoaded(true);
      setTimeout(() => setShowContent(true), 100);
    };
    img.onerror = () => {
      console.warn('Hero image failed to load, trying fallback');
      setImgError(true);
      const fallbackImg = new Image();
      fallbackImg.src = fallbackImageSrc;
      fallbackImg.onload = () => {
        setUseFallback(true);
        setImageLoaded(true);
        setTimeout(() => setShowContent(true), 100);
      };
      fallbackImg.onerror = () => {
        console.error('Both images failed to load');
        setImageLoaded(true);
        setTimeout(() => setShowContent(true), 100);
      };
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !imgRef.current) return;
      const scrolled = window.scrollY;
      const parallaxOffset = scrolled * 0.1;
      imgRef.current.style.transform = `translateY(${parallaxOffset}px) scale(1.02)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const currentImageSrc = useFallback ? fallbackImageSrc : heroImageSrc;

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero__bg">
        <img
          ref={imgRef}
          className={`hero__img ${imageLoaded ? 'hero__img--loaded' : 'hero__img--loading'}`}
          src={currentImageSrc}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
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
          Why is water the main line of the ancient town?
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
