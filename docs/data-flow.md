# ONE — Data Flow & Privacy Lifecycle

## 1. Complete Data Lifecycle

```
[ USER INPUT ]
   |
   +---> "What matters right now?"
   |        |
   |        v
   |     Intention Created (UUID, Title, Duration, Level)
   |        |
   |        +-----------------------------------> [ IndexedDB / Dexie: intentions ]
   |
   +---> Start Session
   |        |
   |        v
   |     FocusSession Initialized
   |        |
   |        +-----------------------------------> [ IndexedDB / Dexie: sessions ]
   |        |
   |        +-----------------------------------> [ localStorage: activeSessionState ]
   |                                                    (For crash/refresh recovery)
   |
   +---> Distraction Impulse (Intent Firewall)
   |        |
   |        v
   |     DriftEvent Logged (Timestamp, Latency)
   |        |
   |        +-----------------------------------> [ IndexedDB / Dexie: driftEvents ]
   |
   +---> "Save for Later"
   |        |
   |        v
   |     DistractionItem Saved (Zeigarnik Buffer)
   |        |
   |        +-----------------------------------> [ IndexedDB / Dexie: distractionInbox ]
   |
   +---> Session Complete
            |
            v
         CompletedOutcome Recorded
            |
            +-----------------------------------> [ IndexedDB / Dexie: completedOutcomes ]
            |
            +-----------------------------------> [ localStorage: clear activeSessionState ]
```

---

## 2. Privacy & Storage Registry

| Entity | Purpose | Stored Where? | Leaves Device? | Encryption? | Deletion Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Intention** | Current goal display | IndexedDB (`intentions`) | **Never (0%)** | Plaintext at rest (Local only) | One-click wipe / Single delete |
| **FocusSession** | Metrics calculation | IndexedDB (`sessions`) | **Never (0%)** | Plaintext at rest (Local only) | One-click wipe / Single delete |
| **DriftEvent** | Recovery speed tracking | IndexedDB (`driftEvents`) | **Never (0%)** | Plaintext at rest (Local only) | One-click wipe / Single delete |
| **DistractionItem**| Thought capture | IndexedDB (`distractionInbox`) | **Never (0%)** | Plaintext at rest (Local only) | Archive / Delete / Wipe |
| **CompletedOutcome**| Tangible deliverables | IndexedDB (`completedOutcomes`)| **Never (0%)** | Plaintext at rest (Local only) | One-click wipe |
| **Active State** | Refresh survival | `localStorage` | **Never (0%)** | Cleared on session end | Auto-cleared on completion |

---

## 3. Network Boundaries
* **Outbound Network Calls:** **0 (ZERO)**.
* **Third-Party CDNs:** **0 (ZERO)** (All fonts, icons, scripts bundled locally).
* **Analytics Beacons:** **0 (ZERO)**.
