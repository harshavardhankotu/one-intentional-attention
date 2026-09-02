# ONE — Intentional Attention Platform

> **"One thing. Right now."**
> Category: **Intentional Attention**
> Production Application: **[https://harshavardhankotu.github.io/one-intentional-attention/](https://harshavardhankotu.github.io/one-intentional-attention/)**
> GitHub Repository: **[harshavardhankotu/one-intentional-attention](https://github.com/harshavardhankotu/one-intentional-attention)**
> Release Version: **v1.0.0**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Quality Gate](https://img.shields.io/badge/Quality_Gate-75_Tests_Passing-emerald.svg)](#test-suite)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_On--Device-emerald.svg)](#privacy-architecture)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)

---

## 1. What is ONE?

People increasingly struggle to maintain attention because digital environments are engineered to continuously interrupt, stimulate, and redirect them.

Existing products primarily approach this through **app blocking**, **screen-time surveillance**, and **punitive streaks**. But hard restrictions provoke resentment and bypasses, while screen-time tracking measures passive desk presence rather than meaningful intention.

**ONE** organizes focus around a fundamental concept: **INTENTION**.

### Core Philosophy
1. **Intent Over Restriction:** *"You chose this goal. Let's protect it."* Shields, not digital prisons.
2. **User Autonomy:** The user remains in control. ONE introduces intentional friction, never imprisonment.
3. **No Shame. Ever:** Distraction is not a moral failure. Never: *"You failed"* or *"Your streak is broken"*. Instead: *"You drifted. Come back? What matters right now?"*
4. **Outcomes Over Screen Time:** Measure tangible user-reported deliverables and recovery latency rather than raw device presence.
5. **Calm Computing:** Monochromatic surfaces, high breathing room, and zero visual clutter.
6. **Privacy by Design:** 100% of session data, recovery logs, and stray thoughts stay locally in your browser's IndexedDB. Zero tracking beacons.
7. **Evidence Before Gimmicks:** Grounded in cognitive psychology (Gloria Mark attention switching, Riedel et al. PNAS 2023 friction studies, and the Zeigarnik effect).

---

## 2. Platform Capabilities & Status Matrix

| Area / Feature | Status | Description |
| :--- | :--- | :--- |
| **Intention Prompt** | `IMPLEMENTED` | Goal definition with 1-click presets and offline heuristic goal sharpener. |
| **ONE THING MODE** | `IMPLEMENTED` | Circular SVG countdown ring, ambient focus pulse, and focus controls. |
| **Precision Focus Engine** | `IMPLEMENTED` | Wall-clock delta reconciliation surviving background tab throttling and OS sleep. |
| **Session Crash & Reload Recovery** | `IMPLEMENTED` | Snapshot persistence to `localStorage` with prompt to resume, record deliverable, or discard. |
| **Intent Firewall Modal** | `IMPLEMENTED` | Contextual prompt offering immediate return, controlled timed exception, or emergency exit. |
| **Distraction Inbox** | `IMPLEMENTED` | Zero-friction cognitive offloading buffer (`S` or `Cmd/Ctrl+K`) with live search and archiving. |
| **Focus Rescue** | `IMPLEMENTED` | Empathetic mid-day reset (*"Rescue Me"*) with zero guilt and no broken streaks. |
| **User-Reported Deliverables** | `IMPLEMENTED` | Outcome recording (*"What did you accomplish?"*) and focus rating (`Deep`, `Moderate`, `Distracted`). |
| **Attention Dashboard** | `IMPLEMENTED` | Local analytics for intentional minutes, deep focus, recovery speed, and completed deliverables. |
| **Data Sovereignty** | `IMPLEMENTED` | Full JSON backup export, import with anti-corruption validation, and one-click database wipe. |
| **Procedural Audio Cues** | `IMPLEMENTED` | Web Audio API procedural sine/triangle transition chimes and binaural focus masking. |
| **Companion Browser Extension** | `IMPLEMENTED` | Manifest V3 extension with origin-validated bridge, safe DOM construction (zero `innerHTML`), and allow-list checking. |
| **Level 4 (Deep Focus)** | `IMPLEMENTED` | Universal allow-list browser protection across all URLs at `document_start`. |
| **Level 5 (Hard Lock)** | `IMPLEMENTED` | Universal allow-list browser protection with no normal exception pass UI. |
| **PWA Offline Support** | `IMPLEMENTED` | Cache-first service worker caching core assets and app shell with scope-relative paths. |
| **Native Desktop App Blocking** | `NOT IMPLEMENTED` | Excluded from V1. The browser extension operates **strictly within browser tabs** and does **NOT** block native desktop applications (Slack, Discord, Steam). |
| **Social / Focus Together** | `NOT IMPLEMENTED` | Excluded. Focus begins as an individual practice; social feeds reintroduce distraction. |
| **Gamification / Streaks** | `NOT IMPLEMENTED` | Intentionally rejected to prevent shame from broken streaks. |
| **Cloud Analytics / Telemetry** | `NOT IMPLEMENTED` | Excluded. 100% of data remains local. |
| **Tauri Desktop Wrapper** | `FUTURE` | Under evaluation for post-beta consideration using official OS accessibility APIs without invasive surveillance. |

---

## 3. Protection Levels (1 to 5)

* **Level 1 (Reminder):** Gentle *"Are you sure?"* prompt when visiting recognized distraction domains.
* **Level 2 (Friction):** 5-second deliberate countdown delay before action buttons become clickable.
* **Level 3 (Protected):** Standard Intent Firewall intercept for habitual distraction domains (YouTube, Reddit, Instagram, X/Twitter, etc.) with 2m/5m exception passes.
* **Level 4 (Deep Focus):** Strict allow-list mode across arbitrary websites (including unlisted sites like news or blogs). Only configured reference sites (e.g. `github.com`, `docs.python.org`) and the ONE app origin remain accessible.
* **Level 5 (Hard Lock):** Strict allow-list mode with no normal exception button exposed.

---

## 4. Privacy & Security Architecture

* **Zero External HTTP Requests:** Production builds make **0** external network requests.
* **Zero Third-Party CDNs:** Uses system font stack and bundled local SVGs (no Google Fonts, no external script tags).
* **Zero Telemetry / Trackers:** No Google Analytics, no Mixpanel, no Sentry, no tracking beacons.
* **Local Storage:** All intentions, sessions, drift events, thoughts, and outcomes are saved exclusively inside your browser's IndexedDB (`OneAttentionDB`) and `localStorage`.
* **Extension Trust Boundary:** The extension bridge only activates on `localhost`, `127.0.0.1`, and the exact production origin `https://harshavardhankotu.github.io/one-intentional-attention/`.
* **XSS Immunity:** The extension content script uses 100% safe DOM APIs (`document.createElement` + `textContent`) with zero `innerHTML` interpolation.

---

## 5. Getting Started & Local Development

### Prerequisites
* Node.js v18+ (tested on Node v20/v22)
* npm v9+

### Installation
```bash
git clone https://github.com/harshavardhankotu/one-intentional-attention.git
cd one-intentional-attention
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

### Run Automated Tests (75 Tests / 14 Suites)
```bash
npm test
```

### Build Production Bundle
```bash
npm run build
```
The production bundle is compiled to `dist/` with base path `/one-intentional-attention/`.

---

## 6. Installing the Companion Browser Extension

The companion extension provides browser-level Intent Firewall enforcement across open tabs.

### Manual Installation (Developer Mode):
1. Package the extension:
   ```bash
   npm run package:extension
   ```
   This generates a clean distribution folder at `dist-extension/` and a release archive `dist-extension/one-intentional-attention-extension-v1.0.0.zip`.
2. Open Google Chrome or Microsoft Edge and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `dist-extension/` folder (or extract the release ZIP and select that folder).
5. The ONE Intentional Attention extension icon will appear in your extension toolbar.
6. Open the ONE web app at `https://harshavardhankotu.github.io/one-intentional-attention/` and start a focus session. The extension will automatically synchronize state.

> **Note:** The extension is currently distributed as an open-source unpacked extension and is not automatically published to the Chrome Web Store.

---

## 7. License

MIT License. See [LICENSE](LICENSE) for details.
