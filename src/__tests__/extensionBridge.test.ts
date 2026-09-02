import { describe, it, expect, vi } from 'vitest';
import { extensionBridge } from '../services/extensionBridge';
import { FocusSession, Intention, ExceptionPass } from '../types';

describe('ONE — Browser Extension Bridge Protocol Verification', () => {
  it('should emit null payload when no active session exists', () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');

    extensionBridge.syncSession(null, null, null);

    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'ONE_SYNC_SESSION',
        payload: null
      },
      '*'
    );

    postMessageSpy.mockRestore();
  });

  it('should format and emit complete synchronization payload when session is active', () => {
    const postMessageSpy = vi.spyOn(window, 'postMessage');

    const session: FocusSession = {
      id: 'session-42',
      intentionId: 'intent-1',
      intentionTitle: 'Build Extension Bridge',
      targetDurationSeconds: 1500,
      elapsedSeconds: 120,
      totalPausedMs: 0,
      status: 'focusing',
      protectionLevel: 4,
      startedAt: 1700000000000,
      endedAt: 0,
      driftCount: 0,
      totalRecoverySeconds: 0,
      intentionalExceptionsCount: 0
    };

    const intention: Intention = {
      id: 'intent-1',
      title: 'Build Extension Bridge',
      category: 'work',
      targetDurationMinutes: 25,
      protectionLevel: 4,
      createdAt: 1700000000000
    };

    const exceptionPass: ExceptionPass = {
      active: true,
      expiresAt: 1700000120000,
      durationMinutes: 2,
      reason: 'Search API'
    };

    extensionBridge.syncSession(session, intention, exceptionPass);

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ONE_SYNC_SESSION',
        payload: expect.objectContaining({
          sessionId: 'session-42',
          isActive: true,
          intentionTitle: 'Build Extension Bridge',
          protectionLevel: 4,
          allowedDomains: expect.arrayContaining(['github.com']),
          interceptDomains: expect.arrayContaining(['youtube.com']),
          exceptionPass: expect.objectContaining({
            active: true,
            reason: 'Search API'
          })
        })
      }),
      '*'
    );

    postMessageSpy.mockRestore();
  });
});
