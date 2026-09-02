# ONE — Focus Together & Silent Accountability Architecture

> **Principle:** Zero feeds. Zero likes. Zero followers. Zero vanity metrics.  
> Social functionality in ONE exists solely to provide quiet, supportive presence—never to create addiction, social comparison, or engagement traps.

---

## 1. Core Concepts

### 1.1 Silent Co-Focus Rooms
* **What it is:** A lightweight peer-to-peer or WebSocket room where up to 8 people share their active intention and countdown.
* **Shared State:**
  * Active Intention title (e.g. *"Write Chapter 3"*).
  * Session duration and remaining time.
  * Focus status (*Focusing*, *On Break*, *Completed*).
* **What is Explicitly Excluded:**
  * No chat box (text messaging causes distraction).
  * No applause, likes, hearts, or emoticons.
  * No leaderboards or competitive ranking.

---

## 2. Peer Accountability Protocol (P2P WebRTC / WebSockets)

```
[ User A (Local) ] <==================== (Encrypted WebRTC DataChannel) ====================> [ User B (Peer) ]
- Sends: { event: "SESSION_STARTED", goal: "Study DSA", endsAt: 1725300000000 }
- Receives: { event: "SESSION_COMPLETED", outcome: "Solved 3 tree problems" }
```

---

## 3. Compassionate Peer Presence
* When a user recovers from a drift, peers see a gentle status update: *"Vardhan returned to focus"*.
* At completion, a peer's delivered outcome appears quietly on screen for 5 seconds, followed by gentle silence.
* The room closes automatically when all members complete their focus block.
