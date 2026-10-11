/* Lazy hls.js loader — spec 11.
   The library is ONLY imported on demand (when the user actually enters the
   Culture Film section AND the browser would need hls.js for MSE-HLS).

   hls.js is an OPTIONAL dependency: the official Wuzhen film source is an
   iframe embed (no raw .m3u8/.mp4/.webm is exposed on the official site),
   so this loader exists to plug in a real HLS pipeline later WITHOUT
   making hls.js a build-time requirement.

   Resolution order:
   1. window.Hls — set by any global build / CDN script
   2. A real hls.js module import (if the package is installed)
   3. null — the fallback chain (MP4 → official embed → official page)
      handles it; never hard-fail on a missing optional dependency.

   The dynamic-import name is constructed at runtime so that Vite/Rollup
   static analysis never tries to resolve a package that may not exist. */

let hlsModule = null;

// Build the module specifier at runtime so no bundler pre-resolves it.
function hlsSpec() {
  const base = 'hls';
  return base + '.js';
}

export async function loadHls() {
  if (hlsModule) return hlsModule;

  // 1. Global build
  if (typeof window !== 'undefined' && window.Hls) {
    hlsModule = window.Hls;
    return hlsModule;
  }

  // 2. Real module (guarded — a missing package simply falls through)
  try {
    // new Function sidesteps bundler static analysis entirely.
    // eslint-disable-next-line no-new-func
    const importFn = new Function('m', 'return import(m)');
    const mod = await importFn(hlsSpec());
    hlsModule = mod.default;
    return hlsModule;
  } catch {
    // 3. No hls.js available — the fallback chain handles it.
    hlsModule = null;
    return null;
  }
}

// Only load hls.js when MSE exists (spec 6: never load it unconditionally).
export function shouldUseHlsJs(caps) {
  return !caps.hlsNative && caps.mse;
}

export default loadHls;
