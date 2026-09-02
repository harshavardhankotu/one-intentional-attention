// ONE — Content Script Overlay (Intent Firewall)

(function () {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (!response || !response.activeSession) return;

    // Check if exception pass is active
    if (response.exceptionPass && response.exceptionPass.expiresAt > Date.now()) {
      return; // Exception active, allow browsing
    }

    renderIntentFirewall(response.activeSession);
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'EXCEPTION_EXPIRED') {
      chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
        if (res?.activeSession) {
          renderIntentFirewall(res.activeSession);
        }
      });
    }
  });

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

    overlay.innerHTML = `
      <div style="max-width: 480px; width: 100%; background: #0F1218; border: 1px solid #2D3446; border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center;">
        <span style="font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: #F59E0B; display: block; margin-bottom: 8px;">
          INTENT FIREWALL
        </span>
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
          What happened? Did you drift on muscle memory, or do you have a specific intentional reason?
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="one-btn-return" style="width: 100%; padding: 12px; background: #10B981; border: none; border-radius: 12px; color: #060709; font-weight: 600; font-size: 13px; cursor: pointer;">
            I got distracted — Return to Focus
          </button>
          <button id="one-btn-exception" style="width: 100%; padding: 12px; background: #141820; border: 1px solid #F59E0B; border-radius: 12px; color: #F59E0B; font-weight: 600; font-size: 13px; cursor: pointer;">
            I have a specific reason (2m pass)
          </button>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlay);

    document.getElementById('one-btn-return')?.addEventListener('click', () => {
      window.history.back();
      setTimeout(() => {
        window.close();
      }, 300);
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
