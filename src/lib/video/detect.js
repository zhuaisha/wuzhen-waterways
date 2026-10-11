/* Capability detection for the Culture Film playback stack.
   Every decision is made from real feature tests (canPlayType,
   MediaSource, fullscreen/PiP/AirPlay support) — never from
   user-agent strings alone. Device hints are advisory only. */

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

const deviceHints = {
  ios: /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ reports itself as a Mac — sniff the touch screen
    (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1),
  android: /android/i.test(ua),
  windows: /win/i.test(ua),
  mac: /mac/i.test(ua) && !(/iphone|ipad|ipod/i.test(ua)),
};

function canPlay(video, type) {
  try {
    const v = video || document.createElement('video');
    const r = v.canPlayType(type);
    return r === 'probably' || r === 'maybe';
  } catch {
    return false;
  }
}

function mediaSourceSupports(mimeType) {
  try {
    if (typeof MediaSource === 'undefined') return false;
    return MediaSource.isTypeSupported(mimeType);
  } catch {
    return false;
  }
}

export function detectCapabilities(videoEl) {
  const v = videoEl;
  return {
    // container support
    mp4: canPlay(v, 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
    webm: canPlay(v, 'video/webm; codecs="vp9, opus"') || canPlay(v, 'video/webm'),
    // native HLS (Safari / iOS / Apple platforms)
    hlsNative: canPlay(v, 'application/vnd.apple.mpegurl') ||
      canPlay(v, 'application/x-mpegURL'),
    // MSE is what hls.js needs on non-Apple browsers
    mse: mediaSourceSupports('video/mp4; codecs="avc1.42E01E"'),
    // fullscreen
    fullscreen: !!(v.requestFullscreen || v.webkitRequestFullscreen ||
      v.mozRequestFullScreen || v.msRequestFullscreen ||
      (document.fullscreenEnabled !== undefined)),
    // Picture-in-Picture
    pip: !!(document.pictureInPictureEnabled || v.requestPictureInPicture),
    // AirPlay picker (WebKit)
    airplay: !!v.webkitShowPlaybackTargetPicker,
    // autoplay policy — we never autoplay with sound; this just records
    // whether muted inline autoplay is viable on this engine
    mutedInlineAutoplay: deviceHints.ios || deviceHints.android || deviceHints.windows || deviceHints.mac,
    // advisory device hints (NOT used for source selection)
    device: deviceHints,
    // connection hints (spec 58: read but never rely on)
    connection: (navigator.connection && {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
    }) || null,
  };
}

export default detectCapabilities;
