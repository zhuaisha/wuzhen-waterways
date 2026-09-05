import { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

// Wikimedia Commons images with explicit author + license attribution.
const images = [
  {
    id: 1,
    src: 'https://upload.wikimedia.org/wikipedia/commons/a/af/WuzhenWaterway.jpg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/WuzhenWaterway.jpg/800px-WuzhenWaterway.jpg',
    title: 'Wuzhen Waterways',
    num: '01',
    descCn: '水道贯穿乌镇，两岸白墙黛瓦构成典型的江南水乡景观。',
    source: 'Evilbish · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:WuzhenWaterway.jpg',
    alt: '乌镇水道与沿岸传统建筑',
  },
  {
    id: 2,
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Wuzhen_Xizha_2009-13.jpg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Wuzhen_Xizha_2009-13.jpg/800px-Wuzhen_Xizha_2009-13.jpg',
    title: 'Ancient Bridge',
    num: '02',
    descCn: '古桥连接水道两岸，是乌镇传统空间与水乡生活的重要节点。',
    source: 'Gerbil · Wikimedia Commons · CC BY-SA 3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Wuzhen_Xizha_2009-13.jpg',
    alt: '乌镇西栅古桥夜景',
  },
  {
    id: 3,
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Canal_in_Wuzhen.JPG',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Canal_in_Wuzhen.JPG/800px-Canal_in_Wuzhen.JPG',
    title: 'Boat & Walking',
    num: '03',
    descCn: '乘船看水、沿河步行，是感受乌镇街巷与水乡生活的两种方式。',
    source: 'Wikimedia Commons · CC BY-SA',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Canal_in_Wuzhen.JPG',
    alt: '乌镇运河与传统游船',
  },
];

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
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="gallery-card__img" 
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = img.fallback;
                      e.currentTarget.onerror = () => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.add('gallery-card__placeholder--visible');
                      };
                    }}
                  />
                  <div className="gallery-card__placeholder">
                    <span>加载中...</span>
                  </div>
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
