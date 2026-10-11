import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { makeT } from './translations.js';

/* ------------------------------------------------------------------ */
/* Safe localStorage — file:// builds may have storage denied.         */
/* ------------------------------------------------------------------ */

const LS_KEY = 'wuzhen-lang';

function readStored() {
  try {
    const v = window.localStorage.getItem(LS_KEY);
    if (v === 'en' || v === 'zh') return v;
  } catch {
    /* storage unavailable (file://, privacy mode, quota) */
  }
  return null;
}

function writeStored(lang) {
  try {
    window.localStorage.setItem(LS_KEY, lang);
  } catch {
    /* ignore — session-level switch still works */
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

const LanguageContext = createContext({
  lang: 'en',
  t: () => '',
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => readStored() || 'en');

  const setLang = useCallback((next) => {
    if (next !== 'en' && next !== 'zh') return;
    setLangState((cur) => {
      if (cur === next) return cur;
      writeStored(next);
      return next;
    });
  }, []);

  /* After a language switch, reflow is inevitable — Chinese lines are
     shorter/longer than English, so section offsets shift. ScrollTrigger
     and Lenis cache those offsets at register time; without a refresh the
     user can scroll but the virtual scroll never reaches the new positions.
     Call __refreshScroll after React commits the new text. Using setTimeout
     (not requestAnimationFrame) ensures the DOM has actually reflowed. */
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (typeof window.__refreshScroll === 'function') {
        window.__refreshScroll();
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [lang]);

  const t = useMemo(() => makeT(lang), [lang]);

  /* Language switch stops any running speech (see useSpeech). The hook
     subscribes to this context, so no manual wiring per component. */

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

export default LanguageContext;
