import { describe, it, expect } from 'vitest';

// Extracted decision logic matching extension/content.js exactly
interface EvaluationResult {
  blocked: boolean;
  reason?: 'allow_list_deep_focus' | 'distraction_intercept';
  allowedReason?: 'no_active_session' | 'app_origin' | 'active_exception' | 'whitelisted_reference' | 'neutral_domain';
}

function evaluateDomain(
  host: string,
  session: any,
  exceptionPass: any,
  windowOrigin: string
): EvaluationResult {
  const currentHost = host.replace(/^www\./, '').toLowerCase();

  // Invariant 1: No active session -> No blocking
  if (!session || !session.isActive) {
    return { blocked: false, allowedReason: 'no_active_session' };
  }

  // Invariant 2: App origin and local development are always exempt
  const appOrigin = session.appOrigin || '';
  if (
    windowOrigin === appOrigin ||
    currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    currentHost.endsWith('.github.io')
  ) {
    return { blocked: false, allowedReason: 'app_origin' };
  }

  // Invariant 3: Active unexpired exception pass allows browsing
  if (exceptionPass && exceptionPass.active && exceptionPass.expiresAt > Date.now()) {
    return { blocked: false, allowedReason: 'active_exception' };
  }

  // Invariant 4: Configured allowed reference domains are allowed
  const allowed = (session.allowedDomains || []).some(
    (d: string) => currentHost === d || currentHost.endsWith(`.${d}`)
  );
  if (allowed) {
    return { blocked: false, allowedReason: 'whitelisted_reference' };
  }

  const level = Number(session.protectionLevel) || 3;

  // Invariant 5: Level 4 & 5 enforce strict allow-list mode across arbitrary domains
  if (level >= 4) {
    return { blocked: true, reason: 'allow_list_deep_focus' };
  }

  // Invariant 6: Level 1-3 only block recognized distraction domains
  const defaults = [
    'instagram.com',
    'youtube.com',
    'reddit.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'facebook.com',
    'netflix.com',
    'twitch.tv'
  ];
  const targetList = Array.isArray(session.interceptDomains) && session.interceptDomains.length > 0
    ? session.interceptDomains
    : defaults;

  const isDistraction = targetList.some(
    (d: string) => currentHost === d || currentHost.endsWith(`.${d}`)
  );

  if (isDistraction) {
    return { blocked: true, reason: 'distraction_intercept' };
  }

  // Invariant 7: Neutral domain under level 1-3 is allowed
  return { blocked: false, allowedReason: 'neutral_domain' };
}

describe('ONE — Extension Level 1-5 Enforcement & Policy Invariants', () => {
  const baseSession = {
    sessionId: 'session-live-1',
    isActive: true,
    protectionLevel: 3,
    appOrigin: 'http://localhost:5173',
    allowedDomains: ['github.com', 'docs.python.org'],
    interceptDomains: ['youtube.com', 'reddit.com']
  };

  it('allows all browsing when no active focus session exists', () => {
    const result = evaluateDomain('youtube.com', null, null, 'https://youtube.com');
    expect(result.blocked).toBe(false);
    expect(result.allowedReason).toBe('no_active_session');

    const resultInactive = evaluateDomain('news.ycombinator.com', { isActive: false }, null, 'https://news.ycombinator.com');
    expect(resultInactive.blocked).toBe(false);
    expect(resultInactive.allowedReason).toBe('no_active_session');
  });

  it('never blocks the ONE web application origin under any protection level', () => {
    for (let level = 1; level <= 5; level++) {
      const session = { ...baseSession, protectionLevel: level };
      const result = evaluateDomain('localhost', session, null, 'http://localhost:5173');
      expect(result.blocked).toBe(false);
      expect(result.allowedReason).toBe('app_origin');
    }
  });

  it('allows neutral domains under Level 3 but blocks configured distraction domains', () => {
    const level3Session = { ...baseSession, protectionLevel: 3 };

    // Neutral domain not on distraction list
    const ycombinator = evaluateDomain('news.ycombinator.com', level3Session, null, 'https://news.ycombinator.com');
    expect(ycombinator.blocked).toBe(false);
    expect(ycombinator.allowedReason).toBe('neutral_domain');

    const cnn = evaluateDomain('cnn.com', level3Session, null, 'https://cnn.com');
    expect(cnn.blocked).toBe(false);
    expect(cnn.allowedReason).toBe('neutral_domain');

    // Distraction domain
    const youtube = evaluateDomain('youtube.com', level3Session, null, 'https://youtube.com');
    expect(youtube.blocked).toBe(true);
    expect(youtube.reason).toBe('distraction_intercept');

    const subReddit = evaluateDomain('old.reddit.com', level3Session, null, 'https://old.reddit.com');
    expect(subReddit.blocked).toBe(true);
    expect(subReddit.reason).toBe('distraction_intercept');
  });

  it('enforces strict allow-list mode under Level 4 (Deep Focus), blocking arbitrary non-whitelisted domains', () => {
    const level4Session = { ...baseSession, protectionLevel: 4 };

    // Arbitrary domains NOT on distraction list are blocked under Level 4
    const ycombinator = evaluateDomain('news.ycombinator.com', level4Session, null, 'https://news.ycombinator.com');
    expect(ycombinator.blocked).toBe(true);
    expect(ycombinator.reason).toBe('allow_list_deep_focus');

    const cnn = evaluateDomain('cnn.com', level4Session, null, 'https://cnn.com');
    expect(cnn.blocked).toBe(true);
    expect(cnn.reason).toBe('allow_list_deep_focus');

    // Configured allowed reference domains remain accessible
    const github = evaluateDomain('github.com', level4Session, null, 'https://github.com');
    expect(github.blocked).toBe(false);
    expect(github.allowedReason).toBe('whitelisted_reference');

    const pythonDocs = evaluateDomain('docs.python.org', level4Session, null, 'https://docs.python.org');
    expect(pythonDocs.blocked).toBe(false);
    expect(pythonDocs.allowedReason).toBe('whitelisted_reference');
  });

  it('enforces strict allow-list mode under Level 5 (Hard Lock)', () => {
    const level5Session = { ...baseSession, protectionLevel: 5 };

    const randomDomain = evaluateDomain('medium.com', level5Session, null, 'https://medium.com');
    expect(randomDomain.blocked).toBe(true);
    expect(randomDomain.reason).toBe('allow_list_deep_focus');

    // Whitelisted reference domain remains accessible
    const github = evaluateDomain('github.com', level5Session, null, 'https://github.com');
    expect(github.blocked).toBe(false);
    expect(github.allowedReason).toBe('whitelisted_reference');
  });

  it('temporarily unblocks domains when an active unexpired Exception Pass is present', () => {
    const level4Session = { ...baseSession, protectionLevel: 4 };
    const validPass = {
      active: true,
      expiresAt: Date.now() + 120000,
      reason: 'Check API documentation reference'
    };

    const result = evaluateDomain('cnn.com', level4Session, validPass, 'https://cnn.com');
    expect(result.blocked).toBe(false);
    expect(result.allowedReason).toBe('active_exception');
  });

  it('restores blocking immediately once an Exception Pass expires', () => {
    const level4Session = { ...baseSession, protectionLevel: 4 };
    const expiredPass = {
      active: true,
      expiresAt: Date.now() - 5000, // Expired 5 seconds ago
      reason: 'Past pass'
    };

    const result = evaluateDomain('cnn.com', level4Session, expiredPass, 'https://cnn.com');
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('allow_list_deep_focus');
  });

  it('removes all blocking when session completion signal is received', () => {
    const completedSession = { ...baseSession, isActive: false };
    const result = evaluateDomain('youtube.com', completedSession, null, 'https://youtube.com');
    expect(result.blocked).toBe(false);
    expect(result.allowedReason).toBe('no_active_session');
  });
});
