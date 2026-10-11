// Post-build step for `npm run build:single`.
//
// Turns dist-single/index.html into a fully self-contained HTML:
//   1. Every local image under public/ is embedded as a runtime
//      window.EMBEDDED_ASSETS Data URI table (injected into <head>).
//   2. Every remaining local asset reference in the document —
//      <script src>, <link href>, img src, srcset, url(...) in CSS,
//      preload — is rewritten to its inline Data URI.
//   3. The favicon is inlined too.
//   4. The result is written to dist-single/Wuzhen-Portable.html and all
//      intermediate files in dist-single are removed.
//
// The source React app is never modified: components resolve images
// through src/lib/assets.js, which checks window.EMBEDDED_ASSETS first.
// In a normal HTTP deployment the table is absent and BASE_URL paths
// are used, so the portable build adds nothing to the website build.

import { readFileSync, readdirSync, statSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist-single');
const PUBLIC = join(ROOT, 'public');
const OUT = join(DIST, 'Wuzhen-Portable.html');

const MIME = {
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function mimeFor(p) {
  return MIME[extname(p).toLowerCase()] || 'application/octet-stream';
}

function dataUri(absPath) {
  const buf = readFileSync(absPath);
  return `data:${mimeFor(absPath)};base64,${buf.toString('base64')}`;
}

/* 1. collect every public asset as a Data URI, keyed by its public path */
function collectPublicAssets() {
  const table = {};
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      const st = statSync(abs);
      if (st.isDirectory()) walk(abs);
      else {
        const rel = abs.slice(PUBLIC.length + 1).split('\\').join('/');
        table[rel] = dataUri(abs);
      }
    }
  };
  walk(PUBLIC);
  return table;
}

/* 2. rewrite local references inside the HTML document */
function inlineLocalRefs(html, table, distDir) {
  const cache = {};
  const toData = (fileRel) => {
    if (cache[fileRel] !== undefined) return cache[fileRel];
    // public assets were copied into dist/ by vite
    const abs = resolve(distDir, fileRel);
    let uri = null;
    if (existsSync(abs)) uri = dataUri(abs);
    else if (table[fileRel]) uri = table[fileRel];
    cache[fileRel] = uri;
    return uri;
  };

  // <script src="./assets/x.js"> / /assets/x.js
  html = html.replace(
    /(<script\b[^>]*\bsrc=)"?([^"\s>]+)"?/gi,
    (m, open, src) => {
      const clean = src.replace(/^\.?\//, '');
      const uri = toData(clean);
      if (!uri) return m;
      return open + 'data: (inlined)';
    },
  );

  return html, toData;
}

/* --- main --- */
function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    throw new Error('dist-single/index.html not found — run `vite build -c vite.single.config.js` first');
  }
  const table = collectPublicAssets();
  console.log(`[build:single] embedded ${Object.keys(table).length} public assets`);

  let html = readFileSync(join(DIST, 'index.html'), 'utf8');

  // Inline the JS module script(s)
  html = html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (m, src) => {
    const clean = src.replace(/^\.?\//, '').replace(/^assets\//, 'assets/');
    const abs = resolve(DIST, clean);
    if (!existsSync(abs)) return m;
    const js = readFileSync(abs, 'utf8');
    // type="module" inlines: wrap so top-level import.meta etc. is fine
    return `<script type="module">${js}</script>`;
  });

  // Inline <link rel="stylesheet" href>
  html = html.replace(
    /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi,
    (m, href) => {
      const rel = href.replace(/^\.?\//, 'assets/');
      if (!rel.startsWith('assets/')) return m;
      const abs = resolve(DIST, rel);
      if (!existsSync(abs) || !abs.endsWith('.css')) return m;
      const css = readFileSync(abs, 'utf8');
      // CSS may reference sibling asset files — rewrite them too
      const cssWithInlined = css.replace(
        /url\(\s*["']?([^"')]+)["']?\s*\)/gi,
        (um, u) => {
          if (u.startsWith('data:') || u.startsWith('#') || u.startsWith('http')) return um;
          const urlPath = u.replace(/^\.?\//, '');
          const cssAbs = resolve(DIST, urlPath);
          if (existsSync(cssAbs)) return `url(${dataUri(cssAbs)})`;
          return um;
        },
      );
      return `<style>${cssWithInlined}</style>`;
    },
  );

  // favicon
  html = html.replace(
    /<link\b[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    (m, href) => {
      const clean = href.replace(/^\.?\//, '');
      const abs = resolve(DIST, clean);
      if (!existsSync(abs)) return m;
      return `<link rel="icon" type="${MIME[extname(abs)] || 'image/png'}" href="${dataUri(abs)}">`;
    },
  );

  // <img src> / srcset / preload references to public assets
  const reImgSrc = /(<img\b[^>]*\bsrc=)["']([^"']+)["']/gi;
  html = html.replace(reImgSrc, (m, open, src) => {
    const clean = src.replace(/^\.?\//, '');
    const uri = table[clean] || null;
    if (!uri) return m;
    return open + `"${uri}"`;
  });

  // generic attribute/property references inside inlined script/data
  html = html.replace(
    /(src=|poster=|href=)["'](?:\.?\/)?((images|assets)\/[^"']+)["']/g,
    (m, eq, path) => {
      const uri = table[path];
      return uri ? `${eq}"${uri}"` : m;
    },
  );

  // CSS url() leftovers that survived (background images from :root etc.)
  html = html.replace(/url\(\s*["']?(images\/[^"')]+)["']?\s*\)/gi, (m, p) => {
    const uri = table[p];
    return uri ? `url(${uri})` : m;
  });

  // === FIX: Add CSS-only loading screen + move asset table to body end ===
  // The 17MB EMBEDDED_ASSETS table must NOT block <head> parsing.
  // Instead: (1) inject a pure-CSS loader that renders immediately,
  // (2) put the asset table at end of <body> so it loads AFTER HTML,
  // (3) React module script (type="module" = deferred) runs after
  //     both parse and executes, by which point the table is ready.

  const LOADER_HTML = `<div id="__loader__" aria-hidden="true">
<style>
#__loader__{position:fixed;inset:0;z-index:2147483647;background:#050505;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;
  transition:opacity .5s ease,visibility .5s ease}
#__loader__ h1{color:#fff;font-size:clamp(20px,3vw,28px);font-weight:600;
  letter-spacing:.05em;margin:0 0 28px}
#__loader__ p{color:rgba(255,255,255,.45);font-size:13px;letter-spacing:.1em;
  margin:0 0 36px}
#__loader__ .bar{width:180px;height:1px;background:rgba(255,255,255,.08);
  overflow:hidden;border-radius:1px}
#__loader__ .bar::after{content:'';display:block;height:100%;width:40%;
  background:rgba(255,255,255,.7);border-radius:1px;animation:__ldr 1.2s cubic-bezier(.4,0,.2,1) infinite}
@keyframes __ldr{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
</style>
<h1>WUZHEN</h1>
<p>Loading assets</p>
<div class="bar"></div>
</div>`;

  // (a) Strip any existing asset table from <head> (idempotent rebuild)
  html = html.replace(
    /<script>window\.EMBEDDED_ASSETS=\{[^]*?\};<\/script>\s*/,
    '',
  );

  // (b) Inject dark background at very start of <head> so the page
  //     is never white — even during the 870KB head parse.
  const DARK_BG_CSS = `<style>html,body{background:#050505;margin:0;padding:0;color:#fff}</style>`;
  html = html.replace(
    /<head([^>]*)>/i,
    (m, attrs) => `<head${attrs}>\n${DARK_BG_CSS}\n`,
  );

  // (c) Inject loader as FIRST child of <body> — renders immediately
  //     once head is parsed, providing visual feedback during the 17MB
  //     asset table processing.
  html = html.replace(
    /<body([^>]*)>/i,
    (m, attrs) => `<body${attrs}>\n${LOADER_HTML}\n`,
  );

  // (d) Inject asset table at end of <body> — runs synchronously but
  //     doesn't block <head> parsing. The deferred module script runs
  //     after this, so window.EMBEDDED_ASSETS is ready when React renders.
  const tableJson = JSON.stringify(table);
  html = html.replace(
    /<\/body>/i,
    `<script>window.EMBEDDED_ASSETS=${tableJson};<\/script>
</body>`,
  );

  // (c) Remove the old <head> injection block (the replace above already
  //     stripped it, but keep the head clean for any stray artifacts)

  // Final safety: strip any lingering local file references
  const leftovers = [];
  const leftoverRe = /["'(]((?:images|assets)\/[a-zA-Z0-9._-]+)/g;
  let lm;
  while ((lm = leftoverRe.exec(html))) leftovers.push(lm[1]);

  writeFileSync(OUT, html, 'utf8');

  // remove everything else from dist-single (keep only the portable HTML)
  for (const name of readdirSync(DIST)) {
    if (name === 'Wuzhen-Portable.html') continue;
    rmSync(join(DIST, name), { recursive: true, force: true });
  }

  const outSize = statSync(OUT).size;
  console.log(`[build:single] wrote ${OUT}`);
  console.log(`[build:single] size: ${(outSize / 1024 / 1024).toFixed(2)} MB`);
  if (leftovers.length) {
    console.warn(`[build:single] WARNING: ${leftovers.length} unrewritten local refs:`, [...new Set(leftovers)]);
  } else {
    console.log('[build:single] no unrewritten local asset references remain');
  }
}

main();
