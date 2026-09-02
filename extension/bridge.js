// ONE — Web App to Extension Communication Bridge
// Injected into the ONE web application origin to relay postMessage events to the service worker

(function () {
  // Announce to web app that ONE companion extension is active
  function notifyAppReady() {
    window.postMessage(
      {
        type: 'ONE_EXTENSION_READY',
        version: '0.1.0',
        timestamp: Date.now()
      },
      '*'
    );
  }

  notifyAppReady();
  // Periodic ping for first 3 seconds to ensure React has mounted
  const interval = setInterval(notifyAppReady, 500);
  setTimeout(() => clearInterval(interval), 3500);

  // Relay web app messages to extension background service worker
  window.addEventListener('message', (event) => {
    // Only accept messages from the current window
    if (event.source !== window) return;

    if (event.data && event.data.type === 'ONE_SYNC_SESSION') {
      try {
        chrome.runtime.sendMessage(event.data, (response) => {
          if (chrome.runtime.lastError) {
            // Background worker waking up or unreachable
            return;
          }
          // Acknowledge back to web app
          window.postMessage(
            {
              type: 'ONE_SYNC_ACK',
              status: response?.status || 'ok'
            },
            '*'
          );
        });
      } catch (err) {
        console.debug('ONE extension relay error:', err);
      }
    }
  });
})();
