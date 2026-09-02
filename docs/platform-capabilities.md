# ONE — Platform Capabilities & Reality Matrix

> **Rule:** Never invent capabilities or pretend an OS API exists when it does not. Document official APIs, limits, and realistic architectural abstractions.

---

## Tiered Capability Classification

### 1. AVAILABLE NOW (Web & PWA Core)
* **Goal & Intention Management:** "What matters right now?", duration chips, and Protection Levels (1–5).
* **Deterministic Focus Engine:** Formal state machine with absolute timestamp-anchored timer (resilient to tab switching, computer sleep, and lid closing).
* **Session Crash & Reload Recovery:** Automatic detection and recovery prompt if the browser reloads or crashes mid-session.
* **In-App Intent Firewall:** Contextual dialogues ("WAIT. You said: [Goal]") with 3 pathways (distraction recovery, timed intentional exception passes, emergency exit).
* **Distraction Inbox:** Zero-friction cognitive offloading (hotkey: `S` or `Cmd/Ctrl+K`) with item editing and archiving.
* **Focus Rescue:** Compassionate mid-day reset with zero guilt and no streak punishments.
* **Completed Outcomes Capture:** User-reported deliverable recording and focus quality rating.
* **Local Attention Dashboard:** Intentional time, deep focus, recovery latency speed, and personal focus profile.
* **100% On-Device Privacy:** Zero external network calls (no Google Fonts, no telemetry, no CDNs), full JSON export, import, and wipe.
* **Procedural Audio Cues:** Gentle synthesized sine/triangle cues and binaural focus tone.

---

### 2. POSSIBLE WITH BROWSER EXTENSION (Manifest V3 Proof-of-Concept Created)
* **Domain Navigation Interception:** Intercepting attempts to navigate to distracting websites (YouTube, Instagram, Reddit, X/Twitter).
* **In-Page Intent Firewall Overlay:** Injecting the "WAIT." modal directly over blocked web content.
* **Timed Exception Passes:** Temporarily allowing access to a specific site for 2–5 minutes via `chrome.alarms`.
* **Cross-Tab Synchronization:** Sharing active intention across all open tabs via `chrome.storage.local`.

---

### 3. POSSIBLE WITH DESKTOP WRAPPER (Tauri / Electron)
* **Foreground Window Detection:** Identifying when the user switches to non-browser desktop apps via Win32 `GetForegroundWindow` or macOS Accessibility API.
* **System Tray & Global Shortcuts:** Global hotkey (`Cmd/Ctrl+Shift+O`) to summon ONE from anywhere.
* **OS Focus Mode Integration:** Triggering Windows Focus Assist or macOS Do Not Disturb.

---

### 4. POSSIBLE WITH MOBILE OS APIs
* **iOS (Screen Time API / FamilyControls):** Shielding designated application categories during active sessions. Requires Apple Family Controls entitlement.
* **Android (UsageStatsManager & AccessibilityService):** Detecting foreground package switches and presenting overlay windows. Requires explicit user permission in Android Accessibility settings.

---

### 5. NOT POSSIBLE / RESTRICTED
* **Silent Background Takeover:** Browsers and operating systems will never permit an app to forcibly close other applications without user permission.
* **Circumvention of OS Sandboxing:** iOS does not allow arbitrary third-party code injection into other apps.
* **Keystroke Logging / Universal Surveillance:** Restricted by platform security models (and fundamentally opposed to ONE's Privacy by Design principle).
