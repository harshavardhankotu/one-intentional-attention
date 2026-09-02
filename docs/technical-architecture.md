# ONE — Technical Architecture

## 1. Architectural Philosophy
ONE is architected as a **Local-First, High-Performance, Calm-Computing Platform**.
* **Zero Latency:** User interactions must respond in < 16ms (60 FPS minimum).
* **Local-First Privacy:** All intention data, telemetry, and stray thoughts remain strictly client-side.
* **Platform Independence:** Decoupled Core Focus Engine with clean adapter interfaces for Web, Browser Extensions, Desktop (Tauri/Electron), and Mobile.

---

## 2. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                                ONE UI LAYER                             |
|  (React 19, TypeScript, Tailwind CSS, Lucide Icons, Calm Design Tokens) |
+-------------------------------------------------------------------------+
       |                                              |
       v                                              v
+-----------------------+                    +----------------------------+
|  FOCUS ENGINE CORE    |                    |  INTENT FIREWALL &         |
|  - State Machine      |                    |  RECOVERY SERVICE          |
|  - Web Worker Timer   |                    |  - Interception Dialog     |
|  - Web Audio Engine   |                    |  - Intentional Exceptions  |
+-----------------------+                    |  - Latency Measurement     |
       |                                     +----------------------------+
       |                                              |
       +--------------------+    +--------------------+
                            |    |
                            v    v
       +--------------------------------------------------+
       |           LOCAL STORAGE REPOSITORY               |
       |      (IndexedDB via Dexie.js + Fallback)         |
       |  - Intentions, Sessions, Outbox, Analytics       |
       +--------------------------------------------------+
                            |
                            v
       +--------------------------------------------------+
       |          PLATFORM INTEGRATION BRIDGE             |
       |  - Web / PWA Standalone Mode                     |
       |  - Browser Extension Bridge (Manifest V3)        |
       |  - OS / Desktop Daemon Hook (Tauri / Electron)   |
       +--------------------------------------------------+
```

---

## 3. Core Engine State Machine

The session lifecycle is modeled as a deterministic finite state machine (FSM):

```
       [IDLE]
         | (START_SESSION)
         v
    [FOCUSING] <------------------------+
      |      |                          |
      |      | (INTENT_INTERCEPT)       | (RESUME / RECOVER)
      |      v                          |
      |   [INTERCEPTED] ----------------+
      |      | (GRANT_EXCEPTION)
      |      v
      |   [EXCEPTION_PASS] (Timed Pass: 2m/5m)
      |      | (PASS_EXPIRED)
      |      +------------------------->+
      |
      | (TAKE_BREAK)
      v
   [BREAK]
      | (END_BREAK)
      v
    [FOCUSING]
      |
      | (TIMER_COMPLETE / EARLY_FINISH)
      v
  [COMPLETING] -> (SUBMIT_OUTCOME) -> [OUTCOME_RECORDED] -> [IDLE]
```

---

## 4. Key Subsystems

### 4.1 Precision Timer Engine (Web Worker)
* In standard browser environments, `setInterval` and `setTimeout` are heavily throttled in background tabs (often clamped to once every 1–60 seconds).
* ONE uses a dedicated Web Worker timer tick running in a background thread, dispatching high-precision millisecond delta events to the UI thread regardless of browser tab visibility or window minimization.

### 4.2 Web Audio Harmonic Synthesizer
* Zero external asset dependencies (no loading MP3 files over the network).
* Programmatic synthesis using Web Audio API:
  * **Start Chime:** Dual-sine chord (528 Hz Love/DNA frequency + 660 Hz E5 harmonic, gentle exponential decay).
  * **Drift Nudge:** Gentle woodblock / singing bowl acoustic resonance (396 Hz).
  * **Completion Chime:** Resonant triad (528 Hz, 660 Hz, 792 Hz) signifying triumph without jarring loud sirens.
  * **Ambient Focus Noise:** Optional synthesized pink noise with 0.1Hz modulated low-pass filter to simulate ocean breathing.

### 4.3 Intent Firewall & Recovery Subsystem
* Monitors session state and triggers interruption verification:
  1. Records `interruptionTimestamp = Date.now()`.
  2. Presents the contextual firewall dialog.
  3. If user clicks "I got distracted", calculates `recoveryTime = Date.now() - interruptionTimestamp`.
  4. Persists the recovery metric to local database.

### 4.4 Data Layer (IndexedDB / Dexie)
* Schema versioning with automatic migrations.
* Encrypted JSON backup export and import.
* Tables:
  * `intentions`: Historical goals created.
  * `sessions`: Session logs (duration, intentional time, deep time, status).
  * `driftEvents`: Interception records, triggers, recovery latency.
  * `distractionInbox`: Cognitive offloading items.
  * `completedOutcomes`: Tangible deliverables recorded at session close.
