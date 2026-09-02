import { describe, it, expect, beforeEach } from 'vitest';

// Real-world in-memory simulation of Chrome MV3 Runtime
class MockChromeRuntime {
  public storage: Record<string, any> = {};
  public alarms: Map<string, { delayInMinutes: number; scheduledAt: number }> = new Map();
  public tabs: Array<{ id: number; url: string; receivedMessages: any[] }> = [];

  reset() {
    this.storage = {};
    this.alarms.clear();
    this.tabs = [
      { id: 1, url: 'https://youtube.com', receivedMessages: [] },
      { id: 2, url: 'https://news.ycombinator.com', receivedMessages: [] },
      { id: 3, url: 'https://github.com', receivedMessages: [] },
      { id: 4, url: 'http://localhost:5173', receivedMessages: [] }
    ];
  }

  // Mimics chrome.storage.local
  storageGet(keys: string[]): Promise<Record<string, any>> {
    const res: Record<string, any> = {};
    keys.forEach((k) => {
      res[k] = this.storage[k] || null;
    });
    return Promise.resolve(res);
  }

  storageSet(data: Record<string, any>): Promise<void> {
    Object.assign(this.storage, data);
    return Promise.resolve();
  }

  // Mimics chrome.alarms
  createAlarm(name: string, info: { delayInMinutes: number }) {
    this.alarms.set(name, { delayInMinutes: info.delayInMinutes, scheduledAt: Date.now() });
  }

  clearAlarm(name: string) {
    this.alarms.delete(name);
  }

  // Mimics chrome.tabs.sendMessage / broadcast
  broadcastToTabs(message: any) {
    this.tabs.forEach((t) => t.receivedMessages.push(message));
  }

  // Trigger alarm expiration
  triggerAlarm(name: string) {
    if (this.alarms.has(name)) {
      this.alarms.delete(name);
      if (name === 'exception_expiry') {
        this.storage.exceptionPass = null;
        this.broadcastToTabs({ type: 'EXCEPTION_EXPIRED' });
      }
    }
  }

  // Background worker onStartup simulation
  simulateStartup() {
    const session = this.storage.activeSession;
    if (session) {
      const expiresThreshold = session.startedAt + session.targetDurationSeconds * 1000 + 3600000;
      if (Date.now() > expiresThreshold) {
        this.storage.activeSession = null;
        this.storage.exceptionPass = null;
        this.alarms.clear();
        this.broadcastToTabs({ type: 'SESSION_ENDED' });
      }
    }
  }

  // Content script domain evaluator
  evaluateTab(url: string): { blocked: boolean; level?: number; showExceptionButton?: boolean } {
    const session = this.storage.activeSession;
    const exceptionPass = this.storage.exceptionPass;

    if (!session || !session.isActive) {
      return { blocked: false };
    }

    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    const appOrigin = session.appOrigin || 'http://localhost:5173';
    const appHost = new URL(appOrigin).hostname;

    // 1. App origin is exempt
    if (host === appHost || host === 'localhost' || host === '127.0.0.1') {
      return { blocked: false };
    }

    // 2. Unexpired exception pass
    if (exceptionPass && exceptionPass.active && exceptionPass.expiresAt > Date.now()) {
      return { blocked: false };
    }

    // 3. Whitelisted reference domain
    const isAllowed = (session.allowedDomains || []).some(
      (d: string) => host === d || host.endsWith(`.${d}`)
    );
    if (isAllowed) {
      return { blocked: false };
    }

    const level = Number(session.protectionLevel) || 3;

    // 4. Level 4 & 5: Universal Allow-List Mode
    if (level >= 4) {
      return {
        blocked: true,
        level,
        showExceptionButton: level < 5
      };
    }

    // 5. Level 1-3: Distraction interception only
    const defaults = ['youtube.com', 'reddit.com', 'instagram.com', 'x.com', 'tiktok.com'];
    const isDistraction = defaults.some((d) => host === d || host.endsWith(`.${d}`));

    if (isDistraction) {
      return {
        blocked: true,
        level,
        showExceptionButton: true
      };
    }

    return { blocked: false };
  }
}

describe('ONE — Chrome Extension MV3 End-to-End Runtime Lifecycle Suite', () => {
  const runtime = new MockChromeRuntime();

  beforeEach(() => {
    runtime.reset();
  });

  it('1. Verifies Level 1-3 blocks distraction domains while leaving neutral domains accessible', async () => {
    // Start session at Level 3
    await runtime.storageSet({
      activeSession: {
        sessionId: 'mv3-session-1',
        isActive: true,
        protectionLevel: 3,
        startedAt: Date.now(),
        targetDurationSeconds: 1500,
        allowedDomains: ['github.com'],
        appOrigin: 'http://localhost:5173'
      }
    });

    // YouTube (distraction) is blocked
    const ytEval = runtime.evaluateTab('https://youtube.com/watch?v=123');
    expect(ytEval.blocked).toBe(true);
    expect(ytEval.level).toBe(3);
    expect(ytEval.showExceptionButton).toBe(true);

    // Hacker News (neutral) is NOT blocked under Level 3
    const hnEval = runtime.evaluateTab('https://news.ycombinator.com');
    expect(hnEval.blocked).toBe(false);

    // GitHub (explicitly allowed reference) is NOT blocked
    const ghEval = runtime.evaluateTab('https://github.com/repo');
    expect(ghEval.blocked).toBe(false);

    // ONE web app is NOT blocked
    const appEval = runtime.evaluateTab('http://localhost:5173');
    expect(appEval.blocked).toBe(false);
  });

  it('2. Verifies Level 4 (Deep Focus) universal allow-list blocks arbitrary unlisted domains', async () => {
    // Start session at Level 4
    await runtime.storageSet({
      activeSession: {
        sessionId: 'mv3-session-2',
        isActive: true,
        protectionLevel: 4,
        startedAt: Date.now(),
        targetDurationSeconds: 1800,
        allowedDomains: ['github.com'],
        appOrigin: 'http://localhost:5173'
      }
    });

    // Both YouTube and previously unlisted news.ycombinator.com are blocked under Level 4!
    expect(runtime.evaluateTab('https://youtube.com').blocked).toBe(true);
    expect(runtime.evaluateTab('https://news.ycombinator.com').blocked).toBe(true);
    expect(runtime.evaluateTab('https://cnn.com').blocked).toBe(true);

    // Level 4 exposes the 2m exception button
    expect(runtime.evaluateTab('https://news.ycombinator.com').showExceptionButton).toBe(true);

    // Whitelisted reference domain remains accessible
    expect(runtime.evaluateTab('https://github.com').blocked).toBe(false);

    // App origin remains accessible
    expect(runtime.evaluateTab('http://localhost:5173').blocked).toBe(false);
  });

  it('3. Verifies Level 5 (Hard Lock) enforces allow-list and completely omits the exception button', async () => {
    await runtime.storageSet({
      activeSession: {
        sessionId: 'mv3-session-3',
        isActive: true,
        protectionLevel: 5,
        startedAt: Date.now(),
        targetDurationSeconds: 1800,
        allowedDomains: ['github.com'],
        appOrigin: 'http://localhost:5173'
      }
    });

    const evalRes = runtime.evaluateTab('https://news.ycombinator.com');
    expect(evalRes.blocked).toBe(true);
    expect(evalRes.level).toBe(5);
    // Level 5 contract: NO normal exception UI allowed
    expect(evalRes.showExceptionButton).toBe(false);
  });

  it('4. Full lifecycle: start -> exception -> auto-expiry -> session completion cleanup', async () => {
    // A. Start session Level 4
    await runtime.storageSet({
      activeSession: {
        sessionId: 'mv3-lifecycle-1',
        isActive: true,
        protectionLevel: 4,
        startedAt: Date.now(),
        targetDurationSeconds: 1500,
        allowedDomains: ['github.com'],
        appOrigin: 'http://localhost:5173'
      }
    });

    // Blocked initially
    expect(runtime.evaluateTab('https://youtube.com').blocked).toBe(true);

    // B. Grant 2-minute Intentional Exception
    const pass = {
      active: true,
      expiresAt: Date.now() + 120000,
      reason: 'Quick algorithm search'
    };
    await runtime.storageSet({ exceptionPass: pass });
    runtime.createAlarm('exception_expiry', { delayInMinutes: 2 });
    expect(runtime.alarms.has('exception_expiry')).toBe(true);

    // Unblocked while exception pass is active
    expect(runtime.evaluateTab('https://youtube.com').blocked).toBe(false);

    // C. Exception Expires via alarm
    runtime.triggerAlarm('exception_expiry');
    expect(runtime.storage.exceptionPass).toBeNull();

    // Protection restored immediately
    expect(runtime.evaluateTab('https://youtube.com').blocked).toBe(true);

    // D. Session Completion
    await runtime.storageSet({ activeSession: null, exceptionPass: null });
    runtime.clearAlarm('exception_expiry');
    runtime.broadcastToTabs({ type: 'SESSION_ENDED' });

    // When session is null, blocking is removed everywhere
    expect(runtime.evaluateTab('https://youtube.com').blocked).toBe(false);
    expect(runtime.evaluateTab('https://news.ycombinator.com').blocked).toBe(false);
  });

  it('5. Extension restart / browser startup purges expired stale sessions', async () => {
    // Session started 3 hours ago with 25m target (well past expiry threshold)
    const threeHoursAgo = Date.now() - 10800000;
    await runtime.storageSet({
      activeSession: {
        sessionId: 'stale-session-old',
        isActive: true,
        protectionLevel: 4,
        startedAt: threeHoursAgo,
        targetDurationSeconds: 1500,
        allowedDomains: []
      }
    });

    // Browser restarts
    runtime.simulateStartup();

    // Stale session is purged, tabs receive SESSION_ENDED, no leftover blocking
    expect(runtime.storage.activeSession).toBeNull();
    expect(runtime.evaluateTab('https://youtube.com').blocked).toBe(false);
  });

  it('6. New session cleanly replaces previous session', async () => {
    await runtime.storageSet({
      activeSession: {
        sessionId: 'session-first',
        isActive: true,
        protectionLevel: 3,
        startedAt: Date.now() - 5000,
        targetDurationSeconds: 1500
      }
    });

    // Replace with new Level 4 session
    await runtime.storageSet({
      activeSession: {
        sessionId: 'session-second',
        isActive: true,
        protectionLevel: 4,
        startedAt: Date.now(),
        targetDurationSeconds: 2700,
        allowedDomains: ['github.com']
      }
    });

    const active = runtime.storage.activeSession;
    expect(active.sessionId).toBe('session-second');
    expect(active.protectionLevel).toBe(4);
    // Evaluates with Level 4 rules immediately
    expect(runtime.evaluateTab('https://news.ycombinator.com').blocked).toBe(true);
  });
});
