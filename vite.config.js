import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/wuzhen-waterways/' : '/',
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger', 'lenis'],
    force: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
