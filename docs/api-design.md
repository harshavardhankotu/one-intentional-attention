# ONE — API Design & Platform Bridge Specification

## 1. Internal Focus Engine Interface

```typescript
export interface IFocusEngine {
  // Session Lifecycle
  startSession(intention: CreateIntentionDTO): Promise<FocusSession>;
  pauseSession(): void;
  resumeSession(): void;
  takeBreak(durationMinutes: number): void;
  endBreak(): void;
  completeSession(outcome: SubmitOutcomeDTO): Promise<FocusSession>;
  rescueSession(minutes: number, newGoal?: string): Promise<FocusSession>;
  
  // Distraction & Recovery
  triggerIntentFirewall(): DriftEvent;
  recordDistractionRecovery(eventId: string): Promise<void>;
  grantIntentionalException(eventId: string, minutes: number, reason: string): Promise<void>;
  
  // Cognitive Offloading
  saveToDistractionInbox(content: string): Promise<DistractionItem>;
  
  // Telemetry & Profile
  getDailyAttentionStats(dateEpoch: number): Promise<DailyAttentionStats>;
  getFocusProfile(): Promise<FocusProfile>;
}
```

---

## 2. Platform Bridge Message Protocol (Browser Extension / Desktop)

Browser extensions and Desktop daemons communicate with the ONE Core via postMessage or IPC:

### 2.1 Outbound Events (ONE Core -> Extension / OS Daemon)
* `ONE_SESSION_STARTED`: `{ sessionId, intentionTitle, protectionLevel, endsAt }`
* `ONE_EXCEPTION_GRANTED`: `{ sessionId, expiresAt, allowedCategory }`
* `ONE_SESSION_ENDED`: `{ sessionId, status }`

### 2.2 Inbound Events (Extension / OS Daemon -> ONE Core)
* `ONE_TRIGGER_INTERCEPT`: `{ attemptedUrlOrApp, timestamp }`
* `ONE_USER_RESUMED`: `{ timestamp }`
