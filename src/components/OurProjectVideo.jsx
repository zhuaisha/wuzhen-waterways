import { useCallback, useRef, useState } from 'react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { assetUrl } from '../lib/assets.js';

const BASE = import.meta.env.BASE_URL;

/* ------------------------------------------------------------------ */
/* OUR PROJECT VIDEO — the team's own film.                            */
/*                                                                     */
/* Sits directly BELOW the official Wuzhen cultural film and is a      */
/* separate, independent module: its own heading, copy, player and      */
/* source. The official film is untouched.                             */
/*                                                                     */
/* Playback deliberately uses the browser's NATIVE media controls       */
/* (`controls` + `playsInline`) — no custom-drawn play/seek/fullscreen  */
/* chrome — so iOS, Android and Windows each render their own familiar  */
/* player and fullscreen behaviour.                                    */
/*                                                                     */
/* The master file was 331 MB / 17.6 Mbps with the `moov` atom at the   */
/* END of the file (no faststart), so browsers had to download the      */
/* whole thing before the first frame. `public/videos/our-project-      */
/* video.mp4` is a delivery copy — same H.264/AAC streams, `+faststart` */
/* and a web bitrate — generated with ffmpeg; the original is kept.     */
/* ------------------------------------------------------------------ */
const VIDEO = {
  src: assetUrl(`${BASE}videos/our-project-video.mp4`),
  poster: assetUrl(`${BASE}images/our-project-video-poster.jpg`),
  mime: 'video/mp4',
};

export default function OurProjectVideo() {
  const { t } = useLang();
  const v = t('ourVideo');
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  /* A real load/decode failure only — a user-initiated pause/abort must
     not be reported as an error. */
  const onError = useCallback(() => {
    const el = videoRef.current;
    if (el && el.error) setFailed(true);
  }, []);

  const retry = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    setFailed(false);
    try { el.load(); } catch { /* ignore */ }
  }, []);

  return (
    <section id="our-video" className="our-video" aria-labelledby="our-video-title">
      <div className="our-video__inner">
        <header className="our-video__header">
          <span className="our-video__eyebrow">{v.eyebrow}</span>
          <h2 id="our-video-title" className="our-video__title">{v.title}</h2>
          <p className="our-video__description" id="our-video-desc">{v.description}</p>
        </header>

        <figure className="our-video__stage">
          <div className="our-video__frame">
            <video
              ref={videoRef}
              className="our-video__player"
              poster={VIDEO.poster}
              controls
              playsInline
              webkit-playsinline="true"
              preload="metadata"
              onError={onError}
              aria-describedby="our-video-desc"
            >
              <source src={VIDEO.src} type={VIDEO.mime} onError={onError} />
              {v.unsupported}
            </video>

            {failed && (
              <div className="our-video__error" role="status">
                <p className="our-video__error-title">{v.error}</p>
                <p className="our-video__error-hint">{v.hint}</p>
                <div className="our-video__error-actions">
                  <button type="button" className="our-video__error-btn" onClick={retry}>
                    {v.retry}
                  </button>
                  <a
                    className="our-video__error-btn our-video__error-btn--ghost"
                    href={VIDEO.src}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {v.download} →
                  </a>
                </div>
              </div>
            )}
          </div>

          <figcaption className="our-video__caption">
            <span className="our-video__caption-name">{v.captionCn}</span>
            <span className="our-video__caption-sub">{v.captionEn}</span>
            <a
              className="our-video__download"
              href={VIDEO.src}
              target="_blank"
              rel="noopener noreferrer"
            >
              {v.download} →
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
