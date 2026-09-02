import 'fake-indexeddb/auto';

// In-memory mock for localStorage in Node test environment
class LocalStorageMock {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

const mockStorage = new LocalStorageMock();

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: {
      origin: 'http://localhost:5173',
      href: 'http://localhost:5173/'
    },
    localStorage: mockStorage,
    postMessage: (_message: any, _targetOrigin: string) => {
      // Simulate postMessage event loop in test
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockStorage;
}
