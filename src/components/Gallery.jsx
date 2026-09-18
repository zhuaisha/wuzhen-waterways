import { useEffect, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';

const BASE = import.meta.env.BASE_URL;
const pic = (key, w = 1600) => ({
  avif: `${BASE}images/${key}-avif.avif`,
  webp: `${BASE}images/${key}-webp.webp`,
  jpg: `${BASE}images/${key}-jpg.jpg`,
});

const images = [
  {
    id: 1,
    key: 'waterway',
    title: 'The Canal',
    num: '01',
    chapter: '01 — WATER',
    descCn: '水道贯穿乌镇，两岸白墙黛瓦与倒映在水面的建筑构成典型的江南水乡景观。',
    observation: 'We noticed that the white walls and dark tiles of the buildings along the canal create a beautiful reflection on the water surface.',
    alt: '乌镇水道与沿岸传统建筑',
  },
  {
    id: 2,
    key: 'bridge',
    title: 'Stone Arch',
    num: '02',
    chapter: '02 — BRIDGES',
    descCn: '古桥连接水道两岸，是乌镇传统空间结构和水乡生活的重要组成部分。',
    observation: 'We saw that the stone bridges connect both sides of the waterway, making them an essential part of daily life in the water town.',
    alt: '乌镇古石拱桥',
  },
  {
    id: 3,
    key: 'boat',
    title: 'On the Water',
    num: '03',
    chapter: '03 — BOATS',
    descCn: '乘坐传统游船沿着水道前行，可以从水上感受乌镇的街巷、桥梁和传统生活。',
    observation: 'We noticed that taking a boat along the canal is the best way to experience the water town, seeing bridges, streets and daily life from the water.',
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
  const p = pic(img.key);

  return (
    <div
      className="lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image: ${img.title}`}
    >
      <button className="lightbox__close" onClick={onClose} aria-label="Close lightbox">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img
          src={p.webp}
          alt={img.alt}
          className="lightbox__img"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const t = e.currentTarget;
            if (t.dataset.step !== '2') {
              t.dataset.step = '2';
              t.src = p.jpg;
            }
          }}
        />
        <div className="lightbox__info">
          <div className="lightbox__num">{img.chapter}</div>
          <h3 className="lightbox__title">{img.title}</h3>
          <p className="lightbox__desc">{img.descCn}</p>
          <p className="lightbox__observation">{img.observation}</p>
          <p className="lightbox__source">
            Source:{' '}
            <a
              href={`https://commons.wikimedia.org/wiki/File:${img.key}`}
              target="_blank"
              rel="noreferrer"
            >
              Wikimedia Commons
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [selected, setSelected] = useState(null);
  const [loadedIds, setLoadedIds] = useState(new Set());
  const p = (k) => pic(k);

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        <SectionHeader number="02" en="VISUAL RESEARCH" cn="视觉调研" week="Week 1" />
        <p className="gallery-intro">通过图片感受乌镇的水道、古桥与传统生活</p>
        <div className="gallery-grid">
          {images.map((img, i) => {
            const src = p(img.key);
            return (
              <Reveal key={img.id} className={`gallery-card gallery-card--${img.id}`} delay={i * 100}>
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
                    <picture>
                      <source
                        type="image/avif"
                        srcSet={`${src.avif} 1600w`}
                        sizes="(max-width: 900px) 92vw, 46vw"
                      />
                      <img
                        src={src.webp}
                        alt={img.alt}
                        className={`gallery-card__img ${loadedIds.has(img.id) ? '--loaded' : ''}`}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        onLoad={() => setLoadedIds((prev) => new Set(prev).add(img.id))}
                        onError={(e) => {
                          const t = e.currentTarget;
                          if (t.dataset.step !== '2') {
                            t.dataset.step = '2';
                            t.src = src.jpg;
                          }
                        }}
                      />
                    </picture>
                    {/* hover reveal: a small quiet "VIEW" marker */}
                    <span className="gallery-card__view" aria-hidden="true">
                      <span>VIEW</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 17L17 7M9 7h8v8" />
                      </svg>
                    </span>
                  </div>
                  <div className="gallery-card__body">
                    <div className="gallery-card__num">{img.num} · {img.chapter}</div>
                    <h3 className="gallery-card__title">{img.title}</h3>
                    <p className="gallery-card__desc">{img.descCn}</p>
                    <p className="gallery-card__observation">{img.observation}</p>
                    <p className="gallery-card__source">
                      Source:{' '}
                      <a
                        href="https://commons.wikimedia.org"
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Wikimedia Commons
                      </a>
                    </p>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
      <Lightbox img={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
