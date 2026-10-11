import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n/LanguageContext.jsx';
import { getCachedDuration } from '../lib/audioDurations.js';

/**
 * AudioPlayer — a compact, Apple-style audio player for a real audio file.
 * Used in the team detail panel (member self-intro) and chapter sections
 * (water / bridges / boats / life / night narration).
 *
 * Props:
 *   src       audio file URL (relative path, works on file://)
 *   label     category label text, e.g. "VOICE" / "语音"
 *   subtitle  optional subtitle (member name / speaker name)
 *   title     optional theme/heading row above the label (chapter title)
 *   tone      'light' — dark background (icon renders light)
 *             'dark'  — light background (icon renders dark)  [default]
 */
export function AudioPlayer({ src, label, subtitle, title, tone = 'dark' }) {
  const { t } = useLang();
  const audioRef = useRef(null);
  const barRef = useRef(null);
  const draggingRef = useRef(false);

  const [ready, setReady] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(() => getCachedDuration(src));

  useEffect(() => {
    setReady(true);
    setPlaying(false);
    setTime(0);
    setDuration(getCachedDuration(src));
  }, [src]);

  /* Metadata normally arrives on its own, but a freshly-mounted overlay can
     start with the media load deferred — the player would then read
     "0:00/0:00" until the user pressed play. Nudge it until the real length
     lands (metadata only, at most a few attempts). */
  useEffect(() => {
    let tries = 0;
    let timer = window.setTimeout(function kick() {
      const a = audioRef.current;
      if (!a || (Number.isFinite(a.duration) && a.duration > 0)) return;
      if (tries >= 4) return;
      tries += 1;
      try { a.load(); } catch { /* ignore */ }
      timer = window.setTimeout(kick, 350 * tries);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [src]);

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => {}).catch(() => {
        setPlaying(false);
      });
    } else {
      a.pause();
    }
  };

  const onLoaded = () => {
    const a = audioRef.current;
    if (a && Number.isFinite(a.duration)) setDuration(a.duration);
  };

  const onTime = () => setTime(audioRef.current?.currentTime || 0);
  const onEnded = () => { setPlaying(false); setTime(0); };
  const onError = () => setReady(false);

  const seek = (clientX) => {
    const bar = barRef.current;
    const a = audioRef.current;
    if (!bar || !a || !duration) return;
    const r = bar.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    a.currentTime = k * duration;
    setTime(a.currentTime);
  };

  const onPointerDown = (e) => {
    if (!ready || !duration) return;
    draggingRef.current = true;
    barRef.current?.setPointerCapture?.(e.pointerId);
    seek(e.clientX);
    e.preventDefault();
  };
  const onPointerMove = (e) => { if (draggingRef.current) seek(e.clientX); };
  const onPointerUp = (e) => {
    draggingRef.current = false;
    barRef.current?.releasePointerCapture?.(e.pointerId);
  };

  const onKey = (e) => {
    if (!ready || !duration) return;
    const w = barRef.current?.getBoundingClientRect().width || 0;
    if (e.key === 'ArrowLeft') { e.preventDefault(); seek(e.clientX - w / 10); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); seek(e.clientX + w / 10); }
  };

  const fmt = (s) => {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  if (!ready) return null;

  const listenLabel = t('audio.play');
  const stopLabel = t('audio.stop');
  const ariaLabel = playing ? stopLabel : listenLabel;

  return (
    <div className={`audio-player audio-player--${tone}`}>
      {title && (
        <p className="audio-player__title">
          <span>{title}</span>
        </p>
      )}
      <p className="audio-player__label">
        <span>{label}</span>
        {subtitle && (
          <span className="audio-player__who">{subtitle}</span>
        )}
      </p>

      <div className="audio-player__row">
        <button
          type="button"
          className={`audio-player__btn ${playing ? 'is-playing' : ''}`}
          onClick={toggle}
          aria-label={ariaLabel}
          aria-pressed={playing}
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
            </svg>
          )}
        </button>

        <div
          className="audio-player__track"
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label={`${listenLabel}`}
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={time}
          aria-valuetext={`${fmt(time)} of ${duration > 0 ? fmt(duration) : '--:--'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKey}
        >
          <div className="audio-player__rail" />
          <div className="audio-player__fill" style={{ width: `${pct}%` }} />
          <div className="audio-player__knob" style={{ left: `${pct}%` }} />
        </div>

        <span className="audio-player__time">
          {fmt(time)}
          <em>/{duration > 0 ? fmt(duration) : '--:--'}</em>
        </span>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={onLoaded}
        onDurationChange={onLoaded}
        onTimeUpdate={onTime}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
        onError={onError}
      />
    </div>
  );
}
