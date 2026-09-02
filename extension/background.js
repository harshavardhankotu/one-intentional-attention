// ONE — Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('ONE Intentional Attention Extension installed.');
  chrome.storage.local.set({
    activeSession: null,
    exceptionPass: null
  });
});

// Listen for alarms (e.g. exception pass expiration)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'exception_expiry') {
    chrome.storage.local.get(['activeSession'], (data) => {
      chrome.storage.local.set({ exceptionPass: null });
      // Notify active tabs that exception has expired
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'EXCEPTION_EXPIRED' }).catch(() => {});
        }
      });
    });
  }
});

// Message listener from web app or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ONE_SYNC_SESSION') {
    chrome.storage.local.set({ activeSession: message.payload }, () => {
      sendResponse({ status: 'synced' });
    });
    return true;
  }

  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get(['activeSession', 'exceptionPass'], (result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === 'GRANT_EXCEPTION') {
    const minutes = message.durationMinutes || 2;
    const expiresAt = Date.now() + minutes * 60 * 1000;
    const pass = { active: true, expiresAt, reason: message.reason || 'Controlled Exception' };

    chrome.storage.local.set({ exceptionPass: pass }, () => {
      chrome.alarms.create('exception_expiry', { delayInMinutes: minutes });
      sendResponse({ status: 'granted', pass });
    });
    return true;
  }
});
