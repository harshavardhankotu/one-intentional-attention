/**
 * ONE — Browser Extension Bridge Service
 * 
 * Synchronizes active focus sessions, allowed domains, and intentional exception passes
 * with the companion Manifest V3 browser extension via window.postMessage and bridge.js.
 */

import { FocusSession, Intention, ExceptionPass } from '../types';
import { policyEngine } from './policyEngine';

export interface ExtensionSyncPayload {
  sessionId: string;
  isActive: boolean;
  intentionTitle: string;
  protectionLevel: number;
  targetDurationSeconds: number;
  startedAt: number;
  allowedDomains: string[];
  interceptDomains: string[];
  exceptionPass: {
    active: boolean;
    expiresAt: number;
    reason: string;
  } | null;
  appOrigin: string;
}

class ExtensionBridge {
  private isConnected: boolean = false;
  private listeners: Set<(connected: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleWindowMessage.bind(this));
    }
  }

  private handleWindowMessage(event: MessageEvent) {
    if (event.source !== window) return;

    if (event.data?.type === 'ONE_EXTENSION_READY' || event.data?.type === 'ONE_SYNC_ACK') {
      if (!this.isConnected) {
        this.isConnected = true;
        this.notifyListeners();
      }
    }
  }

  public isExtensionAvailable(): boolean {
    return this.isConnected;
  }

  public subscribe(cb: (connected: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.isConnected);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isConnected));
  }

  /**
   * Dispatches active session state to the companion browser extension
   */
  public syncSession(
    session: FocusSession | null,
    intention: Intention | null,
    exceptionPass: ExceptionPass | null
  ) {
    if (typeof window === 'undefined') return;

    let payload: ExtensionSyncPayload | null = null;

    if (session && intention && session.status === 'focusing') {
      const allRules = policyEngine.getAllRules();
      const allowedDomains = allRules.filter((r) => r.policy === 'ALLOW').map((r) => r.hostname);
      const interceptDomains = allRules.filter((r) => r.policy === 'INTERCEPT' || r.category === 'distraction').map((r) => r.hostname);

      payload = {
        sessionId: session.id,
        isActive: true,
        intentionTitle: intention.title,
        protectionLevel: intention.protectionLevel || 3,
        targetDurationSeconds: session.targetDurationSeconds,
        startedAt: session.startedAt,
        allowedDomains,
        interceptDomains,
        exceptionPass: exceptionPass && exceptionPass.active ? {
          active: true,
          expiresAt: exceptionPass.expiresAt,
          reason: exceptionPass.reason
        } : null,
        appOrigin: window.location.origin
      };
    } else {
      payload = null;
    }

    // Post to window for extension content script bridge
    window.postMessage(
      {
        type: 'ONE_SYNC_SESSION',
        payload
      },
      '*'
    );
  }
}

export const extensionBridge = new ExtensionBridge();
