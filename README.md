# ONE — Intentional Attention Platform

> **"One thing. Right now."**  
> Category: **Intentional Attention**

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_On--Device-emerald.svg)](#privacy-by-design)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org)

---

## What is ONE?

People increasingly struggle to maintain attention because digital environments are designed to continuously interrupt, stimulate, and redirect them.

Existing products primarily approach this through **app blocking**, **screen-time surveillance**, and **punitive streaks**. But hard restrictions provoke resentment and bypasses, while screen-time surveillance measures empty desk presence rather than meaningful intention.

**ONE** organizes focus around a fundamental concept: **INTENTION**.

### Core Philosophical Tenets
1. **Intent Over Restriction:** *"You said this matters right now. Let's protect it."*
2. **User Autonomy:** Shields, not digital prisons. Controlled intentional exceptions are always possible.
3. **No Shame:** Distraction is not failure. When you drift: *"You drifted. Come back? Let's restart."*
4. **Outcome Over Screen Time:** We measure tangible deliverables and recovery latency, not passive desk hours.
5. **Minimal Interface:** Calm computing. Monochromatic surfaces, high breathing room, and zero clutter.
6. **Privacy by Design:** 100% of attention telemetry and stray thoughts stay locally in your browser's IndexedDB. Zero tracking beacons.
7. **Evidence Before Gimmicks:** Grounded in cognitive psychology (Gloria Mark attention switching, Riedel et al. PNAS 2023 friction studies, and the Zeigarnik effect).

---

## Features (First Vertical Slice)

* **Intention Prompt:** *"What matters right now?"* — Instant focus capture with duration presets (15m, 25m, 45m, 60m, 90m, custom) and Protection Levels (1 to 5).
* **ONE THING MODE:** Minimalist workspace with countdown timer, circular SVG progress indicator, and subtle ambient breathing pulse.
* **Intent Firewall:** *"WAIT. You said: [Goal]. 42 minutes remain. What happened?"*
  * *I got distracted* → Mindful, non-judgmental return with recovery speed tracking.
  * *I have a specific reason* → 2-minute or 5-minute timed Intentional Exception pass with persistent banner.
  * *Emergency* → Graceful exit without guilt or streak penalties.
* **Distraction Inbox ("Save for Later"):** Cognitive offloading buffer (hotkey: `S` or `Cmd/Ctrl+K`) allowing users to dump stray thoughts without derailing focus.
* **Focus Rescue ("Rescue Me"):** For days where momentum was lost: *"You haven't lost the day. What needs your attention now?"*
* **Session Completion & Outcome Capture:** *"What did you accomplish?"* — Records verified deliverables and focus quality (Deep, Moderate, Fragmented).
* **Attention Dashboard:** Measures Intentional Time, Deep Focus, Recovered Time, Average Recovery Speed (e.g. 38s), and Personal Focus Profiles.
* **Web Audio Harmonic Synthesizer:** Pure synthesized harmonic chimes (528 Hz Love frequency) and calming binaural focus drone.
* **Data Sovereignty:** One-click JSON backup export and instant local database wipe.

---

## Getting Started

### Prerequisites
* Node.js v18+ (tested on Node v22.15.0)
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
Open `http://localhost:3000` in your browser.

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## Documentation
Comprehensive research, architectural blueprints, and design systems are available in the `/docs` directory:
* [Product Requirements](docs/product-requirements.md)
* [Product Principles](docs/product-principles.md)
* [Competitive Analysis](docs/competitive-analysis.md)
* [Behavioral Science Research](docs/behavioral-research.md)
* [Technical Architecture](docs/technical-architecture.md)
* [Platform Capabilities Matrix](docs/platform-capabilities.md)
* [Privacy Model & Ethics](docs/privacy-model.md)
* [Security Model](docs/security-model.md)
* [Data Model Specification](docs/data-model.md)
* [API & Extension Bridge Design](docs/api-design.md)
* [UX Principles & Design Tokens](docs/ux-principles.md)
* [Product Roadmap (Epics 1–12)](docs/roadmap.md)
* [Testing Strategy](docs/testing-strategy.md)
* [Architectural Decision Log (ADR)](docs/decision-log.md)
* [Market Opportunity Research](docs/market-research.md)

---

## License
MIT © Harsha Vardhan Kotu
