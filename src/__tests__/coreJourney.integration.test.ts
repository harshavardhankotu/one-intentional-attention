import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';
import { transitionFocusState } from '../services/focusStateMachine';
import { policyEngine } from '../services/policyEngine';
import { Intention, FocusSession, DriftEvent, CompletedOutcome, DistractionItem, ExceptionPass } from '../types';

describe('ONE — Complete Core Journey Integration Verification', () => {
  beforeEach(async () => {
    await storageService.wipeAllData();
  });

  it('should execute complete end-to-end flow: Intention -> Focus -> Firewall -> Exception -> Recovery -> Distraction Capture -> Completion -> Metrics', async () => {
    // 1. Onboarding
    localStorage.setItem('one_onboarding_completed', 'true');
    expect(localStorage.getItem('one_onboarding_completed')).toBe('true');

    // 2. Create Intention
    const intention: Intention = {
      id: 'e2e-intent-1',
      title: 'Implement distributed consensus',
      category: 'work',
      targetDurationMinutes: 45,
      protectionLevel: 3,
      createdAt: Date.now()
    };
    await storageService.saveIntention(intention);

    // 3. Start Focus Session
    let engineStatus = transitionFocusState('idle', { type: 'START_SESSION' });
    expect(engineStatus).toBe('focusing');

    const startedAt = Date.now();
    const session: FocusSession = {
      id: 'e2e-session-1',
      intentionId: intention.id,
      intentionTitle: intention.title,
      targetDurationSeconds: 45 * 60,
      elapsedSeconds: 0,
      totalPausedMs: 0,
      status: 'focusing',
      protectionLevel: intention.protectionLevel,
      startedAt,
      endedAt: 0,
      driftCount: 0,
      totalRecoverySeconds: 0,
      intentionalExceptionsCount: 0
    };
    await storageService.saveSession(session);

    // Verify session persisted in local storage
    storageService.saveActiveSessionState({
      version: 1,
      session,
      intention,
      status: 'focusing',
      startedAt,
      totalPausedMs: 0,
      lastPausedAt: null,
      targetDurationSeconds: 45 * 60,
      exceptionPass: null,
      activeDriftEvent: null,
      lastSavedAt: Date.now()
    });
    expect(storageService.loadActiveSessionState()?.session.id).toBe('e2e-session-1');

    // 4. Trigger Distraction Impulse (Intent Firewall)
    engineStatus = transitionFocusState(engineStatus, { type: 'TRIGGER_INTERRUPT' });
    expect(engineStatus).toBe('interrupted');

    const driftStart = Date.now();
    const driftEvent: DriftEvent = {
      id: 'e2e-drift-1',
      sessionId: session.id,
      timestamp: driftStart,
      recoveryLatencySeconds: 0,
      reasonCategory: 'habitual_click',
      resolution: 'recovered'
    };

    // 5. Grant Controlled Intentional Exception
    engineStatus = transitionFocusState(engineStatus, { type: 'GRANT_EXCEPTION' });
    expect(engineStatus).toBe('exception');

    const exceptionPass: ExceptionPass = {
      active: true,
      expiresAt: Date.now() + 120000,
      durationMinutes: 2,
      reason: 'Check algorithm reference on YouTube'
    };

    // Policy engine allows YouTube during intentional exception pass
    const evalResult = policyEngine.evaluate('https://youtube.com', true, 3, exceptionPass);
    expect(evalResult.allowed).toBe(true);
    expect(evalResult.policy).toBe('TEMPORARY_EXCEPTION');

    // 6. Return to Goal (Recovery)
    engineStatus = transitionFocusState(engineStatus, { type: 'EXPIRE_EXCEPTION' });
    expect(engineStatus).toBe('focusing');

    const driftEnd = driftStart + 18000; // 18s recovery latency
    driftEvent.resolvedTimestamp = driftEnd;
    driftEvent.recoveryLatencySeconds = 18;
    await storageService.recordDriftEvent(driftEvent);

    session.driftCount = 1;
    session.totalRecoverySeconds = 18;
    session.intentionalExceptionsCount = 1;

    // 7. Save Stray Thought to Distraction Inbox (Zero-Friction Cognitive Offload)
    const inboxItem: DistractionItem = {
      id: 'e2e-inbox-1',
      sessionId: session.id,
      content: 'Compare Raft vs Paxos edge cases',
      createdAt: Date.now(),
      status: 'inbox'
    };
    await storageService.addDistractionItem(inboxItem);

    const savedItems = await storageService.getDistractionInbox();
    expect(savedItems.length).toBe(1);
    expect(savedItems[0].content).toBe('Compare Raft vs Paxos edge cases');

    // 8. Session Completion
    engineStatus = transitionFocusState(engineStatus, { type: 'PROMPT_COMPLETION' });
    expect(engineStatus).toBe('completing');

    engineStatus = transitionFocusState(engineStatus, { type: 'COMPLETE' });
    expect(engineStatus).toBe('completed');

    session.status = 'completed';
    session.endedAt = Date.now();
    session.elapsedSeconds = 2700;
    session.accomplishedOutcome = 'Implemented Raft leader election timeout and heartbeat ticker';
    session.focusRating = 'deep';
    await storageService.saveSession(session);

    // 9. Record User-Reported Outcome
    const outcome: CompletedOutcome = {
      id: 'e2e-outcome-1',
      sessionId: session.id,
      goalTitle: intention.title,
      outcomeText: session.accomplishedOutcome,
      focusRating: 'deep',
      completedAt: session.endedAt,
      durationMinutes: Math.round(session.elapsedSeconds / 60)
    };
    await storageService.saveCompletedOutcome(outcome);

    // 10. Clean up Active Session State (Exact-Once Cleanup)
    storageService.clearActiveSessionState();
    expect(storageService.loadActiveSessionState()).toBeNull();

    // 11. Verify Attention Dashboard Metrics
    const dailyStats = await storageService.getDailyStats();
    expect(dailyStats.sessionsCount).toBe(1);
    expect(dailyStats.totalIntentionalSeconds).toBe(2700);
    expect(dailyStats.driftCount).toBe(1);
    expect(dailyStats.averageRecoveryLatencySeconds).toBe(18);

    const outcomes = await storageService.getCompletedOutcomes();
    expect(outcomes.length).toBe(1);
    expect(outcomes[0].outcomeText).toContain('Raft leader election');
  });
});
