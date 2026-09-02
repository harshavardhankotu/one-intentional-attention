import { describe, it, expect } from 'vitest';

// Extracted validator matching extension/bridge.js implementation exactly
function validatePayload(payload: any, origin: string): boolean {
  if (payload === null) return true; // Valid cleanup payload
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;

  // Validate sessionId
  if (typeof payload.sessionId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(payload.sessionId)) {
    return false;
  }

  // Validate isActive
  if (typeof payload.isActive !== 'boolean') return false;

  // Validate intentionTitle (max 300 chars, non-empty)
  if (typeof payload.intentionTitle !== 'string' || payload.intentionTitle.length === 0 || payload.intentionTitle.length > 300) {
    return false;
  }

  // Validate protectionLevel (1..5)
  const level = Number(payload.protectionLevel);
  if (!Number.isInteger(level) || level < 1 || level > 5) return false;

  // Validate targetDurationSeconds (1s to 24 hours)
  const duration = Number(payload.targetDurationSeconds);
  if (!Number.isInteger(duration) || duration < 1 || duration > 86400) return false;

  // Validate startedAt (valid reasonable epoch timestamp)
  const started = Number(payload.startedAt);
  if (!Number.isFinite(started) || started < 1600000000000 || started > Date.now() + 60000) return false;

  // Validate allowedDomains (array of valid hostnames, max 500 items)
  if (!Array.isArray(payload.allowedDomains) || payload.allowedDomains.length > 500) return false;
  for (const d of payload.allowedDomains) {
    if (typeof d !== 'string' || d.length > 253 || !/^[a-zA-Z0-9.-]+$/.test(d)) return false;
  }

  // Validate interceptDomains (array of valid hostnames, max 500 items)
  if (!Array.isArray(payload.interceptDomains) || payload.interceptDomains.length > 500) return false;
  for (const d of payload.interceptDomains) {
    if (typeof d !== 'string' || d.length > 253 || !/^[a-zA-Z0-9.-]+$/.test(d)) return false;
  }

  // Validate exceptionPass (null or valid exception object)
  if (payload.exceptionPass !== null && typeof payload.exceptionPass === 'object') {
    const ep = payload.exceptionPass;
    if (typeof ep.active !== 'boolean') return false;
    if (typeof ep.expiresAt !== 'number' || ep.expiresAt < started) return false;
    if (typeof ep.reason !== 'string' || ep.reason.length > 200) return false;
  } else if (payload.exceptionPass !== null) {
    return false;
  }

  // Validate appOrigin matches origin
  if (typeof payload.appOrigin !== 'string' || payload.appOrigin !== origin) return false;

  return true;
}

// Background session reconciliation logic matching extension/background.js
function reconcileSessionUpdate(
  currentSession: any,
  payload: any
): { action: 'accept' | 'reject_older' | 'reject_expired' | 'cleared' | 'ignored_stale' } {
  if (!payload || !payload.isActive) {
    if (payload?.sessionId && currentSession && currentSession.sessionId !== payload.sessionId) {
      return { action: 'ignored_stale' };
    }
    return { action: 'cleared' };
  }

  if (currentSession && currentSession.sessionId !== payload.sessionId && payload.startedAt < currentSession.startedAt) {
    return { action: 'reject_older' };
  }

  const sessionMaxLife = payload.startedAt + payload.targetDurationSeconds * 1000 + 7200000;
  if (Date.now() > sessionMaxLife) {
    return { action: 'reject_expired' };
  }

  return { action: 'accept' };
}

describe('ONE — Extension Bridge Security & Stale Session Protection', () => {
  const validOrigin = 'http://localhost:5173';
  const validPayload = {
    sessionId: 'session-alpha-123',
    isActive: true,
    intentionTitle: 'Writing Security Specifications',
    protectionLevel: 3,
    targetDurationSeconds: 1500,
    startedAt: Date.now() - 5000,
    allowedDomains: ['docs.rs', 'github.com'],
    interceptDomains: ['reddit.com', 'twitter.com'],
    exceptionPass: null,
    appOrigin: validOrigin
  };

  it('accepts a valid application-origin session payload', () => {
    expect(validatePayload(validPayload, validOrigin)).toBe(true);
  });

  it('rejects forged appOrigin that does not match window origin', () => {
    const forged = { ...validPayload, appOrigin: 'https://evil-spoof.com' };
    expect(validatePayload(forged, validOrigin)).toBe(false);
  });

  it('rejects malformed non-object payloads', () => {
    expect(validatePayload(undefined, validOrigin)).toBe(false);
    expect(validatePayload('string-payload', validOrigin)).toBe(false);
    expect(validatePayload([1, 2, 3], validOrigin)).toBe(false);
  });

  it('accepts clean null payload for session cleanup', () => {
    expect(validatePayload(null, validOrigin)).toBe(true);
  });

  it('rejects invalid protection levels outside 1..5', () => {
    expect(validatePayload({ ...validPayload, protectionLevel: 0 }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, protectionLevel: 6 }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, protectionLevel: 'three' }, validOrigin)).toBe(false);
  });

  it('rejects malformed or unsafe session IDs', () => {
    expect(validatePayload({ ...validPayload, sessionId: '' }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, sessionId: 'id with spaces' }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, sessionId: '<script>' }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, sessionId: 'a'.repeat(101) }, validOrigin)).toBe(false);
  });

  it('rejects invalid targetDurationSeconds', () => {
    expect(validatePayload({ ...validPayload, targetDurationSeconds: 0 }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, targetDurationSeconds: -100 }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, targetDurationSeconds: 100000 }, validOrigin)).toBe(false);
  });

  it('rejects invalid startedAt timestamps', () => {
    expect(validatePayload({ ...validPayload, startedAt: 1000 }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, startedAt: Date.now() + 10000000 }, validOrigin)).toBe(false);
  });

  it('rejects oversized domain lists exceeding 500 items', () => {
    const hugeDomainList = new Array(501).fill('allowed.com');
    expect(validatePayload({ ...validPayload, allowedDomains: hugeDomainList }, validOrigin)).toBe(false);
  });

  it('rejects malformed domain strings containing invalid characters', () => {
    expect(validatePayload({ ...validPayload, allowedDomains: ['https://not-a-host.com/'] }, validOrigin)).toBe(false);
    expect(validatePayload({ ...validPayload, allowedDomains: ['evil<script>.com'] }, validOrigin)).toBe(false);
  });

  it('prevents an older session from overwriting a newer active session', () => {
    const active = {
      sessionId: 'session-new-456',
      startedAt: 1700000005000,
      targetDurationSeconds: 1500,
      isActive: true
    };
    const staleOlder = {
      sessionId: 'session-old-123',
      startedAt: 1700000000000, // Older timestamp
      targetDurationSeconds: 1500,
      isActive: true
    };

    const result = reconcileSessionUpdate(active, staleOlder);
    expect(result.action).toBe('reject_older');
  });

  it('accepts a newer session replacing an older active session', () => {
    const now = Date.now();
    const active = {
      sessionId: 'session-old-123',
      startedAt: now - 10000,
      targetDurationSeconds: 1500,
      isActive: true
    };
    const newer = {
      sessionId: 'session-new-456',
      startedAt: now - 2000,
      targetDurationSeconds: 1500,
      isActive: true
    };

    const result = reconcileSessionUpdate(active, newer);
    expect(result.action).toBe('accept');
  });

  it('rejects already expired session update', () => {
    const expiredPayload = {
      sessionId: 'session-ancient',
      startedAt: Date.now() - 10000000, // Started far in the past
      targetDurationSeconds: 1500,
      isActive: true
    };

    const result = reconcileSessionUpdate(null, expiredPayload);
    expect(result.action).toBe('reject_expired');
  });

  it('ignores stale cleanup request that does not match current active session ID', () => {
    const active = {
      sessionId: 'session-current',
      startedAt: Date.now(),
      targetDurationSeconds: 1500,
      isActive: true
    };
    const staleCleanup = {
      sessionId: 'session-different-older',
      isActive: false
    };

    const result = reconcileSessionUpdate(active, staleCleanup);
    expect(result.action).toBe('ignored_stale');
  });

  it('cleans up state when valid matching cleanup signal is received', () => {
    const active = {
      sessionId: 'session-current',
      startedAt: Date.now(),
      targetDurationSeconds: 1500,
      isActive: true
    };
    const matchingCleanup = {
      sessionId: 'session-current',
      isActive: false
    };

    const result = reconcileSessionUpdate(active, matchingCleanup);
    expect(result.action).toBe('cleared');
  });
});
