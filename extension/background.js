// ONE — Background Service Worker (Manifest V3)
// Deterministic state synchronization, domain policy enforcement, and alarm lifecycle

chrome.runtime.onInstalled.addListener(() => {
  console.log('ONE Intentional Attention Extension installed.');
  chrome.storage.local.set({
    activeSession: null,
    exceptionPass: null
  });
});

// Helper: Broadcast message to all active browser tabs
function broadcastToTabs(message) {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab might not have a content script loaded (e.g. internal chrome:// pages)
        });
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

// Message listener from web app (via bridge.js) or content script (content.js / popup.html)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Session Synchronization from ONE Web Application
  if (message.type === 'ONE_SYNC_SESSION') {
    const payload = message.payload;

    if (!payload || !payload.isActive) {
      // Session finished or cancelled: Fail-safe cleanup
      chrome.storage.local.set({ activeSession: null, exceptionPass: null }, () => {
        chrome.alarms.clear('exception_expiry');
        broadcastToTabs({ type: 'SESSION_ENDED' });
        sendResponse({ status: 'cleared' });
      });
      return true;
    }

    // Active session started or updated
    chrome.storage.local.set(
      {
        activeSession: payload,
        exceptionPass: payload.exceptionPass || null
      },
      () => {
        if (payload.exceptionPass?.expiresAt && payload.exceptionPass.expiresAt > Date.now()) {
          const delayMinutes = Math.max(0.1, (payload.exceptionPass.expiresAt - Date.now()) / 60000);
          chrome.alarms.create('exception_expiry', { delayInMinutes: delayMinutes });
        }
        broadcastToTabs({ type: 'SESSION_UPDATED', session: payload });
        sendResponse({ status: 'synced' });
      }
    );
    return true;
  }

  // Content script querying current active focus state
  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get(['activeSession', 'exceptionPass'], (result) => {
      sendResponse({
        activeSession: result.activeSession || null,
        exceptionPass: result.exceptionPass || null
      });
    });
    return true;
  }

  // Intentional Exception granted directly from content script overlay
  if (message.type === 'GRANT_EXCEPTION') {
    const minutes = message.durationMinutes || 2;
    const expiresAt = Date.now() + minutes * 60 * 1000;
    const pass = {
      active: true,
      expiresAt,
      reason: message.reason || 'Controlled Intentional Exception'
    };

    chrome.storage.local.set({ exceptionPass: pass }, () => {
      chrome.alarms.create('exception_expiry', { delayInMinutes: minutes });
      broadcastToTabs({ type: 'EXCEPTION_GRANTED', pass });
      sendResponse({ status: 'granted', pass });
    });
    return true;
  }

  return false;
});
