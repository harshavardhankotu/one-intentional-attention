# ONE — Platform Capabilities & Reality Matrix

> **Rule:** Never invent capabilities or pretend an OS API exists when it does not. Document official APIs, limits, and realistic architectural abstractions.

---

## 1. Operating System & Platform Capabilities

### 1.1 Web & Progressive Web App (PWA) — Current Core Target
* **Capabilities:**
  * High-precision background timers via Web Workers.
  * Web Audio API for harmonic chimes and focus sounds.
  * IndexedDB for massive local storage (> 1GB).
  * System Notification API for session transition nudges.
  * Wake Lock API (`navigator.wakeLock.request('screen')`) to prevent display sleep during ONE THING MODE.
* **Limitations:**
  * Cannot close or block external desktop applications (e.g. native Discord, Telegram, or Steam) directly from a web page without an installed helper or extension.
  * Tab switching can be detected via `document.visibilityState` / `visibilitychange` and `window.onblur`.

### 1.2 Browser Extension (Chrome / Edge / Firefox — Manifest V3)
* **Capabilities:**
  * `chrome.declarativeNetRequest`: High-performance, privacy-preserving blocking or redirecting of distracting domains.
  * `chrome.webNavigation.onBeforeNavigate`: Interception before page loads.
  * Content Script injection: Renders the ONE **Intent Firewall Overlay** directly inside distracting web pages (*"WAIT. You said: [Goal]. 42 minutes remain. What happened?"*).
  * Timed Exception Passes: Temporary rule disablement for 2–5 minutes.
* **Limitations:**
  * Restricted to browser activities; does not block native desktop apps.
  * MV3 background service workers are ephemeral and cannot maintain persistent state in RAM; must rely on `chrome.storage.local` and `chrome.alarms`.

### 1.3 Desktop (Windows & macOS via Tauri / Electron)
* **Capabilities:**
  * Active window tracking via Win32 API (`GetForegroundWindow`) and macOS Accessibility API.
  * System tray integration, global keyboard shortcuts (`Cmd/Ctrl + Shift + O` to open ONE).
  * Focus Assist / Do Not Disturb integration (Windows Focus Assist API, macOS `NSDistributedNotificationCenter`).
* **Limitations:**
  * Requires explicit OS accessibility and automation permissions from the user.
  * Aggressive process killing can cause data loss; ONE prefers foreground window redirection and overlay friction over process termination.

### 1.4 Mobile Platforms (iOS & Android)
* **iOS:**
  * **Official API:** `Screen Time API` (`FamilyControls`, `ManagedSettings`, `DeviceActivity`). Introduced in iOS 16+.
  * **Limitations:** Requires Apple Developer entitlement for Family Controls; strict sandboxing. No custom UI can be rendered inside third-party apps, but `DeviceActivityMonitor` can enforce app shields.
* **Android:**
  * **Official API:** `UsageStatsManager` (detect foreground package), `AccessibilityService` (overlay window insertion), `NotificationListenerService`.
  * **Limitations:** Background battery optimization can kill background services unless battery optimization is disabled; Play Store scrutinizes `AccessibilityService` usage heavily.
