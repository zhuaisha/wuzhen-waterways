import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

// 使用本地高质量图片
const images = [
  {
    id: 1,
    src: `${import.meta.env.BASE_URL}images/wuzhen-waterways.jpg`,
    thumb: `${import.meta.env.BASE_URL}images/wuzhen-waterways.jpg`,
    title: 'Wuzhen Waterways',
    num: '01',
    descCn: '水道贯穿乌镇，两岸白墙黛瓦与倒映在水面的建筑构成典型的江南水乡景观。',
    source: 'Project Assets',
    sourceUrl: '#',
    alt: '乌镇水道与沿岸传统建筑',
  },
  {
    id: 2,
    src: `${import.meta.env.BASE_URL}images/wuzhen-bridge.jpg`,
    thumb: `${import.meta.env.BASE_URL}images/wuzhen-bridge.jpg`,
    title: 'Ancient Bridges',
    num: '02',
    descCn: '古桥连接水道两岸，是乌镇传统空间结构和水乡生活的重要组成部分。',
    source: 'Project Assets',
    sourceUrl: '#',
    alt: '乌镇西栅古桥',
  },
  {
    id: 3,
    src: `${import.meta.env.BASE_URL}images/wuzhen-boat.jpg`,
    thumb: `${import.meta.env.BASE_URL}images/wuzhen-boat.jpg`,
    title: 'Boat Ride in Wuzhen',
    num: '03',
    descCn: '乘坐传统游船沿着水道前行，可以从水上感受乌镇的街巷、桥梁和传统生活。',
    source: 'Project Assets',
    sourceUrl: '#',
    alt: '乌镇运河与传统游船',
  },
];

function Lightbox({ img, onClose }) {
  if (!img) return null;
  
  // 监听 ESC 键关闭
  useState(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  });
  
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Image: ${img.title}`}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img src={img.src} alt={img.alt} className="lightbox__img" loading="eager" />
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
  const [imageStates, setImageStates] = useState({});

  const handleImageLoad = (id) => {
    setImageStates(prev => ({ ...prev, [id]: 'loaded' }));
  };

  const handleImageError = (id) => {
    setImageStates(prev => ({ ...prev, [id]: 'error' }));
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
                  {imageStates[img.id] === undefined && (
                    <div className="gallery-card__placeholder gallery-card__placeholder--visible">
                      <span className="shimmer" />
                    </div>
                  )}
                  {imageStates[img.id] === 'error' ? (
                    <div className="gallery-card__fallback">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Image unavailable</span>
                    </div>
                  ) : (
                    <img 
                      src={img.thumb} 
                      alt={img.alt} 
                      className={`gallery-card__img ${imageStates[img.id] === 'loaded' ? 'gallery-card__img--loaded' : ''}`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(img.id)}
                      onError={() => handleImageError(img.id)}
                    />
                  )}
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
