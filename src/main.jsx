import React from 'react';
import ReactDOM from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import App from './App.jsx';
import './styles/global.css';
import './styles/cinematic.css';
import './styles/team.css';
import './styles/our-video.css';
import './styles/i18n.css';

gsap.registerPlugin(ScrollTrigger);

// Lenis with GSAP ticker sync
// 保持 smoothWheel 开启给滚动一些流畅感，但 lerp 调到 0.4 让滚动跟手不拖尾。
const lenis = new Lenis({
  duration: 0.5,
  lerp: 0.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 1.5,
  anchorScroll: false,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
});

// 导出给 Navbar 使用
window.__lenis = lenis;

// Sync Lenis with GSAP ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Update ScrollTrigger on Lenis scroll
lenis.on('scroll', ScrollTrigger.update);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Remove the portable-build loading screen once React has rendered.
// The loader div is injected by scripts/inject-embedded-assets.js;
// in normal HTTP builds it doesn't exist, so this is a no-op there.
requestAnimationFrame(() => {
  const loader = document.getElementById('__loader__');
  if (loader) {
    // trigger the CSS transition, then remove from DOM
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    setTimeout(() => loader.remove(), 600);
  }
});

// Expose a refresh hook for the language switcher.
// After EN↔ZH the DOM reflows (CN lines are shorter or longer than EN, so
// every section's offset changes by tens to hundreds of pixels). ScrollTrigger
// caches those offsets at register time and won't know about the change; Lenis
// caches its scrollLength the same way. Without a refresh, the user can't
// scroll past the switch point — the sections are still in the DOM but the
// virtual scroll never reaches them. This is the bug behind "below Atlas is
// blank after switching to Chinese".
window.__refreshScroll = () => {
  lenis.resize();
  lenis.scrollTo(window.scrollY, { immediate: true });
  ScrollTrigger.refresh();
};
