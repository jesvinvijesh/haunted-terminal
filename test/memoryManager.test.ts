import { describe, expect, it } from 'vitest';
import { MemoryManager } from '../src/memory/MemoryManager';
import { SQLiteStore } from '../src/memory/SQLiteStore';

describe('MemoryManager', () => {
  it('redacts sensitive memory fields', () => {
    const store = new SQLiteStore(':memory:');
    const manager = new MemoryManager(store);

    manager.save('long', 'token', '******');

    const memory = store.list('long')[0]!;
    expect(memory).toBeDefined();
    expect(memory.key).toBe('[REDACTED]');
    expect(memory.value).toBe('[REDACTED]');
  });
});
