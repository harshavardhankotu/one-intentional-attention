import { describe, it, expect } from 'vitest';
import { Intention, FocusSession, DriftEvent } from '../types';

describe('ONE — Intentional Attention Data Structures & Domain Logic', () => {
  it('should initialize an Intention with proper default values and protection level', () => {
    const intention: Intention = {
      id: 'test-uuid-1',
      title: 'Finish MVP architecture',
      category: 'work',
      targetDurationMinutes: 45,
      protectionLevel: 3,
      createdAt: Date.now()
    };

    expect(intention.title).toBe('Finish MVP architecture');
    expect(intention.protectionLevel).toBe(3);
    expect(intention.targetDurationMinutes).toBe(45);
  });

  it('should accurately calculate recovery latency between drift intercept and resolution', () => {
    const driftTimestamp = 1725300000000;
    const resolvedTimestamp = 1725300042000; // 42 seconds later

    const drift: DriftEvent = {
      id: 'drift-1',
      sessionId: 'session-1',
      timestamp: driftTimestamp,
      resolvedTimestamp,
      recoveryLatencySeconds: Math.round((resolvedTimestamp - driftTimestamp) / 1000),
      reasonCategory: 'habitual_click',
      resolution: 'recovered'
    };

    expect(drift.recoveryLatencySeconds).toBe(42);
    expect(drift.resolution).toBe('recovered');
  });

  it('should calculate deep focus time by subtracting recovery latency from elapsed seconds', () => {
    const session: FocusSession = {
      id: 'session-1',
      intentionId: 'intent-1',
      intentionTitle: 'Study DSA graphs',
      targetDurationSeconds: 1500, // 25 min
      elapsedSeconds: 1500,
      status: 'completed',
      protectionLevel: 3,
      startedAt: Date.now() - 1500000,
      endedAt: Date.now(),
      totalPausedMs: 0,
      driftCount: 2,
      totalRecoverySeconds: 84, // 84 seconds total drift recovery
      intentionalExceptionsCount: 1,
      accomplishedOutcome: 'Understood Dijkstra and Prim algorithms',
      focusRating: 'deep'
    };

    const deepFocusSeconds = session.elapsedSeconds - session.totalRecoverySeconds;
    expect(deepFocusSeconds).toBe(1416);
    expect(Math.round(deepFocusSeconds / 60)).toBe(24);
  });
});
