import Dexie, { type EntityTable } from 'dexie';
import {
  Intention,
  FocusSession,
  DriftEvent,
  DistractionItem,
  CompletedOutcome,
  DailyAttentionStats,
  FocusProfile
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

  async updateDistractionItemStatus(id: string, status: 'inbox' | 'actioned' | 'dismissed'): Promise<void> {
    await db.distractionInbox.update(id, { status });
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
      // Deep focus = elapsed minus recovery time spent distracted
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
      : 35; // baseline

    // Trigger categories tally
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
      bestFocusHourWindow: '08:00 – 11:00 AM',
      topTriggers: topTriggers.length > 0 ? topTriggers : [
        { trigger: 'Habitual browser tab switch', count: 1 },
        { trigger: 'Mental fatigue / friction', count: 1 }
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

  // Complete Local Wipe
  async wipeAllData(): Promise<void> {
    await db.intentions.clear();
    await db.sessions.clear();
    await db.driftEvents.clear();
    await db.distractionInbox.clear();
    await db.completedOutcomes.clear();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
}

export const storageService = new StorageService();
