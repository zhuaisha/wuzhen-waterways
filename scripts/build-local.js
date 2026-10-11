// Post-build script for `npm run build:local`.
//
// Vite (with vite.local.config.js) outputs:
//   dist-local/index.html   — references external JS/CSS via relative paths
//   dist-local/assets/*.js  — ES module script (type="module")
//   dist-local/assets/*.css — stylesheet
//   dist-local/images/*     — images (copied from public/)
//
// Problem: on file://, <script type="module" src="..."> is blocked by CORS.
//
// Solution: inline JS content into a <script type="module"> tag (inline
// module scripts have the page's origin → no CORS needed on file://).
// CSS stays as an external file (CSS is NOT CORS-restricted on file://).
//
// Result: double-click dist-local/index.html → works in any modern browser.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DIST = join(process.cwd(), 'dist-local');
const HTML_PATH = join(DIST, 'index.html');

let html = readFileSync(HTML_PATH, 'utf8');

// Inline <script type="module" src="..."> → <script type="module">{content}</script>
// Inline module scripts have the page's origin, so file:// works.
html = html.replace(
  /<script type="module"[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/g,
  (m, src) => {
    const clean = src.replace(/^\.?\/|^\.\/|\/wuzhen-waterways\//, '').replace(/^\//, '');
    const js = readFileSync(join(DIST, clean), 'utf8');
    return `<script type="module">${js}</script>`;
  },
);

// Inline <link rel="stylesheet" href="..."> → <style>{content}</style>
html = html.replace(
  /<link[^>]*\bhref=["']([^"']+\.css)["'][^>]*>/g,
  (m, href) => {
    const clean = href.replace(/^\.?\/|^\.\/|\/wuzhen-waterways\//, '').replace(/^\//, '');
    const css = readFileSync(join(DIST, clean), 'utf8');
    return `<style>${css}</style>`;
  },
);

// Normalize any leftover absolute image paths from the deployed base:
//   "/wuzhen-waterways/images/..." → "images/..."
// Only applies to quoted strings inside the bundle (JS asset resolvers).
html = html.replace(/(["'])(\/wuzhen-waterways\/)/g, '$1');

writeFileSync(HTML_PATH, html, 'utf8');
console.log('[build:local] inlined JS + CSS into dist-local/index.html');
console.log('[build:local] open dist-local/index.html directly in your browser');
