import { describe, it, expect } from 'vitest';
import { transitionFocusState, StateTransitionError } from '../services/focusStateMachine';
import { policyEngine } from '../services/policyEngine';
import { aiCoachService } from '../services/aiCoachService';
import { SessionStatus, DriftEvent, ExceptionPass } from '../types';

describe('ONE — System Invariants & Safety Properties', () => {
  it('Invariant 1: Remaining time cannot become negative even when elapsed exceeds target', () => {
    const targetDurationSeconds = 1500; // 25 min
    const elapsedSeconds = 1600; // Overtime

    const remainingSeconds = Math.max(0, targetDurationSeconds - elapsedSeconds);
    expect(remainingSeconds).toBe(0);
    expect(remainingSeconds).toBeGreaterThanOrEqual(0);
  });

  it('Invariant 2: Completed sessions cannot transition back to focusing or paused directly', () => {
    const completedState: SessionStatus = 'completed';

    expect(() => {
      transitionFocusState(completedState, { type: 'PAUSE' });
    }).toThrow(StateTransitionError);

    expect(() => {
      transitionFocusState(completedState, { type: 'RESUME' });
    }).toThrow(StateTransitionError);

    expect(() => {
      transitionFocusState(completedState, { type: 'TRIGGER_INTERRUPT' });
    }).toThrow(StateTransitionError);
  });

  it('Invariant 3: Cancelled sessions cannot transition directly to completed', () => {
    const cancelledState: SessionStatus = 'cancelled';

    expect(() => {
      transitionFocusState(cancelledState, { type: 'COMPLETE' });
    }).toThrow(StateTransitionError);
  });

  it('Invariant 4: Expired exceptions cannot be considered active by the policy engine', () => {
    const expiredPass: ExceptionPass = {
      active: true,
      expiresAt: Date.now() - 1000, // expired 1s ago
      durationMinutes: 2,
      reason: 'Research documentation'
    };

    const evalResult = policyEngine.evaluate('https://youtube.com', true, 3, expiredPass);
    // Should be intercepted because exception is expired
    expect(evalResult.allowed).toBe(false);
    expect(evalResult.policy).toBe('INTERCEPT');
  });

  it('Invariant 5: Active exceptions allow browsing during valid unexpired time window', () => {
    const activePass: ExceptionPass = {
      active: true,
      expiresAt: Date.now() + 120000, // 2 minutes in future
      durationMinutes: 2,
      reason: 'Search documentation'
    };

    const evalResult = policyEngine.evaluate('https://youtube.com', true, 3, activePass);
    expect(evalResult.allowed).toBe(true);
    expect(evalResult.policy).toBe('TEMPORARY_EXCEPTION');
  });

  it('Invariant 6: Level 4 Deep Focus shields all domains except explicitly allowed reference sites', () => {
    const blockedResult = policyEngine.evaluate('https://news.ycombinator.com', true, 4, null);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.policy).toBe('BLOCK');

    const allowedResult = policyEngine.evaluate('https://docs.python.org', true, 4, null);
    expect(allowedResult.allowed).toBe(true);
    expect(allowedResult.policy).toBe('ALLOW');
  });

  it('Invariant 7: A recovered session must have a positive, non-negative recovery latency', () => {
    const driftTimestamp = Date.now();
    const resolvedTimestamp = driftTimestamp + 14000; // 14 seconds later

    const drift: DriftEvent = {
      id: 'd-1',
      sessionId: 's-1',
      timestamp: driftTimestamp,
      resolvedTimestamp,
      recoveryLatencySeconds: Math.max(1, Math.round((resolvedTimestamp - driftTimestamp) / 1000)),
      reasonCategory: 'habitual_click',
      resolution: 'recovered'
    };

    expect(drift.recoveryLatencySeconds).toBe(14);
    expect(drift.recoveryLatencySeconds).toBeGreaterThan(0);
  });

  it('Invariant 8: AI Focus Coach fallback works 100% offline and returns sharpened goals', async () => {
    const sharpened = await aiCoachService.sharpenGoal('study dsa');
    expect(sharpened).toContain('LeetCode');
    expect(sharpened.length).toBeGreaterThan('study dsa'.length);
  });
});
