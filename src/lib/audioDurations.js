/**
 * Audio duration cache.
 *
 * An <audio> element only reports a usable `duration` after its metadata has
 * been fetched. With `preload="metadata"` that normally happens on mount, but
 * browsers may defer the media load for an element that appears inside a
 * freshly-mounted overlay — the player then sits at "0:00/0:00" until the
 * user presses play.
 *
 * This module preloads metadata (a few KB per file, never the audio itself)
 * for a list of sources and caches the result, so a player that mounts later
 * can show the real length immediately.
 */
const cache = new Map();
const pending = new Set();

export function getCachedDuration(src) {
  return (src && cache.get(src)) || 0;
}

export function preloadDuration(src) {
  if (!src || cache.has(src) || pending.has(src)) return;
  pending.add(src);
  try {
    const probe = new Audio();
    probe.preload = 'metadata';
    const finish = (ok) => {
      if (ok && Number.isFinite(probe.duration) && probe.duration > 0) {
        cache.set(src, probe.duration);
      }
      pending.delete(src);
      probe.removeAttribute('src');
      try { probe.load(); } catch { /* releasing the probe is best-effort */ }
    };
    probe.addEventListener('loadedmetadata', () => finish(true), { once: true });
    probe.addEventListener('error', () => finish(false), { once: true });
    probe.src = src;
  } catch {
    pending.delete(src);
  }
}

export function preloadDurations(srcs) {
  for (const s of srcs) preloadDuration(s);
}
