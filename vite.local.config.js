// Vite config for local (file://) builds.
// - base: './' → all asset paths are relative
// - assetsInlineLimit: 0 → keep images as separate files (not data URIs)
// - Output to dist-local/
//
// A post-build script (scripts/build-local.js) will then:
//   1. Inline JS and CSS into index.html (fixes file:// CORS)
//   2. Keep images as separate files with relative paths
//   3. Remove the single-file dist-single output
//
// This gives you a multi-file site (index.html + images/) that works
// when you double-click index.html in any modern browser.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-local',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Keep code-split chunks separate (don't inline dynamic imports)
        inlineDynamicImports: false,
      },
    },
    // Don't inline images as base64 — keep them as files
    assetsInlineLimit: 0,
  },
});
