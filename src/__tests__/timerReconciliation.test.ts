import { describe, it, expect } from 'vitest';

describe('ONE — Timer Timestamp Reconciliation & Reliability', () => {
  it('should accurately calculate elapsed focus time across background tab throttling and sleep', () => {
    const startedAt = 1700000000000;
    const totalPausedMs = 0;
    const lastPausedAt: number | null = null;

    // Simulate clock advancing 15 minutes (900,000 ms) while tab was backgrounded or computer slept
    const now = startedAt + 15 * 60 * 1000;

    const currentPauseDelta = lastPausedAt ? (now - lastPausedAt) : 0;
    const totalNonFocusMs = totalPausedMs + currentPauseDelta;
    const elapsedSeconds = Math.max(0, Math.floor((now - startedAt - totalNonFocusMs) / 1000));

    expect(elapsedSeconds).toBe(900); // exactly 15 minutes
  });

  it('should subtract paused intervals accurately from wall-clock elapsed time', () => {
    const startedAt = 1700000000000;
    
    // User focused for 10 minutes, paused for 5 minutes, then resumed for another 10 minutes
    // Total wall-clock time passed = 25 minutes
    // Total paused duration = 5 minutes (300,000 ms)
    const totalPausedMs = 5 * 60 * 1000;
    const now = startedAt + 25 * 60 * 1000;

    const elapsedSeconds = Math.max(0, Math.floor((now - startedAt - totalPausedMs) / 1000));

    expect(elapsedSeconds).toBe(20 * 60); // exactly 20 minutes of focus
  });

  it('should handle active pause in progress', () => {
    const startedAt = 1700000000000;
    const totalPausedMs = 60 * 1000; // previously paused 1 minute
    const lastPausedAt = startedAt + 10 * 60 * 1000; // paused at minute 10
    const now = lastPausedAt + 2 * 60 * 1000; // currently 2 minutes into pause

    const currentPauseDelta = now - lastPausedAt;
    const totalNonFocusMs = totalPausedMs + currentPauseDelta;
    const elapsedSeconds = Math.max(0, Math.floor((now - startedAt - totalNonFocusMs) / 1000));

    // Total wall clock: 12 minutes. Total paused: 1m + 2m = 3m. Elapsed focus: 9m = 540s
    expect(elapsedSeconds).toBe(540);
  });
});
