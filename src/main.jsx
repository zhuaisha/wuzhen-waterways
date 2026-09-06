import React from 'react';
import ReactDOM from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import App from './App.jsx';
import './styles/global.css';

gsap.registerPlugin(ScrollTrigger);

// Lenis with GSAP ticker sync
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
  </React.StrictMode>
);
