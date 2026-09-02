import { describe, it, expect } from 'vitest';
import { policyEngine } from '../services/policyEngine';

describe('ONE — Domain Policy Engine Deep Verification', () => {
  it('should allow all domains when focus is inactive', () => {
    const res = policyEngine.evaluate('https://youtube.com', false, 3, null);
    expect(res.allowed).toBe(true);
    expect(res.policy).toBe('ALLOW');
  });

  it('should intercept default distraction domains during active Level 3 focus', () => {
    const res = policyEngine.evaluate('https://instagram.com/explore', true, 3, null);
    expect(res.allowed).toBe(false);
    expect(res.policy).toBe('INTERCEPT');
  });

  it('should match subdomains correctly (e.g. m.youtube.com or np.reddit.com)', () => {
    const res1 = policyEngine.evaluate('https://m.youtube.com/watch?v=123', true, 3, null);
    expect(res1.allowed).toBe(false);
    expect(res1.policy).toBe('INTERCEPT');

    const res2 = policyEngine.evaluate('https://old.reddit.com/r/all', true, 3, null);
    expect(res2.allowed).toBe(false);
    expect(res2.policy).toBe('INTERCEPT');
  });

  it('should explicitly allow reference domains on default allow-list', () => {
    const res1 = policyEngine.evaluate('https://github.com/torvalds/linux', true, 3, null);
    expect(res1.allowed).toBe(true);
    expect(res1.policy).toBe('ALLOW');

    const res2 = policyEngine.evaluate('https://docs.python.org/3/', true, 3, null);
    expect(res2.allowed).toBe(true);
    expect(res2.policy).toBe('ALLOW');
  });

  it('should strictly enforce Level 4 Deep Focus (allow-list only mode)', () => {
    // Non-whitelisted neutral domain should be BLOCKED in Level 4
    const neutralRes = policyEngine.evaluate('https://bbc.com/news', true, 4, null);
    expect(neutralRes.allowed).toBe(false);
    expect(neutralRes.policy).toBe('BLOCK');

    // Whitelisted reference domain remains ALLOWED in Level 4
    const allowedRes = policyEngine.evaluate('https://developer.mozilla.org/en-US/', true, 4, null);
    expect(allowedRes.allowed).toBe(true);
    expect(allowedRes.policy).toBe('ALLOW');
  });

  it('should strictly enforce Level 5 Hard Lock (allow-list only mode)', () => {
    const neutralRes = policyEngine.evaluate('https://randomblog.org', true, 5, null);
    expect(neutralRes.allowed).toBe(false);
    expect(neutralRes.policy).toBe('BLOCK');
  });

  it('should allow navigation when valid unexpired intentional exception pass is active', () => {
    const pass = {
      active: true,
      expiresAt: Date.now() + 180000,
      reason: 'Check API video'
    };

    const res = policyEngine.evaluate('https://youtube.com', true, 3, pass);
    expect(res.allowed).toBe(true);
    expect(res.policy).toBe('TEMPORARY_EXCEPTION');
    expect(res.exceptionRemainingSeconds).toBeGreaterThan(0);
  });

  it('should reject expired intentional exception pass and fall back to interception', () => {
    const expiredPass = {
      active: true,
      expiresAt: Date.now() - 5000, // 5s in past
      reason: 'Old pass'
    };

    const res = policyEngine.evaluate('https://youtube.com', true, 3, expiredPass);
    expect(res.allowed).toBe(false);
    expect(res.policy).toBe('INTERCEPT');
  });

  it('should support dynamic custom rules and removal', () => {
    policyEngine.addRule({
      hostname: 'distracting-forum.net',
      policy: 'INTERCEPT',
      category: 'distraction'
    });

    const res1 = policyEngine.evaluate('https://distracting-forum.net/thread', true, 3, null);
    expect(res1.allowed).toBe(false);
    expect(res1.policy).toBe('INTERCEPT');

    // Remove rule
    policyEngine.removeRule('distracting-forum.net');
    const res2 = policyEngine.evaluate('https://distracting-forum.net/thread', true, 3, null);
    // Neutral domain in level 3 is allowed
    expect(res2.allowed).toBe(true);
  });
});
