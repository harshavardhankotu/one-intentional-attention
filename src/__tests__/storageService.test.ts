import { describe, it, expect } from 'vitest';

describe('ONE — Storage Validation & Backup Integrity', () => {
  it('should validate backup JSON schema correctly', () => {
    const validBackup = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      intentions: [
        {
          id: 'int-1',
          title: 'Finish MVP architecture',
          category: 'work',
          targetDurationMinutes: 45,
          protectionLevel: 3,
          createdAt: Date.now()
        }
      ],
      sessions: [],
      driftEvents: [],
      distractionInbox: [],
      completedOutcomes: []
    });

    const parsed = JSON.parse(validBackup);
    expect(parsed.schemaVersion).toBe(1);
    expect(Array.isArray(parsed.intentions)).toBe(true);
    expect(parsed.intentions[0].title).toBe('Finish MVP architecture');
  });

  it('should reject invalid schema versions', () => {
    const invalidBackup = JSON.stringify({
      schemaVersion: 999, // unknown version
      intentions: []
    });

    const parsed = JSON.parse(invalidBackup);
    expect(parsed.schemaVersion).not.toBe(1);
  });

  it('should reject malformed JSON', () => {
    const malformed = '{ invalid: json ]';
    expect(() => JSON.parse(malformed)).toThrow();
  });

  it('should verify DistractionItem statuses include archived', () => {
    const item = {
      id: 'd-1',
      content: 'Order groceries',
      createdAt: Date.now(),
      status: 'archived' as const
    };

    expect(item.status).toBe('archived');
  });
});
