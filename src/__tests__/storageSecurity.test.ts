import { describe, it, expect } from 'vitest';
import { storageService } from '../services/storageService';

describe('ONE — Import Pipeline Security & Anti-Corruption Audit', () => {
  it('should reject malformed non-JSON strings', async () => {
    await expect(storageService.importFullData('{ bad json :')).rejects.toThrow('Invalid JSON format');
  });

  it('should reject arrays as root payload', async () => {
    await expect(storageService.importFullData('[]')).rejects.toThrow('Root must be a JSON object');
  });

  it('should reject unsupported schema versions', async () => {
    const payload = JSON.stringify({ schemaVersion: 2 });
    await expect(storageService.importFullData(payload)).rejects.toThrow('Unsupported schema version: 2');
  });

  it('should reject missing schema version', async () => {
    const payload = JSON.stringify({ intentions: [] });
    await expect(storageService.importFullData(payload)).rejects.toThrow('Unsupported schema version');
  });

  it('should reject array payloads exceeding 10,000 entities to prevent memory exhaustion', async () => {
    const hugeArray = new Array(10001).fill({ id: '1', title: 'test' });
    const payload = JSON.stringify({
      schemaVersion: 1,
      intentions: hugeArray
    });

    await expect(storageService.importFullData(payload)).rejects.toThrow('Exceeded maximum entity limit');
  });

  it('should safely import clean valid backup without throwing', async () => {
    const validPayload = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      intentions: [
        {
          id: 'int-sec-1',
          title: 'Harden security pipeline',
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

    const result = await storageService.importFullData(validPayload);
    expect(result.importedCount).toBe(1);
  });
});
