export type ProtectionLevel = 1 | 2 | 3 | 4 | 5;

export type FocusRating = 'deep' | 'moderate' | 'fragmented';

export type SessionStatus = 
  | 'idle' 
  | 'focusing' 
  | 'break' 
  | 'intercepted' 
  | 'exception_pass' 
  | 'completing' 
  | 'rescued';

export interface Intention {
  id: string;
  title: string;
  category: 'study' | 'work' | 'creative' | 'exercise' | 'personal' | 'custom';
  targetDurationMinutes: number;
  protectionLevel: ProtectionLevel;
  createdAt: number;
}

export interface FocusSession {
  id: string;
  intentionId: string;
  intentionTitle: string;
  targetDurationSeconds: number;
  elapsedSeconds: number;
  status: 'completed' | 'abandoned' | 'rescued';
  protectionLevel: ProtectionLevel;
  startedAt: number;
  endedAt: number;
  driftCount: number;
  totalRecoverySeconds: number;
  intentionalExceptionsCount: number;
  accomplishedOutcome?: string;
  focusRating?: FocusRating;
}

export interface DriftEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  resolvedTimestamp?: number;
  recoveryLatencySeconds?: number;
  reasonCategory: 'mind_wandering' | 'habitual_click' | 'urgent_task' | 'external_trigger' | 'other';
  resolution: 'recovered' | 'intentional_exception' | 'emergency_exit';
  exceptionReason?: string;
  exceptionDurationMinutes?: number;
}

export interface DistractionItem {
  id: string;
  sessionId?: string;
  content: string;
  createdAt: number;
  status: 'inbox' | 'actioned' | 'dismissed';
}

export interface CompletedOutcome {
  id: string;
  sessionId: string;
  goalTitle: string;
  outcomeText: string;
  completedAt: number;
  durationMinutes: number;
  focusRating: FocusRating;
}

export interface ExceptionPass {
  active: boolean;
  expiresAt: number;
  durationMinutes: number;
  reason: string;
}

export interface DailyAttentionStats {
  date: string; // YYYY-MM-DD
  totalIntentionalSeconds: number;
  totalDeepFocusSeconds: number;
  totalRecoveredSeconds: number;
  completedOutcomesCount: number;
  driftCount: number;
  averageRecoveryLatencySeconds: number;
  longestUninterruptedSeconds: number;
  sessionsCount: number;
}

export interface FocusProfile {
  totalIntentionalMinutes: number;
  totalDeepFocusMinutes: number;
  totalCompletedOutcomes: number;
  averageRecoveryLatencySeconds: number;
  bestFocusHourWindow: string;
  topTriggers: { trigger: string; count: number }[];
  interventionSuccessRate: number;
}
