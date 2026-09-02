# ONE — AI Architecture & Reflection Engine

> **Rule:** The deterministic focus engine must NEVER depend on an AI model to function. AI quietly enhances, summarizes, and coaches—it does not gate core protection.

---

## 1. Architectural Boundary

```
+-------------------------------------------------------------------------+
|                  CORE FOCUS ENGINE (Deterministic FSM)                  |
|  - Start, Pause, Resume, Intent Firewall, Recovery Latency, Storage     |
|  - Zero Network Dependencies • 100% Offline • High Performance         |
+-------------------------------------------------------------------------+
                                    |
                                    v (Optional Enrichment Hooks)
+-------------------------------------------------------------------------+
|                    AI REFLECTION & INTENT ASSISTANT                     |
|  - Goal Sharpening ("Make goal more concrete")                          |
|  - Completed Deliverable Summaries                                      |
|  - Non-Judgmental Focus Pattern Synthesis                               |
|  - 100% Offline-First (Chrome Built-in Prompt API / WebLLM)             |
+-------------------------------------------------------------------------+
```

---

## 2. Core Use Cases

### 2.1 Goal Sharpening (Pre-Session)
* **Problem:** Users often type vague goals: *"Work on project"*.
* **Intervention:** A quiet one-click suggestion: *"Make this actionable"*.
* **Transformation:** *"Work on project"* → *"Finish user authentication endpoint in auth.ts"*.

### 2.2 Outcome Normalization (Post-Session)
* **Problem:** Users input quick raw text: *"fixed bugs in css and checked test"*.
* **Enrichment:** Organizes deliverable tag: `[Bugfix] CSS alignment & Test suite verification`.

### 2.3 Non-Judgmental Behavioral Insights (Weekly Review)
* **Insight Synthesis:** Takes local session aggregates and produces compassionate, data-backed observations:
  * *"You completed 8 sessions between 8–11 AM. Your data suggests mornings may be your most natural focus window."*

---

## 3. Privacy & Offline Fallback Guarantees
1. **Offline Guarantee:** If AI is unavailable, disabled, or offline, ONE operates with 100% functionality.
2. **Local Model Preference:** Target execution using on-device models (e.g. Chrome's built-in `window.ai` / Gemini Nano, or WebLLM WASM).
3. **Zero Data Retention:** No personal goals or distraction notes are sent to third-party model training pipelines.
