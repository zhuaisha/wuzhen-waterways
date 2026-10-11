import { useEffect, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import Reveal from './Reveal.jsx';
import { assetUrl } from '../lib/assets.js';
import { useLang } from '../i18n/LanguageContext.jsx';

const BASE = import.meta.env.BASE_URL;
const pic = (key, w = 1600) => ({
  avif: assetUrl(`${BASE}images/${key}-avif.avif`),
  webp: assetUrl(`${BASE}images/${key}-webp.webp`),
  jpg: assetUrl(`${BASE}images/${key}-jpg.jpg`),
});

/* Local fallback so a missing translation key can never crash the render. */
const FALLBACK_INFO = {
  waterway: {
    title: 'The Canal',
    chapter: '01 — WATER',
    desc: '',
    observation: '',
    alt: 'Wuzhen waterway',
  },
  bridge: {
    title: 'Stone Arch',
    chapter: '02 — BRIDGES',
    desc: '',
    observation: '',
    alt: 'Wuzhen stone arch bridge',
  },
  boat: {
    title: 'On the Water',
    chapter: '03 — BOATS',
    desc: '',
    observation: '',
    alt: 'Wuzhen canal boat',
  },
};

const images = [
  {
    id: 1,
    key: 'waterway',
    num: '01',
  },
  {
    id: 2,
    key: 'bridge',
    num: '02',
  },
  {
    id: 3,
    key: 'boat',
    num: '03',
  },
];

function Lightbox({ img, onClose }) {
  const { t } = useLang();
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
  const info = t(`gallery.images.${img.key}`) || FALLBACK_INFO[img.key] || FALLBACK_INFO.waterway;

  return (
    <div
      className="lightbox"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image: ${info.title}`}
    >
      <button className="lightbox__close" onClick={onClose} aria-label={t('gallery.close')}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img
          src={p.webp}
          alt={info.alt}
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
          <div className="lightbox__num">{info.chapter}</div>
          <h3 className="lightbox__title">{info.title}</h3>
          <p className="lightbox__desc">{info.desc}</p>
          <p className="lightbox__observation">{info.observation}</p>
          <p className="lightbox__source">
            {t('gallery.source')}:{' '}
            <a
              href={`https://commons.wikimedia.org/wiki/File:${img.key}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('gallery.wikimedia')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);
  const [loadedIds, setLoadedIds] = useState(new Set());
  const p = (k) => pic(k);

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        <SectionHeader number="02" en="VISUAL RESEARCH" cn={t('gallery.headerCn')} week={t('gallery.week')} />
        <p className="gallery-intro">{t('gallery.intro')}</p>
        <div className="gallery-grid">
          {images.map((img, i) => {
            const src = p(img.key);
            const info = t(`gallery.images.${img.key}`) || FALLBACK_INFO[img.key] || FALLBACK_INFO.waterway;
            return (
              <Reveal key={img.id} className={`gallery-card gallery-card--${img.id}`} delay={i * 50}>
                <button
                  className="gallery-card__btn"
                  onClick={() => setSelected(img)}
                  aria-label={t('gallery.view')}
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
                        alt={info.alt}
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
                      <span>{t('gallery.view').toUpperCase()}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 17L17 7M9 7h8v8" />
                      </svg>
                    </span>
                  </div>
                  <div className="gallery-card__body">
                    <div className="gallery-card__num">{img.num} · {info.chapter}</div>
                    <h3 className="gallery-card__title">{info.title}</h3>
                    <p className="gallery-card__desc">{info.desc}</p>
                    <p className="gallery-card__observation">{info.observation}</p>
                    <p className="gallery-card__source">
                      {t('gallery.source')}:{' '}
                      <a
                        href="https://commons.wikimedia.org"
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('gallery.wikimedia')}
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
