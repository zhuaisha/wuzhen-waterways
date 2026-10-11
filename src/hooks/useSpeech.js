import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../i18n/LanguageContext.jsx';

/* ------------------------------------------------------------------ */
/* Web Speech TTS — singleton controller                                */
/* ------------------------------------------------------------------ */
/*
 * One utterance at a time across the whole site:
 *   - starting a new one cancels the current one
 *   - switching language cancels everything
 *   - all buttons read back a shared state
 *
 * No external audio files, no TTS API — only the browser's built-in
 * `speechSynthesis`. If the device has no usable voice for the current
 * language, the caller is told so via a `supported: false` result.
 */

const synth =
  typeof window !== 'undefined' && 'speechSynthesis' in window
    ? window.speechSynthesis
    : null;

/* voices load asynchronously on most browsers */
function pickVoice(lang) {
  if (!synth) return null;
  const prefix = lang === 'zh' ? 'zh' : 'en';
  const target = lang === 'zh' ? 'zh-CN' : 'en-US';
  const voices = synth.getVoices() || [];
  const exact = voices.find((v) => v.lang === target);
  if (exact) return exact;
  const loose = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(prefix));
  return loose || null;
}

/* Voice lists load asynchronously on Chrome/Windows — wait briefly before
   deciding a voice is missing, so a fresh page load doesn't fake an error. */
function findVoiceAsync(lang, timeout = 1500) {
  const voice = pickVoice(lang);
  if (voice) return Promise.resolve(voice);
  return new Promise((resolve) => {
    const deadline = Date.now() + timeout;
    const check = () => {
      const v = pickVoice(lang);
      if (v) return resolve(v);
      if (Date.now() >= deadline) {
        synth.removeEventListener?.('voiceschanged', check);
        return resolve(null);
      }
      setTimeout(check, 150);
    };
    synth.addEventListener?.('voiceschanged', check, { once: true });
    setTimeout(check, 150);
  });
}

/* Module-level controller — survives React re-renders. */
const controller = {
  id: 0,            // currently playing button id (or 0 = none)
  state: 'idle',    // 'idle' | 'playing' | 'paused' | 'error'
  utterance: null,
};

function cancelAll() {
  if (synth) {
    try {
      synth.cancel();
    } catch {
      /* ignore */
    }
  }
  controller.id = 0;
  controller.state = 'idle';
  controller.utterance = null;
}

/* ------------------------------------------------------------------ */
/* React hook                                                           */
/* ------------------------------------------------------------------ */

/**
 * @param {string} id   - stable button id (chapter/section key)
 * @param {string} text - text to speak in the CURRENT language
 *
 * Returns { playing, paused, error, toggle, state }
 *
 * `text` is captured per language switch — when `lang` changes the hook
 * cancels the running utterance and drops the stale `text`.
 */
export function useSpeech(id, text) {
  const { lang } = useLang();
  const [state, setState] = useState('idle'); // 'idle'|'playing'|'paused'|'error'
  const [error, setError] = useState('');

  /* Stable generation counter — every language change bumps it, so a
     delayed voice lookup can detect that the UI moved on. */
  const genRef = useRef(0);
  genRef.current += 1;

  /* Cancel on unmount + on language switch (covers StrictMode double-call). */
  useEffect(() => {
    cancelAll();
    setState('idle');
    setError('');
    return () => {
      cancelAll();
    };
  }, [lang]);

  const toggle = useCallback(() => {
    if (!synth) {
      setState('error');
      setError('no-synth');
      return;
    }

    /* stop anything else that might be speaking */
    cancelAll();

    /* pause / resume if this same button is active */
    if (controller.id === id && controller.state === 'paused' && controller.utterance) {
      try {
        synth.resume();
      } catch {
        /* some engines drop the utterance — restart from the top */
      }
      controller.state = 'playing';
      setState('playing');
      return;
    }

    /* start a new one */
    const gen = genRef.current;
    const startUtterance = async () => {
      const voice = await findVoiceAsync(lang);
      /* if the language changed while we waited, the effect already reset
         the controller — don't start a stale utterance */
      if (gen !== genRef.current) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      if (voice) u.voice = voice;
      u.rate = 1;
      u.pitch = 1;

      controller.id = id;
      controller.utterance = u;

      u.onstart = () => {
        if (controller.utterance !== u) return;
        controller.state = 'playing';
        setState('playing');
      };
      u.onend = () => {
        if (controller.utterance !== u) return; // stale
        controller.id = 0;
        controller.state = 'idle';
        controller.utterance = null;
        setState('idle');
        setError('');
      };
      /* 'canceled'/'interrupted' are the normal result of switching
         language or clicking another button — not a real error. */
      u.onerror = (e) => {
        if (controller.utterance !== u) return;
        controller.utterance = null;
        if (e?.error === 'canceled' || e?.error === 'interrupted') {
          controller.id = 0;
          controller.state = 'idle';
          setState('idle');
          setError('');
        } else {
          controller.id = 0;
          controller.state = 'error';
          setState('error');
          setError(e?.error || 'error');
        }
      };

      setState('playing');
      try {
        synth.speak(u);
      } catch {
        setState('idle');
      }
    };

    startUtterance();
  }, [id, text, lang]);

  /* If another button started speaking, this one must report 'idle'. */
  useEffect(() => {
    if (controller.id !== id && controller.state !== 'idle') {
      setState('idle');
      setError('');
    }
  }, [id]);

  return useMemo(
    () => ({
      state,
      playing: state === 'playing',
      paused: state === 'paused',
      error: state === 'error',
      errorMessage: error,
      toggle,
    }),
    [state, error, toggle]
  );
}

export default useSpeech;
