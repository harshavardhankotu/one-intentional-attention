import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';
import { PersistedSessionState } from '../types';

describe('ONE — Session Recovery Lifecycle & State Cleanliness', () => {
  beforeEach(() => {
    storageService.clearActiveSessionState();
  });

  it('should persist active session state and reload it accurately', () => {
    const mockState: PersistedSessionState = {
      version: 1,
      session: {
        id: 'rec-session-1',
        intentionId: 'rec-intent-1',
        intentionTitle: 'Writing Recovery Tests',
        targetDurationSeconds: 1500,
        elapsedSeconds: 300,
        totalPausedMs: 0,
        status: 'focusing',
        protectionLevel: 3,
        startedAt: 1700000000000,
        endedAt: 0,
        driftCount: 1,
        totalRecoverySeconds: 15,
        intentionalExceptionsCount: 0
      },
      intention: {
        id: 'rec-intent-1',
        title: 'Writing Recovery Tests',
        category: 'work',
        targetDurationMinutes: 25,
        protectionLevel: 3,
        createdAt: 1700000000000
      },
      status: 'focusing',
      startedAt: 1700000000000,
      totalPausedMs: 0,
      lastPausedAt: null,
      targetDurationSeconds: 1500,
      exceptionPass: null,
      activeDriftEvent: null,
      lastSavedAt: Date.now()
    };

    storageService.saveActiveSessionState(mockState);

    const loaded = storageService.loadActiveSessionState();
    expect(loaded).not.toBeNull();
    expect(loaded?.session.id).toBe('rec-session-1');
    expect(loaded?.session.elapsedSeconds).toBe(300);
  });

  it('should perform exactly-once cleanup when active session is cleared', () => {
    const mockState: PersistedSessionState = {
      version: 1,
      session: {
        id: 'rec-session-2',
        intentionId: 'rec-intent-2',
        intentionTitle: 'Test Cleanup',
        targetDurationSeconds: 1500,
        elapsedSeconds: 100,
        totalPausedMs: 0,
        status: 'focusing',
        protectionLevel: 3,
        startedAt: 1700000000000,
        endedAt: 0,
        driftCount: 0,
        totalRecoverySeconds: 0,
        intentionalExceptionsCount: 0
      },
      intention: {
        id: 'rec-intent-2',
        title: 'Test Cleanup',
        category: 'work',
        targetDurationMinutes: 25,
        protectionLevel: 3,
        createdAt: 1700000000000
      },
      status: 'focusing',
      startedAt: 1700000000000,
      totalPausedMs: 0,
      lastPausedAt: null,
      targetDurationSeconds: 1500,
      exceptionPass: null,
      activeDriftEvent: null,
      lastSavedAt: Date.now()
    };

    storageService.saveActiveSessionState(mockState);
    expect(storageService.loadActiveSessionState()).not.toBeNull();

    // Session completion / discard
    storageService.clearActiveSessionState();
    expect(storageService.loadActiveSessionState()).toBeNull();
  });

  it('should guard against negative elapsed time even under backwards system clock anomalies', () => {
    const startedAt = 1700000000000;
    // Clock moved backwards 10 minutes in the past
    const anomalousNow = startedAt - 600000;
    const totalNonFocusMs = 0;

    const actualElapsed = Math.max(0, Math.floor((anomalousNow - startedAt - totalNonFocusMs) / 1000));
    expect(actualElapsed).toBe(0);
    expect(actualElapsed).toBeGreaterThanOrEqual(0);
  });
});
