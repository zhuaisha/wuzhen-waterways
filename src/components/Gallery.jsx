import { useEffect, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const CDN_ROOT = 'https://fastly.jsdelivr.net/gh/zhuaisha/wuzhen-waterways@main/public/';
const BASE = import.meta.env.BASE_URL;

const images = [
  {
    id: 1,
    src: `${BASE}images/wuzhen-waterways-800.webp`,
    fallback: `${CDN_ROOT}images/wuzhen-waterways-800.webp`,
    localJpg: `${BASE}images/wuzhen-waterways.jpg`,
    title: 'Wuzhen Waterways',
    num: '01',
    descCn: '水道贯穿乌镇，两岸白墙黛瓦与倒映在水面的建筑构成典型的江南水乡景观。',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:WuzhenWaterway.jpg',
    alt: '乌镇水道与沿岸传统建筑',
  },
  {
    id: 2,
    src: `${BASE}images/wuzhen-bridge-800.webp`,
    fallback: `${CDN_ROOT}images/wuzhen-bridge-800.webp`,
    localJpg: `${BASE}images/wuzhen-bridge.jpg`,
    title: 'Ancient Bridges',
    num: '02',
    descCn: '古桥连接水道两岸，是乌镇传统空间结构和水乡生活的重要组成部分。',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wuzhen_Xizha_2009-13.jpg',
    alt: '乌镇西栅古桥',
  },
  {
    id: 3,
    src: `${BASE}images/wuzhen-boat-800.webp`,
    fallback: `${CDN_ROOT}images/wuzhen-boat-800.webp`,
    localJpg: `${BASE}images/wuzhen-boat.jpg`,
    title: 'Boat Ride in Wuzhen',
    num: '03',
    descCn: '乘坐传统游船沿着水道前行，可以从水上感受乌镇的街巷、桥梁和传统生活。',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Canal_in_Wuzhen.JPG',
    alt: '乌镇运河与传统游船',
  },
];

function Lightbox({ img, onClose }) {
  useEffect(() => {
    if (!img) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [img, onClose]);

  if (!img) return null;

  const highRes = img.localJpg;

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Image: ${img.title}`}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img
          src={highRes}
          alt={img.alt}
          className="lightbox__img"
          loading="eager"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.dataset.fallback !== '1') {
              e.currentTarget.dataset.fallback = '1';
              e.currentTarget.src = img.fallback;
            }
          }}
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
  const [loadedIds, setLoadedIds] = useState(new Set());

  const handleImageLoad = (id) => {
    setLoadedIds((prev) => new Set(prev).add(id));
  };

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        <SectionHeader number="04" en="VISUAL RESEARCH" cn="视觉调研" />
        <p className="gallery-intro">通过图片感受乌镇的水道、古桥与传统生活</p>
        <div className="gallery-grid">
          {images.map((img, i) => (
            <Reveal key={img.id} className="gallery-card" delay={i * 100}>
              <button
                className="gallery-card__btn"
                onClick={() => setSelected(img)}
                aria-label={`View ${img.title}`}
              >
                <div className="gallery-card__img-wrap">
                  {!loadedIds.has(img.id) && (
                    <div className="gallery-card__placeholder gallery-card__placeholder--visible">
                      <span className="shimmer" />
                    </div>
                  )}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className={`gallery-card__img ${loadedIds.has(img.id) ? '--loaded' : ''}`}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    onLoad={() => handleImageLoad(img.id)}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.dataset.fallbackStep === '1') {
                        target.dataset.fallbackStep = '2';
                        target.src = img.localJpg;
                        return;
                      }
                      if (target.dataset.fallbackStep !== '2') {
                        target.dataset.fallbackStep = '1';
                        target.src = img.fallback;
                      }
                    }}
                  />
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
