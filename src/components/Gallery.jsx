import { useState, useEffect, useRef } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import { GALLERY_IMAGES, imageUrl } from '../config/assets.js';

function Lightbox({ img, onClose }) {
  useEffect(() => {
    if (!img) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [img, onClose]);

  if (!img) return null;

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Image: ${img.title}`}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        {/* Lightbox 加载高清图 */}
        <img 
          src={imageUrl(img.jpg)} 
          alt={img.alt} 
          className="lightbox__img" 
          loading="lazy"
          decoding="async"
        />
        <div className="lightbox__info">
          <div className="lightbox__num">Gallery {img.num}</div>
          <h3 className="lightbox__title">{img.title}</h3>
          <p className="lightbox__desc">{img.descCn}</p>
          <p className="lightbox__source">
            Source: <a href={img.sourceUrl} target="_blank" rel="noreferrer">{img.source}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [selected, setSelected] = useState(null);
  const [observer, setObserver] = useState(null);

  useEffect(() => {
    // IntersectionObserver 提前 300px 触发加载
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target.querySelector('img[data-src]');
          if (img) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '300px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('.gallery-card').forEach(card => {
      obs.observe(card);
    });

    setObserver(obs);
    return () => obs?.disconnect();
  }, []);

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        <SectionHeader number="04" en="VISUAL RESEARCH" cn="视觉调研" />
        <p className="gallery-intro">通过图片感受乌镇的水道、古桥与传统生活</p>
        <div className="gallery-grid">
          {GALLERY_IMAGES.map((img, i) => (
            <Reveal key={img.id} className={`gallery-card ${img.wide ? 'gallery-card--wide' : ''}`} delay={i * 100}>
              <button
                className="gallery-card__btn"
                onClick={() => setSelected(img)}
                aria-label={`View ${img.title}`}
              >
                <div className="gallery-card__img-wrap">
                  {/* Lazy loading with placeholder */}
                  <img
                    data-src={imageUrl(img.jpg)}
                    src=""
                    alt={img.alt}
                    className="gallery-card__img gallery-card__img--loading"
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="600"
                    style={{ aspectRatio: '4/3' }}
                    onError={(e) => {
                      if (e.currentTarget.dataset.fallback !== 'true') {
                        e.currentTarget.dataset.fallback = 'true';
                        // 显示占位图
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a2a3a 0%, #2a3a4a 100%)';
                      }
                    }}
                  />
                  {/* 占位背景 */}
                  <div className="gallery-card__placeholder" />
                </div>
                <div className="gallery-card__body">
                  <div className="gallery-card__num">{img.num}</div>
                  <h3 className="gallery-card__title">{img.title}</h3>
                  <p className="gallery-card__desc">{img.descCn}</p>
                  <p className="gallery-card__source">
                    Source: <a href={img.sourceUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{img.source}</a>
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <Lightbox img={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
