import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

// 使用 picsum.photos 占位图 + Unsplash 真实图片
const images = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1537531383496-f4749bfa8068?w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1537531383496-f4749bfa8068?w=800&q=75',
    title: 'Wuzhen Waterways',
    num: '01',
    descCn: '水道贯穿乌镇，两岸白墙黛瓦构成典型的江南水乡景观。',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
    alt: '乌镇水道与沿岸传统建筑',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1545569341-7eb009a77f3c?w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1545569341-7eb009a77f3c?w=800&q=75',
    title: 'Ancient Bridge',
    num: '02',
    descCn: '古桥连接水道两岸，是乌镇传统空间与水乡生活的重要节点。',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
    alt: '乌镇西栅古桥夜景',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=75',
    title: 'Boat & Walking',
    num: '03',
    descCn: '乘船看水、沿河步行，是感受乌镇街巷与水乡生活的两种方式。',
    source: 'Unsplash',
    sourceUrl: 'https://unsplash.com',
    alt: '乌镇运河与传统游船',
  },
];

function Lightbox({ img, onClose }) {
  if (!img) return null;
  
  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Image: ${img.title}`}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img src={img.src} alt={img.alt} className="lightbox__img" loading="lazy" />
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
  const [loadedIds, setLoadedIds] = useState({});

  const handleImageLoad = (id) => {
    setLoadedIds(prev => ({ ...prev, [id]: true }));
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
                  {!loadedIds[img.id] && (
                    <div className="gallery-card__placeholder gallery-card__placeholder--visible">
                      <span>加载中...</span>
                    </div>
                  )}
                  <img 
                    src={img.thumb} 
                    alt={img.alt} 
                    className={`gallery-card__img ${loadedIds[img.id] ? 'gallery-card__img--loaded' : ''}`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(img.id)}
                    onError={() => handleImageLoad(img.id)}
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
