import React, { useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import App from './App.jsx';
import Deck from './components/Deck.jsx';
import './styles/global.css';
import './styles/cinematic.css';
import './styles/team.css';

gsap.registerPlugin(ScrollTrigger);

/* Presentation deck lives on the #/deck hash route — a fullscreen
 * overlay rendered alone (no scroll site, no Lenis wheel smoothing,
 * so arrows / keys / dots behave cleanly). */
const isDeck = () => location.hash.replace(/^#\/?/, '') === 'deck';

/* Lenis + GSAP ticker sync, for the scroll site only. */
function startLenis() {
  const lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    anchorScroll: false,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
  });
  window.__lenis = lenis;
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
}

function Root() {
  const [deck, setDeck] = useState(isDeck());
  useLayoutEffect(() => {
    const onHash = () => setDeck(isDeck());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  /* Re-arm Lenis whenever we're back on the scroll site (it is off on
   * #/deck on purpose). */
  useLayoutEffect(() => {
    if (!deck && !window.__lenis) startLenis();
  }, [deck]);
  return deck ? <Deck /> : <App />;
}

if (!isDeck()) startLenis();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
