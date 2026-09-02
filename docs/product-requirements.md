# ONE — Product Requirements Document (PRD)

## 1. Product Overview
* **Name:** ONE
* **Tagline:** One thing. Right now.
* **Category:** Intentional Attention
* **Target Users:** Knowledge workers, developers, students, founders, creators, freelancers (ages 18–35) seeking freedom from compulsive digital fragmentation.

---

## 2. Core Functional Requirements

### FR-01: Onboarding & Philosophy Setup
* Minimal 3-step walkthrough introducing the philosophy: *Intent over restriction*, *No shame*, and *Outcomes over screen time*.
* Zero mandatory account creation; immediate local initialization.

### FR-02: Intention Entry ("What matters right now?")
* Instant focus on app launch. Prompt: *"What matters right now?"*
* Support for quick presets (e.g. *Study DSA*, *Build my startup*, *Write article*, *Finish presentation*, *Exercise*).
* Protection Duration Selector: 15m, 25m, 45m, 60m, 90m, or Custom.
* Protection Level Selector:
  * Level 1: Reminder (*Are you sure?*)
  * Level 2: Friction (Short intentionality prompt & 5-second pause)
  * Level 3: Protected (Temporarily blocks distraction; allows intentional passes)
  * Level 4: Deep Focus (Allow-list only)
  * Level 5: Hard Lock (Strict enforcement)

### FR-03: ONE THING MODE (Focus Engine)
* Serene, distraction-free active workspace.
* Core Elements:
  * Primary Goal display in high-legibility typography.
  * Live countdown timer with circular progress arc.
  * Gentle, non-intrusive breathing ambient pulse.
  * Audio tone toggle (calm harmonic chime on start/end, synthesized pink/focus noise).
  * Quick-access action buttons: *Save for Later*, *Intentional Break*, *Rescue Me*, *End Session*.

### FR-04: Intent Firewall & Mindful Interception
* Intercepts drift attempts during active sessions.
* Copy: *"WAIT. You said: [Goal]. [XX] minutes remain. What happened?"*
* Three structured pathways:
  1. **"I got distracted"**: Compassionate acknowledgement (*"You drifted. Come back."*), logs recovery time, returns immediately to active focus.
  2. **"I have a specific reason"**: Intentional Exception pass. User selects intent (*Search documentation*, *Watch specific video*, *Reply to urgent message*, *Other*). Grants a 2-minute or 5-minute timed pass with a persistent countdown banner.
  3. **"Emergency"**: Graceful early exit with zero shame and no streak penalties.

### FR-05: Distraction Inbox ("Save for Later")
* Cognitive offloading buffer accessible via hotkey (`Cmd/Ctrl + K` or `S`) or button.
* Allows instant jotting of random intrusive thoughts without context switching.
* Stored locally in user's Distraction Inbox for review after the session.

### FR-06: Distraction Recovery Engine
* Measures:
  * Distraction attempt count.
  * Time between drift trigger and return to focus (Recovery Latency).
  * Frequency of specific triggers.
* Calculates recovery improvements (e.g., *"You return to focus 2.5× faster this week"*).

### FR-07: Focus Rescue ("Rescue Me")
* For users who have experienced severe procrastination or lost control of their day.
* Empathetic messaging: *"You haven't lost the day. What needs your attention now?"*
* Immediate clean reset with 30m, 45m, or 60m options. Zero guilt.

### FR-08: Intentional Breaks
* User-controlled pauses: 5, 10, or 15 minutes.
* Distinct break timer with peaceful visual tone.
* Prompts return at expiration: *"Break finished. Return to your goal?"*

### FR-09: Session Completion & Outcome Capture
* Triggers celebratory harmonic chime.
* Prompt: *"What did you accomplish?"*
* Captures actual deliverables (e.g. *"Completed authentication architecture"*) alongside focus quality rating (Deep, Moderate, Fragmented).

### FR-10: Attention Dashboard & Personal Focus Profile
* Metrics displayed:
  * Total Intentional Time.
  * Deep Focus Duration.
  * Recovered Attention Time.
  * Average Recovery Speed (seconds).
  * Completed Outcomes list.
* Focus Profile:
  * Strongest focus windows (e.g. 8:00–11:00 AM).
  * Average deep session duration.
  * Most common triggers & effective intervention levels.
  * Strictly non-judgmental, labeled as observations/inferences.

---

## 3. Non-Functional Requirements

### NFR-01: Privacy & Zero Surveillance
* 100% on-device local storage by default (IndexedDB / Dexie).
* No third-party tracking scripts, analytics beacons, or attention harvesting.
* Full local data export (JSON) and one-click data destruction.

### NFR-02: Performance & Latency
* Initial paint < 300ms.
* Zero CPU overhead in background (< 0.1% idle).
* Web Worker background timer to eliminate tab throttling.

### NFR-03: Accessibility & Design
* WCAG 2.1 AA compliance.
* Full keyboard navigation support (`Space` to toggle, `Esc` for modal dismiss, `Cmd+K` for inbox).
* High-contrast color tokens and respect for `prefers-reduced-motion`.

### NFR-04: Extensibility
* Modular architecture decoupling the Core Focus Engine from Platform Enforcement bridges (Web, Browser Extension, Electron/Tauri, Mobile OS).
