# ONE — Browser Extension Architecture (Manifest V3)

## 1. Overview & Objectives
The ONE Browser Extension acts as a companion enforcement bridge for the ONE Intentional Attention Platform. It intercepts navigations to habitual distraction domains (e.g. social feeds, video loops) and renders the **Intent Firewall Overlay** directly in the browser tab.

---

## 2. Manifest V3 Technical Specifications

```
+-------------------------------------------------------------------------------+
|                             CHROME / EDGE BROWSER                             |
+-------------------------------------------------------------------------------+
|  Active Tab: https://youtube.com                                              |
|  +-------------------------------------------------------------------------+  |
|  |             ONE INTENT FIREWALL OVERLAY (Injected Content Script)       |  |
|  |  "WAIT. You said: Finish MVP Architecture. 42 minutes remain."         |  |
|  |  [ I got distracted ]  [ I have a specific reason ]  [ Emergency Exit ] |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
       ^                                                 |
       | chrome.tabs.sendMessage                         | chrome.runtime.sendMessage
       v                                                 v
+-------------------------------------------------------------------------------+
|                   MV3 BACKGROUND SERVICE WORKER (background.js)               |
|  - declarativeNetRequest / webNavigation listeners                            |
|  - Active session state & exception pass timers                               |
|  - Inter-tab synchronization via chrome.storage.local                         |
+-------------------------------------------------------------------------------+
```

### 2.1 Manifest Configuration
* **Manifest Version:** 3
* **Permissions:**
  * `storage`: Persists active intention, focus status, and granted exception passes.
  * `alarms`: High-precision timer alarms for exception pass expiry (independent of service worker idling).
  * `declarativeNetRequestWithHostAccess` or `webNavigation`: Mindful navigation interception.
* **Host Permissions:**
  * Configurable domain list (e.g. `*://*.instagram.com/*`, `*://*.youtube.com/*`, `*://*.reddit.com/*`, `*://*.x.com/*`).

---

## 3. Communication Protocol

### 3.1 Extension Background to Web App Bridge
The web app and the extension communicate via standard `window.postMessage` with origin validation or `chrome.runtime.sendMessage(EXTENSION_ID, ...)`:

```typescript
interface ExtensionBridgeMessage {
  type: 'ONE_SYNC_SESSION';
  payload: {
    sessionId: string;
    goalTitle: string;
    targetDurationMinutes: number;
    protectionLevel: number;
    endsAt: number;
    exceptionPass: {
      active: boolean;
      expiresAt: number;
      reason: string;
    } | null;
  };
}
```

---

## 4. Intentional Exception Pass Protocol
When the user requests an intentional exception (e.g., "Search API documentation" for 2 minutes):
1. Content script sends `GRANT_EXCEPTION` message to background worker.
2. Background worker registers a temporary alarm via `chrome.alarms.create('exception_expiry', { delayInMinutes: 2 })`.
3. Background worker temporarily relaxes DNR interception rules for the specified domain.
4. When the alarm triggers, background worker reactivates the Intent Firewall and injects a gentle reminder: *"Exception pass ended. Return to your goal?"*

---

## 5. Security & Privacy Guarantees
* **Zero Browsing History Telemetry:** The extension never records, logs, or exports URLs visited. It only tests domain names against user-defined block patterns locally in memory.
* **No Content Scraping:** Content scripts are strictly scoped to firewall overlay rendering; they never inspect page text, cookies, passwords, or input fields.
