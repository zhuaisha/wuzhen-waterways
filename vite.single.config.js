// vite single-file config: bundle ALL JS/CSS/assets into one HTML.
// Used only by `npm run build:single` — the normal `vite build` config
// (vite.config.js) is untouched, so GitHub Pages / EdgeOne deploys keep
// working exactly as before.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Single file is opened directly (file://) — base must stay '/'.
  const base = env.VITE_BASE_URL || '/';
  return {
    plugins: [react(), viteSingleFile()],
    base,
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', 'lenis'],
      force: true,
    },
    build: {
      outDir: 'dist-single',
      // No code splitting / chunking: everything ends up in one file.
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      // The post-build injector (scripts/inject-embedded-assets.js) rewrites
      // local public/ asset references to runtime Data URIs; leave them
      // intact for the bundler.
      assetsInlineLimit: 0,
    },
  };
});
