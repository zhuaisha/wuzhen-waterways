/* Error classification + retry/backoff policy for the playback stack.
   Messages are user-facing, deliberately non-technical (spec 45). */

// HTMLMediaElement error codes
export const MEDIA = {
  ABORTED: 1,
  NETWORK: 2,
  DECODE: 3,
  SRC_NOT_SUPPORTED: 4,
};

// hls.js fatal error types
export const HLS_ERROR_TYPES = {
  NETWORK: 'networkError',
  MEDIA: 'mediaError',
};

// fatal hls.js codes worth mapping
export const HLS_FATAL = {
  NETWORK: 'HLS_ERROR_NETWORK',
  MEDIA: 'HLS_ERROR_MEDIA',
};

export function friendlyMessage(kind, detail) {
  switch (kind) {
    case 'network':
      return 'The connection was interrupted.';
    case 'format':
      return 'This browser cannot play this video format.';
    case 'decode':
      return 'This video could not be decoded on this device.';
    case 'timeout':
      return 'The film is taking longer to load.';
    default:
      return 'The film could not be played here.';
  }
}

// Exponential backoff: 1s -> 2s (spec 20, never 100ms polling)
export function backoffDelay(attempt) {
  return Math.min(1000 * 2 ** Math.max(0, attempt - 1), 8000);
}

// Network errors may auto-retry; fatal media/format errors may not.
export const MAX_NET_RETRIES = 2;
export const MAX_HLS_FATAL_RETRIES = 2; // spec 18: 2-3 tries then MP4 fallback

export function isRetryable(kind) {
  return kind === 'network' || kind === 'timeout';
}
