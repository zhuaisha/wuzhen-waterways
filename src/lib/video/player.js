/* Media engine for native MP4/WebM/HLS playback.
   Owns a <video> element's lifecycle: source attachment, native HLS,
   hls.js attach, event -> state transitions, and the retry/fallback chain.
   The React hook (useVideoPlayer) drives it; this class is pure. */

import { MEDIA, isRetryable, backoffDelay, MAX_NET_RETRIES, MAX_HLS_FATAL_RETRIES } from './errors.js';
import { loadHls, shouldUseHlsJs } from './hls.js';

const LOADING_TIMEOUT = 9000; // spec 19: 8-10s, then show slow-load + Retry

export class MediaEngine {
  constructor(videoEl, caps, { onState } = {}) {
    this.video = videoEl;
    this.caps = caps;
    this.onState = onState || (() => {});
    this.hls = null;
    this.netRetries = 0;
    this.hlsRetries = 0;
    this.loadingTimer = null;
    this.attachedSource = null;
    this.destroyed = false;

    videoEl.addEventListener('error', this.handleMediaError);
    videoEl.addEventListener('waiting', this.handleWaiting);
    videoEl.addEventListener('playing', this.handlePlaying);
    videoEl.addEventListener('pause', this.handlePause);
    videoEl.addEventListener('ended', this.handleEnded);
    videoEl.addEventListener('canplay', this.handleCanPlay);
    videoEl.addEventListener('loadeddata', this.handleLoadedData);
  }

  /* Attach a source chosen by selectBestSource. engine: 'native' | 'hls.js' */
  async attach(source) {
    if (this.destroyed) return;
    this.attachedSource = source;
    this.emit('loading');
    this.startLoadingWatchdog();

    if (source.type === 'hls' && source.engine === 'hls.js') {
      await this.attachHls(source.src);
      return;
    }

    // native path — HLS-native is just video.src = m3u8 on Apple platforms
    const v = this.video;
    v.removeAttribute('src');
    v.removeAttr?.('src');
    v.src = source.src;
    v.load();
  }

  async attachHls(url) {
    if (this.destroyed) return;
    try {
      const Hls = await loadHls();
      if (this.destroyed) return;
      if (!Hls) {
        // hls.js not available (not installed) — fall through to MP4/embed
        this.onState('error', { kind: 'format', detail: 'hls-unavailable' });
        return;
      }
      this.destroyHls();
      this.hls = new Hls({
        // keep retries bounded (spec 18: no endless retry on fatal)
        maxRetry: MAX_HLS_FATAL_RETRIES + 1,
        manifestLoadingTimeOut: LOADING_TIMEOUT,
      });
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.emit('ready');
        this.hls.play();
      });
      this.hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        this.hlsRetries += 1;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && this.hlsRetries <= MAX_NET_RETRIES) {
          this.hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && this.hlsRetries <= MAX_NET_RETRIES) {
          this.hls.recoverMediaError();
          return;
        }
        // fatal + retries exhausted -> hand back to the caller's fallback
        this.destroyHls();
        this.onState('error', { kind: 'format', detail: 'hls-fatal', hls: data });
      });
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);
    } catch (err) {
      this.destroyHls();
      this.onState('error', { kind: 'format', detail: 'hls-load-failed', err });
    }
  }

  destroyHls() {
    if (this.hls) {
      try { this.hls.destroy(); } catch { /* noop */ }
      this.hls = null;
    }
  }

  /* ---- media element events ---- */

  handleMediaError = () => {
    const v = this.video;
    const code = v.error ? v.error.code : MEDIA.SRC_NOT_SUPPORTED;
    if (code === MEDIA.NETWORK) {
      // auto-retry with exponential backoff, bounded (spec 20)
      if (this.netRetries < MAX_NET_RETRIES) {
        this.netRetries += 1;
        this.emit('buffering');
        setTimeout(() => {
          if (this.destroyed) return;
          try { v.load(); v.play().catch(() => {}); } catch { /* noop */ }
        }, backoffDelay(this.netRetries));
        return;
      }
      this.onState('error', { kind: 'network' });
      return;
    }
    // aborted is harmless (source swap) — ignore
    if (code === MEDIA.ABORTED) return;
    this.onState('error', {
      kind: code === MEDIA.DECODE ? 'decode' : 'format',
      code,
    });
  };

  handleWaiting = () => this.emit('buffering');

  handlePlaying = () => {
    this.stopLoadingWatchdog();
    this.emit('playing');
  };

  handlePause = () => this.emit('paused');

  handleEnded = () => this.emit('ended');

  handleCanPlay = () => {
    if (this.video.readyState >= 3 && this.isInitial('loading')) this.emit('ready');
  };

  handleLoadedData = () => {
    this.stopLoadingWatchdog();
    if (this.isInitial('loading')) this.emit('ready');
  };

  /* watchdog: a source that never delivers data within 9s becomes 'timeout'
     (spec 19) so the UI can offer Retry / Official Website instead of
     spinning forever. */
  startLoadingWatchdog() {
    this.stopLoadingWatchdog();
    this.loadingTimer = setTimeout(() => {
      if (this.destroyed) return;
      // only fire if still stuck in loading/buffering
      const s = this.lastState;
      if (s === 'loading' || s === 'buffering') {
        this.onState('error', { kind: 'timeout' });
      }
    }, LOADING_TIMEOUT);
  }

  stopLoadingWatchdog() {
    if (this.loadingTimer) { clearTimeout(this.loadingTimer); this.loadingTimer = null; }
  }

  isInitial(state) { return this.lastState === state; }

  emit(state, payload) {
    this.lastState = state;
    this.onState(state, payload);
  }

  /* transport controls */
  play() { return this.video.play().catch((e) => {
    // Autoplay policy refusal is not a media error — surface it distinctly
    if (e && e.name === 'NotAllowedError') {
      this.onState('error', { kind: 'autoplay-blocked', detail: e.message });
    }
  }); }
  pause() { this.video.pause(); }
  seek(t) { try { this.video.currentTime = t; } catch { /* noop */ } }
  setVolume(x) { this.video.volume = x; }
  toggleMute() { this.video.muted = !this.video.muted; }

  destroy() {
    this.destroyed = true;
    this.stopLoadingWatchdog();
    this.destroyHls();
    const v = this.video;
    v.removeEventListener('error', this.handleMediaError);
    v.removeEventListener('waiting', this.handleWaiting);
    v.removeEventListener('playing', this.handlePlaying);
    v.removeEventListener('pause', this.handlePause);
    v.removeEventListener('ended', this.handleEnded);
    v.removeEventListener('canplay', this.handleCanPlay);
    v.removeEventListener('loadeddata', this.handleLoadedData);
    try { v.removeAttribute('src'); v.load(); } catch { /* noop */ }
  }
}

export default MediaEngine;
