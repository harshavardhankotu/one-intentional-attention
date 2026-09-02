# ONE — Data Model Specification

## 1. Entity Definitions

### 1.1 `Intention`
Represents an active or planned goal that the user desires to protect.
```typescript
interface Intention {
  id: string;                      // UUID v4
  title: string;                   // E.g. "Finish MVP architecture"
  category: 'study' | 'work' | 'creative' | 'exercise' | 'personal' | 'custom';
  targetDurationMinutes: number;   // 15, 25, 45, 60, 90, custom
  protectionLevel: 1 | 2 | 3 | 4 | 5; // 1: Reminder, 2: Friction, 3: Protected, 4: Deep, 5: Hard Lock
  createdAt: number;               // Unix epoch (ms)
}
```

### 1.2 `FocusSession`
The concrete focus session execution log.
```typescript
interface FocusSession {
  id: string;                      // UUID v4
  intentionId: string;             // Reference to Intention
  intentionTitle: string;          // Snapshot of intention title
  targetDurationSeconds: number;   // E.g. 1500 for 25m
  elapsedSeconds: number;          // Actual seconds elapsed
  status: 'focusing' | 'break' | 'completed' | 'rescued' | 'abandoned';
  protectionLevel: 1 | 2 | 3 | 4 | 5;
  startedAt: number;               // Unix epoch (ms)
  endedAt?: number;                // Unix epoch (ms)
  driftCount: number;              // Number of distraction attempts
  totalRecoverySeconds: number;    // Cumulative seconds spent recovering
  intentionalExceptionsCount: number; // Approved time-boxed passes
  accomplishedOutcome?: string;    // Tangible result captured at end
  focusRating?: 'deep' | 'moderate' | 'fragmented';
}
```

### 1.3 `DriftEvent`
Recorded whenever the Intent Firewall intercepts distraction or user signals drift.
```typescript
interface DriftEvent {
  id: string;                      // UUID v4
  sessionId: string;               // Reference to FocusSession
  timestamp: number;               // When the drift occurred
  resolvedTimestamp?: number;      // When user returned to focus
  recoveryLatencySeconds?: number; // (resolvedTimestamp - timestamp) / 1000
  reasonCategory: 'mind_wandering' | 'habitual_click' | 'urgent_task' | 'external_trigger' | 'other';
  resolution: 'recovered' | 'intentional_exception' | 'emergency_exit';
  exceptionDurationMinutes?: number; // 2 or 5 if exception granted
}
```

### 1.4 `DistractionItem` (Distraction Inbox)
Cognitive offloading buffer for spontaneous thoughts.
```typescript
interface DistractionItem {
  id: string;                      // UUID v4
  sessionId?: string;              // Optional session during which thought was recorded
  content: string;                 // E.g. "Research noise cancelling headphones"
  createdAt: number;
  status: 'inbox' | 'actioned' | 'dismissed';
}
```

### 1.5 `CompletedOutcome`
Meaningful output registry.
```typescript
interface CompletedOutcome {
  id: string;                      // UUID v4
  sessionId: string;
  goalTitle: string;
  outcomeText: string;             // Deliverable description
  completedAt: number;
  focusRating: 'deep' | 'moderate' | 'fragmented';
}
```

### 1.6 `FocusProfile`
Aggregated personal behavioral profile.
```typescript
interface FocusProfile {
  totalIntentionalMinutes: number;
  totalDeepFocusMinutes: number;
  totalCompletedOutcomes: number;
  averageRecoveryLatencySeconds: number;
  bestFocusHourWindow: string;      // E.g. "08:00 - 11:00"
  topTriggers: { trigger: string; count: number }[];
  interventionSuccessRate: number; // Percentage of drifts returned
}
```
