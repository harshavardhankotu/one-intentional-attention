// ONE — Content Script Overlay (Intent Firewall)
// Safe DOM Construction (Zero innerHTML / XSS-Proof), Level 4/5 Universal Enforcement, and Allow-list Checking

(function () {
  const currentHost = window.location.hostname.replace(/^www\./, '').toLowerCase();

  // Initial status check upon visiting a matched domain
  try {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.activeSession) return;
      evaluateAndRender(response.activeSession, response.exceptionPass);
    });
  } catch {
    // Context invalidated or extension reloaded
  }

  // Listen for broadcast events from background service worker
  try {
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
  } catch {
    // Context invalidated
  }

  function removeOverlay() {
    const existing = document.getElementById('one-intent-firewall-overlay');
    if (existing) existing.remove();
  }

  function isDomainAllowed(allowedDomains, host) {
    if (!allowedDomains || !Array.isArray(allowedDomains)) return false;
    return allowedDomains.some((d) => host === d || host.endsWith(`.${d}`));
  }

  function isDomainIntercepted(interceptDomains, host) {
    const defaults = [
      'instagram.com',
      'youtube.com',
      'reddit.com',
      'twitter.com',
      'x.com',
      'tiktok.com',
      'facebook.com',
      'netflix.com',
      'twitch.tv'
    ];
    const targetList = Array.isArray(interceptDomains) && interceptDomains.length > 0 ? interceptDomains : defaults;
    return targetList.some((d) => host === d || host.endsWith(`.${d}`));
  }

  function evaluateAndRender(session, exceptionPass) {
    if (!session || !session.isActive) {
      removeOverlay();
      return;
    }

    // 1. Never block the ONE web app itself or local development
    const appOrigin = session.appOrigin || '';
    if (
      window.location.origin === appOrigin ||
      currentHost === 'localhost' ||
      currentHost === '127.0.0.1' ||
      (currentHost === 'harshavardhankotu.github.io' && window.location.pathname.startsWith('/one-intentional-attention'))
    ) {
      removeOverlay();
      return;
    }

    // 2. If intentional exception pass is active, allow browsing
    if (exceptionPass && exceptionPass.active && exceptionPass.expiresAt > Date.now()) {
      removeOverlay();
      return;
    }

    // 3. If domain is on user's allowed reference list, allow browsing
    if (isDomainAllowed(session.allowedDomains, currentHost)) {
      removeOverlay();
      return;
    }

    const level = Number(session.protectionLevel) || 3;

    // 4. Level 4 (Deep Focus) / Level 5 (Hard Lock): Allow-list only mode!
    // Every non-whitelisted domain is blocked.
    if (level >= 4) {
      renderIntentFirewall(session, level);
      return;
    }

    // 5. Level 1, 2, 3: Only block recognized distraction domains
    if (isDomainIntercepted(session.interceptDomains, currentHost)) {
      renderIntentFirewall(session, level);
      return;
    }

    // Neutral domain under level 1-3 is allowed
    removeOverlay();
  }

  // Safe DOM Construction: 100% textContent, ZERO innerHTML
  function renderIntentFirewall(session, level) {
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

    const card = document.createElement('div');
    card.style.cssText = `
      max-width: 480px;
      width: 100%;
      background: #0F1218;
      border: 1px solid #2D3446;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      text-align: center;
    `;

    // Header badge row
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;';

    const badge = document.createElement('span');
    badge.style.cssText = 'font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: #F59E0B;';
    badge.textContent = `INTENT FIREWALL • LEVEL ${level}`;
    headerRow.appendChild(badge);

    if (level >= 4) {
      const modeTag = document.createElement('span');
      modeTag.style.cssText = 'font-size: 10px; font-family: monospace; background: rgba(99,102,241,0.2); color: #A5B4FC; padding: 2px 6px; border-radius: 4px;';
      modeTag.textContent = level === 5 ? 'HARD LOCK' : 'DEEP FOCUS';
      headerRow.appendChild(modeTag);
    }
    card.appendChild(headerRow);

    // Title
    const title = document.createElement('h1');
    title.style.cssText = 'font-size: 32px; font-weight: 300; margin: 0 0 12px 0; color: #FFFFFF;';
    title.textContent = level === 1 ? 'Are you sure?' : 'WAIT.';
    card.appendChild(title);

    // Goal box
    const goalBox = document.createElement('div');
    goalBox.style.cssText = 'background: #141820; border: 1px solid #1F2532; border-radius: 16px; padding: 16px; margin: 16px 0; text-align: left;';

    const commitLabel = document.createElement('span');
    commitLabel.style.cssText = 'font-size: 10px; font-family: monospace; text-transform: uppercase; color: #94A3B8; display: block; margin-bottom: 4px;';
    commitLabel.textContent = 'You committed to:';
    goalBox.appendChild(commitLabel);

    // XSS SAFE: textContent completely neutralizes HTML injection tags
    const goalText = document.createElement('p');
    goalText.style.cssText = 'font-size: 16px; font-weight: 500; margin: 0; color: #FFFFFF; word-break: break-word;';
    goalText.textContent = `"${session.intentionTitle || 'Your chosen focus'}"`;
    goalBox.appendChild(goalText);
    card.appendChild(goalBox);

    // Prompt message
    const promptMsg = document.createElement('p');
    promptMsg.style.cssText = 'font-size: 13px; color: #94A3B8; line-height: 1.5; margin-bottom: 24px;';
    promptMsg.textContent =
      level === 1
        ? 'Did you mean to shift focus, or do you want to protect your intentional session?'
        : 'What happened? Did you drift on autopilot, or do you have a specific intentional reason?';
    card.appendChild(promptMsg);

    // Level 2 Mindful Friction indicator
    let frictionRemaining = level === 2 ? 5 : 0;
    let frictionTimer = null;
    let frictionNotice = null;

    if (level === 2) {
      frictionNotice = document.createElement('p');
      frictionNotice.style.cssText = 'font-size: 12px; font-mono; color: #F59E0B; margin-bottom: 12px;';
      frictionNotice.textContent = `Deliberate friction pause: ${frictionRemaining}s remaining...`;
      card.appendChild(frictionNotice);
    }

    // Button actions container
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

    // Button 1: Return to Focus
    const returnBtn = document.createElement('button');
    returnBtn.id = 'one-btn-return';
    returnBtn.style.cssText = `
      width: 100%;
      padding: 12px;
      background: #10B981;
      border: none;
      border-radius: 12px;
      color: #060709;
      font-weight: 600;
      font-size: 13px;
      cursor: ${level === 2 ? 'not-allowed' : 'pointer'};
      opacity: ${level === 2 ? '0.5' : '1'};
    `;
    returnBtn.disabled = level === 2;
    returnBtn.textContent = 'I got distracted — Return to Focus';
    returnBtn.addEventListener('click', () => {
      const baseApp = session.appOrigin || 'http://localhost:5173';
      const appUrl = baseApp.includes('github.io')
        ? (baseApp.endsWith('/one-intentional-attention/') ? baseApp : `${baseApp.replace(/\/$/, '')}/one-intentional-attention/`)
        : baseApp;
      window.location.href = appUrl;
    });
    btnContainer.appendChild(returnBtn);

    // Button 2: Specific reason (Only allowed for Levels 1-4, NOT Level 5 Hard Lock)
    let exceptionBtn = null;
    if (level < 5) {
      exceptionBtn = document.createElement('button');
      exceptionBtn.id = 'one-btn-exception';
      exceptionBtn.style.cssText = `
        width: 100%;
        padding: 12px;
        background: #141820;
        border: 1px solid #F59E0B;
        border-radius: 12px;
        color: #F59E0B;
        font-weight: 600;
        font-size: 13px;
        cursor: ${level === 2 ? 'not-allowed' : 'pointer'};
        opacity: ${level === 2 ? '0.5' : '1'};
      `;
      exceptionBtn.disabled = level === 2;
      exceptionBtn.textContent = 'I have a specific reason (2m pass)';
      exceptionBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage(
          {
            type: 'GRANT_EXCEPTION',
            durationMinutes: 2,
            reason: 'Extension Intercept Pass'
          },
          (res) => {
            if (res?.status === 'granted') {
              removeOverlay();
            }
          }
        );
      });
      btnContainer.appendChild(exceptionBtn);
    }

    // Countdown logic for Level 2
    if (level === 2) {
      frictionTimer = setInterval(() => {
        frictionRemaining -= 1;
        if (frictionRemaining <= 0) {
          clearInterval(frictionTimer);
          if (frictionNotice) frictionNotice.remove();
          returnBtn.disabled = false;
          returnBtn.style.cursor = 'pointer';
          returnBtn.style.opacity = '1';
          if (exceptionBtn) {
            exceptionBtn.disabled = false;
            exceptionBtn.style.cursor = 'pointer';
            exceptionBtn.style.opacity = '1';
          }
        } else {
          if (frictionNotice) {
            frictionNotice.textContent = `Deliberate friction pause: ${frictionRemaining}s remaining...`;
          }
        }
      }, 1000);
    }

    card.appendChild(btnContainer);
    overlay.appendChild(card);
    document.documentElement.appendChild(overlay);
  }
})();
