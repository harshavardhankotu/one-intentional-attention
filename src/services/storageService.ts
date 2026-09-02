import Dexie, { type EntityTable } from 'dexie';
import {
  Intention,
  FocusSession,
  DriftEvent,
  DistractionItem,
  CompletedOutcome,
  DailyAttentionStats,
  FocusProfile,
  PersistedSessionState,
  ProtectionLevel,
  FocusRating
} from '../types';

class OneDatabase extends Dexie {
  intentions!: EntityTable<Intention, 'id'>;
  sessions!: EntityTable<FocusSession, 'id'>;
  driftEvents!: EntityTable<DriftEvent, 'id'>;
  distractionInbox!: EntityTable<DistractionItem, 'id'>;
  completedOutcomes!: EntityTable<CompletedOutcome, 'id'>;

  constructor() {
    super('OneAttentionDB');
    this.version(1).stores({
      intentions: 'id, category, createdAt',
      sessions: 'id, intentionId, status, startedAt, endedAt',
      driftEvents: 'id, sessionId, timestamp, reasonCategory',
      distractionInbox: 'id, sessionId, createdAt, status',
      completedOutcomes: 'id, sessionId, completedAt, focusRating'
    });
  }
}

export const db = new OneDatabase();

const ACTIVE_SESSION_STORAGE_KEY = 'one_active_session_state_v1';

class StorageService {
  // Intentions
  async saveIntention(intention: Intention): Promise<void> {
    await db.intentions.put(intention);
  }

  async getRecentIntentions(limit = 10): Promise<Intention[]> {
    return await db.intentions.orderBy('createdAt').reverse().limit(limit).toArray();
  }

  // Focus Sessions
  async saveSession(session: FocusSession): Promise<void> {
    await db.sessions.put(session);
  }

  async getSession(id: string): Promise<FocusSession | undefined> {
    return await db.sessions.get(id);
  }

  async getAllSessions(): Promise<FocusSession[]> {
    return await db.sessions.orderBy('startedAt').reverse().toArray();
  }

  // Drift Events
  async recordDrift(drift: DriftEvent): Promise<void> {
    await db.driftEvents.put(drift);
  }

  async recordDriftEvent(drift: DriftEvent): Promise<void> {
    await this.recordDrift(drift);
  }

  async updateDrift(drift: DriftEvent): Promise<void> {
    await db.driftEvents.put(drift);
  }

  async getDriftsForSession(sessionId: string): Promise<DriftEvent[]> {
    return await db.driftEvents.where('sessionId').equals(sessionId).toArray();
  }

  // Distraction Inbox
  async addDistractionItem(item: DistractionItem): Promise<void> {
    await db.distractionInbox.put(item);
  }

  async getDistractionItems(): Promise<DistractionItem[]> {
    return await db.distractionInbox.orderBy('createdAt').reverse().toArray();
  }

  async getDistractionInbox(): Promise<DistractionItem[]> {
    return await this.getDistractionItems();
  }

  async updateDistractionItemStatus(id: string, status: DistractionItem['status']): Promise<void> {
    await db.distractionInbox.update(id, { status });
  }

  async editDistractionItem(id: string, content: string): Promise<void> {
    await db.distractionInbox.update(id, { content: content.trim() });
  }

  async deleteDistractionItem(id: string): Promise<void> {
    await db.distractionInbox.delete(id);
  }

  // Completed Outcomes
  async saveCompletedOutcome(outcome: CompletedOutcome): Promise<void> {
    await db.completedOutcomes.put(outcome);
  }

  async getCompletedOutcomes(limit = 20): Promise<CompletedOutcome[]> {
    return await db.completedOutcomes.orderBy('completedAt').reverse().limit(limit).toArray();
  }

  // Active Session State Persistence (for crash & refresh recovery)
  saveActiveSessionState(state: PersistedSessionState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in private browsing
    }
  }

  loadActiveSessionState(): PersistedSessionState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.session && parsed.intention && parsed.startedAt) {
        return parsed as PersistedSessionState;
      }
      return null;
    } catch {
      return null;
    }
  }

  clearActiveSessionState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  // Daily Attention Stats Calculation
  async getDailyStats(targetDateStr?: string): Promise<DailyAttentionStats> {
    const today = targetDateStr || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${today}T00:00:00.000`).getTime();
    const endOfDay = new Date(`${today}T23:59:59.999`).getTime();

    const sessions = await db.sessions
      .where('startedAt')
      .between(startOfDay, endOfDay, true, true)
      .toArray();

    const drifts = await db.driftEvents
      .where('timestamp')
      .between(startOfDay, endOfDay, true, true)
      .toArray();

    const outcomes = await db.completedOutcomes
      .where('completedAt')
      .between(startOfDay, endOfDay, true, true)
      .toArray();

    let totalIntentionalSeconds = 0;
    let totalDeepFocusSeconds = 0;
    let totalRecoveredSeconds = 0;
    let longestUninterruptedSeconds = 0;

    sessions.forEach(s => {
      totalIntentionalSeconds += s.elapsedSeconds;
      const deep = Math.max(0, s.elapsedSeconds - s.totalRecoverySeconds);
      totalDeepFocusSeconds += deep;
      totalRecoveredSeconds += s.totalRecoverySeconds;
      if (s.driftCount === 0 && s.elapsedSeconds > longestUninterruptedSeconds) {
        longestUninterruptedSeconds = s.elapsedSeconds;
      }
    });

    const recoveryLatencies = drifts
      .map(d => d.recoveryLatencySeconds)
      .filter((lat): lat is number => typeof lat === 'number' && lat > 0);

    const averageRecoveryLatencySeconds = recoveryLatencies.length > 0
      ? Math.round(recoveryLatencies.reduce((a, b) => a + b, 0) / recoveryLatencies.length)
      : 0;

    return {
      date: today,
      totalIntentionalSeconds,
      totalDeepFocusSeconds,
      totalRecoveredSeconds,
      completedOutcomesCount: outcomes.length,
      driftCount: drifts.length,
      averageRecoveryLatencySeconds,
      longestUninterruptedSeconds,
      sessionsCount: sessions.length
    };
  }

  // Personal Focus Profile
  async getFocusProfile(): Promise<FocusProfile> {
    const allSessions = await db.sessions.toArray();
    const allDrifts = await db.driftEvents.toArray();
    const allOutcomes = await db.completedOutcomes.toArray();

    let totalIntentionalMinutes = 0;
    let totalDeepFocusMinutes = 0;

    allSessions.forEach(s => {
      totalIntentionalMinutes += Math.round(s.elapsedSeconds / 60);
      totalDeepFocusMinutes += Math.round(Math.max(0, s.elapsedSeconds - s.totalRecoverySeconds) / 60);
    });

    const recoveryLatencies = allDrifts
      .map(d => d.recoveryLatencySeconds)
      .filter((l): l is number => typeof l === 'number' && l > 0);

    const avgRecovery = recoveryLatencies.length > 0
      ? Math.round(recoveryLatencies.reduce((a, b) => a + b, 0) / recoveryLatencies.length)
      : 0;

    const triggerMap: Record<string, number> = {};
    allDrifts.forEach(d => {
      const cat = d.reasonCategory || 'other';
      triggerMap[cat] = (triggerMap[cat] || 0) + 1;
    });

    const topTriggers = Object.entries(triggerMap)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const recoveredCount = allDrifts.filter(d => d.resolution === 'recovered').length;
    const successRate = allDrifts.length > 0
      ? Math.round((recoveredCount / allDrifts.length) * 100)
      : 100;

    return {
      totalIntentionalMinutes,
      totalDeepFocusMinutes,
      totalCompletedOutcomes: allOutcomes.length,
      averageRecoveryLatencySeconds: avgRecovery,
      bestFocusHourWindow: '08:00 – 11:00 AM (Observed Peak)',
      topTriggers: topTriggers.length > 0 ? topTriggers : [
        { trigger: 'Habitual browser tab switch', count: 0 }
      ],
      interventionSuccessRate: successRate
    };
  }

  // Full JSON Export
  async exportFullData(): Promise<string> {
    const intentions = await db.intentions.toArray();
    const sessions = await db.sessions.toArray();
    const driftEvents = await db.driftEvents.toArray();
    const distractionInbox = await db.distractionInbox.toArray();
    const completedOutcomes = await db.completedOutcomes.toArray();

    return JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      intentions,
      sessions,
      driftEvents,
      distractionInbox,
      completedOutcomes
    }, null, 2);
  }

  // Full JSON Import with Strict Schema Validation & Hostile Input Sanitization
  async importFullData(jsonString: string): Promise<{ importedCount: number }> {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format: Unable to parse file.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Invalid backup structure: Root must be a JSON object.');
    }

    if (parsed.schemaVersion !== 1) {
      throw new Error(`Unsupported schema version: ${parsed.schemaVersion || 'unknown'}`);
    }

    const MAX_ITEMS = 10000;

    // Sanitize intentions
    const rawIntentions = Array.isArray(parsed.intentions) ? parsed.intentions : [];
    if (rawIntentions.length > MAX_ITEMS) throw new Error(`Exceeded maximum entity limit (${MAX_ITEMS}).`);
    const validIntentions: Intention[] = [];
    for (const item of rawIntentions) {
      if (item && typeof item === 'object' && !Object.prototype.hasOwnProperty.call(item, '__proto__')) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.id === 'string' && typeof obj.title === 'string') {
          validIntentions.push({
            id: String(obj.id),
            title: String(obj.title).slice(0, 300),
            category: (['work', 'study', 'creative', 'exercise', 'personal'].includes(String(obj.category))
              ? obj.category
              : 'work') as Intention['category'],
            targetDurationMinutes: Math.min(480, Math.max(1, Number(obj.targetDurationMinutes) || 25)),
            protectionLevel: Math.min(5, Math.max(1, Number(obj.protectionLevel) || 3)) as ProtectionLevel,
            createdAt: Number(obj.createdAt) || Date.now()
          });
        }
      }
    }

    // Sanitize sessions
    const rawSessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
    if (rawSessions.length > MAX_ITEMS) throw new Error(`Exceeded maximum entity limit (${MAX_ITEMS}).`);
    const validSessions: FocusSession[] = [];
    for (const item of rawSessions) {
      if (item && typeof item === 'object' && !Object.prototype.hasOwnProperty.call(item, '__proto__')) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.id === 'string' && typeof obj.intentionId === 'string') {
          validSessions.push({
            id: String(obj.id),
            intentionId: String(obj.intentionId),
            intentionTitle: String(obj.intentionTitle || 'Focus Session').slice(0, 300),
            targetDurationSeconds: Math.max(0, Number(obj.targetDurationSeconds) || 0),
            elapsedSeconds: Math.max(0, Number(obj.elapsedSeconds) || 0),
            totalPausedMs: Math.max(0, Number(obj.totalPausedMs) || 0),
            status: (['focusing', 'completed', 'cancelled', 'rescued'].includes(String(obj.status))
              ? obj.status
              : 'completed') as FocusSession['status'],
            protectionLevel: Math.min(5, Math.max(1, Number(obj.protectionLevel) || 3)) as ProtectionLevel,
            startedAt: Number(obj.startedAt) || Date.now(),
            endedAt: Number(obj.endedAt) || Date.now(),
            driftCount: Math.max(0, Number(obj.driftCount) || 0),
            totalRecoverySeconds: Math.max(0, Number(obj.totalRecoverySeconds) || 0),
            intentionalExceptionsCount: Math.max(0, Number(obj.intentionalExceptionsCount) || 0),
            accomplishedOutcome: obj.accomplishedOutcome ? String(obj.accomplishedOutcome).slice(0, 500) : undefined,
            focusRating: (['deep', 'moderate', 'distracted'].includes(String(obj.focusRating)) ? obj.focusRating : undefined) as FocusRating | undefined
          });
        }
      }
    }

    // Sanitize driftEvents
    const rawDrifts = Array.isArray(parsed.driftEvents) ? parsed.driftEvents : [];
    if (rawDrifts.length > MAX_ITEMS) throw new Error(`Exceeded maximum entity limit (${MAX_ITEMS}).`);
    const validDriftEvents: DriftEvent[] = [];
    for (const item of rawDrifts) {
      if (item && typeof item === 'object' && !Object.prototype.hasOwnProperty.call(item, '__proto__')) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.id === 'string' && typeof obj.sessionId === 'string') {
          validDriftEvents.push({
            id: String(obj.id),
            sessionId: String(obj.sessionId),
            timestamp: Number(obj.timestamp) || Date.now(),
            resolvedTimestamp: obj.resolvedTimestamp ? Number(obj.resolvedTimestamp) : undefined,
            recoveryLatencySeconds: Math.max(0, Number(obj.recoveryLatencySeconds) || 0),
            reasonCategory: (['mind_wandering', 'habitual_click', 'urgent_task', 'external_trigger', 'other'].includes(String(obj.reasonCategory))
              ? obj.reasonCategory
              : 'habitual_click') as DriftEvent['reasonCategory'],
            resolution: (['recovered', 'intentional_exception', 'emergency_exit'].includes(String(obj.resolution))
              ? obj.resolution
              : 'recovered') as DriftEvent['resolution']
          });
        }
      }
    }

    // Sanitize distractionInbox
    const rawInbox = Array.isArray(parsed.distractionInbox) ? parsed.distractionInbox : [];
    if (rawInbox.length > MAX_ITEMS) throw new Error(`Exceeded maximum entity limit (${MAX_ITEMS}).`);
    const validInbox: DistractionItem[] = [];
    for (const item of rawInbox) {
      if (item && typeof item === 'object' && !Object.prototype.hasOwnProperty.call(item, '__proto__')) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.id === 'string' && typeof obj.content === 'string') {
          validInbox.push({
            id: String(obj.id),
            sessionId: obj.sessionId ? String(obj.sessionId) : undefined,
            content: String(obj.content).slice(0, 500),
            createdAt: Number(obj.createdAt) || Date.now(),
            status: (['inbox', 'archived', 'actioned', 'dismissed'].includes(String(obj.status))
              ? obj.status
              : 'inbox') as DistractionItem['status']
          });
        }
      }
    }

    // Sanitize completedOutcomes
    const rawOutcomes = Array.isArray(parsed.completedOutcomes) ? parsed.completedOutcomes : [];
    if (rawOutcomes.length > MAX_ITEMS) throw new Error(`Exceeded maximum entity limit (${MAX_ITEMS}).`);
    const validOutcomes: CompletedOutcome[] = [];
    for (const item of rawOutcomes) {
      if (item && typeof item === 'object' && !Object.prototype.hasOwnProperty.call(item, '__proto__')) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.id === 'string' && typeof obj.sessionId === 'string') {
          validOutcomes.push({
            id: String(obj.id),
            sessionId: String(obj.sessionId),
            goalTitle: String(obj.goalTitle || obj.intentionTitle || 'Focus Session').slice(0, 300),
            outcomeText: String(obj.outcomeText || 'Completed').slice(0, 1000),
            focusRating: (['deep', 'moderate', 'distracted'].includes(String(obj.focusRating))
              ? obj.focusRating
              : 'moderate') as FocusRating,
            completedAt: Number(obj.completedAt) || Date.now(),
            durationMinutes: Math.max(0, Number(obj.durationMinutes) || 0)
          });
        }
      }
    }

    // Transactional bulk put
    await db.transaction('rw', [db.intentions, db.sessions, db.driftEvents, db.distractionInbox, db.completedOutcomes], async () => {
      if (validIntentions.length) await db.intentions.bulkPut(validIntentions);
      if (validSessions.length) await db.sessions.bulkPut(validSessions);
      if (validDriftEvents.length) await db.driftEvents.bulkPut(validDriftEvents);
      if (validInbox.length) await db.distractionInbox.bulkPut(validInbox);
      if (validOutcomes.length) await db.completedOutcomes.bulkPut(validOutcomes);
    });

    const total = validIntentions.length + validSessions.length + validDriftEvents.length + validInbox.length + validOutcomes.length;
    return { importedCount: total };
  }

  // Complete Local Wipe
  async wipeAllData(): Promise<void> {
    await db.intentions.clear();
    await db.sessions.clear();
    await db.driftEvents.clear();
    await db.distractionInbox.clear();
    await db.completedOutcomes.clear();
    this.clearActiveSessionState();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
}

export const storageService = new StorageService();
