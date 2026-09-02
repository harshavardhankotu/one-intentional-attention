# ONE — Product Principles

> **"One thing. Right now."**  
> Category: **Intentional Attention**

These seven principles govern every product, architectural, algorithmic, and UX decision in ONE.

---

## Principle 1 — Intent Over Restriction
* **The Core Premise:** Traditional blockers treat users as adversaries, screaming *"BLOCKED! Access Denied."* This incites psychological reactance and bypass attempts.
* **Our Approach:** We do not say *"Don't use Instagram."* We say: *"You said this matters right now. Let's protect it."*
* **Implementation:** The user's chosen goal is the hero of the interface. When an off-task impulse occurs, the system asks: *"WAIT. You said: [Goal]. 42 minutes remain. What happened?"*

## Principle 2 — User Autonomy
* **The Core Premise:** Digital focus tools must be shields, not digital prisons. Forcing impossible lockouts breeds resentment.
* **Our Approach:** We introduce mindful friction, not permanent entrapment. Intentional exceptions are always permitted with controlled parameters (e.g. 2-minute search pass).
* **Implementation:** Distinguish between *automatic stimulus-response* (unconscious habit loops) and *intentional actions* (looking up documentation or replying to an urgent family message).

## Principle 3 — No Shame
* **The Core Premise:** Guilt and shame trigger the "What-the-Hell" effect (Polivy & Herman), causing people to give up entirely when they break a streak.
* **Our Approach:** Never label a distraction as failure. Never display red warning lights or guilt-inducing copy like *"You failed"* or *"Streak lost."*
* **Implementation:** If drift occurs, the language is compassionate and objective: *"You drifted from your goal. Come back? Let's restart."* Every return is treated as a victory.

## Principle 4 — Outcome Over Screen Time
* **The Core Premise:** Screen time is an empty metric. Sitting at a desk for 8 hours scrolling research articles can yield zero results, while 30 minutes of deep focus can produce breakthrough work.
* **Our Approach:** Screen-time reduction is a secondary by-product. We measure:
  1. Intentional attention time.
  2. Uninterrupted deep focus.
  3. Tangible completed outcomes ("What did you accomplish?").
  4. Distraction recovery latency.
  5. Focus consistency.

## Principle 5 — Minimal Interface
* **The Core Premise:** The focus app itself must never become a source of distraction, endless configuration, or visual clutter.
* **Our Approach:** Calm computing. Monochromatic surfaces, high visual breathing room, subtle ambient audio, zero manipulative badges, and minimal interactions.
* **Implementation:** In ONE THING MODE, the screen contains only: the goal, the remaining time, subtle progress ring, quick distraction dump, and emergency exit.

## Principle 6 — Privacy by Design
* **The Core Premise:** A person's attention history, stray thoughts, and behavioral patterns are deeply intimate and sensitive personal data.
* **Our Approach:** Collect the absolute minimum necessary telemetry. Process 100% of behavioral analytics on-device. Zero telemetry or personal thoughts uploaded to external clouds. No selling of attention data.
* **Implementation:** Local-first architecture (IndexedDB / Dexie), client-side encryption, one-click data export, and complete instant wipe.

## Principle 7 — Evidence Before Gimmicks
* **The Core Premise:** Behavioral modification requires scientific grounding, not unproven gamification hacks or medical pseudoscience.
* **Our Approach:** Ground all interventions in peer-reviewed cognitive psychology:
  * Attention switching cost (Gloria Mark).
  * Friction-induced habit disruption (Riedel et al., PNAS 2023).
  * Cognitive offloading & the Zeigarnik effect (Bluma Zeigarnik).
  * Compassionate self-regulation (Kristin Neff).
* **Implementation:** Clearly label insights as observations or inferences, avoiding speculative medical or diagnostic claims.
