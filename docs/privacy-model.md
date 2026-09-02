# ONE — Privacy Model & Data Ethics

> **Attention data is sacred.** We do not build surveillance tools. We build an intentional shield for the human mind.

---

## 1. Core Privacy Commitments
1. **Local-First by Default:** 100% of user intentions, thoughts dumped in the Distraction Inbox, session logs, and behavioral patterns are stored directly on the user's local device (in IndexedDB).
2. **Zero Third-Party Trackers:** No Google Analytics, no Facebook Pixels, no Hotjar, no Mixpanel, no data brokers.
3. **No Monetization of Personal Attention Data:** We will never sell, rent, or monetize attention logs, goals, or browsing habits.
4. **Complete Data Sovereignty:** Users can export their entire historical database as human-readable JSON at any time, or permanently wipe it in a single click.

---

## 2. What Data Is Collected (Locally)
| Data Entity | Purpose | Storage Location | Retention |
| :--- | :--- | :--- | :--- |
| **Active Intention** | Displays active goal during focus session | Local Device (IndexedDB) | Until deleted by user |
| **Session Timestamps** | Calculates intentional time vs deep focus | Local Device (IndexedDB) | Until deleted by user |
| **Drift Events** | Measures recovery latency and trigger categories | Local Device (IndexedDB) | Until deleted by user |
| **Distraction Inbox Items** | Stores cognitive offload notes for later review | Local Device (IndexedDB) | Until user deletes/archives |
| **Accomplished Outcomes** | Tracks deliverables completed | Local Device (IndexedDB) | Until deleted by user |

---

## 3. What We Explicitly NEVER Collect
* We **never** record keystrokes outside our application.
* We **never** record screen captures, screenshots, or webcam video.
* We **never** inspect or upload private message contents, search queries, or document bodies.
* We **never** build employer surveillance, remote monitoring, or covert tracking features.

---

## 4. Export & Deletion Protocol
* **One-Click Export:** Generates an unencrypted or AES-GCM encrypted `.json` file containing all stored tables.
* **One-Click Wipe:** Drops IndexedDB database, clears `localStorage`, resets Web Worker state, and restarts the app to initial state.
