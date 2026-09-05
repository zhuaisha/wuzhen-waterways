import { useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

// 使用 CSS 渐变作为占位图（无需外部图片服务）
const images = [
  {
    id: 1,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    title: 'Wuzhen Waterways',
    num: '01',
    descCn: '水道贯穿乌镇，两岸白墙黛瓦构成典型的江南水乡景观。',
    source: 'CSS Gradient',
    sourceUrl: '#',
    alt: '乌镇水道与沿岸传统建筑',
  },
  {
    id: 2,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    title: 'Ancient Bridge',
    num: '02',
    descCn: '古桥连接水道两岸，是乌镇传统空间与水乡生活的重要节点。',
    source: 'CSS Gradient',
    sourceUrl: '#',
    alt: '乌镇西栅古桥夜景',
  },
  {
    id: 3,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    title: 'Boat & Walking',
    num: '03',
    descCn: '乘船看水、沿河步行，是感受乌镇街巷与水乡生活的两种方式。',
    source: 'CSS Gradient',
    sourceUrl: '#',
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
        <div className="lightbox__img-placeholder" style={{ background: img.gradient }} />
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
                <div className="gallery-card__img-wrap" style={{ background: img.gradient }}>
                  <div className="gallery-card__img-overlay">
                    <span className="gallery-card__img-label">{img.title}</span>
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
