// ONE — Content Script Overlay (Intent Firewall)
// Real browser protection with level-awareness, allow-list checking, and fail-safe removal

(function () {
  const currentHost = window.location.hostname.replace(/^www\./, '').toLowerCase();

  // Initial status check upon visiting a matched domain
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (!response || !response.activeSession) return;
    evaluateAndRender(response.activeSession, response.exceptionPass);
  });

  // Listen for broadcast events from background service worker
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SESSION_ENDED') {
      removeOverlay();
    } else if (message.type === 'SESSION_UPDATED') {
      evaluateAndRender(message.session, null);
    } else if (message.type === 'EXCEPTION_GRANTED') {
      removeOverlay();
    } else if (message.type === 'EXCEPTION_EXPIRED') {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
        if (res?.activeSession) {
          evaluateAndRender(res.activeSession, null);
        }
      });
    }
  });

  function removeOverlay() {
    const existing = document.getElementById('one-intent-firewall-overlay');
    if (existing) existing.remove();
  }

  function isDomainAllowed(allowedDomains, host) {
    if (!allowedDomains || !Array.isArray(allowedDomains)) return false;
    return allowedDomains.some((d) => host === d || host.endsWith(`.${d}`));
  }

  function evaluateAndRender(session, exceptionPass) {
    // 1. If exception pass is active, do not block
    if (exceptionPass && exceptionPass.active && exceptionPass.expiresAt > Date.now()) {
      removeOverlay();
      return;
    }

    // 2. If domain is on user's allowed reference list, do not block
    if (isDomainAllowed(session.allowedDomains, currentHost)) {
      removeOverlay();
      return;
    }

    // 3. Otherwise, render the Intent Firewall
    renderIntentFirewall(session);
  }

  function renderIntentFirewall(session) {
    if (document.getElementById('one-intent-firewall-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'one-intent-firewall-overlay';
    overlay.style.cssText = `
      position: fixed !important;
      inset: 0 !important;
      background: #060709 !important;
      color: #F8FAFC !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      padding: 24px !important;
    `;

    const level = session.protectionLevel || 3;
    const appUrl = session.appOrigin || 'http://localhost:5173';

    overlay.innerHTML = `
      <div style="max-width: 480px; width: 100%; background: #0F1218; border: 1px solid #2D3446; border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: #F59E0B;">
            INTENT FIREWALL • LEVEL ${level}
          </span>
          ${level >= 4 ? '<span style="font-size: 10px; font-family: monospace; background: rgba(99,102,241,0.2); color: #A5B4FC; padding: 2px 6px; border-radius: 4px;">DEEP FOCUS</span>' : ''}
        </div>
        <h1 style="font-size: 32px; font-weight: 300; margin: 0 0 12px 0; color: #FFFFFF;">
          WAIT.
        </h1>
        <div style="background: #141820; border: 1px solid #1F2532; border-radius: 16px; padding: 16px; margin: 16px 0; text-align: left;">
          <span style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #94A3B8; display: block; margin-bottom: 4px;">
            You committed to:
          </span>
          <p style="font-size: 16px; font-weight: 500; margin: 0; color: #FFFFFF;">
            "${session.intentionTitle || 'Your chosen focus'}"
          </p>
        </div>
        <p style="font-size: 13px; color: #94A3B8; line-height: 1.5; margin-bottom: 24px;">
          What happened? Did you drift on autopilot, or do you have a specific intentional reason?
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="one-btn-return" style="width: 100%; padding: 12px; background: #10B981; border: none; border-radius: 12px; color: #060709; font-weight: 600; font-size: 13px; cursor: pointer;">
            I got distracted — Return to Focus
          </button>
          ${level < 5 ? `
          <button id="one-btn-exception" style="width: 100%; padding: 12px; background: #141820; border: 1px solid #F59E0B; border-radius: 12px; color: #F59E0B; font-weight: 600; font-size: 13px; cursor: pointer;">
            I have a specific reason (2m pass)
          </button>` : ''}
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlay);

    document.getElementById('one-btn-return')?.addEventListener('click', () => {
      window.location.href = appUrl;
    });

    document.getElementById('one-btn-exception')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'GRANT_EXCEPTION', durationMinutes: 2 }, (res) => {
        if (res?.status === 'granted') {
          overlay.remove();
        }
      });
    });
  }
})();
