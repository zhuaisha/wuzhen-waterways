import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useVideoPlayer } from '../hooks/useVideoPlayer.js';
import { OFFICIAL, POSTERS, VIDEO_SOURCES } from '../lib/video/sources.js';
import { useLang } from '../i18n/LanguageContext.jsx';

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* The official film. Source: Wuzhen tourism official website           */
/* (www.wuzhen.com.cn) — album "广告视频" (id=7). The official site    */
/* embeds its films through the Tencent Video official iframe player;  */
/* no raw MP4/.m3u8/.webm exists on the official page, so this        */
/* chapter uses the official embed path and a graceful "watch on the   */
/* official site" fallback.                                            */
/* ------------------------------------------------------------------ */
const FILM = {
  titleCn: '乌镇文化宣传片',
  titleEn: 'Wuzhen Cultural Film',
  sourceUrl: OFFICIAL.pageUrl,
  iframeSrc: OFFICIAL.iframeSrc,
  poster: POSTERS.primary,
  posterFallback: POSTERS.fallback,
};

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Inline glyphs — no icon deps */
const PlayIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.15-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
  </svg>
);
const PauseIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <rect x="7" y="5" width="3.4" height="14" rx="1" /><rect x="13.6" y="5" width="3.4" height="14" rx="1" />
  </svg>
);
const ReplayIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12a8 8 0 1 0 2.34-5.66" /><path d="M4 4v4h4" />
  </svg>
);
const MuteIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4z" /><line x1="16" y1="9" x2="21" y2="14" /><line x1="21" y1="9" x2="16" y2="14" />
  </svg>
);
const UnmuteIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
  </svg>
);
const ExpandIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" />
    <path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);
const ShrinkIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h3V5" /><path d="M20 8h-3V5" /><path d="M4 16h3v3" /><path d="M20 16h-3v3" />
  </svg>
);
const PipIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><rect x="12" y="12" width="8" height="6" rx="1" fill="currentColor" stroke="none" />
  </svg>
);
const AirplayIcon = () => (
  <svg className="cf-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 18v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" /><path d="M12 22V6" /><path d="m8.5 10 3.5-4 3.5 4" />
  </svg>
);

export default function CultureFilm() {
  const { t } = useLang();
  const f = t('film');
  const rootRef = useRef(null);
  const headerRef = useRef(null);
  const eyebrowRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const progressRef = useRef(null);

  const [started, setStarted] = useState(false);   // user pressed Play
  const [embedLive, setEmbedLive] = useState(false);   // official iframe mounted
  const [embedFailed, setEmbedFailed] = useState(false); // iframe fatal -> official page
  const [inFull, setInFull] = useState(false);

  /* ---------------- capability probes for optional controls ---------- */
  const [canFs, setCanFs] = useState(false);
  const [canPip, setCanPip] = useState(false);
  const [canAirplay, setCanAirplay] = useState(false);

  /* ---------------- unified player state machine (spec 36) ---------- */
  // The only verified source is the official iframe (spec 14: no
  // fabricated media files). VIDEO_SOURCES.media stays empty, so the
  // pipeline resolves to the embed; the <video> element still exists so
  // the capability stack is live and a real MP4/HLS can be dropped in
  // later without touching this component.
  const source = { engine: 'iframe', type: 'iframe', src: VIDEO_SOURCES.officialIframe };
  const {
    status, errorInfo, progress, buffered, currentTime, duration,
    muted, isIframe,
    actions,
  } = useVideoPlayer(videoRef, { source });

  const anyPlayback = embedLive || ['playing', 'paused', 'buffering'].includes(status);

  /* ---------------- full / pip / airplay capability probes ---------- */
  useEffect(() => {
    const v = videoRef.current;
    setCanFs(!!(v?.requestFullscreen || v?.webkitRequestFullscreen ||
      v?.mozRequestFullScreen || v?.msRequestFullscreen ||
      document.fullscreenEnabled));
    setCanPip(!!(document.pictureInPictureEnabled || v?.requestPictureInPicture));
    setCanAirplay(!!v?.webkitShowPlaybackTargetPicker);
  }, []);

  /* ---------------- control bar: visible on hover/tap, idle after 3s -- */
  const [barVisible, setBarVisible] = useState(false);
  const idleTimer = useRef(null);
  const pokeBar = useCallback(() => {
    setBarVisible(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setBarVisible(false), 3200);
  }, []);
  useEffect(() => () => clearTimeout(idleTimer.current), []);

  /* ---------------- progress: pointer seeking (spec 38/39) ---------- */
  const seekFromEvent = (e) => {
    const bar = progressRef.current;
    if (!bar || embedLive) return; // the official player owns its own seek
    const rect = bar.getBoundingClientRect();
    const frac = rect.width ? (Math.min(Math.max(e.clientX - rect.left, 0), rect.width) / rect.width) : 0;
    actions.seek(frac * (duration || 0));
  };
  const onProgressDown = (e) => {
    pokeBar();
    e.preventDefault(); // keep Lenis from eating the touch (spec 40)
    seekFromEvent(e);
    const move = (ev) => seekFromEvent(ev);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  /* ---------------- fullscreen (spec 29) ---------------------------- */
  const toggleFs = () => {
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    if (active) {
      (document.exitFullscreen?.bind(document) ||
        document.webkitExitFullscreen?.bind(document) ||
        document.mozCancelFullScreen?.bind(document) ||
        document.msExitFullscreen?.bind(document))().catch?.(() => {});
      return;
    }
    const el = stageRef.current;
    if (!el) return;
    const req = el.requestFullscreen?.bind(el)
      || el.webkitRequestFullscreen?.bind(el)
      || el.mozRequestFullScreen?.bind(el)
      || el.msRequestFullscreen?.bind(el);
    if (req) req().catch?.(() => {}); // unsupported -> button already hidden
  };
  useEffect(() => {
    const onFs = () => setInFull(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (started) return;
    setStarted(true);
    setEmbedLive(true); // official embed mounts on click (lazy, spec 22)
    pokeBar();
  }, [started, pokeBar]);

  const handleRetry = () => {
    setEmbedFailed(false);
    setEmbedLive(false);
    actions.retry();
    setTimeout(() => setEmbedLive(true), 50); // re-mount the embed
  };

  const handleContinue = () => {
    const next = document.getElementById('chapter-water');
    if (!next) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch?.(() => {});
    }
    if (window.__lenis) window.__lenis.scrollTo(next, { duration: 0.8, offset: -40 });
    else next.scrollIntoView({ behavior: 'smooth' });
  };

  /* ================================================================ */
  /* Reveal + robustness (one-shot, no pin spacer)                     */
  /* ================================================================ */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealElements = [
      eyebrowRef.current,
      ...Array.from(
        (headerRef.current?.querySelectorAll(
          '.culture-film__title, .culture-film__description'
        ) || [])
      ),
      stageRef.current,
    ];

    if (prefersReduced()) {
      gsap.set(revealElements, {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', clearProps: 'transform',
      });
      root.classList.add('is-revealed');
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root,
          start: 'top 68%',
          toggleActions: 'play none none reverse',
          onEnter: () => root.classList.add('is-revealed'),
        },
      });

      tl.fromTo(eyebrowRef.current, { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5 }, 0);

      tl.fromTo(
        headerRef.current.querySelectorAll('.culture-film__title, .culture-film__description'),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.15);

      tl.fromTo(stageRef.current,
        { opacity: 0, scale: 1.05, y: 30, filter: 'blur(8px)' },
        { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 1.0 }, 0.35);
      // One-shot reveal: holds when the user leaves, cleanly reverses
      // on return. No second scrubbed tween fights the same element
      // (that's what black-screened the stage on scroll-away-and-back).
    }, root);

    // Fallback: never let the film stay stuck at opacity 0 on direct
    // jumps (anchor / back-forward / auto-scroll).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.15) {
            if (!root.classList.contains('is-revealed') &&
                getComputedStyle(stageRef.current).opacity === '0') {
              gsap.set(revealElements, {
                opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', clearProps: 'transform',
              });
              root.classList.add('is-revealed');
            }
            io.disconnect();
            break;
          }
        }
      },
      { threshold: [0, 0.15, 0.4] }
    );
    io.observe(root);

    return () => { io.disconnect(); ctx.revert(); };
  }, []);

  /* ---------------- time formatting ---------------- */
  const fmt = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /* ================================================================ */
  return (
    <section
      ref={rootRef}
      className={`culture-film ${inFull ? 'is-fullscreen' : ''}`}
      aria-label={f.captionCn}
    >
      <div className="culture-film__inner">
        {/* ------------------------------------------------ header */}
        <div className="culture-film__header" ref={headerRef}>
          <span className="culture-film__eyebrow" ref={eyebrowRef}>
            {f.eyebrow}
          </span>
          <h2 className="culture-film__title">{f.title}</h2>
          <p className="culture-film__description" id="culture-film-desc">
            {f.description}
          </p>
        </div>

        {/* ------------------------------------------------ stage */}
        <div
          className="culture-film__stage"
          ref={stageRef}
          onClick={() => {
            // tap the film (outside the control bar) to start on mobile
            if (!started) handlePlay();
          }}
        >
          {/* poster layer — always the visual base */}
          <img
            className={`culture-film__poster ${started ? 'is-hidden' : ''}`}
            src={FILM.poster}
            alt=""
            loading="lazy"
            decoding="async"
            fetchPriority="high"
            onError={(e) => {
              if (!e.currentTarget.dataset.fb) {
                e.currentTarget.dataset.fb = '1';
                e.currentTarget.src = FILM.posterFallback;
              }
            }}
          />
          <div className={`culture-film__veil ${started ? 'is-hidden' : ''}`} aria-hidden="true" />

          {/* local media (capability pipeline). Stays empty until a real
              MP4/HLS/WebM source is registered in VIDEO_SOURCES; it then
              plays natively with the full control bar below. */}
          <video
            ref={videoRef}
            className="culture-film__video"
            poster={FILM.poster}
            playsInline
            webkit-playsinline=""
            muted
            preload="none"
            aria-describedby="culture-film-desc"
          />

          {/* official embed — the authoritative source of record */}
          {embedLive && !embedFailed && (
            <iframe
              className="culture-film__frame is-live"
              src={FILM.iframeSrc}
              title={f.captionCn}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={() => setEmbedFailed(false)}
            />
          )}

          {/* ---------- center control: idle Play / ended Replay ------- */}
          {!started && (
            <button
              type="button"
              className="culture-film__play"
              onClick={handlePlay}
              aria-label={`${f.play} (${f.captionCn} / ${f.captionEn})`}
            >
              <PlayIcon />
            </button>
          )}
          {!embedLive && status === 'ended' && (
            <button
              type="button"
              className="culture-film__play"
              onClick={handleRetry}
              aria-label={f.replay}
            >
              <ReplayIcon />
            </button>
          )}

          <span
            className={`culture-film__playhint ${started ? 'is-hidden' : ''}`}
            aria-hidden="true"
          >
            {f.play} →
          </span>

          {/* Apple-like control bar (spec 35) --------------- */}
          <div
            className={`culture-film__controls ${anyPlayback && barVisible ? 'is-visible' : ''}`}
            onPointerEnter={pokeBar}
            onPointerDown={(e) => { e.stopPropagation(); pokeBar(); }}
            role="group"
            aria-label={f.filmControls}
          >
            <div className="culture-film__controls-row">
              {/* transport (local media only — the official player owns
                  its own controls; spec 16: logic and UI stay decoupled) */}
              {!embedLive && anyPlayback && (
                <button
                  type="button"
                  className="cf-ctl"
                  onClick={() => { actions.toggle(); pokeBar(); }}
                  aria-label={status === 'playing' ? f.pause : f.play}
                >
                  {status === 'playing' ? <PauseIcon /> : <PlayIcon />}
                </button>
              )}

              {/* progress: 2px hairline, buffered at low opacity,
                  pointer-draggable, 44px+ touch target via the hit zone */}
              <div
                className="cf-progress"
                ref={progressRef}
                onPointerDown={onProgressDown}
                role="slider"
                tabIndex={embedLive ? -1 : 0}
                aria-label={f.seek}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <div className="cf-progress-buffered" style={{ width: `${buffered * 100}%` }} />
                <div className="cf-progress-played" style={{ width: `${progress * 100}%` }} />
              </div>

              <span className="cf-time">{fmt(currentTime)} / {fmt(duration)}</span>

              <div className="cf-controls-right">
                {!embedLive && anyPlayback && (
                  <button
                    type="button"
                    className="cf-ctl"
                    onClick={() => { actions.toggleMute(); pokeBar(); }}
                    aria-label={muted ? f.unmute : f.mute}
                  >
                    {muted ? <MuteIcon /> : <UnmuteIcon />}
                  </button>
                )}
                {canPip && !embedLive && anyPlayback && (
                  <button
                    type="button"
                    className="cf-ctl"
                    onClick={async () => {
                      try { await videoRef.current?.requestPictureInPicture?.(); } catch { /* unsupported */ }
                    }}
                    aria-label={f.pip}
                  >
                    <PipIcon />
                  </button>
                )}
                {canAirplay && (
                  <button
                    type="button"
                    className="cf-ctl"
                    onClick={() => videoRef.current?.webkitShowPlaybackTargetPicker?.()}
                    aria-label={f.airplay}
                  >
                    <AirplayIcon />
                  </button>
                )}
                {canFs && (
                  <button
                    type="button"
                    className="cf-ctl"
                    onClick={toggleFs}
                    aria-label={inFull ? f.exitFullscreen : f.fullscreen}
                  >
                    {inFull ? <ShrinkIcon /> : <ExpandIcon />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* faint loading hairline while the pipeline is working */}
          <div className={`culture-film__loading ${['loading', 'buffering'].includes(status) ? 'is-visible' : ''}`}>
            <span className="culture-film__loading-bar" />
          </div>

          {/* slow-load / error panel (spec 19/45): human copy + Retry + official */}
          {(status === 'error' || embedFailed) && (
            <div className="culture-film__fallback" role="status">
              <p className="culture-film__fallback-text">
                {embedFailed
                  ? f.fallbackError
                  : errorInfo?.kind === 'network'
                    ? f.fallbackNetwork
                    : errorInfo?.kind === 'timeout'
                      ? f.fallbackTimeout
                      : f.fallbackError}
              </p>
              <div className="culture-film__fallback-actions">
                <button type="button" className="culture-film__fallback-btn" onClick={handleRetry}>
                  {f.tryAgain}
                </button>
                <a
                  className="culture-film__fallback-btn"
                  href={FILM.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {f.officialSite} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------ caption */}
        <div className="culture-film__caption">
          <p className="culture-film__caption-name">{f.captionCn}</p>
          <p className="culture-film__caption-sub">{f.captionEn}</p>
          {started && (
            <button
              type="button"
              className="culture-film__continue"
              onClick={handleContinue}
              aria-label={f.continue}
            >
              {f.continue} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        {/* ------------------------------------------------ source */}
        <div className="culture-film__source">
          <span className="culture-film__source-label">{f.sourceLabel}</span>
          <a
            className="culture-film__source-link"
            href={FILM.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {f.viewSource} →
          </a>
        </div>
      </div>
    </section>
  );
}
