// Unified asset resolver for the Wuzhen single-file build.
//
// The single-file build (vite single + build:single) injects the
// EMBEDDED_ASSETS runtime data URI table into the page (see
// scripts/inject-embedded-assets.js). Every component and data module
// resolves local images through this file, so the same source works:
//
//   - HTTP/HTTPS deployments  -> BASE_URL paths (public/ files served normally)
//   - the portable single HTML -> runtime Data URIs (no network, no files)
//
// Add a new image used by the site? Put it under public/ and list its
// public path in scripts/inject-embedded-assets.js so it is embedded in
// the portable build.

const runTimeAssets =
  typeof window !== 'undefined'
    ? window.EMBEDDED_ASSETS || null
    : null;

export const EMBEDDED_ASSETS = {
  get(url) {
    if (!runTimeAssets) return null;
    const key = String(url).replace(/^\.\//, '').split('?')[0];
    return runTimeAssets[key] || null;
  },
};

export function assetUrl(path) {
  if (typeof path !== 'string') return path;
  const embedded = EMBEDDED_ASSETS.get(path);
  return embedded || path;
}

export function assetSrcSet(srcSet) {
  if (typeof srcSet !== 'string') return srcSet;
  return srcSet
    .split(',')
    .map((entry) => entry.trim())
    .map((entry) => {
      if (!entry) return entry;
      const parts = entry.split(' ');
      const url = assetUrl(parts.shift());
      return [url, ...parts].join(' ');
    })
    .join(', ');
}
