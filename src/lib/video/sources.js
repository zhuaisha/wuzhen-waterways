/* Official video source registry for the Wuzhen Cultural Film.
   ---------------------------------------------------------------
   VERIFIED from the official site (www.wuzhen.com.cn/web/poto/album?id=7,
   fetched 2026-10-08): the album hosts its films exclusively through the
   Tencent Video official iframe player (vid=z3210mvx1gg, "文化乌镇宣传片").
   The page and the iframe host expose NO direct .mp4 / .m3u8 / .webm URLs,
   and no player JSON. Per spec 14 we therefore do NOT invent sources:
   the authoritative source is the official embed, with the official page
   as the terminal fallback.

   The stack below is a capability pipeline. To plug in a real media file
   later (e.g. a legally-licensed MP4 or an HLS master playlist), just add
   it under `media` — selectBestSource() picks the best playable entry per
   browser, and the official embed remains the final safety net. */

const BASE = import.meta.env.BASE_URL;
import { assetUrl } from '../../lib/assets.js';

export const OFFICIAL = {
  // the official album page the film is hosted on (spec 14)
  pageUrl: 'http://www.wuzhen.com.cn/web/poto/album?id=7',
  // the official iframe embed (the same one the official page uses)
  iframeSrc: 'https://v.qq.com/txp/iframe/player.html?vid=z3210mvx1gg',
  iframeTitle: '乌镇文化宣传片',
};

/* Poster: the film's own cover, shipped locally at 1920px so HTTPS builds
   never pull mixed-content and mobile screens never show a stretched 320px
   thumbnail (spec 21: no low-res posters). */
const POSTER = assetUrl(`${BASE}images/culture-film-poster-1920.jpg`);
const POSTER_FALLBACK = assetUrl(`${BASE}images/culture-film-poster.jpg`);

export const VIDEO_SOURCES = {
  // No fabricated URLs. Every entry is verified; unverified slots are null.
  hls: null,      // official site does not expose an .m3u8
  mp4: null,      // official site does not expose a raw .mp4
  webm: null,     // official site does not expose a .webm
  // the one authoritative source that exists:
  officialIframe: OFFICIAL.iframeSrc,
  // terminal fallback: open the official album page
  officialPage: OFFICIAL.pageUrl,
};

export const POSTERS = { primary: POSTER, fallback: POSTER_FALLBACK };

/* selectBestSource — spec 55. Given detected capabilities, return the
   best source/engine combo. Never hardcodes browser names; the rules are
   driven purely by what the engine actually supports. */
export function selectBestSource(caps) {
  // 1. Native HLS (Apple platforms) — only meaningful if a real .m3u8 exists
  if (VIDEO_SOURCES.hls && caps.hlsNative) {
    return { type: 'hls', src: VIDEO_SOURCES.hls.src, engine: 'native' };
  }

  // 2. MP4 (H.264/AAC) — the universal fallback when a file exists
  if (VIDEO_SOURCES.mp4 && caps.mp4) {
    return { type: 'mp4', src: VIDEO_SOURCES.mp4.src, engine: 'native' };
  }

  // 3. WebM — only when nothing above is playable
  if (VIDEO_SOURCES.webm && caps.webm) {
    return { type: 'webm', src: VIDEO_SOURCES.webm.src, engine: 'native' };
  }

  // 4. The official embed always exists — authoritative source of record
  return { type: 'iframe', src: VIDEO_SOURCES.officialIframe, engine: 'iframe' };
}

export default VIDEO_SOURCES;
