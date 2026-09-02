# ONE — Browser Extension Architecture (Manifest V3)

## 1. Overview & Objectives
The ONE Browser Extension acts as a companion enforcement bridge for the ONE Intentional Attention Platform. It intercepts navigations to habitual distraction domains and renders the **Intent Firewall Overlay** directly in the browser tab.

---

## 2. Manifest V3 Technical Specifications

```
+-------------------------------------------------------------------------------+
|                             CHROME / EDGE BROWSER                             |
+-------------------------------------------------------------------------------+
|  Active Tab: https://news.ycombinator.com or https://youtube.com              |
|  +-------------------------------------------------------------------------+  |
|  |             ONE INTENT FIREWALL OVERLAY (Injected Content Script)       |  |
|  |  "WAIT. You committed to: Complete Distributed Consensus."               |  |
|  |  [ I got distracted — Return ]  [ I have a specific reason (2m pass) ]  |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
       ^                                                 |
       | chrome.tabs.sendMessage                         | chrome.runtime.sendMessage
       v                                                 v
+-------------------------------------------------------------------------------+
|                   MV3 BACKGROUND SERVICE WORKER (background.js)               |
|  - Active session state & exception pass timers via chrome.alarms             |
|  - Inter-tab synchronization via chrome.storage.local & broadcastToTabs       |
|  - Stale session detection and unexpired lifecycle recovery                   |
+-------------------------------------------------------------------------------+
```

### 2.1 Manifest Configuration
* **Manifest Version:** 3
* **Permissions:**
  * `storage`: Persists active intention, focus status, and granted exception passes across service-worker sleep cycles.
  * `alarms`: High-precision timer alarms for exception pass expiry (independent of service worker idling).
  * `tabs`: Required to query open tabs and broadcast lifecycle events (`SESSION_ENDED`, `EXCEPTION_EXPIRED`, `EXCEPTION_GRANTED`).
* **Host Permissions:**
  * `<all_urls>`: Required specifically to enforce Level 4 (Deep Focus) and Level 5 (Hard Lock) allow-list protection. When Level 4 or 5 is active, ANY arbitrary domain not on the user's allowed reference list must have `content.js` injected at `document_start` to display the Intent Firewall. When no session is active or when Level 1–3 is active, neutral domains are completely unblocked and unaffected.

---

## 3. Communication Protocol & Security Hardening

### 3.1 Web App to Extension Bridge (`bridge.js` & `extensionBridge.ts`)
The web app and the extension communicate via `window.postMessage` with multiple layers of defense:
1. **Origin Verification:** `bridge.js` only activates on trusted ONE application origins (`localhost`, `127.0.0.1`, `*.github.io`) and rejects messages where `event.origin !== window.location.origin`.
2. **Schema & Boundary Validation:** `validatePayload` enforces strict types:
   * `sessionId`: String, alphanumeric/hyphen/underscore, max 100 characters.
   * `protectionLevel`: Integer from 1 to 5.
   * `targetDurationSeconds`: Integer from 1 to 86,400 (up to 24 hours).
   * `startedAt`: Epoch timestamp bounded within reasonable range (pre-2020 or future > 1m rejected).
   * `allowedDomains` & `interceptDomains`: Bounded arrays (max 500 items, each domain $\le 253$ characters).
   * `appOrigin`: Must strictly match `window.location.origin`.
3. **Stale Session Protection:** The background worker checks timestamps to guarantee older sessions cannot overwrite newer sessions, and stale cleanup signals cannot terminate newer sessions.

---

## 4. XSS Immunity & Safe DOM Construction
* **Zero `innerHTML`:** `extension/content.js` completely avoids `innerHTML` assignments for all user-controlled data.
* **Safe DOM APIs:** The overlay is constructed using `document.createElement()`, CSS inline properties, and `element.textContent = session.intentionTitle`. Hostile strings containing `<img src=x onerror=alert(1)>` or `<script>` tags render purely as literal text and cannot execute.

---

## 5. Intentional Exception Lifecycle
When the user requests an intentional exception (e.g. 2 minutes for API reference lookup):
1. Content script sends `GRANT_EXCEPTION` message with a bounded duration (only 2m or 5m permitted).
2. Background worker validates that an active unexpired session exists, creates `exceptionPass`, and schedules an alarm via `chrome.alarms.create('exception_expiry', { delayInMinutes: duration })`.
3. Broadcasts `EXCEPTION_GRANTED` to all open tabs to immediately remove overlays.
4. When the alarm triggers, `exceptionPass` is cleared and `EXCEPTION_EXPIRED` is broadcast to all tabs, immediately restoring Intent Firewall protection.
5. When the focus session completes or is discarded, `cleanupAllState()` removes all active passes and cancels all alarms.

---

## 6. Explicit Platform Scope & Boundaries
* **Browser-Level Only:** The ONE browser extension operates exclusively within Chrome/Edge browser tabs. It cannot monitor or block external native desktop operating system applications (e.g., Slack desktop, Steam, Discord app).
* **Zero Browsing Telemetry:** The extension never records, logs, or transmits browsing history or URLs visited. Domain checks occur purely in memory.
