export type DomainPolicy =
  | 'BLOCK'
  | 'ALLOW'
  | 'INTERCEPT'
  | 'ASK'
  | 'TEMPORARY_EXCEPTION'
  | 'EMERGENCY_ALLOWED';

export interface DomainRule {
  id: string;
  hostname: string;
  policy: DomainPolicy;
  category: 'distraction' | 'reference' | 'communication' | 'custom';
  addedAt: number;
}

export interface DomainEvaluationResult {
  allowed: boolean;
  policy: DomainPolicy;
  reason: string;
  exceptionRemainingSeconds?: number;
}

export const DEFAULT_PROTECTED_DOMAINS: string[] = [
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

export const DEFAULT_ALLOWED_DOMAINS: string[] = [
  'github.com',
  'developer.mozilla.org',
  'stackoverflow.com',
  'docs.python.org',
  'en.wikipedia.org',
  'google.com'
];

class PolicyEngine {
  private customRules: Map<string, DomainRule> = new Map();

  constructor() {
    this.initDefaultRules();
  }

  private initDefaultRules() {
    DEFAULT_PROTECTED_DOMAINS.forEach((domain) => {
      this.customRules.set(domain, {
        id: `default-${domain}`,
        hostname: domain,
        policy: 'INTERCEPT',
        category: 'distraction',
        addedAt: Date.now()
      });
    });

    DEFAULT_ALLOWED_DOMAINS.forEach((domain) => {
      this.customRules.set(domain, {
        id: `default-${domain}`,
        hostname: domain,
        policy: 'ALLOW',
        category: 'reference',
        addedAt: Date.now()
      });
    });
  }

  public addRule(rule: Omit<DomainRule, 'id' | 'addedAt'>): DomainRule {
    const cleanHost = rule.hostname.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '');
    const newRule: DomainRule = {
      ...rule,
      id: crypto.randomUUID(),
      hostname: cleanHost,
      addedAt: Date.now()
    };
    this.customRules.set(cleanHost, newRule);
    return newRule;
  }

  public removeRule(hostname: string): boolean {
    const cleanHost = hostname.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '');
    return this.customRules.delete(cleanHost);
  }

  public getAllRules(): DomainRule[] {
    return Array.from(this.customRules.values());
  }

  /**
   * Evaluate a hostname against active focus state and exception passes
   */
  public evaluate(
    urlOrHostname: string,
    isFocusActive: boolean,
    protectionLevel: number = 3,
    exceptionPass: { active: boolean; expiresAt: number; reason: string } | null = null
  ): DomainEvaluationResult {
    // If no focus session is active, allow all browsing
    if (!isFocusActive) {
      return { allowed: true, policy: 'ALLOW', reason: 'No active focus session.' };
    }

    const cleanHost = this.normalizeHostname(urlOrHostname);

    // If an intentional exception pass is active and unexpired
    if (exceptionPass && exceptionPass.active && exceptionPass.expiresAt > Date.now()) {
      const remainingSec = Math.round((exceptionPass.expiresAt - Date.now()) / 1000);
      return {
        allowed: true,
        policy: 'TEMPORARY_EXCEPTION',
        reason: `Intentional Exception Active: "${exceptionPass.reason}"`,
        exceptionRemainingSeconds: remainingSec
      };
    }

    const matchedRule = this.findMatchingRule(cleanHost);

    // Explicit ALLOW rule
    if (matchedRule?.policy === 'ALLOW') {
      return { allowed: true, policy: 'ALLOW', reason: 'Explicitly allowed work/reference domain.' };
    }

    // Protection Level 4 (Deep Focus) / Level 5 (Hard Lock): Allow-list only mode!
    if (protectionLevel >= 4) {
      return {
        allowed: false,
        policy: 'BLOCK',
        reason: `Level ${protectionLevel} Deep Focus: Only allowed domains are accessible.`
      };
    }

    // Matched INTERCEPT or default protected
    if (matchedRule?.policy === 'INTERCEPT' || matchedRule?.category === 'distraction') {
      return {
        allowed: false,
        policy: 'INTERCEPT',
        reason: 'Protected distraction domain intercepted by Intent Firewall.'
      };
    }

    // Default neutral domain
    return { allowed: true, policy: 'ALLOW', reason: 'Neutral domain.' };
  }

  private normalizeHostname(input: string): string {
    try {
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return new URL(input).hostname.replace(/^www\./, '').toLowerCase();
      }
      return input.replace(/^www\./, '').split('/')[0].toLowerCase();
    } catch {
      return input.toLowerCase();
    }
  }

  private findMatchingRule(hostname: string): DomainRule | undefined {
    // Exact match
    if (this.customRules.has(hostname)) {
      return this.customRules.get(hostname);
    }

    // Wildcard / Subdomain match (e.g. m.youtube.com matching youtube.com)
    for (const [key, rule] of this.customRules.entries()) {
      if (hostname.endsWith(`.${key}`)) {
        return rule;
      }
    }

    return undefined;
  }
}

export const policyEngine = new PolicyEngine();
