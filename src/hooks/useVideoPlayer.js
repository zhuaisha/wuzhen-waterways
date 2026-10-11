/* useVideoPlayer — unified playback state machine for the Culture Film.
   One `status` string (spec 36: no tangle of independent booleans):
     idle -> loading -> ready -> playing <-> paused
                                   \-> buffering
                                   \-> ended
                                   \-> error -> fallback
   Local mode (MP4/WebM/HLS media files) drives the MediaEngine; iframe
   mode drives the official embed directly. Same actions, same states. */

import { useEffect, useRef, useState, useCallback } from 'react';
import detectCapabilities from '../lib/video/detect.js';
import { MediaEngine } from '../lib/video/player.js';
import { selectBestSource } from '../lib/video/sources.js';

export function useVideoPlayer(videoRef, { source, onFallback } = {}) {
  const [status, setStatus] = useState('idle');
  const [errorInfo, setErrorInfo] = useState(null);
  const [progress, setProgress] = useState(0);   // 0..1
  const [buffered, setBuffered] = useState(0);    // 0..1
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(true);       // spec 26/27: default muted
  const [volume, setVolume] = useState(0);
  const engineRef = useRef(null);
  const capsRef = useRef(null);

  const isIframe = source?.engine === 'iframe' || source?.type === 'iframe';

  /* -- capability detection once the media element exists (spec 54) -- */
  useEffect(() => {
    if (isIframe) return;
    capsRef.current = detectCapabilities(videoRef.current);

    engineRef.current = new MediaEngine(videoRef.current, capsRef.current, {
      onState: (state, payload) => {
        if (state === 'error') {
          setStatus('error');
          setErrorInfo(payload);
          // spec 17: hand off to the next strategy (iframe / official page)
          onFallback?.(payload);
          return;
        }
        setStatus(state);
        if (state === 'idle' || state === 'ready') {
          const v = videoRef.current;
          if (v) {
            setDuration(v.duration || 0);
            setCurrentTime(v.currentTime || 0);
            setMuted(v.muted);
            setVolume(v.volume);
          }
        }
      },
    });
    return () => engineRef.current?.destroy();
  }, [isIframe, videoRef]);

  /* progress polling — rAF only while active, so GSAP/Lenis never gets a
     per-frame burden (spec 41) and idle UI costs nothing. */
  useEffect(() => {
    if (isIframe || !['playing', 'buffering'].includes(status)) return;
    let raf;
    const tick = () => {
      const v = videoRef.current;
      if (v && v.duration) {
        setProgress(v.currentTime / v.duration);
        setCurrentTime(v.currentTime);
        try {
          const b = v.buffered;
          if (b.length) setBuffered(b.end(b.length - 1) / v.duration);
        } catch { /* noop */ }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, isIframe, videoRef]);

  const attach = useCallback(async () => {
    if (isIframe) { setStatus('loading'); return; }
    const v = videoRef.current;
    if (!v || !source || !capsRef.current) return;
    setStatus('loading');
    // attach exactly what selectBestSource chose for this engine
    await engineRef.current?.attach(source);
  }, [isIframe, source, videoRef]);

  const play = useCallback(() => {
    if (isIframe) { setStatus('playing'); return; } // iframe manages itself
    engineRef.current?.play();
  }, [isIframe]);

  const pause = useCallback(() => {
    if (isIframe) return;
    engineRef.current?.pause();
  }, [isIframe]);

  const toggle = useCallback(() => {
    if (isIframe) return;
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) play(); else pause();
  }, [isIframe, play, pause]);

  const seek = useCallback((t) => {
    if (isIframe) return;
    engineRef.current?.seek(t);
    if (videoRef.current) setCurrentTime(t);
  }, [isIframe, videoRef]);

  const toggleMute = useCallback(() => {
    if (isIframe) return;
    engineRef.current?.toggleMute();
    setMuted((m) => !m);
  }, [isIframe]);

  const changeVolume = useCallback((x) => {
    if (isIframe) return;
    engineRef.current?.setVolume(x);
    setVolume(x);
  }, [isIframe]);

  const retry = useCallback(async () => {
    setErrorInfo(null);
    if (isIframe) { setStatus('loading'); return; }
    engineRef.current.netRetries = 0;
    engineRef.current.hlsRetries = 0;
    await attach();
  }, [isIframe, attach]);

  /* pick the best source for THIS engine (memo-free: caps are stable) */
  const bestSource = source && capsRef.current ? selectBestSource(capsRef.current) : source;

  return {
    status, errorInfo, progress, buffered, duration, currentTime,
    muted, volume,
    isIframe,
    bestSource,
    actions: { attach, play, pause, toggle, seek, toggleMute, changeVolume, retry },
  };
}

export default useVideoPlayer;
