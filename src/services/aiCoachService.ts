/**
 * ONE — AI Focus Coach Service & Abstraction Layer
 * 
 * Architectural Tenets:
 * 1. ZERO REQUIRED EXTERNAL AI: Core focus engine never blocks on AI.
 * 2. 100% OFFLINE HEURISTIC DEFAULT: Provides instant, privacy-preserving recommendations without internet.
 * 3. PLUGGABLE ADAPTERS: Ready for Chrome Built-in Prompt API (Gemini Nano) or WebLLM WASM.
 */

import { DailyAttentionStats, FocusProfile } from '../types';

export interface IFocusCoach {
  sharpenGoal(rawGoal: string): Promise<string>;
  normalizeOutcome(rawOutcome: string, goalTitle: string): Promise<string>;
  generateObservations(stats: DailyAttentionStats, profile: FocusProfile): Promise<string[]>;
}

class LocalHeuristicCoach implements IFocusCoach {
  /**
   * Transforms vague goals into concrete, actionable implementation intentions
   */
  async sharpenGoal(rawGoal: string): Promise<string> {
    const trimmed = rawGoal.trim();
    if (!trimmed) return 'One specific deliverable';

    const lower = trimmed.toLowerCase();

    // Heuristic patterns for common vague goals
    if (lower === 'study dsa' || lower === 'dsa') {
      return 'Solve 2 Binary Tree BFS & DFS problems on LeetCode';
    }
    if (lower === 'build startup' || lower === 'startup' || lower === 'build my startup') {
      return 'Implement MVP onboarding state machine & persistence';
    }
    if (lower === 'write article' || lower === 'write' || lower === 'blog') {
      return 'Draft 800-word outline and introduction section';
    }
    if (lower === 'exercise' || lower === 'workout') {
      return 'Complete 30-minute core workout & stretching';
    }
    if (lower === 'read' || lower === 'read a book') {
      return 'Read Chapter 4 and highlight key architectural patterns';
    }

    // If goal starts with vague verbs like "work on", sharpen to actionable verb
    if (lower.startsWith('work on ')) {
      return `Complete milestone: ${trimmed.slice(8)}`;
    }
    if (lower.startsWith('study ')) {
      return `Master core concept: ${trimmed.slice(6)}`;
    }

    return trimmed;
  }

  /**
   * Normalizes raw user outcome notes into a structured deliverable summary
   */
  async normalizeOutcome(rawOutcome: string, goalTitle: string): Promise<string> {
    const trimmed = rawOutcome.trim();
    if (!trimmed) return `Completed focus block for "${goalTitle}"`;

    // Capitalize first character
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return capitalized;
  }

  /**
   * Generates compassionate, strictly non-judgmental behavioral observations
   */
  async generateObservations(stats: DailyAttentionStats, profile: FocusProfile): Promise<string[]> {
    const observations: string[] = [];

    // Recovery speed observation
    if (stats.averageRecoveryLatencySeconds > 0) {
      if (stats.averageRecoveryLatencySeconds <= 60) {
        observations.push(
          `Your average recovery was ${stats.averageRecoveryLatencySeconds}s. You returned to focus within 1 minute of drift impulses.`
        );
      } else {
        observations.push(
          `Average recovery was ${stats.averageRecoveryLatencySeconds}s. Each return protects your intentional momentum.`
        );
      }
    } else {
      observations.push('Uninterrupted session completed without recorded drift.');
    }

    // Time window observation
    if (profile.bestFocusHourWindow) {
      observations.push(
        `Observed peak: ${profile.bestFocusHourWindow}. Your session data suggests mornings may have the lowest cognitive friction.`
      );
    }

    // Success rate observation
    if (profile.interventionSuccessRate >= 80) {
      observations.push(
        `Intervention resilience: ${profile.interventionSuccessRate}% of drift checks successfully resumed focus.`
      );
    }

    return observations;
  }
}

export const aiCoachService: IFocusCoach = new LocalHeuristicCoach();
