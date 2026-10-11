import { useSpeech } from '../hooks/useSpeech.js';
import { useLang } from '../i18n/LanguageContext.jsx';

/* ------------------------------------------------------------------ */
/* Compact speech button — 16–20px icon, ≥44px hit area, transparent.  */
/* ------------------------------------------------------------------ */
/*
 * Props:
 *   id    stable key (chapter / section)
 *   text  the paragraph to speak in the current language
 *   tone  'light' -> for dark backgrounds (icon renders light)
 *         'dark'  -> for light backgrounds (icon renders dark)
 */

const ICONS = {
  play: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5.5v13l-9-6.5z" fill="currentColor" stroke="none" />
      <circle cx="17" cy="8" r="1" fill="currentColor" stroke="none" opacity="0.5" />
      <path d="M20 5.5a4.5 4.5 0 0 1 0 9" />
      <path d="M13 8.5v7" opacity="0.6" />
      <path d="M16 6.5v11" opacity="0.8" />
    </svg>
  ),
  pause: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M9 5.5v13M15 5.5v13" />
    </svg>
  ),
};

export default function AudioButton({ id, text, tone = 'light' }) {
  const { lang, t } = useLang();
  const { state, playing, paused, error, toggle } = useSpeech(id, text);

  const unavailable = error;
  const label = unavailable
    ? t('audio.unavailable')
    : playing
      ? t('audio.playing')
      : paused
        ? t('audio.paused')
        : t('audio.play');

  const visibleIcon = playing ? ICONS.pause : ICONS.play;
  const className = `audio-btn audio-btn--${tone} ${
    playing ? 'is-playing' : ''
  } ${unavailable ? 'is-error' : ''}`;

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={label}
      aria-pressed={playing || paused}
      title={label}
    >
      <span className="audio-btn__hit" aria-hidden="true" />
      <span className="audio-btn__icon" aria-hidden="true">
        {visibleIcon}
      </span>
      <span className="audio-btn__label" aria-hidden="true">
        {label}
      </span>
      <span className="audio-btn__state" aria-hidden="true">
        {playing ? t('audio.playing') : unavailable ? t('audio.unavailable') : ''}
      </span>
    </button>
  );
}
