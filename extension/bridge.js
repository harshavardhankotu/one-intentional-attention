// ONE — Web App to Extension Communication Bridge
// Injected only into legitimate ONE application origins to securely relay postMessage events

(function () {
  // Only activate on legitimate application origins
  const origin = window.location.origin;
  const isTrustedHost =
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    window.location.hostname.endsWith('.github.io');

  if (!isTrustedHost) return;

  function notifyAppReady() {
    window.postMessage(
      {
        type: 'ONE_EXTENSION_READY',
        version: '0.1.0',
        timestamp: Date.now()
      },
      origin
    );
  }

  notifyAppReady();
  const interval = setInterval(notifyAppReady, 500);
  setTimeout(() => clearInterval(interval), 3000);

  // Strict schema validation for incoming window messages
  function validatePayload(payload) {
    if (payload === null) return true; // Valid cleanup payload
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;

    // Validate sessionId
    if (typeof payload.sessionId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(payload.sessionId)) {
      return false;
    }

    // Validate isActive
    if (typeof payload.isActive !== 'boolean') return false;

    // Validate intentionTitle (max 300 chars, non-empty)
    if (typeof payload.intentionTitle !== 'string' || payload.intentionTitle.length === 0 || payload.intentionTitle.length > 300) {
      return false;
    }

    // Validate protectionLevel (1..5)
    const level = Number(payload.protectionLevel);
    if (!Number.isInteger(level) || level < 1 || level > 5) return false;

    // Validate targetDurationSeconds (1s to 24 hours)
    const duration = Number(payload.targetDurationSeconds);
    if (!Number.isInteger(duration) || duration < 1 || duration > 86400) return false;

    // Validate startedAt (valid reasonable epoch timestamp)
    const started = Number(payload.startedAt);
    if (!Number.isFinite(started) || started < 1600000000000 || started > Date.now() + 60000) return false;

    // Validate allowedDomains (array of valid hostnames, max 500 items)
    if (!Array.isArray(payload.allowedDomains) || payload.allowedDomains.length > 500) return false;
    for (const d of payload.allowedDomains) {
      if (typeof d !== 'string' || d.length > 253 || !/^[a-zA-Z0-9.-]+$/.test(d)) return false;
    }

    // Validate interceptDomains (array of valid hostnames, max 500 items)
    if (!Array.isArray(payload.interceptDomains) || payload.interceptDomains.length > 500) return false;
    for (const d of payload.interceptDomains) {
      if (typeof d !== 'string' || d.length > 253 || !/^[a-zA-Z0-9.-]+$/.test(d)) return false;
    }

    // Validate exceptionPass (null or valid exception object)
    if (payload.exceptionPass !== null && typeof payload.exceptionPass === 'object') {
      const ep = payload.exceptionPass;
      if (typeof ep.active !== 'boolean') return false;
      if (typeof ep.expiresAt !== 'number' || ep.expiresAt < started) return false;
      if (typeof ep.reason !== 'string' || ep.reason.length > 200) return false;
    } else if (payload.exceptionPass !== null) {
      return false;
    }

    // Validate appOrigin matches origin
    if (typeof payload.appOrigin !== 'string' || payload.appOrigin !== origin) return false;

    return true;
  }

  // Relay validated web app messages to background service worker
  window.addEventListener('message', (event) => {
    // 1. Strict Origin Verification
    if (event.origin !== origin) return;
    if (event.source !== window) return;

    if (event.data && event.data.type === 'ONE_SYNC_SESSION') {
      const payload = event.data.payload;

      // 2. Strict Schema Verification
      if (!validatePayload(payload)) {
        console.warn('ONE Extension Bridge: Rejected malformed or unauthorized session payload.');
        return;
      }

      try {
        chrome.runtime.sendMessage(
          {
            type: 'ONE_SYNC_SESSION',
            payload,
            origin
          },
          (response) => {
            if (chrome.runtime.lastError) return;
            window.postMessage(
              {
                type: 'ONE_SYNC_ACK',
                status: response?.status || 'ok'
              },
              origin
            );
          }
        );
      } catch (err) {
        console.debug('ONE extension bridge dispatch error:', err);
      }
    }
  });
})();
