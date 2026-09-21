import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // EdgeOne / Zeabur serve at root → base '/'.
  // GitHub Pages sub-path /wuzhen-waterways/ stays the default for plain 'production'.
  const base =
    env.VITE_BASE_URL ||
    (mode === 'production' ? '/wuzhen-waterways/' : '/');
  return {
    plugins: [react()],
    base,
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', 'lenis'],
      force: true,
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  };
});
