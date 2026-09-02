# ONE — Platform Capabilities & Reality Matrix

> **Core Rule:** Clearly distinguish what is IMPLEMENTED, what is BEST-EFFORT, what is a BROWSER LIMITATION, what is NOT IMPLEMENTED, and what is reserved for FUTURE evaluation. Never describe browser-level interception as OS-level blocking.

---

## 1. Explicit Status Classification

### [IMPLEMENTED] Web Application Core
* **Goal & Intention Management:** "What matters right now?", duration chips (15m–90m + custom), and Protection Levels 1 to 5.
* **Deterministic Focus Engine:** State machine with wall-clock delta reconciliation (`Math.max(0, floor(now - startedAt - nonFocusMs)/1000)`), surviving tab backgrounding, OS sleep, and laptop lid closing.
* **Session Crash & Reload Recovery:** Auto-persists active session snapshot to `localStorage`; presents recovery modal on reload with options to resume, record deliverable, or discard cleanly.
* **In-App Intent Firewall:** Contextual dialogue ("WAIT. You committed to: [Goal]") with 3 pathways (distraction recovery, timed exception passes, emergency exit).
* **Distraction Inbox:** Zero-friction cognitive offloading (hotkey: `S` or `Cmd/Ctrl+K`) with live search, active/archived tabs, inline editing, and restoration.
* **Focus Rescue:** Compassionate mid-day reset with zero guilt and no streak punishments.
* **User-Reported Deliverables:** Completed outcome recording and focus quality rating (`Deep`, `Moderate`, `Distracted`).
* **Local Attention Dashboard:** Intentional minutes, deep focus, recovery latency speed, and personal focus profile.
* **100% On-Device Storage & Privacy:** Zero external network calls (no CDNs, no tracking, no cloud telemetry), local Dexie IndexedDB storage, full JSON export, import with anti-corruption sanitization, and wipe.
* **Procedural Acoustic Synthesis:** Web Audio API procedural sine/triangle transition cues and binaural focus tone (zero remote audio files).

---

### [IMPLEMENTED] Companion Browser Extension (Manifest V3)
* **Secure Web-to-Extension Bridge:** Origin-validated `window.postMessage` bridge with strict schema type and boundary checks.
* **Extension XSS Immunity:** 100% safe DOM construction (`document.createElement` + `textContent`) with zero `innerHTML`.
* **Universal Level 4 Allow-List Enforcement:** Runs at `document_start` across `<all_urls>`, blocking non-whitelisted domains (including previously unlisted sites like `news.ycombinator.com`, `cnn.com`) while exempting the ONE app origin and configured reference domains.
* **Level 5 Hard Lock:** Strict allow-list enforcement with no normal exception UI exposed.
* **Timed Exception Lifecycle:** Strictly bounded to 2m or 5m durations via `chrome.alarms`, auto-expiring with immediate protection restoration.
* **Fail-Safe Cleanup:** When no session is active or when a session completes/cancels, all blocking is immediately removed.

---

### [BEST-EFFORT]
* **Background Timer Precision:** While elapsed focus math is mathematically exact upon tab refocus, browser background tab throttling may reduce visual tick frequency from 1Hz to ~0.1Hz while the tab is hidden.
* **Offline AI Focus Coach:** Implemented as deterministic, 100% local heuristic goal-sharpening rules with zero cloud dependency.

---

### [BROWSER LIMITATION]
* **Tab Scope Only:** The browser extension operates strictly within Chrome/Edge web tabs. It cannot monitor, detect, or block external native desktop applications (e.g. Slack desktop, Discord app, Steam, or Spotify).
* **Protected Internal Browser Pages:** Chrome security policy strictly prohibits content scripts or declarativeNetRequest on internal pages (`chrome://`, `chrome-extension://`, Chrome Web Store).

---

### [NOT IMPLEMENTED / EXPLICIT NON-GOALS FOR BETA]
* **Native Desktop Blocking (Tauri / Electron):** Excluded from V1 to validate browser-level focus habits before introducing OS-level drivers.
* **Social / Friends / Focus Together:** Excluded. Attention reclamation begins as an individual, introspective practice; social feeds often reintroduce comparison and distraction.
* **Gamification / Streaks:** Intentionally rejected. Streaks introduce shame and despair when broken, conflicting with ONE's core "No shame. Ever." principle.
* **Cloud Analytics Backend:** Excluded. All analytics remain strictly on-device to ensure total privacy sovereignty.
* **External AI Model Dependencies:** Excluded. No LLM API calls or cloud servers are used.

---

### [FUTURE EVALUATION]
* **Tauri Desktop Wrapper:** Under evaluation for post-beta consideration to provide foreground window awareness via official OS accessibility APIs without invasive surveillance.
* **Mobile Screen Time / FamilyControls Integration:** Potential future integration for iOS/Android when mobile native apps are developed.
