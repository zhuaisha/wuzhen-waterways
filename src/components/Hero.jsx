import { useEffect, useRef, useState } from 'react';
import ThreeScene from './ThreeScene.jsx';
import { HERO_IMAGES, imageUrl } from '../config/assets.js';

export default function Hero() {
  const heroRef = useRef(null);
  const imgRef = useRef(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Loading animation
    const timer = setTimeout(() => setShowContent(true), 800);
    
    // Parallax effect
    const handleScroll = () => {
      if (!heroRef.current || !imgRef.current) return;
      const scrolled = window.scrollY;
      const parallaxOffset = scrolled * 0.15;
      imgRef.current.style.transform = `translateY(${parallaxOffset}px) scale(1.05)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Hero 背景图片 URL（优先 AVIF，备选 WebP，最后 JPG）
  const heroSrc = imageUrl(HERO_IMAGES.jpg);

  return (
    <section className="hero" ref={heroRef}>
      {/* Wuzhen aerial panorama background */}
      <div className="hero__bg">
        <img
          ref={imgRef}
          className="hero__img"
          src={heroSrc}
          alt="Aerial panorama of Wuzhen Water Town"
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            // Fallback: 如果本地图片加载失败，使用 Wikimedia 备用
            if (e.currentTarget.dataset.fallback !== 'true') {
              e.currentTarget.dataset.fallback = 'true';
              e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Aerial_panorama_of_Wuzhen_%E4%B9%8C%E9%95%87_Water_Town._December_2023.jpg';
            }
          }}
        />
        <div className="hero__overlay" />
      </div>

      <ThreeScene className="hero__three" variant="hero" scrollAffected opacity={0.7} />

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
