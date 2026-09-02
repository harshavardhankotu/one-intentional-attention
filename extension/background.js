// ONE — Background Service Worker (Manifest V3)
// Secure session synchronization, stale session rejection, and exception lifecycle

chrome.runtime.onInstalled.addListener(() => {
  console.log('ONE Extension: Background worker initialized.');
  cleanupAllState();
});

chrome.runtime.onStartup.addListener(() => {
  // On browser restart, purge any stale/expired session
  chrome.storage.local.get(['activeSession', 'exceptionPass'], (data) => {
    if (data.activeSession) {
      const now = Date.now();
      const expiresThreshold = data.activeSession.startedAt + data.activeSession.targetDurationSeconds * 1000 + 3600000;
      if (now > expiresThreshold) {
        console.log('ONE Extension: Purging expired session on startup.');
        cleanupAllState();
      }
    }
  });
});

function cleanupAllState() {
  chrome.storage.local.set({
    activeSession: null,
    exceptionPass: null
  });
  chrome.alarms.clear('exception_expiry');
  broadcastToTabs({ type: 'SESSION_ENDED' });
}

function broadcastToTabs(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {});
      }
    });
  });
}

// Listen for alarms (e.g. exception pass expiration)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'exception_expiry') {
    chrome.storage.local.set({ exceptionPass: null }, () => {
      broadcastToTabs({ type: 'EXCEPTION_EXPIRED' });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. Session Synchronization from ONE Web App Bridge
  if (message.type === 'ONE_SYNC_SESSION') {
    const payload = message.payload;

    // Cleanup signal
    if (!payload || !payload.isActive) {
      chrome.storage.local.get(['activeSession'], (current) => {
        // If specific sessionId provided in cleanup, verify it matches
        if (payload?.sessionId && current.activeSession && current.activeSession.sessionId !== payload.sessionId) {
          console.warn('ONE Extension: Ignored stale session cleanup request.');
          sendResponse({ status: 'ignored_stale' });
          return;
        }

        cleanupAllState();
        sendResponse({ status: 'cleared' });
      });
      return true;
    }

    // Active session update: Freshness & Stale-check
    chrome.storage.local.get(['activeSession'], (current) => {
      const existing = current.activeSession;

      // Prevent an older session from overwriting a newer session
      if (existing && existing.sessionId !== payload.sessionId && payload.startedAt < existing.startedAt) {
        console.warn('ONE Extension: Rejected older session update.');
        sendResponse({ status: 'rejected_older_session' });
        return;
      }

      // Check session has not already completely expired
      const sessionMaxLife = payload.startedAt + payload.targetDurationSeconds * 1000 + 7200000;
      if (Date.now() > sessionMaxLife) {
        console.warn('ONE Extension: Rejected already expired session.');
        cleanupAllState();
        sendResponse({ status: 'rejected_expired' });
        return;
      }

      chrome.storage.local.set(
        {
          activeSession: payload,
          exceptionPass: payload.exceptionPass || null
        },
        () => {
          if (payload.exceptionPass?.expiresAt && payload.exceptionPass.expiresAt > Date.now()) {
            const delayMinutes = Math.max(0.1, (payload.exceptionPass.expiresAt - Date.now()) / 60000);
            chrome.alarms.create('exception_expiry', { delayInMinutes: delayMinutes });
          } else {
            chrome.alarms.clear('exception_expiry');
          }

          broadcastToTabs({ type: 'SESSION_UPDATED', session: payload });
          sendResponse({ status: 'synced' });
        }
      );
    });
    return true;
  }

  // 2. Query Current Status
  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get(['activeSession', 'exceptionPass'], (result) => {
      sendResponse({
        activeSession: result.activeSession || null,
        exceptionPass: result.exceptionPass || null
      });
    });
    return true;
  }

  // 3. Grant Exception Request
  if (message.type === 'GRANT_EXCEPTION') {
    chrome.storage.local.get(['activeSession'], (data) => {
      const session = data.activeSession;
      if (!session || !session.isActive) {
        sendResponse({ status: 'error', reason: 'No active session' });
        return;
      }

      // Validate duration: Only 2 minutes or 5 minutes permitted by product configuration
      const durationMinutes = Number(message.durationMinutes);
      if (durationMinutes !== 2 && durationMinutes !== 5) {
        sendResponse({ status: 'error', reason: 'Invalid duration. Only 2m or 5m allowed.' });
        return;
      }

      // Validate reason: string bounded to 200 chars
      const rawReason = typeof message.reason === 'string' ? message.reason.trim() : 'Intentional Exception';
      const cleanReason = rawReason.slice(0, 200) || 'Intentional Exception';

      const expiresAt = Date.now() + durationMinutes * 60 * 1000;
      const pass = {
        active: true,
        expiresAt,
        reason: cleanReason
      };

      chrome.storage.local.set({ exceptionPass: pass }, () => {
        chrome.alarms.create('exception_expiry', { delayInMinutes: durationMinutes });
        broadcastToTabs({ type: 'EXCEPTION_GRANTED', pass });
        sendResponse({ status: 'granted', pass });
      });
    });
    return true;
  }

  return false;
});
